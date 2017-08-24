import Chaos from '../../../lib/chaos/Chaos';
import PayoutOptionsAbstract from './PayoutOptionsAbstract';


/**
 * Controller of the PayPal settings overlay
 */
export default function PayPal(el, config) {
	PayPal.superclass.constructor.call(this, el, config);
}

/**
 *
 */
Chaos.extend(PayPal, PayoutOptionsAbstract, {

	/**
	 * Init
	 *
	 * @param {Element} el      This should be the body tag.
	 * @param {Object} config   Config object of this component
	 */
	init : function(el, config) {
		PayPal.superclass.init.call(this, el, config);
	},

	bind : function() {
		PayPal.superclass.bind.call(this);
	},

	unbind : function() {
		PayPal.superclass.unbind.call(this);
	}
});