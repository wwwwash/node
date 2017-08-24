import Ext from '../../lib/vendor/ExtCore';
import Chaos from '../../lib/chaos/Chaos';
import ChaosObject from '../../lib/chaos/Object';

/**
 *
 * ScrollPane komponens, a normal scrollbar helyett hasznalhato komponens.
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
 * | | contentEl                        | |r  |
 * | |                                  | |o  |
 * | |                                  | |l  |
 * | |                                  | |l  |
 * | |                                  | |B  |
 * | |                                  | |a  |
 * | |                                  | |r  |
 * | +----------------------------------+ |El |
 * +--------------------------------------+---+
 *
 * A contentSel megadasa kotelezo, mivel az mondja meg, mely elemet szeretnenk scrollozni.
 *
 * Ketfelekeppen hasznalhato: vagy mar kesz HTML kod mukodesre birasara (amikor a scrollbar is a domban van, csak nem mukodik)
 * illetve ugy is, hogy a komponens maga hozza letre a scrollbart.
 *
 *
 * @param Object el       the element
 * @param Object config   config object
 */
export default function ChannelScrollPane(el, config) {
	ChannelScrollPane.superclass.constructor.call(this, el, config);
}

ChannelScrollPane.EVENT_MOUSEWHEEL = 'scrollpane-mousewheel';
ChannelScrollPane.EVENT_SCROLLEND = 'scrollpane-scrollend';

