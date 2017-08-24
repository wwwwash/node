import $ from 'jquery';

import Ext from '../../lib/vendor/ExtCore';
import PH from '../../lib/constant/Phrame';

import HTML5Uploader from './HTML5Uploader';

export default function HTML5UploaderController(el, config) {
	HTML5UploaderController.superclass.constructor.call(this, el, config);
}

Ext.extend(HTML5UploaderController, HTML5Uploader, {

	/**
	 * Classes
	 *
	 * @type Object
	 */
	cls : {
		hide                 : 'hide',
		tooltip              : 'uploader5__tooltip',
		noProgressTransition : 'noProgressTransition',
		dragOver             : 'uploader5--is-drag-over',
		isDragging           : 'uploader5--is-dragging'
	},

	_dragTimeout   	 : undefined,
	_allowDragRemove : true,

	/**
	 * Init method.
	 *
	 * @param {Object} el     Element of the Plugin. Its a File Input. Ext.Element because the environment is Ext.
	 * @param {Object} config Config object
	 * @return void
	 */
	init : function(el, config) {
		this.ui = {
			progress       : '.uploader5__progress',
			progressBar    : '.uploader5__progress-bar',
			progressBarBar : '.uploader5__progress-bar .bar',
			text           : '.uploader5__progress-bar span:first',
			percentText    : '.uploader5__progress-bar span:last',
			button         : '.uploader5__button',
			buttonLink     : '.uploader5__button a:first',
			hideOnProgress : '.uploader5__hide-on-progress'
		};

		HTML5UploaderController.superclass.init.call(this, el, config);
		this._fetchElements();
	},

	/**
	 * Builds HTML template from the error messages.
	 *
	 * @returns {string}
	 */
	buildErrorMsg : function(error) {
		var ret = '<span class="protip-close"><i class="icon-x"></i></span><ul>';
		var errors = error ? [error] : this._errors;

		errors.forEach(function(val) {
			if (typeof val === 'string') {
				ret += '<li>' + val + '</li>';
			}
			else {
				var k = Object.keys(val)[0];
				ret += '<li><span class="uploader5__tooltip-filename">' + k + '</span> ' + val[k] + '</li>';
			}
		});
		ret += '</ul>';

		return ret;
	},

	/**
	 * Tells if the uploader is visible
	 *
	 * @return boolean
	 */
	isVisible : function() {
		return this._el.is(':visible');
	},

	/**
	 * Fetches UI elements.
	 *
	 * @private
	 */
	_fetchElements : function() {
		$.each(this.ui, function(key, value) {
			this.ui[key] = this._el.find(value);
		}.bind(this));
		this.ui.body = $('body');
	},

	/**
	 * Toggles the whole uploader.
	 */
	toggleUploader : function() {
		this._el.toggleClass(this.cls.hide);
	},

	/**
	 * Toggles the upload button and progressbar visibility.
	 *
	 * @private
	 */
	_toggleProgressbar : function() {
		this.ui.button
			.add(this.ui.progress)
			.add(this.ui.hideOnProgress)
			.toggleClass(this.cls.hide);
	},

	/**
	 * Toggles the visible test on the progressbar.
	 *
	 * @private
	 */
	_toggleText : function() {
		if (!this._textOnce) {
			this.ui.text.toggleClass(this.cls.hide);
			this._textOnce = true;
		}
	},

	/**
	 * Prepare fail handler. In case of validation error.
	 *
	 * @private
	 */
	_onAfterPreparefail : function() {
		this._toggleProgressbar();
		this._showErrors();
	},

	/**
	 * Shows error tooltip from generated messages or the text provided in the parameter.
	 *
	 * @param text [string]
	 * @private
	 */
	_showErrors : function(text) {
		this.ui.buttonLink.protipShow({
			title   : text || this.buildErrorMsg(),
			classes : this.cls.tooltip + ' ' + PH.cls.protipCommonClose,
			gravity : true
		});
	},

	/**
	 * Hides error tooltip.
	 */
	hideErrors : function() {
		this.ui.buttonLink.protipHide();
	},

	/**
	 * Callback when input field changes.
	 *
	 * @private
	 */
	_onChange : function() {
		this.hideErrors();
		this._toggleProgressbar();
		this.ui.progressBarBar.width(0);
	},

	/**
	 * Callback when upload has finished.
	 *
	 * @private
	 */
	_onAlways : function() {
		this._toggleProgressbar();
		this._textOnce = false;
		this._toggleText();
		this._textOnce = false;
		this.ui.progressBarBar.width(0).addClass(this.cls.noProgressTransition);

		if (this._errors.length) {
			this._showErrors();
		}
	},

	/**
	 * Callback fro upload progress.
	 *
	 * @param ev {Object} Event object
	 * @private
	 */
	_onProgress : function(ev) {
		var percent = parseInt(ev.loaded / ev.total * 100, 10).percent();
		this.ui.progressBarBar.width(percent).removeClass(this.cls.noProgressTransition);
		this.ui.percentText.text(percent);
	},

	/**
	 * On Token getting fail
	 * @private
	 */
	_onGettokensfail : function() {
		this._onAlways();
	},

	/**
	 * Callback when uploading has started.
	 *
	 * @private
	 */
	_onSend : function() {
		this._toggleText();
	},

	/**
	 * On drop handler
	 *
	 * @overrides
	 * @param ev
	 * @private
	 */
	_onDrop : function(ev) {
		HTML5UploaderController.superclass._onDrop.call(this, ev);
		if (this.options.dropZone) {
			this.options.dropZone.removeClass(this.cls.dragOver);
		}
	},

	/**
	 * Drag enter callback if Drag&Drop enabled
	 *
	 * @param ev {Object} Event object
	 * @private
	 */
	_onDragover : function(ev) {
		ev.originalEv.preventDefault();
		if (this.options.dropZone) {
			clearTimeout(this._dragLeaveTimeout);
			this.options.dropZone.addClass(this.cls.dragOver);
		}
	},

	/**
	 * Drag leave callback if Drag&Drop enabled
	 *
	 * @param ev {Object} Event object
	 * @private
	 */
	_onDragleave : function(ev) {
		ev.originalEv.preventDefault();
		if (this.options.dropZone) {
			this._dragLeaveTimeout = setTimeout(function () {
				this.options.dropZone.removeClass(this.cls.dragOver);
			}.bind(this), 50);
		}
	},

	/**
	 * Attaches events.
	 */
	bind : function() {
		HTML5UploaderController.superclass.bind.call(this);

		$(document).bind('dragover', function (ev) {
			ev.preventDefault();
			this.ui.body.addClass(this.cls.isDragging);
			clearTimeout(this._dragTimeout);
		}.bind(this));

		$(document).bind('drop dragleave', function (ev) {
			ev.preventDefault();
			this._dragTimeout = setTimeout(function() {
				this.ui.body.removeClass(this.cls.isDragging);
			}.bind(this), 50);
		}.bind(this));
	},

	/**
	 * Removes events.
	 */
	unbind : function() {
		HTML5UploaderController.superclass.unbind.call(this);

		$(document).off('drop dragover dragleave');
	}
});