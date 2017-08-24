import Ext from '../../lib/vendor/ExtCore';
import Chaos from '../../lib/chaos/Chaos';
import ChaosController from '../../lib/chaos/Controller';

import CharacterCounter from '../CharacterCounter/CharacterCounter';

/**
 * NoteManagerController
 * ---------------------
 * Controller layer for controlling the note management processes
 */

export default function NoteManagerController(el, config) {
	NoteManagerController.superclass.constructor.call(this, el, config);
}

Ext.apply(NoteManagerController, {
	EVENT_START_ADD_NEW_NOTE : 'start-add-new-note',
	EVENT_NOTE_POST_SUCCESS  : 'note-post-success'
});

Chaos.extend(NoteManagerController, ChaosController, {

	/** @var {String}    Channel text input id */
	channelAddNoteInputId   : 'channel_add_note_input',
	/** @var {String}    Channel characters field id*/
	noteContentCharNumberId : 'note_content_char_number',
	/* -------- PRIVATES -------- */


	/**
	 * Standard initializer
	 *
	 * @param {Object|String} el
	 * @param {Object} config
	 */
	init : function(el, config) {
		this._setContentCharacterCounter();
		NoteManagerController.superclass.init.call(this, el, config);
		this.addEvents(
			NoteManagerController.EVENT_START_ADD_NEW_NOTE,
			NoteManagerController.EVENT_NOTE_POST_SUCCESS
		);
	},

	/**
	 * Handler on post comment
	 *
	 * @method onPostComment
	 * @public
	 * @param {Object} params   Description
	 *
	 * @return {Object}
	 */
	onPostComment : function(params) {
		params.csrfToken = this.ChannelCsrfModel.get();
		this.NoteManagerModel.postNote(params);
	},

	/**
	 * Sends a global event about the note post success event.
	 *
	 * @method onNotePostSuccess
	 * @param {Object} ev   Event object
	 *
	 * @return void;
	 */
	onNotePostSuccess : function(ev) {
		this.NoteManagerView.appendNewNote(ev);
		this.NoteManagerView.hideErrorTooltip();
		this.fireEvent(NoteManagerController.EVENT_NOTE_POST_SUCCESS, {
			scope : this
		});
	},

	/**
	 * Post failed event handler. Triggers a protip if the note is spamfiltered.
	 *
	 * @method onNotePostFailed
	 * @param {Object} ev   Event object
	 *
	 * @return void;
	 */
	onNotePostFailed : function(ev) {
		var jsonData;

		try {
			jsonData = ev.response.json.data;
		}
		catch (e) {
			/* develblock:start */
			console.warn('Invalid backend response object (ev.response.json.data)');
			/* develblock:end */
		}

		// If jsonData is a string with length, we assume that is a message
		if (typeof jsonData === 'string' && jsonData.length) {
			this.NoteManagerView.showErrorTooltip(jsonData);
		}
		// We need to enable the enter action
		this.NoteManagerView.isEnterPostEnabled = true;
	},

	/**
	 * Description
	 *
	 * @method getContentCharacterCounter
	 *
	 * @return {Object}
	 */
	getContentCharacterCounter : function() {
		return this._setContentCharacterCounter();
	},

	/**
	 * Sets a character counter for the note content
	 *
	 * @method _setContentCharacterCounter
	 * @private
	 *
	 * @return {Object}
	 */
	_setContentCharacterCounter : function() {
		if (!(this._contentCharacterCounter instanceof CharacterCounter)) {
			this._contentCharacterCounter = new CharacterCounter(this.element, {
				inputId   : this.channelAddNoteInputId,
				counterId : this.noteContentCharNumberId,
				maxChar   : parseInt(
					Ext.get(this.channelAddNoteInputId).getAttribute('maxlength'),
					10
				),
				hasWarningLimit : false,
				isMaxCharSound  : true
			});
		}
		return this._contentCharacterCounter;
	},

	/**
	 * Handlers for input field focus
	 *
	 * @method onInputFocus
	 *
	 * @return void;
	 */
	onInputFocus : function() {
		this.getContentCharacterCounter().refreshCounter(true);
	},

	/**
	 * Delete Media success
	 *
	 * @method deleteMediaSuccess
	 * @public
	 *
	 * @return {Object}
	 */
	deleteMediaSuccess : function() {
		this.NoteManagerView.checkNoteItemExist();
	},

	/**
	 * Callback when a new note editor opens.
	 *
	 * @method onStartAddNewNote
	 */
	onStartAddNewNote : function() {
		this.fireEvent(NoteManagerController.EVENT_START_ADD_NEW_NOTE, {
			scope : this
		});
	},

	/**
	 * Initial bind method
	 *
	 * @return void;
	 */
	bind : function() {
		NoteManagerController.superclass.bind.call(this);
	},

	/**
	 * Initial unbind method
	 *
	 * @return void;
	 */
	unbind : function() {
		NoteManagerController.superclass.unbind.call(this);
	}
});