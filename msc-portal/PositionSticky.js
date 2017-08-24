import Ext from '../../lib/vendor/ExtCore';
import Chaos from '../../lib/chaos/Chaos';
import ChaosObject from '../../lib/chaos/Object';
import Util from '../../lib/chaos/Util';

/**
 * PositionSticky
 * Sticks an element to the top, when it is scrolling out of the viewport.
 * Generates a placeholder to the place of the element to maintain the layout
 * (when the sticky bar pops out from the layout)
 */

export default function PositionSticky(el, config) {
	PositionSticky.superclass.constructor.call(this, el, config);
}

PositionSticky.EVENT_PREVENT_RESIZE = 'prevent-resize';

Chaos.extend(PositionSticky, ChaosObject, {

	/** @var {String} placeholderIdPrefix   ID prefix of the the generated placeholder element */
	placeholderIdPrefix : 'stickyElementPlaceholder-',

	/** @var {Number} _breakPoint           The Ypx value where the element pops out from the layout */
	_breakPoint : undefined,

	/** @var {Boolean} _sticked             Is element sticked or not ? */
	_sticked : false,

	/** @var {Object} _placeholderEl        The placeholder element which maintains the layout when the element pops out */
	_placeholderEl : undefined,

	/** @var {Object} _stickyWrapperEl       */
	_stickyWrapperEl : undefined,

	/**
	 * Init
	 *
	 * @param {Element} el      This should be the body tag.
	 * @param {Object} config   Config object of this component
	 */
	init : function(el, config) {
		this.element = Ext.get(this.element);
		this._breakPoint = this.element.getY();

		this.handleStickyState();

		PositionSticky.superclass.init.call(this, el, config);
		this.addEvents(PositionSticky.EVENT_PREVENT_RESIZE);
	},


	/**
	 * Check if we should stick, or unstick the element, and calls the stick-unstick function.
	 */
	handleStickyState : function () {
		var srollTop = Util.getScrollTop();

		// Make it stick !
		if (srollTop >= this._breakPoint && !this._sticked) {
			this._stick();
		}
		// Unstick it !
		else if (srollTop < this._breakPoint && this._sticked) {
			this._unstick();
		}
	},

	/**
	 * Window scroll event handler.
	 * @private
	 */
	_onWindowScroll : function () {
		this.handleStickyState();
	},

	/**
	 * Handles the window resize event, and sets the X position of the sticked element.
	 * @private
	 */
	_onWindowResize : function() {
		if (this._sticked && !this.isPrevented) {
			this.element.parent().setX(this._placeholderEl.getX());
			this._placeholderEl
					.setWidth(this.element.getWidth())
					.setHeight(this.element.getHeight());
			this._unstick();
			this._stick();
		}
	},

	/**
	 * Make the element stick to the top.
	 * @private
	 */
	_stick : function () {
		this._createPlaceholderElement();

		var elementWidth = this.element.getWidth();

		this._placeholderEl.setDisplayed(true);
		this.element
			.wrap({ cls : 'stickyElementWrapper' })
			.setWidth(elementWidth);

		this._sticked = true;
	},

	/**
	 * Unstick element, move back to its original place.
	 * @private
	 */
	_unstick : function() {
		this._placeholderEl.setDisplayed(false);
		this.element.unwrap();
		this._sticked = false;
	},

	/**
	 * Creates the placeholder element which maintains the layout when the element pops out from the layout.
	 * @private
	 */
	_createPlaceholderElement : function() {
		if (!this._placeholderEl) {
			var elementId = this.element.id,
				placeholderTpl = new Ext.Template('<div class="stickyElementPlaceholder" id="{placeholderIdPrefix}-{id}"></div>'); // eslint-disable-line

			this._placeholderEl = placeholderTpl.insertAfter(this.element, {
				placeholderIdPrefix : this.placeholderIdPrefix,
				id                  : elementId
			}, true);

			if (this._isFloat(this.element)) {
				this._placeholderEl.setStyle('float', this._isFloat(this.element));
			}

			this._placeholderEl.setDisplayed(false)
								.setWidth(this.element.getWidth())
								.setHeight(this.element.getHeight());
		}
	},

	/**
	 * Maybe a little bit legible function to check if an element is floating, and if yes, which side to float.
	 * @param el Element to check.
	 * @returns {*} false or the float direction
	 * @private
	 */
	_isFloat : function (el) {
		var floatStyle = Ext.get(el).getStyle('float');

		if (floatStyle === 'none') {
			return false;
		}
		return floatStyle;
	},

	/**
	 * Fire the EVENT_PREVENT_RESIZE event to disable the stick/unstick process
	 * for the next 500ms. Needed to handle Android's resize event when input is focused.
	 * @private
	 */
	_onPreventResize : function() {
		this.isPrevented = true;
		setTimeout(function() {
			this.isPrevented = false;
		}.bind(this), 500);
	},

	/**
	 * Bind event handlers
	 */
	bind : function() {
		PositionSticky.superclass.bind.call(this);

		Ext.fly(window).on('resize', this._onWindowResize, this);
		Ext.fly(window).on('scroll', this._onWindowScroll, this);
		this.on(PositionSticky.EVENT_PREVENT_RESIZE, this._onPreventResize, this);
	},

	/**
	 * Unbind event handlers
	 */
	unbind : function() {
		this.autoUnbind();
	}
});
