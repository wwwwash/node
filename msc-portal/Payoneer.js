import Chaos from '../../../lib/chaos/Chaos';
import PayoutOptionsAbstract from './PayoutOptionsAbstract';

/**
 * Controller of the Payoneer settings overlay
 */

export default function Payoneer(el, config) {
	Payoneer.superclass.constructor.call(this, el, config);
}

/**
 *
 */
Chaos.extend(Payoneer, PayoutOptionsAbstract, {

	/**
	 * Init
	 *
	 * @param {Element} el      This should be the body tag.
	 * @param {Object} config   Config object of this component
	 */
	init : function(el, config) {
		Payoneer.superclass.init.call(this, el, config);
	},

	bind : function() {
		Payoneer.superclass.bind.call(this);
	},

	unbind : function() {
		Payoneer.superclass.unbind.call(this);
	}
});