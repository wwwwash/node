import Chaos from '../../lib/chaos/Chaos';
import ChaosObject from '../../lib/chaos/Object';
import Config from '../../lib/chaos/Config';
import Connection from '../../lib/chaos/Connection';

/**
 * Note Manager Model
 * -------------------
 * To managing the whole notes features:
 * * Adding, editing, removing notes
 *
 */

export default function NoteManagerModel(el, config) {
	NoteManagerModel.superclass.constructor.call(this, el, config);
}

NoteManagerModel.EVENT_INVALID_NOTE_VALUE = 'invalid-note-value';
NoteManagerModel.EVENT_NOTE_POST_SUCCESS = 'note-post-success';
NoteManagerModel.EVENT_NOTE_POST_FAILED = 'note-post-failed';

Chaos.extend(NoteManagerModel, ChaosObject, {

	/**
	 * Standard init function
	 *
	 * @param {Object} el
	 * @param {Object} config
	 *
	 * @return void
	 */
	init : function(el, config) {
		NoteManagerModel.superclass.init.call(this, el, config);
		this.addEvents(
			NoteManagerModel.EVENT_INVALID_NOTE_VALUE,
			NoteManagerModel.EVENT_NOTE_POST_SUCCESS,
			NoteManagerModel.EVENT_NOTE_POST_FAILED
		);
	},

	/**
	 * Posts the value via ajax to the server
	 *
	 * @method _post
	 * @private
	 *
	 * @param {Object} params
	 *
	 * @return void;
	 */
	postNote : function(params) {
		var url, postParams;

		if (params.contentId) {
			url = Chaos.getUrl('ChannelNote/Edit', {}, { channelType : Config.get('channelType') });
			postParams = {
				csrfToken : params.csrfToken,
				content   : params.noteText,
				id        : params.contentId
			};
		}
		else {
			url = Chaos.getUrl('ChannelNote/Create', { channelType : Config.get('channelType') });
			postParams = {
				csrfToken : params.csrfToken,
				content   : params.noteText
			};
		}

		Connection.Ajax.request({
			method  : 'post',
			url     : url,
			params  : postParams,
			type    : Connection.TYPE_JSON,
			scope   : this,
			success : function(response) {
				this._postNoteSuccess(response, params);
			},
			error   : this._postNoteError,
			failure : this._postNoteError
		});
	},

	/**
	 * Handles a successfull ajax post event
	 *
	 * @method _postNoteSuccess
	 * @private
	 *
	 * @param {Object} response   Server response
	 *
	 * @return void;
	 */
	_postNoteSuccess : function(response, params) {
		this.fireEvent(NoteManagerModel.EVENT_NOTE_POST_SUCCESS, {
			scope    : this,
			response : response,
			params   : params
		});
	},

	/**
	 * Handles a failed ajax post event.
	 *
	 * @method _postNoteError
	 * @private
	 *
	 * @param {Object} response   Server response
	 *
	 * @return void;
	 */
	_postNoteError : function(response) {
		this.fireEvent(NoteManagerModel.EVENT_NOTE_POST_FAILED, {
			scope    : this,
			response : response
		});
	},

	/**
	 * Binds the initial event handlers
	 */
	bind : function() {
		NoteManagerModel.superclass.bind.call(this);
	},

	/**
	 * Unbinds all event handlers
	 */
	unbind : function() {
		NoteManagerModel.superclass.unbind.call(this);
	}
});
