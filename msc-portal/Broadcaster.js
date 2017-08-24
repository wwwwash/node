import Ext from '../vendor/ExtCore';

/**
 * Broadcaster class
 * -----------------------------
 *
 * For managing global events.
 * You can add events via broadcaster that going to be available globally.
 *
 */

export default function Broadcaster() {
	this.init();
}

/**
 * Sets an instance of Broadcaster
 */
Broadcaster.getInstance = function() {
	if (!(Broadcaster.prototype.instance instanceof Broadcaster)) {
		Broadcaster.prototype.instance = new Broadcaster();
	}

	return Broadcaster.prototype.instance;
};

Ext.extend(Broadcaster, Ext.util.Observable, {
	/**
	 * BroadCaster init
	 */
	init : function() {},

	/**
	 * Clears all listeners from a specific Broadcaster event.
	 * @param {String} eventName Name of the Broadcaster event
	 */
	clearListeners : function(eventName) {
		if (this.events[eventName]) {
			this.events[eventName].clearListeners();
		}
	}
});

// Set Broadcaster instance
const BC = Broadcaster.getInstance();

export { BC as Broadcaster };
