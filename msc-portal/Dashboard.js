import Ext from '../../../lib/vendor/ExtCore';
import Chaos from '../../../lib/chaos/Chaos';
import Config from '../../../lib/chaos/Config';
import Page from '../../../lib/chaos/Page';
import Connection from '../../../lib/chaos/Connection';

import Form from '../../_Form/Form';
import Notification from '../../Notification/Notification';
import StepOverlay from '../../Overlay/OverlayStep';

import DailyTipsWidgetController from '../../DailyTips/DailyTipsWidgetController';
import SelectedListWidgetController from '../../SelectedListWidget/SelectedListWidgetController';
import StatisticsWidgetController from '../../StatisticsWidget/StatisticsWidgetController';

import '../../Overlay/InstallGuide/InstallGuide.scss';
import './Dashboard.scss';
import './Widgets.scss';

const widgetControllers = {
	DailyTipsWidgetController,
	SelectedListWidgetController,
	StatisticsWidgetController
};

export default function Dashboard(el, config) {
	Dashboard.superclass.constructor.call(this, el, config);
}

Chaos.extend(Dashboard, Page, {

	/** @var {String} guideUrlHash  URL hash triggers guide opening */
	guideUrlHash : '#guide',

	/** @var {String} waitingCls    Waiting state of the MLL result element */
	waitingCls : 'waiting',

	/* UI elements */
	ui : {
		/** @var {String} goOnlineForm The goonline form */
		goOnlineForm    : 'goonlineForm',
		/** @var {String} guideLink    The Install Guide Link */
		guideLink       : 'guideLink',
		/** @var {String} mllReapplyBtn Reapply link in MLL box */
		mllReapplyBtn   : 'mllReapplyBtn',
		/** @var {String} mllResult  MLLbox result element (good-bad-average) */
		mllResult       : '.mllBox .result',
		/** @var {String} mllResult  MLLbox result element (good-bad-average) */
		mainContainer   : 'main_container',
		/** @var {String} widget main selector */
		widgetMain      : '.widget-main-item',
		/** @var {String} widget secondary selector */
		widgetSecondary : '.widget-secondary-item'
	},

	cmp : {
		form : {
			name  : Form,
			el    : 'ui.goOnlineForm',
			sleep : true
		},
		stepOverlay : {
			name : StepOverlay,
			el   : 'ui.mainContainer'
		}
	},

	/**
	 * Init
	 *
	 * @param {Element} el      This should be the body tag.
	 * @param {Object} config   Config object of this component
	 */
	init : function(el, config) {
		// Init futtatasa
		Dashboard.superclass.init.call(this, el, config);

		if (this.ui.goOnlineForm.exists()) {
			this.form.start();
		}

		// Open guide if the hash is #guide
		if (window.location.hash === this.guideUrlHash && this.ui.guideLink.exists()) {
			this.ui.guideLink.el().triggerClick();
		}

		// If the partner have birthday, we show a greeting notification
		if (Config.get('isPartnerBirthday')) {
			this.showBirthdayNotification();
		}

		this.initWidgetControllers();
	},

	initWidgetControllers : function() {
		var cb = function() {
			let controller = this.data('controller');

			if (controller in widgetControllers) {
				new widgetControllers[controller](Ext.get(this.dom), {});
			}
		};

		this.ui.widgetMain.els().each(cb);
		this.ui.widgetSecondary.els().each(cb);
	},

	/**
	 * Show a birthday notification for the partner (only once)
	 */
	showBirthdayNotification : function() {
		// Show birthday notification at the bottom of the page
		Notification.getInstance().showNotification({
			text            : Chaos.translate('Dear Partner, we would like to wish you a very Happy Birthday!'),
			icon            : 'birthday',
			direction       : 'bottom',
			autoHideEnabled : false,
			closingEnabled  : true
		});
		// After the notification is closed, we turn off further greetings
		Notification.getInstance().on(Notification.HIDE_NOTIFICATION, function() {
			var birthdayOffUrl = Chaos.getUrl('UserBirthdayNotification/TurnOffUserBirthdayAlert', {}, {});

			Connection.Ajax.request({
				type  : 'POST',
				url   : birthdayOffUrl,
				scope : this
			});
		}, this);
	},

	/**
	 * Sets Go-online form's window target
	 *
	 * @param formInstance
	 * @param target
	 */
	onFormRadioClick : function(formInstance, target) {
		var targetElId = Ext.get(target).id;

		switch (targetElId) {
			case 'newWindow':
				this.ui.goOnlineForm.dom().setAttribute('target', '_blank');
				break;
			default:
				this.ui.goOnlineForm.dom().setAttribute('target', '_self');
				break;
		}
	},

	/**
	 * Hashchange event handler. Opens Install Guide if the hash is #guide
	 */
	onHashChange : function() {
		if (window.location.hash === this.guideUrlHash && this.ui.guideLink.exists()) {
			this.ui.guideLink.el().triggerClick();
		}
	},

	/**
	 * Click on the Reapply btn.
	 *
	 * @param ev
	 * @param target
	 */
	onReapplyClick : function(ev, target) {
		ev.preventDefault();

		var getUrl = target.getAttribute('href');

		Connection.Ajax.request({
			url     : getUrl,
			type    : Chaos.Connection.TYPE_JSON,
			method  : 'GET',
			scope   : this,
			success : this.onReapplyClickSuccess
		});
	},

	/**
	 *
	 * @param response
	 */
	onReapplyClickSuccess : function(response) {
		var responseObj = response.json.data,
			result = responseObj.result,
			label = responseObj.label,
			waitingLabelTpl = {
				tag  : 'p',
				html : label
			};

		if (result) {
			this.ui.mllResult.el().addClass(this.waitingCls);
			this.ui.mllReapplyBtn.el().replaceWith(waitingLabelTpl);
		}
		else {
			this.ui.mllReapplyBtn.el().jq().protipShow({ title : label });
		}
	},

	/**
	 * Esemenykezelok feliratkozasa
	 */
	bind : function() {
		if (!this.form.sleeping) {
			this.form.on(Form.RADIO_CHANGE, this.onFormRadioClick, this);
		}

		if (this.ui.mllReapplyBtn.exists()) {
			this.ui.mllReapplyBtn.el().on('click', this.onReapplyClick, this);
		}

		Ext.fly(window).on('hashchange', this.onHashChange, this);

		Dashboard.superclass.bind.call(this);
	},

	/**
	 * Esemenykezelok torlese
	 */
	unbind : function() {
		this.autoUnbind();
	}
});
