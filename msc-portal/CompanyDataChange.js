import Ext from '../../../lib/vendor/ExtCore';
import Chaos from '../../../lib/chaos/Chaos';
import Page from '../../../lib/chaos/Page';

export default function CompanyDataChange(el, config) {
	CompanyDataChange.superclass.constructor.call(this, el, config);
}

Chaos.extend(CompanyDataChange, Page, {

	/** @var {String}               ID of the form element */
	formId : 'identification_form',

	/* Elements */

	/** @var {Object}               Ext.Element of the form on the page */
	_formElement : undefined,

	/**
	 * Init
	 *
	 * @param {Element} el      This should be the body tag.
	 * @param {Object} config   Config object of this component
	 */
	init : function(el, config) {
		this._formElement = Ext.get(this.formId);

		if (this._formElement) {
			this._form = new Form(
				this._formElement,
				{}
			);
		}

		// Run Init
		CompanyDataChange.superclass.init.call(this, el, config);
	},

	/**
	 * Attach event handlers
	 */
	bind : function() {
		CompanyDataChange.superclass.bind.call(this);
	},

	/**
	 * Detach event handlers
	 */
	unbind : function() {
		CompanyDataChange.superclass.unbind.call(this);
	}
});
