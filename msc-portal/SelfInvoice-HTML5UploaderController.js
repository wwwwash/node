import Ext from '../../lib/vendor/ExtCore';

import HTML5UploaderController from './HTML5UploaderController';

export default function SelfInvoiceHTML5UploaderController(el, config) {
	SelfInvoiceHTML5UploaderController.superclass.constructor.call(this, el, config);
}

Ext.extend(SelfInvoiceHTML5UploaderController, HTML5UploaderController, {

	/** @var {String} statusCellSel      'Status' table cell selector */
	statusCellSel    : '.statusContent',
	/** @var {String} invoiceCellSel     'Invoice' table cell selector */
	invoiceCellSel   : '.tableLinkContentCell',
	/** @var {Array} statusClassArray      Status table cell selector */
	statusClassArray : [
		'individual_acceptedStatus',
		'individual_pendingStatus',
		'company_pendingStatus',
		'company_approvedStatus',
		'company_rejectedStatus'
	],

	/**
	 * Init method.
	 *
	 * @param {Object} el
	 * @param {Object} config
	 * @return void
	 */
	init : function(el, config) {
		SelfInvoiceHTML5UploaderController.superclass.init.call(this, el, config);
	},

	/**
	 * Callback after upload is done.
	 * @private
	 */
	_onAfterDone : function(ev) {
		var result = JSON.parse(ev.result);

		var invoiceStatus = result.data.invoiceStatus,
			payoutStatus = result.data.payoutStatus,
			rowEl = this._el.parents('tr'),
			statusCellEl = rowEl.children(this.statusCellSel),
			invoiceCellEl = rowEl.children(this.invoiceCellSel);

		// Remove status classes from cells
		this.statusClassArray.forEach(function(cls) {
			invoiceCellEl.removeClass(cls);
			statusCellEl.removeClass(cls);
		});

		this._el.html(invoiceStatus);
		statusCellEl.html(payoutStatus);
	},

	_onAfterChange : function() {
		this._toggleText();
	},

	/**
	 * Events pls.
	 */
	bind : function() {
		SelfInvoiceHTML5UploaderController.superclass.bind.call(this);
	}

});