/* eslint-disable complexity */

/**
 *
 * scroller komponens, a normal scrollbar helyett hasznalhato komponens.
 *
 * Hasznalat:
 *
 * var scroll = new ScrollPane({
 *     contentSel: '#message_conversation_content',
 *     useTemplate: true,
 * });
 *
 * A this.element adja meg, mely domelemben akarunk scrollozni.
 * A HTMLnek a kovetkezokeppen kell felepulnie:
 * +--------------------------------------+---+
 * |element                               |s  |
 * | +----------------------------------+ |c  |
 * | | container                        | |r  |
 * | |  +----------------------------+  | |o  |
 * | |  | content                    |  | |l  |
 * | |  |                            |  | |l  |
 * | |  |                            |  | |B  |
 * | |  |  . . . . . . . . . . . . . |  | |a  |
 * | |                                  | |r  |
 * | +----------------------------------+ |El |
 * +--------------------------------------+---+
 *
 * A contentSel megadasa kotelezo, mivel az mondja meg, mely elemet szeretnenk scrollozni.
 *
 * Ketfelekeppen hasznalhato: vagy mar kesz HTML kod mukodesre birasara (amikor a scrollbar is a domban van, csak nem mukodik)
 * illetve ugy is, hogy a komponens maga hozza letre a scrollbart.
 */

import Ext from '../../lib/vendor/ExtCore';
import Chaos from '../../lib/chaos/Chaos';
import ChaosObject from '../../lib/chaos/Object';
import DomHelper from '../../lib/chaos/DomHelper';

/**
 * @param {Object} el       the element
 * @param {Object} config   config object
 */
export default function ScrollPane(el, config) {
	ScrollPane.superclass.constructor.call(this, el, config);
}

// Events
ScrollPane.EVENT_SCROLL = 'scroller-scroll';
ScrollPane.EVENT_SCROLL_TOP = 'scroller-top';
ScrollPane.EVENT_SCROLL_BOTTOM = 'scroller-bottom';
ScrollPane.EVENT_SCROLL_BEFORE_BOTTOM = 'scroller-before-bottom';
ScrollPane.SCROLL_DIRECTION_UP = 'scroll-direction-up';   // wheeldelta:  1
ScrollPane.SCROLL_DIRECTION_DOWN = 'scroll-direction-down'; // wheeldelta: -1

