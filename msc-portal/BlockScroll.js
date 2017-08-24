import TweenMax from 'gsap';

var defaults = {
	els          : 'section',
	disableOnMac : false
};

/* Inner utilites */
var Util = {
    /**
     * Get current window scrollTop value
     * @returns {Number|number}
     */
	scrollTop : function() {
		return window.pageYOffset || document.documentElement.scrollTop;
	},

	getNearestNumber : function(a, n) {
		let l;
		if ((l = a.length) < 2) {
			return l - 1;
		}
		for (l, p = Math.abs(a[--l] - n); l--;) {
			if (p < (p = Math.abs(a[l] - n))) {
				break;
			}
		}
		return l + 1;
	},

    /**
     * Returns the wheel delta
     * @author http://phrogz.net/js/wheeldelta.html
     * @param evt
     * @returns {number}
     */
	wheelDelta : function(evt) {
		if (!evt) {evt = event}
		var w = evt.wheelDelta, d = evt.detail;
		if (d) {
			if (w) {return w / d / 40 * d > 0 ? 1 : -1} // Opera
			return -d / 3;              // Firefox;
		} return w / 120;               // IE/Safari/Chrome
	},

    /**
     * Returns if we use mac or not
     * @returns {Bool}
     */
	isMac : function() {
		return navigator.userAgent.indexOf('Mac OS X') !== -1;
	}
};

/**
 * Constructor of the class.
 * @param options
 * @constructor
 */
export default function BlockScroll(options) {
	this.options = Object.assign({}, defaults, options);
	this.elements = document.querySelectorAll(this.options.els);
	this._lastWheelDirection = false;
	this._lastWheelEventTime = 0;
	this.callbacks = {
		blockChange : []
	};
	this.enable();
	this.collectBreakpoints();
	this.autoScroll();
	this.addEvents();
	return this;
}

/**
 * Collect breakpoints of the cover elements
 * @private
 * @return void
 */
BlockScroll.prototype.collectBreakpoints = function() {
	this.breakpoints = [];
	this.breakpointElements = [];
	[].forEach.call(this.elements, function(el) {
		this.breakpoints.push(el.offsetTop);
		this.breakpointElements.push(el);
	}.bind(this));
};

/**
 * Automatically scrolls to the closest breakpoint
 * @private
 * @return void
 */
BlockScroll.prototype.autoScroll = function() {
	if (!this.isEnabled()) {
		return;
	}

	var top = Util.scrollTop(),
		closestBlockIndex = Util.getNearestNumber(this.breakpoints, top);

	this.scrollTo(closestBlockIndex);
};

/**
 * Scroll the window to a position, animated
 * @param {Number} scrollTo The Y point to scroll
 * @private
 * @return void
 */
BlockScroll.prototype.scrollTo = function(index) {
	// Last element's index in breakpointElements array
	var last = this.breakpointElements.length - 1;

	if (index > last) {
		index = last;
	}

	if (index >= 0) {
		var section = this.breakpointElements[index],
			btnEl = document.querySelector('button[data-target="#' + section.id + '"]');

		if (btnEl) {
			btnEl.click();
		}
	}
};

/**
 * On Window MouseWheel event
 * @param {Object} e Event Object
 * @return {*}
 * @private
 */
BlockScroll.prototype.onMouseWheel = function(e) {
	if (!this.isEnabled()) {
		return;
	}

	var top = Util.scrollTop(),
		closestBreakpointIndex = Util.getNearestNumber(this.breakpoints, top),
		now = new Date().getTime(),
		wheelDelta = Util.wheelDelta(e),
		wheelDirectionIsUp = wheelDelta > 0,
		sameWheelDirection = wheelDirectionIsUp === this._lastWheelDirection,
		timeSinceLastScroll = now - this._lastWheelEventTime;

	this._lastWheelEventTime = now;
	this._lastWheelDirection = wheelDirectionIsUp;

	// Avoid functionality if the window is scrolling by the TweenMax
	if (TweenMax.isTweening(window)) {
		e.preventDefault();
		return;
	}

	// If he scrolls down in the last section, do nothing, use the default scroll
	if (!wheelDirectionIsUp &&
		closestBreakpointIndex + 1 === this.breakpoints.length &&
		top >= this.breakpoints[this.breakpoints.length - 1]
	) {
		//return;
	}

	// MacOS Inertial Scroll optimization
	if (timeSinceLastScroll < 200 && sameWheelDirection) {
		e.preventDefault();
		return;
	}

	var scrollToBreakpointIndex = wheelDelta < 0 ? closestBreakpointIndex + 1 : closestBreakpointIndex - 1;

	this.scrollTo(scrollToBreakpointIndex);
};

