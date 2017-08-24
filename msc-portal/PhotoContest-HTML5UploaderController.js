import Ext from '../../lib/vendor/ExtCore';
import Chaos from '../../lib/chaos/Chaos';
import PH from '../../lib/constant/Phrame';

import HTML5Uploader from './HTML5Uploader';
import HTML5UploaderController from './HTML5UploaderController';

export default function PhotoContestHTML5UploaderController(el, config) {
	PhotoContestHTML5UploaderController.superclass.constructor.call(this, el, config);
}

PhotoContestHTML5UploaderController.PICTURE_STATUS = {
	UPLOADING  : 'pending_upload',
	UPLOADED   : 'uploaded',
	CONVERTING : 'converting',
	CONVERTED  : 'converted',
	ENABLED    : 'enabled',
	REJECTED   : 'rejected',
	DELETED    : 'deleted',
	FAILED     : 'failed'
};

Ext.extend(PhotoContestHTML5UploaderController, HTML5UploaderController, {

	/** @type {number}               Number of minimum uploaded photo */
	minUploadLimit         : 6,
	/** @type {number}               Number of maximum uploaded photo */
	maxUploadLimit         : 50,
	/** @type {number}               Number of uploaded photos */
	uploadedPhotoCount     : 0,
	/** @type {boolean}              True if upload in progress */
	_uploadInProgress      : false,
	/** @type {boolean}              True if uploaded photos checked after first load */
	_checkedAfterFirstLoad : false,

	_errorMessages : {
		UPLOAD_REACH_LIMIT             : 'upload_reach_limit',
		UPLOAD_REACH_LIMIT_EMPTY_ALBUM : 'upload_reach_limit_empty_album'
	},

	/**
	 * Init method.
	 *
	 * @param {Object} el
	 * @param {Object} config
	 * @return void
	 */
	init : function (el, config) {
		PhotoContestHTML5UploaderController.superclass.init.call(this, el, config);

		this._initUI();

		this.mediaContainerTag.fetchFullImagesList(this._onMediaContainerTagLoaded.bind(this));
	},

	/**
	 * Returns the already uploaded count.
	 * Used with multiLimit calculations.
	 *
	 * @returns {number}
	 */
	getUploadedCount : function() {
		return this.uploadedPhotoCount || 0;
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
	 * @private
	 */
	_initUI : function() {
		this.mediaContainerTag = document.querySelector('[data-is="media-container"]')._tag;
		this.uploadLimitContainerEl = Ext.getBody().select('.uploadLimitContainer').item(0);
		this.uploaderContainerEl = Ext.getBody().select('.uploaderContainer').item(0);
		this.progressInfoEl = Ext.getBody().select('.uploader5__progress-info').item(0);

		this._ui = {};
		this._ui.item = this._el.closest('.js-item');
		this._ui.input = this._ui.item.find('input[type=hidden]');
		this._ui.uploaded = this._ui.item.find('.js-uploaded');
		this._ui.img = this._ui.uploaded.find('img');
		this._ui.uploader = this._ui.item.find('.uploader5');
		this._ui.icon = this._ui.item.find('.js-icon i');
		this._ui.reject = this._ui.item.find('.js-reject');
	},

	/**
	 * @private
	 */
	_onMediaContainerTagLoaded : function() {
		this.uploadedPhotoCount = this.mediaContainerTag.uploadedMediaItems;

		if (!this._checkedAfterFirstLoad) {
			this._checkMinimumUploadCount();
			this._checkedAfterFirstLoad = true;
		}
	},

	_onPreparefail : function(ev) {
		if (ev.abort) {
			return;
		}

		var invalidFiles = {};
		ev.errors.forEach(function(error) {
			invalidFiles[Object.keys(error)[0]] = true;
		});
		invalidFiles = Object.keys(invalidFiles);

		invalidFiles.forEach(function(fileName) {
			delete this.readerResults[fileName];
		}, this);

		this.pluginDatas = this.pluginDatas.filter(function(data) {
			return invalidFiles.indexOf(data.files[0].name) < 0;
		});

		this.addedCount = this.selectedCount = this.pluginDatas.length;
	},

	_onAfterPreparefail : function() {
		this._showErrors();

		if (!this.pluginDatas.length) {
			this._toggleProgressbar();

			return;
		}

		// recover if there are something to upload
		this.fireEvent(HTML5Uploader.EV.PREPARE_OK, {
			results : this.readerResults
		});
	},

	/**
	 * Callback when upload start.
	 *
	 * @private
	 */
	_onStart : function() {
		this._uploadInProgress = true;
		this.hideAllProtips(this.uploaderContainerEl);
	},

	/**
	 * Callback when upload stop.
	 *
	 * @private
	 */
	_onStop : function() {
		this._uploadInProgress = false;
		this._checkMinimumUploadCount();
		this.progressInfoEl.dom.innerHTML = '';
	},

	/**
	 * Callback when uploading has sended.
	 *
	 * @private
	 */
	_onSend : function() {
		PhotoContestHTML5UploaderController.superclass._onSend.call(this);

		this.inProgressCount++;
		this.progressInfoEl.dom.innerHTML = this.inProgressCount + '/' + this.addedCount;
	},

	/**
	 * Drop callback if Drag&Drop enabled
	 *
	 * @param ev {Object} Event object
	 * @private
	 */
	_onDrop : function(ev) {
		if (!this._uploadInProgress) {
			PhotoContestHTML5UploaderController.superclass._onDrop.call(this, ev);

			return;
		}

		ev.originalEv.preventDefault();

		if (this.options.dropZone) {
			this.options.dropZone.removeClass(this.cls.dragOver);
		}
	},

	/**
	 * After upload successfully finished we need to add a picture to the container
	 * @private
	 */
	_onDone : function(ev) {
		var _result = JSON.parse(ev.result);

		if (!_result.request_params) {
			return;
		}

		this.uploadedPhotoCount++;

		this.mediaContainerTag.addMediaItems([{
			id     : _result.request_params.mongo,
			status : PhotoContestHTML5UploaderController.PICTURE_STATUS.UPLOADED
		}]);

		// We will use later. If backend do the token handling.
		//this._checkMaximumUploadCount();
	},

	/**
	 * Callback when input field changes.
	 *
	 * @private
	 */
	_onChange : function() {
		PhotoContestHTML5UploaderController.superclass._onChange.call(this);

		this.selectedCount = 0;
		this.addedCount = 0;
		this.inProgressCount = 0;
	},

	/**
	 * Callback when media item added.
	 *
	 * @private
	 */
	_onAdd : function() {
		this.selectedCount++;
		this.addedCount = this.selectedCount;
	},

	/**
	 * Callback when upload has finished.
	 *
	 * @private
	 */
	_onAlways : function() {
		this.selectedCount--;

		if (!this.selectedCount) {
			PhotoContestHTML5UploaderController.superclass._onAlways.call(this);
		}
	},

	/**
	 * Handles if we dont reach the upload minimum limit
	 * @private
	 */
	_checkMinimumUploadCount : function() {
		if (this.uploadedPhotoCount < this.minUploadLimit && this.uploadedPhotoCount > 0) {
			this._showLimitError(
				Chaos.translate('You must upload at least {minUploadLimit} pictures.', {
					minUploadLimit : this.minUploadLimit
				}));
		}
	},

	/**
	 * Handles if we reach the upload maximum limit
	 * @private
	 */
	_checkMaximumUploadCount : function() {
		if (this.uploadedPhotoCount >= this.maxUploadLimit) {
			this.toggleUploader();
			this.uploadLimitContainerEl.toggleClass(this.cls.hide);
		}
	},

	/**
	 * Shows error tooltip from generated messages or the text provided in the parameter.
	 *
	 * @param text [string]
	 * @private
	 */
	_showErrors : function(text) {
		// filter image related errors
		var imageRelatedErrors = this._errors.filter(function(error) {
			return typeof error === 'object';
		});

		if (imageRelatedErrors.length) {
			this.mediaContainerTag.addMediaItems(
				this._imageRelatedErrors2MediaItems(imageRelatedErrors)
			);
		}

		this._errors = [];

		// filter uploader related errors
		var uploaderRelatedErrors = this._errors.filter(function(error) {
			return typeof error === 'string';
		});

		if (!text && !uploaderRelatedErrors.length) {
			return;
		}

		//this.buildErrorMsg() works only with this._errors
		this._errors = uploaderRelatedErrors;

		// show uploader related errors
		this.uploaderContainerEl.jq().protipShow({
			title     : text || this.buildErrorMsg(),
			trigger   : 'sticky',
			classes   : this.cls.tooltip + ' ' + PH.cls.protipCommonClose,
			gravity   : false,
			position  : 'bottom',
			offsetTop : -70
		});
	},

	/**
	 * @param {Array} errors
	 * @returns {Array}
	 * @private
	 */
	_imageRelatedErrors2MediaItems : function(errors) {
		var result = {},
			error,
			imageName,
			errorDescription;

		for (var i = 0, iLen = errors.length; i < iLen; i++) {
			error = errors[i];
			imageName = Object.keys(error)[0];
			errorDescription = error[imageName];

			if (!result[imageName]) {
				result[imageName] = [];
			}
			result[imageName].push(errorDescription);
		}

		return Object.keys(result).map(function(name) {
			return {
				file    : name,
				reasons : result[name],

				status : PhotoContestHTML5UploaderController.PICTURE_STATUS.FAILED
			};
		});
	},

	/**
	 * Shows error tooltip from generated messages or the text provided in the parameter.
	 *
	 * @param text [string]
	 * @private
	 */
	_showLimitError : function(text) {
		this.uploaderContainerEl.jq().protipShow({
			title     : text + '<i class="icon-close protip-close"></i>',
			trigger   : 'sticky',
			classes   : this.cls.tooltip + ' ' + PH.cls.protipCommonClose,
			gravity   : false,
			position  : 'top',
			offsetTop : 70
		});
	},

	/** @inheritdoc */
	_prepare : function () {
		var photosReadyToUpload = this.pluginData.files.length;
		var possibleToUploadPhotos = this.options.multiLimit - this.uploadedPhotoCount;
		var errorType = this._errorMessages.UPLOAD_REACH_LIMIT;
		var errorData = {
			possibleToUploadPhotos : possibleToUploadPhotos,
			multiLimit             : this.options.multiLimit
		};

		if (possibleToUploadPhotos > 0 && photosReadyToUpload > possibleToUploadPhotos) {
			if (!this.uploadedPhotoCount) {
				errorType = this._errorMessages.UPLOAD_REACH_LIMIT_EMPTY_ALBUM;
			}

			this._addError(errorType, null, errorData);

			this.fireEvent(HTML5Uploader.EV.PREPARE_FAIL, {
				uploaderInstance : this,
				errors           : this._errors,
				abort            : true
			});

			return;
		}

		PhotoContestHTML5UploaderController.superclass._prepare.call(this);
	}
});
