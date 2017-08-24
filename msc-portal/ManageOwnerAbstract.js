import Ext from '../../../lib/vendor/ExtCore';
import Chaos from '../../../lib/chaos/Chaos';
import Page from '../../../lib/chaos/Page';
import Config from '../../../lib/chaos/Config';
import Util from '../../../lib/chaos/Util';
import { Broadcaster } from '../../../lib/chaos/Broadcaster';

import Ajax from '../../Ajax/Ajax';
import Form from '../../_Form/Form';
import DataSender from '../../Ajax/DataSender';
import ProgressIndicator from '../../ProgressIndicator/ProgressIndicator';

export default function ManageOwnerAbstract(el, config) {
	ManageOwnerAbstract.superclass.constructor.call(this, el, config);
}

Chaos.extend(ManageOwnerAbstract, Page, {

	/** @var {String}           Selector of the owner type buttons (Add person-company) */
	formTypeSelectorSel  : '.formTypeSelector a',
	/** @var {String}           Form validation object **/
	validationObjName    : 'validationObj',
	/** @var {String}           Button disabled class */
	disabledCls          : 'disabled',
	/** @var {String}           The wrapper where the add form loaded in. ID. */
	addFormWrapperId     : 'addFormWrapper',
	/** @var {String}           Common class for Add Company and Add Person forms */
	addFormCls           : 'addForm',
	/** @var {String}           'or cancel' link class next to the 'add company' button */
	orCancelCls          : 'orCancel',
	/** @var {String}           Class of the edit btns in the owner list */
	editBtnCls           : 'editItem',
	/** @var {String}           Class of the delete btns in the owner list */
	deleteBtnCls         : 'deleteItem',
	/** @var {Object}           Object that contains the used routes. Can be found in the child classes. */
	routes               : undefined,
	/** @var {String}           The URL param which indicates to load an edit form. Can be set in child classes. */
	loadEditFormUrlParam : undefined,
	/** @var {String}           Selector of the next btn. */
	nextBtnSel           : '.nextBtn',
	/** @var {String}           Person registration '... has been added' list items selector */
	personListItemSel    : '.inlineAlertBoxContainer',

	/* PRIVATES */

	/** @var {Component}        Form component */
	_form                : undefined,
	/** @var {Object}           Owner type buttons */
	_formTypeSelectorEls : undefined,
	/** @var {Object}           The wrapper where the add form loaded in. */
	_addFormWrapperEl    : undefined,
	/** @var {Boolean}          Add owner form instance ? */
	_addForm             : undefined,
	/** @var {Component}        Datasender component */
	_dataSender          : undefined,
	/** @var {Object}           'or cancel' link element next to the 'add company' button */
	_orCancelEl          : undefined,
	/** @var {Object}           Composite element of the edit btns in the owner list  */
	_editBtnEls          : undefined,
	/** @var {Object}           Composite element of the delete btns in the owner list  */
	_deleteBtnEls        : undefined,
	/** @var {Object}           Request Object of the 'Add Company' or 'Add Person' button's click event  */
	_addFormRequest      : undefined,
	/** @var {Number}           ID of the pre-loaded edit form */
	_loadEditFormId      : undefined,
	/** @var {Object}           Next Btn Element */
	_nextBtnEl           : undefined,
	/**
	 * Init
	 *
	 * @param {Element} el      This should be the body tag.
	 * @param {Object} config   Config object of this component
	 */
	init                 : function (el, config) {
		this._formTypeSelectorEls = this.element.select(this.formTypeSelectorSel);
		this._addFormWrapperEl = Ext.get(this.addFormWrapperId);
		this._nextBtnEl = this.element.select(this.nextBtnSel).item(0);

		// If an editedId or ownerId is in the url, we shall load its edit form
		this.preloadEditForm();

		this.attachItemListEvents();

		// Run parent class init
		ManageOwnerAbstract.superclass.init.call(this, el, config);
	},

	/**
	 * Checks EditedId or OwnerId in the URL, then load its edit form.
	 */
	preloadEditForm : function() {
		var urlParams = Util.getUrlParams(),
			formEditId = urlParams[this.childClass.loadEditFormUrlParam];

		if (formEditId) {
			this.getAddForm(formEditId, this.childClass.routes.itemEdit);
		}
	},

	/**
	 * (re)Attach owner list event handlers.
	 */
	attachItemListEvents : function() {
		this._editBtnEls = this._addFormWrapperEl.select(this.editBtnCls.dot());
		this._deleteBtnEls = this._addFormWrapperEl.select(this.deleteBtnCls.dot());

		this._editBtnEls.removeAllListeners().on('click', this.onEditClick, this);
		this._deleteBtnEls.removeAllListeners().on('click', this.onDeleteClick, this);
	},

	/**
	 * Click on the owner type buttons. Add person or Add company.
	 *
	 * @param ev
	 * @param target
	 */
	onFormTypeClick : function(ev, target) {
		ev.preventDefault();
		this.getAddForm(target, this.childClass.routes.getAddForm);
	},

	/**
	 * Owner list edit click event handler
	 *
	 * @param ev
	 * @param target
	 */
	onEditClick : function(ev, target) {
		ev.preventDefault();

		var targetEl = Ext.get(target);
		this.getAddForm(targetEl, this.childClass.routes.itemEdit);
	},

	/**
	 * Owner list delete click event handler
	 *
	 * @param ev
	 * @param target
	 */
	onDeleteClick : function(ev, target) {
		ev.preventDefault();

		var targetEl = Ext.get(target),
			queryParams = targetEl.data();

		this.deleteListItem(queryParams);
	},

	/**
	 * Gets 'Add owner' form via ajax call
	 *
	 * @param {Mixed} clicked Clicked add button (always 'A' tag), which contains the requested form type in a data-type attribute
	 * @param {String} route   The route from where we get the form data
	 */
	getAddForm : function(clicked, route) { // eslint-disable-line
		if (typeof clicked === 'undefined') {
			/* develblock:start */
			console.warn('Clicked attribute should be set');
			/* develblock:end */
			return;
		}
		if (typeof route === 'undefined') {
			/* develblock:start */
			console.warn('Route attribute should be set');
			/* develblock:end */
			return;
		}

		var queryParams = {},
			targetEl,
			isAjaxRunning = false;

		// If the clicked is an Ext.Element, we have to get data from it. Else this is an exact ID.
		if (typeof clicked !== 'string') {
			var targetBaseEl = Ext.get(clicked);
			targetEl = targetBaseEl.findParent('a', 3, true);
			// If not in a link element, we use the clicked element itself. (li element in selectbox)
			if (!targetEl) {
				targetEl = targetBaseEl;
			}

			if (targetEl && targetEl.hasClass(this.disabledCls)) {
				return;
			}

			// Collect id of the form that we want to open from data attr ...
			queryParams = targetEl.dom.hasAttribute('value')
				? { personId : targetEl.dom.getAttribute('value') }
				: targetEl.data();
			isAjaxRunning = Ajax.getRequest(this._addFormRequest);
		}
		// We not clicked on any element, url param triggered the addForm action
		else {
			// Clicked is a number in this case.
			queryParams[this.childClass.loadEditFormUrlParam] = clicked;
		}

		if (!isAjaxRunning) {
			this._nextBtnEl.dom.setAttribute('disabled', 'disabled');
			// Add class to the button, and remove from its siblings
			if (targetEl && !targetEl.parent('select')) {targetEl.radioClass(this.disabledCls)}
			this._addFormWrapperEl.dom.innerHTML = '';
			this.showFormLoader(true);
			// Getting the add owner form into a wrapper
			this._addFormRequest = Chaos.GetData(route, queryParams, this.getAddFormSuccess, this);
		}
	},

	/**
	 * getAddForm's ajax success callback.
	 * Add form and datasender components, handles validation object.
	 *
	 * @param response
	 */
	getAddFormSuccess : function(response) {
		var r = response.json.data;

		this.showFormLoader(false);

		// Append block into dom
		this._addFormWrapperEl.dom.innerHTML = r.block;

		// Build jsObject
		for (let key of Object.keys(r.jsObject)) {
			Config.set(key, r.jsObject[key]);
		}
		// Instantiate form component
		var formEl = this._addFormWrapperEl.select('form').item(0);

		this.formFactory(formEl, r.postUrl);
	},

	/**
	 * Factory method for Add Owner - Add Managing Director pages.
	 *
	 * @param {Object} formEl  Form element to instantiate
	 * @param {String} postUrl Post URL
	 */
	formFactory : function(formEl, postUrl) {
		if (this._addForm) {
			this._addForm.destroy();
			delete this._addForm;
		}
		if (this._dataSender) {
			this._dataSender.unbind();
			delete this._dataSender;
		}

		// Add form instance for form functions
		this._addForm = new Form(
			formEl,
			{
				validationObj      : Config.get(this.validationObjName),
				noRequireZipPlease : true
			}
		);

		// Add datasender cmp for collecting form field data. dataSenderCallback will handle the 'form-submit' callback.
		this._dataSender = new DataSender(
			formEl,
			{
				postUrl           : postUrl,
				callbackFn        : this.itemListAjaxLoadSuccess,
				callbackScope     : this,
				loaderContainerEl : this._addFormWrapperEl
			}
		);

		// Cancel button
		this._orCancelEl = this._addFormWrapperEl.select(this.orCancelCls.dot()).item(0);

		this._orCancelEl.removeAllListeners().on('click', this.onCancelClick, this);
	},

	/**
	 * Gets the owner list.
	 *
	 * @param {Object} ajaxQueryParams Params for the ajax request.
	 */
	getItemList : function(ajaxQueryParams = {}) {
		this.showFormLoader(true);

		Chaos.GetData(this.childClass.routes.getItemList, ajaxQueryParams, this.itemListAjaxLoadSuccess, this);
	},

	/**
	 * Delete an owner.
	 *
	 * @param {Object} postParams
	 */
	deleteListItem : function(postParams = {}) {
		this.showFormLoader(true);

		Chaos.PostData(this.childClass.routes.itemDelete, postParams, this.itemListAjaxLoadSuccess, this);
	},

	/**
	 * Common ajax success for ajax request that loads the owner list.
	 * Cancel button, Delete.
	 *
	 * @param response
	 */
	itemListAjaxLoadSuccess : function(response) {
		var r = response.json.data;

		this.showFormLoader(false);

		this._addFormWrapperEl.dom.innerHTML = r.block;

		this.attachItemListEvents();

		// If a form can be found in the response block, we instantiate a form component
		// ( In case of form error, we load the form again instead of the list )
		var formEl = this._addFormWrapperEl.select('form').item(0),
		// If there is a person element in the response, nextBtn should be enabled (otherwise disabled)
			existingPersonEl = this._addFormWrapperEl.select(this.personListItemSel).item(0);

		if (formEl) {
			var postUrl = r.postUrl;
			this.formFactory(formEl, postUrl);
		}
		// If we dont have a form, button 'enablization' is not necessary
		else if (existingPersonEl) {
			this._formTypeSelectorEls.removeClass(this.disabledCls);
			this._nextBtnEl.dom.removeAttribute('disabled');
		}
		else {
			this._formTypeSelectorEls.removeClass(this.disabledCls);
			this._nextBtnEl.dom.setAttribute('disabled', 'disabled');
		}
	},

	/**
	 * 'or Cancel' link click event handler
	 *
	 * @param ev
	 */
	onCancelClick : function(ev) {
		ev.preventDefault();

		this.getItemList();
	},

	/**
	 * Shows or hides the _addFormWrapperEl's loader.
	 *
	 * @param {Boolean} show Show or Hide
	 */
	showFormLoader : function(show = true) {
		if (show) {
			Broadcaster.fireEvent(
				ProgressIndicator.GLOBALEVENT_ADD_LOCAL_INDICATOR,
				{ element : this._addFormWrapperEl }
			);
		}
		else {
			Broadcaster.fireEvent(
				ProgressIndicator.GLOBALEVENT_REMOVE_LOCAL_INDICATOR,
				{ element : this._addFormWrapperEl }
			);
		}
	},

	/**
	 * Attach event listeners
	 */
	bind : function () {
		ManageOwnerAbstract.superclass.bind.call(this);

		this._formTypeSelectorEls.on('click', this.onFormTypeClick, this);
	},

	/**
	 * Detach event listeners
	 */
	unbind : function () {
		ManageOwnerAbstract.superclass.unbind.call(this);

		this._formTypeSelectorEls.un('click', this.onFormTypeClick, this);
	}
});