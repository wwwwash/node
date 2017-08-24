import Ext from '../../../lib/vendor/ExtCore';
import Chaos from '../../../lib/chaos/Chaos';
import ChaosObject from '../../../lib/chaos/Object';
import Form from '../../_Form/Form';

import './Payout.scss';

/**
 * Parent Controller for the payout settings overlays
 */
export default function PayoutOptionsAbstract(el, config) {
	PayoutOptionsAbstract.superclass.constructor.call(this, el, config);
}

Chaos.extend(PayoutOptionsAbstract, ChaosObject, {

	/** @type {Object} formCmp                   Form controller instance coming from init config */
	formCmp : undefined,

	/** @type {Object} overlayCmp                Overlay component instance coming from init config */
	overlayCmp : undefined,

	/** @type {String} _yesOrNoComponentName      Advanced select name we waiting for */
	_yesOrNoComponentName : 'yesOrNo-component',

	/** @type {String} _onYesSelectors           Boxes to show when user has an account at provider */
	_onYesSelectors : '.onYes, #row_payout_username',

	/** @type {String} _payoutInputId            ID of the account id input field */
	_payoutInputId : 'payout_username',

	/** @type {Object} _payoutInputEl            Element of the account id input field */
	_payoutInputEl : undefined,

	/** @type {String} _payoutInputName          Name attribute of the input field (stored on construct) */
	_payoutInputName : '',

	/** @type {String} _onNoSelectors            Boxes to show when user has no account at provider */
	_onNoSelectors : '.onNo',

	/** @type {Object} _onYesElements            Ext elements shown when user has account at provider */
	_onYesElements : undefined,

	/** @type {Object} _onNoElements             Ext elements shown when user has no account at provider */
	_onNoElements : undefined,

	/** @type {String} _showClass                Class to add/remove to hide yes/no elements */
	_showClass : 'show',

	/** @type {String} _minimumAmountId          ID of the dropdown for field "Minimum amount" */
	_minimumAmountId : 'minimumAmount',

	/** @type {Object} _minimumAmountEl           DOM element select for field "Minimum amount" */
	_minimumAmountEl : undefined,

	/** @type {String} _yesOrNoComponentId        ID of the dropdown for field "Do you already have a XY account?" */
	_yesOrNoComponentId : 'yesOrNo',

	/** @type {Object} _yesOrNoComponentEl        DOM element select for field "Do you already have a XY account?" */
	_yesOrNoComponentEl : undefined,

	_defaultFormAttributes : {
		target : '_blank',
		action : ''
	},

	/**
	 * Init
	 *
	 * @param {Element} el      This should be the body tag.
	 * @param {Object} config   Config object of this controller
	 */
	init : function(el, config) {
		PayoutOptionsAbstract.superclass.init.call(this, el, config);

		// Set elements
		this._onYesElements = this.element.select(this._onYesSelectors);
		this._onNoElements = this.element.select(this._onNoSelectors);
		this._payoutInputEl = Ext.get(this._payoutInputId);
		if (this._payoutInputEl) {
			this._payoutInputName = this._payoutInputEl;
			this.disablePayoutInput();
		}
		this._minimumAmountEl = Ext.get(this._minimumAmountId);
		this._yesOrNoComponentEl = Ext.get(this._yesOrNoComponentId);

		this._defaultFormAttributes.action = this.overlayCmp._dataSender.postUrl;

		// Turn on prevalidation
		this.formCmp && this.formCmp.turnOnPrevalidation();
	},

	/**
	 * Show elements if user has account at provider
	 */
	showYes : function() {
		let formAttributes = this._defaultFormAttributes;

		if (this._payoutInputEl) {
			this.enablePayoutInput();
			formAttributes = { target : '', action : '' };
		}
		Object.assign(this.formCmp.element.dom, formAttributes);
		this._onNoElements.removeClass(this._showClass);
		this._onYesElements.addClass(this._showClass);
	},

	/**
	 * Show elements if user has no account at provider
	 */
	showNo : function() {
		if (this._payoutInputEl) {
			this.disablePayoutInput();
		}
		Object.assign(this.formCmp.element.dom, this._defaultFormAttributes);
		this._onYesElements.removeClass(this._showClass);
		this._onNoElements.addClass(this._showClass);
	},

	/**
	 * Disables ID input to remove from validation if field is hidden
	 */
	disablePayoutInput : function() {
		if (this._payoutInputEl.dom.id.charAt(0) !== '_') {
			this._payoutInputEl.dom.id = '_' + this._payoutInputEl.dom.id;
		}
		this._payoutInputEl.dom.name = '';
	},

	/**
	 * Enables ID input to allow validation if field is visible
	 */
	enablePayoutInput : function() {
		this._payoutInputEl.dom.id = this._payoutInputEl.dom.id.substring(1);
		this._payoutInputEl.dom.name = this._payoutInputEl.dom.id;
	},

    /*
     * Shows submit buttons only if options selected
     */
	onSelectUpdate : function() {
		var yesOrNoSelect = this.formCmp.advancedSelectComponents[this._yesOrNoComponentName];

		if (!yesOrNoSelect || !this._minimumAmountEl) {
			return;
		}

		if (this._yesOrNoComponentEl.getValue() && this._minimumAmountEl.getValue()) {
			if (yesOrNoSelect.getSelectedValue() === 'yes') {
				this.showYes();
			}
			else {
				this.showNo();
			}
		}
	},

	bind : function() {
		this.formCmp && this.formCmp.on(Form.EVENT_LINKED_FIELD_UPDATE, this.onSelectUpdate, this);
	},

	unbind : function() {
		this.formCmp && this.formCmp.un(Form.EVENT_LINKED_FIELD_UPDATE, this.onSelectUpdate, this);
	}
});
