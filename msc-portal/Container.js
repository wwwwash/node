import Ext from '../vendor/ExtCore';
import Chaos from './Chaos';
import { Broadcaster } from './Broadcaster';
import ChaosObject from './Object';

/**
 * Container is a class that has a visible element, and can group many other components
 *
 * @package    Chaos
 * @subpackage Plugin
 *
 * @requires Ext-core
 *
 * @example
 *
 * var leftController = new Chaos.Controller({
 *     init: function() {
 *     },
 *     menu: {
 *         component:
 *     }
 * })
 */
export default function Container(el, config) {
	Container.superclass.constructor.call(this, el, config);
}

Container.EVENT_ADD_COMPONENT = 'add-component';
Container.EVENT_REMOVE_COMPONENT = 'remove-component';
Container.GLOBAL_COMPONENT_NAME = 'global';

Chaos.extend(Container, ChaosObject, {
	/** @var Object _components     collection of components in key-value pairs */
	_components : undefined,

	/**
	 * Initializes the component
	 **/
	init : function(el, config) {
		this._components = {};

		this.addEvents(
			Container.EVENT_ADD_COMPONENT,     // fired when a component was added to a container
			Container.EVENT_REMOVE_COMPONENT   // fired when a component was removed from a container
		);

		// make shortcut to getComponent
		this.getCmp = this.getComponent;

		// add config.item to _components
		if (config.items instanceof Object) {
			this.addComponents(config.items);
		}
		/* develblock:start */
		else {
			console.error('config.items is not an object (', typeof config.items, ') ');
		}
		/* develblock:end */

		/** @TODO: Megoldani, hogy ne irjuk felul a global eventet, hanem ujat adjuk hozza  */
		if (config.globals instanceof Object) {
			for (var globalIndex in config.globals) {
				var globalItem = config.globals[globalIndex];
				this.addGlobalEvent(globalIndex, globalItem);
			}
		}

		Container.superclass.init.call(this, el, config);
	},

	/**
	 * Adds all global events to the container
	 */
	addGlobalEvent : function(eventName, eventHandler) {
		var configObj = {
			component : Broadcaster,
			listeners : {}
		};
		configObj.listeners[eventName] = eventHandler;
		this.addComponent(configObj, Container.GLOBAL_COMPONENT_NAME);
	},

	/**
	 * Adds more new components to the container. ComponentList should be an object,
	 * containing named components like this:
	 * {
	 *     "menu":  <menu descriptor @see addComponent>
	 *     "item2": <item2 descriptor @see addComponent>
	 *     ...
	 * }
	 *
	 * @param Object componentList      see above
	 *
	 * @return undefined
	 */
	addComponents : function(componentList) {
		/* develblock:start */
		if (!(componentList instanceof Object)) {
			console.error('function argument must be an object');
			return;
		}
		/* develblock:end */

		for (var itemIndex in componentList) {
			var cmpObj = componentList[itemIndex];

			this.addComponent(cmpObj, itemIndex);
		}
	},

	/**
	 * adds a new Component to the controller
	 *
	 * @param object config    config object (descriptor) for the component. The structure should be like this:
	 *                             {
	 *                                 "component": ref to a component
	 *                                 "listeners": {
	 *                                     "item-click": string|function "onBookItemClick",
	 *                                 }
	 *                             }
	 *
	 * @param string id        Identifier of the component, should be unique in this controller.
	 *
	 * @return undefined
	 */
	addComponent : function(config, id) {
		/* develblock:start */
		if (!(config.component instanceof Ext.util.Observable)) {
			console.error('component should exist, and should be a child of Ext.util.Observable. Id: ', id, ', config: ', config);
			return;
		}
		/* develblock:end */

		// get id - it should be unique in this component
		var id = id || config.component.getId();

		/* develblock:start */
		if (id == '' || typeof id === 'undefined' || id == null) {
			console.error('component must have an id');
			return;
		}

		if (typeof this._components[id] !== 'undefined') {
			console.warn('component with the same id already exists in this component (id: ' + id + ')');
		}

		if (typeof this[id] !== 'undefined') {
			console.warn('container already has a property named (id: ' + id + ')');
		}
		/* develblock:end */

		this._components[id] = config.component;

		this[id] = config.component;

		this.fireEvent(Container.EVENT_ADD_COMPONENT, config.component, config.listeners, this);

		// bind event listeners to the event handlers, one by one
		if (typeof config.listeners === 'object') {
			// define scope, if not set, "this" will be used
			var scope = config.listeners.scope || this || window;

			for (var event in config.listeners) {
				var fn = config.listeners[event];

				// scope is not an event
				if (event != 'scope') {
					if (typeof fn === 'string') {
						/* develblock:start */
						if (typeof this[fn] === 'undefined') {
							console.error('event handler does not exist: ', fn);
							return;
						}
						/* develblock:end */
						config.component.on(event, this[fn], scope);
					}
					else {
						if (typeof this[fn] === 'undefined') {
							/* develblock:start */
							console.warn('event handler does not exist: ', fn);
							/* develblock:end */
							return;
						}
						config.component.on(event, fn, scope);
					}
				}
			}
		}
	},

	getComponent : function(id) {
		var cmp = this._components[id];
		/* develblock:start */
		if (typeof cmp === 'undefined') {
			console.info('component does not exist:', id);
		}

		if (this[id] != cmp) {
			console.warn('Inconsistency warning: this[\'' + id + '\'] != this._components[\'' + id + '\']');
		}
		/* develblock:end */
		return cmp;
	},

	removeComponent : function(name) {
		/* develblock:start */
		if (!(this._components[name] instanceof ChaosObject)) {
			console.error('component:\'', name, '\' cannot be deleted, since it is not a component');
		}

		if (!(this[name] instanceof ChaosObject)) {
			console.error('component:\'', name, '\' cannot be deleted from controller properties, since it is not a component');
		}
		/* develblock:end */
		delete this[name];
		delete this._components[name];
	},

	bind : function() {
		Container.superclass.bind.call(this);
	},

	unbind : function() {
		Container.superclass.unbind.call(this);
	}
});
