import $ from 'jquery';

import Ext from '../../lib/vendor/ExtCore';
import Chaos from '../../lib/chaos/Chaos';
import ChaosObject from '../../lib/chaos/Object';
import Util from '../../lib/chaos/Util';

/**
 * View of CommentManagerView
 */
export default function CommentManagerView(el, config) {
	CommentManagerView.superclass.constructor.call(this, el, config);
}

Ext.apply(CommentManagerView, {
	EVENT_APPEND_CONTENT_DONE             : 'on-append-content-done',
	EVENT_REPLACE_CONTENT_DONE            : 'on-replace-content-done',
	EVENT_REMOVE_CONTENT_DONE             : 'on-remove-content-done',
	EVENT_REPLACE_COMMENTS_DONE           : 'on-replace-comments-done',
	EVENT_COMMENT_COLLAPSE_ANIMATION_DONE : 'on-comment-collapse-animation-done',
	EVENT_SCROLL_CONTENT_AFTER_REMOVE     : 'on-scroll-content-after-remove',
	EVENT_COMMENT_REMOVE_SLIDE_LEFT_DONE  : 'on-comment-remove-slide-left-done',
	EVENT_FAILED_COMMENT_SKIN_READY       : 'on-failed-comment-skin-ready',
	EVENT_COMMENT_REFRESH_DONE            : 'on-comment-refresh-done'
}, {});

