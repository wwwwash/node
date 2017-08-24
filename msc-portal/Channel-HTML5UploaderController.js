import Ext from '../../lib/vendor/ExtCore';
import Chaos from '../../lib/chaos/Chaos';
import { Broadcaster } from '../../lib/chaos/Broadcaster';

import HTML5MultiUploaderController from './HTML5MultiUploaderController';
import UploaderView from '../FanClub/UploaderView';
import OverlayController from '../Overlay/OverlayController';

export default function ChannelHTML5UploaderController (el, config) {
	ChannelHTML5UploaderController.superclass.constructor.call(this, el, config);
}

ChannelHTML5UploaderController.EVENT_UPLOAD_COMPLETE = 'upload-complete';
ChannelHTML5UploaderController.EVENT_ALL_UPLOAD_COMPLETE = 'upload-all-complete';
ChannelHTML5UploaderController.EVENT_UPLOADED_MEDIA_DISPLAYED = 'uploaded-media-displayed';
ChannelHTML5UploaderController.EVENT_ON_MEDIA_TEMPLATE_READY = 'on-media-template-ready';
ChannelHTML5UploaderController.EVENT_CONVERTED_FILE_FAILED = 'on-converted-file-failed';

Chaos.extend(ChannelHTML5UploaderController, HTML5MultiUploaderController, {
	/** @var {String}    Component name */
	name                : 'ChannelHTML5UploaderController',
	/** @var {String}    CSS class name of a box containing the uploaded files */
	mediaBoxCls         : 'mediaBox',
	/** @var {String}    Attribute name containing the file's token for DomQueries */
	dataIdAttributeName : 'data-document-id',
	/** @var {String}    Videos folder ID's */
	videosFolderId      : 'videos_folder',
	/** @var {String}    Active folder cls */
	activeFolderCls     : 'active_folder',
	/** @var {String}    Uploader block cls */
	uploaderBlockCls    : 'actionBlock',
	/** @var {String}    uploader button link cls */
	uploaderLink        : '.uploader-link',
	/** @var {String}    uploader input field elm */
	uploadInputField    : 'input',

	/**
	 * Standard initializer
	 *
	 * @param {Object|String} el
	 * @param {Object} config
	 */
	init : function(el, config) {
		this.addEvents(
			ChannelHTML5UploaderController.EVENT_UPLOAD_COMPLETE,
			ChannelHTML5UploaderController.EVENT_ALL_UPLOAD_COMPLETE,
			ChannelHTML5UploaderController.EVENT_UPLOADED_MEDIA_DISPLAYED,
			ChannelHTML5UploaderController.EVENT_ON_MEDIA_TEMPLATE_READY
		);
		this.cls = Object.assign({}, this.cls, {
			progressBar   : 'progressContainer',
			statusPercent : 'loading_percent'
		});
		this.config = config;
		this.UploaderView = this.config.items.UploaderView.component;

		ChannelHTML5UploaderController.superclass.init.call(this, el, config);
		if (!this.getAllowedUploadCount()) {
			this.disableInput();
		}
	},

	/**
	 * Polyfills the old this.element (because now it is the uploader, before it was the active tab content)
	 *
	 * @returns {*|string|DOMImplementation|Node|File|HTMLElement}
	 */
	getElement : function() {
		return Ext.select('.commonTabsContent.active').item(0);
	},

	/**
	 * Gets the current uploader block
	 *
	 * @method getUploaderBlockEl
	 * @public
	 *
	 * @return {Object} UploaderBlockEl
	 */
	getUploaderBlockEl : function() {
		var contentEl = this.getElement();
		if (contentEl.dom.id !== this.videosFolderId) {
			return contentEl.select(this.activeFolderCls.dot() + ' ' + this.uploaderBlockCls.dot()).item(0);
		}

		return contentEl.select(this.uploaderBlockCls.dot()).item(0);
	},

	/**
	 * Return current folder ID
	 *
	 * @returns {string|undefined}
	 */
	getCurrentFolderId : function() {
		var el = this.getElement().select('.active_folder').item(0);
		return el ? el.dom.id.split('_')[1] : undefined;
	},

	/**
	 * Returns the element to show the common (all) errors on.
	 *
	 * @overrrides HTML5MultiUploaderController
	 */
	getCommonErrorEl : function() {
		return this.element.jq().closest('.boxInner');
	},

	/**
	 * Returns the already uploaded count in a folder.
	 *
	 * @overrides HTML5Uploader
	 * @returns {Number}
	 */
	getUploadedCount : function() {
		return parseInt(this.getElement().jq().find('.contentCount span').text(), 10) || 0;
	},

	/**
	 * Creates enabled media box
	 *
	 * @method createEnabledMediaBox
	 * @param {object} ev   Json object
	 *
	 * @return void;
	 */
	createEnabledMediaBox : function(ev) {
		var documentId = ev.documentId,
			post = ev.document[documentId].post,
			uploadedMediaBox = this._getMediaBoxByDocumentId(documentId),
			convertingBlockEl =
				this.getElement().select('[' + this.dataIdAttributeName + '=' + documentId + ']').item(0);

		if (convertingBlockEl) {
			Ext.DomHelper.insertAfter(convertingBlockEl, post);
		}
		uploadedMediaBox.remove();
		this.fireEvent(ChannelHTML5UploaderController.EVENT_UPLOADED_MEDIA_DISPLAYED, {
			scope : this,
			type  : this.type
		});
	},

	/**
	 * Converted image failed. Called by addMediaComponent.
	 *
	 * @param {Object} params   Event object
	 * @method onGetConvertedFileFailed
	 * @public
	 *
	 * @return void
	 */
	onGetConvertedFileFailed : function(params) {
		if (params.documentId) {
			var documentId = params.documentId,
				failedMediaEl = this._getMediaBoxByDocumentId(documentId),
				newFailedMediaBoxEl;
			if (failedMediaEl.getCount()) {
				newFailedMediaBoxEl = this.UploaderView.createFailedMediaBox(failedMediaEl.item(0), {
					documentId  : documentId,
					errorReason : params.errorReason,
					fileName    : params.fileName
				});
			}
			this.fireEvent(ChannelHTML5UploaderController.EVENT_CONVERTED_FILE_FAILED, {
				scope   : this,
				boxEl   : newFailedMediaBoxEl,
				message : params.errorReason
			});
		}
	},

	/**
	 * Runs on change.
	 *
	 * @param {Object} ev   {Object}
	 */
	_onBeforeChange : function(ev) {
		this.UploaderView.setUploadingClass(this.getElement(), 'add');
		this.options.formData.folderId = this.getCurrentFolderId();
		ChannelHTML5UploaderController.superclass._onBeforeChange.call(this, ev);
	},

	/**
	 * After successfully got the tokens.
	 *
	 * @param param
	 * @private
	 */
	_onAfterGettokensok : function(param) {
		var i = this.pluginDatas.length;
		param.data.documents.reverse().forEach(function(doc) {
			this.UploaderView.createUploadingMediaBox({
				documentId : doc.mongoId,
				fileIndex  : '000',
				fileName   : this.pluginDatas[--i].files[0].name
			});
		}.bind(this));
	},

	/**
	 * Runs on upload complete.
	 *
	 * @method onUploadComplete
	 * @public
	 *
	 * @param {Object} params Store the image token
	 *
	 * return void;
	 */
	_onAfterDone : function(ev) {
		var fileName = ev.files[0].name;
		var el = this.getItemByFileName(fileName);
		var response;
		var isFailed;
		var errors = this.getSortedErrors()[fileName];

		try {
			response = JSON.parse(ev.result);
		}
		catch (e) {
			/* develblock:start */
			console.warn(e);
			/* develblock:end */
		}

		isFailed = !(response && response.status === 'OK');

		if (!isFailed) {
			var loadingMediaBox = this.UploaderView.getLoadingMediaBox({
				documentId : ev.formData.mongo,
				fileIndex  : 0,
				fileName   : fileName
			});
			el.after(loadingMediaBox);
			el.remove();

			this.fireEvent(ChannelHTML5UploaderController.EVENT_UPLOAD_COMPLETE, {
				scope      : this,
				params     : ev,
				documentId : ev.formData.mongo,
				token      : ev.formData.token,
				type       : this.type,
				fileIndex  : 0
			});
		}
		else if (errors) {
			this.UploaderView.createFailedMediaBox(Ext.get(el.get(0)), {
				errorReason : this.buildErrorMsg(errors),
				fileName    : fileName
			});
		}
	},

	/**
	 * When suddenly upload is aborted. Ex. when navigation happens.
	 *
	 * @private
	 */
	_onStop : function() {
		this._onAllDone();
	},

	/**
	 * After every upload has finished.
	 *
	 * @overrides HTML5MultiUploaderController
	 * @private
	 */
	_onAllDone : function() {
		this.fireEvent(ChannelHTML5UploaderController.EVENT_ALL_UPLOAD_COMPLETE);
		this.UploaderView.setUploadingClass(this.getElement(), 'remove');
		ChannelHTML5UploaderController.superclass._onAllDone.call(this);
	},

	/**
	 * Callback if prepare failed.
	 *
	 * @overrides HTML5MultiUploaderController
	 * @private
	 */
	_onAfterPreparefail : function() {
		if (!this.pluginDatas.length) {
			this._onAllDone();
		}
	},

	/**
	 * @overrides HTML5MultiUploaderController
	 * @private
	 */
	_onAdd : function() {},

	/**
	 * Tries to get a media box from DOM by the given document id
	 *
	 * @method _getMediaBoxByDocumentId
	 * @private
	 * @param {String} documentId   Description
	 *
	 * @return {Object}
	 */
	_getMediaBoxByDocumentId : function(documentId) {
		return Ext.select('.commonTabsContent.active')
			.item(0)
			.select(this.mediaBoxCls.dot() + '[' + this.dataIdAttributeName + '=' + documentId + ']');
	},

	/**
	 * Forwards the UploaderView event to the component
	 *
	 * @method onMediaTemplateReady
	 * @public
	 *
	 * @return void
	 */
	_onMediaTemplateReady : function(ev) {
		this.UploaderView.insertContentAfter(this.getUploaderBlockEl(), ev.mediaTemplate);
		this.fireEvent(ChannelHTML5UploaderController.EVENT_ON_MEDIA_TEMPLATE_READY, ev);
	},

	_removePromoVideoOverlay : function() {
		var uploaderLinkEl = this.element.select(this.uploaderLink);
		uploaderLinkEl.removeClass('overlayBtn');
		uploaderLinkEl.elements[0].removeAttribute('href');
	},

	_addPromoVideoOverlay : function() {
		var uploaderLinkEl = this.element.select(this.uploaderLink);
		uploaderLinkEl.addClass('overlayBtn');
		uploaderLinkEl.elements[0].setAttribute('href', Chaos.getUrl('PromoVideo/MarkAsPromoOverlay'));
	},

	_enableUpload : function() {
		this._removePromoVideoOverlay();
		this.element.select(this.uploadInputField).elements[0].click();
		this._addPromoVideoOverlay();
	},

	_onPromoVideoTypeSelected : function() {
		this.promoVideoEnabled = 1;
		this._enableUpload();
	},

	_onPromoVideoTypeNotSelected : function() {
		this.promoVideoEnabled = 0;
		this._enableUpload();
	},

	/**
	 * Bind events.
	 * @overrides HTML5Uploader
	 */
	bind : function() {
		ChannelHTML5UploaderController.superclass.bind.call(this);
		this.UploaderView.on(UploaderView.EVENT_MEDIA_TEMPLATE_READY, this._onMediaTemplateReady, this);
		Broadcaster.on(OverlayController.PROMO_VIDEO_TYPE_SELECTED, this._onPromoVideoTypeSelected, this);
		Broadcaster.on(OverlayController.PROMO_VIDEO_TYPE_NOT_SELECTED, this._onPromoVideoTypeNotSelected, this);
	}
});