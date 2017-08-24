import Ext from '../../lib/vendor/ExtCore';
import Chaos from '../../lib/chaos/Chaos';
import ChaosObject from '../../lib/chaos/Object';
import Connection from '../../lib/chaos/Connection';
import Config from '../../lib/chaos/Config';

export default function FolderManagerModel(el, config) {
	FolderManagerModel.superclass.constructor.call(this, el, config);
}

Ext.apply(FolderManagerModel, {
	EVENT_GET_TAB_CONTENT_SUCCESS    : 'get-tab-content-success',
	EVENT_GET_TAB_CONTENT_ERROR      : 'get-tab-content-error',
	EVENT_SHOWMORE_SUCCESS           : 'showmore-success',
	EVENT_SHOWMORE_ERROR             : 'showmore-error',
	EVENT_GET_FOLDER_CONTENT_SUCCESS : 'get-folder-content-success',
	EVENT_GET_FOLDER_CONTENT_ERROR   : 'get-folder-content-error',
	EVENT_CREATE_FOLDER_SUCCESS      : 'create-folder-success',
	EVENT_CREATE_FOLDER_ERROR        : 'create-folder-error'
}, {});

Chaos.extend(FolderManagerModel, ChaosObject, {

	/** @var {String} name                          Name of the class */
	name                        : 'FolderManagerModel',
	/** @var {String} createNewFolderAjaxUrlRoute   Url route for creating new folder */
	createNewFolderAjaxUrlRoute : '',
	/** @var {String} getFoldersFreeUrlRoute        Url route for get free folders */
	getFoldersFreeUrlRoute      : '',
	/** @var {String} getFoldersPremiumUrlRoute     Url route for get premium folders */
	getFoldersPremiumUrlRoute   : '',
	/** @var {String} mediaType                     Media type */
	mediaType                   : undefined,

	/**
	 * Initialize model.
	 *
	 * @param {Element} el      Context element
	 * @param {Object} config   Config object of this controller
	 */
	init : function(el, config) {
		FolderManagerModel.superclass.init.call(this, el, config);
		this.addEvents(
			FolderManagerModel.EVENT_GET_TAB_CONTENT_SUCCESS,
			FolderManagerModel.EVENT_GET_TAB_CONTENT_ERROR,
			FolderManagerModel.EVENT_GET_FOLDER_CONTENT_SUCCESS,
			FolderManagerModel.EVENT_GET_FOLDER_CONTENT_ERROR,
			FolderManagerModel.EVENT_CREATE_FOLDER_SUCCESS,
			FolderManagerModel.EVENT_CREATE_FOLDER_ERROR
		);
		this._channelType = Config.get('channelType');
	},

	/**
	 * Returns the current media type.
	 *
	 * @method getMediaType
	 *
	 * @return {String} media type
	 */
	getMediaType : function() {
		return this.mediaType;
	},

	/**
	 * Gets by the given folder id the content of the tab via ajax.
	 *
	 * @method getTabContentRequest
	 *
	 * @returns {Object} scope to chain
	 */
	getTabContentRequest : function(callbacks, page) {
		if (typeof callbacks !== 'object') {
			/* develblock:start */
			throw 'An object must be passed in the first param, with success, error and failure keys';
			/* develblock:end */
		}

		var getFoldersUrl,
			url,
			pageNum;

		pageNum = page || 1;
		getFoldersUrl = this._channelType === 'free'
			? this.getFoldersFreeUrlRoute
			: this.getFoldersPremiumUrlRoute;
		url = Chaos.getUrl(getFoldersUrl, {}, { page : pageNum });

		Connection.Ajax.request({
			type    : Connection.TYPE_JSON,
			method  : 'GET',
			url     : url,
			scope   : this,
			success : callbacks.success,
			error   : callbacks.error,
			failure : callbacks.failure
		});
	},

	/**
	 * Loads more pages into the folder list
	 *
	 * @method getTabContent
	 *
	 * @returns {FolderManagerModel}
	 */
	getTabContent : function() {
		this.getTabContentRequest({
			success : function(response) { this._getTabContentSuccess(response) },
			error   : function(response) { this._getTabContentError(response) },
			failure : function(response) { this._getTabContentError(response) }
		});

		return this;
	},

	/**
	 * Loads more pages into the folder list by page number
	 *
	 * @method getShowMoreContent
	 *
	 * @return void
	 */
	getShowMoreContent : function(page) {
		this.getTabContentRequest({
			success : function(response) { this._getShowMoreContentSuccess(response) },
			error   : function(response) { this._getShowMoreContentError(response) },
			failure : function(response) { this._getShowMoreContentError(response) }
		}, page);
	},

	/**
	 * Successful ajax request callback.
	 *
	 * @method _getShowMoreContentSuccess
	 * @private
	 * @param {Object} response       Server response
	 */
	_getShowMoreContentSuccess : function(response) {
		this.fireEvent(FolderManagerModel.EVENT_SHOWMORE_SUCCESS, {
			scope    : this,
			response : response
		});
	},

	/**
	 * Failed ajax request callback.
	 *
	 * @method _getTabContentError
	 * @private
	 * @param {Object} response       Server response
	 */
	_getShowMoreContentError : function(response) {
		this.fireEvent(FolderManagerModel.EVENT_SHOWMORE_ERROR, {
			scope    : this,
			response : response
		});
	},

	/**
	 * Successful ajax request callback.
	 *
	 * @method _getTabContentSuccess
	 * @private
	 * @param {Object} response       Server response
	 */
	_getTabContentSuccess : function(response) {
		this.fireEvent(FolderManagerModel.EVENT_GET_TAB_CONTENT_SUCCESS, {
			scope    : this,
			response : response
		});
	},

	/**
	 * Failed ajax request callback.
	 *
	 * @method _getTabContentError
	 * @private
	 * @param {Object} response       Server response
	 */
	_getTabContentError : function(response) {
		this.fireEvent(FolderManagerModel.EVENT_GET_TAB_CONTENT_ERROR, {
			scope    : this,
			response : response
		});
	},

	/**
	 * Gets by the given folder id the content of the folder via ajax.
	 *
	 * @method getFolderContent
	 * @param {Object} folderParams   Folder's parameters [id, type]
	 *
	 * @returns {Object} scope to chain
	 */
	getFolderContent : function(folderParams) {
		Connection.Ajax.request({
			type    : Connection.TYPE_JSON,
			method  : 'GET',
			url     : folderParams.ajaxUrl,
			scope   : this,
			success : function(response) {
				this._getFolderContentSuccess(response, folderParams);
			},
			error : function(response) {
				this._getFolderContentError(response, folderParams);
			},
			failure : function(response) {
				this._getFolderContentError(response, folderParams);
			}
		});
		return this;
	},

	/**
	 * Successful ajax request callback.
	 *
	 * @method _getFolderContentSuccess
	 * @private
	 * @param {Object} response       Server response
	 * @param {Object} folderParams   Folder's parameters [id, type]
	 */
	_getFolderContentSuccess : function(response, folderParams) {
		this.fireEvent(FolderManagerModel.EVENT_GET_FOLDER_CONTENT_SUCCESS, {
			scope        : this,
			response     : response,
			folderParams : folderParams
		});
	},

	/**
	 * Failed ajax request callback.
	 *
	 * @method _getFolderContentError
	 * @private
	 * @param {Object} response       Server response
	 * @param {Object} folderParams   Folder's parameters [id, type]
	 */
	_getFolderContentError : function(response, folderParams) {
		this.fireEvent(FolderManagerModel.EVENT_GET_FOLDER_CONTENT_ERROR, {
			scope        : this,
			response     : response,
			folderParams : folderParams
		});
	},

	/**
	 * Send a request for create a new folder.
	 *
	 * @method createNewFolder
	 * @param {String} folderTitle   Title of the new folder.
	 * @param {Object} boxEl         Folder Box Ext.Element.
	 *
	 * @return {Object}
	 */
	createNewFolder : function(folderTitle, boxEl, csrf) {
		if (!folderTitle) {
			throw 'Folder title must be set the create a new folder.';
		}
		Connection.Ajax.request({
			type   : Connection.TYPE_JSON,
			method : 'POST',
			url    : Chaos.getUrl(this.createNewFolderAjaxUrlRoute),
			params : {
				csrfToken  : csrf,
				folderName : folderTitle
			},
			scope   : this,
			success : function(response) {
				this._createNewFolderSuccess(response, folderTitle, boxEl);
			},
			error : function(response) {
				this._createNewFolderError(response, folderTitle, boxEl);
			},
			failure : function(response) {
				this._createNewFolderError(response, folderTitle, boxEl);
			}
		});
		return this;
	},

	/**
	 * Successful ajax request callback of folder create.
	 *
	 * @method _createNewFolderSuccess
	 * @private
	 * @param {Object} response      Server response
	 * @param {String} folderTitle   New folder's title
	 * @param {Object} boxEl         Creator Box Element
	 */
	_createNewFolderSuccess : function(response, folderTitle, boxEl) {
		this.fireEvent(FolderManagerModel.EVENT_CREATE_FOLDER_SUCCESS, {
			scope       : this,
			response    : response,
			folderTitle : folderTitle,
			folderId    : response.json.data.folderId,
			contentUrl  : response.json.data.contentUrl,
			boxEl       : boxEl,
			mediaType   : this.mediaType
		});
	},

	/**
	 * Failed ajax request callback of folder create.
	 *
	 * @method _createNewFolderError
	 * @private
	 * @param {Object} response      Server response
	 * @param {String} folderTitle   New folder's title
	 * @param {Object} boxEl         Folder Box Ext.Element.
	 */
	_createNewFolderError : function(response, folderTitle, boxEl) {
		this.fireEvent(FolderManagerModel.EVENT_CREATE_FOLDER_ERROR, {
			scope       : this,
			response    : response,
			folderTitle : folderTitle,
			mediaType   : this.mediaType,
			boxEl       : boxEl
		});
	}
});
