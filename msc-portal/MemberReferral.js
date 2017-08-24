import $ from 'jquery';

import Ext from '../../lib/vendor/ExtCore';
import Chaos from '../../lib/chaos/Chaos';

import ListFilterAbstract from './Abstract';

export default function MemberReferralListFilter(el, config) {
	MemberReferralListFilter.superclass.constructor.call(this, el, config);
}

Chaos.extend(MemberReferralListFilter, ListFilterAbstract, {

	/** @var {String}           Id of the searchfield input element */
	searchFieldElementId : 'memberNameFilter',

	/** @var {String}           class name of the list block */
	listBlockSel : '.referralListBlock',

	/** @var {String}           Selector of clear button in searchfield */
	clearBtnSel : '.clearLnk',

	/** @var {String}           ID of reset button in filter row */
	resetBtnId : 'memberReferralFilterResetBtn',

	/** @var {String}           The id of element that contains the number of referred members in the table footer */
	referredMembersId : 'numberOfReferredMembersDisplay',

	/** @var {String}           The id of element that contains the period income in the table footer */
	periodIncomeId : 'periodIncomeDisplay',

	/** @var {Number}            Minimum character length in the search field */
	minSearchLength : 4,

	/** @var {String}            ID of the wrapper of the search field. it handles searchfield protip. */
	searchTooltipWrapperId : 'searchTooltipWrapper',

	/* ELEMENTS */

	/** @var {Ext.Element}      Ext.Element that contains the number of referred members in the table footer */
	_resetBtnEl : undefined,

	/** @var {Ext.Element}      Ext.Element that contains the number of referred members in the table footer */
	_referredMembersEl : undefined,

	/** @var {Ext.Element}      Ext.Element that contains the period income in the table footer */
	_periodIncomeEl : undefined,

	/** @var {Ext.Element}      Ext.Element of the wrapper of the search field. it handles searchfield protip. */
	_searchTooltipWrapperEl : undefined,

	/**
	 * Init
	 *
	 * @param {Element} el      This should be the body tag.
	 * @param {Object} config   Config object of this component
	 */
	init : function(el, config) {
		this._resetBtnEl = Ext.get(this.resetBtnId);
		this._referredMembersEl = Ext.get(this.referredMembersId);
		this._periodIncomeEl = Ext.get(this.periodIncomeId);
		this._searchTooltipWrapperEl = Ext.get(this.searchTooltipWrapperId);

		//Call superclass
		MemberReferralListFilter.superclass.init.call(this, el, config);
	},

	/**
	 * Click on the reset filters button event handler.
	 * @private
	 * @param ev
	 */
	_onResetClick : function(ev) {
		ev.preventDefault();

		// Unbind change event handlers from selects to prevent unnecessary ajax requests
		this.parentClass.setSelectChangeHandlers(false);

		// Reset select fields
		for (var i = 0; i < this.parentClass._orderByEls.length; i++) {
			var selectCmp = this.parentClass._orderByEls[i];
			selectCmp.resetToFirstOption();
		}

		// Reset text search field
		this.parentClass._searchFieldEl.dom.value = '';
		// Hide X
		this.parentClass._searchFieldEl.next().setDisplayed(false);

		// Rebind select change events
		this.parentClass.setSelectChangeHandlers(true);

		this.searchEngine();
	},

	/**
	 * Functions when the search fired. Extends parent class function.
	 *
	 * @return void
	 */
	searchEngine : function() {
		var searchValue = this.parentClass._searchFieldEl.getValue();

		// If a minimum searchfield length is set, we check it. Its needed to send if the field is empty.
		if (this.minSearchLength && this.minSearchLength > searchValue.length && searchValue.length > 0) {
			return;
		}

		MemberReferralListFilter.superclass.searchEngine.call(this);
	},

	/**
	 * Ajax success event handler
	 *
	 * @param response
	 *
	 * @return void
	 */
	ajaxSuccessHandler : function(response) {
		var responseData = response.json.data;
		this._referredMembersEl.update(responseData.totalReferredMembers);
		this._periodIncomeEl.update(responseData.totalEarnedAmount);

		MemberReferralListFilter.superclass.ajaxSuccessHandler.call(this, response);
	},

	/**
	 * Renders the block depending on response
	 * @param {Object}  response      Ajax response
	 *
	 * @return void
	 */
	renderResponseBlock : function(response) {
		//Add element to DOM
		if (response.block) {
			this._listBlockEls = $(this.listBlockSel);
			this._listBlockEls.html(response.block);
		}
	},

	/**
	 * Select change event handler.
	 *
	 * @return void
	 */
	onSelectChangeHandler : function (params) {
		var searchValue = this.parentClass._searchFieldEl.getValue();

		if (searchValue.length < this.minSearchLength) {
			// Reset text search field
			this.parentClass._searchFieldEl.dom.value = '';
			// Hide X
			this.parentClass._searchFieldEl.next().setDisplayed(false);
		}

		MemberReferralListFilter.superclass.onSelectChangeHandler.call(this, params);
	},

	/**
	 * On Filter Search Field's wrapper div hover.
	 * @private
	 * @return void
	 */
	_onSearchFieldWrapperHover : function() {
		var fieldValueLength = this.parentClass._searchFieldEl.getValue().length;

		if (fieldValueLength < this.minSearchLength) {
			this._searchTooltipWrapperEl.addClass('hover');
		}
		else {
			this._searchTooltipWrapperEl.removeClass('hover');
		}
	},

	/**
	 * Binds events associated with this class
	 */
	bind : function() {
		// Call superclass
		MemberReferralListFilter.superclass.bind.call(this);

		this._resetBtnEl.on('click', this._onResetClick, this);
		this._searchTooltipWrapperEl.on('mouseenter', this._onSearchFieldWrapperHover, this);
	},

	/**
	 * Unbinds events associated with this class
	 */
	unbind : function() {
		// Call superclass
		MemberReferralListFilter.superclass.unbind.call(this);

		this._resetBtnEl.un('click', this._onResetClick, this);
		this._searchTooltipWrapperEl.un('mouseenter', this._onSearchFieldWrapperHover, this);
	}
});

