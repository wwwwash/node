/* eslint-disable complexity */

import Ext from '../../lib/vendor/ExtCore';
import Chaos from '../../lib/chaos/Chaos';
import ChaosController from '../../lib/chaos/Controller';

/**
 * MWHDocumentStatusCheckerController.
 *
 */
export default function MWHDocumentStatusCheckerController(el, config) {
	MWHDocumentStatusCheckerController.superclass.constructor.call(this, el, config);
}

MWHDocumentStatusCheckerController.FILE_STATUS_UPLOADED = 'uploaded';
MWHDocumentStatusCheckerController.FILE_STATUS_PENDING = 'pending_upload';
MWHDocumentStatusCheckerController.FILE_STATUS_WAITING_APPROVAL = 'waitingForApproval';
MWHDocumentStatusCheckerController.FILE_PENDING_ROTATE = 'pending_rotate';
MWHDocumentStatusCheckerController.FILE_STATUS_ENABLED = 'enabled';
MWHDocumentStatusCheckerController.FILE_STATUS_CONVERTING = 'converting';
MWHDocumentStatusCheckerController.FILE_STATUS_FAILED = 'MWHValidationFailed';
MWHDocumentStatusCheckerController.EVENT_FILE_CONVERTED = 'file-converted';
MWHDocumentStatusCheckerController.EVENT_FILE_CONVERT_FAILED = 'file-convert_failed';
MWHDocumentStatusCheckerController.EVENT_ALL_FILE_STATUS_READY = 'all-file-status-ready';
MWHDocumentStatusCheckerController.EVENT_CONTENT_STATUS_ENABLED = 'content-status-enabled';
MWHDocumentStatusCheckerController.EVENT_START_CHECK_STATUSES = 'start-check-statuses';

