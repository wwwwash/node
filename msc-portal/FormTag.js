/* eslint-disable max-statements */
/* eslint-disable complexity */
/* eslint-disable max-depth */
/* eslint-disable no-loop-func */

import riot from 'riot';
import $ from 'jquery';

import Chaos from '../../lib/chaos/Chaos';
import Config from '../../lib/chaos/Config';
import Util from '../../lib/chaos/Util';
import { Broadcaster } from '../../lib/chaos/Broadcaster';
import PH from '../../lib/constant/Phrame';
import DataSender from '../Ajax/DataSender';

import ValidatorJS from './ValidatorJS';

import './FormInput';
import './FormMixinCaptcha';
import './FormMixinCharcounter';
import './FormMixinDatatable';
import './FormMixinError';
import './FormMixinEye';
import './FormMixinHighlight';
import './FormMixinHint';
import './FormMixinInfo';
import './FormMixinLinked';
import './FormMixinLoading';
import './FormMixinOk';
import './FormMixinSelect';
import './FormSelectorbox';
import './FormSubmit';
import '../_ScreenNameSuggestionService/Snss';
import '../_Uploader5/_Uploader5';

riot.tag('form-tag', false, function() {
	riot.mixin('form', {
		CONST : {
			FORM_AJAX_SUCCESS                : 'form-success',
			FORM_AJAX_ERROR                  : 'form-error',
			FORM_READY_EVENT                 : 'form-ready',
			FORM_SUBMIT_EVENT                : 'form-submit',
			FORM_SUBMIT_DISABLE_EVENT        : 'form-submit-disable',
			FORM_SUBMIT_ENABLE_EVENT         : 'form-submit-enable',
			RIOT_ELEMENT_SHOW_ERROR_EVENT    : 'show-error',
			RIOT_ELEMENT_HIDE_ERROR_EVENT    : 'hide-error',
			RIOT_ELEMENT_SHOW_HIGHLITE_EVENT : 'show-highlite',
			RIOT_ELEMENT_HIDE_HIGHLITE_EVENT : 'hide-highlite',
			RIOT_ELEMENT_SHOW_LOADING_EVENT  : 'show-loading',
			RIOT_ELEMENT_HIDE_LOADING_EVENT  : 'hide-loading',
			RIOT_ELEMENT_SHOW_OK_EVENT       : 'mixin-show-ok',
			RIOT_ELEMENT_HIDE_OK_EVENT       : 'mixin-hide-ok',
			RIOT_ELEMENT_HIGHLIGHT_TEXT      : 'mixin-highlight',
			START_VALIDATION_EVENT           : 'start-validation',
			END_VALIDATION_EVENT             : 'end-validation',
			NICESCROLL_CONFIG                : {
				smoothscroll       : false,
				enabletranslate3d  : true,
				railpadding        : { top : 0, right : 0, left : 0, bottom : 0 },
				cursorborder       : '5px solid transparent',
				cursorborderradius : 20,
				cursorwidth        : '15px',
				autohidemode       : false,
				cursorcolor        : '#4C1112'
			}
		},
		Chaos,
		PH,
		$,
		Util,
		form : this
	});

	// Apply the mixin
	this.mixin('form');

	// Init variables
	var C = this.CONST;
	var InputStorage = {};
	var GlobalInvalidFields = {};
	var HasModuleError = false;
	var ErrorBuffer = [];
	var ValidationObjWrap = Config.get('validationObj');
	var ValidationObject = ValidationObjWrap ? ValidationObjWrap.data : false;
	var AllValidationDefferred;
	var ValidationCounter = 0;
	var IsAjax = !!this.root.getAttribute('ajax');
	var IsOverlay = !!this.root.getAttribute('overlay');
	var ActionUrl = this.root.getAttribute('action') || window.location;
	var AlreadyScrolledToFirstError = false;

	/**
	 * Registers a form-input element.
	 * @param {Object} input The form-input
	 * @return {void}
	 */
	this.registerInput = function(input) {
		InputStorage[input.opts.module] = InputStorage[input.opts.module] || [];
		InputStorage[input.opts.module].push(input);
	};

	/**
	* Returns if the form has a defined validation object or not.
	* @return {Boolean} Form has validation object
	*/
	this.hasValidationObject = function() {
		return !!ValidationObject;
	};

	/**
	 * Starts validation process based on module name.
	 * @param {string} module Module name
	 * @return {void}
	 */
	this.validateStart = function(module) {
		// Stop if ValidationObject is not set
		if (!ValidationObject) {
			return;
		}
		var deferred = $.Deferred();
		// Reset
		ErrorBuffer = [];
		HasModuleError = false;

		// Validate each field in module
		InputStorage[module].forEach(function(input) {
			if (!input.opts.disabled) {
				this.validate(input);
			}
		}, this);

		return deferred;
	};

	/**
	 * Does a validation for an input element.
	 * @param {Obejct} input The form-input element
	 * @return {void}
	 */
	this.validate = function (input) {
		var hasError, rule;
		var module = ValidationObject.modules[input.opts.module] || {};
		var rules = module.rules || [];
		var value = input.getValue();
		this.validationCounter();
		if (!rules.length) {
			return;
		}
		if (!input.isValidationEnabled()) {
			this.trigger(C.END_VALIDATION_EVENT, false, input, this.hasGlobalError());
			return;
		}

		// Iterate through every rule
		for (var i = 0; i < rules.length; i++) {
			rule = rules[i];

			// This rule shouldn't be applied to this field
			if (rule.field && rule.field !== input.opts.name || hasError) {continue}

			// Count validation
			this.validationCounter(1);

			// We need value by a template?
			value = rule.template ? this.applyValueTemplate(input.opts.module, rule.template) : value;

			// Show the loading element
			input.trigger(C.RIOT_ELEMENT_SHOW_LOADING_EVENT);

			// Hide OK
			input.trigger(C.RIOT_ELEMENT_HIDE_OK_EVENT);

			// Init a new validator
			new ValidatorJS(rule, value, input, this)
				.always(function() {
					input.trigger(C.RIOT_ELEMENT_HIDE_LOADING_EVENT);
					this.validationCounter(-1);
				}.bind(this))
				.fail(function(validator) {
					hasError = HasModuleError = true;
					GlobalInvalidFields[input.name] = true;
					ErrorBuffer.push(validator.getError());
					ErrorBuffer = $.unique(ErrorBuffer);
					this.trigger(C.END_VALIDATION_EVENT, true, input, this.hasGlobalError(), validator);

					if (rule.highlight) {
						input.trigger(C.RIOT_ELEMENT_HIGHLIGHT_TEXT, rule.rule, true);
					}
				}.bind(this))
				.done(function() {
					if (!HasModuleError) {
						delete GlobalInvalidFields[input.name];
						this.trigger(C.END_VALIDATION_EVENT, false, input, this.hasGlobalError());
					}
				}.bind(this));
		}
	};

	/**
	 * Return if the form has an error or not.
	 * @return {boolean} Has error ?
	 */
	this.hasGlobalError = function() {
		return !$.isEmptyObject(GlobalInvalidFields);
	};

	// Does things after validation is done.
	this.validateEnd = function(hadError, input) {
		var lastEl = input.getLast();
		input.hasError = hadError;

		// Prevents flashes
		lastEl.trigger(C.RIOT_ELEMENT_HIDE_OK_EVENT);

		if (hadError) {
			lastEl.trigger(C.RIOT_ELEMENT_SHOW_ERROR_EVENT, ErrorBuffer);
			input.trigger(C.RIOT_ELEMENT_SHOW_HIGHLITE_EVENT);
			this.scrollToErrorInput(input);
		}
		else if (HasModuleError) {
			lastEl.trigger(C.RIOT_ELEMENT_SHOW_ERROR_EVENT, ErrorBuffer);
			input.trigger(C.RIOT_ELEMENT_HIDE_HIGHLITE_EVENT);
			this.scrollToErrorInput(input);
		}
		else if (!ValidationCounter) {
			lastEl.trigger(C.RIOT_ELEMENT_HIDE_ERROR_EVENT);
			input.trigger(C.RIOT_ELEMENT_HIDE_HIGHLITE_EVENT);
			lastEl.trigger(C.RIOT_ELEMENT_SHOW_OK_EVENT);
		}
	};

	/**
	 * Returns with a value, generated out of a template string,
	 * Based on a module's values.
	 *
	 * @param {String} module The modules's name
	 * @param {String} template The template string, with {key}s
	 *
	 * @return {String} The generated value
	 */
	this.applyValueTemplate = function (module, template) {
		var replaceObj = {};

		InputStorage[module].forEach(function(input) {
			replaceObj[input.opts.name] = input.getValue();
		});

		return template.tpl(replaceObj);
	};

	/**
	 * Runs through every input on the for for validation.
	 * Does this by triggering  every inputs blur callback.
	 *
	 * @return {Boolean} errorFields
	 */
	this.validateEach = function () {
		// Reset global error
		GlobalInvalidFields = {};
		AlreadyScrolledToFirstError = false;

		for (let module in InputStorage) {
			if (!InputStorage.hasOwnProperty(module)) {continue}

			InputStorage[module].forEach(input => {
				input.input.blur();
				input.blur({
					target   : input,
					forceAll : true
				});
			});
		}
	};

	/**
	 * Builds the error message for an input based on the ErrorBuffer's values.
	 * @param {object} buffer ErrorBuffer
	 * @returns {string} error message
	 */
	this.buildErrorMessage = function (buffer) {
		buffer = buffer || ErrorBuffer;
		var msg = '';
		if (buffer.length === 1) {
			msg = buffer[0];
		}
		else if (buffer.length > 1) {
			msg = '<ul><li>';
			msg += buffer.join('</li><li>');
			msg += '</li></ul>';
		}
		return msg;
	};

	/**
	 * Getter for the InputStorage
	 * @returns {Object} InputStorage
	 */
	this.getInputStorage = () => InputStorage;

	/**
	 * Returns form data (every data of every input)
	 * @returns {Object} data
     */
	this.getData = function() {
		let data = {};
		for (let group of Object.values(InputStorage)) {
			for (let input of group) {
				if (input.opts.type === 'radio') {
					if (input.getValue()) {
						data[input.opts.name] = input.input.value;
					}
				}
				else if (input.opts.type === 'checkbox') {
					if (input.getValue()) {
						data[input.opts.name] = data[input.opts.name] || [];
						data[input.opts.name].push(input.input.value);
					}
				}
				else {
					data[input.opts.name] = input.getValue();
				}
			}
		}
		return data;
	};

	/**
	 * Returns a form-input element based on it's name.
	 * @param {String} name Name of the field
	 * @param {Number|Bool} index Return the input with this index. undefined = arr[0], number = arr[index], false = arr
	 * @returns {*} Form input element
	 */
	this.getInput = function (name, index = 0) {
		var results = [];
		for (var i in InputStorage) {
			if (!InputStorage.hasOwnProperty(i) || results.length) {continue}
			results = InputStorage[i].filter(input => input.opts.name === name);
		}
		return index === false ? results : results[index];
	};

	/**
	 * Each time a validator called the counter increases.
	 * When a validator is finished the counter will decrease.
	 * When it reaches 0 again, it will resolve our deffered object indicationg taht all validations are done.
	 * setTimeout needed to ensure that no other validations were started while decrising the number.
	 *
	 * @param {-1|1|Number} counter Counter of validation loop
	 * @return {void}
	 */
	this.validationCounter = function(counter = 0) {
		ValidationCounter += counter;

		// Maybe other validators have been initialized
		setTimeout(function() {
			if (!ValidationCounter && AllValidationDefferred) {
				AllValidationDefferred.resolve();
				AllValidationDefferred = null;
			}
		});
	};

	/**
	 * Prepares submit.
	 * Creates deffered object and rigsters the submit callback when all validations are done.
	 * @return {void}
	 */
	this.beforeSubmit = function() {
		AllValidationDefferred = $.Deferred();
		AllValidationDefferred.done(this.submit.bind(this));

		if (Object.keys(InputStorage).length && ValidationObject && Object.keys(ValidationObject).length) {
			this.validateEach();
		}
		else {
			AllValidationDefferred.resolve();
		}
	};

	/**
	 * Submit handler.
	 * @return {void}
	 */
	this.submit = function () {
		// Form has an error, quit
		if (this.hasGlobalError()) {
			this.trigger(C.FORM_SUBMIT_ENABLE_EVENT);
			return;
		}

		// Prevent multiple submit click
		this.trigger(C.FORM_SUBMIT_DISABLE_EVENT);

		// Handle request
		if (IsAjax) {
			this.submitAjax();
		}
		else {
			this.root.submit();
		}
	};

	/**
	 * Scrolls to the first invalid input if its not in the viewport.
	 * @param {Object} tag Input tag
	 * @return {void}
	 */
	this.scrollToErrorInput = function(tag) {
		if (!AlreadyScrolledToFirstError) {
			tag.input.scrollIntoViewIfNeeded();
			AlreadyScrolledToFirstError = true;
		}
	};

	/**
	 * AJAX submit handler
	 * @param {Function} successMethod Optional callback
	 * @param {Function} errorMethod Optional callback
	 * @return {void}
	 */
	this.submitAjax = function (successMethod, errorMethod) {
		var data = $(this.root).serialize();
		var url = this.root.action;
		successMethod = successMethod || this.submitAjaxSuccess;
		errorMethod = errorMethod || this.submitAjaxError;

		if (IsOverlay) {
			var overlay = Config.get('overlayComponent');
			new DataSender(this.root, {
				overlayComponent : overlay,
				params           : data,
				postUrl          : ActionUrl
			});
			Broadcaster.fireEvent('form-submit', {
				target : this.root
			});
		}
		else {
			$.post(url, data)
				.done(successMethod.bind(this))
				.fail(errorMethod.bind(this));
		}
	};

	/**
	 * AJAX success callback
	 * @return {void}
	 */
	this.submitAjaxSuccess = function (...args) {
		setTimeout(() => this.trigger(C.FORM_SUBMIT_ENABLE_EVENT), 1000);
		this.trigger(C.FORM_AJAX_SUCCESS, ...args);
	};

	/**
	 * AJAX error callback
	 * @return {void}
	 */
	this.submitAjaxError = function (...args) {
		this.trigger(C.FORM_SUBMIT_ENABLE_EVENT);
		this.trigger(C.FORM_AJAX_ERROR, ...args);
	};

	/**
	 * Bind events
	 */
	this.on(C.START_VALIDATION_EVENT, this.validateStart.bind(this));
	this.on(C.END_VALIDATION_EVENT, this.validateEnd.bind(this));
	this.on('submit', this.beforeSubmit.bind(this));
});
