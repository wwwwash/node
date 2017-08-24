import $ from 'jquery';

import Ext from '../../lib/vendor/ExtCore';

import HTML5Uploader from './HTML5Uploader';

export default function HTML5MultiUploaderController(el, config) {
	HTML5MultiUploaderController.superclass.constructor.call(this, el, config);
}

Ext.extend(HTML5MultiUploaderController, HTML5Uploader, {

	/**
	 * Classes
	 *
	 * @type Object
	 */
	cls : {
		hide             : 'hide',
		disabled         : 'disabled',
		remove           : 'remove',
		fail             : 'fail',
		success          : 'success',
		tooltip          : 'uploader5__tooltip',
		itemTemplate     : 'uploader5__template--item',
		progressTemplate : 'uploader5__template--progress',
		itemsContainer   : 'uploader5__items',
		progress         : 'uploader5__progress',
		progressBar      : 'uploader5__progress-bar .bar',
		statusText       : 'uploader5__progress-bar span:first',
		statusPercent    : 'uploader5__progress-bar span:last',
		input            : 'uploader5__button input',
		buttonLink       : 'uploader5__button a'
	},

	/** @var {string} Position for protip gravity property. */
	_errorTooltipPosition : 'left;right;top;bottom',

	/** @var {Number} The number of uploads totally done. */
	_doneCount : 0,

	/**
	 * Constructor.
	 *
	 * @param el
	 * @param config
	 */
	init : function(el, config) {
		this.defaults.continueOnError = true;
		HTML5MultiUploaderController.superclass.init.call(this, el, config);
	},

	/**
	 * Extracts template from script tag.
	 *
	 * @param cls
	 * @returns {*}
	 */
	getTemplate : function(cls) {
		return this.element.jq().find(cls.dot()).html();
	},

	/**
	 * Returns an item element by file name.
	 *
	 * @param fileName
	 * @returns {*|jQuery}
	 */
	getItemByFileName : function(fileName) {
		return $('[data-file="' + fileName + '"]').eq(0);
	},

	/**
	 * Returns the element to show the common (all) errors on.
	 *
	 * @returns {*|jQuery}
	 */
	getCommonErrorEl : function() {
		return this.element.jq().find(this.cls.buttonLink.dot());
	},

	/**
	 * Returns the container element for the items.
	 *
	 * @returns {*|{}}
	 */
	getItemsContainer : function() {
		return this.element.jq().find(this.cls.itemsContainer.dot());
	},

	/**
	 * Creates and appends an item.
	 *
	 * @param fileName
	 */
	createItem : function(fileName) {
		this.getItemsContainer().append(
			this.getTemplate(this.cls.itemTemplate).tpl({
				fileName : fileName,
				progress : this.getTemplate(this.cls.progressTemplate)
			})
		);
	},

	/**
	 * Builds HTML template from the error messages.
	 *
	 * @returns {string}
	 */
	buildErrorMsg : function(messages) {
		var ret = '<ul>';
		messages.forEach(function(val) {
			ret += '<li>' + val + '</li>';
		});
		ret += '</ul>';
		return ret;
	},

	/**
	 * Shows error tooltip from generated messages or the text provided in the parameter.
	 *
	 * @param text [string]
	 * @private
	 */
	showErrors : function() {
		$.each(this.getSortedErrors(), function(fileName, messages) {
			if (fileName === 'all') {
				this.showError(this.getCommonErrorEl(), this.buildErrorMsg(messages));
			}
			else {
				this.showError(
					this.getItemByFileName(fileName).find(this.cls.fail.dot() + ' i'),
					this.buildErrorMsg(messages),
					true
				);
			}
		}.bind(this));
	},

	/**
	 * Show individual error.
	 *
	 * @param item    Item element.
	 * @param text    Error message
	 * @param isHover True == !sticky
	 */
	showError : function(item, text, isHover) {
		item.protipShow({
			trigger : isHover
				? $.protip.C.TRIGGER_HOVER
				: $.protip.C.TRIGGER_STICKY,
			title   : text,
			gravity : this._errorTooltipPosition,
			width   : 400
		});
		if (isHover) {
			item.protipHide();
		}
	},

	/**
	 * Hides error tooltip.
	 *
	 * @private
	 */
	hideErrors : function() {
		this.getCommonErrorEl().protipHide();
		this.element.jq().protipHideInside();
	},

	/**
	 * Sorts the stored error messages to a better format.
	 * {filename: [err1, err2]...}
	 *
	 * @returns {{}}
	 * @private
	 */
	getSortedErrors : function() {
		var errors = {};

		this._errors.forEach(function(val) {
			if (typeof val === 'string') {
				errors.all = errors.all || [];
				errors.all.push(val);
			}
			else {
				var fileName = Object.keys(val)[0];
				errors[fileName] = errors[fileName] || [];
				errors[fileName].push(val[fileName]);
			}
		});

		return errors;
	},

	/**
	 * Disables uploader.
	 */
	disableInput : function() {
		this.element.jq().find('input[type=file]').attr('disabled', 'disabled');
	},

	/**
	 * Enables uploader.
	 */
	enableInput : function() {
		this.element.jq().find('input[type=file]').removeAttr('disabled');
	},

	/**
	 * BeforeChange can trigger prepareFail. Disable the input first pls.
	 *
	 * @overrides HTML5Uploader
	 * @param ev
	 * @private
	 */
	_onBeforeChange : function(ev) {
		this.disableInput();
		HTML5MultiUploaderController.superclass._onBeforeChange.call(this, ev);
	},

	/**
	 * Callback when input field changes.
	 *
	 * @private
	 */
	_onChange : function() {
		this.hideErrors();
		this.showErrors();
	},

	/**
	 * On add callback.
	 *
	 * @param ev
	 * @private
	 */
	_onAdd : function(ev) {
		this.createItem(ev.files[0].name);
	},

	/**
	 * On done callback.
	 *
	 * @param ev
	 * @private
	 */
	_onDone : function(ev) {
		var fileName = ev.files[0].name;
		var el = this.getItemByFileName(fileName);
		var response;
		var isFailed;

		// Maybe failed on frontend, so there is no response
		try {
			response = JSON.parse(ev.result);
		}
		catch (e) {
			/* develblock:start */
			console.warn(e);
			/* develblock:end */
		}

		// We have response, check it's status
		isFailed = !(response && response.status === 'OK');
		// We had response and failed on backed, add it's error
		if (isFailed && response) {
			this._addError(fileName, response.errorMessage);
		}

		// Show errors - if no response, but _errors array isn't empty, it failed on frontend
		if (isFailed && (response || this._errors.length)) {
			this.showErrors();
		}

		// Hide/show stuff
		el.find(this.cls.progress.dot()).addClass(this.cls.hide);
		el.find(this.cls.statusText.dot()).addClass(this.cls.hide);
		el.find(this.cls.statusPercent.dot()).addClass(this.cls.hide);


		if (isFailed) {
			el.find(this.cls.fail.dot()).removeClass(this.cls.hide);
			el.find(this.cls.success.dot()).addClass(this.cls.hide);
		}
		else {
			el.find(this.cls.success.dot()).removeClass(this.cls.hide);
			el.find(this.cls.fail.dot()).addClass(this.cls.hide);
		}

		el.find(this.cls.remove.dot()).removeClass(this.cls.hide);

		if (++this._doneCount === this.pluginData.originalFiles.length) {
			this._onAllDone();
		}
	},

	/**
	 * On all done callback.
	 *
	 * @private
	 */
	_onAllDone : function() {
		this.enableInput();
		this._doneCount = 0;
	},

	/**
	 * Callback fro upload progress.
	 *
	 * @param ev {Object} Event object
	 * @private
	 */
	_onProgress : function(ev) {
		var percent = parseInt(ev.loaded / ev.total * 100, 10).percent();
		var el = this.getItemByFileName(ev.files[0].name);
		el.find(this.cls.progressBar.dot()).width(percent);
		el.find(this.cls.progress.dot()).removeClass(this.cls.hide);
		el.find(this.cls.statusText.dot()).addClass(this.cls.hide);
		el.find(this.cls.statusPercent.dot()).removeClass(this.cls.hide).text(percent);
	}
});