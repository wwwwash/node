import Ext from '../../lib/vendor/ExtCore';
import Chaos from '../../lib/chaos/Chaos';
import ChaosObject from '../../lib/chaos/Object';
import Connection from '../../lib/chaos/Connection';

export default function MediaManagerModel(el, config) {
	MediaManagerModel.superclass.constructor.call(this, el, config);
}

Ext.apply(MediaManagerModel, {
	EVENT_SAVE_MEDIATITLE_SUCCESS : 'save-mediatitle-success',
	EVENT_SAVE_MEDIATITLE_FAILED  : 'save-mediatitle-failed',
	EVENT_DELETE_MEDIA_SUCCESS    : 'delete-media-success',
	EVENT_DELETE_MEDIA_FAILED     : 'delete-media-failed',
	EVENT_ROTATE_MEDIA_SUCCESS    : 'rotate-media-success',
	EVENT_ROTATE_MEDIA_FAILED     : 'rotate-media-failed'
});

Chaos.extend(MediaManagerModel, ChaosObject, {

	/** @var {String} imageSaveTitleUrl    url of save photo title service */
	imageSaveTitleUrl  : 'ChannelMediaTitleEditor/ChangeTitle',
	/** @var {String} videoSaveTitleUrl    url of save video title service */
	videoSaveTitleUrl  : 'ChannelMediaTitleEditor/ChangeTitle',
	/** @var {String} folderSaveTitleUrl   url of save folder title service */
	folderSaveTitleUrl : 'ChannelFolderEditor/ChangeTitle',
	/** @var {String} mediaDeleteUrl       url of media delete service */
	mediaDeleteUrl     : 'ChannelDeleteDocument/Delete',
	/** @var {String} folderDeleteUrl      url of folder delete service */
	folderDeleteUrl    : 'ChannelFolderEditor/Delete',
	/** @var {String} imageRotateUrl       url of image rotate service */
	imageRotateUrl     : 'ChannelImageRotation/Rotate',
	/** @var {Object} mediaType            Object of media types */
	mediaType          : {
		photo  : 'photo',
		video  : 'video',
		note   : 'note',
		folder : 'folder'
	},

	/**
	 * Init
	 *
	 * @param {Element} el      Context element
	 * @param {Object} config   Config object of this controller
	 */
	init : function(el, config) {
		MediaManagerModel.superclass.init.call(this, el, config);
		this.addEvents(
			MediaManagerModel.EVENT_SAVE_MEDIATITLE_SUCCESS,
			MediaManagerModel.EVENT_SAVE_MEDIATITLE_FAILED,
			MediaManagerModel.EVENT_DELETE_MEDIA_SUCCESS,
			MediaManagerModel.EVENT_DELETE_MEDIA_FAILED,
			MediaManagerModel.EVENT_ROTATE_MEDIA_SUCCESS,
			MediaManagerModel.EVENT_ROTATE_MEDIA_FAILED
		);
	},

	/**
	 * Save title via ajax.
	 *
	 * @method saveTitle
	 * @public
	 *
	 * @param {Object} config     ajax params
	 *
	 * @return {Object} scope to chain
	 */
	saveTitle : function(config) {
		var url;
		if (config.type !== this.mediaType.folder) {
			if (config.mediaType === this.mediaType.photo) {
				url = Chaos.getUrl(this.imageSaveTitleUrl);
			}
			else if (config.mediaType === this.mediaType.video) {
				url = Chaos.getUrl(this.videoSaveTitleUrl);
			}
			else {
				return false;
			}
		}
		else if (config.action !== 'create_album') {
			url = Chaos.getUrl(this.folderSaveTitleUrl, { folderId : config.id });
		}
		else {
			return false;
		}

		Connection.Ajax.request({
			type    : Connection.TYPE_JSON,
			method  : 'post',
			url     : url,
			params  : config.params,
			scope   : this,
			success : function(response) {
				this._saveTitleSuccess(response, config.id, config.params.newName, config.inputEl);
			},
			error : function(response) {
				this._saveTitleError(response, config.parentEl);
			},
			failure : function(response) {
				this._saveTitleError(response, config.parentEl);
			}
		});

		return this;
	},

	/**
	 * Callback for a successful change media title request
	 *
	 * @method _saveTitleSuccess
	 * @private
	 *
	 * @param {Object} response   Server response
	 * @param {String} mediaId    media id
	 * @param {String} newName    new title
	 * @param {Object} inputEl    title input element
	 *
	 * @return void;
	 */
	_saveTitleSuccess : function(response, mediaId, newName, inputEl) {
		this.fireEvent(
			MediaManagerModel.EVENT_SAVE_MEDIATITLE_SUCCESS,
			{ scope : this, response, mediaId, newName, inputEl }
		);
	},

	/**
	 * Callback for a failed change media title request
	 *
	 * @method _saveTitleSuccess
	 * @private
	 *
	 * @param {Object} response   Server response
	 * @param {Object} targetEl   Target element
	 *
	 * @return void;
	 */
	_saveTitleError : function(response, targetEl) {
		var message = response.json.data;

		this.fireEvent(MediaManagerModel.EVENT_SAVE_MEDIATITLE_FAILED, {
			scope : this,
			response,
			targetEl,
			message
		});
	},

	/**
	 * Deletes content via ajax.
	 *
	 * @method deleteMedia
	 * @public
	 *
	 * @param {Object} mediaParams     media params
	 *
	 * @return {Object} scope to chain
	 */
	deleteMedia : function(mediaParams) {
		var url;
		if (mediaParams.type === this.mediaType.folder) {
			url = this.folderDeleteUrl;
		}
		else {
			url = this.mediaDeleteUrl;
		}

		Connection.Ajax.request({
			type    : Connection.TYPE_JSON,
			method  : 'post',
			url     : Chaos.getUrl(url, { folderId : mediaParams.params.id }),
			params  : mediaParams.params,
			scope   : this,
			success : function(response) {
				this._deleteMediaSuccess(response, mediaParams);
			},
			error : function(response) {
				this._deleteMediaError(response, mediaParams);
			},
			failure : function(response) {
				this._deleteMediaError(response, mediaParams);
			}
		});
		return this;
	},

	/**
	 * Callback for a successful media delete request
	 *
	 * @method _deleteMediaSuccess
	 * @private
	 *
	 * @param {Object} response      Server response
	 * @param {Object} mediaParams   media item's parameters
	 *
	 * @return void;
	 */
	_deleteMediaSuccess : function(response, mediaParams) {
		this.fireEvent(MediaManagerModel.EVENT_DELETE_MEDIA_SUCCESS, {
			scope       : this,
			response    : response,
			mediaParams : mediaParams
		});
	},

	/**
	 * Callback for a failed media delete request
	 *
	 * @method _deleteMediaError
	 * @private
	 *
	 * @param {Object} response      Server response
	 * @param {Object} mediaParams   media item's parameters
	 */
	_deleteMediaError : function(response, mediaParams) {
		this.fireEvent(MediaManagerModel.EVENT_DELETE_MEDIA_FAILED, {
			scope    : this,
			response : response,
			targetEl : mediaParams.parentEl
		});
	},

	/**
	 * Callback for a successful media rotate request
	 *
	 * @method _rotateMediaSuccess
	 * @private
	 *
	 * @param {Object} response   Server response
	 *
	 * @return void;
	 */
	_rotateMediaSuccess : function(response) {
		this.fireEvent(MediaManagerModel.EVENT_ROTATE_MEDIA_SUCCESS, { scope : this, response : response });
	},

	/**
	 * Callback for a failed media rotate request
	 *
	 * @method _rotateMediaError
	 * @private
	 *
	 * @param {Object} response   Server response
	 * @param {Object} targetEl   Target element
	 *
	 * @return void;
	 */
	_rotateMediaError : function(response, targetEl) {
		this.fireEvent(MediaManagerModel.EVENT_ROTATE_MEDIA_FAILED, {
			scope    : this,
			response : response,
			targetEl : targetEl
		});
	},

	/**
	 * Rotates media via ajax.
	 *
	 * @method rotateMedia
	 *
	 * @param {Object} rotationItems   rotation items
	 * @param {String} channelType     channel type
	 * @param {Object} parentEl        media item element
	 *
	 * @return void
	 */
	rotateMedia : function(rotationItems, channelType, parentEl) {
		var params = {};
		for (var key in rotationItems) {
			if (rotationItems.hasOwnProperty(key)) {
				params.id = key;
				params.degree = rotationItems[key];
				params.channelType = channelType;
			}
		}
		Connection.Ajax.request({
			type     : Connection.TYPE_JSON,
			method   : 'post',
			url      : Chaos.getUrl(this.imageRotateUrl),
			params   : params,
			parentEl : parentEl,
			scope    : this,
			success  : this._rotateMediaSuccess,
			error    : function(response) {
				this._rotateMediaError(response, parentEl);
			},
			failure : function(response) {
				this._rotateMediaError(response, parentEl);
			}
		});
	}
});
