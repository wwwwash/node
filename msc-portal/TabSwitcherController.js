import Chaos from '../../lib/chaos/Chaos';
import ChaosController from '../../lib/chaos/Controller';


export default function TabSwitcherController(el, config) {
	TabSwitcherController.superclass.constructor.call(this, el, config);
}

Chaos.extend(TabSwitcherController, ChaosController, {

	/**
	 * Init
	 *
	 * @param {Element} el      Context element
	 * @param {Object} config   Config object of this controller
	 */
	init : function(el, config) {
		TabSwitcherController.superclass.init.call(this, el, config);
	},

	/**
	 * Binds events
	 */
	bind : function() {
		TabSwitcherController.superclass.bind.call(this);
	},

	/**
	 * Unbind events
	 */
	unbind : function() {
		TabSwitcherController.superclass.unbind.call(this);
	}
});