Chaos.extend(ScrollPane, ChaosObject, {

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
	/** @var {Number}       Gorgetes merteke */
	scrollDelta            : 30,
	/** @var {Boolean}      TRUE, ha kezelnie kell a hatter gorgetesenek tiltasat/engedelyezeset is */
	manageBackgroundScroll : true,
	/** @var {Number}       Jelzi, hogy a gordulo tartalom aljahoz kozeledve hany pixellel elobb kell kuldeni az eventet */
	bottomValue            : 0,
	/** {Number}		    A scrollbar minimalis magassaga*/
	minScrollBarHeight     : 25,

	minContentHeight : 0,

	/** PRIVATES */

	/** @var {Object}       Scrollbar elem [Ext.Element] */
	_scrollBarEl             : undefined,
	/** @var {Object}       Kontener elem  [Ext.Element] */
	_containerEl             : undefined,
	/** @var {Object}       Belso tartalom [Ext.Element] */
	_contentEl               : undefined,
	/** @var {Boolean}      TRUE, ha a csuszkat egerrel mozgatva gorgetjuk a tartalmat */
	_isScrollingWithMouse    : true,
	/** @var {Number}       Scrollbar poziciojat tarolja */
	_currentScrollPosition   : 0,
	/** @var {Number}       Y-tengely erteke a csuszka "megfogasakor" */
	_startY                  : 0,
	/** @var {Number}       Top pozicio */
	_topPosition             : 0,
	/** @var {Boolean}      Scrollozas engedelyezesenek/tiltasanak allapotat tarolja */
	_isScrollDisabled        : true,
	/** @var {Boolean}      Tarolja, hogy az adott elem folott van-e az eger [mouseover es mouseout esemeny emulalasakor] */
	_isElementOvered         : false,
	/** @var {Boolean}      Is native slide container mode on? */
	nativeSlideContainerMode : false,
	/** @var {Number}       Height of the element, with the container height will be less */
	relativeElHeight         : 0,
	/** @var {Boolean}      Is it disabled to scroll and fire event after downward scrolling? */
	isDisabledDownWards      : false,

	/**
	 * Init
	 *
	 * @param {obj} el        element
	 * @param {obj} config    configs
	 */
	init : function(el, config) {
		// Tartalmi elemek lementese
		this._containerEl = Ext.get(this.containerId);

		this.updateContainerStyle();

		this._containerEl.scrollTo('top', 0);

		// Tartalom lementese
		this._contentEl = Ext.get(this.contentId);

		// Tartalom overflow beallitasa hiddenre
		this._contentEl.setStyle({ overflow : 'hidden' });

		this._checkContentHeight();

		this.addEvents(
			ScrollPane.EVENT_SCROLL,
			ScrollPane.EVENT_SCROLL_TOP,
			ScrollPane.EVENT_SCROLL_BOTTOM,
			ScrollPane.EVENT_SCROLL_BEFORE_BOTTOM
		);

		// Scroll tiltas
		if (!this.useNativeScroll) {
			this.disableScroll(true);
		}

		// Sajat scrollbar letrehozasa
		this.setScrollBar();

		ScrollPane.superclass.init.call(this, el, config);
	},

	/**
	 * Updates container element style.
	 *
	 * @return void;
	 */
	updateContainerStyle : function() {
		var containerElStyle;

		// Ha a slidercontainer nativ element, akkor nem kell scrollbar es nem allitjuk a szelesseget
		if (this.nativeSlideContainerMode) {
			containerElStyle = {
				'overflow-x' : 'hidden',
				'overflow-y' : 'hidden'
			};
		}
		else {
			containerElStyle = {
				width        : this.element.getWidth() + 17 + 'px',
				'overflow-x' : 'hidden',
				'overflow-y' : 'scroll'
			};
		}

		this._containerEl.setStyle(containerElStyle);
	},

	_checkContentHeight : function() {
		if (this._contentEl.getHeight(true) < this.minContentHeight) {
			this._containerEl.addClass('noBar');
		}
	},

	/**
	 * Letrehozza a sajat scrollbar-t
	 *
	 * @return {Object}   Scrollbar elem
	 */
	setScrollBar : function() {
		var _scrollbarTpl = new Ext.Template(this.tpl);
		this._scrollBarEl = _scrollbarTpl.append(this.element.dom, {
			cls : this.scrollBarClass
		}, true);

		// Aranynak megfelelo magassag beallitasa
		this.setScrollBarHeight();

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
	 * Kiszamolja a lathato magassag es a teljes tartalom magassagabol adodo aranyt
	 */
	getRatio : function() {
		return this._contentEl.dom.scrollHeight !== 0
							? this._containerEl.getHeight() / this._contentEl.dom.scrollHeight
							: this._contentEl.dom.scrollHeight;
	},

	/**
	 * Beallitja a scrollbar magassagat a tartalom magassagatol fuggoen es be is pozicionalja
	 */
	setScrollBarHeight : function() {
		var _newHeight = this._containerEl.getHeight() * this.getRatio();
		// Beallitja a scrollbar magasagat a minimalis magassagra, ha kisebb vagy egyenlo azzal
		_newHeight = _newHeight < this.minScrollBarHeight ? this.minScrollBarHeight : _newHeight;

		this.getScrollBar().setHeight(_newHeight);
		// Pozicio beallitasa
		this.setScrollBarPosition();

		this.isDisabledDownWards = false;
	},

	/**
	 * Lekezeli a scrollozast a container-en
	 * Non-native scrollozas eseten [useNativeScroll: false] tiltja a hatter scrollozasat
	 * Beallitja a scrollbar poziciojat
	 *
	 * @param {obj} ev event
	 *
	 * @return void
	 */
	onContainerScroll : function(ev) {
		// Ha nem lathato a scrollbar, akkor hagyjuk a scrollozast
		if (!this.getScrollBar().isVisible()) {
			return;
		}

		if (!this.useNativeScroll) {
			this.fireEvent(ScrollPane.EVENT_SCROLL, { ev : ev, scope : this });
			var _delta = ev.getWheelDelta(), _scrollTop;
			_scrollTop = (_delta < 0 ? 1 : -1) * this.scrollDelta;
			this._containerEl.dom.scrollTop += _scrollTop;
			// Beallitjuk a jelenlegi scrollozas iranyat
			this.setScrollDirection(ev);
			// Leellenorzi, hogy elertuk-e a tetejet vagy az aljat
			this.checkEdges();
			ev.preventDefault();
		}
		// Pozicio beallitasa
		this.setScrollBarPosition();
		// Scroll event kuldese
		this.fireEvent(ScrollPane.EVENT_SCROLL, { ev : ev, scope : this });
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
		if (this.useNativeScroll) {
			this.fireEvent(ScrollPane.EVENT_SCROLL, { ev : ev, scope : this });
			// Beallitjuk a jelenlegi scrollozas iranyat
			this.setScrollDirection(ev);
			// Leellenorzi, hogy elertuk-e a tetejet vagy az aljat
			this.checkEdges();
		}
	},

	/**
	 * Beallitja a scrollbar poziciojat
	 *
	 * @return void
	 */
	setScrollBarPosition : function() {
		var _position = this._containerEl.dom.scrollTop / this.getContentHeight(),
			_scrollPosition = _position * this.getBoxHeight();

		this.getScrollBar().setStyle('top', Math.round(_scrollPosition) + 'px');
		if (!this._isScrollingWithMouse) {
			this._currentScrollPosition = _scrollPosition;
		}
	},

	/**
	 * Kiszamolja a kontener pillanatnyi magassagat
	 *
	 * @return {Number}   Kontener magassaga
	 */
	getContentHeight : function() {
		var scrollHeight = Ext.isGecko
			? this._containerEl.dom.scrollHeight + this._containerEl.getPadding('tb')
			: this._containerEl.dom.scrollHeight;

		return scrollHeight - this._containerEl.getHeight();
	},


	/**
	 * Lekezeli a scrollbar-on torteno mousedown esemenyt
	 *
	 * @param {obj} ev event
	 *
	 */
	onScrollBarMouseDown : function(ev) {
		this._startY = ev.browserEvent.clientY;
		this._isScrollingWithMouse = true;
		var _position = this._containerEl.dom.scrollTop / this.getContentHeight(),
			_scrollPosition = _position * this.getBoxHeight();
		this._currentScrollPosition = _scrollPosition;

		Ext.getBody().on('mousemove', this.onMouseMove, this);
		Ext.getBody().on('mouseup', this.onMouseUp, this);
		// tiltjuk a kijeloleseket amig scroll van
		this.disableSelect();
		return false;
	},

	/**
	 * Scrollbar elemen tortent mouseover esemeny kezeloje
	 *
	 * @return void
	 */
	onScrollBarMouseOver : function() {
		if (!this._isScrollDisabled) {
			this.disableScroll(true);
		}
	},

	/**
	 * Scrollbar elemen tortent mouseout esemeny kezeloje
	 *
	 * @return void
	 */
	onScrollBarMouseOut : function() {
		if (this._isScrollDisabled) {
			this.disableScroll(false);
		}
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
			var _scrollPosition = ev.browserEvent.clientY - this._startY + this._currentScrollPosition;
			var contentPosition = _scrollPosition / this.getBoxHeight();
			this._containerEl.scrollTo('top', Math.round(this.getContentHeight() * contentPosition));
			if (!this.useNativeScroll) {
				this.setScrollBarPosition();
			}
			this.setScrollDirection(ev);
			this.checkEdges();
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
			Math.ceil(this._containerEl.dom.scrollTop / this.getContentHeight() * this.getBoxHeight());
		this._isScrollingWithMouse = false;
		// engedelyezzuk a kijeloleseket
		this.enableSelect();
	},

	/**
	 * Visszaadja a box magassagat
	 *
	 * @return {Number}   Box magassaga
	 */
	getBoxHeight : function() {
		if (this.element && this._scrollBarEl) {
			return this.element.getHeight() - this._scrollBarEl.getHeight();
		}
		return 0;
	},

	/**
	 * Leellenorzi, hogy elertuk-e a scrollozassal a tartalom tetejet vagy aljat es ha igen, akkor esemenyt dob rola.
	 *
	 * @return {Boolean}   TRUE, ha elertuk a kontener aljat vagy tetejet
	 */
	checkEdges : function() {
		if (this.bottomValue && this._containerEl.dom.scrollTop > this.getContentHeight() - this.bottomValue) {
			// Leellenorzi, hogy elertuk-e a tetejet vagy az aljat
			if (this.getScrollDirection() === ScrollPane.SCROLL_DIRECTION_UP) {
				this.fireEvent(ScrollPane.EVENT_SCROLL_TOP, { scope : this });
				return true;
			}
			this.fireEvent(ScrollPane.EVENT_SCROLL_BOTTOM, { scope : this });
			return true;
		}
		else if (!this.isDisabledDownWards
					&& (this._containerEl.dom.scrollTop >= this.getContentHeight() - this.relativeElHeight
					&& this.getScrollDirection() === ScrollPane.SCROLL_DIRECTION_DOWN)) {
			this.fireEvent(ScrollPane.EVENT_SCROLL_BEFORE_BOTTOM, { scope : this });
			this.isDisabledDownWards = true;
		}
		else if (this._containerEl.dom.scrollTop === this.getContentHeight()
					&& this.getScrollDirection() === ScrollPane.SCROLL_DIRECTION_DOWN
					|| this._containerEl.dom.scrollTop === 0
					&& this.getScrollDirection() === ScrollPane.SCROLL_DIRECTION_UP) {
			// Ha a container tetejere vagy aljara gorgettunk, akkor letiltjuk a tovabbi gorgetest, hogy a hatter
			// ne mozduljon el
			if (!this._isScrollDisabled) {
				this.disableScroll(true);
			}
			if (this.getScrollDirection() === ScrollPane.SCROLL_DIRECTION_UP) {
				this.fireEvent(ScrollPane.EVENT_SCROLL_TOP, { scope : this });
				return true;
			}
			this.fireEvent(ScrollPane.EVENT_SCROLL_BOTTOM, { scope : this });
			return true;
		}
		else if (this._isScrollDisabled) {
			this.disableScroll(false);
		}
		return false;
	},

	/**
	 * Beallitja a viszonyitott magassagot
	 *
	 * @param {Number} val   Magassag erteke px-ben
	 *
	 * @return {Ext.Element}   Viszonyitott magassag
	 */
	setRelativeHeight : function(val) {
		if (!val && typeof val !== 'number') {
			return;
		}
		return this.relativeElHeight = val;
	},

	/**
	 * Letarolja a scrollozas pillanatnyi iranyat
	 *
	 * @param {obj} ev   A scrollozas pillanatnyi iranya
	 *
	 * @return {String}   A scrollozas iranya
	 */
	setScrollDirection : function(ev) {
		var _dir = ev.getWheelDelta() === 1 ?
			ScrollPane.SCROLL_DIRECTION_UP : ScrollPane.SCROLL_DIRECTION_DOWN;
		if (this.getScrollDirection() !== _dir) {
			this._scrollDirection = _dir;
		}
		return this._scrollDirection;
	},

	/**
	 * Visszaadja a scrollozas utolso ismert iranyat
	 *
	 * @return {String}   A scrollozas iranya
	 */
	getScrollDirection : function() {
		return this._scrollDirection;
	},

	/**
	 * Letiltja a scrollbar altal mukodtetett elemben es a body elemben a kijelolest es drag-et.
	 * Ha a scrollbar-t mozgatjuk, a mellette levo szoveg kijelolodik, ami nem megfelelo
	 * latvanyt eredmenyez.
	 *
	 * @return void
	 */
	disableSelect : function() {
		Ext.getBody().addClass('noselect');
		var html = Ext.get(document.getElementsByTagName('html')[0]);

		html.on('dragstart', function(ev) {ev.preventDefault(); return false});

		DomHelper.disableSelect(Ext.getBody().dom);
		DomHelper.disableSelect(this.element.dom);
	},

	/**
	 * Engedelyezi a scrollbar altal mukodtetett elemben es a body elemben a kijelolest,
	 * drag-et
	 *
	 * @return void
	 */
	enableSelect : function() {
		Ext.getBody().removeClass('noselect');
		var html = Ext.get(document.getElementsByTagName('html')[0]);

		html.un('dragstart', function(ev) {ev.preventDefault(); return false});

		DomHelper.enableSelect(Ext.getBody().dom);
		DomHelper.enableSelect(this.element.dom);
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
			// Ha nincs letiltva, akkor ilyenkor letiltjuk a scroll-t
			if (!this._isScrollDisabled) {
				this.disableScroll(true);
			}
		}
	},

	/**
	 * window.resize esemenykezelo
	 *
	 * @return void
	 */
	onWindowResize : function() {
		this.setScrollBarHeight();
	},

	/**
	 * Tiltja/engedelyezi az oldalon a scrollozast
	 *
	 * @param {Boolean} disable   Tiltas/engedelyezes
	 *
	 * @return void
	 */
	disableScroll : function(disable) {
		if (typeof disable === 'boolean' && this.manageBackgroundScroll) {
			this._isScrollDisabled = disable;
		}
	},

	bind : function() {
		ScrollPane.superclass.bind.call(this);

		var wheelEvent = Ext.isGecko ? 'DOMMouseScroll' : 'mousewheel';

		if (this.useNativeScroll) {
			this._containerEl.on('scroll', this.onContainerScroll, this);
			this._containerEl.on(wheelEvent, this.onContainerMousewheel, this);
		}
		else {
			this._containerEl.on(wheelEvent, this.onContainerScroll, this);
		}

		this.getScrollBar()
			.on('mousedown', this.onScrollBarMouseDown, this)
			.on('mouseover', this.onScrollBarMouseOver, this)
			.on('mouseout', this.onScrollBarMouseOut, this);

		Ext.getBody().on('mouseup', this.onBodyMouseUp, this);
		Ext.get(document).on('mousemove', this.onDocumentMouseMove, this);
		Ext.fly(window).on('resize', this.onWindowResize, this);
	},

	unbind : function() {
		ScrollPane.superclass.unbind.call(this);

		var wheelEvent = Ext.isGecko ? 'DOMMouseScroll' : 'mousewheel';

		if (this.useNativeScroll) {
			this._containerEl.un('scroll', this.onContainerScroll, this);
			this._containerEl.un(wheelEvent, this.onContainerMousewheel, this);
		}
		else {
			this._containerEl.un(wheelEvent, this.onContainerScroll, this);
		}

		this.disableScroll(false);

		Ext.get(document).un('mousemove', this.onDocumentMouseMove, this);
		this.getScrollBar().un('mousedown', this.onScrollBarMouseDown, this);
		Ext.getBody().un('mouseup', this.onBodyMouseUp, this);
	}
});
