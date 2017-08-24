import $ from 'jquery';

import Ext from '../../lib/vendor/ExtCore';
import Chaos from '../../lib/chaos/Chaos';
import '../../lib/chaos/AjaxGet';

import HTML5Uploader from './HTML5Uploader';
import HTML5MultiUploaderController from './HTML5MultiUploaderController';

export default function AttachmentHTML5MultiUploaderController (el, config) {
	AttachmentHTML5MultiUploaderController.superclass.constructor.call(this, el, config);
}

Ext.extend(AttachmentHTML5MultiUploaderController, HTML5MultiUploaderController, {

	/**
	 * Returns container element of the items.
	 *
	 * @overrides
	 * @returns {jQuery}
	 */
	getItemsContainer : function() {
		return this.element.jq().next(this.cls.itemsContainer.dot());
	},

	/**
	 * Checks if a file already exists.
	 *
	 * @param fileName
	 * @returns {boolean}
	 * @private
	 */
	_fileExists : function(fileName) {
		return !!this.getItemsContainer().find('[data-file="' + fileName + '"]').length;
	},

	/**
	 * On Add callback.
	 *
	 * @overrides
	 * @param ev
	 * @private
	 */
	_onAdd : function(ev) {
		if (!this._fileExists(ev.files[0].name)) {
			AttachmentHTML5MultiUploaderController.superclass._onAdd.call(this, ev);
		}
	},

	/**
	 * On Before Add callback.
	 *
	 * @overrides
	 * @param ev
	 * @private
	 */
	_onBeforeAdd : function(ev) {
		var fileName = ev.files[0].name;
		if (this._fileExists(fileName)) {
			this.removeByFileName(fileName);
			if (!this.pluginDatas.length) {
				this._addError(HTML5Uploader.ERROR.FILE_EXISTS);
				this._onAllDone();
			}
		}
		else {
			AttachmentHTML5MultiUploaderController.superclass._onBeforeAdd.call(this, ev);
		}
	},

	/**
	 * On Done callback.
	 *
	 * @overrides
	 * @param ev
	 * @private
	 */
	_onDone : function(ev) {
		AttachmentHTML5MultiUploaderController.superclass._onDone.call(this, ev);

		var removeLink = this.getItemByFileName(ev.files[0].name).find(this.cls.remove.dot());
		var response;
		var isOk;
		var url;

		try {
			response = JSON.parse(ev.result);
			isOk = response.status === 'OK';
		}
		catch (e) {
			/* develblock:start */
			console.warn(e);
			/* develblock:end */
		}

		if (isOk) {
			url = Chaos.getUrl('Message/DeleteAttachment', {
				accountType  : response.data.accountType,
				accountId    : response.data.accountId,
				//attachmentId : response.data.attachmentId
				attachmentId : response.data.fileId
			});

			removeLink.attr('href', url);
		}
	},

	/**
	 * Remove link click handler.
	 *
	 * @param ev
	 * @private
	 */
	_onRemoveClick : function(ev) {
		ev.preventDefault();

		var target = $(ev.target);
		var href = target.attr('href');

		target.parent().remove();

		if (href !== '#') {
			this._sendRemoveRequest(href);
		}
	},

	/**
	 * Sends the remove AJAX request.
	 *
	 * @param url
	 * @private
	 */
	_sendRemoveRequest : function(url) {
		Chaos.GetData(url);
	},

	/**
	 * Bind up the events.
	 *
	 * @overrides
	 */
	bind : function() {
		AttachmentHTML5MultiUploaderController.superclass.bind.call(this);
		this.getItemsContainer().on('click', this.cls.remove.dot(), this._onRemoveClick.bind(this));
	}
});