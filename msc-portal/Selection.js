import Chaos from '../../../lib/chaos/Chaos';
import Page from '../../../lib/chaos/Page';

import Countdown from '../../CountDown/CountDown';
import DailyTipsWidgetController from '../../DailyTips/DailyTipsWidgetController';
import SelectedListWidgetController from '../../SelectedListWidget/SelectedListWidgetController';
import StatisticsWidgetController from '../../StatisticsWidget/StatisticsWidgetController';

import '../Dashboard/Widgets.scss';
import './Selection.scss';

const widgetControllers = {
	DailyTipsWidgetController,
	SelectedListWidgetController,
	StatisticsWidgetController
};

export default function SelectionIndex(el, config) {
	SelectionIndex.superclass.constructor.call(this, el, config);
}

Chaos.extend(SelectionIndex, Page, {

	/* UI elements */
	ui : {
		/** @var {String}     widget main selector */
		widgetMain      : '.widget-main-item',
		/** @var {String}     big counter selector */
		bigCountdownSel : '.bigCountdown'
	},

	countdownInstance : undefined,
	/**
	 * Init
	 *
	 * @param {Element} el      This should be the body tag.
	 * @param {Object} config   Config object of this component
	 */
	init              : function(el, config) {
		this._bigcountDown = this.element.select(this.ui.bigCountdownSel).item(0);

		if (this._bigcountDown) {
			this.countdownInstance = new Countdown(this._bigcountDown, {
				hideOnZero          : [],
				twoDigits           : true,
				blockSeparatorStart : '(',
				blockSeparatorEnd   : ')',
				template            : '' +
				'(<div class="first day">' +
				'<span>{d}</span><p>DAY</p>' +
				'</div>)' +
				'(<div class="hour">' +
				'<span>{h}</span><p>HOUR</p>' +
				'</div>)' +
				'(<div class="min">' +
				'<span>{m}</span><p>MIN</p>' +
				'</div>)' +
				'(<div class="sec">' +
				'<span>{s}</span><p>SEC</p>' +
				'</div>)'
			});
		}

		SelectionIndex.superclass.init.call(this, el, config);

		this.initWidgetControllers();
	},

	initWidgetControllers : function() {
		var cb = function() {
			let controller = this.data('controller');

			if (controller in widgetControllers) {
				new widgetControllers[controller](this.dom, {});
			}
		};

		this.ui.widgetMain.els().each(cb);
	},

	onSecond : function(ev) {
		if (ev.data.timestamp === 0) {
			this.countdownInstance.template = this.countdownInstance.template.replace('"sec"', '"sec done"');
		}
		if (ev.data.timestamp < 60) {
			this.countdownInstance.template = this.countdownInstance.template.replace('"min"', '"min done"');
		}
		if (ev.data.currentTimes.h === 0 && ev.data.currentTimes.d === 0) {
			this.countdownInstance.template = this.countdownInstance.template.replace('"hour"', '"hour done"');
		}
		if (ev.data.currentTimes.d === 0) {
			this.countdownInstance.template = this.countdownInstance.template.replace('day"', 'day done"');
		}
	},

	/**
	 * Esemenykezelok feliratkozasa
	 */
	bind : function() {
		SelectionIndex.superclass.bind.call(this);
		if (this.countdownInstance) {
			this.countdownInstance.on(Countdown.EVENT_SECOND, this.onSecond, this);
		}
	},

	/**
	 * Esemenykezelok torlese
	 */
	unbind : function() {
		this.autoUnbind();
	}
});
