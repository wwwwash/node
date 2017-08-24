import Ext from '../../lib/vendor/ExtCore';
import Chaos from '../../lib/chaos/Chaos';
import ChaosObject from '../../lib/chaos/Object';

/**
 *
 * Horizontalis scroller komponens, a normal scrollbar helyett hasznalhato komponens.
 *
 * Kizarolag az eger altali scrollbar megfogast kezeli, tehat horizontalisan gorgetni nem lehet, csak huzni!
 *
 * A HTMLnek a kovetkezokeppen kell felepulnie:
 * +--------------------------------------+
 * |element                               |
 * | +----------------------------------+ |
 * | | container                        | |
 * | |  +----------------------------+  | |
 * | |  | content                    |  | |
 * | |  |                            |  | |
 * | |  |                            |  | |
 * | |  |  . . . . . . . . . . . . . |  | |
 * | |                                  | |
 * | +----------------------------------+ |
 * | |  Scrollbar                       | |
 * | +----------------------------------+ |
 * +--------------------------------------+
 *
 * A content megadasa kotelezo, mivel az mondja meg, mely elemet szeretnenk scrollozni.
 *
 * Ketfelekeppen hasznalhato: vagy mar kesz HTML kod mukodesre birasara (amikor a scrollbar is a domban van, csak nem mukodik)
 * illetve ugy is, hogy a komponens maga hozza letre a scrollbart.
 *
 *
 * @param {Object} el       the element
 * @param {Object} config   config object
 */
export default function HorizontalScroll(el, config) {
	HorizontalScroll.superclass.constructor.call(this, el, config);
}

// Events
HorizontalScroll.EVENT_SCROLL = 'scroller-scroll';
HorizontalScroll.EVENT_SCROLL_LEFT = 'scroller-left';
HorizontalScroll.EVENT_SCROLL_RIGHT = 'scroller-right';
HorizontalScroll.SCROLL_DIRECTION_LEFT = 'scroll-direction-left';   // wheeldelta:  1
HorizontalScroll.SCROLL_DIRECTION_RIGHT = 'scroll-direction-right'; // wheeldelta: -1

