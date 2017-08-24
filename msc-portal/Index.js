/* eslint-disable complexity */

import $ from 'jquery';
import { TweenMax } from 'gsap';
import 'slick-carousel';

import Ext from '../../../lib/vendor/ExtCore';
import Chaos from '../../../lib/chaos/Chaos';
import Page from '../../../lib/chaos/Page';
import Util from '../../../lib/chaos/Util';
import { Broadcaster } from '../../../lib/chaos/Broadcaster';
import Config from '../../../lib/chaos/Config';
import IsMobile from '../../../lib/chaos/IsMobile';

import Overlay from '../../Overlay/Overlay';
import CountUp from '../../CountUp/CountUp';
import ScrollTo from '../../Scroll/ScrollTo';
import Parallax from '../../Scroll/Parallax';
import BlockScroll from '../../Scroll/BlockScroll';

import './Index.scss';

export default function Index (el, config) {
	Index.superclass.constructor.call(this, el, config);
}

Index.SMALL_LAYOUT = 'landing-page-small-layout';
Index.FULL_LAYOUT = 'landing-page-full-layout';

Chaos.extend(Index, Page, {

	ui : {
		/** @var {String} money01         Money overlay image element */
		money01             : 'money01',
		/** @var {String} covers          Cover sections */
		covers              : '.cover',
		/** @var {String} joins           Join buttons */
		joins               : '.joinTrigger',
		/** @var {String} joins           Login buttons */
		logins              : '.loginTrigger',
		/** @var {String} video           Video element */
		video               : 'video',
		/** @var {String} navBtns         Buttons in the navigation */
		navBtns             : '.home-navigation button',
		/** @var {String} header          Header Element */
		header              : 'header',
		/** @var {String} sections        Section elements*/
		sections            : 'section',
		/** @var {String} counter         AWE calcultator counters (incomeData) */
		counter             : '[data-sum]',
		/** @var {String} sectionContainers sectionContainers represents a viewport (2 sections) */
		sectionContainers   : '.sectionContainer',
		/** @var {String} backToTop        Back to Top Element */
		backToTop           : '.backToTop',
		/** @var {String} html             HTML element */
		html                : 'html',
		/** @var {String} body             BODY Element*/
		body                : 'body',
		/** @var {String} password         Password field in create account section */
		password            : '[name="password"]',
		/** @var {String} createAccountInputs Input fields, create account section */
		createAccountInputs : '#accountChooser input',
		/** @var {String} createAccountHalfs  */
		createAccountHalfs  : '.account'
	},

	/** @var {Object} niceScrollConfig     Config object for the NiceScroll component */
	niceScrollConfig : {
		enablemousewheel        : false,
		enablekeyboard          : false,
		zindex                  : 2,
		cursorwidth             : 6,
		cursorborderradius      : 3,
		cursorborder            : 'none',
		cursorcolor             : 'rgb(147, 3, 3)',
		cursoropacitymax        : 0.7,
		railpadding             : { top : 0, right : 5, left : 0, bottom : 0 },
		smoothscroll            : false,
		hwacceleration          : true,
		scrollspeed             : 500,
		preservenativescrolling : true,
		enabletranslate3d       : false,
		nativeparentscrolling   : true,
		autohidemode            : false
	},

	/** @var {String} niceScrollCls       This cls shows on html and body elements that nicescroll is enabled */
	niceScrollCls : 'niceScroll',

	/** @var {Number} _deepestScroll      Deepest scroll Y */
	_deepestScroll : 0,

	/** @var {String} headerGAname        Header name for GA */
	headerGAname : 'Header',

	/** @var {String} sectionNameDataAttr Data Attr for storing section names */
	sectionNameDataAttr : 'sectionName',

	/** @var {String} sectionIndexDataAttr Data Attr for storing section index */
	sectionNumberDataAttr : 'sectionNumber',

	/** @var {String} viewPortActivatedCls Class for active sectionContainer. This sectionContainer visible in the viewport. */
	viewPortActivatedCls : 'viewPortActivated',

	/** @var {Number} _initTime             Timestamp on init */
	_initTime : undefined,

	/** @var {Bool}                         Stores that the screen was in small screen layout after the last check or not. */
	_isSmallScreenPreviously : undefined,

	/** @var {Array} _bubbleCmps            Stores that the screen was in small screen layout after the last check or not. */
	_bubbleCmps : [],

	/**
	 * Init
	 * @param {Element} el      This should be the body tag.
	 * @param {Object} config   Config object of this component
	 */
	init : function(el, config) {
		this._initTime = new Date().getTime();
		this._deepestScroll = Util.getScrollTop();

		Index.superclass.init.call(this, el, config);

		setTimeout(function() {
			this.ui.password.els().each(function(element) {
				element.dom.value = '';
				element.dom.setAttribute('type', 'password');
			});

			this.initBackToTopPosition();
		}.bind(this), 500);


		this._initComponents();

		this.ui.counter.els().each(function(element) {
			new CountUp(element.dom, {});
		});
	},

	/**
	 * Tells if the screen width is smaller then 1024
	 * @returns {boolean}
	 * @private
	 */
	_isSmallScreen : function() {
		var isSmallScreen = !!(Math.max(document.documentElement.clientWidth, window.innerWidth || 0) < 1024);
		return IsMobile.any() || isSmallScreen;
	},

	/**
	 * Init resolution specific components. Only once, when the screen loose its small state.
	 * @private
	 */
	_initComponents : function() {
		// Parallax init
		this._moneyParallax = new Parallax({
			el       : this.ui.money01.el().dom,
			viewport : false
		});

		$('#performerReviewCarousel .slides').slick({
			prevArrow     : $('.cnav .icon-arrow-pager-left'),
			nextArrow     : $('.cnav .icon-arrow-pager-right'),
			autoplay      : true,
			autoplaySpeed : 5000
		});

		$('#millionDollar .slides').slick({
			arrows        : false,
			dots          : true,
			appendDots    : '#millionDollar .joinContainer',
			autoplay      : true,
			autoplaySpeed : 5000
		});

		// Animated scrollto component init
		new ScrollTo();

		// BlockScroll component Init
		this.blockScroll = new BlockScroll({
			els          : '.cover, #footer',
			disableOnMac : true
		});

		// BlockScroll related events, and init
		this.blockScroll.on('blockChange', this.onBlockChange.bind(this));

		// To init navbar to correct pos
		setTimeout(function() {
			this.blockScroll.fireScroll();
		}.bind(this), 0);

		// Initiating the necessary layout setup
		var layoutType = this._isSmallScreen()
			? Index.SMALL_LAYOUT :
			Index.FULL_LAYOUT;

		this._handleScreenLayoutChange(layoutType);
	},

	/**
	 * Creating and Enabling NiceScroll
	 *
	 * @return {Bool} Is enabling was successful or not (If not = mac or smallscreen)
	 */
	enableNiceScroll : function() {
		if (!this._isSmallScreen() && !Ext.isMac) {
			this._niceScroll = this.ui.body.el().jq().niceScroll(this.niceScrollConfig);
			this.ui.html.el().addClass(this.niceScrollCls);
			return true;
		}

		return false;
	},

	/**
	 * Removing and disabling NiceScroll
	 *
	 * @return void
	 */
	disableNiceScroll : function() {
		if (this._niceScroll) {
			this._niceScroll.remove();
			this._niceScroll = undefined;
		}
		this.ui.html.el().removeClass(this.niceScrollCls);
	},

	/**
	 * Handles screen size based layout changes or force a layout setting
	 * Hides&shows scrollbars, disables&enables blockscroll, etc.
	 * @param {String} forceLayout Forcing a layout setup
	 * @private
	 */
	_handleScreenLayoutChange : function(forceLayout) {
		// It used to be a small screen, but now it is not !
		if (forceLayout === Index.FULL_LAYOUT || this._isSmallScreenPreviously && !this._isSmallScreen()) {
			if (!Ext.isMac) {
				this.enableNiceScroll();
			}
			if (this.blockScroll) {
				this.blockScroll.enable();
			}
			if (this._moneyParallax) {
				this._moneyParallax.enable();
			}
			this._bubbleCmps.forEach(function(cmp) {
				cmp.start();
			});
		}
		// It used to be a big screen but its a small layout now !
		else if (
			forceLayout === Index.SMALL_LAYOUT ||
			!this._isSmallScreenPreviously && this._isSmallScreen()
		) {
			if (!Ext.isMac) {
				this.disableNiceScroll();
			}
			if (this.blockScroll) {
				this.blockScroll.disable();
			}
			if (this._moneyParallax) {
				this._moneyParallax.disable();
			}

			this._bubbleCmps.forEach(function(cmp) {
				cmp.stop();
			});
		}

		this._isSmallScreenPreviously = this._isSmallScreen();
	},

	/**
	 * Sets the appropriate right position of the jump to top btn
	 * (Text content overflows from viewport)
	 *
	 * // TODO: CSS Please!
	 *
	 * @return void;
	 */
	initBackToTopPosition : function() {
		// Back to Top element
		var el = this.ui.backToTop.el(),
			exists = this.ui.backToTop.exists();

		if (exists) {
			var icon = el.select('i').item(0),
				span = icon.next(),
				spanWidth = span.getWidth();
			el.setRight(-Math.abs(spanWidth));
		}
	},

	/**
	 * Handles video controll elements
	 * @param {Number} blockIndex Index of the viewPortActive sectionContainer
	 * @private
	 * @returns void
	 */
	_videoController : function(blockIndex) {
		var target = this.ui.sectionContainers.els().item(blockIndex);

		if (!target) {
			return;
		}

		var action = target.data('videoAction'),
			video = this.ui.video.el();

		if (action === 'start') {
			video.dom.play();
		}
		else {
			video.dom.pause();
		}
	},

	/**
	 * Handles block change event coming from the BlockScroll module
	 * @param {Object} ev Event Object w/ params
	 */
	onBlockChange : function(ev) {
		if (!this._isSmallScreen()) {
			var blockIndex = parseInt(ev.block, 10),
				navElementToActivate = this.ui.navBtns.els().item(blockIndex);
			navElementToActivate.radioClass('active');
			this._videoController(blockIndex);
		}
	},

	/**
	 * Returns the scroll Y breakpoints of every section tag in array
	 * @return {Array}
	 * @private
	 */
	_getSectionBreakpoints : function() {
		var ret = [];
		this.ui.sections.els().each(function(el) {
			var top = el.getTop();
			ret.push(top);
		});

		return ret;
	},

	/**
	 * Get closest index in an array of numbers around a given number
	 * @param {Array} a The array
	 * @param {Number} n The number
	 * @return {Number} Index of the closest element
	 * @private
	 */
	_getClosestIndex : function(a, n) {
		let l;
		if ((l = a.length) < 2) {
			return l - 1;
		}
		for (l, p = Math.abs(a[--l] - n); l--;) {
			if (p < (p = Math.abs(a[l] - n))) {
				break;
			}
		}
		return l + 1;
	},

	/**
	 * On Window Scroll
	 * @return void
	 * @private
	 */
	_onWindowScroll : function() {
		this._storeDeepestScroll();
	},

	/**
	 * Find out which block we clicked in.
	 * @param {Number} scrollY Y value of the window scroll
	 * @returns {Number} Block index
	 * @private
	 */
	_getBlockIndexByScrollY : function(scrollY = 0) {
		var headerHeight = this.ui.header.el().getHeight();

		// If the click took place in the header, return 0 index
		if (scrollY <= headerHeight) {
			return 0;
		}

		var breakpoints = this._getSectionBreakpoints(),
			closest = this._getClosestIndex(breakpoints, scrollY);

		// Plus 1 because the header is the 0, which is not a section tag
		return closest + 1;
	},

	/**
	 * Returns the elapsed time since the page is inited
	 * @returns {number} Spent seconds
	 * @private
	 */
	_getSpentTime : function() {
		return parseInt((new Date().getTime() - this._initTime) / 1000, 10);
	},

	/**
	 * Returns the data-section-name by the section index. 0 is for the Header.
	 * @param {Number} index Index of the section. Zero is for Header.
	 * @returns {String} Name of the section, coming from <section data-section-name
	 * @private
	 */
	_getSectionNameByIndex : function(index) {
		// Zero index is for header
		if (index === 0) {
			return this.headerGAname;
		}
		// Minus 1 bacause Header is not a physical section
		return this.ui.sections.els().item(index - 1).data(this.sectionNameDataAttr);
	},

	/**
	 * Return the section number whitch stored in the section's data attr.
	 * By the index of the section.
	 *
	 * @param {Number} index Index of the section
	 * @returns {*}
	 * @private
	 */
	_getSectionNrByIndex : function(index) {
		// Zero index is for header
		if (index === 0) {
			return 0;
		}
		// Minus 2 bacause Header and Footer are not physical sections
		return this.ui.sections.els().item(index - 2).data(this.sectionNumberDataAttr);
	},

	/**
	 * Stores the deepest scroll values
	 * @private
	 */
	_storeDeepestScroll : function() {
		var top = Util.getScrollTop();
		if (this._deepestScroll < top) {
			this._deepestScroll = top;
		}
	},

	onSVGOver : function(ev) {
		var target = Ext.get(ev.target).findParent('a', 6, true);
		var group = target.select('g');

		group.each(function() {
			if (this.dom.id.indexOf('AnimIn') > -1) {
				TweenMax.killTweensOf(this.dom);
				TweenMax.to(this.dom, 0.3, {
					transformOrigin : '50% 50%',
					scale           : 0,
					opacity         : 0
				});
			}
			if (this.dom.id.indexOf('AnimOut') > -1) {
				TweenMax.killTweensOf(this.dom);
				TweenMax.fromTo(this.dom, 0.3, {
					transformOrigin : '50% 50%',
					scale           : 2,
					opacity         : 0
				}, {
					transformOrigin : '50% 50%',
					scale           : 1,
					opacity         : 1
				});
			}
		});
	},

	onSVGOut : function(ev) {
		var target = Ext.get(ev.target).findParent('a', 6, true);
		var group = target.select('g');
		group.each(function() {
			if (this.dom.id.indexOf('AnimIn') > -1) {
				TweenMax.killTweensOf(this.dom);
				TweenMax.to(this.dom, 0.3, {
					transformOrigin : '50% 50%',
					scale           : 1,
					opacity         : 1
				});
			}
			if (this.dom.id.indexOf('AnimOut') > -1) {
				TweenMax.killTweensOf(this.dom);
				TweenMax.fromTo(this.dom, 0.3, {
					transformOrigin : '50% 50%',
					scale           : 1,
					opacity         : 1
				}, {
					transformOrigin : '50% 50%',
					scale           : 2,
					opacity         : 0
				});
			}
		});
	},

	/**
	 * On window resize event handler.
	 *
	 * @private
	 */
	_onWindowResize : function() {
		this._handleScreenLayoutChange();
	},

	/**
	 * On overlay open, disable blockscroll and nicescroll
	 * @private
	 */
	_onOverlaysOpen : function() {
		this.disableNiceScroll();
		if (this.blockScroll && !this._isSmallScreen()) {
			this.blockScroll.disable();
		}
	},

	/**
	 * On overlay close, enable niescroll and blockscroll
	 * @private
	 */
	_onOverlaysClose : function() {
		this.enableNiceScroll();
		if (this.blockScroll && !this._isSmallScreen()) {
			this.blockScroll.enable();
		}
	},

	/**
	 * There are 2 half part in the Create Account section.
	 * This method handles the mouseover event for both of those halfs.
	 * @private
	 */
	_onCreateAccountInputsFocus : function(ev) {
		var targetEl = Ext.get(ev.target),
			blockEl = targetEl.findParent(this.ui.createAccountHalfs.sel(), null, true);

		blockEl.radioClass('active');
	},

	/**
	 * Bind event handlers
	 */
	bind : function() {
		Index.superclass.bind.call(this);

		this.ui.createAccountInputs.els().on('focus', this._onCreateAccountInputsFocus, this);

		Ext.fly(window).on('scroll', this._onWindowScroll, this);
		Ext.fly(window).on('resize', this._onWindowResize, this);

		Ext.select('.iconLink')
			.on('mouseenter', this.onSVGOver, this)
			.on('mouseleave', this.onSVGOut, this);

		Broadcaster.on(Overlay.OVERLAY_READY, this._onOverlaysOpen, this);
		Config.get('overlayComponent').on(Overlay.CLOSE_OVERLAY, this._onOverlaysClose, this);
	},

	/**
	 * UnBind event handlers
	 */
	unbind : function() {
		this.autoUnbind();
	}
});
