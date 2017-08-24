/* eslint-disable max-statements */

import riot from 'riot';
import $ from 'jquery';

import PH from '../../lib/constant/Phrame';

// name type value placeholder checked required error mixins autocomplete hint info module captcha captchaUrlTemplate maxlength hidden
riot.tag('form-input',
`<div>
	<form-mixin-captcha if="{ opts.captcha }" captcha="{ opts.captcha }"></form-mixin-captcha>

	<input ref="input" if="{ opts.type != 'textarea'}" type="{ opts.type || 'text' }" name="{ opts.name }" value="{ opts.value }" placeholder="{ opts.placeholder }" onblur="{ blur }" onchange="{ change }" onkeydown="{ keydown }" onkeyup="{ keyup }" onfocus="{ focus }" maxlength="{ opts.maxlength }" minlength="{ opts.minlength }" autocomplete="{ opts.type === 'select' ? 'off' : 'on' }">
	<textarea ref="textarea" if="{ opts.type == 'textarea'}" name="{ opts.name }" onblur="{ blur }" onchange="{ change }" onkeydown="{ keydown }" onkeyup="{ keyup }" onfocus="{ focus }" maxlength="{ opts.maxlength }" minlength="{ opts.minlength }"></textarea>
	<form-mixin-charcounter if="{ opts.type == 'textarea' && typeof opts.maxlength !== 'undefined' }"></form-mixin-charcounter>

	<div if="{ opts.type != 'checkbox' && opts.type != 'radio' && opts.type != 'select' }" ref="yieldArea" class="{ PH.cls.hide }">
		 <yield></yield>
	</div>

	<label if="{ opts.type == 'checkbox' || opts.type == 'radio' }" for="{ getID() }" class="icon-check"></label>
	<label if="{ opts.type == 'checkbox' || opts.type == 'radio' }" for="{ getID() }" class="{ PH.cls.hide }" ref="yieldLabel">
		<yield></yield>
	</label>

	<div if="{ opts.type == 'select' }" onclick="{ mobileTap }" ref="form-input-mobile-tap"></div>
	<form-mixin-datatable if="{ opts.type == 'select' }" class="{ PH.cls.hide }"><yield></yield></form-mixin-datatable>
	<div ref="inside" class="form-input-additions form-input-additions--inside">
		<form-mixin-loading class="{ PH.cls.hide }"></form-mixin-loading>
		<form-mixin-eye if="{ opts.mixins.includes('eye') }" type="{ opts.type }" class="{ PH.cls.hide }"></form-mixin-eye>
		<form-mixin-select if="{ opts.type == 'select' }"></form-mixin-select>
	</div>
	<div ref="outside" class="form-input-additions form-input-additions--outside { PH.cls.hide }">
		<form-mixin-ok class="{ PH.cls.hide }"></form-mixin-ok>
		<form-mixin-error class="{ PH.cls.hide }"></form-mixin-error>
		<form-mixin-info if="{ opts.info }" text="{ opts.info }"></form-mixin-info>
		<form-mixin-hint if="{ opts.hint }" text="{ opts.hint }"></form-mixin-hint>
	</div>
	<form-mixin-linked class="{ PH.cls.hide }"></form-mixin-linked>
	<form-mixin-highlight class="{ PH.cls.hide }"></form-mixin-highlight>
</div>`,

function(opts) {
	// Construct
	this.mixin('form');
	this.form.registerInput(this);
	this.hasError = false;
	this.PH = PH;
	opts.mixins = opts.mixins || [];

	// Init variables
	const C = this.CONST;
	const Rand = Math.floor(Math.random() * (100000 - 0 + 1)) + 0;
	const ID = 'form-input-' + Rand;
	let ValidationEnabled = true;
	let Value = opts.value;

	// After DOM is ready
	this.on('mount', function() {
		this.input = opts.type === 'textarea'
			? this.refs.textarea
			: this.refs.input;
		if (opts.type === 'textarea') {
			this.input.value = this.input.innerHTML = opts.value;
			$(this.input).niceScroll(C.NICESCROLL_CONFIG);
		}
		this.input.id = this.getID();
		this.input.checked = typeof opts.checked !== 'undefined';
		if (typeof opts.required !== 'undefined') {
			this.getRow().addClass(PH.cls.input.required);
		}
		this.setValue(this.input.value);
		this.cleanYields();
		this.getLast().refs.outside.classList.remove(PH.cls.hide);
		if (typeof opts.disabled !== 'undefined') {
			this.input.setAttribute('disabled', 'disabled');
		}
		if (typeof opts.hidden !== 'undefined') {
			this.root.classList.add(PH.cls.hide);
		}
		if (typeof opts.readonly !== 'undefined') {
			this.input.setAttribute('readonly', '');
		}
	});

	this.getID = () => ID;

	this.cleanYields = () => {
		let { yieldArea, yieldLabel } = this.refs;

		if (yieldArea && yieldArea.innerHTML.trim().length) {
			yieldArea.classList.remove(PH.cls.hide);
			yieldArea.classList.add(PH.cls.display.inlineBlock);
		}
		if (yieldLabel && yieldLabel.innerHTML.trim().length) {
			yieldLabel.classList.remove(PH.cls.hide);
			yieldLabel.classList.add(PH.cls.display.inlineBlock);
		}
	};

	/**
	 * Returns the value of the input
	 * @return {string} Value of the input
	 */
	this.getValue = () => {
		let v = opts.type === 'checkbox' || opts.type === 'radio' ? this.input.checked : Value;
		return v;
	};

	/**
	 * Sets value.
	 * @param {string} val The value of the element.
	 * @return {void}
	 */
	this.setValue = val => this.input.value = Value = val;

	/**
	 * Returns true if every of the module's inputs are filled.
	 * @return {Boolean} If module if filled completely or not.
	 */
	this.isModuleFilled = () => {
		let isNotEmpty = input => input.getValue() !== '';
		let module = this.form.getInputStorage()[opts.module];

		return module.every(isNotEmpty);
	};

	/**
	 * Returns the random number generated for this input.
	 * @return {Number} Random number
	 */
	this.getRand = () => Rand;

	/**
	 * Return the form row element for this input.
	 * @return {object} JQuery
	 */
	this.getRow = () => $(this.root).closest(PH.cls.form.row.dot());

	/**
	 * Returns the last element of this input's module.
	 * @return {Object} Riot Element
	 */
	this.getLast = () => this.form.getInputStorage()[opts.module].slice(-1).pop();

	/**
	 * Tells if is this field is the last in the module list.
	 * @return {Boolean} is the last or not
	 */
	this.isLast = () => this.getLast().opts.name === opts.name;

	/**
	 * Shows the loading element.
	 * @return {void}
	 */
	this.showLoading = () => this.loading.trigger(C.RIOT_ELEMENT_SHOW_LOADING_EVENT);

	/**
	 * Hides the loading element.
	 * @return {void}
	 */
	this.hideLoading = () => this.loading.trigger(C.RIOT_ELEMENT_HIDE_LOADING_EVENT);

	/**
	 * Shows the highlite on the input.
	 * @return {void}
	 */
	this.showHighlite = () => this.input.classList.add(PH.cls.input.state.error);

	/**
	 * Hides the highlite on the input.
	 * @return {void}
	 */
	this.hideHighlite = () => this.input.classList.remove(PH.cls.input.state.error);

	/**
	 * Reveals the form row.
	 * @return {void}
	 */
	this.showRow = () => this.getRow().slideDown();

	/**
	 * Hides the form row.
	 * @return {void}
	 */
	this.hideRow = () => {
		this.getLast().trigger(C.RIOT_ELEMENT_HIDE_ERROR_EVENT);
		this.getRow().slideUp();
	};

	/**
	 * Enables validation for this input.
	 * @return {void}
	 */
	this.enableValidation = () => ValidationEnabled = true;

	/**
	 * Enables validation for this input.
	 * @return {void}
	 */
	this.disableValidation = () => ValidationEnabled = false;

	/**
	 * Checks if validation is enabled for this input.
	 * @return {Boolean} Is validation enabled or not
	 */
	this.isValidationEnabled = () => ValidationEnabled;

	/**
	 * Enables validation for the whole row.
	 * @return {void}
	 */
	this.enableRowValidation = () => {
		this.getRow().find('[name]').each((index, el) => {
			el = this.form.getInput(el.name, 0);

			if (el) {
				el.enableValidation();
			}
		});
	};

	/**
	 * Disables validation for the whole row.
	 * @return {void}
	 */
	this.disableRowValidation = () => {
		this.getRow().find('[name]').each((index, el) => {
			el = this.form.getInput(el.name, 0);

			if (el) {
				el.disableValidation();
			}
		});
	};

	/**
	 * On focus callback.
	 * @param {object} ev Event Object
	 * @return {boolean} true
	 */
	this.focus = ev => {
		this.trigger('focus', ev);
		this.isFocused = true;
		this.getLast().trigger('mixin-hide-ok');
		setTimeout(() => this.trigger('hide-error'));
		return true;
	};

	/**
	 * On change callback.
	 * Radio and checkbox aren't have blur event. Use change to call blur.
	 * @param {object} ev Event Object
	 * @return {void}
	 */
	this.change = ev => {
		if (ev.target.type === 'checkbox' || ev.target.type === 'radio') {
			this.trigger('change', ev);
			this.blur(ev);
		}
	};

	/**
	 * On blur callback.
	 * @param {object} ev Event Object
	 * @return {void}
	 */
	this.blur = ev => {
		this.trigger('blur', ev);
		if (this.isFocused) {
			this.trigger('change', ev);
		}
		this.isFocused = false;
		this.setValue(this.input.value);

		if (this.isModuleFilled() || ev.forceAll) {
			this.form.trigger(C.START_VALIDATION_EVENT, opts.module);
		}
	};

	/**
	 * Keyup callback.
	 * @param {object} ev Event Object
	 * @return {void}
	 */
	this.keyup = ev => {
		if (opts.type === 'textarea') {
			$(this.input).getNiceScroll().resize();
		}
		this.trigger(this.getValue() === '' ? 'empty-yes' : 'empty-no');
		this.trigger('keyup', ev);
	};

	/**
	 * Keydown callback.
	 * @param {object} ev Event Object
	 * @return {boolean} If noEnter then checks for enter is pressed
	 */
	this.keydown = ev => {
		this.trigger('keydown', ev);
		return opts.noEnter ? ev.keyCode !== 13 : true;
	};

	/**
	 * Tap on click area if exists (datatable mixin)
	 * @return {void}
	 */
	this.mobileTap = () => {
		if (typeof opts.disabled === 'undefined') {
			let select = this.root.querySelector('select');
			let e = new MouseEvent('mousedown', { bubbles : true, cancelable : true, view : window });
			select.dispatchEvent(e);
			this.isFocused = true;
		}
	};

	/**
	 * Bind events
	 */
	this.on(C.RIOT_ELEMENT_SHOW_HIGHLITE_EVENT, this.showHighlite);
	this.on(C.RIOT_ELEMENT_HIDE_HIGHLITE_EVENT, this.hideHighlite);
});
