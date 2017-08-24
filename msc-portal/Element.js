import $ from 'jquery';

import Ext from '../vendor/ExtCore';

Ext.applyIf(Ext.Element.prototype, {
	setOpacity : function(opacity, animate) {
		var me = this,
			s = me.dom.style;

		if (!animate || !me.anim) {
			if (Ext.isIE7 || Ext.isIE8) {
				var opac = 'alpha(opacity=' + opacity * 100 + ')';
				s.filter = opac;

				s.zoom = 1;
				//s.filter = val + (val.length > 0 ? ' ' : '') + opac;
			}
			else {
				s.opacity = opacity;
			}
		}
		else {
			me.anim({ opacity : { to : opacity } }, me.preanim(arguments, 1), null, 0.35, 'easeIn');
		}
		return me;
	},

	/**
	 * Shortcut for setting display style
	 *
	 * @param {String} display   Display type
	 *
	 * @return void
	 */
	display : function(display) {
		this.dom.style.display = display;
		return this;
	},

	/**
	 * Collects passed element's all siblings and returns with.
	 *
	 * @param string s   Selector or classname [optional]
	 *
	 * @return {Object}  Ext.Element(s) or null
	 */
	getSibling : function(s) {
		var sib = new Array(), node;

		node = this.parent().first(s);

		while (node && node.dom.nodeType === 1) {
			if (node != this) {
				sib.push(node);
			}
			node = node.next(s);
		}
		if (sib.length > 0) {
			return sib;
		}

		return null;
	},

	/**
	 * Triggers a click event on the cross browser way.
	 */
	triggerClick : function() {
		var node = this.dom;

		if (document.createEvent) {
			var evt = document.createEvent('MouseEvents');
			evt.initEvent('click', true, false);
			node.dispatchEvent(evt);
		}
		else if (document.createEventObject) {
			node.fireEvent('onclick');
		}
		else if (typeof node.onclick === 'function') {
			node.onclick();
		}
	},

	/**
	 * Create a clone of an Ext or DOM element
	 * @param dom [Boolean] True for return DOM instead of Element
	 * @return {Ext.Element|Object}
	 */
	clone : function(dom) {
		var el = this.dom.cloneNode(true);
		var fake = document.createElement('div');
		fake.appendChild(el);

		var htmlString = fake.innerHTML.replace(/id="(.*?)"/g, '');
		fake = document.createElement('div');
		fake.innerHTML = htmlString;

		return dom ? fake.firstChild : Ext.get(fake.firstChild);
	},

	/**
	 * Setter/getter for data attributes
	 * @param {String|Object|Array}
	 * @param [String]
	 * @return {?}
	 */
	data : function(key, value) {
		if (!key) {
			key = [];

			for (var i = 0; i < this.dom.attributes.length; i++) {
				var attrName = this.dom.attributes[i].name,
					attrValue = this.dom.attributes[i].value;

				if (attrName && attrValue && attrName.indexOf('data-') == 0) {
					var dataName = attrName.replace('data-', '');
					key.push(dataName);
				}
			}
		}
		return this.attr(key, value, 'data-');
	},

	/**
	 * Setter/getter for data attributes
	 * @param {String|Object|Array}
	 * @param [String]
	 * @param [String]
	 * @return {*}
	 */
	attr : function(key, value, prefix) {
		prefix = prefix || '';

		var returnValue = this,
			keyClean = function(k) {
				return k.replace(prefix, '').replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
			},
			tempKey;

		// Getter
		if (key instanceof Array) {
			returnValue = {};
			for (var i = 0; i < key.length; i++) {
				tempKey = keyClean(key[i]);
				returnValue[tempKey.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase()})] = this.data(tempKey);
			}
		}

		// Setter
		else if (typeof key === 'object') {
			returnValue = this;
			for (var i in key) {
				tempKey = keyClean(i);
				this.data(tempKey, key[i]);
			}
		}

		// Setter
		else if (value != undefined) {
			returnValue = this;
			this.dom.setAttribute(prefix + keyClean(key), value);
		}

		// Getter
		else if (key) {
			returnValue = this.dom.getAttribute(prefix + keyClean(key));
		}

		return returnValue;
	},

	/**
	 * Get all next elements matching a selector
	 * @param {string} selector The matching elements selector
	 * @return {Ext.Element|Null}
	 */
	nextAll : function(selector) {
		var ids = '',
			nextEl = this.next(selector);
		while (nextEl) {
			ids += '#' + nextEl.dom.id + ',';
			nextEl = nextEl.next(selector);
		}
		ids = ids.slice(0, -1);
		return ids ? Ext.select(ids) : null;
	},

	/**
	 * Get all previous elements matching a selector
	 * @param {string} selector The matching elements selector
	 * @return {Ext.Element|Null}
	 */
	prevAll : function(selector) {
		var ids = '',
			prevEl = this.prev(selector);
		while (prevEl) {
			ids += '#' + prevEl.dom.id + ',';
			prevEl = prevEl.prev(selector);
		}
		ids = ids.slice(0, -1);
		return ids ? Ext.select(ids) : null;
	},

	html : function(val) {
		// Getter with wrapper
		if (val === true) {
			var div = document.createElement('div');
			div.appendChild(this.clone(true));
			return div.innerHTML;
		}
		// Setter
		else if (val) {
			this.dom.innerHTML = val;
			return this;
		}
		// Getter

		return this.dom.innerHTML;
	},

	jq : function() {
		return $(this.dom);
	}
});

