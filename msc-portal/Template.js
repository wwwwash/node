import Ext from '../vendor/ExtCore';

/**
 * General template creator.
 * @constructor
 *
 * @param {object} config   Configurables
 */
export default function ChaosTemplate(config) {
	// copy all config options to object properties
	Ext.apply(this, config);
	this.init();
}

Ext.extend(ChaosTemplate, Ext.util.Observable, {

	/** @var {string} tpl    Template string or HTML fragment */
	tpl          : '',
	/** @var {boolean} validateData   True if data validation is needed immediately before rendering template */
	validateData : true,

	/** PRIVATES */

	/** @var {Object}        Generated template string [instance of Ext.Template] */
	_tpl : undefined,

	/**
	 * Initializer
	 *
	 * @return void;
	 */
	init : function() {},

	/**
	 * Return with the a template string
	 *
	 * @return string;
	 */
	getTemplate : function() {
		return this._tpl;
	},

	/**
	 * Sets params for template to render.
	 *
	 * @param {Object} data   Apply template params
	 *
	 * @return object|string;
	 */
	_setTemplateParams : function(data) {
		if (!data || data === {} || data === null) {
			return '';
		}
		return {
			id : data.id
		};
	},

	/**
	 * Creates a new Ext.Template, and applies params to it.
	 *
	 * @param {Object} data   Apply template params
	 *
	 * @return string;
	 */
	render : function(data) {
		this._tpl = new Ext.Template(this.tpl);
		if (this.validateData) {
			this._validateData(data);
		}
		return this._tpl.applyTemplate(this._setTemplateParams(data));
	},

	/**
	 * Validates given data.
	 *
	 * @param {Object} data   Apply template params
	 *
	 * @return void
	 */
	_validateData : function(data) {
		if (typeof data === 'undefined' || data === {} || data === null) {
			throw 'Invalid data for template applying: ' + data;
		}
	}
});