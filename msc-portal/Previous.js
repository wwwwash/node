import Ext from '../../../lib/vendor/ExtCore';
import Chaos from '../../../lib/chaos/Chaos';
import Page from '../../../lib/chaos/Page';

import ShowMore from '../../ShowMore/ShowMore';

import './Shared';

export default function ContestPrevious(el, config) {
	ContestPrevious.superclass.constructor.call(this, el, config);
}

Chaos.extend(ContestPrevious, Page, {

	/** @var {String}               Selector of elements with marquee behaviour */
	marqueeCls           : 'marquee',
	/** @var {String}               Marquee inited status class */
	marqueeInitedCls     : 'marqueeInited',
	/** @var {Number}               Marquee animation run interval */
	marqueeIntervalSpeed : 50,

	/* UI elements */
	ui : {
		pageContainer : 'pageContainer'
	},

	/* Components */
	cmp : {
		showMore : {
			name : ShowMore,
			el   : 'ui.pageContainer',
			opts : { listBlockSel : '.contentWrapper' }

		}
	},

	/**
	 * Init
	 *
	 * @param {Element} el      This should be the body tag.
	 * @param {Object} config   Config object of this component
	 */
	init : function(el, config) {
		this._marqueeEls = this.element.select(this.marqueeCls.dot());

		// Boot marquee Handler on marquee elements
		this._marqueeEls.elements.forEach(function(element) {
			this.marqueeHandler(element);
		}.bind(this));

		// Call parent class init
		ContestPrevious.superclass.init.call(this, el, config);
	},

	/**
	 * Handles the appropriate textIndent on marquee elements
	 *
	 * @param {HTMLElement} el Target of the event
	 */
	marqueeHandler : function(el) {
		var element = el instanceof HTMLElement ? el : el.target,
			ExtElement = Ext.get(element),
			storedScrollWidth = element.getAttribute('data-scroll-width'),
			scrollWidth = storedScrollWidth || element.scrollWidth,
			containerWidth = element.offsetWidth,
			slideAmount = scrollWidth;

		// If text not wider than its container
		if (scrollWidth <= containerWidth) {
			ExtElement.removeClass(this.marqueeCls);
			return;
		}
		// We need to store the scrollWidth on first run
		if (!storedScrollWidth) {
			element.setAttribute('data-scroll-width', scrollWidth);
		}

		// Duplicate text only once
		if (!ExtElement.hasClass(this.marqueeInitedCls)) {
			var text = element.innerHTML;
			ExtElement.addClass(this.marqueeInitedCls);
			element.innerHTML = element.innerHTML + ' ' + text;
		}

		this.animIndentTo(element, 0 - slideAmount);
	},

	/**
	 * Animates indent with interval. All marquee's speed are the same.
	 * @param {Object} el HTMLElement to animate
	 * @param {Number} to Px to animate
	 */
	animIndentTo : function(el, to) {
		var interval = setInterval(function() {
			var indentValue = parseInt(getComputedStyle(el)['text-indent'], 10);

			if (indentValue > to) {
				el.style.textIndent = indentValue - 1 + 'px';
			}
			// Goal reached, nulling the text indent, and restart marquee
			else {
				clearInterval(interval);
				el.style.textIndent = 0;
				this.marqueeHandler(el);
			}
		}.bind(this), this.marqueeIntervalSpeed);
	},

	/**
	 * Bind events
	 */
	bind : function() {
		ContestPrevious.superclass.bind.call(this);
	},

	/**
	 * Unbind events
	 */
	unbind : function() {
		this.autoUnbind();
	}
});
