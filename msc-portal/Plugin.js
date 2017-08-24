import Ext from '../vendor/ExtCore';
import Chaos from './Chaos';
import Broadcaster from './Broadcaster';

/**
 * Plugin class for Chaos represents the ancestor class of all plugins.
 */
export default function ChaosPlugin(config) {
	var defaultConfig = {};
	config = Ext.applyIf(config, defaultConfig);
	this.originalConfig = config;

	// copy all config options to object properties
	Ext.apply(this, config);
}

Chaos.extend(ChaosPlugin, Ext.util.Observable, {
	/** @var object events     contains names of events triggered by the host object
	 *                         and caught by this plugin. Each event has its own
	 *                         argument list (what arguments should be passed to the function),
	 *                         so see documentation for it.
	 *                         evends is undefined by default, instead of object, so after extending
	 *                         ChaosPlugin, events won't be shared, each descendant class
	 *                         need to provide its own events object. */
	events : undefined,

	/**
	 * Initializes athe plugin.
	 */
	init : function(host) {
		// store the reference of the host object
		this.host = host;

		// store the host's element
		this.element = host.element;

		// bind event handlers
		if (Ext.isObject(this.events)) {
			this.bindEvents(this.host, this.events, false);
		}
		if (Ext.isObject(this.globalEvents)) {
			this.bindEvents(Broadcaster, this.globalEvents, true);
		}

		// call bind function
		if (typeof this.bind === 'function') {
			this.bind.call(this);
		}
	},

	bindEvents : function(host, events, isGlobal) {
		for (var event in events) {
			if (events.hasOwnProperty(event)) {
				if (!isGlobal && !Ext.isDefined(host.events[event])) {
					throw new Error('event (' + event + ') not exist for host class (' + host.name + ')');
				}

				switch (typeof events[event]) {
					case 'string':
						host.on(event, this[events[event]], this);
						break;
					case 'function':
						host.on(event, events[event], this);
						break;
					default:
						console.warn('plugin' + this.name + 'has invalid event handler for \'' + event + '\'');
				}
			}
		}
	},

	bind : function() {

	},

	unbind : function() {

	}

});
