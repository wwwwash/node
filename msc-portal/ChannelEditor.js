import Ext from '../../lib/vendor/ExtCore';
import Chaos from '../../lib/chaos/Chaos';
import Config from '../../lib/chaos/Config';
import ChaosObject from '../../lib/chaos/Object';
import { Broadcaster } from '../../lib/chaos/Broadcaster';

import ShowMore from '../ShowMore/ShowMore';
import NoteManagerController from './NoteManagerController';

import ChannelProgressBarComponent from './ChannelProgressBar';
import ChannelAddMedia from './ChannelAddMedia';
import ChannelCsrfModel from './ChannelCsrfModel';
import DynamicFontResizerController from './DynamicFontResizerController';
import DynamicFontResizerView from './DynamicFontResizerView';
import NoteManagerView from './NoteManagerView';
import FolderManagerView from './FolderManagerView';
import FolderManagerModel from './FolderManagerModel';
import FolderManagerController from './FolderManagerController';
import NoteManagerModel from './NoteManagerModel';
import NotificationMessage from '../Notification/NotificationMessage';
import MediaManagerController from './MediaManagerController';
import MediaManagerModel from './MediaManagerModel';
import MediaManagerView from './MediaManagerView';
import TabSwitcherController from './TabSwitcherController';
import TabSwitcherView from './TabSwitcherView';

/**
 * A messagek melle torteno file csatolast megvalosito feltolto alkalmazas frontend oldali komponense
 */

export default function ChannelEditor(el, config) {
	ChannelEditor.superclass.constructor.call(this, el, config);
}

Ext.apply(ChannelEditor, {
	MEDIA_TYPE_PHOTO                     : 'photo',
	MEDIA_TYPE_VIDEO                     : 'video',
	GLOBALEVENT_MEDIA_ITEM_CLICK         : 'media-item-click',
	GLOBALEVENT_FOLDER_CONTENT_DISPLAYED : 'global-folder-content-displayed',
	GLOBALEVENT_DELETE_MEDIA_SUCCESS     : 'delete-media-success',
	GLOBALEVENT_ROTATE_SUCCESS           : 'rotate-success',
	GLOBALEVENT_FOLDER_LIST_DISPLAYED    : 'folder-list-displayed',
	GLOBALEVENT_SHOWMORE_SUCCESS         : 'show-more-success'
}, {});

