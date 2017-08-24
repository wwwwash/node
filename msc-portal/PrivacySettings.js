import Chaos from '../../../lib/chaos/Chaos';
import Page from '../../../lib/chaos/Page';
import Util from '../../../lib/chaos/Util';

import Form from '../../_Form/Form';
import Http from '../../Http/Http';
import '../../_ToggleOnOff/ToggleOnOff';

import '../Profile/Profile.scss';
import './PrivacySettings.scss';

/**
 * Settings - Country Ban page.
 */

export default function PrivacySettingsIndex(el, config) {
	PrivacySettingsIndex.superclass.constructor.call(this, el, config);
}

Chaos.extend(PrivacySettingsIndex, Page, {

	/* UI elements */
	ui : {
		/** @var {String} Ban Guest Country type selectors */
		banGuestCountry : '.banGuestCountryType',

		/** @var {String} alertboxes */
		alertBox : '.alertBox',

		/** @var {String} Show Birthday form id */
		showBirthday : 'showBirthday',

		/** @var {String} Country Ban form id */
		countryBanForm : 'countryBan',

		/** @var {String} Guest Ban form id */
		guestBanForm : 'guestBan'
	},

	cmp : {
		everyOneForm : {
			name : Form,
			el   : 'ui.countryBanForm',
			opts : { sendWithAjax : true }
		},
		guestsForm : {
			name : Form,
			el   : 'ui.guestBanForm',
			opts : { sendWithAjax : true }
		}
	},

	globallyBannedCountries : null,

	/**
	 * Init
	 *
	 * @param {Element} el      This should be the body tag.
	 * @param {Object} config   Config object of this component
	 */
	init : function(el, config) {
		PrivacySettingsIndex.superclass.init.call(this, el, config);

		this.birthdayToggleEl = document.querySelector('div[name=birthday_visibility]');

		this.globallyBannedCountries = this._collectGloballyBannedCountries();

		// hide/show "one country" select according to "ban visitors" select value
		var banVisitorTypeCmp = this.everyOneForm.advancedSelectComponents['memberBanType-component-component'];
		this._handleBanVisitorTypeFromOwnCountry(banVisitorTypeCmp.getSelectedValue());

		// hooks to manually prepare data for ajax requests
		this.everyOneForm.onAjaxSend = this._beforeEveryOneFormDataSender.bind(this);
	},

	/**
	 * @param {DataSender} sender
	 * @private
	 */
	_beforeEveryOneFormDataSender : function (sender) {
		sender.params = sender.collectFormData();
		sender.params.memberBanType = this._getBannedVisitorType();
		sender.params.memberBanRegionCode = this._getBannedCountryForVisitors();

		// send detected country in case of changing "ban visitors" select from none to something
		if (!sender.params.memberBanRegionCode) {
			sender.params.memberBanRegionCode = this._getCurrentUserCountry().value;
		}
	},

	/**
	 * @returns {string}
	 * @private
	 */
	_getBannedVisitorType : function () {
		var banVisitorTypeCmp = this.everyOneForm.advancedSelectComponents['memberBanType-component-component'];

		return banVisitorTypeCmp.getSelectedValue();
	},

	/**
	 * @returns {string}
	 * @private
	 */
	_getBannedCountryForVisitors : function() {
		var banOwnCountryCmp = this.everyOneForm.advancedSelectComponents['memberBanRegion-component-component'];

		return banOwnCountryCmp.getSelectedValue();
	},

	/**
	 * @returns {{name: string, value: string}}
	 * @private
	 */
	_getCurrentUserCountry : function() {
		var banOwnCountryCmp = this.everyOneForm.advancedSelectComponents['memberBanRegion-component-component'];
		var detectedCountryOptionEl = banOwnCountryCmp._selectElement.select('option[data-detected=1]').item(0);

		// take first available country in case of unsuccessful country detection
		if (!detectedCountryOptionEl) {
			detectedCountryOptionEl = banOwnCountryCmp.getNextEnabledListElement(0, false);
		}

		var returnValue = detectedCountryOptionEl.dom.getAttribute('value') || detectedCountryOptionEl.data('value');

		return {
			name  : Util.getText(detectedCountryOptionEl),
			value : returnValue
		};
	},

	/**
	 * silent selector reset
	 * @private
	 */
	_resetCurrentUserCountrySelector : function () {
		var banOwnCountryCmp = this.everyOneForm.advancedSelectComponents['memberBanRegion-component-component'];

		banOwnCountryCmp._textInputElement.dom.value = Util.getText(
			banOwnCountryCmp._selectElement.select('option').item(0)
		);
		banOwnCountryCmp._selectElement.dom.value = '';
	},

	/**
	 * silently update "one country" select
	 * @private
	 */
	_setCurrentUserCountrySelector : function (country) {
		var banOwnCountryCmp = this.everyOneForm.advancedSelectComponents['memberBanRegion-component-component'];

		banOwnCountryCmp._selectElement.dom.value = country.value;
		banOwnCountryCmp._textInputElement.dom.value = country.name;
	},

	/**
	 * Handles selectlist changes.
	 * @param {Object} o Event Object
	 * @private
	 */
	_updateSelectLists : function(o) {
		var selectEl = o.advancedSelectEl;
		var listId = selectEl.id;
		switch (listId) {
			case 'memberBanType-component-component':
				var	selectedVisitorType = selectEl.getSelectedValue();
				this._handleBanVisitorTypeFromOwnCountry(selectedVisitorType);
				this._resetMyCountryFromBanGuests();
				break;

			case 'memberBanRegion-component-component':
				if (o.valueChanged === true) {
					this._handleAlertBox(selectEl);
				}

				this._updateDisabledCountries();
				break;

			case 'guestBanRegion_1-component-component':
			case 'guestBanRegion_2-component-component':
			case 'guestBanRegion_3-component-component':
				this._updateDisabledCountries();
				break;
		}
	},

	/**
	 * Hides the alertbox on the top of the page (GB-3565)
	 * And removes the 'Current - ... ' option from the select. By a optionToRemove class.
	 * @param {Object} selectCmp Select element that we work with.
	 */
	_handleAlertBox : function(selectCmp) {
		// Removing 'Current - ....' option. The method can handle its existance.
		selectCmp.removeElement('.optionToRemove');

		if (this.ui.alertBox.exists()) {
			this.ui.alertBox.el().slideOut('t', {
				easing   : 'easeOut',
				duration : 0.5,
				remove   : true
			});
			this.ui.alertBox.remove();
		}
	},

	/**
	 * BanOwnCountry enable-disable functionality (on banOwnCountryVisitors change)
	 * @param {string} visitorType
	 * @private
	 */
	_handleBanVisitorTypeFromOwnCountry : function(visitorType) {
		var banOwnCountryCmp = this.everyOneForm.advancedSelectComponents['memberBanRegion-component-component'];

		if (visitorType === 'none') {
			this._resetCurrentUserCountrySelector();

			banOwnCountryCmp.enableMask();
		}
		else {
			if (!this._getBannedCountryForVisitors()) {
				this._setCurrentUserCountrySelector(this._getCurrentUserCountry());
			}

			banOwnCountryCmp.disableMask();
		}

		this._updateDisabledCountries();
	},

	/**
	 * Resets my countries (set and recognized) from the 3 BanGuest selectors
	 * @private
	 */
	_resetMyCountryFromBanGuests : function() {
		var banOwnCountryCmp = this.everyOneForm.advancedSelectComponents['memberBanRegion-component-component'],
			myCountry = banOwnCountryCmp._selectElement.dom.value;

		// Execute function on all the 3 "Guests only" dropdown
		this._executeOnGuestFields(function(selectorValue, cmp) {
			if (myCountry !== '' && selectorValue === myCountry) {
				cmp.resetToFirstOption();
			}
		});
	},


	/**
	 * Executes a fn on every 3 guest dropdown
	 * @param {Function} callback
	 * @private
	 */
	_executeOnGuestFields : function(callback) {
		var guestCountrySelectCmps = this.guestsForm.advancedSelectComponents;

		for (var i in guestCountrySelectCmps) {
			if (!guestCountrySelectCmps.hasOwnProperty(i)) {
				continue;
			}

			var selectorValue = guestCountrySelectCmps[i].getSelectedValue();

			callback(selectorValue, guestCountrySelectCmps[i]);
		}
	},

	/**
	 * When you select countries to ban, it disables them in the other 'Banned country' select lists
	 *
	 * @private
	 */
	_updateDisabledCountries : function() {
		var visitorsTypeSelectCmp = this.everyOneForm.advancedSelectComponents['memberBanType-component-component'],
			banOwnCountryCmp = this.everyOneForm.advancedSelectComponents['memberBanRegion-component-component'],
			selectedCountries = this._collectUserBannedCountries();

		// add the banOwnCountry's value as well, if that field is available
		var ownCountry = false,
			toDisable;
		if (visitorsTypeSelectCmp.getSelectedValue() !== 'none') {
			selectedCountries.push(banOwnCountryCmp.getSelectedValue());
			ownCountry = banOwnCountryCmp.getSelectedValue();
		}

		// Execute function on all the 3 "Guests only" dropdown
		this._executeOnGuestFields(function(selectorValue, cmp) {
			switch (cmp.id) {
				// In the first guest ban component, disable US and non-US globally banned countries as well.
				case 'guestBanRegion_1-component-component':
					toDisable = selectedCountries
						.concat(this.globallyBannedCountries.US);
					break;
				// In the 2nd-3rd guest ban component, disable US and non-US globally banned countries as well.
				case 'guestBanRegion_2-component-component':
				case 'guestBanRegion_3-component-component':
				default:
					toDisable = selectedCountries
						.concat(this.globallyBannedCountries.US)
						.concat(this.globallyBannedCountries.nonUS);
					break;
			}

			cmp.disableOptionsByValue(toDisable);

			// reset selector if it has the same value as own country
			if (cmp._selectedOption && cmp.getSelectedValue() === ownCountry) {
				cmp.resetToFirstOption();
			}
		}.bind(this));
	},

	/**
	 * Collect the countries which are selected manually by the user in 'Ban everyone'
	 * and 'Ban guests only' sections.
	 *
	 * @returns {Array} Array of selected values by the user
	 * @private
	 */
	_collectUserBannedCountries : function() {
		var selectedCountries = [];

		// Execute function on all the 3 "Guests only" dropdown
		this._executeOnGuestFields(function(selectorValue) {
			if (selectorValue !== '0' && selectorValue !== 'none') {
				selectedCountries.push(selectorValue);
			}
		});

		return selectedCountries;
	},

	/**
	 * Collects all the element which should be banned in the 3 'Ban guests only' section.
	 * Return it differentiated by US and non-US values. The first guestBanRegion component shall
	 * include US values (disabled), the other two guestBanRegion shouldn't.
	 * The return list also includes the 'Ban everyone' section's country, because it should be banned/disabled
	 * in the 'Ban guests only' section as well.
	 *
	 * @returns {Object} us and non-us bannder countries array
	 * @private
	 */
	_collectGloballyBannedCountries : function() {
		// country selected in 'Ban everyone' section
		var memberRegionCmp = this.everyOneForm.advancedSelectComponents['memberBanRegion-component-component'],
			memberRegionBan = memberRegionCmp.getSelectedValue();

		// First country in 'Ban guests only' section, it includes (disables) USA countries.
		var guestBanRegion1cmp = this.guestsForm.advancedSelectComponents['guestBanRegion_1-component-component'];
		USList = this.getDisabledValues(guestBanRegion1cmp._options);

		// Second country in 'Ban guests only' section, it DOESN'T includes (disables) USA countries.
		var guestBanRegion2cmp = this.guestsForm.advancedSelectComponents['guestBanRegion_2-component-component'],
			nonUSList = this.getDisabledValues(guestBanRegion2cmp._options);

		// Collect&concat countries banned by User, these countries are selected manually with selectors.
		var userBanned = this._collectUserBannedCountries().concat(memberRegionBan);

		USList = Util.arrayDiff(USList, userBanned);
		nonUSList = Util.arrayDiff(nonUSList, userBanned);

		return {
			US    : USList,
			nonUS : nonUSList
		};
	},

	/**
	 * Returns all the options' values which is disabled.
	 *
	 * @param {Object} options Advanced select component's option object
	 * @return {Array}
	 */
	getDisabledValues : function(options) {
		var returnArray = [],
			elementList = options;
		for (var i = 0; i < elementList.length; i++) {
			if (elementList[i].disabled
				&& (elementList[i].disabled === 'disabled' || elementList[i].disabled === true)) {
				returnArray.push(elementList[i].realValue);
			}
		}

		return returnArray;
	},

	onBirthdaySwitch : function(isEnabled) {
		Http.post('PrivacySettings/SetBirthdayVisibilityPost', {
			body : {
				performerId : '',
				isEnabled   : Number(isEnabled)
			}
		});
	},

	/**
	 * Attach event listeners
	 */
	bind : function() {
		PrivacySettingsIndex.superclass.bind.call(this);

		this.everyOneForm.on(Form.EVENT_LINKED_FIELD_UPDATE, this._updateSelectLists, this);
		this.guestsForm.on(Form.EVENT_LINKED_FIELD_UPDATE, this._updateSelectLists, this);

		// Wait till switcher is mounted
		setTimeout(() => {
			this.birthdayToggleEl._tag.on('change-once', ::this.onBirthdaySwitch);
		}, 500);
	},

	/**
	 * Detach event listeners
	 */
	unbind : function() {
		this.autoUnbind();
	}
});
