import Chaos from '../../lib/chaos/Chaos';

import Copy2Clipboard from './Copy2Clipboard';

/**
 *
 * Copy2ClipboardMC
 *
 */


export default function Copy2ClipboardMC(el, config) {
	Copy2ClipboardMC.superclass.constructor.call(this, el, config);
}

Chaos.extend(Copy2ClipboardMC, Copy2Clipboard, {

	/** @var {Object} _linkEl                   Link element */
	_linkEl : undefined,

	/** @var {String} _hoverClass               The hover class*/
	_hoverClass : 'hoverState',

	/** @var {String} _activeClass              The active class*/
	_activeClass : 'activeState',

	/** @var {String} _successSel               Selector of the success element*/
	_successSel : '.success',

	/** @var {String} _successEl                Success element (now using the wrapper of the button)*/
	_successEl : undefined,

	/** @var {String} _successShowClass         Show class of the succes element*/
	_successShowClass : 'showSuccess',

	/** @var {String} _successTimeoutObj        Timeout to remove the show class*/
	_successTimeoutObj : undefined,

	/**
	 * Init
	 *
	 * @param {Element} el      This should be the body tag
	 * @param {Object} config   Config object of this component
	 */
	init : function(el, config) {
		this._linkEl = this.element.select('a').item(0);
		this._successEl = this.element;

		Copy2ClipboardMC.superclass.init.call(this, el, config);
	},

	/**
	 * On button mouseover
	 */
	onMouseover : function() {
		this._linkEl.addClass(this._hoverClass);
	},

	/**
	 * On button mouseout
	 */
	onMouseout : function() {
		this._linkEl.removeClass(this._hoverClass);
	},

	/**
	 * On button mousedown
	 */
	onMousedown : function() {
		this._linkEl.addClass(this._activeClass);
	},

	/**
	 * On button mouseup
	 */
	onMouseup : function() {
		this._linkEl.removeClass(this._activeClass);
	},

	/**
	 *
	 */
	onTextCopied : function() {
		var self = this;

		if (this._successTimeoutObj) {
			clearTimeout(this._successTimeoutObj);
		}

		this._successEl.addClass(this._successShowClass);

		this._successTimeoutObj = setTimeout(function() {
			self._successEl.removeClass(self._successShowClass);
		}, 2000);
	},

	/**
	 * Esemenykezelok feliratkozasa
	 */
	bind : function() {
		Copy2ClipboardMC.superclass.bind.call(this);

		this.element
			.on('mouseover', this.onMouseover, this)
			.on('mouseout', this.onMouseout, this)
			.on('mousedown', this.onMousedown, this)
			.on('mouseup', this.onMouseup, this);

		this.on(Copy2Clipboard.EVENT_TEXT_COPIED, this.onTextCopied, this);
	},

	/**
	 * Esemenykezelok torlese
	 */
	unbind : function() {
		Copy2ClipboardMC.superclass.unbind.call(this);

		this.element
			.un('mouseover', this.onMouseover, this)
			.un('mouseout', this.onMouseout, this)
			.un('mousedown', this.onMousedown, this)
			.un('mouseup', this.onMouseup, this);

		this.un(Copy2Clipboard.EVENT_TEXT_COPIED, this.onTextCopied, this);
	}
});