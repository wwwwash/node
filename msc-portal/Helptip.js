import Ext from '../../lib/vendor/ExtCore';
import Chaos from '../../lib/chaos/Chaos';
import ChaosObject from '../../lib/chaos/Object';

/**
 *
 * Helptip
 * - Singleton - instantiate via getInstance method
 *
 * Class for handling helptip elements to be positioned right.
 * Heltip types : 1, Open on click
 *                2, Open on hover
 *                3, Triggered open ( triggerOpen() )
 *
 * @param {type} el description
 * @param {type} config description
 */

export default function Helptip(el, config) {
	Helptip.superclass.constructor.call(this, el, config);
}

Helptip.getInstance = function(el, config) {
	if (!(Helptip.prototype.instance instanceof Helptip)) {
		Helptip.prototype.instance = new Helptip(el, config);
	}

	return Helptip.prototype.instance;
};

Chaos.extend(Helptip, ChaosObject, {

	/** @var  string             active                Class for clickable icons */
	activeCls      : 'active',
	/** @var  string             arrowSel              Arrow in the helptip selector */
	arrowSel       : '.arrow',
	/** @var  string             helptipSel            Selector for helptip element */
	helptipSel     : '.icon',
	/** @var  number             helptipWidth          Width of the helptip element */
	helptipWidth   : 300,
	/** @var  string             infoTooltipSel        Class for infoTooltip */
	infoTooltipSel : '.infoTooltip',
	/** @var  string             leftCls               Class for helptip on the left */
	leftCls        : 'leftHelpTipContainer',
	/** @var  string             rightCls              Class for helptip on the right */
	rightCls       : 'helpTipContainer',
	/** @var  string             showCls               Class for showing tooltip containers */
	showCls        : 'show',

	/* PRIVATES */

	/** @var  object             _helptipEl            Helptip Ext element */
	_helptipEl : undefined,


	init : function (el, config) {
		this.setTooltipContainers = this.element.select(this.leftCls.dot() + ', '
									+ this.rightCls.dot() + ', ' + this.infoTooltipSel);
		Helptip.superclass.init.call(this, el, config);
	},

	/**
	 * Controlling the event on mouseover
	 *
	 * @param ev    event object
	 * @param t     target element
	 */
	onMouseEnter : function (ev, t) {
		var newEl = Ext.get(t).child('span');
		if (!newEl) {
			return;
		}
		this._helptipEl = newEl;
		if (this._helptipEl && (this._helptipEl.hasClass(this.leftCls)
			|| this._helptipEl.hasClass(this.rightCls)) && !this._helptipEl.isVisible()) {
			this._helptipEl.dom.setAttribute('class', this._getPositionClass());
		}
	},

	/**
	 * Triggers a tooltip open programatically.
	 *
	 * @param {Ext.Element} targetTooltipEl Tooltip element to show
	 * @returns {Object} this To make the method chainable with other method
	 */
	triggerOpen : function(targetTooltipEl) {
		var wasOpen = targetTooltipEl.hasClass(this.showCls);
		// If it's already open, than return, close was enough
		if (wasOpen) {
			return false;
		}
		//Display
		targetTooltipEl.show();
		targetTooltipEl.addClass(this.showCls);
		// Pass tooltip to class variable
		this._helptipEl = targetTooltipEl;

		return this;
	},

	/**
	 * Attach position of the _helptipEl to the given element, by ID
	 *
	 * @param {string} target Target ID or Element
	 * @returns {Helptip}
	 */
	attachTo : function(target, fromBottom = false) {
		var targetEl = Ext.get(target),
			left = this._helptipEl.hasClass(this.leftCls),
			helpTipWidth = this._helptipEl.getWidth(),
			helpTipHeight = this._helptipEl.getHeight(),
			targetElHeight = targetEl.getHeight(),
			arrow = this._helptipEl.select(this.arrowSel).item(0),
			arrowTop = parseInt(arrow.getStyle('top'), 10),
			arrowHeight = arrow.getHeight(),
			attachPosTop,
			attachPostBtm;

		// TODO: Ezt azert meg atgondolom refakt-kor
		if (targetEl) {
			var attachPosLeft = left ? helpTipWidth * -1 : '100%';

			if (!fromBottom) {
				attachPosTop = 0;
				attachPostBtm = 'auto';
			}
			else {
				attachPosTop = 'auto';
				attachPostBtm = 0 + targetElHeight - helpTipHeight - targetElHeight / 2 + arrowTop + arrowHeight / 2;
			}

			this._helptipEl.setTop(attachPosTop).setLeft(attachPosLeft).setBottom(attachPostBtm);

			this._helptipEl.appendTo(targetEl);
		}
		return this;
	},

	/**
	 * Controlling the event on mouseover
	 *
	 * @param ev		event object
	 * @param target	target element
	 */
	onMouseClick : function (ev, target) {
		ev.preventDefault();
		ev.stopPropagation();
		var targetEl = Ext.get(target),
			targetTooltipEl = targetEl.child(this.leftCls.dot())
							|| targetEl.child(this.rightCls.dot())
							|| targetEl.child(this.infoTooltipSel),
			wasOpen = targetTooltipEl.hasClass(this.showCls);

		// Pass tooltip to class variable
		this._helptipEl = targetTooltipEl;

		// Hide open tooltips
		this.hideVisibilityTooltip();

		// If it's already open, than return, close was enough
		if (wasOpen) {
			return false;
		}
		targetTooltipEl.show();
		targetTooltipEl.addClass(this.showCls);
		Ext.getBody().on('click', this.hideVisibilityTooltip, this);
		targetTooltipEl.on('click', event => event.stopPropagation());
	},

	/**
	 * Hides the tooltip containers
	 *
	 * @return void
	 */
	hideVisibilityTooltip : function() {
		var self = this;

		this.setTooltipContainers.each(function () {
			if (this.hasClass(self.showCls)) {
				this.hide();
				this.removeClass(self.showCls);

				Ext.getBody().un('click', self.hideVisibilityTooltip, self);
				this.un('click', function(ev) { ev.stopPropagation() });
			}
		});
	},

	/**
	 * Get the correct position class for a Helptip
	 *
	 * @return String classname
	 */
	_getPositionClass : function () {
		var w = window,
			d = document,
			e = d.documentElement,
			g = d.body,
			windowWidth = w.innerWidth || e.clientWidth || g.clientWidth,
			elemPosX = this._helptipEl.findParent(this.helptipSel, null, true).getLeft(),
			useLeftPosition = windowWidth - this.helptipWidth < elemPosX;

		return useLeftPosition ? this.leftCls : this.rightCls;
	},

	bind : function () {
		Ext.getBody().on('mouseover', this.onMouseEnter, this, { delegate : this.helptipSel });
		Helptip.superclass.bind.call(this);
	},

	unbind : function () {
		Ext.getBody().un('mouseover', this.onMouseEnter, this, { delegate : this.helptipSel });
		Helptip.superclass.unbind.call(this);
	}
});
