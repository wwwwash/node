import $ from 'jquery';
import XRegExp from 'xregexp';

import Chaos from '../../lib/chaos/Chaos';

import InputHighlight from './InputHighlight';

/**
 * @constructor
 */
export default function ValidatorJS(rule, value, field, form) {
	this.Deferred = $.Deferred();
	this.Rule = rule;
	this.Value = value;
	this.Field = field;
	this.FieldName = field.opts.name;
	this.Scenario = field.scenario;
	this.Form = form;

	var handlers = {
		mandatory     : this.validateMandatory,
		regexp        : this.validateRegexp,
		date          : this.validateDateGregorian,
		age           : this.validateDateInterval,
		date_interval : this.validateDateInterval, // eslint-disable-line
		interval      : this.validateInterval,
		ajax          : this.validateAjax,
		match         : this.validateMatch
	};

	this.Handler = handlers[this.Rule.rule_type]
		? handlers[this.Rule.rule_type]
		: () => true;
	this.Handler.call(this);

	return this.Deferred;
}

/**
 * Converts PHP style regex to JS usable regexp.
 * @param {String} regexp Regexp comes from backend
 * @return {Object} Converted JS compatible regexp
 */
ValidatorJS.prototype.convertRegexp = function(regexp) {
	var result  	= { pattern : regexp, modifier : '' },
		pattern 	= regexp.toString(),
		delimiter 	= regexp.charAt(0);

	if (pattern.indexOf(delimiter) === 0) {
		var first = 0,
			last = pattern.lastIndexOf(delimiter);
		result.pattern = pattern.substring(first + 1, last);
		// 'u' modifier causes bugs in XRegExp, thus we replace it out.
		result.modifier = pattern.substring(last + 1).replace('u', '');
	}
	return result;
};

/**
 * Validates mandatory rule.
 */
ValidatorJS.prototype.validateMandatory = function() {
	// We need different validation for checkboxes and radios.
	// If any of them are true, then mandatory rule is passes.
	if (this.Rule.rule && (this.Field.type === 'checkbox' || this.Field.type === 'radio')) {
		var isOk = false;
		this.Form.getInput(this.FieldName, false).forEach(function(input) {
			if (input.getValue()) {
				isOk = true;
			}
		});
		this.handleResult(isOk);
		return;
	}
	if (this.Rule.rule) {
		this.handleResult(!!this.Value.length || !!this.Value);
	}
	// If rule is not true, validation is not needed, so return true
	this.handleResult(true);
};

/**
 * Validates regexp.
 */
ValidatorJS.prototype.validateRegexp = function() {
	if (this.Value.length === 0)	{
		this.handleResult(true);

		return;
	}

	// If there is no rule but 'true' value in it, and we have a template
	// We shall validate the Value against the template only
	if (this.Rule.template && this.Rule.rule === true) {
		// Create regex which matches to {key}s in template string
		var bracesRegex = new XRegExp('(\\{.*?\\})', 'gi');
		// replace braces {key}s with string variable regex
		var matchRegex = this.Rule.template.replace(bracesRegex, '(.{1,})');
		var matchXRegexp = new XRegExp(matchRegex, 'gi');
		this.handleResult(this.Value.match(matchXRegexp));
		return;
	}
	else if (this.Rule.regexpList) {
		var byValue = this.Form.getInput(this.Rule.regexpListDependencyFieldName, 0).getValue();
		this.Rule.rule = this.Rule.regexpList[byValue] || this.Rule.rule;
	}
	var regexp = this.convertRegexp(this.Rule.rule);
	regexp = new XRegExp(regexp.pattern, regexp.modifier);
	var result = regexp.test(this.Value);
	// Ask backend devs about this -.-
	if (this.Rule.highlight) {
		result = !result;
	}
	this.handleResult(result);
};

ValidatorJS.prototype.validateMatch = function() {
	var result = this.Rule.rule !== this.Value.trim();
	this.handleResult(result);
};

/**
 * Validates date interval.
 */
