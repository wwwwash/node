import Chaos from '../../lib/chaos/Chaos';
import ChaosObject from '../../lib/chaos/Object';
import Connection from '../../lib/chaos/Connection';

export default function MVCOverlayModel(el, config) {
	MVCOverlayModel.superclass.constructor.call(this, el, config);
}

MVCOverlayModel.EVENT_GETCONTENT_SUCCESS = 'get-content-success';
MVCOverlayModel.EVENT_GETCONTENT_ERROR = 'get-content-error';
MVCOverlayModel.EVENT_GETCONTENT_FAILURE = 'get-content-failure';

Chaos.extend(MVCOverlayModel, ChaosObject, {

	/**
	 * Standard init function
	 *
	 * @param {Object} el
	 * @param {Object} config
	 *
	 * @return void
	 */
	init : function(el, config) {
		MVCOverlayModel.superclass.init.call(this, el, config);
		this.addEvents(
			MVCOverlayModel.EVENT_GETCONTENT_SUCCESS,
			MVCOverlayModel.EVENT_GETCONTENT_ERROR,
			MVCOverlayModel.EVENT_GETCONTENT_FAILURE
		);
	},

	/**
	 * Gets the content via ajax.
	 *
	 * @method getDocuments
	 * @public
	 *
	 * @param {Object} params   Request params
	 *
	 * @return void;
	 */
	getContent : function(params) {
		var self = this,
			_oId = params._oId,
			scope = params.scope || this;
		Connection.Ajax.request({
			url     : params.url,
			method  : params.method || 'GET',
			scope   : scope,
			params  : params.params,
			type    : params.type || Connection.TYPE_JSON,
			success : function(response) {
				self.getContentSuccess(response, _oId);
				if (Chaos.isFunction(params.success)) {
					params.success.call(scope, response);
				}
			},
			error : function(response) {
				self.getContentError(response, _oId);
				if (Chaos.isFunction(params.error)) {
					params.error.call(scope, response);
				}
			},
			failure : function(response) {
				self.getContentFailure(response, _oId);
				if (Chaos.isFunction(params.failure)) {
					params.failure.call(scope, response);
				}
			}
		});
	},

	/**
	 * Callback for a successful get content response.
	 *
	 * @method getContentSuccess
	 * @param {Object} response   Server response
	 * @param {String} oId        Overlay request identifier
	 *
	 * @return void;
	 */
	getContentSuccess : function(response, oId) {
		this.fireEvent(MVCOverlayModel.EVENT_GETCONTENT_SUCCESS, {
			scope    : this,
			response : response,
			oId      : oId
		});
	},

	/**
	 * Callback for a failed get content response.
	 *
	 * @method getContentError
	 * @param {Object} response   Server response
	 * @param {String} oId        Overlay request identifier
	 *
	 * @return void;
	 */
	getContentError : function(response, oId) {
		this.fireEvent(MVCOverlayModel.EVENT_GETCONTENT_ERROR, {
			scope    : this,
			response : response,
			oId      : oId
		});
	},

	/**
	 * Callback for a failed get content response.
	 *
	 * @method getContentFailure
	 * @param {Object} response   Server response
	 * @param {String} oId        Overlay request identifier
	 *
	 * @return void;
	 */
	getContentFailure : function(response, oId) {
		this.fireEvent(MVCOverlayModel.EVENT_GETCONTENT_FAILURE, {
			scope    : this,
			response : response,
			oId      : oId
		});
	}
});
