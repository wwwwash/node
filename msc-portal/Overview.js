import Ext from '../../../lib/vendor/ExtCore';
import Chaos from '../../../lib/chaos/Chaos';
import ChaosConnection from '../../../lib/chaos/Connection';
import Page from '../../../lib/chaos/Page';

/**
 * Controller for the awards performer page
 * */
AwardsOverview = function(el, config) {
	AwardsOverview.superclass.constructor.call(this, el, config);
};

Chaos.extend(AwardsOverview, Page, {

	/** @var {String}               Selector of the period switcher */
	periodSwitcherSel : 'a.periodSwitcher',

	/** @var {String}               Active class for period switcher */
	periodSwitcherActiveClass : 'active',

	/** @var {String}               Interval data selector */
	periodDataSel : 'data-interval',

	/** @var {String}               Offset data selector */
	offsetDataSel : 'data-offset',

	/** @var {String}               Ajax url route */
	ajaxPeriodRoute : 'Awards/PeriodChange',

	/** @var {String}               The selected period */
	periodSelected : undefined,

	/** @var {String}               The offset selected */
	offsetSelected : undefined,

	/** @var {String}               Disabled menu selector */
	disabledMenuSel : '#awardsMenu .disabled',

	/** @var {String}               Awards content wrapper ID */
	awardsContentId : 'awardsContent',

	/** @var {Object}               Awards Content Ext Element */
	awardsContentEl : undefined,

	/**
	 * Init
	 *
	 * @param {Element} el      This should be the body tag.
	 * @param {Object} config   Config object of this component
	 */
	init : function(el, config) {
		this.awardsContentEl = Ext.get(this.awardsContentId);

		// Init futtatasa
		AwardsOverview.superclass.init.call(this, el, config);
	},

	/**
	 * Get content asked by the period selector via AJAX
	 */
	getAwardsContent : function() {
		var url = Chaos.getUrl(this.ajaxPeriodRoute, {}, {
			interval : this.periodSelected,
			offset   : this.offsetSelected
		});

		ChaosConnection.Ajax.request({
			type    	: 'json',
			url    		: url,
			scope   	: this,
			success 	: this.onPeriodRequestSuccess,
			error   	: function() {},
			failure 	: function() {},
			synchron	: true,
			method  	: 'GET'
		});
	},

	/**
	 * After Ajax is successfully done
	 *
	 * @param {Object} data     Response data from the AJAX request
	 */
	onPeriodRequestSuccess : function(data) {
		this.awardsContentEl.dom.innerHTML = data.json.data.output;
	},

	/**
	 * On clicking the period switcher
	 *
	 * @param {Object} ev       Ext event object
	 * @param {Object} el       Event DOM element
	 */
	onPeriodSwitcherClick : function(ev, el) {
		ev.preventDefault();
		this.periodSelected = el.getAttribute(this.periodDataSel);
		this.offsetSelected = el.getAttribute(this.offsetDataSel);
		this.getAwardsContent();
		return false;
	},

	/**
	 * Esemenykezelok feliratkozasa
	 */
	bind : function() {
		this.awardsContentEl.on('click', this.onPeriodSwitcherClick, this, {
			delegate : this.periodSwitcherSel
		});

		Ext.select(this.disabledMenuSel).on('click', function(ev) {
			ev.preventDefault();
		});

		AwardsOverview.superclass.bind.call(this);
	},

	/**
	 * Esemenykezelok torlese
	 */
	unbind : function() {
		this.awardsContentEl.un('click', this.onPeriodSwitcherClick, this, {
			delegate : this.periodSwitcherSel
		});

		Ext.select(this.disabledMenuSel).un('click', function(ev) {
			ev.preventDefault();
		});

		AwardsOverview.superclass.unbind.call(this);
	}
});
