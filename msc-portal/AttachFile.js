import Ext from '../../lib/vendor/ExtCore';
import Chaos from '../../lib/chaos/Chaos';
import ChaosPlugin from '../../lib/chaos/Plugin';

import AttachFileFailedTemplate from './AttachFileFailedTemplate';
import AttachFileItemTemplate from './AttachFileItemTemplate';
import AttachFileSuccessTemplate from './AttachFileSuccessTemplate';
import AttachFileRemoveTemplate from './AttachFileRemoveTemplate';

/**
 * AttachFilePlugin
 * Multiple attachment wrapper for jQuery-file-upload in Chaos
 * https://blueimp.github.io/jQuery-File-Upload/
 */

export default function AttachFilePlugin(config) {
	AttachFilePlugin.superclass.constructor.call(this, config);
}

/** @var {String} Event - Adding a new upload item to the list */
AttachFilePlugin.EVENT_ADD_ITEM = 'attachfile-add';
/** @var {String} Event - Remove a new upload item from the list */
AttachFilePlugin.EVENT_REMOVE_ITEM = 'attachfile-remove';

Chaos.extend(AttachFilePlugin, ChaosPlugin, {

	/** @var {String} URL where the plugin makes an upload */
	uploadUrl : undefined,

	/** @var {String} Route for the remove link */
	removeLinkRoute : 'Message/DeleteAttachment',

	/** @var {Object} Object with the error keys and messages. */
	errorMessages : {},

	/** @var {String} Selector of the UL list of the upload items */
	attachFileListSel : '.attachFileList',

	/** @var {String} Cancel link selector */
	cancelSel : '.cancel',

	/** @var {String} Remove link selector */
	removeSel : '.remove',

	/** @var {String} Progress container */
	progressContainerSel : '.progressContainer',

	/** @var {String} Percentage display element selector */
	percentageSel : '.percentage',

	/** @var {String} Progres bar selector */
	progressBarSel : '.commonProgressBar',

	/** @var {Object} Object for translated texts */
	txt : {},

	/**
	 * Init plugin
	 * @param host {Object} Options object
	 * @returns {AttachFilePlugin}
	 */
	init : function(host) {
		AttachFilePlugin.superclass.init.call(this, host);

		var self = this;

		// Options
		this.uploadUrl = host.uploadUrl || this.uploadUrl;
		this.errorMessages = host.errorMessages || this.errorMessages;

		// Elements
		this.$attachFileInto = $(this.attachFileListSel);

		// Texts
		this.txt.cancel = Chaos.translate('Cancel');
		this.txt.fileExists = Chaos.translate('The uploaded file already exists.');
		this.txt.failed = Chaos.translate('Failed');
		this.txt.uploaded = Chaos.translate('Uploaded');
		this.txt.remove = Chaos.translate('Remove');

		// jQuery file-upload
		this.element.fileupload({
			url                  : this.uploadUrl,
			type                 : 'POST',
			forceIframeTransport : false,
			dataType             : 'json',
			autoUpload           : true,
			paramName            : 'binaryFile',
			formData             : {},
			replaceFileInput     : true,

			add      : $.proxy(self._addEvent, self),
			progress : $.proxy(self._progressEvent, self),
			done     : $.proxy(self._doneEvent, self),
			fail     : $.proxy(self._failEvent, self),
			always   : $.proxy(self._alwaysEvent, self)
		});

		// Binding events
		this._bindEvents();

		return this;
	},

	/**
	 * Add file to list event handler.
	 *
	 * @param e {Object} Event object
	 * @param data {Object} jquery file-upload plugin object
	 * @private
	 */
	_addEvent : function(e, data) {
		var self = this,
			file = data.originalFiles[0],
			fileId = file.name + file.size,
			existingUploadItem = this._getUploadItem(data.originalFiles[0]);

		// Hiding protip on the upload button.
		this.element.protipHide();

		// If the added file is not exists in the list yet (identifier: fileId)
		if (existingUploadItem.length === 0) {
			var tplVarObj = {
					cancelCaption : this.txt.cancel,
					fileName      : file.name,
					fileId        : fileId
				},
				tpl = new AttachFileItemTemplate().render(tplVarObj);

			// Adding upload list item with animation
			var uploadItem = $(tpl).hide().prependTo(this.$attachFileInto).fadeIn(200);

			// Add cancel event handler
			uploadItem.find(this.cancelSel).on('click', function() {
				data.abort();
				self.removeUploadItem(uploadItem);
			});

			// Triggering an event for outer classes
			var allItemCnt = this.$attachFileInto.find('li').length;
			$(this.element).trigger(AttachFilePlugin.EVENT_ADD_ITEM, { itemCnt : allItemCnt });

			// Auto start uploading
			data.submit();
		}
		// If the file exists in the list
		else {
			this.element.protipShow({
				title : this.txt.fileExists,
				icon  : 'alert'
			});
		}
	},

	/**
	 * Progress event handler. Triggered on every progress change.
	 * @param e {Object} Event object
	 * @param data {Object} jquery file-upload plugin object
	 * @private
	 */
	_progressEvent : function(e, data) {
		var percent = parseInt(data.loaded / data.total * 100, 10),
			uploadItem = this._getUploadItem(data.originalFiles[0]),
			progressBar = uploadItem.find(this.progressContainerSel),
			percentage = uploadItem.find(this.percentageSel);

		progressBar.width(percent + '%');
		percentage.html(percent + '%');
	},

	/**
	 * Event - Upload failed, validation failed
	 * @private
	 */
	_failEvent : function() {},

	/**
	 * Getting the uploading file list item by the jquery-file-upload's file object
	 * @param fileObj {Object}
	 * @private
	 */
	_getUploadItem : function(fileObj) {
		var fileId = fileObj.name + fileObj.size,
			uploadItem = this.$attachFileInto.find('li[data-id="' + fileId + '"]');

		return uploadItem;
	},

	/**
	 * Event - Upload successfully done
	 * @param e {Object} Event object
	 * @param data {Object} jquery file-upload plugin object
	 * @private
	 */
	_doneEvent : function(e, data) {
		var uploadItem = this._getUploadItem(data.originalFiles[0]);

		// Clear the percentage item's text.
		uploadItem.find(this.percentageSel).html('');

		var response = data.response().result,
			responseData = response.data,
			removeLink = '#';

		// If backend validation's result is ERROR
		if (response.status === 'ERROR') {
			var errorMsg = this.errorMessages[response.errorMessage] || this.errorMessages.default,
			// Parsing template
				failedTpl = new AttachFileFailedTemplate().render({ msg : errorMsg, failedCaption : this.txt.failed });
			uploadItem.find(this.progressBarSel).replaceWith(failedTpl);
		}
		// If backend validation's result is status = OK
		else {
			// Parsing template
			var successTpl = new AttachFileSuccessTemplate().render({ uploadedCaption : this.txt.uploaded });

			uploadItem.find(this.progressBarSel).replaceWith(successTpl);
			// Generating Remove link based on the upload
			var routeParams = {
				accountType  : responseData.accountType,
				accountId    : responseData.accountId,
				attachmentId : responseData.fileId
			};
			removeLink = Chaos.getUrl(this.removeLinkRoute, routeParams);
		}

		// Parsing remove TPL
		var removeTpl = new AttachFileRemoveTemplate().render({
			removeLink    : removeLink,
			removeCaption : this.txt.remove
		});
		uploadItem.find('a').replaceWith(removeTpl);
	},

	/**
	 * Remove link click handler.
	 * @param ev {Object} Event Object
	 * @private
	 */
	_onRemove : function(ev) {
		ev.preventDefault();

		var url = $(ev.target).attr('href'),
			uploadItem = $(ev.target).parent('li');

		// If remove link href is more than a hashmark #
		if (url.length > 1) {
			$.get(url);
		}
		// Remove the list item regardless to the server response
		this.removeUploadItem(uploadItem);
	},

	/**
	 * Event - Always after upload. Regardless of it is failed or not
	 * @private
	 */
	_alwaysEvent : function() {},

	/**
	 * Removing an upload item from the list
	 * @param uploadItem {Object} the list item. jQuery object.
	 */
	removeUploadItem : function(uploadItem) {
		// Upload button
		var btn = Ext.get(this.element[0]),
		// Other items' count in the list
			otherListItemsCnt = uploadItem.siblings().length;
		// Hiding protip on the upload button
		btn.jq().protipHide();
		// FadeOut and remove the upload item
		uploadItem.fadeOut(200, function() {
			$(uploadItem).remove();
		});
		// Event for the universe
		$(this.element).trigger(AttachFilePlugin.EVENT_REMOVE_ITEM, { otherListItemsCnt : otherListItemsCnt });
	},

	/**
	 * Binding events
	 */
	_bindEvents : function() {
		this.$attachFileInto.on('click', this.removeSel, $.proxy(this._onRemove, this));
	}
});

