import Chaos from '../../lib/chaos/Chaos';
import ChaosObject from '../../lib/chaos/Object';
import Connection from '../../lib/chaos/Connection';
import Util from '../../lib/chaos/Util';

/**
 * Uploader Model
 *
 */
export default function MWHDocumentStatusCheckerModel(el, config) {
	MWHDocumentStatusCheckerModel.superclass.constructor.call(this, el, config);
}

MWHDocumentStatusCheckerModel.EVENT_GET_DOCUMENT_STATUS_SUCCESS = 'get-document-status-success';
MWHDocumentStatusCheckerModel.EVENT_GET_DOCUMENT_STATUS_ERROR = 'get-document-status-error';

Chaos.extend(MWHDocumentStatusCheckerModel, ChaosObject, {

	/** @var {String}    Document status checker url route for ajax */
	mediaDocumentStatusUrlRoute : undefined,
	/** @var {Number}    Interval of delaying the requests to get the file's status */
	autoRequestRunnerInterval   : 1000,
	/** @var {Number}    Repeat number of trying requests to get the file's status */
	repeatRequestTaskNumber     : 50,

	/**
	 * Standard init function
	 *
	 * @param {Object} el
	 * @param {Object} config
	 *
	 * @return void
	 */
	init : function(el, config) {
		MWHDocumentStatusCheckerModel.superclass.init.call(this, el, config);

		this.addEvents(
			MWHDocumentStatusCheckerModel.EVENT_GET_DOCUMENT_STATUS_SUCCESS,
			MWHDocumentStatusCheckerModel.EVENT_GET_DOCUMENT_STATUS_ERROR
		);
	},

	/**
	 * Start auto request task
	 *
	 * @param {Array} documents   Documents array to check
	 *
	 * @return void
	 */
	checkDocumentStatuses : function(documents) {
		this._getDocumentStatuses(documents);
	},

	/**
	 * Sets the correct format of ajax parameters.
	 *
	 * @method _getStatusCheckAjaxParams
	 * @private
	 * @param {Array} documents   Documents array to stringify
	 *
	 * @return {String}
	 */
	_getStatusCheckAjaxParams : function(documents) {
		return Util.stringifyArray('documentIds', documents);
	},

	/**
	 * Returns an ajax url with a stringified array passed as query string
	 *
	 * @method _getCheckDocumentsUrl
	 * @private
	 * @param {Array} documents   Array to pass to the url
	 *
	 * @return {String}
	 */
	_getCheckDocumentsUrl : function(documents) {
		return Chaos.getUrl(this.mediaDocumentStatusUrlRoute, {}, { documentIds : documents });
	},

	/**
	 * Send a request to get converted files by its token via ajax.
	 *
	 * @method _getDocumentStatuses
	 * @private
	 *
	 * @param {Array} documents   Documents array
	 *
	 * @return void
	 */
	_getDocumentStatuses : function(documents) {
		if (documents.length > 0) {
			try {
				Connection.Ajax.request({
					type    : Connection.TYPE_JSON,
					url     : this._getCheckDocumentsUrl(documents),
					method  : 'GET',
					scope   : this,
					success : function(response) {
						this._getDocumentStatusSuccess(response, documents);
					},
					error : function(response) {
						this._getDocumentStatusError(response, documents);
					},
					failure : function(response) {
						this._getDocumentStatusError(response, documents);
					}
				});
			}
			catch (e) {
				/* develblock:start */
				console.error('@JS ERROR in ', this.name, ': ', e);
				/* develblock:end */
			}
		}
	},

	/**
	 * Handles a successfull document status request.
	 *
	 * @method _getDocumentStatusSuccess
	 * @private
	 * @param {Object} response   Server response
	 * @param {Array} documents   Array containing uploaded documents
	 *
	 * @return void;
	 */
	_getDocumentStatusSuccess : function(response, documents) {
		this.fireEvent(MWHDocumentStatusCheckerModel.EVENT_GET_DOCUMENT_STATUS_SUCCESS, {
			scope     : this,
			data      : response.json.data,
			documents : documents
		});
	},

	/**
	 * Ajax error callback for get status request
	 *
	 * @private
	 * @param {Object} response    Server response
	 * @param {Array}  documents   Array containing uploaded documents
	 *
	 * @return void
	 */
	_getDocumentStatusError : function(response, documents) {
		this.fireEvent(MWHDocumentStatusCheckerModel.EVENT_GET_DOCUMENT_STATUS_ERROR, {
			scope     : this,
			response  : response,
			documents : documents
		});
	}
});
