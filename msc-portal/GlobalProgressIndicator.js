import Ext from '../../lib/vendor/ExtCore';
import Chaos from '../../lib/chaos/Chaos';
import ChaosObject from '../../lib/chaos/Object';
import { Broadcaster } from '../../lib/chaos/Broadcaster';

/**
 * Displays, and handles global rpogress indicator objects, for ajax calls
 * @TODO Component to add&remove a class?! :)
 * @package    common
 * @subpackage GlobalProgressIndicator
 */
export default function GlobalProgressIndicator(el, config) {
	GlobalProgressIndicator.superclass.constructor.call(this, el, config);
}

GlobalProgressIndicator.GLOBALEVENT_SHOW_INDICATOR = 'show-indicator';
GlobalProgressIndicator.GLOBALEVENT_HIDE_INDICATOR = 'hide-indicator';
GlobalProgressIndicator.instance = undefined;

/**
 * Constructing class
 */
Ext.extend(GlobalProgressIndicator, ChaosObject, {

	showCls : 'show',

	/**
	 *
	 * @param   {Ext.Element} el
     * @param   {Object} config
	 *
	 * @return  void
	 */
	init : function(el, config) {
		//Register unique global events
		Chaos.addEvents(
			GlobalProgressIndicator.GLOBALEVENT_SHOW_INDICATOR,
			GlobalProgressIndicator.GLOBALEVENT_HIDE_INDICATOR
		);
		//Global events
		Broadcaster.on(GlobalProgressIndicator.GLOBALEVENT_SHOW_INDICATOR, this.showEventHandler, this);
		Broadcaster.on(GlobalProgressIndicator.GLOBALEVENT_HIDE_INDICATOR, this.hideEventHandler, this);

		//Save instance reference
		GlobalProgressIndicator.instance = this;
		// call parent's init
		GlobalProgressIndicator.superclass.init.call(this, el, config);
	},

	/**
	 * Global ajax indicators show event handler
	 */
	showEventHandler : function() {
		this.show();
	},

	/**
	 * Global ajax indicators hide event handler
	 */
	hideEventHandler : function() {
		this.hide();
	},

	/**
	 * Displays global ajax indicator
	 */
	show : function() {
		this.element.addClass(this.showCls);
	},

	/**
	 * Hides global ajax indicator
	 */
	hide : function() {
		this.element.removeClass(this.showCls);
	},

	/**
	 * Binds all basic event listeners.
	 *
	 * @return void
	 */
	bind : function() {
		GlobalProgressIndicator.superclass.bind.call(this);
	},

	/**
	 * Unbinds all basic event listeners.
	 *
	 * @return void
	 */
	unbind : function() {
		GlobalProgressIndicator.superclass.unbind.call(this);
	}
});
