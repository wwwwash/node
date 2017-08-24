import Ext from '../../lib/vendor/ExtCore';
import Chaos from '../../lib/chaos/Chaos';
import Config from '../../lib/chaos/Config';
import ChaosController from '../../lib/chaos/Controller';
import Util from '../../lib/chaos/Util';
import ChannelScrollPane from './ChannelScrollPane';

/**
 * Controller of CommentManagerController
 */
export default function CommentManagerController(el, config) {
	CommentManagerController.superclass.constructor.call(this, el, config);
}

Ext.apply(CommentManagerController, {
	EVENT_OVERLAY_CONTENT_READY : 'on-overlay-content-ready',
	EVENT_INPUT_FOCUS           : 'input-focus',
	EVENT_INPUT_BLUR            : 'input-blur',
	EVENT_SPAM_FILTER           : 'spam-filter'
}, {});

Chaos.extend(CommentManagerController, ChaosController, {

	/** @var {String}     Model of the controller */
	CommentManagerModel   : undefined,
	/** @var {String}           Comment btn cls */
	commentCls            : 'comments',
	/** @var {String}           Overlay comment container cls */
	overlayCommentCtnCls  : 'overlay_comment_container',
	/** @var {Number}           If there are no content on the left side this is the comments height */
	defaultCommentsHeight : 400,
	/** @var {String}           Class name of a folder. */
	folderClass           : 'montage_picture',
	/** @var {String}           Class name of a picture. */
	pictureContentClass   : 'picture_content',
	/** @var {String}           Each of the comment elements are inside the block with this cls */
	commentBlockCls       : 'comment_block',
	/** @var {String}           Reply Container cls */
	replyContainerCls     : 'reply_container',
	/** @var {String}           Selector of the comments header */
	commentHeaderSel      : '.comment_inner .title',
	/** @var {String}           Selector of the content img */
	contentImgSel         : '.content_container img',
	/** @var {String}           Content container cls */
	contentContainerCls   : 'content_container',
	/** @var {String}           Comment block close btn */
	closeBtnCls           : 'close',
	/** @var {String}           Comment block report btn */
	reportCls             : 'report',
	/** @var {String}           Trash icon cls */
	trashIconCls          : 'trash',
	/** @var {String}           Cancel delete comment btn cls */
	cancelBtnCls          : 'cancel',
	/** @var {String}           Delete comment btn cls */
	removeBtnCls          : 'remove',
	/** @var {String}           Post control panel (includes delete and cancel button) */
	slidePanelCls         : 'remove_comment',
	/** @var {String}           channelBlockInner Id */
	channelBlockInnerId   : 'channel_block_inner',
	/** @var {String}           Comment block submit btn */
	commentSubmitBtnId    : 'comment_submit',
	/** @var {String}           Element cls that shows you the total comments */
	commentCounterId      : 'total_comment_number',
	/** @var {String}           Input class where you write your reply */
	commentInputId        : 'comment_input',
	/** @var {String}           Comment content cls */
	commentWrapperCls     : 'comment_wrapper',
	/** @var {String}           Comment content cls */
	commentContentCls     : 'comment_content',
	/** @var {String}           Comment inner cls */
	commentCtnCls         : 'comment_inner',
	/** @var {String}           Active cls */
	activeCls             : 'active',
	/** @var {String}           Scrollable container class */
	scrollableCls         : 'scrollable',
	/** @var {String}           Comments without any event are marked with this class */
	noEventCommentCls     : 'no_events',
	/** @var {String}           Comments without any event are marked with this class */
	noEventCommentEl      : '',
	/** @var {String}           If id is missing after our new post, we mark it with this class*/
	missingCommentIdCls   : 'missing_comment_id',
	/** @var {String}           Scrollable container ID */
	scrollableContentId   : 'scrollable',
	/** @var {String}           Scroll content cls */
	scrollContentCls      : 'scrollContent',
	/** @var {String}           When comment reply input has focus, it will also have this class */
	replyInpFocusedCls    : 'focused',
	/** @var {String}           Retry icon cls */
	retryIconCls          : 'retry',
	/** @var {String}           Icon cls */
	iconCls               : 'icon',
	/** @var {String}           If comments should appear in full screen the overlayCommentCtn should have it */
	fitScreenCls          : 'fitscreen',
	/** @var {String}           If the comments appear in full screen, it gives the padding from the window */
	overlayTopPadding     : 20,
	/** @var {String}           Overlay side padding */
	overlaySidePadding    : 10,
	/** @var {String}           Url for remove comment */
	removeCommentUrl      : 'ChannelComment/Delete',
	/** @var {String}           Url for post comment */
	postCommentUrl        : 'ChannelComment/Create',
	/** @var {String}           The no comments blocks id thats visible when the comment number is 0 */
	noCommentsBlockId     : 'no_comments',
	/** @var {String}           Url for get overlay content */
	getCommentUrl         : 'ChannelPostDetails/Index',
	/** @var {String}           Update comment url */
	updateCommentUrl      : 'ChannelComment/Update',
	/** @var {String}           Someting text */
	commentFailedMessage  : Chaos.translate('Failed to send.'),
	/** @var {String}           Active content */
	activeContent         : undefined,
	/** @var {String}           Active comment counter class */
	activeCommentCounter  : undefined,
	/** @var {String}           Content block url for ajax according to the clicked item */
	contentBlockUrl       : undefined,
	/** @var {String}           If picture comment overlay is currently resizing with resize event = true */
	isResizing            : false,
	/** @var {String}           Id of the flash container */
	flashVideoContainerId : 'flash_video_container',
	/** @var {String}           Nick of the current performer */
	performerNick         : '',
	/** @var {String}           Select comment elemets */
	commentElmentsSel     : '.title h3, .comment_wrapper, .replay_form_container',
	/** @var {String}           Select comment loader element */
	commentLoaderSel      : 'loader_container',
	/** @var {String}           Main comment elements */
	commentElmentsEl      : undefined,
	/** @var {String}           Comment loader element */
	loaderGifEl           : undefined,

	/* PRIVATE */

	/** @var {Object}           Scroll Panel for scrolling the comments  */
	_scrollPane         : undefined,
	/** @var {Boolean}          True if comment adding in progress  */
	_commentInProgress  : undefined,
	/** @var {Object}           Comment Content Element  */
	commentContentEl    : undefined,
	/** @var {Object}           Timestamp of the last Create or Delete  */
	lastCallTimestamp   : undefined,
	/** @var {Object}           Save the AJAX response till the animation finish  */
	_saveDeleteResponse : undefined,
	/** @var {Object}           Stores the comment Template  */
	_commentTemplate    : undefined,
	/** @var {String}           Scrollable content */
	_scrollableContent  : undefined,

	/**
	 * Standard init function
	 *
	 * @param {Object} el
	 * @param {Object} config
	 *
	 * @return void
	 */
	init : function(el, config) {
		this.collectCommentElements();
		this._commentTemplate = new Ext.Template(
			'<div class="{commentBlockCls} no_events {isSelf}" data-type-id="{commentId}" ">' +
				'<span class="name">{commentOwner}</span>' +
				'<a class="trash">' +
				'<i class="icon-trash"></i>' +
				'</a>' +
				'<span class="timestamp">{timestamp}</span>' +
				'<p class="comment_text">{content}</p>' +
				'<div class="remove_comment">' +
				'<div class="remove_wrap">' +
				'<div class="remove_cell">' +
				'<a class="button remove" size="small">' + Chaos.translate('Delete') + '</a>' +
				'<a class="cancel">' + Chaos.translate('Cancel') + '</a>' +
				'</div>' +
				'</div>' +
				'</div>' +
				'</div>'
		);
		CommentManagerController.superclass.init.call(this, el, config);
		this.addEvents(
			CommentManagerController.EVENT_OVERLAY_CONTENT_READY,
			CommentManagerController.EVENT_INPUT_FOCUS,
			CommentManagerController.EVENT_INPUT_BLUR,
			CommentManagerController.EVENT_SPAM_FILTER
		);

		this._channelType = Config.get('channelType');
	},

	/**
	 * Request the newest comments by ajax
	 * Then activate events on them
	 *
	 * @method refreshComments
	 *
	 * @return void;
	 */
	refreshComments : function() {
		this.getCommentList();
		this.activateCommentBlock();
	},

	/**
	 * Collects comment elements
	 *
	 * @method    collectCommentElements : function() {
	 *
	 * @return void
	 */
	collectCommentElements : function() {
		this.commentElmentsEl = this.element.select(this.commentElmentsSel);
		this.loaderGifEl = this.element.select('.' + this.commentLoaderSel);
		this.noEventCommentEl = this.element.select('.' + this.noEventCommentCls);
	},

	/**
	 * returns the last comment block element
	 *
	 * @method getLastCommentBlock
	 *
	 * @returns {Object} Ext.Element Last Comment Block
	 */
	getLastCommentBlock : function() {
		return Ext.get(this.element.select('.' + this.noEventCommentCls).item(0));
	},

	/**
	 * When comments content changes in the same block,
	 * it replaces, updates comment count, and bind events
	 *
	 * @method onCommentSwap
	 * @param {Object} commentsObj
	 *
	 * @return void;
	 */
	onCommentSwap : function(commentsObj) {
		this.collectCommentElements();
		this.replaceComments(commentsObj);
		this.updateCommentParams(commentsObj);
		this.activateCommentBlock();
	},

	/**
	 * Gather all data that needed to visually append a comment
	 *
	 * @method doAppendComment
	 * @param {String} commentText Text of the comment
	 *
	 * @return void
	 */
	doAppendComment : function(commentText) {
		var commentTemplateData = {
			commentId       : this.missingCommentIdCls,
			timestamp       : 'now',
			commentBlockCls : this.commentBlockCls + ' ' + this.noEventCommentCls,
			content         : commentText,
			commentOwner    : this.performerNick
		};

		var commentTemplate = this._commentTemplate.apply(commentTemplateData);

		this.CommentManagerView.smoothAppend(this.scrollableArea, this.commentWrapperEl, commentTemplate);
	},

	/**
	 * When comment sending is failed,
	 * it catches the model's event
	 *
	 * @param {Object} data Backend data object
	 * @method onCommentFailed
	 *
	 * @return void;
	 */
	onCommentFailed : function(data) {
		this._commentInProgress = false;

		// Spamfilter threw message
		if (typeof data.message === 'string' && data.message.length > 0) {
			this.fireEvent(CommentManagerController.EVENT_SPAM_FILTER, {
				message : data.message,
				scope   : this
			});
		}
		// Spamfilter didnt throw anything = server error
		else {
			this.doAppendComment(data.comment);

			this.lastCommentBlock = this.getLastCommentBlock();
			this.lastCommentBlockIconEl = this.lastCommentBlock.select('.' + this.iconCls).item(0);

			this.CommentManagerView.changeIcon(this.lastCommentBlockIconEl, 'trash', 'retry');
			this.CommentManagerView.markFailedComment();
		}
	},

	/**
	 * When comment sending is successful.
	 *
	 * @method onCommentReady
	 *
	 * @return void;
	 */
	onCommentReady : function(data) {
		this._commentInProgress = false;
		this.commentInputEl.dom.value = '';
		this.doAppendComment(data.comment);
	},

	/**
	 * Binds the failed block ready to retry
	 *
	 * @method bindEventsToFailedComment
	 *
	 * return void;
	 */
	bindEventsToFailedComment : function() {
		//retryIconEl.on('click', this.onRetryIconClick, this);
	},

	/**
	 * Unbinds the failed block(s) when sending was
	 * successful
	 *
	 * @method unbindEventsToFailedComment
	 *
	 * return void;
	 */
	unbindEventsToFailedComment : function() {
		if (this.noEventCommentEl) {
			this.noEventCommentEl.un('click', this.onRetryIconClick, this);
		}
	},

	/**
	 * When you click on retry icon to try
	 * to send the failed comment
	 *
	 * @method onRetryIconClick
	 * @param {Object} ev   Event Object
	 *
	 * @return void;
	 */
	onRetryIconClick : function(ev) {
		ev.preventDefault();
	},

	/**
	 * Get-s the type of the comment
	 *
	 * @method getDetailsForComments
	 * @param {Object} ev       clicked element
	 *
	 * @return void;
	 */
	getDetailsForComments : function(ev) {
		this.commentBlockId = ev.contentId;
	},

	/**
	 * Overlay onShow callback
	 *
	 * @method _CommentBlockShowCallback
	 * @public
	 *
	 * @return void;
	 */
	commentBlockShowCallback : function(response) {
		this.scrollContentEl = this.element.select('.' + this.scrollContentCls);
		if (!this.scrollContentEl.item(0)) {
			return;
		}
		this.overlayCommentCtnEl = this.element.select('.' + this.overlayCommentCtnCls);
		this.replyContainerEl = this.element.select('.' + this.replyContainerCls);
		this.commentInputEl = Ext.get(this.commentInputId);
		this.noCommentBlockEl = Ext.get(this.noCommentsBlockId);
		if (response && response.folderAttributes && response.folderAttributes.owner) {
			this.performerNick = response.folderAttributes.owner;
		}
		this.activateCommentBlockOnInit(response);
		this.bindReplyContainer();
	},

	/**
	 * Updates comment parameters for successful actions
	 *
	 * @method updateCommentParams
	 *
	 * @return void;
	 */
	updateCommentParams : function(commentObj) {
		var commentCount = commentObj.count;
		this.commentBlockId = commentObj.id;
		if (this.commentsNumberEl) {
			this.commentsNumberEl.select('span').item(0).dom.innerHTML = this.translateCommentCount(commentObj.count);
		}
		if (this.noCommentBlockEl) {
			this.noCommentBlockEl.setStyle('display', commentCount ? 'none' : 'block');
		}
	},
	/**
	 * Replace comment content
	 *
	 * @method replaceComments
	 * @param {object} commentsObj   Comments object
	 *
	 * @return void;
	 */
	replaceComments : function(commentsObj) {
		this.CommentManagerView.refreshComments(this.scrollContentEl, commentsObj);
	},

	/**
	 * Translate comment count
	 *
	 * @method translateCommentCount
	 *
	 * @param number
	 * @returns {string} The correct translated comment text
	 */
	translateCommentCount : function(number) {
		switch (parseInt(number, 10)) {
			case 0:
				return Chaos.translate('No comments');
			case 1:
				return Chaos.translate('1 comment');
			default:
				return Chaos.translate('{comments} comments', { comments : number });
		}
	},

	/**
	 * Sets event handlers to the reply container
	 *
	 * @method bindReplyContainer
	 *
	 * @return void;
	 */
	bindReplyContainer : function() {
		this.commentInputEl.on('blur', this.onReplyContainerBlur, this);
		this.commentInputEl.on('focus', this.onReplyContainerFocus, this);
	},

	/**
	 * Removes blur class from reply_container
	 *
	 * @method onReplyContainerBlur
	 *
	 * @return void;
	 */
	onReplyContainerBlur : function() {
		this.replyContainerEl.removeClass(this.replyInpFocusedCls);
		this.fireEvent(CommentManagerController.EVENT_INPUT_BLUR, {
			scope : this
		});
	},

	/**
	 * When reply_container has blur, it gets a class
	 * to show different state
	 *
	 * @method onReplyContainerFocus
	 *
	 * @return void;
	 */
	onReplyContainerFocus : function() {
		this.replyContainerEl.addClass(this.replyInpFocusedCls);
		this.fireEvent(CommentManagerController.EVENT_INPUT_FOCUS, {
			scope : this
		});
	},

	/**
	 * Activates comment block
	 *
	 * @method activateCommentBlock
	 * @public
	 *
	 * @return void;
	 */
	activateCommentBlock : function() {
		this.unbindEventsToFailedComment();
		this.CommentManagerView.hideCommentsLoader(this.loaderGifEl, this.commentElmentsEl);
		if (this._scrollPane && this.commentWrapperEl) {
			this._scrollPane.setHeight(this._scrollPane.computeHeight());
			this._scrollPane.scrollToBottom();
			this._scrollPane.show();
		}
		if (this.contentCompare()) {
			this._scrollableContent.setStyle('bottom', '0');
		}
		else {
			this._scrollableContent.setStyle('bottom', 'auto');
		}
		this.getCommentBlockElements();
		this.activateCommentPostButtons();
	},

	/**
	 * Repositions the content to the bottom
	 *
	 * @method contentCompare
	 * @public
	 *
	 * @return void;
	 */
	contentCompare : function() {
		this._scrollableContent = Ext.get(this.scrollableContentId);
		if (this.commentWrapperEl) {
			var scrollableHeight = this._scrollableContent.dom.scrollHeight,
				contentHeight = this.commentWrapperEl.getHeight();

			return scrollableHeight < contentHeight;
		}
	},

	/**
	 * Activates comment block on Initialization
	 * Callback method of the overlay
	 *
	 * @method activateCommentBlockOnInit;
	 * @param {Object} response  Ajax answer
	 *
	 * @return void;
	 *
	 */
	activateCommentBlockOnInit : function(response) {
		var scrollable = Ext.get(this.scrollableContentId);
		if (!scrollable) {
			return;
		}
		var scrollableHeight = scrollable.getHeight();
		this.commentWrapperEl = this.element.select('.' + this.commentWrapperCls).item(0);
		this.lastCallTimestamp = response.timestamp;
		// set the height of the overlay
		this.CommentManagerView.adjustCommentWrapper(this.commentWrapperEl, this.getCommentWrapperHeight());
		// initially set the bottom position of the scrollable area
		if (scrollableHeight < this.getCommentWrapperHeight()) {
			scrollable.setStyle({ bottom : 0 + 'px' });
		}
		else {
			scrollable.setStyle({ bottom : 'auto' });
		}

		//scrollbar init
		if (this.commentWrapperEl) {
			this._scrollPane = new ChannelScrollPane(this.commentWrapperEl, {
				contentSel         : '.' + this.scrollContentCls,
				isSetHeight        : true,
				isAutoHide         : false,
				hideOnMouseout     : false,
				scrollDelta        : 5,
				isAnimateScrollBar : true,
				useTemplate        : true
			});
		}

		this.activateCommentBlock();
		this.getCommentBlockEvents();
	},

	/**
	 * Returns with the Comment Wrapper Height
	 *
	 * @method getCommentWrapperHeight
	 *
	 * @return Number
	 */
	getCommentWrapperHeight : function() {
		var img = this.element.select(this.contentImgSel).item(0),
			flashContent = Ext.get('flash_video_container'),
			headerHeight = this.element.select(this.commentHeaderSel).item(0).getHeight(),
			formHeight = this.replyContainerEl.item(0).getHeight(),
			containerHeight = this.defaultCommentsHeight;
		if (img) {
			containerHeight = img.getHeight() - headerHeight - formHeight;
		}
		else if (flashContent) {
			containerHeight = flashContent.getHeight() - headerHeight - formHeight;
		}
		return containerHeight;
	},

	/**
	 * Activates only buttons on comment posts
	 * then remove no_event class
	 *
	 * - Trash Icon
	 * - Delete
	 * - Cancel
	 * - Report
	 *
	 * @method activateCommentPostButtons
	 *
	 * @return void;
	 */
	activateCommentPostButtons : function() {
		var self = this;
		this.newCommentItems.each(function() {
			this.select('.' + self.reportCls).on('click', self.onReportBtnClick, self);
			this.select('.' + self.trashIconCls).un('click', self.onTrashIconClick, self);
			this.select('.' + self.trashIconCls).on('click', self.onTrashIconClick, self);
			this.select('.' + self.cancelBtnCls).on('click', self.onCancelClick, self);
			this.select('.' + self.removeBtnCls).on('click', self.onRemoveCommentClick, self);
		});
		this.newCommentItems.removeClass(this.noEventCommentCls);
	},

	/**
	 *
	 * @param dataObj
	 */


	/**
	 * When remove was successful,
	 * touched contents will animate out
	 *
	 * @method animateRemoval
	 *
	 * @return void;
	 **/
	animateRemoval : function(dataObj) {
		var animateParams = {},
			commentElement = this.element.select('[data-type-id="' + dataObj.commentId + '"]').item(0);
		animateParams.basicLeftPos = this.openedComment.getStyle('left');
		animateParams.commentWidth = this.openedComment.getWidth();
		animateParams.slideDistance = this.slidePanel.getWidth() + animateParams.commentWidth;
		animateParams.openedComment = commentElement;

		this.CommentManagerView.commentRemoveSlideLeft(animateParams);
	},

	/**
	 * Updates comment numbers after remove/add
	 *
	 * @method updateCommentNumbers
	 *
	 * return void;
	 */
	updateCommentNumbers : function(totalComments) {
		this.commentsNumberEl.select('span').item(0).dom.innerHTML = this.translateCommentCount(totalComments);
		if (this.noCommentBlockEl) {
			this.noCommentBlockEl.setStyle('display', totalComments ? 'none' : 'block');
		}
	},

	/**
	 * Close the comment block with decreasing the height
	 *
	 * @method closeContent
	 *
	 * @return void;
	 */
	closeContent : function(ev) {
		var response = ev.response;
		var element = ev.element;
		this._saveDeleteResponse = response;

		var animationParams = {};
		animationParams.elementHeight = element.getHeight();
		animationParams.paddingBottom = parseFloat(element.getStyle('padding-bottom').split(['px'])[0]);
		animationParams.paddingTop = parseFloat(element.getStyle('padding-top').split(['px'])[0]);
		animationParams.distance =
			animationParams.elementHeight - animationParams.paddingBottom - animationParams.paddingTop;
		animationParams.element = element;

		this.CommentManagerView.animateCommentRemove(animationParams);
		this.getCommentList();
	},

	/**
	 * Refresh the height of scrollbar, adjust
	 * it to the new content and count the scroll position
	 *
	 * @method refreshScrollbar
	 *
	 * @return void
	 */
	onCommentAnimationDone : function() {
		this._scrollPane.setHeight(this._scrollPane.computeHeight());
	},

	/**
	 * Closes control panel for comments (delete, cancel)
	 *
	 * @method closeControlPanel
	 *
	 * @return void;
	 */
	closeControlPanel : function() {
		for (var i = 0; i < this.commentBlockItems.elements.length; i++) {
			this.CommentManagerView.slideBackForRemoveButtons(
				this.commentBlockItems.item(i),
				this.trashBtnItems,
				this.activeCls);
		}
		this.trashBtnItems.removeClass(this.activeCls);
	},

	/**
	 * If we got the block, we collect the action elements
	 *
	 * @method getCommentBlockElements
	 *
	 * @return void;
	 */
	getCommentBlockElements : function() {
		if (!this.scrollableArea) {
			this.scrollableArea = Ext.get(this.scrollableContentId);
		}
		if (!this.commentContentEl) {
			this.commentContentEl = this.element.select('.' + this.commentContentCls).item(0);
		}
		if (!this.commentsNumberEl) {
			this.commentsNumberEl = Ext.get(this.commentCounterId);
		}
		if (!this.commentWrapperEl) {
			this.commentWrapperEl = Ext.get(this.element.select('.' + this.commentWrapperCls).item(0));
		}
		if (!this.activeContent) {
			this.activeContent =
				Ext.get(this.element.select('.' + this.overlayCommentCtnCls + '.' + this.activeCls).item(0));
		}
		this.newCommentItems = Ext.get(this.element.select('.' + this.noEventCommentCls));
		this.commentSubmitBtn = Ext.get(this.commentSubmitBtnId);
	},

	/**
	 * If we got the block, we turn on the events
	 *
	 * @method getCommentBlockEvents
	 *
	 * @return void;
	 */
	getCommentBlockEvents : function() {
		if (this.commentSubmitBtn) {
			this.commentSubmitBtn.on('click', this.onSubmitBtnClick, this);
			this.commentSubmitBtn.parent('form').on('submit', this.onSubmit, this);
		}
	},

	/**
	 * On trash icon click
	 *
	 * @method onTrashIconClick
	 *
	 * @return void;
	 */
	onTrashIconClick : function(ev) {
		ev.preventDefault();
		var target = Ext.get(ev.target);
		target = target.dom.tagName.toLowerCase === 'a' ? target : target.parent('a');
		this.openedComment = Ext.get(target.findParent('div'));
		this.slidePanel = this.openedComment.select('.' + this.slidePanelCls).item(0);
		this.commentBlockItems = this.scrollableArea.select('.' + this.commentBlockCls);
		this.trashBtnItems = this.scrollableArea.select('.' + this.trashIconCls);

		if (target.hasClass(this.activeCls)) {
			this.CommentManagerView.slideBackForRemoveButtons(this.openedComment, target, this.activeCls);
			target.removeClass(this.activeCls);
		}
		else {
			this.closeControlPanel();
			this.CommentManagerView.slideLeftForRemoveButtons(this.openedComment, this.slidePanel.getWidth());
			target.addClass(this.activeCls);
		}
	},

	/**
	 * When you click on remove comment on control panel
	 *
	 * @method onRemoveCommentClick
	 *
	 * @return void;
	 */
	onRemoveCommentClick : function(ev) {
		ev.preventDefault();
		var target = Ext.get(ev.target),
			parentId = target.findParent('.' + this.overlayCommentCtnCls).getAttribute('data-comment-id'),
			commentId = target.findParent('.' + this.commentBlockCls).getAttribute('data-type-id');
		this.CommentManagerModel.removeContent(
			Chaos.getUrl(
				this.removeCommentUrl),
			{
				parentid  : parentId,
				commentid : commentId,
				timestamp : this.lastCallTimestamp
			},
			{
				channelType : this._channelType
			});
	},

	/**
	 * When you click on cancel btn, it closes the control panel
	 *
	 * @method onCancelClick
	 *
	 * @return void;
	 */
	onCancelClick : function(ev) {
		ev.preventDefault();
		this.closeControlPanel();
	},

	/**
	 * On Submit event handler for IE 8
	 *
	 * @onSubmit
	 * @param {Object} ev  Event Object
	 *
	 * @return void
	 */
	onSubmit : function(ev) {
		this.onSubmitBtnClick(ev);
	},

	/**
	 * When you send a comment
	 *
	 * @method onSubmitBtnClick
	 *
	 * @return void;
	 */
	onSubmitBtnClick : function(ev) {
		ev.preventDefault();
		var inputValue = Util.escapeHTML(this.commentInputEl.getValue().trim());
		this.overlayCommentCtnEl = this.element.select('.' + this.overlayCommentCtnCls).item(0);
		this.commentBlockId = this.overlayCommentCtnEl.dom.getAttribute('data-comment-id');

		if (this._commentInProgress || inputValue.length < 1) {
			return;
		}

		this._commentInProgress = true;

		var postCommentUrl = Chaos.getUrl(this.postCommentUrl, {}, { channelType : this._channelType });

		if (inputValue.length === 0) {
			return;
		}
		var commentData = {
			id        : this.commentBlockId,
			content   : inputValue,
			timestamp : 'now'
		};

		this.CommentManagerModel.postComment(postCommentUrl, commentData);
	},

	/**
	 * Get the entire list of comments
	 *
	 * @method getCommentList
	 *
	 * @return void;
	 */
	getCommentList : function() {
		var overlayCommentEl = this.element.select('.' + this.overlayCommentCtnCls).item(0);
		this.commentBlockId = overlayCommentEl.dom.getAttribute('data-comment-id');
		this.commentListUrl =
			Chaos.getUrl(this.updateCommentUrl,
				{
					parentId          : this.commentBlockId,
					lastItemTimeStamp : 0 },
				{
					channelType : this._channelType
				}
			);
		this.CommentManagerModel.getComments(this.commentListUrl);
	},

	/*
	 * Generates the post again after Create and Delete
	 *
	 * @method onCommentsRefresh
	 *
	 * @return void;
	 */
	onCommentsRefresh : function(response) {
		var commentArray = response.content;
		var commentCount = response.count;

		// Refresh Timestamp
		this.lastCallTimestamp = response.last_read_time;
		this.updateCommentNumbers(commentCount);
		this.CommentManagerView.makeEmpty(this.scrollableArea);
		for (var i = 0; i < commentArray.length; i++) {
			var isLast = i === commentArray.length - 1;
			var templateParams = {
				commentBlockCls : this.commentBlockCls,
				commentId       : commentArray[i].id,
				commentOwner    : commentArray[i].owner,
				timestamp       : commentArray[i].createdAt,
				content         : commentArray[i].content,
				isSelf          : commentArray[i].isPerformerOwner ? 'self' : ''
			};
			this.CommentManagerView.appendContent(
				this.scrollableArea,
				this._commentTemplate.apply(templateParams),
				isLast
			);
		}
		this._commentInProgress = false;
	},

	/**
	 * Binds the initial event handlers
	 */
	bind : function() {
		CommentManagerController.superclass.bind.call(this);
	},

	/**
	 * Unbinds all event handlers
	 */
	unbind : function() {
		CommentManagerController.superclass.unbind.call(this);
	}
});
