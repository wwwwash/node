/* eslint-disable complexity */
/* eslint-disable max-len */

import $ from 'jquery';

import Ext from '../../../lib/vendor/ExtCore';
import Chaos from '../../../lib/chaos/Chaos';
import Config from '../../../lib/chaos/Config';
import Page from '../../../lib/chaos/Page';

import TagManager from '../../TagManager/TagManager';
import HTML5Uploader from '../../_Uploader5/HTML5Uploader';
import PhotoContestUploaderController from '../../_Uploader5/PhotoContest-HTML5UploaderController';
import VideoContestUploaderController from '../../_Uploader5/VideoContest-HTML5UploaderController';
import VideoPlayer from '../../Video/VideoPlayer';

import './Shared';

export default function ContestOngoing(el, config) {
	ContestOngoing.superclass.constructor.call(this, el, config);
}

ContestOngoing.TYPE_CLIP = 'clip';
ContestOngoing.TYPE_SERIES = 'mini-series';
ContestOngoing.TYPE_PREMIUM_VIDEO = 'premium-video';
ContestOngoing.TYPE_FREE_PHOTO = 'free-photo';
ContestOngoing.TYPE_PREMIUM_PHOTO = 'premium-photo';

Chaos.extend(ContestOngoing, Page, {

	/** @var {String}               Input error class */
	errorCls : 'error',

	/** @var {String}               ID of the uploader container */
	uploaderContainerCls : 'uploaderContainer',

	/** @var {String}               ID of the tag editor container */
	tagEditorContainerId : 'tag_editor_container',

	/** @var {String}               Selector for the video contest upload button */
	uploadBtnSel : '.uploader5__button .button',

	/** @var {String}               Class which hides everything */
	hideCls : 'hide',

	/** @var {String}               Class which disables (almost) everything */
	disableCls : 'disabled',

	/** @var {String}               Class for booting upload btn. Its not clickable until it gets status from the BE */
	buttonBootingCls : 'booting',

	/** @var {String}               Route for getting the uploaded video status */
	getVideoStatusRoute : 'VideoContest/GetVideoStatus',

	/** @var {String}               Class which shows that player is in inited status or being inited. */
	playerInitedCls : 'inited',

	/** @var {String}               Template of the video player flash object */
	playerTpl : '<object id="video_player" class="video_player" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"' +
										'codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=7,0,19,0"' +
										'width="100%" height="100%">' +
										'<param name="movie" value="{playerSrc}" />' +
										'<param name="allowScriptAccess" value="always" />' +
										'<param name="scale" value="noscale" />' +
										'<param name="FlashVars" value="videourl={videoUrl}&controllerurl={controllerUrl}&useSimpleController=1&rendermode={renderMode}&autostart=1" />' +
										'<param name="quality" value="high" />' +
										'<param name="wmode" value="transparent" />' +
										'<embed src="{playerSrc}"' +
											'quality="high"' +
											'bgcolor="#900000"' +
											'wmode="transparent"' +
											'pluginspage="http://www.macromedia.com/go/getflashplayer"' +
											'type="application/x-shockwave-flash"' +
											'id="video_player_embed"' +
											'name="video_player"' +
											'allowScriptAccess="always"' +
											'scale="noscale"' +
											'flashvars="videourl={videoUrl}&controllerurl={controllerUrl}&useSimpleController=1&autostart=1"' +
											'width="100%" height="100%">' +
										'</embed>' +
									'</object>',

	/** @var {Object}               Ext Element of the video player container */
	_playerContainerEl : undefined,

	/** @var {Object}               Ext Element of the uploader container */
	_uploaderContainerEl : undefined,

	/** @var {Object}               Upload video button element */
	_uploadBtnEl : undefined,

	/** @var {Object}               Tag editor container element */
	_tagEditorContainerEl : undefined,

	/** @var {Object}               Tag editor component */
	_tagEditor : undefined,

	/**
	 * Init
	 *
	 * @param {Element} el      This should be the body tag.
	 * @param {Object} config   Config object of this component
	 */
	init : function(el, config) {
		this._uploaderContainerEl = Ext.select(this.uploaderContainerCls.dot()).item(0);
		this._tagEditorContainerEl = Ext.get(this.tagEditorContainerId);
		this._playerContainerEl = Ext.select('.video_player_container').item(0);
		this._uploadBtnEl = this._uploaderContainerEl && this._uploaderContainerEl.select(this.uploadBtnSel).item(0);
		this._videoPlayerContainerEl = Ext.select('.playerContainer ').item(0);
		this._contentType = this._uploaderContainerEl && this._uploaderContainerEl.data('type');

		if (this._tagEditorContainerEl) {
			this._initTagManagerComponent();
		}

		if (this._uploaderContainerEl) {
			this._initHtml5Uploader();

			this._handleVideoStatus({
				status : this._uploaderContainerEl.data('status')
			});
			if (this._uploadBtnEl) {
				this._uploadBtnEl.removeClass(this.buttonBootingCls);
			}
		}
		// If uploaded video player appears instantly
		else if (this._tagEditor) {
			this._tagEditor.setSaveCustomData({
				videoId : this.getVideoMongoId()
			});
			this._tagEditor.show();
		}

		// Call parent class init
		ContestOngoing.superclass.init.call(this, el, config);
	},

	getContestType : function() {
		var el = this._uploaderContainerEl || this._playerContainerEl.parent();
		return el.data('type');
	},

	/**
	 * Instantiates the tag manager component.
	 * @private
	 */
	_initTagManagerComponent : function() {
		var contestType = this.getContestType();
		var routeParams = {
			contestType : contestType
		};

		this._tagEditor = new TagManager(
			this._tagEditorContainerEl, {
				tagSaveAjaxRoute   : 'MusicTag/Add',
				tagDeleteAjaxRoute : 'MusicTag/Delete',
				routeParams        : routeParams
			}
		);
	},

	/**
	 * Instantiates the video contest html5 uploader.
	 * @private
	 */
	_initHtml5Uploader : function () {
		var uploaderElement = this._uploaderContainerEl.select('.uploader5').item(0);
		if (this._contentType === ContestOngoing.TYPE_FREE_PHOTO
			|| this._contentType === ContestOngoing.TYPE_PREMIUM_PHOTO) {
			this._uploader = new PhotoContestUploaderController(
				uploaderElement,
				this._getUploaderConfigByType()
			);
		}
		else {
			this._uploader = new VideoContestUploaderController(
				uploaderElement,
				this._getUploaderConfigByType()
			);
		}
	},

	_getUploaderConfigByType : function() {
		var contestType = this.getContestType();
		var tokenUrl = Chaos.getUrl('ContestUploadToken/Get',
						{ contestType : contestType },
						{ caption : this._uploaderContainerEl.data('name') });
		var statusUrl = Chaos.getUrl('ContestContent/GetStatuses', { contestType : contestType });

		return {
			errorMessages : Config.get('errorObj').html5_uploader,
			url           : Config.get('MWHMediaUploadURL'),
			tokenUrl      : tokenUrl,
			validate      : Config.get(contestType),
			statusUrl     : statusUrl
		};
	},

	/**
	 * Returns the mongo ID of the uploading/uploaded video
	 * @param {Object} response Ajax response after tokenready
	 * @returns {String|bool}
	 */
	getVideoMongoId : function (response) {
		var _data;
		if (response && response.data) {
			_data = response.data;
		}
		if (_data && _data.documents[0]) {
			this._mongoId = _data.documents[0].mongoId;
		}
		if (this._mongoId && this._mongoId.length > 0) {
			return this._mongoId;
		}
		else if (this._uploaderContainerEl && this._uploaderContainerEl.data('id')) {
			return this._uploaderContainerEl.data('id');
		}
		else if (this._videoPlayerContainerEl && this._videoPlayerContainerEl.data('id')) {
			return this._videoPlayerContainerEl.data('id');
		}

		return false;
	},

	/**
	 * On play icon click.
	 * @private
	 */
	_onPlayClick : function() {
		var videoUrl = this._playerContainerEl.data('videoUrl');

		if (this._playerContainerEl) {
			this._playerContainerEl.addClass(this.playerInitedCls);
			this._videoPlayer = new VideoPlayer().init({
				element  : $('.video_player_container'),
				videoUrl : videoUrl
			});
		}
	},

	_onUploadComplete : function(ev) {
		this._handleVideoStatus(ev, true);
	},

	/**
	 * On video upload failed.
	 * @private
	 */
	_onUploadFailed : function() {
		this._hideTagEditor();
	},

	_hideTagEditor : function() {
		if (this._tagEditor) {
			this._tagEditor.resetAllTags();
			this._tagEditor.hide();
		}
	},

	/**
	 * On uploaders token ready event handler.
	 * @private
	 */
	_onTokenReady : function(response) {
		if (this._tagEditor) {
			var videoMongoId = this.getVideoMongoId(response);
			if (!videoMongoId) {
				this._uploaderContainerEl.jq().protipShow({
					title     : Chaos.translate('Error occured. Please refresh page and try again.'),
					trigger   : 'sticky',
					gravity   : false,
					position  : 'bottom',
					offsetTop : -110
				});
			}
			this._tagEditor.resetAllTags();
			this._tagEditor.show();
			this._tagEditor.setSaveCustomData({
				videoId : videoMongoId
			});
		}
	},

	/**
	 * Handles the video status response.
	 * @param response
	 * @private
	 */
	_handleVideoStatus : function(response, noToken) {
		switch (response.status) {
			case 'failed':
				if (this._tagEditor) {
					this._tagEditor.setSaveCustomData({});
					this._tagEditor.hide();
				}
				break;
			case 'converted':
			case 'enabled':
				if (response.video_url) {
					this._playerContainerEl.data('videoUrl', response.video_url);
				}
				if (response.image_url) {
					this._playerContainerEl.setStyle('background-image', 'url(' + response.image_url + ')');
				}
				this._playerContainerEl.removeClass(this.hideCls);
				//this._renderPlayer();
				break;
			case 'rejected':
			case 'deleted':
			case '': break;
			default:
				if (this._tagEditor) {
					this._tagEditor.setSaveCustomData({
						videoId : this.getVideoMongoId()
					});
					this._tagEditor.show();
					if (!noToken && this.getVideoMongoId()) {
						this._uploader.poll.add(this.getVideoMongoId());
					}
					if (this._uploader) {
						this._uploader.showConverting();
					}
				}
				break;
		}
	},

	_onPollOk : function(ev) {
		this._uploaderContainerEl.addClass(this.hideCls);
		this._playerContainerEl.parent().removeClass(this.hideCls);
		this._handleVideoStatus(ev);
	},

	_onPollFail : function() {
		this._hideTagEditor();
	},

	/**
	 * Bind events
	 */
	bind : function() {
		ContestOngoing.superclass.bind.call(this);

		if (this._uploader) {
			this._uploader.on(HTML5Uploader.EV.DONE, this._onUploadComplete, this);
			this._uploader.on(HTML5Uploader.EV.GET_TOKENS_OK, this._onTokenReady, this);
			this._uploader.on(HTML5Uploader.EV.FAIL, this._onUploadFailed, this);
			this._uploader.on(VideoContestUploaderController.EV.POLL_OK, this._onPollOk, this);
			this._uploader.on(VideoContestUploaderController.EV.POLL_FAIL, this._onPollFail, this);
		}

		if (this._playerContainerEl) {
			this._playerContainerEl.on('click', this._onPlayClick, this, { delegate : 'i' });
		}
	},

	/**
	 * Unbind events
	 */
	unbind : function() {
		this.autoUnbind();
	}
});
