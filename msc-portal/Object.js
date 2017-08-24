import Ext from '../vendor/ExtCore';
import Chaos from './Chaos';
import Config from './Config';
import Plugin from './Plugin';

/**
 * Basic plugin skeleton class.
 *
 * @package    Chaos
 * @subpackage Plugin
 *
 * @requires Ext-core
 */
export default function ChaosObject(el, config) {
	// Storing the element's reference and adding the plugin classname to the element.
	if (typeof el === 'string' && Ext.fly(el) == null) {
		this.element = Ext.get(Ext.DomHelper.append(Ext.getBody(), config.el || ''));

		delete config.el;
	}
	else {
		this.element = Ext.get(el);
	}

	// if the element has ID, use it as object's own id
	if (this.element.id) {
		this.setId(this.element.id);
	}

	// You can reach superclasses' methods and variables thru this variable too.
	// This is only a conventional possibility. e.g. this.parentClass.doSomething()
	// It is is good that you know that you shall look for the given method or var in a parent
	// class instead of this class or at this class' instantiating.
	this.parentClass = this;
	this.childClass = this;

	var defaultConfig = {};
	config = Ext.applyIf(config, defaultConfig);
	this.originalConfig = config;

	// copy all config options to object properties
	Ext.apply(this, config);

	// Binds the event listeners.
	this.init(el, config);
}

ChaosObject.EVENT_INIT = 'init';
ChaosObject.EVENT_CHAOS_LOG = 'chaos-log';

/**
 * Creating the prototype of the Basic plugin class.
 */
Chaos.extend(ChaosObject, Ext.util.Observable, {
	/** @var string name      The name of the plugin. */
	name    : undefined,
	/** @var object element   The reference to the element. */
	element : undefined,
	/** @var object plugins   Contains all the plugins bound to this component */
	plugins : undefined,
	/** @var string id        Unique identifier of this entity  */
	id      : undefined,

	nonEventRx : /scope/,
	/** @var Object listeners   A key-value array that enlists
	listeners: {
		scope: this
	}
	/**
	 * Initializes the plugin.
	 *
	 * @param mixed el   The element to bind the plugin.
	 */
	init       : function(el, config) {
		// new event appeared in ChaosObject: init / fires when init was started.
		this.addEvents({
			init        : true,
			// create custom event for Chaos.Log
			'chaos-log' : true
		});

		// create a brand new object, whithout any properties.
		// create plugins here and undefined in the list above, because we don't want to
		// share it with nobody ( {} is an object and copied by reference, not by value)
		this.plugins = {};

		// define temp variable
		var pluginName;
		// if there's any plugin added to the config, install it!
		if (typeof config.plugins !== 'undefined') {
			for (pluginName in config.plugins) {
				var pluginConfig = config.plugins[pluginName];
				this.addPlugin(pluginName, pluginConfig);
			}
		}
		// call bind function
		this.bind.call(this);
		// fire event init event to be caught by other components (plugins for instance)
		this.fireEvent(ChaosObject.EVENT_INIT, this);

		// bind events and listeners listed in this array
		if (this.listeners instanceof Object) {
			// definde scope
			var scope = listeners.scope || this || window;

			// iterate through items
			for (var listenerName in listeners) {
				// one listener
				var listener = listeners[listenerName];

				// if listener name is not "scope" or other reserved word then bind listener to the event
				if (!listenerName.match(this.noEventName)) {
					this.on(listenerName, listener, scope);
				}
			}
		}
		/* develblock:start */
		try {
			var cmpName = (/\t?(.*?).superclass/).exec(this.constructor.toString())[1].trim();
			console.info('INIT: ' + cmpName);
		}
		catch (e) {
			console.warn('ChaosObject cannot get Class name : ' + e);
		}
		/* develblock:end */
	},

	/**
	 * Returns the object's own unique identifier. If there's no, generates it.
	 *
	 * @return string     Identifier
	 */
	getId : function() {
		if (typeof this.id === 'undefined') {
			this.id = Chaos.generateId(this.name);
		}

		return this.id;
	},

	/**
	 * Setis the object's onw unique id.
	 *
	 * @param string id      Identifier to set.
	 *
	 * @return void
	 */
	setId : function(id) {
		this.id = id;
	},


	/**
	 * Destroys the plugin and removes references.
	 *
	 * @return void
	 */
	destroy : function(removeElement) {
		// Unbinding the event listeners.
		this.unbind.call(this);

		// Remove from DOM
		if (removeElement == true) {
			this.element.remove();
		}

		// Removes the element's reference.
		this.element = null;
	},

	addPlugin : function(pluginName, pluginConfig) {
		// if config is a Plugin, call init method on it, or create a new plugin using
		// pluginConfig as its config
		if (pluginConfig instanceof Plugin) {
			pluginConfig.init(this);
		}
		else if (pluginConfig instanceof Object) {
			var PluginFn = Config.get('plugins.' + pluginName);
			// if pluginFn exists, create one
			if (PluginFn instanceof Function) {
				pluginConfig.host = this;
				var pluginObj = new PluginFn(pluginConfig);

				this.plugins[pluginName] = pluginObj;
				pluginObj.init(this);
			}
			else {
				throw new Error('unknown plugin (' + pluginName + ') for class \'' + this.name + '\': ');
			}
		}
		else {
			throw new Error('invalid plugin config type:' + typeof pluginFn);
		}
	},

	/**
	 * Use this instead of this.element.select..
	 *
	 * @return Ext.CompositeElementLite
	 */
	select : function(selector, unique) {
		return this.element.select(selector, unique);
	},

	/**
	 * Binds the event listeners to the element.
	 *
	 * @return void.
	 */
	bind : function() {
		// Binding the 'destroyed' listener to the element.
		// @todo: megnezni
		// this.element.on('DOMNodeRemovedFromDocument', this.destroy, this);
	},

	/**
	 * Unbinds the event listeners from the element.
	 *
	 * @return void
	 */
	unbind : function() {
		// Unbinding the 'destroyed' listener to the element.
		this.element.un('DOMNodeRemovedFromDocument', this.destroy, this);
	},

	/**
	 * Auto unbind
	 *
	 * @return void
	 */
	autoUnbind : function() {
		var fnc = this.bind.toString()
            .replace(/\.on\(/g, '.un(')
            .replace(/\.addEventListener\(/g, '.removeEventListener(')
            .replace(/\.bind\./g, '.unbind.');
		fnc = eval('(' + fnc + ')');
		fnc.call(this);
	}
});
