import Ext from '../../lib/vendor/ExtCore';
import Chaos from '../../lib/chaos/Chaos';
import CONST from '../../lib/constant/Constants';
import Polling from '../../lib/chaos/Polling';
import Config from '../../lib/chaos/Config';
import Util from '../../lib/chaos/Util';
import Connection from '../../lib/chaos/Connection';

import Portal from './PortalLayout';
import ScrollPane from '../Scroll/ScrollPane';

import '../_AccountMenu/AccountMenu';
import '../Page/Authentication/Authentication.scss';

export default function Registration (el, config) {
	Registration.superclass.constructor.call(this, el, config);
}

Chaos.extend(Registration, Portal, {

     /** @var {String} name          Name of the class */
	name                       : 'registration',
    /** @var {String}           Ajax session keep alive route */
	sessionKeepAliveRoute      : 'Event/RefreshSession',
	/** @var {Number}                Page's innerheight on load */
	_startInnerHeight          : undefined,
	/** @var {Object}                interval that checks Allow Cam Bar */
	_allowCamAccessBarChecking : undefined,

	_currentInnerWidth  : 0,
	_currentInnerHeight : 0,

	_chromeBarHeight : 37,

	_windowTimeout : undefined,

	/** @var {String}                               Account whiteloader li elements selector */
	accountLoaderSel          : '.account_loader',
	/** @var {String} selectProfileMainId           A profil valaszto scroll fokontenere */
	selectProfileMainId       : 'selectProfileMainContainer',
	/** @var {String} selectProfileContainerId      A profil valaszto kontener */
	selectProfileContainerId  : 'selectProfileContainer',
	/** @var {String} selectProfileContentId        A profil valaszto kontener belso tartalma */
	selectProfileContentId    : 'selectProfileContent',
	/** @var {String}                               Id of the menu container */
	menuContainerId           : 'menuContainer',
	/** @var {String}                               Id of the account search input */
	accountSearchInputId      : 'account_search',
	/** @var {String}                               Logged in button id */
	loggedInButtonId          : 'loggedInButton',
	/** @var {Boolean}                              Block account list request block or not */
	_blockAccountListAppend   : false,
	/** @var {String}                               Selector of the account search input elements clear button */
	searchInputClearButtonSel : '.clearButton',

	/**
	 * Init
	 *
	 * @param {Element} el      This should be the body tag.
	 * @param {Object} config   config object of this component
	 */
	init : function(el, config) {
		var self = this;

		// Run arrow effect to chrome's allow camera bar
		if (Ext.getBody().id === 'signup_signupflow' && Ext.get('snapshoterBlock') && Ext.isChrome) {
			// Wait for render to end
			setTimeout(function() {
				self._startInnerHeight = window.innerHeight;
				// First run, first check
				self.onWindowResize();
			}, 1000);
		}

		if (window.location.href.indexOf('signup/') !== -1
				&& window.location.href.indexOf('signup/new-account') === -1) {
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
		}

		// Logged In Button
		this._loggedInButtonEl = Ext.get(this.loggedInButtonId);

		// Menu elements
		this._menuContainerEl = Ext.get(this.menuContainerId);
		this._acccountSearchEl = Ext.get(this.accountSearchInputId);
		this._selectProfileContentEl = Ext.get(this.selectProfileContentId);
		this._selectProfileMainEl = Ext.get(this.selectProfileMainId);
		if (this._acccountSearchEl) {
			this._searchInputClearButtonEl = this._acccountSearchEl.findParent('div', 2, true)
												.select(this.searchInputClearButtonSel).item(0);
		}

		if (this._selectProfileContentEl) {
			this._firstSelectProfileContentTpl = this._selectProfileContentEl.dom.innerHTML;
		}

		// Set Account list scrollbar
		this.setAccountListScrollBar();

		Registration.superclass.init.call(this, el, config);
	},

	/**
	 * Get's performer lists via ajax on showmore
	 *
	 * @method _accountListShowMore
	 * @private
	 *
	 * @return void;
	 */
	_accountListShowMore : function() {
		this._accountLoaderEls = this._selectProfileContentEl.select(this.accountLoaderSel);

		if (this._accountLoaderEls.elements.length !== 0) {
			this._getAccountShowMoreParams();
			this._accountListRequest(this._accountSearchParamObj);
		}
	},

	/**
	 * Set's the param object for account showmore
	 *
	 * @method _getAccountShowMoreParams
	 * @private
	 *
	 * @return Object;
	 */
	_getAccountShowMoreParams : function() {
		this._inputVal = this._acccountSearchEl.dom.value.trim();
		var _accountCnt = this._selectProfileContentEl.select('li[data-screen-name]').elements.length,
			_accountIndex = _accountCnt - 1,
			_lastAccountEl = this._selectProfileContentEl.select('li[data-screen-name]').item(_accountIndex),
			_lastAccountElVal = _lastAccountEl.dom.getAttribute('data-screen-name'),
			_lastAccountStatusId = _lastAccountEl.dom.getAttribute('data-status-id');

		this._accountSearchParamObj = {
			lastScreenName : _lastAccountElVal,
			lastStatusId   : _lastAccountStatusId
		};

		if (this._inputVal.length !== 0) {
			this._accountSearchParamObj.screenNameLike = this._inputVal;
		}

		return this._accountSearchParamObj;
	},

	/**
	 * Set's the param object for account search
	 *
	 * @method _getAccountSearchParams
	 * @private
	 *
	 * @return Object;
	 */
	_getAccountSearchParams : function() {
		this._inputVal = this._acccountSearchEl.dom.value.trim();

		this._accountSearchParamObj = {
			lastScreenName : '',
			lastStatusId   : 0
		};

		if (this._inputVal.length !== 0) {
			this._accountSearchParamObj.screenNameLike = this._inputVal;
		}

		return this._accountSearchParamObj;
	},

	/**
	 * Ajax request for account lists
	 *
	 * @method _accountListRequest
	 * @private
	 *
	 * @return void;
	 */
	_accountListRequest : function(paramObj, searchRequest) {
		Connection.Ajax({
			url     : Chaos.getUrl('AccountTooltip/ShowMoreProfile', {}, {}),
			type    : Connection.TYPE_JSON,
			success : searchRequest ? this._accountSearchAjaxSuccess : this._accountListShowMoreAjaxSuccess,
			params  : paramObj,
			error   : this._accountListShowMoreAjaxError,
			failure : this._accountListShowMoreAjaxError,
			scope   : this,
			method  : CONST.GET
		});
	},

	/**
	 * Account search ajax success handler
	 *
	 * @method _accountSearchAjaxSuccess
	 * @private
	 *
	 * @return void;
	 */
	_accountSearchAjaxSuccess : function(response) {
		var _data = response.json.data;

		if (this._blockAccountListAppend) {
			return;
		}
		if (this._scroll instanceof ScrollPane) {
			this._scroll.destroy();
		}
		if (this._selectProfileMainEl.select('.scroll-pane').item(0)) {
			this._selectProfileMainEl.select('.scroll-pane').item(0).remove();
		}
		this._selectProfileContentEl.dom.innerHTML = _data.block;
		this._scroll = {};
		this.setAccountListScrollBar();
	},

	/**
	 * Showmore ajax Success Handler
	 *
	 * @method _accountListShowMoreAjaxSuccess
	 * @param response     Ajax request response
	 * @private
	 *
	 * @return void;
	 */
	_accountListShowMoreAjaxSuccess : function(response) {
		var _data = response.json.data;
		if (_data && _data.block) {
			this._accountLoaderEls.remove();
			this._selectProfileContentEl.dom.innerHTML += _data.block;
			this.setAccountListScrollBar();
		}
	},

	/**
	 * Ajax Error Handler
	 *
	 * @method _accountListShowMoreAjaxError
	 * @param response     Ajax request response
	 * @private
	 *
	 * @return void;
	 */
	_accountListShowMoreAjaxError : function(response) {
		/* develblock:start */
		console.log('_accountListShowMoreAjaxError, response: ', response);
		/* develblock:end */
	},

	/**
	 * Event handler for account search input change
	 *
	 * @method _onAccountSearchInputKeyup
	 * @private
	 *
	 * @return void;
	 */
	_onAccountSearchInputKeyup : function(ev) {
		var self = this;
		this.clearAccountListAjaxTimeout();
		this._blockAccountListAppend = false;
		this._toggleSearchClearButtom();
		this._getAccountSearchParams();
		if (this._acccountSearchEl.dom.value.trim() !== '') {
			this._accountRequestTimeout = setTimeout(function() {
				self._accountListRequest(self._accountSearchParamObj, true);
			}, 300);
		}
		else if (ev.browserEvent.which === 8) {
			this.resetAccountList();
			this._acccountSearchEl.dom.focus();
		}
	},

	/**
	 * Sets the visibility of the clear button
	 *
	 * @method _toggleSearchClearButtom
	 * @private
	 *
	 * @return void;
	 */
	_toggleSearchClearButtom : function() {
		if (Ext.fly(this.accountSearchInputId).dom.value !== '') {
			this._searchInputClearButtonEl.setStyle('display', 'block');
		}
		else {
			this._searchInputClearButtonEl.setStyle('display', 'none');
		}
	},

	/**
	 * Method clears the account list request timeout
	 *
	 * @method clearAccountListAjaxTimeout
	 * @public
	 *
	 * @return void;
	 */
	clearAccountListAjaxTimeout : function() {
		clearTimeout(this._accountRequestTimeout);
	},

	/**
	 * Initiate or resize method for scrollbar on performer list
	 *
	 * @method setAccountListScrollBar
	 * @public
	 *
	 * @return void;
	 */
	setAccountListScrollBar : function() {
		if (!this._selectProfileMainEl) {
			return;
		}

		var self = this,
			_loaderEl = this._selectProfileMainEl.select(this.accountLoaderSel).item(0),
			_loaderElHeight = _loaderEl !== null ? _loaderEl.getHeight() : 0;

		//A profile selector scroll peldanyositasa (csak ha a belso tartalom hosszabb mint kulso kontener)
		if (!(this._scroll instanceof ScrollPane)) {
			if (this._selectProfileMainEl.getHeight() < Ext.get(this.selectProfileContentId).getHeight()) {
				this._scroll = new ScrollPane(this._selectProfileMainEl,
					{
						containerId      : this.selectProfileContainerId,
						contentId        : this.selectProfileContentId,
						tpl              : '<div class="scroll-pane"><div class="scrollbar"></div></div>',
						scrollBarClass   : 'scrollbar',
						useNativeScroll  : false,
						relativeElHeight : _loaderElHeight
					}
				);
				this._scroll.on(ScrollPane.EVENT_SCROLL_BEFORE_BOTTOM, self._scrollEventHandler, self);
			}
		}
		else if (this._scroll instanceof ScrollPane) { // Just resize the height
			this._scroll.setScrollBarHeight();
			this._scroll.setRelativeHeight(_loaderElHeight);
		}
	},

	/**
	 * Clears the account search bar and sets the default list
	 *
	 * @method _onSearchInputClearButtonClick
	 * @private
	 *
	 * @return void;
	 */
	_onSearchInputClearButtonClick : function() {
		this.resetAccountList();
		this._acccountSearchEl.dom.focus();
	},

	/**
	 * Scroll event handler
	 *
	 * @method _scrollEventHandler
	 * @private
	 *
	 * @return void;
	 */
	_scrollEventHandler : function() {
		this._accountListShowMore();
	},

	/**
	 * Builds a CSS arrow pointing to the Allow Cam Bar , then Starts the CSS anim with a class.
	 */
	startArrowAnim : function() {
		// Remove event handler
		Ext.fly(window).un('resize', this.onWindowResize, this);

		// Create and Append DOM element
		var self = this,
			dh = Ext.DomHelper,
			arrowTpl = {
				tag      : 'div',
				cls      : 'fullArrow',
				children : {
					tag : 'div',
					cls : 'fullArrowpoint'
				}
			},
			el = dh.append(Ext.getBody(), arrowTpl);

		// append a class to start anim
		setTimeout(function() {
			Ext.fly(el)
				.addClass('start')
				.on('webkitTransitionEnd', self.arrowAnimEnd, self);
		}, 50);
	},

	/**
	 * Runs after the arrow animation, and hides the arrow
	 */
	arrowAnimEnd : function(ev, target) {
		var el = Ext.get(target);
		el.removeAllListeners();
		setTimeout(function() {
			el.addClass('ended');
		}, 3000);
	},

	onWindowResize : function() {
		var self = this;

		// Only width is modified
		if (this._currentInnerWidth !== window.innerWidth && this._currentInnerHeight === window.innerHeight) {
			return false;
		}

		// Save current window width and height
		this._currentInnerWidth = window.innerWidth;
		this._currentInnerHeight = window.innerHeight;

		// Wait for resize to end
		if (this._windowTimeout) {
			clearTimeout(this._windowTimeout);
		}

		// Do anim
		this._windowTimeout = setTimeout(function() {
			var diff = self._startInnerHeight - window.innerHeight;
			if (diff <= self._chromeBarHeight + 10 && diff >= self._chromeBarHeight - 10) {
				self.startArrowAnim();
			}
		}, 200);
	},

    /**
	 * Keeps the session alive. If the session is lost on server side, it trigger a logout.
	 *
	 * @param scope Scope Of the method.
	 * @param {Object} params Contains action: post|get for the the ajax action
	 */
	sessionKeepAlive : function(params = { action : 'get' }) {
		var url =
			Chaos.getUrl(
				this.sessionKeepAliveRoute,
				{},
				{
					sourceUrl : Util.getUrlWithoutHost()
				},
			'');

		Connection.Ajax.request({
			type   	: 'json',
			url   		: url,
			scope  	: this,
			success	: this.sessionKeepAliveSuccess,
			error  	: this.sessionKeepAliveError,
			failure	: this.sessionKeepAliveFailure,
			method 	: params.action
		});
	},

    /**
	 * Session Keep Alive Ajax Success Method
	 */
	sessionKeepAliveSuccess : function(response) {
		if (response.json.errorCode) {
			window.location.href = Config.get('baseUrl');
		}
		else if (!response.json.data) {
			window.location.href = response.json.data;
		}
	},

	/**
	 * Session Keep Alive Ajax Error Method
	 */
	sessionKeepAliveError : function(response) {
		/* develblock:start */
		console.log(response);
		/* develblock:end */
	},

	/**
	 * Session Keep Alive Ajax Failure Method
	 */
	sessionKeepAliveFailure : function(response) {
		/* develblock:start */
		console.log(response);
		/* develblock:end */
	},

	/**
	 * Logged In Button Hover Event handler
	 */
	onLoggedInOver : function() {
		this._loggedInButtonEl.addClass('noHide');
		if (this._acccountSearchEl) {
			this._blockAccountListAppend = false;
			this._acccountSearchEl.dom.focus();
		}
	},

	/**
	 * Logged In Button unHover Event handler
	 */
	onLoggedInOut : function() {
		document.activeElement.blur();
		if (this._acccountSearchEl && this._acccountSearchEl.dom.value !== '') {
			return;
		}
		document.activeElement.blur();
		this._loggedInButtonEl.removeClass('noHide');
	},

	/**
	 * Window click handler. Checks id we clicked outside our account selector
	 * @param ev        Event object
	 * @param target    Target DOM element
	 * @private
	 */
	_onWindowClick : function(ev, target) {
		if (Ext.get(target).findParent('.tooltip', 12, true)) {
			return;
		}
		if (this._acccountSearchEl && this._loggedInButtonEl.hasClass('noHide')) {
			this._loggedInButtonEl.removeClass('noHide');
			this.resetAccountList();
		}
	},

	/**
	 * Sets the default account list
	 * @method resetAccountList
	 * @public
	 *
	 * @return void;
	 */
	resetAccountList : function() {
		this._blockAccountListAppend = true;
		this.clearAccountListAjaxTimeout();
		this._acccountSearchEl.dom.value = '';
		this._selectProfileContentEl.dom.innerHTML = this._firstSelectProfileContentTpl;
		if (this._scroll instanceof ScrollPane) {
			this._scroll.destroy();
		}
		this._scroll = {};
		if (this._selectProfileMainEl.select('.scroll-pane').item(0)) {
			this._selectProfileMainEl.select('.scroll-pane').item(0).remove();
		}
		this._inputVal = '';
		this.setAccountListScrollBar();
		this._toggleSearchClearButtom();
	},

	/**
	 * Window keyup handler.
	 * @param ev        Event object
	 * @param target    Target DOM element
	 * @private
	 */
	_onWindowKeypressed : function(ev) {
		if (document.activeElement.tagName.toLowerCase() !== 'input' &&
			document.activeElement.tagName.toLowerCase() !== 'textarea' &&
			document.activeElement.tagName.toLowerCase() !== 'embed' &&
			document.activeElement.tagName.toLowerCase() !== 'object' &&
			!Config.get('isOverlayOpened') &&
			!ev.browserEvent.ctrlKey &&
			!ev.browserEvent.altKey) {
			switch (ev.browserEvent.which) {
				case 13: // enter
				case 32: // space
				case 0: // tab
					return false;
				default:
					this.onLoggedInOver();
			}
		}
	},

	/**
	 * Bind function, executed on init, binds all event handlers needed on start
	 *
	 * @return undefined
	 */
	bind : function() {
		Ext.fly(window).on('resize', this.onWindowResize, this);
		Ext.fly(window).on('click', this._onWindowClick, this);

		if (this._acccountSearchEl) {
			this._acccountSearchEl.on('keyup', this._onAccountSearchInputKeyup, this);
			this._searchInputClearButtonEl.on('click', this._onSearchInputClearButtonClick, this);
			Ext.fly(window).on('keypress', this._onWindowKeypressed, this);
		}

		if (this._loggedInButtonEl) {
			this._loggedInButtonEl.hover(this.onLoggedInOver, this.onLoggedInOut, this);
		}

		Registration.superclass.bind.call(this);
	},

	/**
	 * Unbind function, executed if corresponding element is beeing destroyed
	 *
	 * @return undefined
	 */
	unbind : function() {
		this.autoUnbind();
	}
});
