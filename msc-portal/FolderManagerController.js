import Ext from '../../lib/vendor/ExtCore';
import Chaos from '../../lib/chaos/Chaos';
import Controller from '../../lib/chaos/Controller';
import Util from '../../lib/chaos/Util';

import FolderManagerView from './FolderManagerView';
import FolderManagerModel from './FolderManagerModel';

/**
 * Controls the Folder managing processes like:
 * * creating folder
 * * entering a folder [loading its content]
 * * exiting a folder  [back to the folder list]
 */
export default function FolderManagerController(el, config) {
	FolderManagerController.superclass.constructor.call(this, el, config);
}

Ext.apply(FolderManagerController, {
	EVENT_FOLDER_CONTENT_DISPLAYED : 'folder-content-displayed',
	EVENT_NEW_ALBUM_CREATE         : 'new-album-create',
	EVENT_UNOPENED_FOLDER_CREATED  : 'unopened-folder-created'
}, {});

Chaos.extend(FolderManagerController, Controller, {

	/** @var {String} mediaInputCls          Class name of title input */
	mediaInputCls : 'title_input',

	/**
	 * Initialize controller.
	 *
	 * @param {Element} el      Context element
	 * @param {Object} config   Config object of this controller
	 */
	init : function(el, config) {
		FolderManagerController.superclass.init.call(this, el, config);
		this.addEvents(
			FolderManagerController.EVENT_FOLDER_CONTENT_DISPLAYED,
			FolderManagerController.EVENT_NEW_ALBUM_CREATE,
			FolderManagerController.EVENT_UNOPENED_FOLDER_CREATED
		);
		this._setCharachterCounterOnInputFields(this.FolderManagerView.getInputFields());
	},

	/**
	 * Handles the view's folder click event.
	 *
	 * @param {Object} ev   View's event object
	 */
	onFolderClick : function(ev) {
		if (ev.folderId) {
			this.FolderManagerModel.getFolderContent(ev);
		}
		else {
			throw 'There is no folderId to get its content.';
		}
	},

	/**
	 * Handles a successful ajax request for a folder's content
	 *
	 * @param {Object} ev   Model's event object
	 */
	onGetFolderContentSuccess : function(ev) {
		var html = ev.response.json.data.content,
			folderId = ev.folderParams.folderId,
			disableMediaBar = ev.folderParams.disableMediaBar;
		this.FolderManagerView.hideTooltipsInContent();
		this.FolderManagerView.renderFolderContent(folderId, disableMediaBar, html);
		this.fireEvent(FolderManagerController.EVENT_UNOPENED_FOLDER_CREATED);
	},

	/**
	 * Handles a failed ajax request for a folder's content
	 */
	onGetFolderContentError : function() {
	},

	/**
	 * Event handler when a folder's content displayed.
	 *
	 * @param {Object} ev   FolderManagerView's event object
	 */
	onFolderContentDisplayed : function(ev) {
		this.fireEvent(FolderManagerController.EVENT_FOLDER_CONTENT_DISPLAYED, {
			scope                  : this,
			ev                     : ev,
			mediaType              : this.FolderManagerModel.mediaType,
			folderContentItemCount : this.FolderManagerView.getFolderContentItemCount()
		});
		if (ev.isNewAppendedBlock) {
			this._setCharachterCounterOnInputFields(ev.inputFields);
		}
	},

	/**
	 * Event handler when a folder list displayed.
	 *
	 * @param {Object} ev   FolderManagerView's event object
	 */
	onFolderListDisplayed : function (ev) {
		this.fireEvent(FolderManagerView.EVENT_FOLDER_LIST_DISPLAYED, {
			scope     : this,
			ev        : ev,
			mediaType : this.FolderManagerModel.mediaType
		});
	},

	/**
	 * Set charachter counter on folder input fields
	 *
	 * @method _setCharachterCounterOnInputFields
	 * @private
	 * @param {Type} argument   Description
	 *
	 * @return {Object}
	 */
	_setCharachterCounterOnInputFields : function(inputElements) {
		Util.characterCounter(inputElements, this.mediaInputCls, '');
	},

	/**
	 * Starts to create a new folder.
	 *
	 * @method createNewFolder
	 * @param {Object} folderParams   Parameters
	 *
	 * @return {Object} scope to chain
	 */
	createNewFolder : function(folderParams) {
		this.FolderManagerModel.createNewFolder(
			folderParams.params.newName,
			folderParams.parentEl,
			folderParams.csrfToken
		);
		return this;
	},

	/**
	 * Successful create folder request callback.
	 *
	 * @method onCreateFolderFolderSuccess
	 * @param {Object} ev   FolderManagerModel Event object
	 *
	 * @return void;
	 */
	onCreateFolderFolderSuccess : function(ev) {
		var _newAlbum,
			_inputField;

		_newAlbum = this.FolderManagerView.renderNewFolderBlock(ev.response.json.data.content);
		_inputField = _newAlbum.select(this.mediaInputCls.dot());

		this._setCharachterCounterOnInputFields(_inputField);
		this.FolderManagerView.toggleRequirementsBlock();

		this.FolderManagerView.resetNewFolderButton(ev.boxEl);
		this.FolderManagerView.hideTooltipsInContent();
	},

	/**
	 * Successful delete folder callback.
	 *
	 * @method onDeleteFolderFolderSuccess
	 *
	 * @return void;
	 */
	onDeleteFolderFolderSuccess : function() {
		this.FolderManagerView.toggleRequirementsBlock();
		this.checkAlertStatuses();
	},


	/**
	 * Failed create folder request callback.
	 * @param {Object} ev Event object
	 * @method onCreateFolderFolderError
	 */
	onCreateFolderFolderError : function(ev) {
		var message,
			el;

		try {
			message = ev.response.json.data;
			el = ev.boxEl;
		}
		catch (e) {
			/* develblock:start */
			console.warn('Incorrect response object structure');
			/* develblock:end */
		}

		this.FolderManagerView.showErrorTooltip(message, el);
	},

	/**
	 * Handles a click event on a tab item that will lead back to the folder lists.
	 *
	 * @return void;
	 */
	getTabContent : function() {
		this.FolderManagerModel.getTabContent();
	},

	/**
	 * Handles a click event on a show more button that will lead back to the folder lists.
	 */
	getShowMoreContent : function(page) {
		this.FolderManagerModel.getShowMoreContent(page);
	},

	/**
	 * Notifies the View to check for alerts if icons needs to be enabled/disabled.
	 *
	 * @return void;
	 */
	checkAlertStatuses : function() {
		this.FolderManagerView.checkAlertStatuses();
	},

	/**
	 * Event handler, when we start to get the tab content with ajax.
	 *
	 * @return void;
	 */
	onGetTabContentStart : function(response) {
		this.FolderManagerView.clearFolderList(response);
	},

	/**
	 * Handles a click event on a tab item that will lead back to the folder lists.
	 *
	 * @return void;
	 */
	onGetTabContentSuccess : function(response) {
		this.FolderManagerView.showFolderList(response);
	},

	/**
	 * Handles a click event on a show more button.
	 *
	 * @param response
	 */
	onShowMoreSuccess : function(response) {
		this.FolderManagerView.appendShowMoreContent(response);
		this.FolderManagerView.removeJustCreatedBlocks();
		this.fireEvent(FolderManagerModel.EVENT_SHOWMORE_SUCCESS, {});
	},

	/**
	 * Handles a click event on a tab item that will lead back to the folder lists.
	 *
	 * @return void;
	 */
	onGetTabContentError : function() {

	},

	/**
	 * Handles a click event on a show more button.
	 *
	 * @return void;
	 */
	onShowMoreError : function() {

	},

	/**
	 * Increases the item counters
	 *
	 * @param {Number} [count]   Amount to increase counters
	 * @method increaseFolderContentItemCount
	 *
	 * @return {Object}
	 */
	increaseFolderContentItemCount : function(count) {
		this.FolderManagerView.increaseFolderContentItemCount(count);
		return this;
	},

	/**
	 * Decreases the item counters
	 *
	 * @param {Number} [count]   Amount to decrease counters
	 * @method decreaseFolderContentItemCount
	 *
	 * @return {Object}
	 */
	decreaseFolderContentItemCount : function(count) {
		this.FolderManagerView.decreaseFolderContentItemCount(count);
		return this;
	}
});
