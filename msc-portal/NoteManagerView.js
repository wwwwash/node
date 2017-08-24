import Ext from '../../lib/vendor/ExtCore';

import CONST from '../../lib/constant/Constants';
import Chaos from '../../lib/chaos/Chaos';
import ChaosObject from '../../lib/chaos/Object';

/**
 * NoteManagerView
 * --------------------
 * View layer for the whole note managing process:
 * Adding, editing, removing notes, notificating the user about the changes.
 */

export default function NoteManagerView(el, config) {
	NoteManagerView.superclass.constructor.call(this, el, config);
}

Ext.apply(NoteManagerView, {
	EVENT_INPUT_FOCUS        : 'input-focus',
	EVENT_POST_COMMENT       : 'post-comment',
	EVENT_START_ADD_NEW_NOTE : 'start-add-new-note'
}, {});

Chaos.extend(NoteManagerView, ChaosObject, {

	/** @var {Boolean}   True if note post on enter press is enabled */
	isEnterPostEnabled         : true,
	/** @var {String}    Notes class */
	noteClass                  : 'note',
	/** @var {String}    Text of notes class */
	noteTextClass              : 'noteText',
	/** @var {String}    Add note box selector*/
	addNoteActionBlockSelector : '.note.actionBlock',
	/** @var {String}    Add note editor box selector*/
	noteEditorBoxSelector      : '.note.editor',
	/** @var {Object}    Hide note editor box selector*/
	noteHideBoxSelector        : '.note.hide',
	/** @var {Object}    Normal note item box*/
	noteItemBoxSelector        : '.note.note_item',
	/** @var {String}    Data font size attribute */
	dataFontSizeAttribute      : 'data-font-size',

	firstCreateNoteClass : 'firstCreate',

	/** @var {Object}    Store the current note box and value*/
	_currentNoteBox : {
		el    : undefined,
		value : undefined
	},
	/** @var {Boolean}    Prevents blur event [handle with care!] */
	_isBlurPrevented : false,

	/**
	 * Standard init function
	 *
	 * @param {Object} el
	 * @param {Object} config
	 *
	 * @return void
	 */
	init : function(el, config) {
		this._addNoteBoxEl = this.element.select(this.noteEditorBoxSelector).item(0);
		this._addNoteBoxTextareaEl = this._addNoteBoxEl.select('textarea').item(0);

		NoteManagerView.superclass.init.call(this, el, config);

		this.addEvents(
			NoteManagerView.EVENT_POST_COMMENT,
			NoteManagerView.EVENT_INPUT_FOCUS,
			NoteManagerView.EVENT_START_ADD_NEW_NOTE
		);
	},

	/**
	 * Add Note box click event handler
	 *
	 * @method onAddNoteClick
	 * @public
	 * @param {Object} ev   Browser event object
	 */
	onAddNoteClick : function(ev) {
		ev.preventDefault();
		this.setDefaultState();

		if (Ext.getBody().hasClass('activePlaylist')) {
			return;
		}
		this.fireEvent(NoteManagerView.EVENT_START_ADD_NEW_NOTE, {
			scope : this
		});
		this._addNoteBoxTextareaEl.dom.value = '';
		this._currentNoteBox = { el : undefined, value : undefined };

		this._addNoteBoxEl.dom.removeAttribute('data-id');
		this._addNoteBoxTextareaEl.dom.focus();

		if (this.getAddNoteActionBlockEl()) {
			this.getAddNoteActionBlockEl().addClass('hide');
		}

		this._showNoteEditorBox(true);
	},

	/**
	 *  Edit note button click event handler
	 *
	 * @method onEditNoteClick
	 * @public
	 * @param {Object} ev   Browser event object
	 */
	onEditNoteClick : function(ev) {
		ev.preventDefault();
		this.setCurrentEditingNoteBox(ev.target);
		if (this.getCurrentEditingNoteBox().el) {
			this.getCurrentEditingNoteBox().el.addClass('hide');
			var noteTextSize = this.getCurrentEditingNoteBox().el.dom.getAttribute(this.dataFontSizeAttribute);
			this.setFontSizeAttributeOfTextArea(noteTextSize);
		}
		this._showNoteEditorBox();
		this._addNoteBoxEl.dom.setAttribute('data-id', this.getCurrentEditingNoteBox().el.getAttribute('data-id'));
		this._addNoteBoxTextareaEl.dom.focus();
	},

	/**
	 * Sets the font size of textarea
	 *
	 * @method setFontSizeAttributeOfTextArea
	 * @param {Number} fontSize Font size to use
	 *
	 * @return void;
	 */
	setFontSizeAttributeOfTextArea : function(fontSize) {
		this._addNoteBoxTextareaEl.dom.setAttribute(this.dataFontSizeAttribute, fontSize);
	},

	/**
	 * Set the current note box
	 *
	 * @method setCurrentEditingNoteBox
	 * @public
	 * @param {Object} target   Description
	 *
	 * @return void;
	 */
	setCurrentEditingNoteBox : function(target) {
		var _el = Ext.get(target).findParent('.' + this.noteClass, 10, true),
			_elDom = _el.select('.' + this.noteTextClass).item(0).dom;
		this._currentNoteBox = {
			el    : _el,
			value : _elDom.innerHTML
		};
	},

	/**
	 * Get the current note box
	 *
	 * @method getCurrentEditingNoteBox
	 * @public
	 *
	 * @return {Object} Current Note Box element
	 */
	getCurrentEditingNoteBox : function() {
		return this._currentNoteBox;
	},

	/**
	 * Show an error tooltip with msg
	 *
	 * @method showErrorTooltip
	 * @param {String} message Tooltip text
	 * @public
	 *
	 * @return void;
	 */
	showErrorTooltip : function(message) {
		this._addNoteBoxEl.jq().protipShow({
			title    : message,
			icon     : 'alert',
			position : 'bottom',
			trigger  : 'sticky'
		});
	},

	/**
	 * Hide error tooltip on note editor
	 *
	 * @method hideErrorTooltip
	 * @public
	 *
	 * @return void;
	 */
	hideErrorTooltip : function() {
		if (this._addNoteBoxEl) {
			this._addNoteBoxEl.jq().protipHide();
		}
	},

	/**
	 * Show Note Editor Box
	 *
	 * @method _showNoteEditorBox
	 * @private          Current comment text
	 *
	 * @return {Object}
	 */
	_showNoteEditorBox : function(isNew) {
		if (isNew) {
			this._addNoteBoxEl.insertAfter(this.getAddNoteActionBlockEl());
		}
		else if (this.getCurrentEditingNoteBox().value) {
			var previousEditedNote = this._addNoteBoxEl.prev('.hide');
			if (previousEditedNote && previousEditedNote.dom !== this.getCurrentEditingNoteBox().el.dom) {
				previousEditedNote.removeClass('hide');
			}

			this._addNoteBoxTextareaEl.dom.value = this.getCurrentEditingNoteBox().value;
			this._addNoteBoxEl.insertAfter(this.getCurrentEditingNoteBox().el);
		}
		this._addNoteBoxEl.removeClass('hide');
		this._addNoteBoxTextareaEl.dom.focus();
	},

	/**
	 * Add Note box click event handler
	 *
	 * @method getAddNoteActionBlockEl
	 * @public
	 *
	 * @return {Object} _addNoteActionBlockEl
	 */
	getAddNoteActionBlockEl : function() {
		return this.element.select(this.addNoteActionBlockSelector).item(0);
	},

	/**
	 * Handles the keyup events of the input field.
	 *
	 * @method onInputKeyUp
	 * @param {Object} ev   Event object
	 *
	 * @return void;
	 */
	onInputKeyUp : function(ev) {
		switch (ev.getCharCode()) {
			case CONST.keyCode.ESCAPE:
				this._isBlurPrevented = true;
				ev.preventDefault();
				this.setDefaultState();
				break;
			case CONST.keyCode.ENTER:
				if (this.isEnterPostEnabled) {
					ev.preventDefault();
					this.isEnterPostEnabled = false;
					this._isBlurPrevented = true;
					this.checkNoteTextExist();
					this._addNoteBoxTextareaEl.blur();
				}
				break;
			default:
				break;
		}
	},

	/**
	 * Handles the keydown events of the input field.
	 *
	 * @method onInputKeyDown
	 * @param {Object} ev   Event object
	 *
	 * @return void;
	 */
	onInputKeyDown : function(ev) {
		switch (ev.getCharCode()) {
			case CONST.keyCode.ENTER:
				ev.preventDefault();
				break;
			default:
				break;
		}
	},

	/**
	 * Set the default values of the notes
	 *     - Note boxes visible
	 *     - Editor Box not visible
	 *
	 * @method setDefaultState
	 * @public
	 *
	 * @return void
	 */
	setDefaultState : function() {
		this._addNoteBoxEl.addClass('hide');
		this.getAddNoteActionBlockEl().removeClass('hide');
		if (this.getCurrentEditingNoteBox().el) {
			this.getCurrentEditingNoteBox().el.removeClass('hide');
		}
	},

	/**
	 * Get current text of the textarea
	 *
	 * @method getNoteText
	 * @public
	 *
	 * @return {String} current note text
	 */
	getNoteText : function() {
		return this._addNoteBoxTextareaEl.getValue();
	},

	/**
	 * Get add note box data id
	 *
	 * @method getAddNoteBoxDataIdAttribute
	 * @public
	 *
	 * @return {String} data-id
	 */
	getAddNoteBoxDataIdAttribute : function() {
		return this._addNoteBoxEl.getAttribute('data-id');
	},

	/**
	 * Blur EVENT HANDLER
	 *
	 * @method onNoteBoxBlur
	 * @public
	 *
	 * @return void
	 */
	onNoteBoxBlur : function() {
		if (!this._isBlurPrevented) {
			//disabled according to expected behaviour in MSC-64
			//this.checkNoteTextExist();
		}
		else {
			this._isBlurPrevented = false;
		}

		this.isEnterPostEnabled = true;
	},

	/**
	 * Input focus event handler
	 *
	 * @method onNoteBoxFocus
	 * @return void
	 */
	onNoteBoxFocus : function() {
		this.fireEvent(NoteManagerView.EVENT_INPUT_FOCUS, {
			scope : this
		});
	},

	/**
	 * Check the note text
	 *
	 * @method checkNoteTextExist
	 * @public
	 *
	 * @return {Object}
	 */
	checkNoteTextExist : function() {
		var _newText = this.getNoteText().trim();
		if (_newText === '' || this.getCurrentEditingNoteBox().value === _newText) {
			this.setDefaultState();
		}
		else {
			this._sendNewPost();
		}
	},

	/**
	 * Trigger an event for the new post
	 *
	 * @method _sendNewPost
	 * @public
	 *
	 * @return {Object}
	 */
	_sendNewPost : function() {
		this.fireEvent(NoteManagerView.EVENT_POST_COMMENT, {
			scope         : this,
			noteText      : this.getNoteText(),
			contentId     : this.getAddNoteBoxDataIdAttribute(),
			currentNoteEl : this.getCurrentEditingNoteBox().el
		});
	},

	/**
	 * Add new note post to the DOM
	 *
	 * @method appendNewNote
	 * @public
	 * @param {Object} params   Store the ajax response and current note el
	 *
	 * @return void
	 */
	appendNewNote : function(params) {
		var _newNoteBox = params.response.json.data.new_post;
		var _currentBox = params.params.currentNoteEl;
		Ext.DomHelper.insertAfter(this._addNoteBoxEl, _newNoteBox);
		if (_currentBox) {
			_currentBox.remove();
		}
		this.element.select(this.noteHideBoxSelector).removeClass('hide');
		this._addNoteBoxEl.addClass('hide');
		this.getAddNoteActionBlockEl().removeClass('hide').removeClass(this.firstCreateNoteClass);
		this.isEnterPostEnabled = true;
	},

	/**
	 *
	 *
	 * @method checkNoteItemExist
	 * @public
	 *
	 * @return {Object}
	 */
	checkNoteItemExist : function() {
		if (this.element.select(this.noteItemBoxSelector).getCount() === 0) {
			this.getAddNoteActionBlockEl().addClass(this.firstCreateNoteClass);
		}
	},

	/**
	 * Binds events
	 */
	bind : function() {
		this.parentClass.constructor.superclass.bind.call(this);
		this.element.on('click', this.onAddNoteClick, this, {
			delegate : '.actionBlock'
		});
		this.element.on('click', this.onEditNoteClick, this, {
			delegate : '.js-edit'
		});
		this._addNoteBoxTextareaEl.on('focusout', this.onNoteBoxBlur, this);
		this._addNoteBoxTextareaEl.on('focusin', this.onNoteBoxFocus, this);
		this._addNoteBoxTextareaEl.on('keydown', this.onInputKeyDown, this);
		this._addNoteBoxTextareaEl.on('keyup', this.onInputKeyUp, this);
		Ext.fly(window).on('click', this.hideErrorTooltip, this);
	},

	/**
	 * Unbind events
	 */
	unbind : function() {
		this.autoUnbind();
	}
});