Chaos.extend(ChannelScrollPane, ChaosObject, {

	/** @var {Number}              Scroll width in pixels */
	width              : 14,
	/** @var {Boolean}             Igaz, ha scroll elem nem szerepel meg a DOM-ban */
	useTemplate        : true,
    /** @var {String}              A mozgathato scrollbar kontenerenek selectora*/
	scrollPaneSel      : '.scroll-pane',
	/** @var {String}              A mozgathato scrollbar selectora*/
	scrollBarSel       : '.scrollbar',
	/** @var {String}              A belso tartalmat tarolo elem szelektora ()  */
	contentSel         : '#content',
	/** @var {Object}              Ha szukseges, a template ezekkel a parameterekkel feltoltheto */
	templateParams     : { },
	/** @var {Number}              Ha nem szamolhato ki a magassag, akkor ez lesz a scrollbar erteke */
	defaultHeight      : 30,
	/** @var {Boolean}             Igaz, ha mouseout esemenyre el kell tunnie a scrollbarnak */
	hideOnMouseout     : true,
	/** @var {Number}              Az ido mp-ben, ami utan eltunik a scrollbar, miutan levituk az elementrol */
	hideDelayTime      : 500,
	/** @var {Number}              Mennyi ideig tart a megjelenites */
	showDuration       : 0.2,
	/** @var {Number}              Mennyi ideig tart az elrejtes */
	hideDuration       : 0,
	/** @var {Number}              Mennyivel pozicionalja lejebb/feljebb a scroll-t gorgetesre */
	scrollDelta        : 15,
	/** {Boolean}                  Igaz, ha automatikusan elrejtuk a scrollBar-t */
	isAutoHide         : true,
	/** {Boolean}                  Igaz, ha ujra kell meretezni a magassagot */
	isSetHeight        : false,
	/** {Boolean}                  Igaz, ha nem kell meretezni a magassagot ujboli scrollbar megjeleneskor */
	disabledSetHeight  : false,
	/** {Boolean}                  Igaz, ha engedelyezve van a scrollBar animalasa, IE-8 miatt szukseges */
	isAnimateScrollBar : true,
	/** {Number}				   A scrollbar minimalis magassaga*/
	minScrollBarHeight : 25,

	/* PRIVATE VARS */

	/** @var {Number}              Current position of the scroll */
	_scrollPos   : 0,
	/** @var {Boolean}             True, if mouse button was pressed on the scrollbar, false otherwise */
	_isMoving    : false,
	/** @var {Ext.Element}         Az egesz scollbar-t tartalmazo elem (teljes jobb oldali fuggoleges resz + benne) */
	_scrollEl    : null,
	/** @var {Ext.Element}         A mozgathato scrollbar elem */
	_scrollBarEl : null,
	/** @var {String}              A scrollbar template-je */
	_templateSrc :
		`<div class="scroll-pane" style="display: block; position: absolute; padding: 6px 0; right: 9px; top: 0; width: 6px; z-index: 10;">
			<div class="scrollbar" style="-moz-transition: all 25ms ease 0s; background-clip: content-box;">
			</div>
		</div>`,

	/**
	 * Init: inicializalja a komponenst
	 */
	init : function(el, config) {
		this.element.setStyle({
			position : 'relative',
			overflow : 'hidden'
		});

		// Ha hasznalunk templatet es meg nincs a DOM-ban, akkor a _scrollEl lesz az
		if (this.useTemplate && !this.element.child(this.scrollPaneSel)) {
			// letrehozunk egy template-et
			this.tmpObj = new Ext.Template(this._templateSrc);
			/** Ext.Element _scrollEl    tartalmazza a templatebol letrehozott html elemet */
			this._scrollEl = this.tmpObj.append(this.element, this.templateParams, true);
		}
		else {
			// ha nem templateet hasznalunk, akkor a scrollPaneSel altal kivalasztott elso elem lesz a scroll
			this._scrollEl = this.element.child(this.scrollPaneSel);
		}
		this.addEvents(
			ChannelScrollPane.EVENT_MOUSEWHEEL,
			ChannelScrollPane.EVENT_SCROLLEND
		);

		if (this.isScrollNeeded) {
			// csak az elso elemet nezzuk
			this.contentEl = this.element.child(this.contentSel);
			// a scrollPane-en belul van a scrollbar, ezt lehet huzogatni
			this._scrollBarEl = this._scrollEl.child(this.scrollBarSel);

			if (!this.hideOnMouseout) {
				this.show(this.showDuration);
			}

			// kiszamoljuk a magassagat
			new Ext.util.DelayedTask(function () {
				this.setHeight(this.computeHeight());
			}, this).delay(50);

			//idozito task az elrejteshez
			this.hideTask = new Ext.util.DelayedTask(this.onScrollHide, this);
		}
		this._scrollEl.setStyle({
			position : 'absolute',
			height   : this.element.getHeight() - this._scrollEl.getPadding('tb') + 'px' // a scroll meretenek meghatarozas
		});


		ChannelScrollPane.superclass.init.call(this, el, config);
	},

	/**
	 * Eger gomb lenyomas esemenykezelo. A scrollozas kezdetet iranyitja. Ha a csuszkara klikkeltunk,
	 * akkor ezutan huzhato lesz (_isMoving= true), kulonben beallitja a csuszka poziciojat.
	 *
	 * @param Ext.EventObject  ev      Az esemeny objektum
	 * @param DOMElement       target  Az elem, amin keletkezett az esemeny
	 *
	 * @return undefined
	 */
	onScrollMouseDown : function(ev) {
		this.startMouseY = ev.getXY()[1];
		this.startScrollPos = this.getScrollPos();

		var offsetPos = this.startMouseY - this.element.getY();

		if (offsetPos > this._scrollPos &&
			offsetPos < this._scrollPos + this.height) { } // eslint-disable-line
		else {
			this.setScrollPos(offsetPos - this.height / 2);
			this.startScrollPos = this.getScrollPos();
		}
		this._isMoving = true;
		// tiltjuk a kijeloleseket amig scroll van
		this.disableSelect();
	},

	/**
	 * Mouseup esemeny: A huzas vege.
	 *
	 * @param Ext.EventObject  ev      Az esemeny objektum
	 * @param DOMElement       target  Az elem, amin keletkezett az esemeny
	 *
	 * @return undefined
	 */
	onScrollMouseUp : function() {
		// nem mozog tovabb
		this._isMoving = false;
		// ujra lehet kijelolni
		this.enableSelect();
	},
	/**
	 * Eger mozgatas. Csak akkor csinalunk valamit, ha az _isMoving true (le van nyomva az egergomb)
	 * Mozgataskor frissitjuk a scroll poziciojat (es ezzel egyutt a tartalom helyzetet is)
	 *
	 * @param Ext.EventObject  ev      Az esemeny objektum
	 * @param DOMElement       target  Az elem, amin keletkezett az esemeny
	 *
	 * @return undefined
	 */
	onScrollMouseMove : function(ev) {
		// ha nem volt lenyomva az egergomb, akkor kilepunk
		if (!this._isMoving) {
			return;
		}

		if (this.isSetHeight) {
			this.computeHeight();
		}

		// lekerdezzuk, hol allunk
		var offsetPos = ev.getXY()[1] - this.startMouseY + this.startScrollPos;

		// beallitjuk az uj poziciot
		this.setScrollPos(offsetPos);

		ev.preventDefault();
		ev.stopPropagation();
	},

	/**
	 * Beallitja a scrollbar poziciojat, valamint a tartalom helyzetet is. Amennyiben kivul esik a
	 * lehetseges ertekhataron, akkor a legkozelebbi hatarra allitja
	 *
	 * @param Number _scrollPos   A csuszka beallitando helyzete pixelben a scrollbar tetejehez kepest
	 *
	 */
	setScrollPos : function(_scrollPos) {
		/** @var realInterval: az intervallum, amit felvehet a _scrollPos erteke */
		var realInterval = this.frameHeight - this.height - this._scrollEl.getPadding('b');

		_scrollPos = _scrollPos < 0 ? 0 : _scrollPos > realInterval ? realInterval : _scrollPos; // eslint-disable-line
		this._scrollPos = _scrollPos;
		this.contentEl.dom.style.position = 'absolute';
		// a tartalom pozicionalasa
		this.element.scrollTo('top', Math.round(_scrollPos / realInterval * (this.canvasHeight - this.frameHeight)));
		// a scroll pozicionalasa
		this._scrollEl.setTop(this.element.dom.scrollTop);
		// a scrollbar pozicionalasa
		this._scrollBarEl.dom.style.marginTop = Math.round(_scrollPos) + 'px';

		// the following code makes the scrollbar move as smooth as the original one
		var tmp = document.createElement('div');
		this.element.dom.appendChild(tmp);

		tmp.innerHTML = Math.random();
		tmp.parentNode.removeChild(tmp);

		// Ha elertuk a gorgetheto tartalom aljat, akkor errol dobunk egy esemenyt
		if (_scrollPos >= realInterval) {
			this.fireEvent(ChannelScrollPane.EVENT_SCROLLEND, { scope : this });
		}
	},

	/**
	 * Visszaadja a scrollbar aktualis allapotat.
	 *
	 * @return Number
	 */
	getScrollPos : function() {
		return this._scrollPos;
	},

	/**
	 * Igazat ad vissza, ha a tartalom magasabb mint a hozza tartozo kontener, es
	 * szukseg van a scrollbarra.
	 *
	 * @return Boolean
	 */
	isScrollNeeded : function() {
		return this.element.getHeight() < this.contentEl.getHeight();
	},

	/**
	 * A tartalom aljara pozicionalja a scrollt.
	 */
	scrollToBottom : function() {
		this.setScrollPos(this.canvasHeight - this.frameHeight);
	},

	/**
	 * Kiszamolja a csuszka magassagat valamint eltarolja a tartalom es a megjelenito ablak
	 * magassagat
	 */
	computeHeight : function() {
		// a keret magassaga, amiben a tartalmat jelenitjuk meg
		this.frameHeight = this.element.getHeight() - this._scrollEl.getPadding('b');
		// a tartalom magassaga
		this.canvasHeight = this.contentEl.getHeight();
		// ha valamelyik nem lekerdezheto (akarmiert) akkor a default ereteket adjuk
		// (valsz hibas mukodeshez vezet)
		if (parseInt(this.frameHeight, 10) === 0 || parseInt(this.canvasHeight, 10) === 0) {
			return this.defaultHeight;
		}

		var ratio = this.frameHeight / this.canvasHeight;
		return this.frameHeight * ratio;
	},

	/**
	 * beallitja a csuszka magassagat.
	 *
	 * @param Number
	 */
	setHeight : function(value) {
		var _newHeight = Math.round(value);
		// Beallitja a scrollbar magasagat a minimalis magassagra, ha kisebb vagy egyenlo azzal
		_newHeight = _newHeight < this.minScrollBarHeight ? this.minScrollBarHeight : _newHeight;
		this.height = _newHeight;
		this._scrollBarEl.setHeight(_newHeight);
	},

	/**
	 * Megjeleniti a scrollBar-t
	 *
	 * @return undefined
	 */
	show : function() {
		this._scrollEl.stopFx();

		if (!this.disabledSetHeight) {
			this.setHeight(this.computeHeight());
		}
		// Ha maga a kontener tarolo nagyobb, mint az uzeneteket tarolo tartalom kontener,
		// akkor nem jelenitjuk meg a scrollBart
		if (this.frameHeight > this.canvasHeight) {
			this._scrollEl.hide();
		}
		else {
			this._scrollEl.show();
		}
		// csak akkor lesz animacio ha nem nulla a duration
		if (this.showDuration !== 0) {
			this._scrollEl.animate({ opacity : { from : 0, to : 1 } }, this.showDuration);
			// IE8-ban nem jelenetit meg a csuszkat, ezert kell bele, ha engedelyezve van
			if (this.isAnimateScrollBar) {
				this._scrollBarEl.animate({ opacity : { from : 0, to : 1 } }, this.showDuration);
			}
		}

		// scroll poziciojanak kiszamitasa, a tartalom pozicioja alapjan
		var pos = Math.round((this.frameHeight - this.height - this._scrollEl.getPadding('b'))
			* (this.element.dom.scrollTop / (this.canvasHeight - this.frameHeight)));
		this.setScrollPos(pos);
	},

	/**
	 * Elrejti a scrollbar-t
	 */
	hide : function() {
		this.disabledSetHeight = this.isSetHeight;

		//szinten ie8 miatt kell bele, ha nincs benne akkor body leave-re villan egyet a csuszka
		if (this._scrollEl.isVisible()) {
			if (this.hideDuration > 0) {
				this._scrollEl.animate({ duration : this.hideDuration, opacity : { from : 1, to : 0 } });
			}
			else {
				this._scrollEl.hide();
			}
			// IE8-ban nem jelenetit meg a csuszkat, ezert kell bele, ha engedelyezve van
			if (this.isAnimateScrollBar) {
				this._scrollBarEl.animate({ duration : this.hideDuration, opacity : { from : 1, to : 0 } });
			}
		}
	},

	/**
	 * Esemenykezelo,
	 */
	onScrollHide : function() {
		this.hide();
	},

	/**
	 * Megjeleniti a scroolbar-t, ha el volt inditva a elrejto timer, akkor azt leallitja
	 */
	onMouseEnter : function() {
		if (this.hideOnMouseout) {
			this.hideTask.cancel();
			this.show(this.showDuration);
		}
	},

	/**
	 * A scrollbar elhagyasa esemenykezelo: ha mozgunk, akkor semmit nem csinal,
	 * egyebkent leallitja az elozo hide taskot, es indit egy ujat.
	 */
	onMouseLeave : function() {
		if (!this._isMoving && this.hideOnMouseout) {
			this.hideTask.cancel();
			this.hideTask.delay(this.hideDelayTime);
		}
	},

	/**
	 * Bodyrol valo elmozgas esemenykezeloje.
	 * Abban az esetben, ha a document.bodyrol mozgunk el (elhagyjuk az ablakot) szinten le kell futtatni
	 * a mouseleave fv-t, mivel elofordulhat, hogy ha ez nem tortenik meg, akkor a scrollbar nem rejtodik el.
	 */
	onBodyMouseLeave : function(ev, target) {
		this.onMouseLeave(ev, target);
	},

	/**
	 * Letiltja a scrollbar altal mukodtetett elemben es a body elemben a kijelolest es drag-et.
	 * Ha a scrollbar-t mozgatjuk, a mellette levo szoveg kijelolodik, ami nem megfelelo
	 * latvanyt eredmenyez.
	 *
	 * @return void
	 */
	disableSelect : function() {
		var html = Ext.get(document.getElementsByTagName('html')[0]);

		html
			.on('dragstart', function(ev) {console.info('dragStart'); ev.preventDefault(); return false})
			.on('selectstart', function(ev) {console.info('selectStart'); ev.preventDefault(); return false});

		Ext.DomHelper.disableSelect(Ext.getBody().dom);
		Ext.DomHelper.disableSelect(this.element.dom);
	},

	/**
	 * Engedelyezi a scrollbar altal mukodtetett elemben es a body elemben a kijelolest,
	 * drag-et
	 *
	 * @return void
	 */
	enableSelect : function() {
		var html = Ext.get(document.getElementsByTagName('html')[0]);

		html
			.un('dragstart', this.onDragStart, this)
			.un('selectstart', this.onSelectStart, this);

		Ext.DomHelper.enableSelect(Ext.getBody().dom);
		Ext.DomHelper.enableSelect(this.element.dom);
	},

	/**
	 * Prevents default mechanism of dragstart
	 *
	 * @param {object} ev
	 * @returns {boolean}
	 */
	onDragStart : function(ev) {
		ev.preventDefault();
		return false;
	},

	/**
	 * Prevents default mechanism of selectstart
	 *
	 * @param {object} ev
	 * @returns {boolean}
	 */
	onSelectStart : function(ev) {
		ev.preventDefault();
		return false;
	},

	/**
	 * Eger scrollra torteno pozicionalas
	 *
	 * @param Ext.EventObject  ev       Az esemeny objektum
	 *
	 * @return undefined
	 */
	onMouseWheel : function(ev) {
		ev.preventDefault();

		if (this.isSetHeight) {
			this.setHeight(this.computeHeight());
		}
		var pos = Math.round((this.frameHeight - this.height - this._scrollEl.getPadding('b'))
			* (this.element.dom.scrollTop / (this.canvasHeight - this.frameHeight)));

		if (ev.getWheelDelta() > 0) {
			this.setScrollPos(pos - this.scrollDelta);
		}
		else if (ev.getWheelDelta() < 0) {
			this.setScrollPos(pos + this.scrollDelta);
		}

		this.fireEvent(ChannelScrollPane.EVENT_MOUSEWHEEL, { scope : this, ev : ev, pos : pos });
	},

	/**
	 * Kiszamolja a magassagot ujra, ha atmeretezzuk az ablakot
	 */
	onWindowResize : function() {
		new Ext.util.DelayedTask(function () {
			this.setHeight(this.computeHeight());
		}, this).delay(50);
	},

	/**
	 * esemeny rakotesek
	 */
	bind : function() {
		this.element
			.on('mouseenter', this.onMouseEnter, this)
			.on('mouseleave', this.onMouseLeave, this);

		this.element.on('mousewheel', this.onMouseWheel, this);

		this._scrollEl.on('mousedown', this.onScrollMouseDown, this);

		Ext.getBody()
			.on('mouseup', this.onScrollMouseUp, this)
			.on('mousemove', this.onScrollMouseMove, this)
			.on('mouseleave', this.onBodyMouseLeave, this);

		Ext.fly(window).on('resize', this.onWindowResize, this);
	},

	unbind : function() {
		this.element
			.un('mouseenter', this.onMouseEnter, this)
			.un('mouseleave', this.onMouseLeave, this);

		if (Ext.isGecko) {
			this.element.un('DOMMouseScroll', this.onMouseWheel, this);
		}
		else {
			this.element.un('mousewheel', this.onMouseWheel, this);
		}

		this._scrollEl.un('mousedown', this.onScrollMouseDown, this);

		Ext.getBody()
			.un('mouseup', this.onScrollMouseUp, this)
			.un('mousemove', this.onScrollMouseMove, this)
			.un('mouseleave', this.onBodyMouseLeave, this);

		Ext.fly(window).un('resize', this.onWindowResize, this);
	}
});

