import Chaos from '../../lib/chaos/Chaos';
import ChaosObject from '../../lib/chaos/Object';
import Connection from '../../lib/chaos/Connection';

/**
 * ContentViewerModel
 *
 * Service for ContentViewerController
 *
 * Gives back the details of the new block
 * to the overlay
 *
 */

export default function ContentViewerModel(el, config) {
	ContentViewerModel.superclass.constructor.call(this, el, config);
}

ContentViewerModel.EVENT_NEW_CONTENT_DETAILS_READY = 'new-content-details-ready';
ContentViewerModel.EVENT_IMAGE_RESOLVE_READY = 'image-resolve-ready';
ContentViewerModel.EVENT_TURN_ON_COMMENTS = 'turn-on-comments';

Chaos.extend(ContentViewerModel, ChaosObject, {
	/** @var {String}           Model name. */
	name : 'ContentViewerModel',

	/**
	 * Standard init function
	 *
	 * @param {Object} el
	 * @param {Object} config
	 *
	 * @return void
	 */
	init : function(el, config) {
		ContentViewerModel.superclass.init.call(this, el, config);
		this.addEvents(
			ContentViewerModel.EVENT_NEW_CONTENT_DETAILS_READY,
			ContentViewerModel.EVENT_IMAGE_RESOLVE_READY,
			ContentViewerModel.EVENT_TURN_ON_COMMENTS
		);
	},

	/**
	 * Returns the hash resolved images
	 *
	 * @method getResolvedImageUris
	 * @param url   Url for the hash resolver
	 *
	 * @return {Object} resolvedImages
	 */
	getResolvedImageUris : function(url) {
		Connection.Ajax.request({
			type    : 'json',
			method  : 'GET',
			url     : url,
			scope   : this,
			success : function(response) {
				this.fireEvent(ContentViewerModel.EVENT_IMAGE_RESOLVE_READY, response.json.content.urls);
			},
			error : function() {

			}
		});
	},

	/**
	 * Returns with comment details
	 *
	 * @method getCommentDetails
	 * @param url   Url of the comment route
	 *
	 * @return {Object} commentDetails
	 */
	getCommentDetails : function(url) {
		Connection.Ajax.request({
			type    : 'json',
			method  : 'GET',
			url     : url,
			scope   : this,
			success : function(response) {
				this.fireEvent(ContentViewerModel.EVENT_TURN_ON_COMMENTS, response.json.data);
			},
			error : function() {

			}
		});
	},

	/**
	 * Binds the initial event handlers
	 */
	bind : function() {
		ContentViewerModel.superclass.bind.call(this);
	},

	/**
	 * Unbinds all event handlers
	 */
	unbind : function() {
		ContentViewerModel.superclass.unbind.call(this);
	}
});
