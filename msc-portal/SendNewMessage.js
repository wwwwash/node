import $ from 'jquery';

import Ext from '../../../lib/vendor/ExtCore';
import Chaos from '../../../lib/chaos/Chaos';
import ChaosObject from '../../../lib/chaos/Object';
import Config from '../../../lib/chaos/Config';

import AttachFile from '../../AttachFile/AttachFile';
import ScrollPane from '../../Scroll/ScrollPane';
import Form from '../../_Form/Form';
import AdvancedTextarea from '../../_Form/AdvancedTextarea';

import '../../Page/Message/Message.scss';

/**
 * Overlay controller object for the 'send new message' overlays
 */

export default function SendNewMessage (el, config) {
	SendNewMessage.superclass.constructor.call(this, el, config);
}

Chaos.extend(SendNewMessage, ChaosObject, {

	/** @var {String}                   Form ID */
	overlayFormId : 'sendNewMessage',

	/** @var {String}                   Selector of the attachFilePlugin, which is an upload button,
	 *                                  containing the file input */
	attachFilePluginSel : '#attachFilePlugin',

	/** @var {String}                   Route for upload attachments */
	attachmentUploadRoute : 'SupportMessageAttachmentUpload/Index',

	/** @var {String}                   Attach list container ID */
	attachListContainerId : 'attachListContainer',

	/** @var {String}                   Attach scroll container ID */
	attachScrollContainerId : 'attachScrollContainer',

	/** @var {String}                   UL list selector of the file list */
	attachFileListContainerSel : '.attachFileList',

	/** @var {String}                   Hide Class */
	hideCls : 'hide',

	/** @var {String}                   URL for uploading files */
	_attachmentUploadUrl : undefined,

	/** @var {Object}                   Attach file plugin element. Upload button, contains the file input */
	_attachFilePluginEl : undefined,

	/** @var {Object}                   List container element */
	_listContainerEl : undefined,

	/** @var {Object}                   Scrollpane component */
	_scrollPane : undefined,

	/** @var {Object}                   Container of the form (this is the form element) */
	_containerEl : undefined,

	/**
	 * Init
	 *
	 * @param {Element} el      This should be the body tag.
	 * @param {Object} config   Config object of this controller
	 */
	init : function(el, config) {
		this._containerEl = Ext.get(this.overlayFormId);

		if (this.attachmentUploadRoute) {
			this._attachmentUploadUrl = Chaos.getUrl(this.attachmentUploadRoute);
		}

		this._attachFilePluginEl = $(this.attachFilePluginSel);
		this._listContainerEl = Ext.get(this.attachListContainerId);
		this._scrollContainerEl = Ext.get(this.attachScrollContainerId);

		SendNewMessage.superclass.init.call(this, el, config);

		var errorObj = Config.get('errorObj');

		if (this._attachFilePluginEl.length > 0) {
			// Initiating AttachFilePlugin
			new AttachFile().init({
				element       : this._attachFilePluginEl.eq(0),
				uploadUrl     : this._attachmentUploadUrl,
				errorMessages : errorObj.message_attachment_upload
			});

			// Scroll bar component
			var attachFileList = this._scrollContainerEl.select(this.attachFileListContainerSel).item(0);

			if (this._listContainerEl) {
				this._scrollPane = new ScrollPane(this._listContainerEl, {
					containerId    : this._scrollContainerEl.dom.id,
					contentId      : attachFileList.dom.id,
					tpl            : '<div class="scroll-pane"><div class="scrollbar"></div></div>',
					scrollBarClass : 'scrollbar'
				});

				var itemCnt = attachFileList.select('li').getCount();

				this.setScrollVisibility(itemCnt);

				// It is needed that the listobject to be visible on load, because the scrollpane can build itself
				// to a visible element. Then we hide it.
				if (itemCnt === 0) {
					this._listContainerEl.addClass(this.hideCls);
				}
			}
		}

		// Form component
		this.form = new Form(this._containerEl, {});

		// Advanced Textarea
		this.advancedTextarea = new AdvancedTextarea('body', {});
	},

	/**
	 * On upload list item add event handler
	 * @param e {Object} Event Object
	 * @param options {Object} Options coming thru the event
	 * @private
	 */
	_onAddItem : function (e, options) {
		if (this._listContainerEl) {
			this._listContainerEl.removeClass(this.hideCls);
		}
		if (this._scrollPane) {
			this._scrollPane.setScrollBarHeight();
		}

		this.setScrollVisibility(options.itemCnt);
		if (this._scrollContainerEl) {
			this._scrollContainerEl.dom.scrollTop = 0;
		}
	},

	/**
	 * On upload list item remove event handler
	 * @param e {Object} Event Object
	 * @param options {Object} Options coming thru the event
	 * @private
	 */
	_onRemoveItem : function (e, options) {
		if (this._scrollPane) {
			this._scrollPane.setScrollBarHeight();
		}

		if (options.otherListItemsCnt === 0 && this._listContainerEl) {
			this._listContainerEl.addClass(this.hideCls);
		}

		this.setScrollVisibility(options.otherListItemsCnt);
	},

	/**
	 * Sets scrollbar visibility depending on item number
	 */
	setScrollVisibility : function(itemCnt) {
		if (!this._scrollPane) {
			return;
		}

		if (itemCnt > 6) {
			this._scrollPane.getScrollBar().show();
		}
		else {
			this._scrollPane.getScrollBar().hide();
		}
	},

	/**
	 * Binds events
	 */
	bind : function() {
		SendNewMessage.superclass.bind.call(this);

		if (this._attachFilePluginEl) {
			this._attachFilePluginEl.on(
				AttachFile.EVENT_ADD_ITEM,
				$.proxy(this._onAddItem, this)
			);

			this._attachFilePluginEl.on(
				AttachFile.EVENT_REMOVE_ITEM,
				$.proxy(this._onRemoveItem, this)
			);
		}
	},

	/**
	 * Unbind events
	 */
	unbind : function() {
		this.autoUnbind();
	}
});
