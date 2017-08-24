import Chaos from '../../lib/chaos/Chaos';
import Controller from '../../lib/chaos/Controller';

import DynamicFontResizerView from './DynamicFontResizerView';

/**
 * DynamicFontResizerController
 * ---------------------
 * Controller layer for controlling the note management processes
 */
export default function DynamicFontResizerController(el, config) {
	DynamicFontResizerController.superclass.constructor.call(this, el, config);
}

Chaos.extend(DynamicFontResizerController, Controller, {

	/** @var {String}    Default font size of notes */
	defaultFontSize : 'size_0',

	/** @var {Object}    Rules object for font resize */
	rules : {
		size_0 : { //eslint-disable-line camelcase
			fromValue : -1,
			toValue   : 0,
			dataValue : '1'
		},
		size_1 : { //eslint-disable-line camelcase
			fromValue : 0,
			toValue   : 10,
			dataValue : '1'
		},
		size_2 : { //eslint-disable-line camelcase
			fromValue : 10,
			toValue   : 30,
			dataValue : '2'
		},
		size_3 : { //eslint-disable-line camelcase
			fromValue : 30,
			toValue   : 60,
			dataValue : '3'
		},
		size_4 : { //eslint-disable-line camelcase
			fromValue : 60,
			toValue   : 80,
			dataValue : '4'
		},
		size_5 : { //eslint-disable-line camelcase
			fromValue : 80,
			toValue   : 100,
			dataValue : '5'
		},
		size_6 : { //eslint-disable-line camelcase
			fromValue : 100,
			toValue   : 200,
			dataValue : '6'
		}
	},
	/** @var {Object}    Rules object for font resize */
	_currentFontClass : undefined,

	/**
	 * Standard initializer
	 *
	 * @param {Object|String} el
	 * @param {Object} config
	 */
	init : function(el, config) {
		DynamicFontResizerController.superclass.init.call(this, el, config);

		this.addEvents(
			DynamicFontResizerView.EVENT_INPUT_KEYDOWN
		);
	},

	/**
	 * On input keyPress
	 *
	 * @method setDefaultFontSize
	 *
	 * @return {Object} scope
	 */
	setDefaultFontSize : function() {
		this.changeClasses(this.rules[this.defaultFontSize]);
		return this;
	},

	/**
	 *
	 *
	 * @method onInputKeydown
	 * @param {Object} param
	 *
	 * @return {Object} this scope to chain;
	 */
	onInputKeydown : function(param) {
		if (param.ev.keyCode === 27) {
			this.resetFontSize();
		}
		else {
			this.calculateFontClass(param);
		}
		return this;
	},

	/**
	 * On input keyPress
	 *
	 * @method calculateFontClass
	 *
	 * @return void;
	 */
	calculateFontClass : function(param) {
		var textLength = param.ev.target.value.length;
		if (textLength === 0) {
			this.resetFontSize();
		}
		else if (textLength === 1) {
			this.changeClasses(this.rules.size_1);
		}
		else {
			for (let property of Object.keys(this.rules)) {
				if (this.rules[property].fromValue < textLength && textLength <= this.rules[property].toValue) {
					this.changeClasses(this.rules[property]);
				}
			}
		}
	},

	/**
	 * Change classes
	 *
	 * @param {String} ruleObj
	 *
	 * @return {String} this.currentFontClass
	 */
	changeClasses : function(ruleObj) {
		if (!ruleObj) {
			this.resetFontSize();
		}
		this.DynamicFontResizerView.setFontData(ruleObj.dataValue);
	},

	/**
	 * Resets the font size to the default value
	 *
	 * @method resetFontSize
	 *
	 * @return void;
	 */
	resetFontSize : function() {
		this.DynamicFontResizerView.setFontData(this.rules[this.defaultFontSize].dataValue);
	},

	/**
	 * Initial bind method
	 *
	 * @return void;
	 */
	bind : function() {
		DynamicFontResizerController.superclass.bind.call(this);
	},

	/**
	 * Initial unbind method
	 *
	 * @return void;
	 */
	unbind : function() {
		DynamicFontResizerController.superclass.unbind.call(this);
	}
});