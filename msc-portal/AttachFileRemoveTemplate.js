import Ext from '../../lib/vendor/ExtCore';
import ChaosTemplate from '../../lib/chaos/Template';

/**
 * AttachFileRemoveTemplate
 * Template of the remove element
 */

export default function AttachFileRemoveTemplate(config) {
	AttachFileRemoveTemplate.superclass.constructor.call(this, config);
}

Ext.extend(AttachFileRemoveTemplate, ChaosTemplate, {
	/** @var {string}   Name of the template class */
	name : 'AttachFileRemoveTemplate',

	/** @var {string}   html string */
	tpl : '<a href="{removeLink}" class="remove">' +
				'{removeCaption}' +
			'</a>',

	/**
	 * Initializer
	 *
	 * @return void;
	 */
	init : function() {
		AttachFileRemoveTemplate.superclass.init.call(this);
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


