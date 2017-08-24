/** @var defaults {Object} Default option values */
var defaults = {
	el       : '.parallax',
	speed    : 2,
	viewport : true
};

/**
 * Modifies translate3d value
 * @param elm   DOM element
 * @param value Value in px
 */
var translateY3d = function(elm, value) {
	var translate = 'translate(0px,' + value + 'px)';
	elm.style.transform = translate;
};

/**
 * Tells if an element is visible in the viewport
 * @param el DOM element
 * @returns {boolean}
 */
var isVisible = function(el) {
	var top = el.offsetTop;
	var left = el.offsetLeft;
	var width = el.offsetWidth;
	var height = el.offsetHeight;

	while (el.offsetParent) {
		el = el.offsetParent;
		top += el.offsetTop;
		left += el.offsetLeft;
	}

	return (
        top < window.pageYOffset + window.innerHeight &&
        left < window.pageXOffset + window.innerWidth &&
        top + height > window.pageYOffset &&
        left + width > window.pageXOffset
	);
};

/**
 * Tells an elements offset from the top
 * @param el DOM Element
 * @returns {{top: number, left: number}}
 */
var offset = function(el) {
	var _x = 0;
	var _y = 0;
	while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
		_x += el.offsetLeft;
		_y += el.offsetTop;
		el = el.offsetParent;
	}
	return { top : _y, left : _x };
};

/**
 * Constructor of the Parallax class
 * @param options
 * @constructor
 */
export default function Parallax(options) {
	this.options = Object.assign({}, defaults, options);
	this.lastScrollY = 0;
	this.element = typeof this.options.el === 'string'
		? $(this.options.el)
		: this.options.el;
	this.isTicking = false;
	this.translateY = 0;
	this.enabled = true;

	this.addEvents();
}

/**
 * Enable parallax component
 */
Parallax.prototype.enable = function() {
	this.enabled = true;
};

/**
 * Disable parallax component
 */
Parallax.prototype.disable = function() {
	this.enabled = false;
};

/**
 * Scroll callback
 */
Parallax.prototype.doScroll = function() {
	if (!this.enabled) {
		return;
	}
	this._isVisible = isVisible(this.element);
	this.doTick();
};

/**
 * Invokes requestAnimationFrame
 */
Parallax.prototype.doTick = function() {
	if (!this.isTicking) {
		window.requestAnimationFrame(this.tick.bind(this));
		this.isTicking = true;
	}
};

/**
 * requestAnimationFrame tick
 */
Parallax.prototype.tick = function() {
	this.lastScrollY = window.pageYOffset;
	if (!this.options.viewport || this._isVisible) {
		this.translateY = (
			this.options.viewport ?
			this.lastScrollY - offset(this.element).top + this.element.offsetHeight
				: this.lastScrollY
		) / this.options.speed;

		// We don't want parallax to happen if scrollpos is below 0
		if (this.translateY < 0) {
			this.translateY = 0;
		}

		// Do it
		translateY3d(this.element, this.translateY);
	}
	// Stop ticking
	this.isTicking = false;
};

/**
 * Attaches event handlers
 */
Parallax.prototype.addEvents = function() {
	window.addEventListener('scroll', this.doScroll.bind(this), false);
};