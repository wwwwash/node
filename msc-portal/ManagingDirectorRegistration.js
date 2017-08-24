import Ext from '../../../lib/vendor/ExtCore';
import Chaos from '../../../lib/chaos/Chaos';
import '../../../lib/chaos/AjaxGet';

import ManageOwnerAbstract from './ManageOwnerAbstract';
import AdvancedSelect from '../../_Form/AdvancedSelect';

// TODO fix this
import '../Authentication/Authentication.scss';
import '../Payout/Payout.scss';

export default function ManagingDirectorRegistration(el, config) {
	ManagingDirectorRegistration.superclass.constructor.call(this, el, config);
}

Chaos.extend(ManagingDirectorRegistration, ManageOwnerAbstract, {


	/** @var {Object}           Object that contains the used routes */
	routes : {
		getAddForm  : 'Company/ManagingDirectorRegistration',
		getItemList : 'Company/GetManagingDirectorList',
		itemEdit    : 'Company/ManagingDirectorEdit',
		itemDelete  : 'Company/ManagingDirectorDelete'
	},
	/** @var {String}           Class of the Existing Person list elements */
	existingPersonElementCls : 'existingPersonElement',

	/** @var {String}           The URL param which indicates to load an edit form. */
	loadEditFormUrlParam : 'editedId',

	/** @var {Object}           Choose existing person selectbox el */
	_advancedSelectEl : undefined,

	/**
	 * Init
	 *
	 * @param {Element} el      This should be the body tag.
	 * @param {Object} config   Config object of this component
	 */
	init : function (el, config) {
		var existingPersonSelectEl = Ext.get('existingPerson-component');

		this._advancedSelectEl = new AdvancedSelect(
			existingPersonSelectEl,
			{}
		);

		// Run parent class init
		ManagingDirectorRegistration.superclass.init.call(this, el, config);
	},

	/**
	 * Change event of the Select Person selectbox
	 *
	 * @param options
	 */
	onSelectChange : function(options) {
		var valueChanged = options.valueChanged;
		if (valueChanged) {
			this.getAddForm(this._advancedSelectEl._selectedOption, this.routes.getAddForm);
			this._formTypeSelectorEls.removeClass(this.disabledCls);
			this._advancedSelectEl.enableMask();
		}
	},

	/**
	 * Supplement method of the parents onFormTypeClick method.
	 *
	 * @param ev
	 * @param target
	 */
	onFormTypeClick : function(ev, target) {
		var targetEl = Ext.get(target),
			isExistingPersonDisabled = this.checkExistingSelectorDisability(true);

		ManagingDirectorRegistration.superclass.onFormTypeClick.call(this, ev, target);

		this._advancedSelectEl.reset();

		if (!isExistingPersonDisabled && !targetEl.hasClass(this.disabledCls)) {
			this._advancedSelectEl.disableMask();
		}
	},


	/**
	 * Supplement method of the parents onCancelClick method.
	 *
	 * @param ev
	 * @param target
	 */
	onCancelClick : function(ev, target) {
		ManagingDirectorRegistration.superclass.onCancelClick.call(this, ev, target);

		this._advancedSelectEl.reset();
		//this._advancedSelectEl.disableMask();
	},

	/**
	 * Supplement method of the parents onDeleteClick method.
	 *
	 * @param ev
	 * @param target
	 */
	onDeleteClick : function(ev, target) {
		ManagingDirectorRegistration.superclass.onDeleteClick.call(this, ev, target);

		this._advancedSelectEl.reset();
	},

	/**
	 * Check if there is an Existing Person item in the list, and if yes, it will disable the selector.
	 *
	 * @param {Boolean} onlyState If we only need to return the disability state (true|false), instead of handling of the mask
	 */
	checkExistingSelectorDisability : function(onlyState) {
		onlyState = onlyState || false;

		var existingPersonEls = this._addFormWrapperEl.select(this.existingPersonElementCls.dot());

		// If have Existing Person in the list
		if (existingPersonEls.getCount() > 0) {
			if (!onlyState) {
				this._advancedSelectEl.enableMask();
			}
			return true;
		}
		// If dont have

		if (!onlyState) {
			this._advancedSelectEl.disableMask();
		}
		return false;
	},

	/**
	 * Supplements the ManageOwnerAbstract's same mathod with the check of Existing Person selector disability.
	 *
	 * @param response
	 */
	itemListAjaxLoadSuccess : function(response) {
		ManagingDirectorRegistration.superclass.itemListAjaxLoadSuccess.call(this, response);

		this._advancedSelectEl.reset();
		this.checkExistingSelectorDisability();
	},

	/**
	 * Attach event listeners
	 */
	bind : function () {
		ManagingDirectorRegistration.superclass.bind.call(this);

		this._advancedSelectEl.on('change', this.onSelectChange, this);
	},

	/**
	 * Detach event listeners
	 */
	unbind : function () {
		ManagingDirectorRegistration.superclass.unbind.call(this);

		this._advancedSelectEl.on('change', this.onSelectChange, this);
	}
});
