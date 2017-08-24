import Ext from '../../../lib/vendor/ExtCore';
import Chaos from '../../../lib/chaos/Chaos';
import Page from '../../../lib/chaos/Page';
import Config from '../../../lib/chaos/Config';

import Form from '../../_Form/Form';

import './Payout.scss';

export default function PayoutOptionsChange(el, config) {
	PayoutOptionsChange.superclass.constructor.call(this, el, config);
}

Chaos.extend(PayoutOptionsChange, Page, {

	/** @var {Component}					Form plugin kompones */
	_form              : undefined,
	/**										A signup folyamatban szereplo form id-ja**/
	_formId            : 'signup_form',
	/**										Backend altal generalt validacios objektum neve **/
	_validationObjName : 'validationObj',
	/* A backend altal generalt hibakodokat es nyelvesitett hibauzeneteket tartalmazo objektum neve*/
	_errorObjName      : 'errorObj',

	/**
	 * Init
	 *
	 * @param {Element} el      This should be the body tag.
	 * @param {Object} config   Config object of this component
	 */
	init : function(el, config) {
		//Form validalo plugin peldanyositasa
		let formEl = Ext.get(this._formId);
		if (formEl) {
			this._form = new Form(
				formEl, {
					validationObj : Config.get(this._validationObjName),
					errorObj      : Config.get(this._errorObjName) || {}
				}
			);
		}

		// Init futtatasa
		PayoutOptionsChange.superclass.init.call(this, el, config);
	},

	/**
	 * Esemenykezelok feliratkozasa
	 */
	bind : function() {
		PayoutOptionsChange.superclass.bind.call(this);
	},

	/**
	 * Esemenykezelok torlese
	 */
	unbind : function() {
		PayoutOptionsChange.superclass.unbind.call(this);
	}
});
