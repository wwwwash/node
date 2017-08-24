import $ from 'jquery';
import Ext from '../../lib/vendor/ExtCore';
import Chaos from '../../lib/chaos/Chaos';
import Portal from './PortalLayout';
import Connection from '../../lib/chaos/Connection';
import Util from '../../lib/chaos/Util';
import Polling from '../../lib/chaos/Polling';
import GuidedTour from '../GuidedTour/GuidedTour';
import Config from '../../lib/chaos/Config';
import TouchList from '../TouchList/TouchList';
import SimpleDisplayElements from '../ShowHide/SimpleDisplayElements';
import Menu from '../Menu/Menu';

import '../_Hamburger/Hamburger';
import '../_AccountMenu/AccountMenu';

/**
 * Registration handles all the tasks needed to be done before a page start
 */
export default function Modelcenterbasic (el, config) {
	Modelcenterbasic.superclass.constructor.call(this, el, config);
}

Modelcenterbasic.EVENT_LOGGEDIN_MENU_OVER = 'loggedin-menu-over';
Modelcenterbasic.EVENT_LOGGEDIN_MENU_OUT = 'loggedin-menu-out';

Chaos.extend(Modelcenterbasic, Portal, {
	/** @var {String}                                        A profil valaszto scroll fokontenere */
	selectProfileMainId        : 'selectProfileMainContainer',
	/** @var {String}                                        A profil valaszto kontener */
	selectProfileContainerId   : 'selectProfileContainer',
	/** @var {String}                                        A profil valaszto kontener belso tartalma */
	selectProfileContentId     : 'selectProfileContent',
	/** @var {String}                                        Az elso bejelentkezes bubijanak kontenere */
	firstLoginContainerId      : 'firstLoginContainer',
	/** @var {String}                                        Az elso bejelentkezes bubijanak bezaro gombja */
	firstLoginContainerCloseId : 'firstLoginContainerClose',
	/** @var {String}                                        Ajax session keep alive route */
	sessionKeepAliveRoute      : 'Event/RefreshSession',
	/** @var {String}                                        Selector of the menu container */
	menuContainerSel           : '.js-site-menu',
	/** @var {String}                                        Id of the account search input */
	accountSearchInputId       : 'account_search',
	/** @var {String}                                        1240 class on body */
	class1240                  : 'width1240',
	/** @var {String}                                        Class on menu hover */
	menuHoverClass             : 'hover',
	/** @var {String}                                        Body class that triggering GuidedTour component instantiation */
	guidedTourBodyCls          : 'guidedtour',
	/** @var {String}                                        Logged in button id */
	loggedInButtonId           : 'loggedInButton',
	/** @var {String}                                        Account whiteloader li elements selector */
	accountLoaderSel           : '.account_loader',
	/** @var {Boolean}                                       Block account list request or not */
	_blockAccountListAppend    : false,
	/** @var {String}                                        Selector of the account search input elements clear button */
	searchInputClearButtonSel  : '.clearButton',
	/** @var {String}                                        Menu label data attribute */
	menuLabelAttr              : 'menu-label',
	/** @var {String}                                        Class name for menu item which have sub menus */
	hasSubMenuCls              : 'hasSubmenu',
	/** @var {String}                                        Selector of the menu items */
	menuItemSel                : '.js-menuItem',
	/** @var {String}                                        Class name for the common tabs */
	tabContainerCls            : 'tabContainer',
	/** @var {String}                                        Class name for the touch enabled common tabs */
	touchEnabledCls            : 'touchEnabled',

	/* PRIVATES */

	/** @var {Object}                               heltip Component */
	_helpTipCmp     : undefined,
	/** @var {Object}                               common tabs Component */
	_tabContainerEl : undefined,

	/**
	 * Init
	 *
	 * @param {Element} el      This should be the body tag.
	 * @param {Object} config   Config object of this component
	 */
	init : function (el, config) {
		Chaos.addEvents(
			Modelcenterbasic.EVENT_LOGGEDIN_MENU_OVER,
			Modelcenterbasic.EVENT_LOGGEDIN_MENU_OUT
		);

		// Logged In Button
		this._loggedInButtonEl = Ext.get(this.loggedInButtonId);
		this._tabContainerEl = Ext.select(this.tabContainerCls.dot()).item(0);

		// run GuidedTour component globally
		new GuidedTour(Ext.getBody(), {
			helptipCmp : Config.get('helpTipComponent')
		});

		// Init show/hide content elements
		new SimpleDisplayElements(document.body, {});

		// Init common tabs component
		if (this._tabContainerEl) {
			var activeEl = $('.tabContainer .active');
			var activeIndex = $('.tabContainer .tab').index(activeEl);

			new TouchList(this._tabContainerEl, {
				activeElIndex : activeIndex
			});
		}

		// Init polling
		var polling = Polling.getInstance();
		polling.init();
		// sessionKeepAlive
		polling.addPollEvent({
			identify        : 'sessionKeepAlive',
			intervalPeriods : 120,
			scope           : this,
			params          : { action : 'get' },
			callbackFn      : this.sessionKeepAlive
		});

		// Menu elements
		this._menuContainerEl = Ext.select(this.menuContainerSel).item(0);

		// Init animated dropdown menu
		if (this._menuContainerEl) {
			new Menu(this._menuContainerEl, {});
		}

		// Run size on first load
		this.onWindowResize();

		// Init futtatasa
		Modelcenterbasic.superclass.init.call(this, el, config);
	},

	/**
	 * Keeps the session alive. If the session is lost on server side, it trigger a logout.
	 *
	 * @param scope Scope Of the method.
	 * @param {Object} params Contains action: post|get for the the ajax action
	 */
	sessionKeepAlive : function (params) {
		if (typeof params === 'undefined' || !('action' in params)) {
			params = { action : 'get' };
		}
		var url = Chaos.getUrl(
			this.sessionKeepAliveRoute,
			{},
			{ sourceUrl : Util.getUrlWithoutHost() },
			''
		);

		Connection.Ajax.request({
			type    : 'json',
			url     : url,
			scope   : this,
			success : this.sessionKeepAliveSuccess,
			method  : params.action
		});
	},

	/**
	 * Session Keep Alive Ajax Success Method
	 */
	sessionKeepAliveSuccess : function (response) {
		if (response.json.errorCode) {
			window.location.href = Config.get('baseUrl');
		}
		else if (!response.json.data) {
			window.location.href = response.json.data;
		}
	},

	/**
	 * Run on window resize and first load
	 */
	onWindowResize : function () {
		var windowWidth = window.innerWidth
							|| document.documentElement.clientWidth
							|| document.getElementsByTagName('body')[0].clientWidth;

		if (windowWidth <= 1240) {
			Ext.getBody().addClass(this.class1240);
		}
		else {
			Ext.getBody().removeClass(this.class1240);
		}
	},

	/**
	 * Esemenykezelok feliratkozasa
	 */
	bind : function () {
		Ext.fly(window).on('resize', this.onWindowResize, this);

		Modelcenterbasic.superclass.bind.call(this);
	},

	/**
	 * Esemenykezelok torlese
	 */
	unbind : function () {
		this.autoUnbind();
	}
});
