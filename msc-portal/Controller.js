import Ext from '../vendor/ExtCore';
import Chaos from './Chaos';
import ChaosContainer from './Container';

/**
 * Controller handles Business logic between components
 *
 * @package    Chaos
 * @subpackage Plugin
 *
 * @requires Ext-core
 */
export default function ChaosController(config = {}) {
	/**
	 * If config has init member, it can overwrite the original one, make this component unusable.
	 * To avoid this, init will be saved into a variable then deleted, only if it is a function
	 */
	if (typeof config.init !== 'undefined') {
		if (config.init instanceof Function) {
			var initCmp = config.init;

			delete config.init;
		}
		else {
			/* develblock:start */console.warn('config has a member called init, which is not a function, but overwrites original init.');/* develblock:end */
		}
	}

	var el = config.el || Ext.getBody();
	ChaosController.superclass.constructor.call(this, el, config);

	// if config.init exists
	if (initCmp instanceof Function) {
		/** @TODO: el-t bele kell rakni v nem? */
		initCmp.call(this, el, config);
	}
}

/**
 * Creating the prototype of the Basic plugin class.
 */
Chaos.extend(ChaosController, ChaosContainer, {
	/**
	 * Initializes the Controller.
	 *
	 * @param mixed el   The element to bind the plugin.
	 */
	init : function(el, config) {
		// call ancestor's init
		ChaosController.superclass.init.call(this, el, config);
	}
});