// Check is the 'Closest' function is not already implemented
if (Element && !Element.prototype.closest) {
	Element.prototype.closest = function(selector, filter) {
		var element = this;
		var foundAncestor;

		// If the passed in filter is a CSS string, execute it
		filter = typeof filter === 'string' ? document.querySelector(filter) : filter;

		while (element instanceof Element && !(foundAncestor = element.matches(selector)) && element !== filter) {
			element = element.parentNode;
		}

		return foundAncestor ? element : null;
	};
}

Element && (function(ElementPrototype) {
	ElementPrototype.matches = ElementPrototype.matches ||
		ElementPrototype.matchesSelector ||
		ElementPrototype.mozMatchesSelector ||
		ElementPrototype.msMatchesSelector ||
		ElementPrototype.oMatchesSelector ||
		ElementPrototype.webkitMatchesSelector ||
		function (selector) {
			var node = this, nodes = (node.parentNode || node.document).querySelectorAll(selector), i = -1;

			while (nodes[++i] && nodes[i] != node) {}

			return !!nodes[i];
		};
}(Element.prototype));

// Simple nodelist forEach
NodeList.prototype.forEach = NodeList.prototype.forEach || Array.prototype.forEach;

if (!Element.prototype.scrollIntoViewIfNeeded) {
	Element.prototype.scrollIntoViewIfNeeded = function (centerIfNeeded) {
		centerIfNeeded = arguments.length === 0 ? true : !!centerIfNeeded;

		var parent = this.parentNode,
			parentComputedStyle = window.getComputedStyle(parent, null),
			parentBorderTopWidth = parseInt(parentComputedStyle.getPropertyValue('border-top-width')),
			parentBorderLeftWidth = parseInt(parentComputedStyle.getPropertyValue('border-left-width')),
			overTop = this.offsetTop - parent.offsetTop < parent.scrollTop,
			overBottom = this.offsetTop - parent.offsetTop + this.clientHeight - parentBorderTopWidth > parent.scrollTop + parent.clientHeight,
			overLeft = this.offsetLeft - parent.offsetLeft < parent.scrollLeft,
			overRight = this.offsetLeft - parent.offsetLeft + this.clientWidth - parentBorderLeftWidth > parent.scrollLeft + parent.clientWidth,
			alignWithTop = overTop && !overBottom;

		if ((overTop || overBottom) && centerIfNeeded) {
			parent.scrollTop = this.offsetTop - parent.offsetTop - parent.clientHeight / 2 - parentBorderTopWidth + this.clientHeight / 2;
		}

		if ((overLeft || overRight) && centerIfNeeded) {
			parent.scrollLeft = this.offsetLeft - parent.offsetLeft - parent.clientWidth / 2 - parentBorderLeftWidth + this.clientWidth / 2;
		}

		if ((overTop || overBottom || overLeft || overRight) && !centerIfNeeded) {
			this.scrollIntoView(alignWithTop);
		}
	};
}