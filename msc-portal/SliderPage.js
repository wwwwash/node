import Ext from '../../../lib/vendor/ExtCore';
import Chaos from '../../../lib/chaos/Chaos';
import Page from '../../../lib/chaos/Page';
import { Broadcaster } from '../../../lib/chaos/Broadcaster';
import Connection from '../../../lib/chaos/Connection';

import CONST from '../../../lib/constant/Constants';

import RangeSlider from '../../RangeSlider/RangeSlider';
import ShowMoreInfo from '../../ShowMore/ShowMore';

/**
 * SliderPage
 *
 * A RangeSlidert hasznalo ket oldalt kiszolgalo Page.
 * Transactions es Overview ebbol szarmazik.
 */

export default function SliderPage(el, config) {
	SliderPage.superclass.constructor.call(this, el, config);
}

Chaos.extend(SliderPage, Page, {

	/** @var {String}                Id of the period slider element */
	periodSliderId : 'periodSlider',

	/** @var {String}                Id of the period slider container element */
	periodContainerId : 'periodSelectorContainer',

	/** @var {Object}                Period Slider Element */
	_periodSliderEl : undefined,

	/** @var {String}                The period slider container element */
	_periodContainerEl : undefined,

	/**
	 * Init
	 *
	 * @param {Element} el      This should be the body tag.
	 * @param {Object} config   Config object of this component
	 */
	init : function(el, config) {
		Chaos.addEvents(RangeSlider.ON_SAVE);

		this._periodSliderEl = Ext.get(this.periodSliderId);
		this._periodContainerEl = Ext.get(this.periodContainerId);

		//komponensek rakotese
		this.addComponents();

		// Init futtatasa
		SliderPage.superclass.init.call(this, el, config);
	},

	/*
	 * Az oldal mukodosehez szukseges komponensek peldanyositasa
	 */
	addComponents : function() {
		if (this._periodSliderEl) {
			this._rangeSlider = new RangeSlider(this._periodSliderEl, {
				isPageRefreshEnabled     : true,
				enableIntegratedSave     : false,
				sliderTrackWidth         : 600,
				periodMinWidth           : 30,
				saveUrl                  : this._periodContainerEl.dom.getAttribute('data-url'),
				integratedSaveCallbackFn : this.periodChangeSuccessHandler.bind(this)
			});
		}

		//Stat info ajaxos komponenst
		var container = Ext.get('statisticContent');
		var list = container ? container.select('.tableSummarizeContentCell') : null;

		if (list && list.getCount() > 0) {
			//A show more lenyito peldanyositasa
			this.displayEl = new ShowMoreInfo(container, {
				list                : list,
				listItemClass       : '.tableSummarizeContentCell',
				requestMethod       : CONST.POST,
				responseType        : CONST.TYPE_JSON,
				iconClassName       : 'icon-angle-down',
				iconToggleClassName : 'icon-angle-up'
			});
		}
	},

	/*
	 * A select valtoztatasakor lefuto esemeny. Megvizsgalja, hogy tortent e modositas.
	 *
	 * @param ev
	 */
	onPeriodChange : function() {
		this.sendPeriod();
	},

	/*
	* Elkuldi a periodus adatait
	*/
	sendPeriod : function () {
		var year = document.querySelector('input[name=periodYear]').value,
			period = document.querySelector('input[name=period]').value,
			fullPeriod = year + '-' + period,
			newUrl = document.querySelector('#periodSelectorContainer').getAttribute('data-url').split('?');

		Connection.Ajax.request({
			type    	: CONST.TYPE_JSON,
			url    		: newUrl[0] + '?period=' + fullPeriod,
			scope   	: this,
			success 	: this.periodChangeSuccessHandler,
			error   	: this.periodChangeErrorHandler,
			failure 	: this.periodChangeFailureHandler,
			method  	: CONST.GET,
			synchron : true
		});
	},
	/*
	 * Sikeres ajax valasz kezeleset vegzo komponens
	 *
	 * @param response
	 */
	periodChangeSuccessHandler : function(response) {
		var responseText = Ext.util.JSON.decode(response.responseText).data;

		this._template = new Ext.Template(responseText.overlay);
		this._template.overwrite(Ext.get('pageContainer'));

		//Csak lokalis hivasok eseten
		if (this.id === 'statistics_overview' || this.id === 'statistics_transactions') {
			this.reStartComponents.call(this);
		}
	},

	/**
	 *
	 * @param response
	 */
	periodChangeErrorHandler : function(response) {
		/* develblock:start */
		console.log('popupHandlerErrorHandler', response);
		/* develblock:end */
	},

	/**
	 *
	 * @param response
	 */
	periodChangeFailureHandler : function(response) {
		/* develblock:start */
		console.log('popupHandlerFailureHandler', response);
		/* develblock:end */
	},

	/**
	 * Az esemenykezelok levetelet es ujrakoteset vegzo funkcio
	 */
	reStartComponents : function() {
		this.addComponents();
	},


	/**
	 * Esemenykezelok feliratkozasa
	 */
	bind : function() {
		delete Broadcaster.events['statistics-period-change'];
		Broadcaster.on('statistics-period-change', this.onPeriodChange.bind(this));

		SliderPage.superclass.bind.call(this);
	},

	/**
	 * Esemenykezelok torlese
	 */
	unbind : function() {
		Broadcaster.un('statistics-period-change', this.onPeriodChange.bind(this));

		SliderPage.superclass.unbind.call(this);
	}
});
