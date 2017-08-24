import Ext from '../vendor/ExtCore';
import Chaos from './Chaos';
import ChaosObject from './Object';

export default function Page(el, config) {
	Page.superclass.constructor.call(this, el, config);
}

Chaos.extend(Page, ChaosObject, {

	/** @var {Object}   */
	ui     : {},
	/** @var {String}   */
	url    : '',
	/** var {Chaos.layout} layout    Reference to the current layout object */
	layout : null,

	/**
	 * Init
	 *
	 * @param {Element} el      This should be the body tag.
	 * @param {Object} config   Config object of this component
	 */
	init : function(el, config) {
		this.createIniterStr = this.createIniterStr.bind(this);
		this.generateUIelements();
		this.createComponents();

		Page.superclass.init.call(this, el, config);
	},

	/**
	 * Create components form the this.cmp object
	 */
	createComponents : function() {
		if (typeof this.cmp !== 'object') {
			return;
		}

		// Iterate over the UI object of the Page
		for (var i in this.cmp) {
			if (!this.cmp.hasOwnProperty(i)) {
				continue;
			}
			// Object key = identifier of the component
			var self = this,
				key = i,
			// Object value = declaration object of the cmp
				obj = this.cmp[i],
			// If it starts with ui. , we use the this.ui element.
				element = obj.el.indexOf('ui.') === 0 ? 'this.' + obj.el + '.el()' : '"' + obj.el + '"',
			// If options are set, convert it to string to use
				options = obj.opts ? JSON.stringify(obj.opts) : '{}';
			// Future improvement possibility: If ui. is a composite element (textareas)
			var initerStr = this.createIniterStr(obj.name, element, options, obj.sleep);

			// If sleep is true, we create a start function to initiate the cmp later. And skip the iterator.
			if (obj.sleep) {
				var proto = function() {
					this.initerStr = initerStr;
					this.sleeping = true;
				};
				proto.prototype.setOpt = function(opt, value) {
					var optionsObj = JSON.parse(options);
					optionsObj[opt] = value;
					options = JSON.stringify(optionsObj);
					self.initerStr = self.createIniterStr(obj.name, element, options, obj.sleep);
					return true;
				};
				proto.prototype.start = function() {
					try {
						this.start = function() { /* develblock:start */console.warn('Component already inited')/* develblock:end */ };
						return new this.initerStr(eval(element.replace('this', 'self')), JSON.parse(options));
					}
					catch (e) {
						/* develblock:start */
						console.warn(e);
						/* develblock:end */
					}
				};
				this[key] = new proto();
				continue;
			}

			// Try to instantiate
			try {
				this[key] = initerStr;
			}
			// If it failed, create a start function to init later
			catch (e) {
				var self = this;

				var proto = function() {
					this.initerStr = initerStr;
					this.sleeping = true;
				};
				proto.prototype.start = function() {
					try {
						this.start = function() { /* develblock:start */console.warn('Component already inited')/* develblock:end */ };
						return new this.initerStr(eval(element.replace('this', 'self')), JSON.parse(options));
					}
					catch (e) {}
				};
				this[key] = new proto();
				/* develblock:start */
				console.trace('Could not initialize ' + key, e);
				/* develblock:end */
			}
		}
	},

	/**
	 * Creates an initer string for the createComponents method.
	 * This string will be eval'd to create the component.
	 * @param {string} name Name of the component with namespace
	 * @param {string} element Element for the component. It can be a selector or a this.ui element (ui.pageContainer)
	 * @param {object} options Options for the component
	 * @param {sleep} sleep Sleep?
	 * @returns {string|void(0)}
	 */
	createIniterStr : function(name, element, options, sleep) {
		if (typeof name !== 'string') {
			let el = eval(element);
			if (!el) { return }
			options = JSON.parse(options) || {};

			if (sleep) {
				return name;
			}
			else {
				return new name(el, options || {});
			}
		}
		return eval('new ' + name + '( ' + element + ', ' + options + ');');
	},

	/**
	 * Generates Ext elements, composite elements, etc. object from a simple declaration object.
	 */
	generateUIelements : function() {
		if (typeof this.ui !== 'object') {
			return;
		}

		// Iterate over the UI object of the Page
		for (var i in this.ui) {
			if (!this.ui.hasOwnProperty(i)) {
				continue;
			}

			// In case ui component is already generated.
			if (typeof this.ui[i] !== 'string') {
				continue;
			}
			var key = i,
				item = this.ui[i].trim();
			// Lets build getter functions into the prototype
			var construct = function() {};
			construct.prototype = this.uiProtoHandler(item);
			this.ui[i] = new construct();
		}
	},

	/**
	 * Returns the UI prototype object for the UI element generator.
	 * @TODO improveable area :)
	 * @param selector Selector in the UI element object that we want to process
	 * @returns {{id: Function, els: Function, el: Function, dom: Function, cls: Function, sel: Function}}
	 */
	uiProtoHandler : function(selector) {
		// If it is a selector
		if (selector.charAt(0) === '.' || selector.indexOf(' ') >= 0) {
			var parsedCls = selector.charAt(0) === '.' ? selector.slice(1) : null;

			var idQuery = function() { return null },
				elsQuery = function() { return Ext.select(selector) },
				elQuery = function() { return Ext.select(selector).item(0) },
				domQuery = function() { return Ext.select(selector).item(0).dom },
				clsQuery = function() { return parsedCls },
				selQuery = function() { return selector };
		}
		// If not selector, only an ID
		else if (selector.charAt(0) === '#') {
			selector = selector.slice(1);
		}
		else {
				// Check if the given selector exists as an id....
			var isId = Ext.get(selector);
			if (isId) {
				var idQuery = function() { return selector },
					elsQuery = function() { return Ext.select('#' + selector) },
					elQuery = function() { return Ext.get(selector) },
					domQuery = function() { return Ext.get(selector).dom },
					clsQuery = function() { return null },
					selQuery = function() { return selector };
			}
			else {
				var idQuery = function() { return Ext.select(selector).item(0).id },
					elsQuery = function() { return Ext.select(selector) },
					elQuery = function() { return Ext.select(selector).item(0) },
					domQuery = function() { return Ext.select(selector).item(0).dom },
					clsQuery = function() { return null },
					selQuery = function() { return selector };
			}
		}

		// Prototype object with getter functions
		// We can force the refresh by adding param true to the call
		return {
			id : function (refresh) {
				return this.storedId && !refresh ? this.storedId : this.storedId = idQuery();
			},
			els : function (refresh) {
				return this.storedEls && !refresh ? this.storedEls : this.storedEls = elsQuery();
			},
			el : function(refresh) {
				return this.storedEl && !refresh ? this.storedEl : this.storedEl = elQuery();
			},
			dom : function(refresh) {
				return this.storedDom && !refresh ? this.storedDom : this.storedDom = domQuery();
			},
			cls : function(refresh) {
				return this.storedCls && !refresh ? this.storedCls : this.storedCls = clsQuery();
			},
			sel : function(refresh) {
				return this.storedSel && !refresh ? this.storedSel : this.storedSel = selQuery();
			},
			remove : function () {
				this.els().each(function() {
					this.remove();
				});
				return true;
			},
			exists : function() {
				return this.el() && this.el().dom ? true : false;
			}
		};
	},

	getPageId : function() {
		return Ext.getBody().dom.id;
	},

	bind : function() {
		Page.superclass.bind.call(this);
	},

	unbind : function() {
		Page.superclass.unbind.call(this);
	}
});
