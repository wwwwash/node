import Ext from '../../lib/vendor/ExtCore';
import Chaos from '../../lib/chaos/Chaos';
import ChaosObject from '../../lib/chaos/Object';

export default function CSS3CarouselComponent (el, config) {
	CSS3CarouselComponent.superclass.constructor.call(this, el, config);
}

/**
 * AutoPlay component for the CSS3 carousel
 */
Chaos.extend(CSS3CarouselComponent, ChaosObject, {

	/**
	 * @var {Number} AutoPlay Task Delay (ms).
	 */
	autoPlayInterval : 10000,

	/**
	 * @var {Number} AutoPlay delayed after navigation (ms).
	 */
	waitAfterNavigation : 10000,

	/* -------- PRIVATE VARS -------- */

	/**
	 * @private
	 * @var {Boolean} True if the autoplay is started.
	 */
	_isPlaying : false,

	/**
	 * Standard init function
	 *
	 * @param {Object} el
	 * @param {Object} config
	 * @return void
	 */
	init : function (el, config) {
		this._radios = this.element.select('[name=slider]');
		this._delayedTask = new Ext.util.DelayedTask(this._autoCallback, this, [], true);
		this._transitionEvent = this._whichTransitionEvent();

		CSS3CarouselComponent.superclass.init.call(this, el, config);
	},

	/**
	 * Start the autoplay
	 * @returns {CSS3CarouselComponent}
	 */
	play : function() {
		this._isPlaying = true;
		this._delayedTask.delay(this.autoPlayInterval);
		return this;
	},

	/**
	 * Stop the autoplay
	 * @returns {CSS3CarouselComponent}
	 */
	stop : function () {
		this._isPlaying = false;
		this._delayedTask.cancel();
		return this;
	},

	/**
	 * Switch to a slide by index
	 * @param {Number} slideNum
	 * @returns {CSS3CarouselComponent}
	 */
	goToSlide : function(slideNum) {
		this._radios.item(slideNum).dom.checked = true;
		return this;
	},

	/**
	 * Switch to the next slide
	 * @returns {CSS3CarouselComponent}
	 */
	goToNextSlide : function() {
		this.goToSlide(this._getNextIndex());
		return this;
	},

	/**
	 * Determines which transitionend event is used by the browser
	 * @returns {String}
	 * @private
	 */
	_whichTransitionEvent : function() {
		var t,
			el = document.createElement('fakeelement'),
			transitions = {
				transition       : 'transitionend',
				OTransition      : 'oTransitionEnd',
				MozTransition    : 'transitionend',
				WebkitTransition : 'webkitTransitionEnd',
				msTransition     : 'msTransitionEnd'
			};

		for (t in transitions) {
			if (Chaos.isDefined(el.style[t])) {
				return transitions[t];
			}
		}

		return null;
	},

	/**
	 * Delayed task callback
	 * @returns {CSS3CarouselComponent}
	 * @private
	 */
	_autoCallback : function() {
		this.goToNextSlide();
		this._delayedTask.delay(this.autoPlayInterval);
		return this;
	},

	/**
	 * Get the current slide index
	 * @returns {Number}
	 * @private
	 */
	_getCurrentIndex : function () {
		var current = null;

		this._radios.each(function(el, els, index) {
			if (el.dom.checked) {
				current = index;
			}
		}, this);

		return current;
	},

	/**
	 * Get the next slide index
	 * @returns {Number}
	 * @private
	 */
	_getNextIndex : function () {
		var current = this._getCurrentIndex();
		if (current === this._radios.getCount() - 1) {
			return 0;
		}
		return current + 1;
	},

	/**
	 * Pausing the autoplay on a user interaction
	 * @returns {CSS3CarouselComponent}
	 * @private
	 */
	_pauseWhenInteraction : function() {
		this._delayedTask.cancel();
		return this;
	},

	/**
	 * Resuming the autoplay after a user interaction
	 * @returns {CSS3CarouselComponent}
	 * @private
	 */
	_resumeAfterInteraction : function() {
		if (this._isPlaying) {
			this._delayedTask.delay(this.waitAfterNavigation);
		}
		return this;
	},

	/**
	 * Event handler for slides mouseover event
	 * @private
	 */
	_onSlidesMouseOver : function() {
		this._pauseWhenInteraction();
	},

	/**
	 * Event handler for slides mouseout event
	 * @private
	 */
	_onSlidesMouseOut : function () {
		this._resumeAfterInteraction();
	},

	/**
	 * Binds the initial event handlers
	 */
	bind : function () {
		CSS3CarouselComponent.superclass.bind.call(this);

		this.element.on('mouseover', this._onSlidesMouseOver, this, {
			delegate : '.stopCarousel'
		});
		this.element.on('mouseout', this._onSlidesMouseOut, this, {
			delegate : '.stopCarousel'
		});
	},

	/**
	 * Unbinds all event handlers
	 */
	unbind : function () {
		this.autoUnbind();
	}
});
