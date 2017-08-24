import Ext from '../../../lib/vendor/ExtCore';
import Chaos from '../../../lib/chaos/Chaos';
import Page from '../../../lib/chaos/Page';
import Config from '../../../lib/chaos/Config';

import Form from '../../_Form/Form';

import '../Authentication/Authentication.scss';
import '../Payout/Payout.scss';

export default function AddInformation (el, config) {
	AddInformation.superclass.constructor.call(this, el, config);
}

Chaos.extend(AddInformation, Page, {

	/** @var {Component}     Form plugin kompones */
	_form              : undefined,
	/**                 A signup folyamatban szereplo form id-ja**/
	_formId            : 'companyRegisterForm',
	/**                      Backend altal generalt validacios objektum neve **/
	_validationObjName : 'validationObj',
	/**                      A backend altal generalt hibakodokat es nyelvesitett hibauzeneteket tartalmazo objektum neve*/
	_errorObjName      : 'errorObj',
	/**
	 * Init
	 *
	 * @param {Element} el      This should be the body tag.
	 * @param {Object} config   Config object of this component
	 */
	init               : function (el, config) {
		this._form = new Form(
			Ext.get(this._formId), {
				validationObj      : Config.get(this._validationObjName),
				errorObj           : Config.get(this._errorObjName) || {},
				noRequireZipPlease : true
			}
		);
		// Init futtatasa
		AddInformation.superclass.init.call(this, el, config);
	},


	/**
	 * Esemenykezelok feliratkozasa
	 */
	bind : function () {
		AddInformation.superclass.bind.call(this);
	},

	/**
	 * Esemenykezelok torlese
	 */
	unbind : function () {
		AddInformation.superclass.unbind.call(this);
	}
});
