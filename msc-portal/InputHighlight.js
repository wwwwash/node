/**
 * InputHighlight
 *
 * Copies all the styles from the input field, and makes it transparent.
 * Then it creates a highlight layer element behind it, which has the same CSS properties like the input had,
 * with highlight spans.
 * ---
 * Highlighted words can be set with data-highlight attribute on the input element.
 * Format: word,word2,word3 (comma separated)
 * OR
 * Set an array of regexps in 'regexps' class variable
 */

import Ext from '../../lib/vendor/ExtCore';
import Util from '../../lib/chaos/Util';
import ChaosObject from '../../lib/chaos/Object';
import { Broadcaster } from '../../lib/chaos/Broadcaster';

import Overlay from '../Overlay/Overlay';

export default function InputHighlight(el, config) {
	InputHighlight.superclass.constructor.call(this, el, config);
}
/**
 * Array of the field ids which has instantiated InputHighlighComponent component
 * @type {Array}
 */
InputHighlight.registry = [];

/**
 * Instance handler. Creates a new instance, or if it exists, sets the regexps to a new one.
 *
 * @param {String} fieldId ID of the field.
 * @param {Array} regexps regexps to filter words to highlight
 */
InputHighlight.set = function(fieldId, regexps) {
	var existingInstance = InputHighlight.registry[fieldId];

	if (existingInstance) {
		existingInstance.setRegexps(regexps);
	}
	else {
		InputHighlight.registry[fieldId] = new InputHighlight(fieldId, {
			regexps : regexps
		});
		Broadcaster.on(
			Overlay.OVERLAY_UNBIND_CMPS,
			InputHighlight.registry[fieldId].destroy,
			InputHighlight.registry[fieldId]
		);
	}
};