Chaos.extend(MWHDocumentStatusCheckerController, ChaosController, {

	/** @var {Number}    Delayed value between two ajax check requests in ms */
	checkDocumentsDelay  : 1000,
	/** @var {Array}     Converted documents */
	_convertedDocs       : [],
	/** @var {Array}     Failed documents */
	_failedConvertedDocs : [],
	/** @var {Number}    For counting checked documents */
	_checkedDocsCount    : 0,
	/** @var {Array}     For storing all documents */
	_documents           : [],
	/** @var {String}     Default selected file number*/
	_selectedFileNumber  : 0,
	/** @var {String}     Converting cls */
	convertingCls        : 'converting',
	/** @var {Boolean}    If controller is checking the list, its true */
	isChecking           : false,
	/** @var {Array}      Checking list  */
	checkingList         : [],
	/** @var {Object}     Object containing the added documents' types  */
	_documentTypes       : {},

	/**
	 * Standard init function
	 *
	 * @param {Object} el
	 * @param {Object} config
	 *
	 * @return void
	 */
	init : function(el, config) {
		MWHDocumentStatusCheckerController.superclass.init.call(this, el, config);
		this.addEvents(
			MWHDocumentStatusCheckerController.EVENT_ALL_FILE_STATUS_READY,
			MWHDocumentStatusCheckerController.EVENT_FILE_CONVERTED,
			MWHDocumentStatusCheckerController.EVENT_FILE_CONVERT_FAILED,
			MWHDocumentStatusCheckerController.EVENT_CONTENT_STATUS_ENABLED,
			MWHDocumentStatusCheckerController.EVENT_START_CHECK_STATUSES
		);
		this._convertedDocs = [];
		this.resetCounters();
	},

	/**
	 * Resets all private counters.
	 *
	 * @method resetCounters
	 *
	 * @return void;
	 */
	resetCounters : function() {
		this._failedConvertedDocs = [];
		this._checkedDocsCount = 0;
		this._documents = [];
		this._documentTypes = {};
		this._allSelectedFileNumber = 0;
	},

	/**
	 * Add statuses to check
	 *
	 * @method addStatusesToCheck
	 * @param {Object} pendingIds   Parameters containing the pending ids and their types.
	 *
	 * @return void;
	 */
	addStatusesToCheck : function(pendingIds) {
		this.isChecking = true;
		for (var i in pendingIds) {
			if (pendingIds.hasOwnProperty(i)) {
				this._documents.push(i);
				this._documentTypes[i] = pendingIds[i];
				this._allSelectedFileNumber++;
			}
		}
		this._checkDocuments(this._documents);
	},

	/**
	 * Updates checking list
	 *
	 * @method updateCheckingList
	 * @param {Array} documentIds   Ids of newly arrived documents
	 *
	 * @returns void;
	 */
	updateCheckingList : function(documentIds) {
		for (var i = 0; i < documentIds.length; i++) {
			this._documents.push(documentIds[i]);
		}
		if (this.isChecking === false) {
			this.addStatusesToCheck(this._documents);
		}
	},

	/**
	 * Remove ID from checking array
	 *
	 * @method removeIdFromCheckingList
	 * @param {String} documentId Mongo ID
	 *
	 * @return void;
	 */
	removeIdFromCheckingList : function(documentId) {
		var start = this._documents.indexOf(documentId);
		this._documents.splice(start, 1);
	},

	/**
	 * Adds files to a queue to check them one by one.
	 *
	 * @method addFilesToCheck
	 * @public
	 * @param {Object} params   List of documents' ids to check
	 *
	 * @return {Object} scope to chain
	 */
	addFilesToCheck : function(params) {
		this._selectedFileNumber += params.selectedFileNumber;
		for (var i = 0; i < params.documents.length; i++) {
			this._documents.push(params.documents[i]);
			this._documentTypes[params.documents[i]] = params.documentType;
		}
		this._allSelectedFileNumber += this._documents.length;
		this._checkDocuments(this._documents);
		return this;
	},

	/**
	 * Starts to check the given document by its id.
	 *
	 * @method _checkDocuments
	 * @private
	 * @param {Array} documents   Array containing document ids
	 *
	 * @return void;
	 */
	_checkDocuments : function(documents) {
		this.fireEvent(MWHDocumentStatusCheckerController.EVENT_START_CHECK_STATUSES, {
			scope     : this,
			documents : documents
		});
		this.MWHDocumentStatusCheckerModel.checkDocumentStatuses(documents);
	},

	/**
	 * Starts a delayed checker task with a specified id.
	 *
	 * @method startDelayedCheck
	 * @public
	 * @param {Array} documents   Documents array to check
	 *
	 * @return void;
	 */
	startDelayedCheck : function(documents) {
		if (!(this._delayedCheckerTask instanceof Ext.util.DelayedTask)) {
			this._delayedCheckerTask = new Ext.util.DelayedTask();
		}
		this._delayedCheckerTask.delay(this.checkDocumentsDelay, this._checkDocuments, this, [documents]);
	},

	/**
	 * Set the number for selected files
	 *
	 * @method setAllSelectedFileNumber
	 * @public
	 * @param {Number} allSelectedFileNumber   Number for selected files
	 *
	 * @return void
	 */
	setAllSelectedFileNumber : function(allSelectedFileNumber) {
		this._allSelectedFileNumber = allSelectedFileNumber;
	},

	/**
	 * Checks if all documents are already checked [not converted!]
	 *
	 * @method _areAllDocumentsAlreadyChecked
	 * @private
	 *
	 * @return {Boolean}
	 */
	_areAllDocumentsAlreadyChecked : function() {
		return this._checkedDocsCount === this._allSelectedFileNumber;
	},

	/**
	 * Handles a successful ajax response with the documents' statuses.
	 *
	 * @method onGetDocumentStatusSuccess
	 * @param {Object} ev   Event object
	 *
	 * @return void;
	 */
	onGetDocumentStatusSuccess : function(ev) {
		if (ev.data.redirectUrl) {
			this.resetCounters();
			window.location.href = ev.data.redirectUrl;
			return;
		}
		if (!this._isAllDocumentsConverted(ev.data) && !this._areAllDocumentsAlreadyChecked()) {
			this.startDelayedCheck(this._documents);
		}
		else {
			this.resetCounters();
			this.fireEvent(MWHDocumentStatusCheckerController.EVENT_ALL_FILE_STATUS_READY, {
				scope : this,
				data  : ev.data
			});
		}
	},

	/**
	 * Checks all documents are converted already or not.
	 *
	 * @method _isAllDocumentsConverted
	 * @private
	 * @param {Object} docs   Documents object to check their statuses
	 *
	 * @return {Boolean}
	 */
	_isAllDocumentsConverted : function(docs) {
		var allConverted = true, status;
		for (let doc of Object.keys(docs)) {
			status = docs[doc].status;
			switch (status) {
				case MWHDocumentStatusCheckerController.FILE_STATUS_ENABLED:
				case MWHDocumentStatusCheckerController.FILE_STATUS_WAITING_APPROVAL:
					if (this._convertedDocs.indexOf(doc) === -1) {
						this._convertedDocs.push(doc);
						this._checkedDocsCount++;
						this.fireEvent(
							MWHDocumentStatusCheckerController.EVENT_CONTENT_STATUS_ENABLED, {
								scope            : this,
								convertedFileUrl : docs[doc].url,
								document         : docs,
								documentId       : doc,
								documentType     : this._documentTypes[doc]
							});
						this.removeIdFromCheckingList(doc);
					}
					break;
				case MWHDocumentStatusCheckerController.FILE_STATUS_FAILED:
					if (this._failedConvertedDocs.indexOf(doc) === -1) {
						this._failedConvertedDocs.push(doc);
						this._checkedDocsCount++;
						this.removeIdFromCheckingList(doc);
						this.fireEvent(
							MWHDocumentStatusCheckerController.EVENT_FILE_CONVERT_FAILED, {
								scope        : this,
								documentId   : doc,
								document     : docs,
								documentType : this._documentTypes[doc],
								errorReason  : docs[doc].errorReason,
								fileName     : docs[doc].fileName
							});
					}
					break;
				case MWHDocumentStatusCheckerController.FILE_PENDING_ROTATE:
					this.fireEvent(
						MWHDocumentStatusCheckerController.FILE_PENDING_ROTATE, {
							scope        : this,
							documentId   : doc,
							document     : docs,
							documentType : this._documentTypes[doc],
							errorReason  : docs[doc].errorReason,
							fileName     : docs[doc].fileName
						});
					allConverted = false;
					break;
				default:
				case MWHDocumentStatusCheckerController.FILE_STATUS_UPLOADED:
				case MWHDocumentStatusCheckerController.FILE_STATUS_PENDING:
				case MWHDocumentStatusCheckerController.FILE_STATUS_CONVERTING:
					allConverted = false;
					break;
			}
		}
		return allConverted;
	},

	/**
	 * Returns an array containing all document ids that are already successfully converted.
	 *
	 * @method getConvertedDocs
	 * @public
	 *
	 * @return {Array}
	 */
	getConvertedDocs : function() {
		return this._convertedDocs;
	},

	/**
	 * Returns an array containing all document ids that are already successfully converted.
	 *
	 * @param {Number} id
	 *
	 * @return void
	 */
	removeConvertedDoc : function(id) {
		this._convertedDocs.splice(this._convertedDocs.indexOf(id), 1);
	},

	/**
	 * Binds the initial event handlers
	 *
	 * @return void
	 */
	bind : function() {

	},

	/**
	 * Unbinds all event handlers
	 *
	 * @return void
	 */
	unbind : function() {

	}
});