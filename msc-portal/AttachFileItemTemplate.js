import Ext from '../../lib/vendor/ExtCore';
import ChaosTemplate from '../../lib/chaos/Template';

/**
 * AttachFileItemTemplate
 * Template of a uploading item line
 */

export default function AttachFileItemTemplate(config) {
	AttachFileItemTemplate.superclass.constructor.call(this, config);
}

Ext.extend(AttachFileItemTemplate, ChaosTemplate, {
	/** @var {string}   html string */
	tpl : '<li data-id="{fileId}">' +
			'<em>{fileName}</em>' +
			'<span class="percentage">0%</span>' +
			'<div class="commonProgressBar">' +
				'<div class="progressContainer">' +
					'<div class="progressLine stripe">' +
					'<b></b><b></b><b></b><b></b><b></b><b></b><b></b><b></b><b></b><b></b><b></b>' +
					'</div>' +
				'</div>' +
			'</div>' +
			'<a href="#" class="cancel">{cancelCaption}</span>' +
	'</li>',

	/**
	 * Initializer
	 *
	 * @return void;
	 */
	init : function() {
		AttachFileItemTemplate.superclass.init.call(this);
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


