import TweenMax from 'gsap';

import Ext from '../../lib/vendor/ExtCore';
import CONST from '../../lib/constant/Constants';
import Chaos from '../../lib/chaos/Chaos';
import Config from '../../lib/chaos/Config';
import ChaosObject from '../../lib/chaos/Object';
import { Broadcaster } from '../../lib/chaos/Broadcaster';
import GlobalProgressIndicator from '../ProgressIndicator/GlobalProgressIndicator';

export default function MediaManagerView(el, config) {
	MediaManagerView.superclass.constructor.call(this, el, config);
}

Ext.apply(MediaManagerView, {
	EVENT_INPUT_VALUE_CHANGE             : 'input-value-change',
	EVENT_INPUT_ENTER_PRESSED            : 'input-enter-pressed',
	EVENT_MEDIA_REMOVE_DONE              : 'media-remove-done',
	EVENT_MEDIA_ROTATE                   : 'media-rotate',
	EVENT_MEDIA_DELETE_CONFIRMED         : 'media-delete-confirmed',
	EVENT_MEDIA_DELETE_OVERLAY_CONFIRMED : 'media-delete-overlay-confirmed'
});

Chaos.extend(MediaManagerView, ChaosObject, {

	/** @var {String} mediaItemCls           Class name of a media item */
	mediaItemCls            : 'mediaBox',
	/** @var {String} mediaDeleteButtonCls   Class name of delete button */
	mediaDeleteButtonCls    : 'js-delete',
	/** @var {String} confirmDeleteCls        Class name of delete confirm overlay items */
	confirmDeleteCls        : 'media-ask-delete',
	/** @var {String} mediaDeleteConfirmCls  Class name of delete confirm button */
	mediaDeleteConfirmCls   : 'delete_confirm',
	/** @var {String} mediaDeleteCancelCls   Class name of cancel button */
	mediaDeleteCancelCls    : 'js-delete-cancel',
	/** @var {String} mediaInputCls          Class name of title input */
	mediaInputCls           : 'title_input',
	/** @var {String} editMediaTitleButton   Class name of title input */
	editMediaTitleButton    : 'js-edit',
	/** @var {String} mediaRotateButtonCls   Class name of a rotate button */
	mediaRotateButtonCls    : 'js-rotate',
	/** @var {String} mediaOpenButtonCls     Class name of the open button */
	mediaOpenButtonCls 	    : 'js-open',
	/** @var {String}                        Rotating class for image under rotation */
	rotatingCls             : 'rotating',
	/** @var {String}                        Hide cls */
	hideCls                 : 'ph-hide',
	/** @var {Number}                        Rotation degree */
	rotationDegree          : 90,
	/** @var {Number}                        image Rotation Delay. */
	imageRotationDelay      : 1000,
	/** @var {Array}                         rotation items on AJAX. */
	_rotationItems          : [],
	/** @var {Array}                         rotation items without AJAX. */
	_rotationParams         : [],
	/** @var {Array} _editedImages           rotated images array */
	_editedImages           : [],
	/** @var {String} _lastInputValue        The last value of the title input */
	_lastInputValue         : '',
	/** @var {String} mediaBox               Box of rotated image */
	mediaBox                : undefined,
	/** @var {String} folderNameCls          Class name of folder title */
	folderNameCls           : 'folderName',
	/** @var {String} lastClickedId          ID of last clicked media item */
	lastClickedId           : undefined,
	/** @var {Number} rotationCssValue       Rotation value of image for css rotation */
	rotationCssValue        : 0,
	/** @var {Bool} _sentAjaxRequest         True if we sent the ajax request */
	_sentAjaxRequest        : false,
	/** @var {Bool} _sentDelayedAjaxRequest  True if we sent delayed ajax request */
	_sentDelayedAjaxRequest : false,
	/** @var {Object} mediaType              Object of media types */
	mediaType               : {
		photo  : 'photo',
		video  : 'video',
		note   : 'note',
		folder : 'folder'
	},

	/**
	 * Initialize
	 *
	 * @param {Element} el      Context element
	 * @param {Object} config   Config object of this controller
	 */
	init : function(el, config) {
		MediaManagerView.superclass.init.call(this, el, config);
		this.addEvents(
			MediaManagerView.EVENT_INPUT_ENTER_PRESSED,
			MediaManagerView.EVENT_MEDIA_REMOVE_DONE,
			MediaManagerView.EVENT_MEDIA_ROTATE,
			MediaManagerView.EVENT_INPUT_VALUE_CHANGE,
			MediaManagerView.EVENT_MEDIA_DELETE_CONFIRMED,
			MediaManagerView.EVENT_MEDIA_DELETE_OVERLAY_CONFIRMED
		);
		// Make browsers support focusin/out bubbling!
		this._polyfillFocusBubbling();
		this._channelType = Config.get('channelType');
	},

	/**
	 * Pure magic! Implements focusin/focusout event as bubbling in unsupported browsers
	 *
	 */
	_polyfillFocusBubbling : function() {
		var w = window,
			d = w.document;

		var addPolyfill = function addPolyfill(e) {
			var type = e.type === 'focus' ? 'focusin' : 'focusout';
			var event = new CustomEvent(type, { bubbles : true, cancelable : false });
			event.c1Generated = true;
			e.target.dispatchEvent(event);
		};

		var removePolyfill = function removePolyfill(e) {
			if (!e.c1Generated) { // focus after focusin, so chrome will the first time trigger two times focusin
				if (d.removeEventListener) {
					d.removeEventListener('focus', addPolyfill, true);
					d.removeEventListener('blur', addPolyfill, true);
					d.removeEventListener('focusin', removePolyfill, true);
					d.removeEventListener('focusout', removePolyfill, true);
				}
				else { // Because of ie8
					d.detachEvent('onfocus', addPolyfill);
					d.detachEvent('onblur', addPolyfill);
					d.detachEvent('onfocusin', removePolyfill);
					d.detachEvent('onfocusout', removePolyfill);
				}
			}
			setTimeout(function() {
				if (d.removeEventListener) {
					d.removeEventListener('focusin', removePolyfill, true);
					d.removeEventListener('focusout', removePolyfill, true);
				}
				else {
					d.detachEvent('onfocusin', removePolyfill);
					d.detachEvent('onfocusout', removePolyfill);
				}
			}, 0);
		};

		if (w.onfocusin === undefined) {
			if (d.addEventListener) {
				d.addEventListener('focus', addPolyfill, true);
				d.addEventListener('blur', addPolyfill, true);
				d.addEventListener('focusin', removePolyfill, true);
				d.addEventListener('focusout', removePolyfill, true);
			}
			else { // Because of ie8
				d.attachEvent('onfocus', addPolyfill);
				d.attachEvent('onblur', addPolyfill);
				d.attachEvent('onfocusin', removePolyfill);
				d.attachEvent('onfocusout', removePolyfill);
			}
		}
	},

	/**
	 * Get the media item of the clicked element
	 *
	 * @method _getContentParent
	 * @param {Object} target   Clicked element
	 *
	 * @return {Object}
	 */
	_getContentParent : function(target) {
		return target.parent('.' + this.mediaItemCls) || target;
	},

	/**
	 * Get media id from MediaBox data-id attribute
	 *
	 * @method _getMediaId
	 *
	 * @param {Object} targetEl   Clicked element
	 *
	 * @return mediaId
	 */
	_getMediaId : function(targetEl) {
		return this._getContentParent(targetEl).data('id');
	},

	/**
	 * Get media type from MediaBox data-media-type attribute
	 *
	 * @method _getMediaType
	 *
	 * @param {Object} targetEl   Clicked element
	 *
	 * @return mediaType
	 */
	_getMediaType : function(targetEl) {
		return this._getContentParent(targetEl).data('media-type');
	},

	/**
	 * Get media content type from MediaBox data-type attribute
	 *
	 * @method _getContentType
	 *
	 * @param {Object} targetEl   Clicked element
	 *
	 * @return contentType
	 */
	_getContentType : function(targetEl) {
		return this._getContentParent(targetEl).data('type');
	},

	/**
	 * Get media type from MediaBox data-title attribute
	 *
	 * @method _getMediaTitle
	 *
	 * @param {Object} targetEl   Clicked element
	 *
	 * @return mediaTitle
	 */
	_getMediaTitle : function(targetEl) {
		return this._getContentParent(targetEl).data('title');
	},

	/**
	 * Collect title params for onInputBlur method
	 *
	 * @method _getTitleParams
	 *
	 * @param {Object} targetEl   Clicked element
	 *
	 * @return {Object}
	 */
	_getTitleParams : function(targetEl) {
		var params = {};
		if (this._getContentType(targetEl) === this.mediaType.folder) {
			params.folderId = this._getMediaId(targetEl);
			params.newName = targetEl.getValue();
		}
		else {
			params.id = this._getMediaId(targetEl);
			params.title = targetEl.getValue();
			params.channelType = this._channelType;
		}
		return params;
	},

	/**
	 * Focus on Input event handler
	 *
	 * @method onInputFocus
	 * @param {Object} ev   Event object
	 *
	 * @return void
	 */
	onInputFocus : function(ev) {
		var inputEl = Ext.get(ev.target);
		this._activateInput(inputEl);
	},

	/** Input keypress event handler
	 *
	 * @method onInputKeyPress
	 * @param {Object} ev       Event object
	 *
	 * @return void
	 */
	onInputKeyPress : function(ev) {
		var targetEl = Ext.get(ev.target);

		if (ev.getCharCode() === CONST.keyCode.ESCAPE) {
			this._restoreInputValue(ev);
			this._deactivateInput(ev);
		}
		else if (ev.getCharCode() === CONST.keyCode.ENTER) {
			this.fireTitleChangeEvent(targetEl, MediaManagerView.EVENT_INPUT_ENTER_PRESSED);
		}
	},

	/**
	 * Blur on Input event handler
	 *
	 * @method onInputBlur
	 * @param {Object} ev   Event object
	 *
	 * @return void
	 */
	onInputBlur : function(ev) {
		var targetEl = Ext.get(ev.target),
			parentEl = this._getContentParent(targetEl);
		parentEl.removeClass('focus');
		parentEl.jq().protipHide();
		if (this._lastInputValue !== targetEl.getValue() && targetEl.getValue() !== '') {
			this.fireTitleChangeEvent(targetEl, MediaManagerView.EVENT_INPUT_VALUE_CHANGE);
		}
	},

	/**
	 * Fires an event that can indicate title save.
	 *
	 * @param {Object} targetEl target element of the action (input)
	 * @param {String} event Event name
	 *
	 * @return void
	 */
	fireTitleChangeEvent : function(targetEl, event) {
		var parentEl = this._getContentParent(targetEl);

		this.fireEvent(event, {
			scope     : this,
			params    : this._getTitleParams(targetEl),
			mediaType : this._getMediaType(targetEl),
			type      : this._getContentType(targetEl),
			id        : this._getMediaId(targetEl),
			parentEl  : parentEl,
			action    : parentEl.data('action'),
			inputEl   : targetEl
		});
	},

	/**
	 * Activate input and its mediaBox. Get the last input value of input.
	 *
	 * @method _activateInput
	 *
	 * @param {Object} inputEl   [Ext.element]
	 *
	 * @return void
	 */
	_activateInput : function(inputEl) {
		this._getContentParent(inputEl)
			.addClass('focus');
		this._lastInputValue = inputEl.getValue();
	},

	/**
	 * Deactivate input method
	 *
	 * @method _deactivateInput
	 *
	 * @param {Object} ev    Event object
	 *
	 * @return void
	 */
	_deactivateInput : function(ev) {
		var el = Ext.get(ev.target);

		if (el) {
			el.blur();
		}
	},

	/**
	 * Restores the value of the input element.
	 *
	 * @method _restoreInputValue
	 *
	 * @param {Object} ev   Event object
	 */
	_restoreInputValue : function(ev) {
		Ext.fly(ev.target).dom.value = this._lastInputValue;
	},

	/**
	 * Restores the value of the input element after save title failed
	 *
	 * @method restoreInputValueAfterFailed
	 *
	 * @param {Object} ev   Event object
	 */
	restoreInputValueAfterFailed : function(ev) {
		ev.targetEl.select('.' + this.mediaInputCls).item(0).dom.value = this._lastInputValue;
	},

	/**
	 * Update the title in the folder, after title change
	 *
	 * @method updateFolderTitle
	 *
	 * @param {Object} mediaId   Media id
	 * @param {String} newName   new title
	 * @DEPRECATED?!
	 * @return mediaTitle
	 */
	updateFolderTitle : function(mediaId, newName) {
		var activeFolderEl = Ext.get('content_' + mediaId);
		if (activeFolderEl) {
			var folderNameEl = activeFolderEl.select(this.folderNameCls.dot()).item(0);
			folderNameEl.dom.innerHTML = newName;
		}
	},

	/**
	 * Delete button click event handler
	 *
	 * @method onDeleteButtonClick
	 * @param {Object} ev   Event object
	 *
	 * @return void
	 */
	onDeleteButtonClick : function(ev) {
		ev.preventDefault();
		var targetEl = Ext.get(ev.target),
			mediaBox = this._getContentParent(targetEl);
		mediaBox.select('.' + this.confirmDeleteCls).removeClass(this.hideCls);
	},

	/**
	 * Handles a click event on a confirm popup (delegated to the anchors)
	 *
	 * @method onDeleteConfirmPopupClick
	 *
	 * @param {Object} ev         Event object
	 * @param {Object} target     Target element
	 * @param {Object} eventOpts  Event options (delegate,etc.)
	 * @param {Object} ajaxParams Ajax params for the button click ajax
	 *
	 * @return void;
	 */
	onDeleteConfirmPopupClick : function(ev, target, eventOpts, ajaxParams) {
		if (ev.preventDefault) {
			ev.preventDefault();
		}
		var targetEl = Ext.get(ev.target),
			mediaBox = this._getContentParent(targetEl);

		if (targetEl.hasClass(this.mediaDeleteConfirmCls)) {
			var mediaId = this._getMediaId(targetEl),
				contentType = this._getContentType(targetEl),
				mediaTitle = this._getMediaTitle(targetEl),
				mediaType = this._getMediaType(targetEl),
				params = ajaxParams || {};
			params.channelType = this._channelType;
			params.id = mediaId;
			if (mediaTitle !== null) {
				params.name = mediaTitle;
			}
			Chaos.fireEvent(GlobalProgressIndicator.GLOBALEVENT_SHOW_INDICATOR);
			this.fireEvent(MediaManagerView.EVENT_MEDIA_DELETE_CONFIRMED, {
				scope     : this,
				params    : params,
				type      : contentType,
				mediaType : mediaType,
				targetEl  : targetEl,
				parentEl  : this._getContentParent(targetEl)
			});
		}
		mediaBox.select('.' + this.confirmDeleteCls).addClass(this.hideCls);
	},

	/**
	 * Delete confirm (on channel inactivation) overlay OK button click event handler.
	 *
	 * @param {EventObject} ev
	 */
	onDeleteConfirmOverlayClick : function(ev) {
		this.onDeleteConfirmPopupClick(
			{ target : ev.target },
			ev.target,
			null,
			{ isConfirmed : '1' }
		);
	},

	/**
	 * Remove clicked media box
	 * @param mediaBox   Ext element removable media box
	 *
	 * @return
	 */
	removeMedia : function(mediaBox) {
		mediaBox.remove();
		this.fireEvent(MediaManagerView.EVENT_MEDIA_REMOVE_DONE, { scope : this });
		Chaos.fireEvent(GlobalProgressIndicator.GLOBALEVENT_HIDE_INDICATOR);
	},

	/**
	 * Rotate Button Click
	 *    - Animate image
	 *    - Set and store image rotation params
	 *
	 * @method onRotateButtonClick
	 * @public
	 *   @param {Object} ev Click object
	 */
	onRotateButtonClick : function(ev) {
		ev.preventDefault();
		var targetEl = Ext.get(ev.target),
			mediaBox = this._getContentParent(targetEl),
			imageEl = mediaBox.select('img').item(0),
			currentRotate,
			rotationsParams = {};
		this._sentAjaxRequest = false;

		if (typeof this.lastClickedId !== 'undefined' &&
			this.lastClickedId !== this._getMediaId(imageEl) &&
			this._sentDelayedAjaxRequest === false) {
			this._rotateMediaDelayedTask();
			this._sentAjaxRequest = true;
			this.imageEl.data('rotation-value', 0);
			this.imageEl.data('rotation-css', this.rotationCssValue);
			this.rotationCssValue = 0;
		}
		if (typeof this.lastClickedId === 'undefined' || this.lastClickedId !== this._getMediaId(imageEl)) {
			this.lastClickedId = this._getMediaId(imageEl);
		}
		this.imageEl = imageEl;
		currentRotate = this._calculateRotationValue(imageEl);
		rotationsParams.contentId = this._getMediaId(imageEl);
		rotationsParams.rotationValue = currentRotate;
		this._sentDelayedAjaxRequest = false;
		// Rotate the image
		this.rotateImage(imageEl, currentRotate);
		// Set the new rotation value
		this.setImageRotateCurrentValue(imageEl, currentRotate);
		// Store image rotation params
		this._rotationParams = this.storeImagesRotationParams(rotationsParams);
		this._rotateMedia(ev, rotationsParams, mediaBox);
	},

	/**
	 * Store rotation params
	 *
	 * @method storeImagesRotationParams
	 * @public
	 * @param {Object} rotationsParams Store image content id, and rotation degree
	 *
	 * @return {Object}
	 */
	storeImagesRotationParams : function(rotationsParams) {
		var key = rotationsParams.contentId;
		this._editedImages[key] = this._calculateRotationModulus(rotationsParams.rotationValue);
		// Remove images with rotation value 0
		this._removeNoneRotatedImages();
	},

	/**
	 * If image is rotating, it adds a class to it which
	 * gives visibility to the loader and tooltip
	 *
	 * @method markRotatingMediaItems
	 * @param {String} mongoId	Mongo Id of the image
	 * @param {String} command	Add || undefined
	 *
	 * @return void;
	 */
	toggleRotatingClass : function(mongoId, command) {
		var rotatingMediaBox = this.element.select('[data-id="' + mongoId + '"]');
		if (command === 'add') {
			rotatingMediaBox.addClass(this.rotatingCls);
		}
		else {
			rotatingMediaBox.removeClass(this.rotatingCls);
		}
	},

	/**
	 * Modulus division
	 *
	 * @method _calculateRotationModulus
	 *
	 * @param {Number} rotationValue    rotationValue
	 *
	 * @return {Number} Rotation modulus
	 */
	_calculateRotationModulus : function(rotationValue) {
		return rotationValue % 360;
	},

	/**
	 * Remove the 0 degree rotation from the array
	 *
	 * @method _removeNoneRotatedImages
	 *
	 *
	 * @return {Object}
	 */
	_removeNoneRotatedImages : function() {
		for (var prop in this._editedImages) {
			if (this._editedImages.hasOwnProperty(prop)) {
				if (this._editedImages[prop] === 0) {
					delete this._editedImages[prop];
				}
			}
		}
		return this._editedImages;
	},

	/**
	 * Calculate Rotation Value
	 *
	 * @method _calculateRotationValue
	 *
	 * @param {Object} imageEl Image Ext element
	 *
	 * @return {Number} dataRotateValue Current rotation value
	 */
	_calculateRotationValue : function(imageEl) {
		var dataRotateValue = parseInt(imageEl.data('rotation-value'), 10);
		return dataRotateValue + this.rotationDegree;
	},

	/**
	 * Rotate image animation
	 *
	 * @method rotateImage
	 * @public
	 * @param {Object} imageEl         Image element [Ext.Element]
	 * @param {Number} currentRotate   Rotation value
	 *
	 * @return {Object} this
	 */
	rotateImage : function(imageEl, currentRotate) {
		var rotationValue = parseInt(imageEl.data('rotation-css'), 10) + currentRotate;
		try {
			TweenMax.to(
				imageEl.dom,
				0.4,
				{
					css : {
						rotation : rotationValue,
						bottom   : 0
					}
				}
			);
		}
		catch (e) {
			/* develblock:start */
			console.error(e);
			/* develblock:end */
		}
		return this;
	},

	/**
	 * Set image rotation data attribute value
	 *
	 * @method setImageRotateCurrentValue
	 * @public
	 * @param {Object} imageEl         Image element [Ext.Element]
	 * @param {Number} currentRotate   Rotation value
	 */
	setImageRotateCurrentValue : function(imageEl, currentRotate) {
		imageEl.data('rotation-value', currentRotate);
	},

	/**
	 * Send rotation params instant
	 *
	 * @method _rotateMedia
	 * @public
	 * @param {Object}  ev  Event object
	 * @param {Object}  rotationsParams  Rotation Parameters
	 * @param {Object}  mediaBox         Media box attributes
	 *
	 * @return void
	 */
	_rotateMedia : function(ev, rotationsParams, mediaBox) {
		var storedRotationValue = rotationsParams.rotationValue % 360;
		if (storedRotationValue !== 0) {
			this._rotationItems[rotationsParams.contentId] = storedRotationValue;
		}
		else {
			// If no rotation changes made remove image from list
			delete this._rotationItems[rotationsParams.contentId];
		}
		if (!(this._rotationDelayedTask instanceof Ext.util.DelayedTask) && this._sentAjaxRequest === false) {
			this.mediaBox = mediaBox;
			this._rotationDelayedTask = new Ext.util.DelayedTask(this._rotateMediaDelayedTask, this);
		}
		if (this._rotationDelayedTask) {
			this._rotationDelayedTask.delay(this.imageRotationDelay);
		}
	},

	/**
	 * Rotate image Delayed Task
	 *
	 * @method _rotateMediaDelayedTask
	 * @public
	 *
	 * @return void
	 */
	_rotateMediaDelayedTask : function() {
		let rotationValue = parseInt(this.imageEl.data('rotation-value'), 10);
		let rotationCss = parseInt(this.imageEl.data('rotation-css'), 10);
		if (Object.getOwnPropertyNames(this._rotationItems).length > 1) {
			this.fireEvent(MediaManagerView.EVENT_MEDIA_ROTATE, {
				scope         : this,
				rotationItems : this._rotationItems,
				channelType   : this._channelType,
				parentEl      : this.mediaBox
			});
		}
		this.rotationCssValue = rotationValue + rotationCss;
		this.imageEl.data('rotation-value', 0);
		this.imageEl.data('rotation-css', this.rotationCssValue);
		this._rotationItems = [];
		this._sentDelayedAjaxRequest = true;
	},

	/**
	 * Description
	 *
	 * @method onEditMediaButtonClick
	 * @param {Object} ev   Event object
	 *
	 * @return void;
	 */
	onEditMediaButtonClick : function(ev) {
		ev.preventDefault();
		var inputEl = Ext.fly(ev.target).parent().select(this.mediaInputCls.dot());
		if (inputEl.getCount()) {
			this._activateInput(inputEl.item(0));
		}
	},

	/**
	 * Hides all the protips on the box
	 *
	 * @method hideAllProtips
	 * @param {Object} el Subject element to hide tooltips from
	 *
	 * @return void;
	 */
	hideAllProtips : function(el) {
		if (el) {
			el.jq().protipHide();
		}
	},

	/**
	 * Binds events
	 */
	bind : function() {
		MediaManagerView.superclass.bind.call(this);

		Broadcaster.on(
			MediaManagerView.EVENT_MEDIA_DELETE_OVERLAY_CONFIRMED,
			this.onDeleteConfirmOverlayClick,
			this
		);

		this.element.on('click', this.onDeleteButtonClick, this, {
			delegate : this.mediaDeleteButtonCls.dot()
		});
		this.element.on('click', this.onRotateButtonClick, this, {
			delegate : this.mediaRotateButtonCls.dot()
		});
		this.element.on('click', this.onDeleteConfirmPopupClick, this, {
			delegate : this.mediaDeleteConfirmCls.dot()
		});
		this.element.on('click', this.onDeleteConfirmPopupClick, this, {
			delegate : this.mediaDeleteCancelCls.dot()
		});
		this.element.on('focusin', this.onInputFocus, this, {
			delegate : this.mediaInputCls.dot()
		});
		this.element.on('keyup', this.onInputKeyPress, this, {
			delegate : this.mediaInputCls.dot()
		});
		this.element.on('focusout', this.onInputBlur, this, {
			delegate : this.mediaInputCls.dot()
		});
		this.element.on('click', this.onEditMediaButtonClick, this, {
			delegate : this.editMediaTitleButton.dot()
		});
	},

	/**
	 * Unbind events
	 */
	unbind : function() {
		this.autoUnbind();
	}
});
