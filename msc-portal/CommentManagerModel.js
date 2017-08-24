import Ext from '../../lib/vendor/ExtCore';
import Chaos from '../../lib/chaos/Chaos';
import ChaosObject from '../../lib/chaos/Object';
import Connection from '../../lib/chaos/Connection';

/**
 * Model of CommentManagerModel
 */

export default function CommentManagerModel(el, config) {
	CommentManagerModel.superclass.constructor.call(this, el, config);
}

Ext.apply(CommentManagerModel, {
	EVENT_COMMENT_POST_READY   : 'on-comment-post-ready',
	EVENT_COMMENT_REMOVE_DONE  : 'comment-remove-done',
	EVENT_REFRESH_COMMENTCOUNT : 'refresh-comment-count',
	EVENT_REFRESH_COMMENTS     : 'on-comments-refresh',
	EVENT_COMMENT_POST_FAILED  : 'on-comment-post-failed'
}, {});

Chaos.extend(CommentManagerModel, ChaosObject, {
	/**
	 * Standard init function
	 *
	 * @param {Object} el
	 * @param {Object} config
	 *
	 * @return void
	 */
	init : function(el, config) {
		CommentManagerModel.superclass.init.call(this, el, config);
		this.addEvents(
			CommentManagerModel.EVENT_COMMENT_POST_READY,
			CommentManagerModel.EVENT_COMMENT_REMOVE_DONE,
			CommentManagerModel.EVENT_REFRESH_COMMENTCOUNT,
			CommentManagerModel.EVENT_REFRESH_COMMENTS,
			CommentManagerModel.EVENT_COMMENT_POST_FAILED
		);
	},

	/**
	 * Posting a comment
	 *
	 * @param url {String}          Url to call for add
	 * @param commentObj {object}   Contains the id and content
	 */
	postComment : function(url, commentObj) {
		Connection.Ajax.request({
			type    : 'json',
			method  : 'post',
			url     : url,
			scope   : this,
			params  : commentObj,
			success : function() {
				this.fireEvent(CommentManagerModel.EVENT_COMMENT_POST_READY, { comment : commentObj.content });
			},
			error : function(response) {
				var jsonData = response.json.data;
				this.fireEvent(CommentManagerModel.EVENT_COMMENT_POST_FAILED, {
					comment : commentObj.content,
					message : jsonData
				});
			}
		});
	},

	/**
	 * Removes a post
	 *
	 * @method removeContent
	 *
	 * @param url {String}          Url to call for remove
	 * @param dataObj {object}      Contains parentId and commentId
	 *
	 * @return void;
	 */
	removeContent : function(url, dataObj) {
		Connection.Ajax.request({
			type    : 'json',
			method  : 'post',
			url     : url,
			scope   : this,
			params  : dataObj,
			success : function() {
				this.fireEvent(CommentManagerModel.EVENT_COMMENT_REMOVE_DONE, { commentId : dataObj.commentid });
			},
			error : function(response) {
				/* develblock:start */
				console.error('Delete comment error', response);
				/* develblock:end */
			}
		});
	},

	/**
	 * Get the entire list of comments
	 *
	 * @method getComments
	 * @param {String} url      Url of the remove action
	 * @param {String} id       Id of comment
	 *
	 * @return void;
	 */
	getComments : function(url, id) {
		Connection.Ajax.request({
			type    : 'json',
			method  : 'GET',
			url     : url,
			scope   : this,
			params  : { id : id },
			success : function(response) {
				var responseData = response.json.data;
				this.fireEvent(CommentManagerModel.EVENT_REFRESH_COMMENTS, responseData);
			},
			error : function(response) {
				/* develblock:start */
				console.error('Get comment error', response);
				/* develblock:end */
			}
		});
	},

	/**
	 * Binds the initial event handlers
	 */
	bind : function() {
		CommentManagerModel.superclass.bind.call(this);
	},

	/**
	 * Unbinds all event handlers
	 */
	unbind : function() {
		CommentManagerModel.superclass.unbind.call(this);
	}
});