Ext.extend(InputHighlight, ChaosObject, {

	/** @var {String}              Name of the component */
	name : 'inputHighlighComponent',

	/** @var {String}              Class to the input which means 'this is a highlighted input' */
	highlightedCls : 'highlighted',

	/** @var {String}              Highlight layer html template */
	layerTpl : '<div class="highlightLayer"></div>',

	/** @var {Array}               Array of the regexp's of the words that we want to highlight */
	regexps : [],

	/** @var {Array}               Array which contains all style props of the input element in 'prop:val' format */
	_inputCSSArray : undefined,

	/** @var {Array}               A CSS property blacklist. We dont handle these properties. */
	_cssPropertyBlackList : ['-webkit-text-fill-color'],

	/** @var {Object}              The element which contains the highlight elements */
	_highlightLayerEl : undefined,

	/** @var {String}              The background color of the element */
	_oldBg : undefined,


	/**
	 * Component init.
	 *
	 * @param   {Mixed}  el
	 * @param   {Object} config
	 *
	 * @return  void
	 */
	init : function(el, config) {
		// If the cmp is not in the registry, we save it
		if (InputHighlight.registry.indexOf(this.id) === -1) {
			InputHighlight.registry[this.id] = this;
		}

		this.element.addClass(this.highlightedCls);

		// Save CSS properties of the original input
		this._inputCSSArray = this._getAllStyles(this.element.dom);

		this._makeInputTransparent();

		this._createHighlightLayer();

		// Show highlight spans. They are initially invisible.
		this._highlightLayerEl.select('span').setVisible(true);

		InputHighlight.superclass.init.call(this, el, config);
	},

	/**
	 * Re-set regexps class variable, and sets the highlight to it
	 * @param {Array} regexps Array of regexps to highlight
	 */
	setRegexps : function(regexps) {
		this.regexps = regexps;

		this._setHighlight();

		this._highlightLayerEl.select('span').setVisible(true);
	},

	/**
	 * Gets all CSS properties of an element into an Array
	 *
	 * @param elem {DOMElement} get all styles of....
	 * @returns {Array} Array of the style properties in prop:value format.
	 * @private
	 */
	/* eslint-disable */
	_getAllStyles : function(elem) {
		// Element does not exist, empty list.
		if (!elem) {
			return [];
		}
		var win = document.defaultView || window, style, styleNode = [];

		// Modern browsers
		if (win.getComputedStyle) {
			style = win.getComputedStyle(elem, '');
			for (let i = 0; i < style.length; i++) {
				if (this._cssPropertyBlackList.indexOf(style[i]) === -1) { // If not blacklisted prop
					styleNode.push(style[i] + ':' + style.getPropertyValue(style[i]));
					//               ^name ^           ^ value ^
				}
			}
		}
		// IE
		else if (elem.currentStyle) {
			style = elem.currentStyle;
			for (var name in style) {
				if (this._cssPropertyBlackList.indexOf(name) === -1) { // If not blacklisted prop
					styleNode.push(name + ':' + style[name]);
				}
			}
		}
		// Ancient browser
		else {
			style = elem.style;
			for (var i = 0; i < style.length; i++) {
				if (this._cssPropertyBlackList.indexOf(style[i]) === -1) { // If not blacklisted prop
					styleNode.push(style[i] + ':' + style[style[i]]);
				}
			}
		}
		return styleNode;
	},
	/* eslint-enable */

	/**
	 * Makes this (input) element transparent
	 *
	 * @private
	 * @return void
	 */
	_makeInputTransparent : function() {
		this._oldBg = this.element.getStyle('background');
		this.element.setStyle({
			background : 'none'
		});
	},

	/**
	 * Creates a layer div which contains the highlight spans.
	 * @private
	 * @return void
	 */
	_createHighlightLayer : function() {
		var layerTemplate = new Ext.Template(this.layerTpl);

		this._highlightLayerEl = layerTemplate.insertAfter(this.element, {}, true);

		// Set CSS values from the original input element to the newly created highlight layer element.
		for (var i = 0; i < this._inputCSSArray.length; i++) {
			var stylePropValue = this._inputCSSArray[i].split(':');
			this._highlightLayerEl.setStyle(stylePropValue[0], stylePropValue[1]);
		}

		// Sets the highlight layer element's line-height to the original input's height
		var highlightLayerElLineHeight = this.element.getHeight();

		this._highlightLayerEl.setStyle({
			'line-height' : highlightLayerElLineHeight + 'px'
		});

		// Set sighlight spans to the right place.
		this._setHighlight();
	},

	/**
	 * Sets the highlight elements to their place.
	 *
	 * @private
	 * @return void
	 */
	_setHighlight : function() {
		var regexp, highlightLayerText, highlightWords, value;

		// If regexps are not given, but words in data-hightlight attribute
		if (this.regexps.length === 0) {
			highlightWords = this.element.data('highlight').split(',');
			// Replacing 'highlightedword' with '<span>highlightedword</span>'
			regexp = new RegExp('(?!\s)(\s?(' + highlightWords.join('|') + '))', 'gi');
			highlightLayerText = this.element.dom.value.split(' ').join('&nbsp;').replace(regexp, '<span style="visibility: hidden;">$&</span>'); // eslint-disable-line
		}
		// If regexps are handed over in 'this.regexps'
		else {
			value = this.element.dom.value.split(' ').join('&nbsp;');
			for (var i = 0; i < this.regexps.length; i++) {
				var parsedRegexp = Util.regexpParser(this.regexps[i]);
				regexp = new RegExp(parsedRegexp.pattern, parsedRegexp.modifier);
				highlightLayerText = value.replace(regexp, '<span style="visibility: hidden;">$&</span>');
			}
		}
		// Update highlight layer content.
		this._highlightLayerEl.update(highlightLayerText);
	},

	/**
	 * On key up. Update highlight layer text.
	 *
	 * @private
	 * @return void
	 */
	_onKeyUp : function() {},

	/**
	 * On input element focus. Hiding highlight spans.
	 *
	 * @private
	 * @return void
	 */
	_onFocus : function() {
		this._highlightLayerEl.select('span').setVisible(false);
	},

	/**
	 * On input element blur. Showing highlight spans.
	 *
	 * @private
	 * @return void
	 */
	_onBlur : function() {
		this._setHighlight();
		this._highlightLayerEl.select('span').setVisible(true);
	},

	/**
	 * Component destroy function
	 */
	destroy : function() {
		this.unbind();
		this.element.removeClass(this.highlightedCls);
		this.element.setStyle('background', this._oldBg);
		this._highlightLayerEl.dom.remove();
		delete InputHighlight.registry[this.element.id];
	},

	/**
	 * Binds all basic event listeners.
	 *
	 * @return void
	 */
	bind : function() {
		InputHighlight.superclass.bind.call(this);

		this.element.on({
			keyup : this._onKeyUp,
			focus : this._onFocus,
			blur  : this._onBlur,
			scope : this
		});
	},

	/**
	 * Unbinds all basic event listeners.
	 *
	 * @return void
	 */
	unbind : function() {
		InputHighlight.superclass.unbind.call(this);

		this.element.un({
			keyup : this._onKeyUp,
			focus : this._onFocus,
			blur  : this._onBlur,
			scope : this
		});
	}
});

