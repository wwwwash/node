import Chaos from '../../../lib/chaos/Chaos';
import PayoutOptionsAbstract from './PayoutOptionsAbstract';

/**
 * Controller of the Paxum settings overlay
 */
export default function Paxum(el, config) {
	Paxum.superclass.constructor.call(this, el, config);
}

/**
 *
 */
Chaos.extend(Paxum, PayoutOptionsAbstract, {

	/**
	 * Init
	 *
	 * @param {Element} el      This should be the body tag.
	 * @param {Object} config   Config object of this component
	 */
	init : function(el, config) {
		Paxum.superclass.init.call(this, el, config);
	},

	bind : function() {
		Paxum.superclass.bind.call(this);
	},

	unbind : function() {
		Paxum.superclass.unbind.call(this);
	}
});