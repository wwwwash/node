import Ext from '../../lib/vendor/ExtCore';
import Chaos from '../../lib/chaos/Chaos';
import ChaosController from '../../lib/chaos/Controller';

import MediaManagerModel from './MediaManagerModel';
import MediaManagerView from './MediaManagerView';

export default function MediaManagerController(el, config) {
	MediaManagerController.superclass.constructor.call(this, el, config);
}

Ext.apply(MediaManagerController, {
	EVENT_INPUT_VALUE_CHANGE      : 'input-value-change',
	EVENT_INPUT_ENTER_PRESSED     : 'input-enter-pressed',
	EVENT_SAVE_MEDIATITLE_SUCCESS : 'save-mediatitle-success',
	EVENT_SAVE_MEDIATITLE_FAILED  : 'save-mediatitle-failed',
	EVENT_DELETE_MEDIA_SUCCESS    : 'delete-media-success',
	EVENT_DELETE_MEDIA_FAILED     : 'delete-media-failed',
	EVENT_MEDIA_DELETED           : 'media-deleted',
	EVENT_ROTATE_MEDIA_SUCCESS    : 'rotate-media-success',
	EVENT_ROTATE_MEDIA_FAILED     : 'rotate-media-failed'
});

Chaos.extend(MediaManagerController, ChaosController, {

	/** @var {String}           Rotated Item */
	rotatedItem : '',

	/**
	 * Init
	 *
	 * @param {Element} el      Context element
	 * @param {Object} config   Config object of this controller
	 */
	init : function(el, config) {
		MediaManagerController.superclass.init.call(this, el, config);
		this.addEvents(
			MediaManagerController.EVENT_SAVE_MEDIATITLE_SUCCESS,
			MediaManagerController.EVENT_SAVE_MEDIATITLE_FAILED,
			MediaManagerController.EVENT_DELETE_MEDIA_SUCCESS,
			MediaManagerController.EVENT_DELETE_MEDIA_FAILED,
			MediaManagerController.EVENT_MEDIA_DELETED,
			MediaManagerController.EVENT_INPUT_VALUE_CHANGE,
			MediaManagerController.EVENT_ROTATE_MEDIA_SUCCESS,
			MediaManagerController.EVENT_ROTATE_MEDIA_FAILED
		);
	},

	/**
	 * Callback for a successful change media title request
	 *
	 * @method onSaveTitleSuccess
	 * @param {Object} ev    Event object
	 *
	 * @return void;
	 */
	onSaveTitleSuccess : function(ev) {
		this.MediaManagerView.updateFolderTitle(ev.mediaId, ev.newName);
		this.MediaManagerView._deactivateInput({
			target : ev.inputEl
		});
		this.MediaManagerView.hideAllProtips(ev.inputEl.parent());
		this.fireEvent(MediaManagerController.EVENT_SAVE_MEDIATITLE_SUCCESS, { scope : this });
	},

	/**
	 * Callback for a failed change media title request
	 *
	 * @method onSaveTitleFailed
	 * @param {Object} ev    Event object
	 *
	 * @return void;
	 */
	onSaveTitleFailed : function(ev) {
		var message;

		try {
			message = ev.response.json.data;
		}
		catch (e) {
			/* develblock:start */
			console.warn('Response object invalid format');
			/* develblock:end */
		}

		// If message is defined, it is a spamfiltered error, it shouldn't clear the input
		if (!message) {
			this.MediaManagerView.restoreInputValueAfterFailed(ev);
		}

		this.fireEvent(MediaManagerController.EVENT_SAVE_MEDIATITLE_FAILED, {
			scope    : this,
			targetEl : ev.targetEl,
			message  : message
		});
	},

	/**
	 * Callback for a successful media delete request
	 *
	 * @method onDeleteMediaSuccess
	 * @param {Object} ev    Event object
	 *
	 * @return void;
	 */
	onDeleteMediaSuccess : function(ev) {
		var confirmOverlayUrl;

		try {
			confirmOverlayUrl = ev.response.json.data.overlayUrl;
		}
		catch (e) {
			/* develblock:start */
			console.log('Exception:', e);
			/* develblock:end */
		}

		// If we didnt get a confirm overlay content, we can remove the media.
		if (!confirmOverlayUrl) {
			this.MediaManagerView.removeMedia(ev.mediaParams.parentEl);
		}

		this.fireEvent(MediaManagerController.EVENT_DELETE_MEDIA_SUCCESS, {
			scope             : this,
			mediaParams       : ev.mediaParams,
			confirmOverlayUrl : confirmOverlayUrl
		});
	},

	/**
	 * Callback for a failed media delete request
	 *
	 * @method onDeleteMediaFailed
	 *
	 * @return void;
	 */
	onDeleteMediaFailed : function(ev) {
		ev.scope = this;
		this.fireEvent(MediaManagerController.EVENT_DELETE_MEDIA_FAILED, ev);
	},

	/**
	 * Callback for a media remove request
	 *
	 * @method onMediaRemoveDone
	 *
	 * @return void;
	 */
	onMediaRemoveDone : function() {
		this.fireEvent(MediaManagerController.EVENT_MEDIA_DELETED, { scope : this });
	},

	/**
	 * Callback for a successful media rotate request
	 *
	 * @method onMediaRotate
	 * @param {Object} ev    Event object
	 *
	 * @return void;
	 */
	onMediaRotate : function(ev) {
		this.rotatedItem = ev.rotationItems;
		this.MediaManagerModel.rotateMedia(ev.rotationItems, ev.channelType, ev.parentEl);
	},

	/**
	 * Callback for a successful media rotate request
	 *
	 * @method onRotateMediaSuccess
	 *
	 * @return void;
	 */
	onRotateMediaSuccess : function() {
		this.fireEvent(MediaManagerController.EVENT_ROTATE_MEDIA_SUCCESS, this.rotatedItem);
	},

	/**
	 * If image is rotating, it adds a class to it which
	 * gives visibility to the loader and tooltip
	 *
	 * @method onImageUnderRotation
	 * @param {Object} mongoId
	 * @param {Object} command Add == 'addClass'|| undefined == 'removeClass'
	 *
	 * @return void;
	 */
	handleMediaRotationClass : function(mongoId, command) {
		this.MediaManagerView.toggleRotatingClass(mongoId, command);
	},

	/**
	 * Callback for a failed media rotate request
	 *
	 * @method onRotateMediaFailed
	 *
	 * @return void;
	 */
	onRotateMediaFailed : function(ev) {
		this.fireEvent(MediaManagerController.EVENT_ROTATE_MEDIA_FAILED, {
			scope    : this,
			targetEl : ev.targetEl,
			message  : ev.message
		});
	},

	/**
	 * Callback of the view's input value change event.
	 *
	 * @method onInputValueChange
	 * @param {Object} ev   MediaManagerView event object
	 *
	 * @return void;
	 */
	onInputValueChange : function(ev) {
		ev.params.csrfToken = this.ChannelCsrfModel.get();
		this.MediaManagerModel.saveTitle(ev);
		this.fireEvent(MediaManagerController.EVENT_INPUT_VALUE_CHANGE, ev);
	},

	/**
	 * Callback of the view's input enter pressed event.
	 *
	 * @method onInputEnterPressed
	 * @param {Object} ev MediaManagerView event object
	 *
	 * @return void;
	 */
	onInputEnterPressed : function(ev) {
		ev.inputEl.dom.blur();
	},

	/**
	 * Callback for a media delete confirmed request
	 *
	 * @method onMediaDeleteConfirmed
	 * @param {Object} ev    Event object
	 *
	 * @return void;
	 */
	onMediaDeleteConfirmed : function(ev) {
		if (ev.params.id) {
			ev.params.csrfToken = this.ChannelCsrfModel.get();
			this.MediaManagerModel.deleteMedia(ev);
		}
		else {
			this.MediaManagerView.removeMedia(ev.parentEl);
		}
	},

	/**
	 * Binds events
	 */
	bind : function() {
		MediaManagerController.superclass.bind.call(this);
		this.MediaManagerModel
			.on(MediaManagerModel.EVENT_SAVE_MEDIATITLE_SUCCESS, this.onSaveTitleSuccess, this);
		this.MediaManagerModel
			.on(MediaManagerModel.EVENT_SAVE_MEDIATITLE_FAILED, this.onSaveTitleFailed, this);
		this.MediaManagerModel
			.on(MediaManagerModel.EVENT_DELETE_MEDIA_SUCCESS, this.onDeleteMediaSuccess, this);
		this.MediaManagerModel
			.on(MediaManagerModel.EVENT_DELETE_MEDIA_FAILED, this.onDeleteMediaFailed, this);
		this.MediaManagerModel
			.on(MediaManagerModel.EVENT_ROTATE_MEDIA_SUCCESS, this.onRotateMediaSuccess, this);
		this.MediaManagerModel
			.on(MediaManagerModel.EVENT_ROTATE_MEDIA_FAILED, this.onRotateMediaFailed, this);
		this.MediaManagerView
			.on(MediaManagerView.EVENT_MEDIA_DELETE_CONFIRMED, this.onMediaDeleteConfirmed, this);
		this.MediaManagerView
			.on(MediaManagerView.EVENT_MEDIA_REMOVE_DONE, this.onMediaRemoveDone, this);
		this.MediaManagerView
			.on(MediaManagerView.EVENT_MEDIA_ROTATE, this.onMediaRotate, this);
		this.MediaManagerView
			.on(MediaManagerView.EVENT_INPUT_VALUE_CHANGE, this.onInputValueChange, this);
		this.MediaManagerView
			.on(MediaManagerView.EVENT_INPUT_ENTER_PRESSED, this.onInputEnterPressed, this);
	},

	/**
	 * Unbind events
	 */
	unbind : function() {
		MediaManagerController.superclass.unbind.call(this);
		this.autoUnbind();
	}
});
