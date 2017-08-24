import Ext from '../../lib/vendor/ExtCore';
import ChaosTemplate from '../../lib/chaos/Template';

/**
 * AttachFileSuccessTemplate
 * Template of a success result
 */

export default function AttachFileSuccessTemplate(config) {
	AttachFileSuccessTemplate.superclass.constructor.call(this, config);
}

Ext.extend(AttachFileSuccessTemplate, ChaosTemplate, {
	/** @var {string}   html string */
	tpl : '<span class="success result">{uploadedCaption}</span>',

	/**
	 * Initializer
	 *
	 * @return void;
	 */
	init : function() {
		AttachFileSuccessTemplate.superclass.init.call(this);
	},

	/**
	 * Sets params for template to render.
	 *
	 * @param {Object} data   Apply template params
	 *
	 * @return object;
	 */
	_setTemplateParams : function(data) {
		return data;
	}
});


