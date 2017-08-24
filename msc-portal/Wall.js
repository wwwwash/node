import TweenMax from 'gsap';

import Ext from '../../../lib/vendor/ExtCore';
import Chaos from '../../../lib/chaos/Chaos';
import Page from '../../../lib/chaos/Page';
import Util from '../../../lib/chaos/Util';
import Connection from '../../Ajax/Connection';

import CONST from '../../../lib/constant/Constants';

import ShowMore from '../../ShowMore/ShowMore';
import Overlay from '../../Overlay/Overlay';
import AdvancedTextarea from '../../_Form/AdvancedTextarea';

import './Wall.scss';

export default function Wall(el, config) {
	Wall.superclass.constructor.call(this, el, config);
}

Chaos.extend(Wall, Page, {

	/** @var {String}                Bold button's selector */
	boldBtnSel      : '.boldButton',
	/** @var {String}                Italic button's selector */
	italicBtnSel    : '.italicButton',
	/** @var {String}                Underline button's selector */
	underlineBtnSel : '.underlineButton',

	/** @var {String}               The main Post textarea on the top - ID */
	wallMessageTxtId   : 'wallMessage',
	/** @var {String}               Showmore container on the bottom - ID */
	showMoreHolderId   : 'showMoreHolder',
	/** @var {String}               Comment - post reply buttons' selector */
	replyBtnSel        : '.reply',
	/** @var {String}               Comment - post reply buttons' selector */
	editBtnSel         : '.edit',
	/** @var {String}               Edit->Cancel buttons' selector */
	cancelBtnSel       : '.cancelBtn',
	/** @var {String}               Clear buttons' selector */
	clearBtnSel        : '.clearBtn',
	/** @var {String}               Edit->Cancel buttons' selector */
	sendBtnSel         : '.sendCommentBtn',
	/** @var {String}               If a Wall element (li) is not a post,but comment, it gets this class */
	commentElCls       : 'comment',
	/** @var {String}               postForm ID - Post texteditor on the top */
	postFormId         : 'postForm',
	/** @var {String}               Selector of the Element that represents a page */
	listBlockSel       : '.posts',
	/** @var {String}               This link toggles the More-Less info */
	showLessTogglerId  : 'wallMoreInfo',
	/** @var {String}               Comment/edit textareas' selector */
	commentTxtareaSel  : '.commentTxtarea',
	/** @var {String}               Comment / edit form class */
	commentFormCls     : 'commentForm',
	/** @var {String}               Comment / edit form id */
	commentFormId      : 'commentForm',
	/** @var {String}               comment box Ripple anim element selector */
	rippleSel          : '.ripple',
	/** @var {String}               Ripple animation trigger cls */
	rippleAnimCls      : 'animate',
	/** @var {String}               Paragraphs inside the postText , 2 lines */
	postTextSel        : '.postText',
	/** @var {String}               A container that contains post actions, like reply, edit and delete */
	postActionsSel     : '.postActions',
	/** @var {String}               Class that indicates hidden state */
	hiddenCls          : 'hidden',
	/** @var {String}               Form class. Every comment, and edit form's common class */
	formCls            : 'form',
	/** @var {String}               ID of the insert form. */
	insertFormId       : 'insertForm',
	/** @var {String}               Character counter element class */
	charCounterCls     : 'charCounter',
	/** @var {String}               Name of the global data object */
	globalDataObjName  : 'globalDataObj',
	/** @var {String}               Common Submit button selector */
	submitSel          : 'button[type="submit"]',
	/** @var {String}               Button container inside the comment form sel. */
	buttonContainerSel : '.buttonContainer',

	/** @var {String}               Editor button container DomHelper template */
	buttonContainerTpl : undefined,
	/** @var {String}               CommentBox button container DomHelper template */
	commentBoxTpl      : undefined,

	/** @var {String}               Selection start position in the text editor */
	_selectionStart : undefined,
	/** @var {String}               Selection end position in the text editor */
	_selectionEnd   : undefined,
	/** @var {Object}               Send btn of the comment textarea */
	_sendBtnEl      : undefined,
	/** @var {Object}               Send btn of the comment textarea */
	_clearBtnEl     : undefined,
	/** @var {Object}               Wall insert post message element */
	_wallMessageEl  : undefined,
	/** @var {Object}               Show more button element */
	_showMoreBtnEl  : undefined,
	/** @var {Object}               SHow more component */
	_showMoreCmp    : undefined,

	/**
	 * Init
	 *
	 * @param {Element} el      This should be the body tag.
	 * @param {Object} config   Config object of this component
	 */
	init : function(el, config) {
		// Character counter instance for the insert form
		this._wallMessageEl = Ext.get(this.wallMessageTxtId);
		Util.characterCounter(this._wallMessageEl, this.charCounterCls.dot(), this.globalDataObjName);

		// Elements
		this._showMoreBtnEl = Ext.get(this.showMoreHolderId);
		this._wallMessageTxtEl = Ext.get(this.wallMessageTxtId);

		// Show more Component
		if (this._showMoreBtnEl) {
			this._showMoreCmp = new ShowMore(
				Ext.get('pageContainer'),
				{
					listBlockSel    : this.listBlockSel,
					successCallback : this.onShowMore,
					callbackScope   : this
				});
		}

		// Advanced Textarea
		new AdvancedTextarea(this._wallMessageEl, {});

		this.defineTemplates();

		// Init futtatasa
		Wall.superclass.init.call(this, el, config);
	},

	/**
	 * Defining templates with the appropriate language captions
	 */
	defineTemplates : function() {
		// Button Container Template
		this.buttonContainerTpl = {
			tag      : 'div',
			cls      : 'buttonContainer',
			children : [
				{
					tag  : 'button',
					type : 'submit',
					html : Chaos.translate('Send'),
					cls  : 'button sendCommentBtn',
					size : 'tiny'
				},
				{
					tag    : 'a',
					cls    : 'button clearBtn',
					size   : 'tiny',
					scheme : 'tertiary',
					href   : '#',
					html   : Chaos.translate('Clear')
				},
				{
					tag    : 'a',
					cls    : 'button cancelBtn',
					size   : 'tiny',
					scheme : 'secondary',
					href   : '#',
					html   : Chaos.translate('Cancel')
				}
			]
		};

		// Comment Box Template
		this.commentBoxTpl = [
			{
				tag      : 'div',
				cls      : 'inputs TC commentBox',
				children : [
					{
						tag   : 'input',
						type  : 'hidden',
						name  : 'commentToPost',
						value : '0'
					},
					{
						tag         : 'textarea',
						placeholder : Chaos.translate('You can write your message here'),
						maxlength   : '4000',
						cls         : 'commentTxtarea',
						id          : 'commentTxtarea'
					},
					{
						tag : 'span',
						cls : 'ripple'
					}
				]
			},
			{
				tag      : 'div',
				cls      : 'charCounter',
				children : {
					tag : 'span'
				}
			}
		];

		this.commentFormTpl = {
			tag      : 'div',
			id       : 'commentForm',
			cls      : 'commentForm form old-form',
			action   : '',
			method   : 'post',
			children : [
				this.commentBoxTpl,
				this.buttonContainerTpl
			]
		};
	},

	/**
	 * Show more success callback function.
	 */
	onShowMore : function() {
		this.findCommentBoxElements();
	},

	/**
	 * (re)Initing the comment boxes' elements, and (re)attaches event handlers to them
	 */
	findCommentBoxElements : function() {
/*		this._boldBtnEls         = this.element.select(this.boldBtnSel);
		this._italicBtnEls       = this.element.select(this.italicBtnSel);
		this._underlineBtnEls    = this.element.select(this.underlineBtnSel);*/


/*		this._boldBtnEls.removeAllListeners().on('click', this.formatClick, this, {bbCode: 'B'});
		this._italicBtnEls.removeAllListeners().on('click', this.formatClick, this, {bbCode: 'I'});
		this._underlineBtnEls.removeAllListeners().on('click', this.formatClick, this, {bbCode: 'U'});*/

/*		this._commentTxtEls.removeAllListeners().on('mousedown', this.attachTextareaRangeCheckerEvent ,this);*/

		var textEls = this.element.select(this.commentTxtareaSel);

		textEls.removeAllListeners().on({
			focus : this.onInputFocus,
			blur  : this.onInputBlur,
			keyup : this.onInputKeyup,
			scope : this
		});

		this._replyBtnEls = this.element.select(this.replyBtnSel);
		this._editBtnEls = this.element.select(this.editBtnSel);
		this._clearBtnEl = this.element.select(this.clearBtnSel);

		this._replyBtnEls.removeAllListeners().on('click', this.onReplyBtnClick, this);
		this._editBtnEls.removeAllListeners().on('click', this.onEditBtnClick, this);
		this._clearBtnEl.removeAllListeners().on('click', this.onClearBtnClick, this);

		this._sendBtnEls = this.element.select(this.sendBtnSel);
		this._sendBtnEls.removeAllListeners().on('click', this.onSendClick, this);


		this._cancelBtnEls = this.element.select(this.cancelBtnSel);
		this._cancelBtnEls.removeAllListeners().on('click', this.onCancelBtnClick, this);

		Chaos.fireEvent(Overlay.UPDATE_OPEN_OVERLAY_ELEMENTS);
	},

	/**
	 * Append post textarea to the bottom of the replies
	 *
	 * @param ev
	 * @param target
	 */
	onReplyBtnClick : function(ev, target) {
		ev.preventDefault();
		ev.stopPropagation();

		/* Find the place of the post box (after the post or after the comments) */
		var self = this,
			targetEl = Ext.get(target),
			// target's parent LI (post box) element
			targetPostLiEl = targetEl.findParent('li', null, true),
			targetCommentUlEl = targetPostLiEl.select('ul').item(0),
			commentBoxEl;

		// Append form if not exists
		if (targetCommentUlEl.select(this.commentFormCls.dot()).elements.length === 0) {
			this.removeTexteditors();
			// add new comment box
			commentBoxEl = this.insertCommentFormInto(targetCommentUlEl);
		}
		else {
			commentBoxEl = targetCommentUlEl.select(this.commentFormCls.dot()).item(0);
		}
		// ... scroll there if necessary, and flash it !
		var	vpHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0),
			isVisibleOnVP = commentBoxEl.getBottom() < Util.getScrollTop() + vpHeight,
			commentBoxHeight = commentBoxEl.getHeight();

		var scrollDelay = 0;

		if (!isVisibleOnVP) {
			var y = commentBoxEl.getY() - vpHeight + commentBoxHeight + 20;
			scrollDelay = 1;

			TweenMax.to(
					window,
					scrollDelay,
				{
					scrollTo   : { y : y, autoKill : false },
					onComplete : function() {

					}
				}
				);
		}

		var rippleEl = commentBoxEl.select(this.rippleSel).item(0);

		// Add ripple animation class, with the calculated delay
		setTimeout(function() {
			rippleEl.addClass(self.rippleAnimCls);
		}, scrollDelay * 1000);

		// Remove ripple class
		rippleEl.on({
			animationend       : function() { rippleEl.removeClass(self.rippleAnimCls) },
			webkitAnimationEnd : function() { rippleEl.removeClass(self.rippleAnimCls) },
			MSAnimationEnd     : function() { rippleEl.removeClass(self.rippleAnimCls) },
			oAnimationEnd      : function() { rippleEl.removeClass(self.rippleAnimCls) },
			single             : true
		});
	},

	/**
	 * On Edit Btn Click
	 *
	 * @param ev
	 * @param target
	 */
	onEditBtnClick : function(ev, target) {
		ev.preventDefault();

		// Find text to edit element
		var closestLi = Ext.get(target).findParent('li', null, true),
			editParagraphEl = closestLi.select(this.postTextSel + ' p').item(1),
			postActionsEl = editParagraphEl.parent().next(this.postActionsSel);

		editParagraphEl.addClass(this.hiddenCls);
		postActionsEl.addClass(this.hiddenCls);

		this.removeTexteditors();

		this.setEditText(editParagraphEl.dom.innerHTML, editParagraphEl);
	},

	/**
	 * On input keyup. Sets send button to disabled or enabled
	 *
	 * @param ev
	 * @param target
	 */
	onInputKeyup : function(ev, target) {
		var targetEl = Ext.get(target),
			sendBtn = targetEl.parent().next(this.buttonContainerSel).select(this.submitSel).item(0);

		sendBtn.dom.disabled = !target.value.length;
	},

	/**
	 * Sets a post or comment to editing state. Changes the text paragraph to a textarea.
	 *
	 * @param text Text that we want to put into the textarea
	 * @param insertAfterEl The place of the form
	 */
	setEditText : function(text, insertAfterEl) {
		var editFormEl = this.insertCommentFormInto(insertAfterEl, true),
			editTextareaEl = editFormEl.select('textarea').item(0);

		// Strip html

		var strippedText = text.replace(/<\/?[^>]+(>|$)/g, '');
		editTextareaEl.dom.value = strippedText.trim();
	},

	/**
	 * Clears the previous textarea
	 *
	 * @param ev
	 * @param target
	 */
	onClearBtnClick : function(ev, target) {
		ev.preventDefault();
		var formEl = Ext.get(target).findParent(this.formCls.dot(), null, true),
			textarea = formEl.select('textarea').item(0);

		formEl.select(this.submitSel).item(0).dom.disabled = true;

		textarea.dom.value = '';
	},

	/**
	 * Remove and destroy all the opened text editors (comment forms, edit forms) from the page
	 * (except the upper one, the Post box)
	 */
	removeTexteditors : function() {
		var self = this;
		// remove and destroy prev comment/edit boxes
		Ext.getBody().select(this.formCls.dot()).each(function() {
			if (this.id !== self.insertFormId) {
				// in case of editing in a post. it shows the previously hidden text paragraph
				if (this.prev()) {
					this.prev().removeClass(self.hiddenCls);
				}
				// if it have a postText parent, this is an edit box
				if (this.findParent(self.postTextSel, null, true)) {
					this.parent().next(self.postActionsSel).removeClass(self.hiddenCls);
				}
				this.remove();
			}
		});
	},

	/**
	 * Inserts a comment form after the given element, with the given replyId
	 *
	 * @param el The element which you want to insert into.
	 * @param edit If this box will be and edit box.
	 * @returns {*}
	 */
	insertCommentFormInto : function(el, edit) {
		var self = this,
			tpl = this.commentFormTpl,
			formEl;

		// Insert template
		if (edit) {
			tpl.id = 'editFrom';
			tpl.cls = 'editFrom form old-form';
			formEl = Ext.get(Ext.DomHelper.insertAfter(el, tpl));
		}
		else {
			formEl = Ext.get(Ext.DomHelper.insertFirst(el, tpl));
			// Disable submit button
			formEl.select(this.submitSel).item(0).dom.disabled = true;
		}


		this.findCommentBoxElements();

		// Find the comment textarea
		var commentTxtareaEl = formEl.select(this.commentTxtareaSel).item(0);

		// Character counter
		setTimeout(function() {
			Util.characterCounter(commentTxtareaEl, self.charCounterCls.dot(), self.globalDataObjName);
			// Advanced Textarea
			new AdvancedTextarea(commentTxtareaEl, {});
		}, 100);

		commentTxtareaEl.on({
			focus : this.onInputFocus,
			blur  : this.onInputBlur,
			scope : this
		});

		return formEl;
	},

	/**
	 * When we want to send a comment.
	 *
	 * @param ev
	 * @param target
	 */
	onSendClick : function(ev, target) {
		ev.preventDefault();

		var targetEl = Ext.get(target);

		if (targetEl.dom.disabled) {
			return;
		}

		var commentFormEl = targetEl.findParent(this.formCls.dot(), 3, true),
			message = commentFormEl.select('textarea').item(0).getValue(),
			parentLiEl = commentFormEl.findParent('li', null, true),
			ajaxRoute,
			replyId = parentLiEl ? parentLiEl.dom.getAttribute('data-reply-id') : '',
			postId = parentLiEl ? parentLiEl.dom.getAttribute('data-post-id') : '';


		// Adding postid to a queryparam object
		var postParams = {
			commentFormEl : commentFormEl,
			message       : message
		};

		// If data-reply-is set, append it to the queryparam object
		if (replyId && replyId !== '') {
			postParams.replyId = replyId;
		}

		if (Ext.fly(target).findParent('.box', 5, true)) {
			ajaxRoute = 'Wall/EditPost';
		}
		else if (Ext.fly(target).findParent(this.listBlockSel, null, true)) {
			ajaxRoute = 'Wall/ReplyPost';
		}
		else {
			ajaxRoute = 'Wall/InsertPost';
		}

		let C = new Connection();

		C.request({
			type     : CONST.TYPE_JSON,
			url    	 : Chaos.getUrl(ajaxRoute, { postId : postId }),
			params   : postParams,
			scope    : this,
			success  : this.onSendSucces,
			error    : this.onSendError,
			failure  : this.onSendFailure,
			method 	 : CONST.POST,
			synchron : true
		});
	},

	/**
	 * If edit-post request is success.
	 *
	 * @param response
	 * @param request
	 */
	onSendSucces : function(response, request) {
		var block = response.json.data.block,
		// We shall append the post after it.
			commentFormEl = request.params.commentFormEl,
			postEl = commentFormEl.findParent('.post', null, true);

		// If reply valid
		if (block !== '') {
			var blockTpl = new Ext.Template(block);
			this.removeTexteditors();
			if (postEl) {
				blockTpl.insertAfter(postEl);
				postEl.remove();
			}
			this.findCommentBoxElements();
		}
		// On reply error
		else {
			/* develblock:start */
			console.warn('no block answer');
			/* develblock:end */
		}
	},

	/**
	 * @param response
	 */
	onSendError : function(response) {
		/* develblock:start */
		console.warn('Send error.', response);
		/* develblock:end */
	},

	/**
	 * @param response
	 */
	onSendFailure : function(response) {
		/* develblock:start */
		console.warn('Send failure.', response);
		/* develblock:end */
	},

	/**
	 * Cancel buttons, remove all text editors
	 *
	 * @param ev
	 */
	onCancelBtnClick : function(ev) {
		ev.preventDefault();

		this.removeTexteditors();
	},

	/**
	 * On Input focus, show the character counter
	 *
	 * @param ev
	 * @param target
	 */
	onInputFocus : function(ev, target) {
		var el = Ext.get(target),
			charCntrEl = el.parent().child(this.charCounterCls.dot());

		if (!charCntrEl) {
			charCntrEl = el.parent().next(this.charCounterCls.dot());
		}

		TweenMax.to(
			charCntrEl.dom,
			0.2,
			{
				opacity : 1
			}
		);
	},

	/**
	 * On Input blur, hide the character counter
	 *
	 * @param ev
	 * @param target
	 */
	onInputBlur : function(ev, target) {
		var el = Ext.get(target),
			charCntrEl = el.parent().child(this.charCounterCls.dot());

		if (!charCntrEl) {
			charCntrEl = el.parent().next(this.charCounterCls.dot());
		}

		TweenMax.to(
			charCntrEl.dom,
			0.2,
			{
				opacity : 0
			}
		);
	},


	/**
	 * When we click on a format button, insert the BBcode to the nearest txtarea
	 *
	 * @DEPRECATED
	 *
	 * @param ev
	 * @param target
	 * @param options {bbCode: 'B'}
	 */
	formatClick : function(ev, target, options) {
		ev.preventDefault();
		ev.stopPropagation();

		var startBBcode = '[' + options.bbCode + ']',
			endBBcode = '[/' + options.bbCode + ']',
			newString,
			txtAreaEl = Ext.get(target).parent().prev().select('textarea').item(0);

		// Insert Open tag
		if (this._selectionStart >= 0 && this._selectionEnd >= 0) {
			newString = this.insertToStringByIndex(
				txtAreaEl.dom.value,
				this._selectionStart,
				startBBcode
			);

			newString = this.insertToStringByIndex(
				newString,
				this._selectionEnd + startBBcode.length,
				endBBcode
			);

			txtAreaEl.dom.value = newString;
		}
	},

	/**
	 * Inserting a substring into a string
	 *
	 * @DEPRECATED
	 *
	 * @param oldString The string that we want to extend
	 * @param position position where extend
	 * @param what what to extend
	 * @returns {string} the complete string
	 */
	insertToStringByIndex : function(oldString, position, what) {
		return [oldString.slice(0, position), what, oldString.slice(position)].join('');
	},

	/**
	 * Get start and end position of selection in a form input
	 *
	 * @DEPRECATED
	 *
	 * @param input DomElement
	 * @returns {*} Object {start, end} , or Number
	 * */
	getSelectionRange : function(input) {
		if ('selectionStart' in input && document.activeElement === input) {
			return {
				start : input.selectionStart,
				end   : input.selectionEnd
			};
		}
		else if (input.createTextRange) {
			var sel = document.selection.createRange(),
				pos,
				len;

			if (sel.parentElement() === input) {
				var rng = input.createTextRange();
				rng.moveToBookmark(sel.getBookmark());
				for (len = 0;
					rng.compareEndPoints('EndToStart', rng) > 0;
					rng.moveEnd('character', -1)) {
					len++;
				}
				rng.setEndPoint('StartToStart', input.createTextRange());
				for (pos = { start : 0, end : len };
					rng.compareEndPoints('EndToStart', rng) > 0;
					rng.moveEnd('character', -1)) {
					pos.start++;
					pos.end++;
				}
				return pos;
			}
		}
		return {
			start : -1,
			end   : -1
		};
	},

	/**
	 * Detach mouseup event on textarea
	 *
	 * @DEPRECATED
	 *
	 * @param ev
	 * @param target
	 * @param options
	 */
	onTextareaMouseup : function(ev, target, options) {
		var selectionRange = this.getSelectionRange(options.downTarget);
		this._selectionStart = selectionRange.start;
		this._selectionEnd = selectionRange.end;

		this.element.un('mouseup', this.onTextareaMouseup, this);
	},

	/**
	 * Attaches txtarea selection range checker
	 *
	 * @DEPRECATED
	 *
	 * @param ev
	 * @param target
	 */
	attachTextareaRangeCheckerEvent : function(ev, target) {
		this.element.on('mouseup', this.onTextareaMouseup, this, { downTarget : target });
	},

	/**
	 * Esemenykezelok feliratkozasa
	 */
	bind : function() {
		Wall.superclass.bind.call(this);

		this.findCommentBoxElements();

		this._wallMessageTxtEl.on({
			focus : this.onInputFocus,
			blur  : this.onInputBlur,
			keyup : this.onInputKeyup,
			scope : this
		});
	},

	/**
	 * Esemenykezelok torlese
	 */
	unbind : function() {
		Wall.superclass.unbind.call(this);

		this._wallMessageTxtEl.un({
			focus : this.onInputFocus,
			blur  : this.onInputBlur,
			keyup : this.onInputKeyup,
			scope : this
		});

		this._replyBtnEls.un('click', this.onReplyBtnClick, this);
		this._editBtnEls.un('click', this.onEditBtnClick, this);
		this._clearBtnEl.un('click', this.onClearBtnClick, this);
		this._sendBtnEls.un('click', this.onSendClick, this);
		this._cancelBtnEls.un('click', this.onCancelBtnClick, this);
	}
});