ValidatorJS.prototype.validateDateInterval = function() {
	if (!this.validateDate()) {
		this.handleResult(false);
	}
	var dateTimeStamp = this.generateDateObject(this.Value).getTime() / 1000;
	var min = this.Rule.rule.min || -9999999999;
	var max = this.Rule.rule.max || 2147483648;
	this.handleResult(dateTimeStamp >= min && dateTimeStamp <= max);
};

/**
 * Validates number interval.
 */
ValidatorJS.prototype.validateInterval = function() {
	var min = this.Rule.rule.min || -9999999999;
	var max = this.Rule.rule.max || 2147483648;
	this.handleResult(this.Value >= min && this.Value <= max);
};

/**
 * Tells if our string matches the date pattern.
 * @returns {boolean}
 */
ValidatorJS.prototype.validateDate = function() {
	var datePat = /^(\d{4})(\/|-)(\d{1,2})(\/|-)(\d{1,2})$/,
		matchArray = this.Value.match(datePat);
	return matchArray !== null;
};

/**
 * Validates if date is a Gregorian date while accounting for leap year.
 */
ValidatorJS.prototype.validateDateGregorian = function() {
	if (!this.validateDate()) {
		this.handleResult(false);
		return false;
	}

	var date = this._parseDate(this.Value);
	var dateObj = new Date(date.month + '/' + date.day + '/' + date.year);
	this.handleResult(!(dateObj && parseInt(dateObj.getDate(), 10) !== parseInt(date.day, 10)));
};

/**
 * Date parser, returns split date data with leap year detection.
 *
 * @param {String} dateString   The date string to parse.
 *
 * @returns {{year: Number, month: number, day: Number, isLeap: boolean}}
 * @private
 */
ValidatorJS.prototype._parseDate = function(dateString) {
	var datePat = /^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})$/,
		date = dateString.match(datePat),
		year = parseInt(date[1], 10);

	return {
		year   : year,
		month  : parseInt(date[2], 10),
		day    : parseInt(date[3], 10),
		isLeap : new Date(year, 1, 29).getMonth() === 1
	};
};

/**
 * Validates value through an ajax request.
 */
ValidatorJS.prototype.validateAjax = function() {
	if (this.Field.lastValidationValue === this.Value) {
		this.Rule.error_message = this.Field.lastValidationErrorMessage; // eslint-disable-line
		this.handleResult(this.Field.lastValidationResult);
	}
	else {
		var obj = {};
		var result;
		obj[this.FieldName] = this.Value;

		if (typeof this.Scenario === 'object') {
			Object.assign(obj, this.Scenario);
		}

		$.post(this.Rule.rule, obj, function(response) {
			if (typeof response.data.highlight !== 'undefined' && !!response.data.highlight === true) {
				InputHighlight.set(this.Field.getID(), Array(response.data.spamExpression));
			}
			this.Field.lastValidationValue = this.Value;
			this.Rule.error_message = // eslint-disable-line
				this.Field.lastValidationErrorMessage =
					response.errorCode
					? Chaos.translate('Please wait and try again')
					: response.data.errorReason;
			result = this.Field.lastValidationResult = response.data && response.data.result;
			this.handleResult(result);
		}.bind(this));
	}
};

/**
 * Generates a sate object from a date string.
 * @param dateStr Date string. Formats: YEAR-MONTH-DAY
 * @returns {Date}
 */
ValidatorJS.prototype.generateDateObject = function(dateStr) {
	var dateArr = dateStr.split('-'),
		y = dateArr[0] || 0,
		m = dateArr[1] - 1 || 0,
		d = dateArr[2] || 0;
	return new Date(y, m, d);
};

/**
 * Returns the error message from the validator.
 * @returns {*}
 */
ValidatorJS.prototype.getError = function() {
	return this.Rule.error_message; // eslint-disable-line
};

/**
 * Handles the result and resolves/rejects the defferred object.
 * @param result
 */
ValidatorJS.prototype.handleResult = function(result) {
	this.Deferred[result ? 'resolve' : 'reject'](this, this.getError());
};
