import riot from 'riot';

import PH from '../../lib/constant/Phrame';
import ValidatorJS from './ValidatorJS';

riot.tag('form-mixin-highlight', false, function() {
	// Apply form mixin for constants
	this.mixin('form');

	this.on('mount', function () {
		// Where pointer-events unsupported
		this.root.onclick = function () {
			this.hide();
			this.parent.input.focus();
		}.bind(this);
	});

	/**
	 * Show the highlight mask.
	 * @return {void}
	 */
	this.show = () => this.root.classList.remove(PH.cls.hide);

	/**
	 * Hide the highlight mask
	 * @return {void}
	 */
	this.hide = () => this.root.classList.add(PH.cls.hide);

	/**
	 * Do highlight
	 *
	 * @param {string|regexp} text     The text we want to highlight, or the regex itself.
	 * @param {boolean}       isRegexp Indicate, if the text variable is a regexp already.
	 * @return {void}
	 */
	this.highlight = function(text, isRegexp) {
		// Set regexp
		var regexp = isRegexp ? text : '/' + text + '/i';
		regexp = ValidatorJS.prototype.convertRegexp(regexp);
		regexp = new RegExp(regexp.pattern, regexp.modifier + 'g');

		// Run regexp on input value and apply template
		var value = this.parent.getValue();
		this.root.innerHTML = value.replace(regexp, (t) => `<span>${t}</span>`);

		// Apply input's CSS styles
		$(this.root).css($(this.parent.input).getStyle());

		// Let's rock
		this.show();
	};

	// Bind events
	this.parent.on(this.CONST.RIOT_ELEMENT_HIGHLIGHT_TEXT, this.highlight.bind(this));
	this.parent.on('focus', this.hide.bind(this));
});