/**
 * On Window Key Down Function
 * @param {Object} e Event Object
 * @return {*}
 * @private
 */
BlockScroll.prototype.keyDown = function(e) {
	if (!this.isEnabled()) {
		return;
	}

	// 38 up, 40 down
	var isTriggerKey = [38, 40].includes(e.keyCode);

	// If the pressed key is not up/down/etc. trigger key, it is unnecessary to run.
	if (!isTriggerKey) {
		return;
	}

	// Avoid functionality if the window is scrolling by the TweenMax
	if (TweenMax.isTweening(window)) {
		e.preventDefault();
		return;
	}

	var top = Util.scrollTop(),
		closestBreakpointIndex = Util.getNearestNumber(this.breakpoints, top),
		scrollToBreakpointIndex;

	// Up keys
	if (e.keyCode === 38) {
		scrollToBreakpointIndex = closestBreakpointIndex - 1;
	}
	// Down keys
	else if (e.keyCode === 40) {
		scrollToBreakpointIndex = closestBreakpointIndex + 1;
	}

	// If we scroll a little bit up from the last section, we experience that the blockscroll
	// is not working because the active block is still the last one, this condition fixes this.
	var lastIndex = this.breakpoints.length - 1;
	if (scrollToBreakpointIndex > lastIndex && top < this.breakpoints[lastIndex]) {
		scrollToBreakpointIndex = lastIndex;
	}

	if (scrollToBreakpointIndex >= 0 && scrollToBreakpointIndex <= lastIndex) {
		e.preventDefault();
		this.scrollTo(scrollToBreakpointIndex);
	}
};

/**
 * Window Scroll event. Handles block index changes and fires an event.
 * @private
 * @return void
 */
BlockScroll.prototype.onWindowScroll = function() {
	var top = Util.scrollTop(),
		closestBreakpointIndex = Util.getNearestNumber(this.breakpoints, top);

	if (this._lastBlockIndex !== closestBreakpointIndex) {
		this.fire('blockChange', { block : closestBreakpointIndex });
	}

	// Store it, we are able to check if it changed
	this._lastBlockIndex = closestBreakpointIndex;
};

/**
 * Disables block scrolling
 * @public
 * @return void
 */
BlockScroll.prototype.disable = function() {
	this._enabled = false;
};

/**
 * Enables block scrolling
 * @public
 * @return void
 */
BlockScroll.prototype.enable = function() {
	this._enabled = true;
};

/**
 * Is component enabled ?
 * @public
 * @returns {boolean} Is enabled or not
 */
BlockScroll.prototype.isEnabled = function() {
	if (this.options.disableOnMac && Util.isMac()) {
		return false;
	}

	return this._enabled;
};

/**
 * Fires a scroll event handler
 * @public
 * @return void
 */
BlockScroll.prototype.fireScroll = function() {
	this.onWindowScroll();
};

/**
 * On window resize handler
 * @private
 * @return void
 */
BlockScroll.prototype.onWindowResize = function() {
	clearTimeout(this._collectBreakPointTimeout);
	clearTimeout(this._autoScrollToBreakpointTimeout);

	this._collectBreakPointTimeout = setTimeout(this.collectBreakpoints.bind(this), 100);
	this._autoScrollToBreakpointTimeout = setTimeout(this.autoScroll.bind(this), 1000);
};

BlockScroll.prototype.addEvents = function() {
	document.addEventListener('DOMMouseScroll', this.onMouseWheel.bind(this), false);
	document.addEventListener('mousewheel', this.onMouseWheel.bind(this), false);
	document.addEventListener('keydown', this.keyDown.bind(this), false);

	window.addEventListener('resize', this.onWindowResize.bind(this), false);
	window.addEventListener('scroll', this.onWindowScroll.bind(this), false);
};

/**
 * Fires an event
 * @param {String} eventName Name of the event
 * @param {Object} eventParams Params for event
 */
BlockScroll.prototype.fire = function(eventName, eventParams = {}) {
	this.callbacks[eventName].forEach(function(fnc) {
		fnc.call(fnc, eventParams);
	});
};

/**
 * Saves an event handler
 * @param eventName
 * @param fnc
 */
BlockScroll.prototype.on = function(eventName, fnc) {
	this.callbacks[eventName].push(fnc);
};