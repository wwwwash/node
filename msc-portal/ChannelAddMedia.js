import Ext from '../../lib/vendor/ExtCore';
import Chaos from '../../lib/chaos/Chaos';
import ChaosObject from '../../lib/chaos/Object';
import { Broadcaster } from '../../lib/chaos/Broadcaster';
import Config from '../../lib/chaos/Config';

import HTML5Uploader from '../_Uploader5/HTML5Uploader';
import ChannelHTML5UploaderController from '../_Uploader5/Channel-HTML5UploaderController';
import NotificationMessage from '../Notification/NotificationMessage';
import UploaderView from './UploaderView';
import TabSwitcherView from './TabSwitcherView';
import StatusCollectorController from './StatusCollectorController';
import MWHDocumentStatusCheckerController from './MWHDocumentStatusCheckerController';
import MWHDocumentStatusCheckerModel from './MWHDocumentStatusCheckerModel';
import ChannelProgressBarComponent from './ChannelProgressBar';
import ChannelEditorComponent from './ChannelEditor';

/**
 * ChannelOverlayAddPhotosComponent
 */
export default function ChannelAddMediaComponent(el, config) {
	ChannelAddMediaComponent.superclass.constructor.call(this, el, config);
}

ChannelAddMediaComponent.GLOBALEVENT_UPLOAD_COMPLETE = 'channel-upload-complete';
ChannelAddMediaComponent.GLOBALEVENT_ALL_UPLOAD_COMPLETE = 'all-upload-complete';
ChannelAddMediaComponent.GLOBALEVENT_UPLOAD_FAILED = 'channel-upload-failed';
ChannelAddMediaComponent.GLOBALEVENT_UPLOAD_PREPARE_FAILED = 'channel-upload-prepare-failed';
ChannelAddMediaComponent.GLOBALEVENT_CHANNEL_CONVERTED_IMAGE_SUCCESS = 'channel-converted-image-success';
ChannelAddMediaComponent.GLOBALEVENT_CHANNEL_CONVERTED_IMAGE_FAILED = 'channel-converted-image-failed';
ChannelAddMediaComponent.GLOBALEVENT_CHANNEL_FILE_STATUS_ENABLED = 'channel-file-status-enabled';
ChannelAddMediaComponent.GLOBALEVENT_CHANNEL_FILE_STATUS_FAILED = 'channel-file-status-failed';
ChannelAddMediaComponent.GLOBALEVENT_ALL_FILE_CONVERT_REQUESTED = 'all-file-convert-requested';
ChannelAddMediaComponent.GLOBALEVENT_UPLOAD_START = 'channel-upload-start';
ChannelAddMediaComponent.GLOBALEVENT_UPLOADED_MEDIA_DISPLAYED = 'uploaded-media-displayed';
ChannelAddMediaComponent.GLOBALEVENT_SEND_UPLOAD_DATA_FAILED = 'send-upload-data-failed';
ChannelAddMediaComponent.GLOBALEVENT_GET_DATA_FOR_POST = 'get-data-for-post';
ChannelAddMediaComponent.GLOBALEVENT_NEW_CONTENT_ADDED = 'new-content-added';
ChannelAddMediaComponent.GLOBALEVENT_STATUS_GETS_ENABLED = 'status-gets-enabled';
ChannelAddMediaComponent.LOADING_TEMPLATE_TYPE = 'loadingTemplate';
ChannelAddMediaComponent.GLOBALEVENT_COLLECT_CONVERTING_MONGO_IDS = 'collect-converting-mongo-ids';
ChannelAddMediaComponent.GLOBALEVENT_SEND_ROTATING_ITEM = 'send-rotating-item';
ChannelAddMediaComponent.GLOBALEVENT_ROTATION_FINISHED = 'rotating-finished';
ChannelAddMediaComponent.GLOBALEVENT_CHANNEL_ALL_FILE_STATUS_ENABLED = 'channel-all-file-status-enabled';
ChannelAddMediaComponent.GLOBALEVENT_FILE_LIMIT_EXCEEDED = 'channel-file-limit-exceeded';


