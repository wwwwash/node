import Ext from '../../lib/vendor/ExtCore';
import Chaos from '../../lib/chaos/Chaos';
import ChaosObject from '../../lib/chaos/Object';
import Countdown from '../CountDown/CountDown';

/**
 * Dashboard Statistics Widget Controller.
 * Handles the JS business logic for the Selected List Widget
 */

export default function SelectedListWidgetController(el, config) {
	SelectedListWidgetController.superclass.constructor.call(this, el, config);
}

Chaos.extend(SelectedListWidgetController, ChaosObject, {

	countdownInstance : undefined,

	/**
	 * Initializer
	 */
	init : function() {
		this.element.select('.countdown').elements.forEach(function(element) {
			var el = Ext.get(element);
			this.countdownInstance = new Countdown(el, {
				hideOnZero          : ['d', 'h', 'm'],
				blockSeparatorStart : '(',
				blockSeparatorEnd   : ')',
				template            : Chaos.translate('dateFormat')
			});

			this.countdownInstance.on(Countdown.EVENT_END, function(ev) {
				ev.scope.element.addClass('hide');
				ev.scope.element.next('.deadline').addClass('show');
			});
		});

		this.initBigtarget();
	},

	initBigtarget : function() {
		this.element.select('li').on('click', function(ev) {
			var target = Ext.get(ev.target);
			target = target.dom.tagName.toUpperCase() === 'li' ? target : target.findParent('li', 5, true);
			target.select('a').item(0).dom.click();
		});
	}
});