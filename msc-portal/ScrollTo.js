import $ from 'jquery';
import { TweenMax, Power0 } from 'gsap';
import 'gsap/ScrollToPlugin';

const defaults = {
	linkCls  : 'js-scroll-to',
	duration : 0.4
};

/**
 * @param options Default option which we will overwrite
 * @returns {window.ScrollTo}
 * @constructor
 */
export default function ScrollTo(options) {
	this.options = Object.assign({}, defaults, options);
	this.links = $('.' + this.options.linkCls);
	this.isScrolling = false;
	this.callbacks = {
		start    : [],
		complete : []
	};


	this.clickedElement = undefined;
	this.targetElement = undefined;

	this.addEvents();
}

/**
 * Scrolls the window to the desired position.
 * Also fires start/stop events
 * @param ScrollTo ScrollY value
 */
ScrollTo.prototype.scrollTo = function(scrollTo) {
	this.isScrolling = true;
	this.fire('start');

	TweenMax.to(window, this.options.duration, {
		scrollTo   : { y : scrollTo, autoKill : false },
		overwrite  : 5,
		ease       : Power0.easeNone,
		onComplete : () => {
			this.isScrolling = false;
			this.fire('complete');
		}
	});
};

/**
 * Fires an event
 * @param eventName
 */
ScrollTo.prototype.fire = function(eventName) {
	this.callbacks[eventName].forEach(function(fnc) {
		fnc.call(fnc, {
			clickedElement : this.clickedElement,
			targetElement  : this.targetElement
		});
	}.bind(this));
};

/**
 * Saves an event handler
 * @param eventName
 * @param fnc
 */
ScrollTo.prototype.on = function(eventName, fnc) {
	this.callbacks[eventName].push(fnc);
};

/**
 * Links click event handler
 * @param {Object} e Click Event Object
 * @returns {boolean}
 */
ScrollTo.prototype.onClick = function(e) {
	if (this.isScrolling || TweenMax.isTweening(window)) {return false}
	var targetSel;
	this.clickedElement = e.target;
	if (!this.clickedElement.classList.contains(this.options.linkCls)) {
		this.clickedElement = this.clickedElement.parentNode;
	}
	targetSel = this.clickedElement.getAttribute('data-target');
	this.targetElement = $(targetSel)[0];
	this.scrollTo(this.targetElement.offsetTop);

	e.preventDefault();
	return false;
};

/**
 * Attaches events
 */
ScrollTo.prototype.addEvents = function() {
	[].forEach.call(this.links, function(link) {
		link.addEventListener('click', this.onClick.bind(this), true);
	}.bind(this));
};