Chaos.extend(ChannelAddMediaComponent, ChaosObject, {

	/** @var {String}    Image uploader flash vars Url. */
	imageUploaderFlashVarsUrl    : 'ChannelImageUploaderFlashVars/Get',
	/** @var {String}    Video uploader flash vars Url. */
	videoUploaderFlashVarsUrl    : 'ChannelUploaderFlashVars/GetVideoUploaderFlashVars',
	/** @var {String}    Flash Object id for image uplader. */
	imageUploaderObjectId        : 'image_uploader_container',
	/** @var {String}    Main container element ID of the media boxes */
	uploadingMediaBoxContainerId : 'pageContainer',
	/** @var {String}    ID of a loading media box template */
	loadingMediaBoxTemplateId    : 'image_loading_box_template',
	/** @var {String}    ID of UpLoading media box template */
	uploadingMediaBoxTemplateId  : 'image_uploading_box_template',
	/** @var {String}    ID of a failed media box template */
	failedMediaBoxTemplateId     : 'failed_image_box_template',
	/** @var {String}    ID of an already loaded media box template */
	mediaBoxTemplateId           : 'image_box_template',
	/** @var {String}    ID of an uploader box template */
	uploaderBoxTemplateId        : 'uploader_image_box_template',

	/** @var {String}    Element id for an uploader view layer. */
	uploaderViewElementId   : 'pageContainer',
	/** @var {Number}    Id of a hidden input field to store the selected folder's name. */
	hiddenFolderNameInputId : 'folder_name',
	/** @var {String}           photos folder id */
	photosFolderId          : 'photos_folder',
	/** @var {String}           Videos folder id */
	videosFolderId          : 'videos_folder',
	/** @var {String}           Includes photo & image uploader controllers */
	_uploaderControllers    : {},

	/** @var {String}           Name of image uploader controller */
	imageUploaderControllerName : 'ImageUploaderController',
	/** @var {String}           Name of video uploader controller */
	videoUploaderControllerName : 'VideoUploaderController',

	/** @var {Number}    Number of simultaneously uploading files */
	_selectedFileNumber : 0,
	/** @var {Boolean}   Upload to album */
	_addPhotoToAlbum    : false,

	/**
	 * Standard init function
	 *
	 * @param {Object} el
	 * @param {Object} config
	 *
	 * @return void
	 */
	init : function(el, config) {
		ChannelAddMediaComponent.superclass.init.call(this, el, config);
		Chaos.addEvents(
			ChannelAddMediaComponent.GLOBALEVENT_UPLOAD_COMPLETE,
			ChannelAddMediaComponent.GLOBALEVENT_UPLOAD_FAILED,
			ChannelAddMediaComponent.GLOBALEVENT_UPLOAD_PREPARE_FAILED,
			ChannelAddMediaComponent.GLOBALEVENT_CHANNEL_CONVERTED_IMAGE_SUCCESS,
			ChannelAddMediaComponent.GLOBALEVENT_CHANNEL_FILE_STATUS_FAILED,
			ChannelAddMediaComponent.GLOBALEVENT_CHANNEL_CONVERTED_IMAGE_FAILED,
			ChannelAddMediaComponent.GLOBALEVENT_ALL_FILE_CONVERT_REQUESTED,
			ChannelAddMediaComponent.GLOBALEVENT_UPLOAD_START,
			ChannelAddMediaComponent.GLOBALEVENT_UPLOADED_MEDIA_DISPLAYED,
			ChannelAddMediaComponent.GLOBALEVENT_ALL_UPLOAD_COMPLETE,
			ChannelAddMediaComponent.GLOBALEVENT_GET_DATA_FOR_POST,
			ChannelAddMediaComponent.GLOBALEVENT_NEW_CONTENT_ADDED,
			ChannelAddMediaComponent.GLOBALEVENT_SEND_ROTATING_ITEM,
			ChannelAddMediaComponent.GLOBALEVENT_ROTATION_FINISHED,
			ChannelAddMediaComponent.GLOBALEVENT_CHANNEL_FILE_STATUS_ENABLED,
			ChannelAddMediaComponent.GLOBALEVENT_CHANNEL_ALL_FILE_STATUS_ENABLED,
			ChannelAddMediaComponent.GLOBALEVENT_FILE_LIMIT_EXCEEDED
		);
		this.getMediaUploadController({
			el        : Ext.get(this.videosFolderId),
			name      : this.videoUploaderControllerName,
			items     : this._getMediaControllerItems(this.videosFolderId),
			mediaType : 'video',
			url       : Config.get('MWHMediaUploadURL'),
			tokenUrl  : Chaos.getUrl('ChannelVideoUploadToken/Get'),
			validate  : Config.get('ChannelVideoValidation')
		});
		this.getStatusCollectorController();
		this.getConvertingMongoIds();
	},

	/**
	 * Gets items under converting by calling the status checker controller
	 *
	 * @method getConvertingMongoIds
	 *
	 * @return void;
	 */
	getConvertingMongoIds : function() {
		this.getStatusCollectorController().collectPendingMongoIds();
	},

	/**
	 * Gets an instance of Status Checker controller
	 *
	 * Responsible for scanning the dom for blocks under converting after
	 * page load + folder change
	 *
	 * @method getStatusCollectorController
	 *
	 * @return {object} instance of Status Checker Controller
	 */
	getStatusCollectorController : function() {
		return this._setStatusCollectorController();
	},

	/**
	 * Instantiate a status checker controller
	 *
	 * @method _setStatusCollectorController
	 *
	 * @return {Object} controller instance
	 */
	_setStatusCollectorController : function() {
		if (!(this._StatusCollectorController instanceof StatusCollectorController)) {
			this._StatusCollectorController = new StatusCollectorController({
				items : {}
			});
			this._StatusCollectorController.on(
				StatusCollectorController.EVENT_PENDING_IDS_COLLECTED,
				this.startCheckingConvertingItems,
				this
			);
		}
		return this._StatusCollectorController;
	},

	/**
	 * Starts status checking with MWH
	 *
	 * @method startChecking
	 * @param {Array}   ev    Array of pending status id-s
	 *
	 * @return void;
	 */
	startCheckingConvertingItems : function(ev) {
		this.getMWHDocumentStatusCheckerController().addStatusesToCheck(ev.pendingIds);
	},

	/**
	 * Stops the MWH status checking
	 *
	 * @return void;
	 */
	stopCheckingConvertingItems : function() {
		this.getMWHDocumentStatusCheckerController().resetCounters();
	},

	/**
	 * Creates Image Uploader Controller
	 *
	 * @method _setMediaUploadController
	 * @private
	 *
	 * @return {Object} controller instance
	 */
	_setMediaUploadController : function(uploaderConfig) {
		var el;
		var controller = this._uploaderControllers[uploaderConfig.type];
		controller && controller.destroy();
		el = uploaderConfig.el.select('.uploader5').item(0);
		el = el || uploaderConfig.el;
		controller = new ChannelHTML5UploaderController(el, uploaderConfig);
		this._uploaderControllers[uploaderConfig.mediaType] = controller;
		this._bindMediaUploader(controller);
		return controller;
	},

	/**
	 * Returns an instance of an uploaderController if it is stored with the given type.
	 *
	 * @method getMediaUploaderControllerByType
	 * @param {String} type   Media type
	 *
	 * @return {Object|undefined}
	 */
	getMediaUploaderControllerByType : function(type) {
		return this._uploaderControllers[type];
	},

	/**
	 * When media template is ready for photos,
	 * it forwards the template to the controller
	 *
	 * @method onMediaTemplateReady
	 * @param {Object} ev    Event Object
	 *
	 *
	 * @return void;
	 */
	onMediaTemplateReady : function(ev) {
		if (ev.templateType !== ChannelAddMediaComponent.LOADING_TEMPLATE_TYPE) {
			Chaos.fireEvent(
				ChannelAddMediaComponent.GLOBALEVENT_UPLOADED_MEDIA_DISPLAYED, {
					scope : this
				}
			);
		}
	},

	/**
	 * Returns the uploader controller items settings (model, view)
	 * // TODO ez szerintem nem getel sosem, csak set-el (set-ben csak return new van)
	 * @method _getMediaControllerItems
	 * @private
	 *
	 * @return {Object}
	 */
	_getMediaControllerItems : function(elementId) {
		return {
			UploaderView : {
				component : this._setMediaUploaderView(elementId)
			}
		};
	},

	/**
	 * Creates Uploader View
	 *
	 * @method _setMediaUploaderView
	 * @param {String}    elementId    this.element.id
	 * @private
	 *
	 * @return {Object} view instance
	 */
	_setMediaUploaderView : function(elementId) {
		var viewElement = Ext.get(elementId);
		return new UploaderView(elementId, {
			mediaBoxContainerEl : Ext.get(this.uploadingMediaBoxContainerId),
			loadingMediaBoxTpl  : new Ext.Template(viewElement.select('.' +
			this.loadingMediaBoxTemplateId).item(0).dom.innerHTML),
			uploadingMediaBoxTpl : new Ext.Template(viewElement.select('.' +
			this.uploadingMediaBoxTemplateId).item(0).dom.innerHTML),
			failedMediaBoxTpl : new Ext.Template(viewElement.select('.' +
			this.failedMediaBoxTemplateId).item(0).dom.innerHTML),
			mediaBoxTpl : new Ext.Template(viewElement.select('.' +
			this.mediaBoxTemplateId).item(0).dom.innerHTML),
			uploaderBoxTpl : new Ext.Template(viewElement.select('.' +
			this.uploaderBoxTemplateId).item(0).dom.innerHTML)
		});
	},

	/**
	 * Gets an image uploader controller instance
	 *
	 * @method getMediaUploadController
	 * @param {Object} uploaderConfig UploaderConfig
	 * @public
	 *
	 * @return {Object}
	 */
	getMediaUploadController : function(uploaderConfig) {
		return this._setMediaUploadController(uploaderConfig);
	},

	/**
	 * Binds to the controller listeners
	 *
	 * @method _bindMediaUploader
	 * @private
	 *
	 * @param {Object} controllerInstance   Instance of a controller
	 *
	 * @return void;
	 */
	_bindMediaUploader : function(controllerInstance) {
		controllerInstance.on(
			HTML5Uploader.EV.DONE,
			this.onMediaUploadComplete,
			this
		);
		controllerInstance.on(
			HTML5Uploader.EV.GET_TOKENS_OK,
			this.onMediaUploadStart,
			this
		);
		controllerInstance.on(
			ChannelHTML5UploaderController.EVENT_UPLOADED_MEDIA_DISPLAYED,
			this.onUploadedMediaDisplayed,
			this
		);
		controllerInstance.on(
			ChannelHTML5UploaderController.EVENT_ON_MEDIA_TEMPLATE_READY,
			this.onMediaTemplateReady,
			this
		);
		controllerInstance.on(
			ChannelHTML5UploaderController.EVENT_ALL_UPLOAD_COMPLETE,
			this.onAllUploadComplete,
			this
		);
	},

	/**
	 * Fires when an uploaded media elem has appended to DOM and displayed by the uploader view
	 *
	 * @method onUploadedMediaDisplayed
	 * @param {Object} ev   Event object
	 *
	 * @return void;
	 */
	onUploadedMediaDisplayed : function(ev) {
		Chaos.fireEvent(ChannelAddMediaComponent.GLOBALEVENT_UPLOADED_MEDIA_DISPLAYED, {
			type       : ev.type,
			elementId  : ev.id,
			documentId : ev.documentId,
			scope      : this
		});
	},

	/**
	 * Sets a controller for mwh document checking
	 *
	 * @method _setMWHDocumentStatusCheckerController
	 * @private
	 *
	 * @return {Object} instance of MWH Document Status Checker Controller
	 */
	_setMWHDocumentStatusCheckerController : function() {
		if (!(this._MWHDocumentStatusCheckerController instanceof MWHDocumentStatusCheckerController)) {
			this._MWHDocumentStatusCheckerController = new MWHDocumentStatusCheckerController({
				items : {
					MWHDocumentStatusCheckerModel : {
						component : this._setMWHDocumentStatusCheckerModel(),
						listeners : {
							'get-document-status-success' : 'onGetDocumentStatusSuccess'
						}
					}
				}
			});
			this._MWHDocumentStatusCheckerController.on(
				MWHDocumentStatusCheckerController.EVENT_FILE_CONVERT_FAILED,
				this.onFileStatusFailed, this
			);
			this._MWHDocumentStatusCheckerController.on(
				MWHDocumentStatusCheckerController.EVENT_CONTENT_STATUS_ENABLED,
				this.onContentStatusEnabled, this
			);
			this._MWHDocumentStatusCheckerController.on(
				MWHDocumentStatusCheckerController.EVENT_ALL_FILE_STATUS_READY,
				this.onAllContentStatusEnabled, this
			);
			this._MWHDocumentStatusCheckerController.on(
				MWHDocumentStatusCheckerController.FILE_PENDING_ROTATE,
				this.onPendingRotate, this
			);
		}
		return this._MWHDocumentStatusCheckerController;
	},

	/**
	 * When image is rotating it sends the object of them
	 * to ChannelEditorComponent
	 *
	 * @method onPendingRotate
	 * @param {Object} docs
	 *
	 * @return void;
	 */
	onPendingRotate : function(docs) {
		Chaos.fireEvent(ChannelAddMediaComponent.GLOBALEVENT_SEND_ROTATING_ITEM, docs);
	},

	/**
	 * When content status gets enabled,
	 * it appends an enabled media box
	 *
	 * @method onContentStatusEnabled
	 * @param {ev} ev    Event object
	 *
	 * return void;
	 */
	onContentStatusEnabled : function(ev) {
		if (this._uploaderControllers[ev.documentType]) {
			this._uploaderControllers[ev.documentType].createEnabledMediaBox(ev);
		}
		Chaos.fireEvent(ChannelAddMediaComponent.GLOBALEVENT_ROTATION_FINISHED, {
			scope   : this,
			mongoId : ev.documentId
		});
	},

	/**
	 * When content status gets enabled,
	 * it appends an enabled media box
	 *
	 * @method onContentStatusEnabled
	 *
	 * return void;
	 */
	onAllContentStatusEnabled : function() {
		Chaos.fireEvent(ChannelAddMediaComponent.GLOBALEVENT_CHANNEL_ALL_FILE_STATUS_ENABLED, {
			scope : this
		});
		Chaos.fireEvent(ChannelProgressBarComponent.GLOBALEVENT_UPDATE_PROGRESSBAR, {
			scope : this
		});
	},

	/**
	 * Returns an mwh document checker controller
	 *
	 * @method getMWHDocumentStatusCheckerController
	 * @public
	 *
	 * @return {Object} controller instance
	 */
	getMWHDocumentStatusCheckerController : function() {
		return this._setMWHDocumentStatusCheckerController();
	},

	/**
	 * Sets a model layer for the mwh document checker
	 *
	 * @method _setMWHDocumentStatusCheckerModel
	 * @private
	 *
	 * @return {Object}
	 */
	_setMWHDocumentStatusCheckerModel : function() {
		if (!(this._MWHDocumentStatusCheckerModel instanceof MWHDocumentStatusCheckerModel)) {
			this._MWHDocumentStatusCheckerModel = new MWHDocumentStatusCheckerModel(this.element, {
				mediaDocumentStatusUrlRoute : 'ChannelDocumentStatus/GetStatuses'
			});
		}
		return this._MWHDocumentStatusCheckerModel;
	},

	confirmOnPageExit : function (ev) {
		var confirmMsg = Chaos.translate('Your upload is incomplete. Do you want to leave without finishing?');
		if (ev) {
			ev.browserEvent.returnValue = confirmMsg;
		}
		return confirmMsg;
	},

	/**
	 * Fires when uploading process starts.
	 *
	 * @method onMediaUploadStart
	 * @param {Object} ev   Event object
	 *
	 * @return void;
	 */
	onMediaUploadStart : function(ev) {
		Ext.EventManager.on(window, 'beforeunload', this.confirmOnPageExit, this);
		this._selectedFileNumber = ev.uploaderInstance.pluginDatas.length;
		Chaos.fireEvent(ChannelAddMediaComponent.GLOBALEVENT_UPLOAD_START, {
			params               : ev.params,
			type                 : ev.uploaderInstance.config.mediaType,
			uploadingFilesNumber : ev.uploaderInstance.pluginDatas.length
		});
		try {
			this.getMWHDocumentStatusCheckerController()
				.setAllSelectedFileNumber(ev.uploaderInstance.pluginDatas.length);
		}
		catch (e) {
			console.trace(e);
		}
	},

	/**
	 * Fires when a whole uploading process has finished.
	 *
	 * @method onAllUploadComplete
	 *
	 * @return void;
	 */
	onAllUploadComplete : function() {
		Ext.EventManager.un(window, 'beforeunload', this.confirmOnPageExit, this);

		Chaos.fireEvent(ChannelAddMediaComponent.GLOBALEVENT_ALL_UPLOAD_COMPLETE, { scope : this });
	},

	/**
	 * Complete media file upload.
	 *
	 * @method onMediaUploadComplete
	 * @param {Object} ev
	 *
	 * @return void;
	 */
	onMediaUploadComplete : function(ev) {
		if (!ev.formData) { return }

		this.getMWHDocumentStatusCheckerController().addFilesToCheck({
			documents          : [ev.formData.mongo],
			selectedFileNumber : 1,
			documentType       : ev.formData.type
		});
		Chaos.fireEvent(ChannelAddMediaComponent.GLOBALEVENT_UPLOAD_COMPLETE, {
			scope      : this,
			params     : ev,
			documentId : ev.formData.mongo,
			token      : ev.formData.token,
			type       : ev.formData.type,
			fileIndex  : ev.fileIndex
		});
	},

	/**
	 * Called when uploading fails.
	 *
	 * Failed media file upload
	 *
	 * @method onMediaUploadFailed
	 * @param {Object} ev
	 *
	 * @return void;
	 */
	onMediaUploadFailed : function(ev) {
		Chaos.fireEvent(ChannelAddMediaComponent.GLOBALEVENT_UPLOAD_FAILED, {
			scope : this,
			ev    : ev
		});
	},

	/**
	 * Done image converting
	 *
	 * method onConvertedMediaSuccess
	 * @param {Object} params
	 * @public
	 *
	 * @return void
	 */
	onConvertedMediaSuccess : function(params) {
		Chaos.fireEvent(ChannelAddMediaComponent.GLOBALEVENT_CHANNEL_CONVERTED_IMAGE_SUCCESS, {
			convertedImageUrl : params.convertedImageUrl,
			contentId         : params.contentId,
			scope             : this
		});
	},

	/**
	 * Handler for an event when getting file status has failed.
	 *
	 * @method onFileConverted
	 * @param {Object} params   Returns the document id of the failed file
	 *
	 * @return void;
	 */
	onFileStatusFailed : function(params) {
		this.getMediaUploaderControllerByType(params.documentType).onGetConvertedFileFailed(params);
		Chaos.fireEvent(ChannelAddMediaComponent.GLOBALEVENT_CHANNEL_FILE_STATUS_FAILED, {
			params : params,
			scope  : this
		});
	},

	/**
	 * Converted Image Failed
	 *
	 * @public
	 * @return void
	 */
	onConvertedMediaFailed : function() {
		Chaos.fireEvent(ChannelAddMediaComponent.GLOBALEVENT_CHANNEL_CONVERTED_IMAGE_FAILED, {
			scope : this
		});
	},

	/**
	 * Callback when a folder
	 *
	 * @method onFolderContentDisplayed
	 *
	 * @return void
	 */
	onFolderContentDisplayed : function() {
		this.getMediaUploadController({
			el         : Ext.get(this.photosFolderId),
			name       : this.imageUploaderControllerName,
			items      : this._getMediaControllerItems(this.photosFolderId),
			mediaType  : 'photo',
			url        : Config.get('MWHMediaUploadURL'),
			tokenUrl   : Chaos.getUrl('ChannelImageUploadToken/Get'),
			validate   : Config.get('ChannelPhotoValidation'),
			multiLimit : 50
		});
	},

	/**
	 * Callback when a folder
	 *
	 * @method onDeleteMediaSuccess
	 *
	 * @return void
	 */
	onDeleteMediaSuccess : function() {
		var uploaderController = this.getMediaUploaderControllerByType('photo');

		if (uploaderController) {
			uploaderController.enableInput();
		}
	},

	/**
	 * Callback if file limit exceeded
	 *
	 * @method onFileLimitExceededError
	 * @param {Object} ev   Description
	 *
	 * @return void
	 */
	onFileLimitExceededError : function(ev) {
		// Globalevent to communicate with other components
		Chaos.fireEvent(ChannelAddMediaComponent.GLOBALEVENT_FILE_LIMIT_EXCEEDED, {
			scope                : this,
			type                 : 'photo',
			uploadingFilesNumber : ev.uploadingFilesNumber
		});
		// Globalevent to open a notification
		Chaos.fireEvent(NotificationMessage.GLOBALEVENT_SHOW_NOTIFICATION_MESSAGE, {
			scope    : this,
			targetEl : ev.targetEl,
			message  : ev.message,
			position : ev.position || 'bottom'
		});
	},

	/**
	 * Callback when tab was clicked.
	 *
	 * @method onTabItemClick
	 * @public
	 * @param {Object} ev   Click event object
	 *
	 * @return void
	 */
	onTabItemClick : function(ev) {
		this.stopCheckingConvertingItems();
		if (ev.contentId === this.videosFolderId) {
			Chaos.fireEvent(ChannelAddMediaComponent.GLOBALEVENT_COLLECT_CONVERTING_MONGO_IDS);
		}
	},

	/**
	 * Binds the initial event handlers
	 *
	 * @return void
	 */
	bind : function() {
		ChannelAddMediaComponent.superclass.bind.call(this);
		Broadcaster.on(
			ChannelAddMediaComponent.GLOBALEVENT_COLLECT_CONVERTING_MONGO_IDS,
			this.getConvertingMongoIds,
			this
		);
		Broadcaster.on(
			ChannelEditorComponent.GLOBALEVENT_FOLDER_CONTENT_DISPLAYED,
			this.onFolderContentDisplayed,
			this
		);
		Broadcaster.on(
			ChannelEditorComponent.GLOBALEVENT_DELETE_MEDIA_SUCCESS,
			this.onDeleteMediaSuccess,
			this
		);
		Broadcaster.on(
			ChannelEditorComponent.GLOBALEVENT_ROTATE_SUCCESS,
			this.startCheckingConvertingItems,
			this
		);
		Broadcaster.on(
			TabSwitcherView.EVENT.ON_TAB_CLICK,
			this.onTabItemClick,
			this
		);
	},

	/**
	 * Unbinds all event handlers
	 *
	 * @return void
	 */
	unbind : function() {
		ChannelAddMediaComponent.superclass.unbind.call(this);
		this.autoUnbind();
	}
});