Ext.extend(ChannelEditor, ChaosObject, {

	/** @var {String} photoFolderBlockId   Id of the photos block */
	photoFolderBlockId        : 'photos_folder',
	/** @var {String} videoFolderBlockId   Id of the videos block */
	videoFolderBlockId        : 'videos_folder',
	/** @var {Object} _folderManagerControllers   FolderManagerController storage */
	_folderManagerControllers : {},
	/** @var {String}    ID of a note editor box template */
	noteEditorTemplateId      : 'add_new_note_template',
	/** @var {String}    ID of the page container */
	pageContainerId           : 'pageContainer',
	/** @var {String}    ID of show more wrapper */
	showMoreWrapperId         : 'showMoreHolder',
	/** @var {String}    Class of show more button */
	ShowMoreButtonCls         : 'showMoreButton',
	/** @var {String}    Class of showmore listblock */
	videoListBlockCls         : 'video_show_more_content',
	/** @var {String}    Class of media delete confirm btn */
	deleteConfirmBtnCls       : 'delete_confirm',

	/**
	 * Initializer.
	 * @param {Object}  el      Context element
	 * @param {Object} config   Config
	 *
	 * @return  void
	 */
	init : function(el, config) {
		this.getFolderManagerController(this.photoFolderBlockId, {
			model : {
				createNewFolderAjaxUrlRoute : 'ChannelImageFolder/Create',
				getFoldersFreeUrlRoute      : 'ChannelFreeEditorImageContent/Get',
				getFoldersPremiumUrlRoute   : 'ChannelPayingEditorImageContent/Get',
				mediaType                   : ChannelEditor.MEDIA_TYPE_PHOTO
			},
			view : {
				addMediaItemCls      : 'icon-add-photo',
				getAddMediaItemTitle : function() {
					return Chaos.translate('Add photos');
				},
				getFolderItemCountTitle : function(count) {
					return Chaos.translate('{COUNT} photos', { COUNT : count });
				}
			}
		});
		Chaos.addEvents(
			ChannelEditor.GLOBALEVENT_MEDIA_ITEM_CLICK,
			ChannelEditor.GLOBALEVENT_FOLDER_CONTENT_DISPLAYED,
			ChannelEditor.GLOBALEVENT_FOLDER_LIST_DISPLAYED,
			ChannelEditor.GLOBALEVENT_DELETE_MEDIA_SUCCESS,
			ChannelEditor.GLOBALEVENT_ROTATE_SUCCESS,
			ChannelEditor.GLOBALEVENT_SHOWMORE_SUCCESS
		);
		this.getMediaManagerController();
		this.getTabSwitcherController();
		this.getNoteManagerController();
		this.getDynamicFontResizerController();
		this.setShowMoreComponent();
		ChannelEditor.superclass.init.call(this, el, config);
	},

	/**
	 * Checks that should be the show more component on the current tab
	 *
	 * @method setShowMoreComponent
	 * @public
	 *
	 * @return void
	 */
	setShowMoreComponent : function() {
		var _showMoreEl = Ext.get(this.showMoreWrapperId);
		if (!_showMoreEl) {
			return true;
		}
		var showMoreButtons = _showMoreEl.select(this.ShowMoreButtonCls.dot());

		showMoreButtons.each(function(buttonElement) {
			if (buttonElement.dom.getAttribute('data-media-type') ===
				ChannelEditor.MEDIA_TYPE_VIDEO) {
				this._createShowMoreComponent(buttonElement);
			}
		}.bind(this));
	},

	/**
	 * Create a new ShowMore Component
	 *
	 * @method _createShowMoreComponent
	 * @public
	 * @param {Object} showMoreButton   Show more button element
	 *
	 * @return void
	 */
	_createShowMoreComponent : function(showMoreButton) {
		if (showMoreButton) {
			this._showMoreCmp = new ShowMore(
				Ext.get(this.pageContainerId),
				{
					isAppendable    : true,
					listBlockSel    : this.videoListBlockCls.dot(),
					successCallback : this.onShowMoreSuccess,
					callbackScope   : this
				});
		}
	},

	/**
	 * Gets an instance of a Note Manager Controller.
	 *
	 * @return {Object} NoteManagerController
	 */
	getNoteManagerController : function() {
		return this._setNoteManagerController();
	},

	/**
	 * Create Note Manager Controller
	 *
	 * @method _setNoteManagerController
	 * @private
	 *
	 * @return {Object} controller instance
	 */
	_setNoteManagerController : function() {
		if (!(this._noteManagerController instanceof NoteManagerController)) {
			this._noteManagerController = new NoteManagerController({
				el    : this.element,
				items : {
					NoteManagerView : {
						component : this._setNoteManagerView(),
						listeners : {
							'post-comment'       : 'onPostComment',
							'input-focus'        : 'onInputFocus',
							'start-add-new-note' : 'onStartAddNewNote'
						}
					},
					ChannelCsrfModel : {
						component : this._setCsrfModel(),
						listeners : {}
					},
					NoteManagerModel : {
						component : this._setNoteManagerModel(),
						listeners : {
							'note-post-success' : 'onNotePostSuccess',
							'note-post-failed'  : 'onNotePostFailed'
						}
					}
				}
			});
			this._noteManagerController.on(NoteManagerView.EVENT_START_ADD_NEW_NOTE,
				this.onStartAddNewNote,
				this
			);
			this._noteManagerController.on(NoteManagerController.EVENT_NOTE_POST_SUCCESS,
				this.onNotePostSuccess,
				this
			);
		}
		return this._noteManagerController;
	},

	/**
	 * Creates NoteManagerView
	 *
	 * @method _setNoteManagerView
	 * @private
	 *
	 * @return {Object} view instance
	 */
	_setNoteManagerView : function() {
		if (!(this._noteManagerView instanceof NoteManagerView)) {
			this._noteManagerView = new NoteManagerView('notes', {});
		}
		return this._noteManagerView;
	},

	/**
	 * Creates a Model for the note managing feature
	 *
	 * @method _setNoteManagerModel
	 * @private
	 *
	 * @return {Object} model instance
	 */
	_setNoteManagerModel : function() {
		if (!(this._noteManagerModel instanceof NoteManagerModel)) {
			this._noteManagerModel = new NoteManagerModel(this.element, {});
		}
		return this._noteManagerModel;
	},

	/**
	 * Callback when a new note editor opens.
	 *
	 * @method onStartAddNewNote
	 */
	onStartAddNewNote : function() {
		this.getDynamicFontResizerController().setDefaultFontSize();
	},

	/**
	 * Sends a global event about the note post success event.
	 *
	 * @method onNotePostSuccess
	 *
	 * @return void;
	 */
	onNotePostSuccess : function() {
		Chaos.fireEvent(ChannelProgressBarComponent.GLOBALEVENT_UPDATE_PROGRESSBAR, {
			scope : this
		});
	},

	/**
	 * Gets a dynamic font resizer for the note content
	 *
	 * @method getDynamicFontResizerController
	 * @return {Object} DynamicFontResizerController
	 */
	getDynamicFontResizerController : function() {
		return this._setDynamicFontResizerController();
	},

	/**
	 * Sets a dynamic font resizer for the note content
	 *
	 * @method _setDynamicFontResizerController
	 * @private
	 *
	 * @return {Object} DynamicFontResizerController
	 */
	_setDynamicFontResizerController : function() {
		if (!(this._dynamicFontResizerController instanceof DynamicFontResizerController)) {
			this._dynamicFontResizerController = new DynamicFontResizerController({
				el    : this.element,
				items : {
					DynamicFontResizerView : {
						component : this._setDynamicFontResizerView(),
						listeners : {
							'input-keydown' : 'onInputKeydown'
						}
					}
				}
			});
		}
		return this._dynamicFontResizerController;
	},

	/**
	 * Returns an instance of a DynamicFontResizerView.
	 *
	 * @return {Object} DynamicFontResizerView
	 */
	_setDynamicFontResizerView : function() {
		return new DynamicFontResizerView(this.element, {});
	},

	/**
	 * Gets an instance of a MediaManagerController.
	 *
	 * @return {Object} MediaManagerController
	 */
	getFolderManagerController : function(elementId, config) {
		return this._setFolderManagerController(elementId, config);
	},

	/**
	 * Sets an instance of a FolderManagerController.
	 *
	 * @return {Object} FolderManagerController
	 */
	_setFolderManagerController : function(elementId, config) {
		if (config && !(this._folderManagerControllers[elementId] instanceof FolderManagerController)) {
			this._folderManagerControllers[elementId] = new FolderManagerController({
				el    : elementId,
				items : {
					FolderManagerModel : {
						component : this._setFolderManagerModel(elementId, config.model),
						listeners : {
							'get-folder-content-success' : 'onGetFolderContentSuccess',
							'get-folder-content-error'   : 'onGetFolderContentError',
							'create-folder-success'      : 'onCreateFolderFolderSuccess',
							'create-folder-error'        : 'onCreateFolderFolderError',
							'get-tab-content-success'    : 'onGetTabContentSuccess',
							'get-tab-content-error'      : 'onGetTabContentError',
							'showmore-success'           : 'onShowMoreSuccess',
							'showmore-error'             : 'onShowMoreError'
						}
					},
					FolderManagerView : {
						component : this._setFolderManagerView(elementId, config.view),
						listeners : {
							'folder-click'             : 'onFolderClick',
							'folder-content-displayed' : 'onFolderContentDisplayed',
							'folder-list-displayed'    : 'onFolderListDisplayed'
						}
					}
				}
			});
			this._folderManagerControllers[elementId].on(
				FolderManagerController.EVENT_FOLDER_CONTENT_DISPLAYED,
				this.onFolderContentDisplayed,
				this
			);
			this._folderManagerControllers[elementId].on(
				FolderManagerController.EVENT_UNOPENED_FOLDER_CREATED,
				this.unopenedFolderCreated,
				this
			);
			this._folderManagerControllers[elementId].on(
				FolderManagerView.EVENT_FOLDER_LIST_DISPLAYED,
				this.onFolderListDisplayed,
				this
			);
			this._folderManagerControllers[elementId].on(
				FolderManagerModel.EVENT_SHOWMORE_SUCCESS,
				this.onShowMoreSuccess,
				this
			);
		}
		return this._folderManagerControllers[elementId];
	},

	/**
	 * When you open a folder that hasn't been opened before,
	 * it should be created. After folder loaded, It notifies the
	 * status collector to start looking for converting statuses
	 *
	 * @method unopenedFolderCreated
	 *
	 * @return void;
	 */
	unopenedFolderCreated : function() {
		Chaos.fireEvent(ChannelAddMedia.GLOBALEVENT_COLLECT_CONVERTING_MONGO_IDS);
	},

	/**
	 * Returns an instance of a FolderManagerModel.
	 *
	 * @param {String} el       Context element
	 * @param {Object} config   Configurables to override
	 *
	 * @return {Object} FolderManagerModel
	 */
	_setFolderManagerModel : function(el, config) {
		return new FolderManagerModel(el, config);
	},

	/**
	 * Returns an instance of a MediaManagerView.
	 *
	 * @param {String} el       Context element
	 * @param {Object} config   Configurables to override
	 *
	 * @return {Object} MediaManagerView
	 */
	_setFolderManagerView : function(el, config) {
		return new FolderManagerView(el, config);
	},

	/**
	 * Description
	 *
	 * @method onFolderContentDisplayed
	 * @param {Object} ev   Description
	 *
	 * @return void;
	 */
	onFolderContentDisplayed : function(ev) {
		Chaos.fireEvent(ChannelEditor.GLOBALEVENT_FOLDER_CONTENT_DISPLAYED, {
			scope                  : this,
			context                : ev.ev.context,
			mediaType              : ev.mediaType,
			folderContentItemCount : ev.folderContentItemCount
		});
	},

	/**
	 * Created a global event when listing folders inside a tab
	 *
	 * @method onFolderListDisplayed
	 *
	 * @param {Object} ev   Description
	 *
	 * @return void;
	 */
	onFolderListDisplayed : function(ev) {
		this.getFolderManagerControllerByMediaType(ev.mediaType).checkAlertStatuses();

		Chaos.fireEvent(ChannelEditor.GLOBALEVENT_FOLDER_LIST_DISPLAYED, {
			scope     : this,
			mediaType : ev.mediaType,
			ev        : ev.ev
		});
	},

	/**
	 * Description
	 *
	 * @method onFolderContentDisplayed
	 *
	 * @return void;
	 */
	onShowMoreSuccess : function() {
		Chaos.fireEvent(ChannelEditor.GLOBALEVENT_SHOWMORE_SUCCESS, {
			scope   : this,
			context : this.element
		});
	},

	/**
	 * Gets an instance of a TabSwitcherController.
	 *
	 * @return {Object} TabSwitcherController
	 */
	getTabSwitcherController : function() {
		return this._setTabSwitcherController();
	},

	/**
	 * Sets an instance of a TabSwitcherController.
	 *
	 * @return {Object} TabSwitcherController
	 */
	_setTabSwitcherController : function() {
		if (!(this._tabSwitcherController instanceof TabSwitcherController)) {
			this._tabSwitcherController = new TabSwitcherController({
				el    : this.element,
				items : {
					TabSwitcherView : {
						component : this._setTabSwitcherView(),
						listeners : {}
					}
				}
			});
		}
		return this._tabSwitcherController;
	},

	/**
	 * Returns an instance of a MediaManagerView.
	 *
	 * @return {Object} MediaManagerView
	 */
	_setTabSwitcherView : function() {
		if (!(this._tabSwitcherView instanceof TabSwitcherView)) {
			this._tabSwitcherView = new TabSwitcherView(this.element, {});
		}
		return this._tabSwitcherView;
	},

	/**
	 * Gets an instance of a MediaManagerController.
	 *
	 * @return {Object} MediaManagerController
	 */
	getMediaManagerController : function() {
		return this._setMediaManagerController();
	},

	/**
	 * Sets an instance of a MediaManagerController.
	 *
	 * @return {Object} MediaManagerController
	 */
	_setMediaManagerController : function() {
		if (!(this._mediaManagerController instanceof MediaManagerController)) {
			this._mediaManagerController = new MediaManagerController({
				el    : this.element,
				items : {
					ChannelCsrfModel : {
						component : this._setCsrfModel(),
						listeners : {}
					},
					MediaManagerModel : {
						component : this._setMediaManagerModel(),
						listeners : {}
					},
					MediaManagerView : {
						component : this._setMediaManagerView(),
						listeners : {}
					}
				}
			});
			this._mediaManagerController.on(
				MediaManagerController.EVENT_INPUT_VALUE_CHANGE,
				this.onInputValueChange,
				this
			);
			this._mediaManagerController.on(
				MediaManagerController.EVENT_INPUT_ENTER_PRESSED,
				this.onInputEnterPressed,
				this
			);
			this._mediaManagerController.on(
				MediaManagerController.EVENT_DELETE_MEDIA_SUCCESS,
				this.onDeleteMediaSuccess,
				this
			);
			this._mediaManagerController.on(
				MediaManagerController.EVENT_DELETE_MEDIA_FAILED,
				this.onDeleteMediaFailed,
				this
			);
			this._mediaManagerController.on(
				MediaManagerController.EVENT_SAVE_MEDIATITLE_FAILED,
				this.onSaveTitleFailed,
				this
			);
			this._mediaManagerController.on(
				MediaManagerController.EVENT_ROTATE_MEDIA_FAILED,
				this.onRotateMediaFailed,
				this
			);
			this._mediaManagerController.on(
				MediaManagerController.EVENT_ROTATE_MEDIA_SUCCESS,
				this.onRotateMediaSuccess,
				this
			);
		}
		return this._mediaManagerController;
	},

	/**
	 * Sends the rotated image document id to
	 *
	 * @method onRotateMediaSuccess
	 * @param idObject
	 *
	 * @return void;
	 */
	onRotateMediaSuccess : function(idObject) {
		Chaos.fireEvent(ChannelEditor.GLOBALEVENT_ROTATE_SUCCESS, { pendingIds : idObject });
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
		this.getNoteManagerController().deleteMediaSuccess();
		// Opening confirm overlay if we get an overlay url
		if (ev.confirmOverlayUrl) {
			var deleteBtnTargetEl = ev.mediaParams.targetEl;
			Config.get('overlayComponent').openOverlay(ev.confirmOverlayUrl, { targetEl : deleteBtnTargetEl });
			Config.set('isOverlayOpened', true);
		}

		if (ev.mediaParams.mediaType === 'photo' && ev.mediaParams.type !== 'folder' && ev.mediaParams.type !== null) {
			this.getFolderManagerControllerByMediaType(ev.mediaParams.mediaType).decreaseFolderContentItemCount();
		}
		else if (ev.mediaParams.type === 'folder') {
			this.getFolderManagerControllerByMediaType(ev.mediaParams.mediaType).onDeleteFolderFolderSuccess();
		}
		Chaos.fireEvent(ChannelEditor.GLOBALEVENT_DELETE_MEDIA_SUCCESS, {
			scope     : this,
			mediaType : ev.mediaParams.mediaType,
			type      : ev.mediaParams.type
		});
		Chaos.fireEvent(ChannelProgressBarComponent.GLOBALEVENT_UPDATE_PROGRESSBAR, {
			scope : this
		});
	},

	/**
	 * Callback for an unsuccessful media delete request
	 *
	 * @method onDeleteMediaSuccess
	 * @param {Object} ev    Event object
	 *
	 * @return void;
	 */
	onDeleteMediaFailed : function(ev) {
		Chaos.fireEvent(NotificationMessage.GLOBALEVENT_SHOW_NOTIFICATION_MESSAGE, {
			scope    : this,
			targetEl : ev.targetEl
		});
	},

	/**
	 * Callback for an unsuccessful save title request
	 *
	 * @method onSaveTitleFailed
	 * @param {Object} ev    Event object
	 *
	 * @return void;
	 */
	onSaveTitleFailed : function(ev) {
		var el;

		if (ev.targetEl instanceof Ext.Element) {
			el = ev.targetEl.select('.title').item(0);
		}

		Chaos.fireEvent(NotificationMessage.GLOBALEVENT_SHOW_NOTIFICATION_MESSAGE, {
			scope    : this,
			targetEl : el,
			message  : ev.message,
			icon     : 'alert',
			position : 'bottom'
		});

		// Self-remove event to hide notification on body click
		Ext.getBody().on('click', function() {
			Chaos.fireEvent(NotificationMessage.GLOBALEVENT_HIDE_NOTIFICATION_MESSAGE, {
				scope    : this,
				targetEl : ev.targetEl
			});
		}, this, { single : true });
	},

	/**
	 * Callback for an unsuccessful rotate media request
	 *
	 * @method onRotateMediaFailed
	 * @param {Object} ev    Event object
	 *
	 * @return void;
	 */
	onRotateMediaFailed : function(ev) {
		Chaos.fireEvent(NotificationMessage.GLOBALEVENT_SHOW_NOTIFICATION_MESSAGE, {
			scope    : this,
			targetEl : ev.targetEl
		});
	},

	/**
	 * Returns an instance of a ChannelCsrfModel.
	 *
	 * @return {Object} ChannelCsrfModel
	 */
	_setCsrfModel : function () {
		if (!(this._csrfModel instanceof ChannelCsrfModel)) {
			this._csrfModel = new ChannelCsrfModel(this.element, {});
		}
		return this._csrfModel;
	},

	/**
	 * Returns an instance of a MediaManagerModel.
	 *
	 * @return {Object} MediaManagerModel
	 */
	_setMediaManagerModel : function() {
		if (!(this._mediaManagerModel instanceof MediaManagerModel)) {
			this._mediaManagerModel = new MediaManagerModel(this.element, {});
		}
		return this._mediaManagerModel;
	},

	/**
	 * Returns an instance of a MediaManagerView.
	 *
	 * @return {Object} MediaManagerView
	 */
	_setMediaManagerView : function() {
		if (!(this._mediaManagerView instanceof MediaManagerView)) {
			this._mediaManagerView = new MediaManagerView(this.element, {});
		}
		return this._mediaManagerView;
	},

	/**
	 * Handler for a media input value change event.
	 *
	 * @method onInputValueChange
	 * @param {Object} ev   MediaManagerController event object
	 */
	onInputValueChange : function(ev) {
		this._createFolderTrigger(ev);
	},

	/**
	 * Handler for a media input enter pressed event.
	 *
	 * @method onInputEnterPressed
	 * @param {Object} ev   MediaManagerController event object
	 */
	onInputEnterPressed : function() {
		// Keep event handler
	},

	/**
	 * Triggers a create folder action.
	 *
	 * @param {Object} event MediaManagerController event object
	 * @private
	 */
	_createFolderTrigger : function(event) {
		var mediaType = event.mediaType,
			contentType = event.type;
		if (contentType === 'folder' && event.action === 'create_album') {
			this._startCreateNewFolder(mediaType, event);
		}
	},

	/**
	 * Starts to create a new folder
	 *
	 * @method _startCreateNewFolder
	 * @private
	 * @param {String} mediaType   Type of the current media
	 * @param {Object} params      Parameters for create a new folder
	 */
	_startCreateNewFolder : function(mediaType, params) {
		params.csrfToken = this._setCsrfModel().get();
		this.getFolderManagerControllerByMediaType(mediaType).createNewFolder(params);
	},

	/**
	 * Returns an instance of a folderManagerController by its type.
	 *
	 * @method getFolderManagerControllerByMediaType
	 * @param {String} mediaType   Media type
	 *
	 * @return {Object|undefined}
	 */
	getFolderManagerControllerByMediaType : function(mediaType) {
		var controllerId;
		switch (mediaType) {
			case ChannelEditor.MEDIA_TYPE_PHOTO:
				controllerId = this.photoFolderBlockId;
				break;
			case ChannelEditor.MEDIA_TYPE_VIDEO:
				controllerId = this.videoFolderBlockId;
				break;
		}
		if (controllerId && mediaType !== 'notes') {
			return this.getFolderManagerController(controllerId);
		}
		return undefined;
	},

	onChannelFileStatusFailed : function(ev) {
		if (ev.params.documentType !== 'folder' && ev.params.documentType !==
			ChannelEditor.MEDIA_TYPE_VIDEO) {
			this.getFolderManagerControllerByMediaType(ev.params.documentType).decreaseFolderContentItemCount();
		}
	},

	/**
	 * Callback when a file uploaded.
	 *
	 * @method onMediaUploadStart
	 * @param {Object} ev   ChannelAddMedia globalevent
	 *
	 * @return void;
	 */
	onMediaUploadStart : function(ev) {
		ev.type === 'photo'
		&& this.getFolderManagerControllerByMediaType(ev.type).increaseFolderContentItemCount(ev.uploadingFilesNumber);
	},

	/**
	 * Callback when a file frontend validation failed.
	 *
	 * @method onMediaUploadPrepareFailed
	 * @param {Object} ev   ChannelAddMedia globalevent
	 *
	 * @return void;
	 */
	onMediaUploadPrepareFailed : function(ev) {
		!ev.abort
		&& ev.type === 'photo'
		&& this.getFolderManagerControllerByMediaType(ev.type).decreaseFolderContentItemCount(ev.uploadingFilesNumber);
	},

	/**
	 * Callback when a file limit exceeded
	 *
	 * @method onMediaUploadFileLimitExceeded
	 * @param {Object} ev   ChannelAddMedia globalevent
	 *
	 * @return void;
	 */
	onMediaUploadFileLimitExceeded : function(ev) {
		this.getFolderManagerControllerByMediaType(ev.type).decreaseFolderContentItemCount(ev.uploadingFilesNumber);
	},

	/**
	 * When a medium status changed to 'pending_rotate'
	 *
	 * @method onGetRotatingItem
	 * @param {Object} docs
	 *
	 * @return void;
	 */
	onGetRotatingItem : function(docs) {
		this.getMediaManagerController().handleMediaRotationClass(docs.documentId, 'add');
	},

	/**
	 * When a medium status changed to 'enabled' from 'pending_rotate'
	 *
	 * @method onRotationFinished
	 * @param {Object} documentObj
	 *
	 * @return void;
	 */
	onRotationFinished : function(documentObj) {
		this.getMediaManagerController().handleMediaRotationClass(documentObj.mongoId);
	},

	/**
	 * Handles a click event on a tab item that will lead back to the folder lists.
	 *
	 * @return void;
	 */
	onTabItemClick : function(ev) {
		var targetId = ev.target.id.split('_')[0],
			folderManagerController;

		if (ev.contentId === this.photoFolderBlockId) {
			folderManagerController = this.getFolderManagerControllerByMediaType(targetId);
			folderManagerController.getTabContent(ev.contentId);
		}
	},

	/**
	 * Handles a click event on Show more btn
	 *
	 * @return void;
	 */
	onShowMoreBtnClick : function(ev) {
		var folderManagerController = this.getFolderManagerControllerByMediaType(ev.mediaType),
			page = ev.target.getAttribute('data-page');
		folderManagerController.getShowMoreContent(page);
	},

	/**
	 * Attach initial event handlers.
	 */
	bind : function() {
		ChannelEditor.superclass.bind.call(this);
		Broadcaster.on(
			ChannelAddMedia.GLOBALEVENT_UPLOAD_START,
			this.onMediaUploadStart, this
		);
		Broadcaster.on(
			ChannelAddMedia.GLOBALEVENT_UPLOAD_PREPARE_FAILED,
			this.onMediaUploadPrepareFailed, this
		);
		Broadcaster.on(
			ChannelAddMedia.GLOBALEVENT_FILE_LIMIT_EXCEEDED,
			this.onMediaUploadFileLimitExceeded, this
		);
		Broadcaster.on(
			ChannelAddMedia.GLOBALEVENT_CHANNEL_FILE_STATUS_FAILED,
			this.onChannelFileStatusFailed, this
		);
		Broadcaster.on(
			ChannelAddMedia.GLOBALEVENT_SEND_ROTATING_ITEM,
			this.onGetRotatingItem,
			this
		);
		Broadcaster.on(
			ChannelAddMedia.GLOBALEVENT_ROTATION_FINISHED,
			this.onRotationFinished,
			this
		);
		Broadcaster.on(
			TabSwitcherView.EVENT.ON_TAB_CLICK,
			this.onTabItemClick,
			this
		);
		Broadcaster.on(
			FolderManagerView.EVENT_SHOWMORE_CLICK,
			this.onShowMoreBtnClick,
			this
		);
	},

	/**
	 * Detach initial event handlers.
	 */
	unbind : function() {
		this.autoUnbind();
	}
});
