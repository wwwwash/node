import Ext from '../../../lib/vendor/ExtCore';
import Chaos from '../../../lib/chaos/Chaos';
import ChaosObject from '../../../lib/chaos/Object';
import Form from '../../_Form/Form';

export default function PerformerProcess(el, config) {
	PerformerProcess.superclass.constructor.call(this, el, config);
}

Chaos.extend(PerformerProcess, ChaosObject, {

	/** @var {String}                  Selector of the person boxes */
	personBoxSel       : '.choosePerson li',
	personBoxSimpleSel : 'li',

	/** @var {String}                  Selector of the element which holds the person data attributes inside the personBox */
	dataHolderSel : 'a',

	/** @var {String}                  'Selected User Id' hidden input identifier */
	selectedUserHiddenId : 'selectedUserId',

	/** @var {String}                  Class which indicates the selected state */
	personSelectedCls : 'selected',

	/** @var {String}                  ID of the form element */
	formId : 'migrationFinishPerformerProcessForm',

	/** @var {String}                  Id of the email field */
	emailId : 'email',

	/** @var {String}                  Id of the password field */
	passId : 'password',

	/** @var {String}                  Submit button selector */
	btnSel : 'button[type=submit]',

	/** @var {Object}                  Composite element of the person boxes*/
	_personBoxEls : undefined,

	/** @var {Object}                  Element of the 'selected user id' hidden input */
	_selectedUserHiddenEl : undefined,

	/** @var {Object}                  Form element */
	_formEl : undefined,

	/** @var {Object}                  Element of the email field */
	_emailEl : undefined,

	/** @var {Object}                  Element of the password field */
	_passEl : undefined,

	/** @var {Object}                  Submit button element */
	_btnEl : undefined,

	/**
	 * Init
	 *
	 * @param {Element} el      This should be the body tag.
	 * @param {Object} config   Config object of this controller
	 */
	init : function(el, config) {
		this._personBoxEls = this.element.select(this.personBoxSel);
		this._selectedUserHiddenEl = Ext.get(this.selectedUserHiddenId);
		this._formEl = Ext.get(this.formId);
		this._emailEl = Ext.get(this.emailId);
		this._passEl = Ext.get(this.passId);
		this._btnEl = this.element.select(this.btnSel).item(0);

		if (this._formEl) {
			this._form = new Form(this._formEl, {});
		}

		PerformerProcess.superclass.init.call(this, el, config);
	},

	/**
	 *
	 * @param ev
	 * @param target
	 * @private
	 */
	_onPersonClick : function(ev, target) {
		ev.preventDefault();
		ev.stopPropagation();

		var el = Ext.get(target).findParent(this.personBoxSimpleSel, null, true),
			dataHolderEl = el.select(this.dataHolderSel).item(0),
			// Backend data
			userId = dataHolderEl.data('userId'),
			email = dataHolderEl.data('email'),
			hasPw = dataHolderEl.data('hasPassword');

		el.radioClass(this.personSelectedCls);

		this._form.hideError(this._emailEl);
		this._form.hideError(this._passEl);

		this._selectedUserHiddenEl.dom.value = userId;

		// If the email is set
		if (email !== '') {
			this._emailEl.dom.value = email;
			this._emailEl.addClass('disabled');
			this._form.showOkIcon(this._emailEl);
			this._emailEl.dom.setAttribute('disabled', 'disabled');
		}
		else {
			this._emailEl.dom.value = '';
			this._form.hideOkIcon(this._emailEl);
			this._emailEl.removeClass('disabled');
			this._emailEl.dom.removeAttribute('disabled');
		}

		// If has password, make a placeholder
		if (hasPw !== '') {
			this._passEl.dom.value = '';
			this._passEl.dom.setAttribute('placeholder', '**************');
			this._passEl.addClass('disabled');
			this._passEl.dom.setAttribute('disabled', 'disabled');
			this._form.showOkIcon(this._passEl);
		}
		else {
			this._passEl.dom.value = '';
			this._passEl.dom.removeAttribute('placeholder');
			this._passEl.dom.removeAttribute('disabled');
			this._passEl.removeClass('disabled');
			this._form.hideOkIcon(this._passEl);
		}

		// Save button disabled or not
		if (email !== '' && hasPw !== '') {
			this._btnEl.addClass('disabled');
		}
		else {
			this._btnEl.removeClass('disabled');
		}
	},

	/**
	 * Binds events
	 */
	bind : function() {
		PerformerProcess.superclass.bind.call(this);

		this._personBoxEls.on('click', this._onPersonClick, this);
	},

	/**
	 * Unbind events
	 */
	unbind : function() {
		this.unbind();
	}
});
