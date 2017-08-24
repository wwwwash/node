import Ext from '../../../lib/vendor/ExtCore';
import Chaos from '../../../lib/chaos/Chaos';
import Page from '../../../lib/chaos/Page';
import Config from '../../../lib/chaos/Config';

import SelfInvoiceHTML5UploaderController from '../../_Uploader5/SelfInvoice-HTML5UploaderController';
import '../../_ToggleOnOff/ToggleOnOff';

import './Payout.scss';

export default function PayoutOverview(el, config) {
	PayoutOverview.superclass.constructor.call(this, el, config);
}

Chaos.extend(PayoutOverview, Page, {

	/**
	 * Constructor.
	 *
	 * @param {Element} el      This should be the body tag.
	 * @param {Object} config   Config object of this component
	 */
	init : function(el, config) {
		// Init uploader components for all buttons
		Ext.select('.uploader5').each(function(elem) {
			new SelfInvoiceHTML5UploaderController(elem, {
				validate : Config.get(elem.data('validate'))
			});
		}, this);

		// Init futtatasa
		PayoutOverview.superclass.init.call(this, el, config);
	},

	/**
	 * Esemenykezelok feliratkozasa
	 */
	bind : function() {
		PayoutOverview.superclass.bind.call(this);
	},

	/**
	 * Esemenykezelok torlese
	 */
	unbind : function() {
		this.autoUnbind();
	}
});
