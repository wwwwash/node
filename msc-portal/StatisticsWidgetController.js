import Ext from '../../lib/vendor/ExtCore';
import Chaos from '../../lib/chaos/Chaos';
import ChaosObject from '../../lib/chaos/Object';

import CountUp from '../CountUp/CountUp';

/**
 * Dashboard Statistics Widget Controller.
 * Handles the JS business logic for the Statistics Widget
 */

export default function StatisticsWidgetController(el, config) {
	StatisticsWidgetController.superclass.constructor.call(this, el, config);
}

Chaos.extend(StatisticsWidgetController, ChaosObject, {

	/** @var {String} svgSel       Selector of the donut SVG */
	svgSel          : 'svg',
	/** @var {String} svgContainerSel Selector if the svg container - donut element */
	svgContainerSel : '.widget-statistics-donutContainer-donut',
	/** @var {String} timeLineSel  Time display lines after the donut chart - selector */
	timeLineSel     : '.time',

	/** @var {String} emptyCls     The SVG element get this class if the time counters are 0 */
	emptyCls : 'empty',

	/** @var {String} raisedCls    Animated state cls of the coloured lines before the time lines */
	raisedCls : 'raised',

	/** @var {String} startAnimCls Starts an animation on the given elements */
	startAnimCls : 'startAnim',

	/** @var {String} counterMarkerSel It indicates a CounterPlugin instantiation */
	counterMarkerSel : '.countUp',

	/**
	 * Initializer
	 */
	init : function(el) {
		var counterEls = el.select(this.counterMarkerSel),
			timeEls = el.select(this.timeLineSel),
			svgContainerEl = el.select(this.svgContainerSel).item(0),
			svgEl = el.select(this.svgSel).item(0),
			circleEls = svgEl.select('circle');

		// In modern browsers we start the keyframes animation with a simple class from 0 dasharray (svg style)
		if (!Ext.isIE && !Ext.isIE11) {
			svgContainerEl.addClass(this.startAnimCls);
		}
		// In IE we set the dasharray to its end value to avoid css animation
		else {
			circleEls.each(function() {
				this.dom.setAttribute('stroke-dasharray', this.data('dasharray') + ' 100');
			});
		}

		// If time counters are not 0 raise the timebars, otherwise they shall not appear
		if (!svgContainerEl.hasClass(this.emptyCls)) {
			timeEls.addClass(this.raisedCls);
		}

		counterEls.each(function(counterEl) {
			new CountUp(counterEl.id, { steps : 140, pad : true, dot : '<span class="comma">&nbsp;</span>' });
		});
	}
});