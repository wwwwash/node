import Ext from '../../../lib/vendor/ExtCore';
import Chaos from '../../../lib/chaos/Chaos';
import Page from '../../../lib/chaos/Page';
import { Broadcaster } from '../../../lib/chaos/Broadcaster';

import SocialAccountsController from '../../MyWebsite/SocialAccountsController';
import DailyTipsWidgetController from '../../DailyTips/DailyTipsWidgetController';
import SetPriceWidgetController from '../../MyWebsite/SetPriceWidgetController';
import GoogleAnalyticsWidgetController from '../../MyWebsite/GoogleAnalyticsWidgetController';

import '../Dashboard/Widgets.scss';
import './MyWebsiteDashboard.scss';

/**
 * Standalone My Website Page
 * ------------------------------
 *
 * @param Object el       the element
 * @param Object config   config object
 */
const widgetControllers = {
	//TODO: To switch back on the social media widget please uncomment this line [ansul.sharma]
	//SocialAccountsController,
	DailyTipsWidgetController,
	SetPriceWidgetController,
	GoogleAnalyticsWidgetController
};

export default function MyWebsiteDashboardIndex(el, config) {
	MyWebsiteDashboardIndex.superclass.constructor.call(this, el, config);
}

Chaos.extend(MyWebsiteDashboardIndex, Page, {

	/** @var {String} name                      Name of the class */
	name      : 'mywebsitedashboard',
	/** @var {String} openedCls                 Class name of the opened state */
	openedCls : 'opened',

	ui : {
		widgetMain : '.widget-main-item'
	},

	/**
	 * Standard init function
	 *
	 * @method init
	 * @param {Object} el
	 * @param {Object} config
	 *
	 * @return void
	 */
	init : function(el, config) {
		MyWebsiteDashboardIndex.superclass.init.call(this, el, config);

		Broadcaster.on('socialWidgetRefreshed', this.reinitSocialWidgetController, this);

		this.initWidgetControllers();
	},

	/**
	 * Initializes the social widget controller
	 *
	 * @return void
	 */
	reinitSocialWidgetController : function() {
		this.socialWidgetController = {};
		this.socialWidgetController = new SocialAccountsController(this.ui.socialAccountsWidget.el(true), {});
	},

	/**
	 * Initializes the widget controllers
	 *
	 * @return void
	 */
	initWidgetControllers : function() {
		var cb = function() {
			let controller = this.data('controller');

			if (controller in widgetControllers) {
				new widgetControllers[controller](Ext.get(this.dom), {});
			}
		};

		this.ui.widgetMain.els().each(cb);
	},

	/**
	 * Initial bind method.
	 *
	 * @method bind
	 *
	 * @return void
	 */
	bind : function() {
		MyWebsiteDashboardIndex.superclass.bind.call(this);
	},

	/**
	 * Initial unbind method.
	 *
	 * @method unbind
	 *
	 * @return void
	 */
	unbind : function() {
		this.autoUnbind();
	}
});
