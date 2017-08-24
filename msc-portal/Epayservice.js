import Chaos from '../../../lib/chaos/Chaos';
import PayoutOptionsAbstract from './PayoutOptionsAbstract';

/**
 * Controller of the Epayservice settings overlay
 */
export default function Epayservice(el, config) {
	Epayservice.superclass.constructor.call(this, el, config);
}

/**
 *
 */
Chaos.extend(Epayservice, PayoutOptionsAbstract, {

	/**
	 * Init
	 *
	 * @param {Element} el      This should be the body tag.
	 * @param {Object} config   Config object of this component
	 */
	init : function(el, config) {
		Epayservice.superclass.init.call(this, el, config);
	},

	bind : function() {
		Epayservice.superclass.bind.call(this);
	},

	unbind : function() {
		Epayservice.superclass.unbind.call(this);
	}
});
