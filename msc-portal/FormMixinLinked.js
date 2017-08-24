/* eslint-disable camelcase */

import riot from 'riot';
import $ from 'jquery';

import Config from '../../lib/chaos/Config';
import { Broadcaster } from '../../lib/chaos/Broadcaster';

riot.tag('form-mixin-linked', '', function() {
	this.mixin('form');

	this.on('mount', function() {
		setTimeout(() => this.doHandler(true));
	});

	this.doHandler = function(isOnMount) {
		if (this.parent.opts.linked) {
			let value = this.parent.getValue();
			let linked = this.parent.opts.linked.split('|');
			if (this.parent.type !== 'radio' && this.prevValue === value) {return}
			this.prevValue = value;
			linked.forEach(method => {
				let handler = this['handler_' + method];
				if (handler) {
					handler.call(this, isOnMount === true);
				}
			});
		}
	};

	// Global submit on change
	this.handler_submitOnChange = function(isOnMount) {
		if (!isOnMount) {
			this.parent.form.trigger('submit');
		}
	};

	this.handler_fireChaosEvent = function(isOnMount) {
		if (!isOnMount) {
			Broadcaster.fireEvent('statistics-period-change');
		}
	};

	// WebMoney - has account 'YES' selected, purse Id should be appear
	this.handler_webmoneyPurseId = function() {
		var purseEl = this.form.getInput('purseId');
		var submitEl = $(this.form.tags['form-submit'].root);
		var formEl = $(this.form.root);
		var submitRowEl = submitEl.closest('ph-row');
		var onNoParagraphs = formEl.nextAll('.onNo');

		switch (this.parent.getValue()) {
			case 'yes':
				onNoParagraphs.slideUp();
				if (!submitRowEl.is(':visible')) {
					submitRowEl.slideDown();
				}
				purseEl.enableRowValidation();
				purseEl.showRow();
				break;
			case 'no':
			default:
				if (!onNoParagraphs.first().is(':visible')) {
					onNoParagraphs.slideDown();
				}
				submitRowEl.slideUp();
				purseEl.hideRow();
				purseEl.disableRowValidation();
				break;
		}
	};

	// ID has no expiry date checkbox handler
	this.handler_idNoExpiryCheckbox = function() {
		var el = this.form.getInput('month');
		if (this.parent.getValue()) {
			el.hideRow();
			el.disableRowValidation();
		}
		else {
			el.enableRowValidation();
			el.showRow();
		}
	};

	// Show hide state based on selected country
	this.handler_state = function() {
		var el = this.form.getInput('state');
		if (this.parent.getValue() !== 'US') {
			el.hideRow();
			el.disableRowValidation();
		}
		else {
			el.enableRowValidation();
			el.showRow();
		}
	};

	// Revalidate IdNumber at Id type change
	this.handler_idTypeChange = function() {
		var input = this.form.getInput('idNumber');

		if (input.getValue()) {
			input.blur({
				target : input
			});
		}
	};

	this.handler_attachCategoryToScreenNameField = function() {
		var screenNameInput = this.form.getInput('screenName');
		var mainCategoryId = $('input[name="mainCategory"]:checked', this.form.root).val();
		this.prevValue = '';
		screenNameInput.scenario = { mainCategoryId : mainCategoryId };
	};

	this.handler_checkScreenNameOnCategoryChange = function() {
		var screenName = this.form.getInput('screenName');
		var mainCategoryId = $('input[name="mainCategory"]:checked', this.form.root).val();
		screenName.lastValidationValue = '';
		this.prevValue = '';
		screenName.change({
			target : { type : 'radio' }
		});
		screenName.scenario = { mainCategoryId : mainCategoryId };
	};

	this.handler_suggestScreenName_onValidationEnd = (hasError, input, hasGlobalError, validator) => {
		// When screen-name-check is failed
		if (
			hasError
			&& validator
			&& validator.Rule
			&& validator.Rule.rule
			&& typeof validator.Rule.rule === 'string'
			&& (/check-screen-name$/).test(validator.Rule.rule)
		) {
			this.parent.trigger('screen-name-taken');
		}
	};

	this.form.on(this.form.CONST.END_VALIDATION_EVENT, this.handler_suggestScreenName_onValidationEnd.bind(this));


	// Category dropdown updates at performance type step
	this.handler_nameAndCategoryUpdate = function(isOnMount) {
		if (isOnMount) {return}

		var objectKey;
		var subSelectName;
		var subEl;
		var subcategories = Config.get('categorySelector').subCategoriesByCategoryType;

		switch (this.parent.opts.name) {
			case 'hotFlirtCategoryType':
				objectKey = 'hot_flirt';
				subSelectName = 'hotFlirtSubCategory';
				break;
			case 'nudeCategoryType':
				objectKey = 'nudity';
				subSelectName = 'nudeSubCategory';
				break;
			case 'nonNudeCategoryType':
				objectKey = 'non_nudity';
				subSelectName = 'nonNudeSubCategory';
				break;
			default:
				break;
		}
		subcategories = subcategories[objectKey];
		subcategories = subcategories[this.parent.getValue()];
		subEl = this.form.getInput(subSelectName);
		subEl.tags['form-mixin-datatable'].reload(subcategories);
	};

	this.handler_supportTopicSelect = (isOnMount) => {
		if (!isOnMount) {
			window.location = this.parent.opts.url;
		}
	};

	this.parent.on('change', this.doHandler.bind(this));
});