Chaos.extend(HorizontalScroll, ChaosObject, {

	/** @var {String}       Scrollbarhoz tartozo template */
	tpl                    : '<div class="{cls}"><span>&nbsp;</span></div>',
	/** @var {String}       A kontener ID-ja, amiben a tartalom van es ami a native scrollbart is tartalmazza */
	containerId            : undefined,
	/** @var {String}       A tenylegesen megjeleno tartalom ID-ja, ami a lathato es gorgetheto box lesz */
	contentId              : undefined,
	/** @var {String}       Az egesz blokkot kozrefogo elem ID-ja. Ha nincs megadva, akkor a this.element-re mutat. [opcionalis] */
	mainContainerId        : undefined,
	/** @var {String}       A sajat scrollbar class neve */
	scrollBarClass         : 'scrollbar-handle',
	/** @var {Boolean}      Native scroll vagy kiszamitott scrollozas hasznalata. Olyan esetekben erdemes FALSE-ra allitani,
	 *					    amikor a hatter gorgeteset tiltani kell. Ha a hatter nem gorgetheto, akkor TRUE-ra allitando. */
	useNativeScroll        : true,
	/** @var {Boolean}      TRUE, ha kezelnie kell a hatter gorgetesenek tiltasat/engedelyezeset is */
	manageBackgroundScroll : true,
	/** @var {Number}       Jelzi, hogy a gordulo tartalom aljahoz kozeledve hany pixellel elobb kell kuldeni az eventet */
	rightValue             : 0,
	/** {Number}		    A scrollbar minimalis magassaga*/
	minScrollBarWidth      : 25,
	/** @var {Object}       This element triggers left scrolling - public */
	scrollTriggerLeftEl    : undefined,
	/** @var {Object}       This element triggers right scrolling - public */
	scrollTriggerRightEl   : undefined,
	/** @var {Boolean}      Use wheel scroll or not */
	useWheelScroll         : false,
	/** @var {Boolean}      Hide scrollbar if content is not scrollable*/
	autoHide               : false,
	/** @var {String}       Visible pager */
	pagerVisibleCls        : 'visible',

	/** PRIVATES */

	/** @var {Object}       Scrollbar elem [Ext.Element] */
	_scrollBarEl           : undefined,
	/** @var {Object}       Kontener elem  [Ext.Element] */
	_containerEl           : undefined,
	/** @var {Object}       Belso tartalom [Ext.Element] */
	_contentEl             : undefined,
	/** @var {Boolean}      TRUE, ha a csuszkat egerrel mozgatva gorgetjuk a tartalmat */
	_isScrollingWithMouse  : true,
	/** @var {Number}       Scrollbar poziciojat tarolja */
	_currentScrollPosition : 0,
	/** @var {Number}       Y-tengely erteke a csuszka "megfogasakor" */
	_startX                : 0,
	/** @var {Boolean}      Tarolja, hogy az adott elem folott van-e az eger [mouseover es mouseout esemeny emulalasakor] */
	_isElementOvered       : false,
	/** @var {Object}       You can set a foreign container for the horizontal scroller */
	foreignContainerEl     : undefined,
	/** @var {Object}       AutoScroll TweenLite Object */
	_autoScrollAnim        : undefined,
	/** @var {Number}       Counter of the fired scroll events */
	_scrollEventsCounter   : 0,
	/** @var {Number}       Counter of the fired mouse move events (onMouseMove) */
	_moveEventsCounter     : 0,

	/**
	 * Init
	 *
	 * @param {obj} el        element
	 * @param {obj} config    configs
	 */
	init : function(el, config) {
		// Tartalmi elemek lementese
		this._containerEl = Ext.get(this.containerId);
		this._containerEl.setStyle({
			overflow : 'hidden'
		});

		//this._containerEl.scrollTo('top', 0);

		// Tartalom lementese
		this._contentEl = Ext.get(this.contentId);

		// Scroll Container can be a foreign container as well
		this._scrollerEl = this.foreignContainerEl ? this.foreignContainerEl : this.element;

		// Tartalom overflow beallitasa hiddenre
		this._contentEl.setStyle({ overflow : 'hidden' });

		this.addEvents(
			HorizontalScroll.EVENT_SCROLL,
            HorizontalScroll.EVENT_SCROLL_LEFT,
            HorizontalScroll.EVENT_SCROLL_RIGHT
		);

		if (this.scrollTriggerLeftEl || this.scrollTriggerRightEl) {
			this.handleScrollTriggerVisibility();
		}

		// Sajat scrollbar letrehozasa
		this.setScrollBar();

		this.handleScrollbarVisibility();

		HorizontalScroll.superclass.init.call(this, el, config);
	},

	/**
	 * Letrehozza a sajat scrollbar-t
	 *
	 * @return {Object}   Scrollbar elem
	 */
	setScrollBar : function() {
		var _scrollbarTpl = new Ext.Template(this.tpl);
		this._scrollBarEl0 = _scrollbarTpl.append(this._scrollerEl.dom, {
			cls : this.scrollBarClass
		}, true);

		this._scrollBarEl = this._scrollBarEl0.child('.scrollbar');

		// Aranynak megfelelo magassag beallitasa
		this.setScrollBarWidth();

		return this._scrollBarEl;
	},

	/**
	 * Visszaadja a scrollbar elemet
	 *
	 * @return {Object}   Scrollbar elem
	 */
	getScrollBar : function() {
		return this._scrollBarEl;
	},

	/**
	 * Kiszamolja a lathato szelesseg es a teljes tartalom szelessegebol adodo aranyt
	 */
	getRatio : function() {
		return this._contentEl.dom.scrollWidth !== 0
							? this._containerEl.getWidth() / this._contentEl.dom.scrollWidth
							: this._contentEl.dom.scrollWidth;
	},

	/**
	 * Beallitja a scrollbar magassagat a tartalom magassagatol fuggoen es be is pozicionalja
	 */
	setScrollBarWidth : function() {
		var _newWidth = this._scrollerEl.getWidth() * this.getRatio();
		// Beallitja a scrollbar magasagat a minimalis magassagra, ha kisebb vagy egyenlo azzal
		_newWidth = _newWidth < this.minScrollBarWidth
							? this.minScrollBarWidth
							: _newWidth;

		this.getScrollBar().setWidth(_newWidth);
		// Pozicio beallitasa
		this.setScrollBarPosition();
	},

	/**
	 * Beallitja a scrollbar poziciojat
	 *
	 * @return void
	 */
	setScrollBarPosition : function() {
		var _position = this._containerEl.dom.scrollLeft / this.getContentWidth(),
			_scrollPosition = _position * this.getBoxWidth();

        //Beallitom a poziciot, de a scrollbar nem erheti el a kontenere szelet, ezert eltolom 4px-el
		if (parseInt(_scrollPosition, 10) > 4) {
			this.getScrollBar().setStyle('left', parseInt(_scrollPosition, 10) - 4 + 'px');
		}
		else {
			this.getScrollBar().setStyle('left', 0 + 'px');
		}

		if (!this._isScrollingWithMouse) {
			this._currentScrollPosition = _scrollPosition;
		}
	},

	/**
	 * Kiszamolja a kontener pillanatnyi szelesseget
	 * @TODO ez nem tudom mit csinal, de ezt biztosan nem :)
	 * @return {Number}   Kontener szelessege
	 */
	getContentWidth : function() {
		return this._containerEl.dom.scrollWidth - this._containerEl.getWidth();
	},

	/**
	 * Lekezeli a scrollbar-on torteno mousedown esemenyt
	 *
	 * @param {obj} ev event
	 *
	 */
	onScrollBarMouseDown : function(ev) {
		this._startX = ev.browserEvent.clientX;
		this._isScrollingWithMouse = true;

		this.element.on('mousemove', this.onMouseMove, this);
		this.element.on('mouseup', this.onMouseUp, this);
		// tiltjuk a kijeloleseket amig scroll van
		this.disableSelect();
		return false;
	},


	/**
	 * Body-n tortent mouseup lefutasakor megnezi, hogy kozben scrollbarra kattintva mozgott-e az eger,
	 * es ha igen, akkor hivja a mouseUp metodust, ami "elengedi" a scrollbar-t.
	 *
	 * @return void
	 */
	onBodyMouseUp : function() {
		if (this._isScrollingWithMouse) {
			this.mouseUp();
		}
	},

	/**
	 * Mousemove esemeny kezelo
	 *
	 * @param {obj} ev event
	 *
	 */
	onMouseMove : function(ev) {
		if (this._isScrollingWithMouse) {
			this._moveEventsCounter++;
			// Sparing some CPU time
			if (this._moveEventsCounter % 2 !== 1) {
				//return;
			}
			var _scrollPosition = ev.browserEvent.clientX - this._startX + this._currentScrollPosition;
			var contentPosition = _scrollPosition / this.getBoxWidth();
			this._containerEl.scrollTo('left', Math.round(this.getContentWidth() * contentPosition));
			this._autoScrollAnim = undefined;
            //this.setScrollBarPosition();
		}
	},

	/**
	 * Mouseup esemeny kezelo
	 */
	onMouseUp : function() {
		this.mouseUp();
	},

	/**
	 * Megallitja az egermozgasra torteno gorgetest
	 */
	mouseUp : function() {
		this._currentScrollPosition =
			Math.ceil(this._containerEl.dom.scrollLeft / this.getContentWidth() * this.getBoxWidth());
		this._isScrollingWithMouse = false;
		// engedelyezzuk a kijeloleseket
		this.enableSelect();
        //lekoti az elemrol az esemenyeket
		this.element.un('mousemove', this.onMouseMove, this);
		this.element.un('mouseup', this.onMouseUp, this);
	},

	/**
	 * Visszaadja a box szelesseget
	 *
	 * @return {Number}   Box szelessege
	 */
	getBoxWidth : function() {
		return this._scrollerEl.getWidth() - this._scrollBarEl.getWidth();
	},

	/**
	 * Leellenorzi, hogy elertuk-e a scrollozassal a tartalom bal vagy jobb szelet es ha igen, akkor esemenyt dob rola.
	 */
	checkEdges : function() {
		if (this._containerEl.dom.scrollLeft === this.getContentWidth() - this.rightValue) {
			this.fireEvent(HorizontalScroll.EVENT_SCROLL_RIGHT, { scope : this });
			return 'r';
		}
		else if (this._containerEl.dom.scrollLeft === 0) {
			this.fireEvent(HorizontalScroll.EVENT_SCROLL_LEFT, { scope : this });
			return 'l';
		}
		return false;
	},

	/**
	 * Letiltja a selectet es a draget
	 *
	 * @return void
	 */
	disableSelect : function() {
		Ext.getBody().addClass('noselect');
		var html = Ext.get(document.getElementsByTagName('html')[0]);

		html.on('dragstart', function(ev) {ev.preventDefault(); return false});

		Ext.DomHelper.disableSelect(Ext.getBody().dom);
		Ext.DomHelper.disableSelect(this.element.dom);
	},

	/**
	 * Engedelyezi a selectet es a draget
	 *
	 * @return void
	 */
	enableSelect : function() {
		Ext.getBody().removeClass('noselect');
		var html = Ext.get(document.getElementsByTagName('html')[0]);

		html.un('dragstart', function(ev) {ev.preventDefault(); return false});

		Ext.DomHelper.enableSelect(Ext.getBody().dom);
		Ext.DomHelper.enableSelect(this.element.dom);
	},

	/**
	 * MouseOver es MouseOut esemenyek emulalasara.
	 * Kizarja annak a lehetoseget, hogy a container-en talalhato esetleges layerek,
	 * [vagy akar flash applet] miatt hibasan fusson le a mouseover es mouseout esemeny. Tipikus eset, amikor eger
	 * mozgasra folyamatosan futnak az over es out esemenyek.
	 *
	 * @param {Object}      ev       Ext.EventObject
	 * @param {HTMLElement} target   Event.target
	 *
	 * @return void
	 */
	onDocumentMouseMove : function(ev, target) {
		// Ha a megadott kontener tartalmazza a target-et, akkor emulalunk egy mouseOver esemenyt
		if (this._containerEl.contains(target) || target.className === this.scrollBarClass) {
			// MouseOver esemeny emulalasa
			if (!this._isElementOvered) {
				this._isElementOvered = true;
			}
		}
		else if (this._isElementOvered) {
			this._isElementOvered = false;
		}
	},

	/**
	 * If autoHide is true, shows or hides the scrollbar
	 * when the content is wider/narrower than the window width
	 */
	handleScrollbarVisibility : function() {
		if (this.autoHide && this._containerEl.dom.scrollWidth <= this._containerEl.getWidth()) {
			this._scrollerEl.hide();
			this.hidePager(this.scrollTriggerLeftEl);
			this.hidePager(this.scrollTriggerRightEl);
		}
		else {
			this._scrollerEl.show();
			this.showPager(this.scrollTriggerLeftEl);
			this.showPager(this.scrollTriggerRightEl);
		}
	},

	/**
	 * window.resize esemenykezelo
	 *
	 * @return void
	 */
	onWindowResize : function() {
		this.updateControls();
	},

	/**
	 * Updates the controls, which are scroll and width related
	 * @public
	 * @return void
	 */
	updateControls : function() {
		this.handleScrollbarVisibility();
		this.setScrollBarWidth();
		this.handleScrollTriggerVisibility();
	},

	/**
	 * Handles the visibility state of the pager elements with unique show/hide methods
	 * @return void
	 */
	handleScrollTriggerVisibility : function() {
		// if content is narrower than container el width
		if (this._containerEl.dom.scrollWidth <= this._containerEl.getWidth()) {
			this.hidePager(this.scrollTriggerLeftEl);
			this.hidePager(this.scrollTriggerRightEl);
			return;
		}

		var checkEdges = this.checkEdges();

		if (checkEdges === 'l') {
			this.hidePager(this.scrollTriggerLeftEl);
			this.showPager(this.scrollTriggerRightEl);
		}
		else if (checkEdges === 'r') {
			this.showPager(this.scrollTriggerLeftEl);
			this.hidePager(this.scrollTriggerRightEl);
		}
		else {
			this.showPager(this.scrollTriggerLeftEl);
			this.showPager(this.scrollTriggerRightEl);
		}
	},

	/**
	 * Hides the pager element (el)
	 * @param {Object} el The involved Ext.Element
	 * @return void
	 */
	hidePager : function(el) {
		if (el) {
			el.removeClass(this.pagerVisibleCls);
		}
	},

	/**
	 * Shows the pager element (el)
	 * @param {Object} el The involved Ext.Element
	 * @return void
	 */
	showPager : function(el) {
		if (el) {
			el.addClass(this.pagerVisibleCls);
		}
	},

	/**
	 * On Scroll Trigger Mouse Enter
	 * @param {Object}      ev       Ext.EventObject
	 * @param {HTMLElement} target   Event.target
	 * @return void
	 */
	onScrollTriggerMouseEnter : function(ev, target) {
		var self = this,
			targetEl = Ext.get(target),
			direction = targetEl.findParent('.pager', 2, true).dom.className === this.scrollTriggerLeftEl.dom.className
							? 'l'
							: 'r',
			scrollTo = direction === 'l' ? 0 : 'max';

		// If we have an ongoing animation and that direction is the same, we can continue the animation
		if (this._autoScrollAnim && scrollTo === this._autoScrollAnim.vars.scrollTo.x) {
			this._autoScrollAnim.resume();
		}
		// ... Or we Create a new animation (another scroll direction)
		else {
			this._autoScrollAnim = TweenMax.to(
				this._containerEl.dom,
				2,
				{
					scrollTo   : { x : scrollTo },
					onComplete : function() {
						self._autoScrollAnim = undefined;
						self.hidePager(targetEl);
					}
				});
		}
	},

	/**
	 * On Scroll Trigger Mouse Leave
	 * @return void
	 */
	onScrollTriggerMouseLeave : function() {
		if (this._autoScrollAnim) {
			this._autoScrollAnim.pause();
		}
	},

	/**
	 * On Container Element Scroll
	 * @return void
	 */
	onScroll : function () {
		this._scrollEventsCounter++;

		this.handleScrollTriggerVisibility();

		// Spare some CPU time
		if (this._scrollEventsCounter % 2 !== 1) {
			//return;
		}

		this.setScrollBarPosition();
	},

	/**
	 * Lekezeli a konteneren tortent "mousewheel" esemenyt
	 * Csak native scroll eseten [useNativeScroll: true]
	 *
	 * @param {obj} ev event
	 *
	 * @return void
	 */
	onContainerMousewheel : function(ev) {
		ev.preventDefault();
		// TODO: multiplier could be dynamic
		this._containerEl.dom.scrollLeft = this._containerEl.dom.scrollLeft + ev.getWheelDelta() * -30;
		this.setScrollBarPosition();
	},

	bind : function() {
		HorizontalScroll.superclass.bind.call(this);

		this.getScrollBar().on('mousedown', this.onScrollBarMouseDown, this);

		Ext.getBody().on('mouseup', this.onBodyMouseUp, this);
		Ext.get(document).on('mousemove', this.onDocumentMouseMove, this);
		Ext.fly(window).on('resize', this.onWindowResize, this);

		this._containerEl.on('scroll', this.onScroll, this);

		if (this.scrollTriggerLeftEl) {
			this.scrollTriggerLeftEl.on('mouseenter', this.onScrollTriggerMouseEnter, this)
									.on('mouseleave', this.onScrollTriggerMouseLeave, this);
		}
		if (this.scrollTriggerRightEl) {
			this.scrollTriggerRightEl.on('mouseenter', this.onScrollTriggerMouseEnter, this)
									.on('mouseleave', this.onScrollTriggerMouseLeave, this);
		}

		if (this.useWheelScroll) {
			var wheelEvent = Ext.isGecko ? 'DOMMouseScroll' : 'mousewheel';
			this.element.on(wheelEvent, this.onContainerMousewheel, this);
		}
	},

	unbind : function() {
		this.autoUnbind();
	}
});