Chaos.extend(CommentManagerView, ChaosObject, {
	/** @var {String}                                View name. */
	name                : 'CommentManagerView',
	/** @var {String}           Each of the comment elements are inside the block with this cls */
	commentBlockCls     : 'comment_block',
	/** @var {String}           Just added cls */
	justAddedCls        : 'just_added',
	/** @var {String}           Reply Container Selector */
	replyContainer      : 'reply_container',
	/** @var {String}           Comment content cls */
	commentContentCls   : 'comment_wrapper',
	/** @var {String}           "Data-type" attribute name of the content block parent to get its ID */
	dataTypeIdAttribute : 'data-type-id',
	/** @var {String}    Class name of a folder. */
	folderClass         : 'montage_picture',
	/** @var {String}    Item selector for the documents */
	itemSelector        : 'article',
	/** @var {String}    comment Input ID */
	commentInputId      : 'comment_input',

	/* PRIVATE VARS */

	/** @var {Number}           The height of comment content */
	_commentContentHeight : 0,

	/**
	 * Standard init function
	 *
	 * @param {Object} el
	 * @param {Object} config
	 *
	 * @return void
	 */
	init : function(el, config) {
		CommentManagerView.superclass.init.call(this, el, config);
		this.addEvents(
			CommentManagerView.EVENT_APPEND_CONTENT_DONE,
			CommentManagerView.EVENT_REPLACE_CONTENT_DONE,
			CommentManagerView.EVENT_REMOVE_CONTENT_DONE,
			CommentManagerView.EVENT_REPLACE_COMMENTS_DONE,
			CommentManagerView.EVENT_COMMENT_COLLAPSE_ANIMATION_DONE,
			CommentManagerView.EVENT_SCROLL_CONTENT_AFTER_REMOVE,
			CommentManagerView.EVENT_COMMENT_REMOVE_SLIDE_LEFT_DONE,
			CommentManagerView.EVENT_COMMENT_REFRESH_DONE
		);
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
	},

	/**
	 * Animate Comment Collapsing with decreasing the height
	 *
	 * @method animateCommentRemove     *
	 * @param animationParams Contents the animation parameters
	 *
	 * @return void
	 */
	animateCommentRemove : function(animationParams) {
		animationParams.element.setStyle('overflow', 'hidden');
		animationParams.element.setStyle('border', '0');

		TweenMax.fromTo(
			animationParams.element.dom,
			0.5,
			{
				css : {
					height        : animationParams.distance + 'px',
					paddingTop    : animationParams.paddingTop + 'px',
					paddingBottom : animationParams.paddingBottom + 'px'
				}
			},
			{
				css : {
					height        : 0 + 'px',
					paddingTop    : 0 + 'px',
					paddingBottom : 0 + 'px'
				},
				onCompleteScope : this,
				onComplete      : function() {
					this.fireEvent(CommentManagerView.EVENT_COMMENT_COLLAPSE_ANIMATION_DONE);
				}
			}
		);
	},

	/**
	 * Appends content
	 *
	 * @method appendContent
	 * @param {Object} parent       [Ext.element] Where to append the content
	 * @param {Object} content      Content to append
	 * @param {Boolean} isLast      True if it appends the last element
	 *
	 * @return {Object} scope chain
	 */
	appendContent : function(parent, content, isLast) {
		Ext.DomHelper.append(parent, content);
		if (isLast) {
			this.fireEvent(CommentManagerView.EVENT_COMMENT_REFRESH_DONE);
		}
		return this;
	},

	/**
	 * Slide back to hide the delete buttons
	 *
	 *
	 * @method slideBackForRemoveButtons
	 * @param {Object}  element     [Ext.element]
	 *
	 * @return {Object} scope chain
	 */
	slideBackForRemoveButtons : function(element) {
		TweenMax.to(
			element.dom,
			0.4,
			{
				left : 0
			}
		);
		return this;
	},

	/**
	 * Slide left to show the delete buttons
	 *
	 * @method slideLeftForRemoveButtons
	 *
	 * @param {Object} element              [Ext.element]
	 * @param {Number} slidePanelWidth      slidePanelWidth
	 *
	 * @return {Object} scope chain
	 */
	slideLeftForRemoveButtons : function(element, slidePanelWidth) {
		TweenMax.to(
			element.dom,
			0.4,
			{
				left : '-' + slidePanelWidth + 'px'
			}
		);
		return this;
	},

	/**
	 * Refresh comment content
	 *
	 * @method refreshComments
	 * @param {Object}  containerEl     Container [Ext.element]
	 * @param {Object}  detailsObj      Details for new content
	 *
	 * @return void;
	 */
	refreshComments : function(containerEl, detailsObj) {
		var comments = detailsObj.content;
		if (containerEl) {
			containerEl.item(0).dom.innerHTML = this.forgeTemplates(comments);
		}
	},

	/**
	 * Makes a piece of html fragment of
	 * all comment blocks
	 *
	 * @method forgeTemplates
	 * @param {Array}   commentsArray   Comments Array
	 *
	 * @return {object} html fragment
	 */
	forgeTemplates : function(commentsArray) {
		var output = '';
		for (var i = 0; i < commentsArray.length; i++) {
			var commentData = {
				commentBlockCls : this.commentBlockCls,
				commentId       : commentsArray[i].id,
				commentOwner    : Util.escapeHTML(commentsArray[i].owner),
				timestamp       : commentsArray[i].createdAt,
				content         : Util.escapeHTML(commentsArray[i].content),
				isSelf          : commentsArray[i].is_performer ? 'self' : ''
			};
			output += this._commentTemplate.apply(commentData);
		}
		return output;
	},

	/**
	 * Shows a tooltip on the input element with a message and an alert.
	 *
	 * @param {String} message Tooltip message
	 *
	 * @return void;
	 */
	showInputTooltip : function(message) {
		$(this.commentInputId).protipShow({
			title    : message,
			icon     : 'alert',
			position : 'bottom'
		});
	},

	/**
	 * Hides the input tooltip
	 *
	 * @return void;
	 */
	hideInputTooltip : function() {
		$(this.commentInputId).protipHide();
	},

	/**
	 * AnimateComment Delete Slide left
	 *
	 * @param animateParams
	 *
	 * @return {Object} scope chain
	 */
	commentRemoveSlideLeft : function(animateParams) {
		TweenMax.fromTo(
			animateParams.openedComment.dom,
			0.4,
			{
				css : {
					left : animateParams.basicLeftPos
				}
			},
			{
				css : {
					left : '-' + animateParams.slideDistance
				},
				onComplete : function() {
					this.fireEvent(CommentManagerView.EVENT_COMMENT_REMOVE_SLIDE_LEFT_DONE, {
						element : animateParams.openedComment
					});
				},
				onCompleteScope : this
			}
		);
		return this;
	},

	/**
	 * Places the last comment softly
	 *
	 * @method smoothAppend
	 * @param {Object} scrollable       [Ext.element] Scrollable content element
	 * @param {Object} parent           [Ext.element] Parent element of scrollable element
	 * @param {Object} content          Ext items content to append
	 *
	 * @return {Object} scope chain
	 */
	smoothAppend : function(scrollable, parent, content) {
		var fakeWrapper = '<div class="comment_wrapper fake"></div>';
		var commentContent = Ext.select('.comment_content').item(0);
		fakeWrapper = Ext.DomHelper.append(commentContent, fakeWrapper, true);
		var commentBlock = Ext.DomHelper.append(fakeWrapper, content, true);
		var fakeElHeight = commentBlock.getHeight();
		var scrollableHeight = scrollable.getHeight();
		var commentWrapperHeight = parent.getHeight();
		commentBlock.hide();

		parent.setStyle('z-index', '2000');
		TweenMax.fromTo(
			parent.dom,
			0.4,
			{
				css : {
					bottom : 0 + 'px'
				}
			},
			{
				css : {
					bottom : fakeElHeight + 'px'
				},
				onCompleteScope : this,
				onComplete      : function() {
					Ext.DomHelper.append(scrollable, content);
					parent.setStyle({ bottom : 0 + 'px' });
					if (scrollableHeight + fakeElHeight < commentWrapperHeight) {
						scrollable.setStyle({ bottom : 0 + 'px' });
					}
					else {
						scrollable.setStyle({ bottom : 'auto' });
					}
					fakeWrapper.remove();
					this.fireEvent(CommentManagerView.EVENT_APPEND_CONTENT_DONE);
				}
			}
		);

		TweenMax.fromTo(
			fakeWrapper.dom,
			0.4,
			{
				css : {
					height : 0 + 'px'
				}
			},
			{
				css : {
					height : fakeElHeight + 'px'
				}
			}
		);
		return this;
	},

	/**
	 * Indicate the failed comment field with
	 * icon and error message
	 *
	 * @method markFailedComment
	 *
	 * @param {Object}  failedCommentEl     Failed comment container element
	 * @param {Object}  errorClass          Element of timestamp of the
	 * @param {Object}  timeStampEl         Timestamp container element
	 * @param {String}  errorMessage        Error message to show
	 *
	 * @return {Object} this        Scope to chain
	 */
	markFailedComment : function() {
		this.fireEvent(CommentManagerView.EVENT_FAILED_COMMENT_SKIN_READY);
		return this;
	},

	/**
	 * Show comments loader
	 *
	 * @method showCommentsLoader
	 *
	 * @return void
	 */
	hideCommentsLoader : function(loaderEl, mainEls) {
		mainEls.setStyle('display', 'block');
		loaderEl.setStyle('display', 'none');
	},

	/**
	 * Changes an icon class
	 *
	 * @method changeIcon
	 *
	 * @param {Object} iconElement      [Ext.element] Icon element
	 * @param {String} iconClsFrom      Icon class we would like to remove
	 * @param {String} iconClsTo        Icon class we would like to add
	 *
	 * @return void;
	 */
	changeIcon : function(iconElement, iconClsFrom, iconClsTo) {
		if (iconElement) {
			iconElement.removeClass(iconClsFrom);
			iconElement.addClass(iconClsTo);
		}
	},

	/**
	 * Adjust Comment Box Height by JS to the picture size
	 *
	 * @method adjustCommentWrapper
	 *
	 * @param {Object} wrapper  [Ext.element] Wrapper element
	 * @param {Nummer} height   Height value
	 *
	 * @return {Object} scope chain
	 */
	adjustCommentWrapper : function(wrapper, height) {
		wrapper.setHeight(height);
		return this;
	},

	/**
	 * Removes the selected element
	 *
	 * @method removeContent
	 * @param {Object} element  [Ext.element]
	 *
	 * @return {Object} scope chain
	 */
	removeContent : function(element) {
		element.remove();
		this.fireEvent(CommentManagerView.EVENT_REMOVE_CONTENT_DONE);
		return this;
	},

	/**
	 * Removes content from the selected element
	 *
	 * @method makeEmpty
	 *
	 * @return {Object} scope chain
	 */
	makeEmpty : function(element) {
		element.dom.innerHTML = '';
		return this;
	},

	bind : function() {
		Ext.getBody().on('click', this.hideInputTooltip, this);
		Ext.fly(window).on('keydown', this.hideInputTooltip, this);
	},

	unbind : function() {
		setTimeout(function() {
			Ext.getBody().un('click', this.hideInputTooltip, this);
			Ext.fly(window).un('keydown', this.hideInputTooltip, this);
		}.bind(this), 0);
	}
});
