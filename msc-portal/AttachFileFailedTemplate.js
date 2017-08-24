/* eslint-disable max-len */

import Ext from '../../lib/vendor/ExtCore';
import ChaosTemplate from '../../lib/chaos/Template';

/**
 * AttachFileFailedTemplate
 * Template of the failed result element
 */

export default function AttachFileFailedTemplate(config) {
	AttachFileFailedTemplate.superclass.constructor.call(this, config);
}

Ext.extend(AttachFileFailedTemplate, ChaosTemplate, {
	/** @var {string}   Name of the template class */
	name : 'AttachFileFailedTemplate',

	/** @var {string}   html string */
	tpl : '<span class="failed result">' +
				'{failedCaption}' +
				'<i class="icon-help protip" data-pt-target=".overlayContent" data-pt-icon="alert" data-pt-position="top" data-pt-title="{msg}"></i>' +
			'</span>',

	/**
	 * Initializer
	 *
	 * @return void;
	 */
	init : function() {
		AttachFileFailedTemplate.superclass.init.call(this);
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


