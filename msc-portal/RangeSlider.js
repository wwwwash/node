/* eslint-disable no-nested-ternary */
/* eslint-disable complexity */
/* eslint-disable max-statements */
/* eslint-disable max-depth */

import CONST from '../../lib/constant/Constants';

import Ext from '../../lib/vendor/ExtCore';
import Chaos from '../../lib/chaos/Chaos';
import ChaosObject from '../../lib/chaos/Object';
import Config from '../../lib/chaos/Config';
import Connection from '../../lib/chaos/Connection';

import { InitRiot } from '../App/App';

import './RangeSlider.scss';

/**
 * RangeSlider
 *
 * Improve lehetosegek:
 * - a this.rangeBeginLeft automatikusan legyen megallapitva vagy korrigalva legyen css-el
 * - Folyamatos csuszka modban a csuszka left css erteket irja ki az input hiddenbe. Ezt lehetne allithatova tenni.
 * - Folyamatos csuszka mod nincsen kiprobalva !!!
 * - mouseup korrekcio -t tesztelni
 */

export default function RangeSlider(el, config) {
	RangeSlider.superclass.constructor.call(this, el, config);
}

// Custom Event
RangeSlider.ON_SAVE = 'on-save';

Chaos.extend(RangeSlider, ChaosObject, {

	/** @var {Boolean} steppedSlide				 Ha true, akkor lepesrol lepesre lehet csusztatni, ha false akkor folyamatos csuszas van */
	steppedSlide             : true,
	/** @var {Number} sliderMinBeginValue	     A csuszka min ertek alapbeallitasa */
	sliderMinBeginValue      : 0,
	/** @var {Number} sliderMaxBeginValue	     A csuszka max ertek alapbeallitasa */
	sliderMaxBeginValue      : 1,
	/** @var {Number} sliderElementAmount	     A csuszka elemeinek a szama */
	sliderElementAmount      : 1,
	/** @var {String} tickerSel	     			 A csuszkak kozos szelektora */
	tickerSel                : 'periodSliderLineEnd',
	/** @var {String} sliderTrackId	     		 A csuszkak hattere, azaz a csuszka-palya ID-je */
	sliderTrackCls           : 'periodSliderBg',
	/** @var {Number} sliderTrackWidth     		 A csuszka teljes szelessege */
	sliderTrackWidth         : 0,
	/** @var {String} secondLineId	     	     A masodik sor Id-je. Ez a sor tartalmazza az ertekeket kijelzo listat. */
	secondLineCls            : 'periodSliderSecondline',
	/** @var {String} secondLineId	     	     A masodik soron belul a listaelemek szelektora */
	secondLineChildSel       : 'li',
	/** @var {Boolean} needThirdLine	     	 Generaljunk-e harmadik sort. */
	needThirdLine            : true,
	/** @var {Boolean} noRange   	     	     Nem range slider, Ha nem range slidert akarunk csak egypines csuszkat, akkor true */
	noRange                  : false,
	/** @var {String} thirdLineId	     	     A harmadik sor, a szamok alatti info (napok) listajanak ID-je */
	thirdLineCls             : 'periodSliderThirdline',
	/** @var {String} thirdLineChildSel	     	 A harmadik sor listaelemeinek szelektora */
	thirdLineChildSel        : 'li',
	/** @var {String} visibleDayCls              A harmadik sor listaelemeinek a csuszkahoz tartozo show class-a */
	visibleDayCls            : 'visibleDay',
	/** @var {String} selectedId	     	     A kijeloles jelzo sav ID-je */
	sliderLineCls            : 'periodSliderLine',
	/** @var {String} inputMinSel	     	     A Min erteket tarolo input mezo szelektora */
	inputMinSel              : 'input[name=min]',
	/** @var {String} inputMaxSel	     	     A Max erteket tarolo input mezo szelektora */
	inputMaxSel              : 'input[name=max]',
	/** @var {String} saveRoute	     	         A csusztatast koveto ajax keres Route-ja */
	saveRoute                : 'BroadcasterCenter/GetSummary',
	/** @var {String} enableIntegratedSave	     Hasznaljuk-e a beepitett save metodust, vagy sajatot akarunk irni */
	enableIntegratedSave     : true,
	/** @var {Boolean} noSave	                 Mentes teljes kikapcsolasa, csak a hidden mezok ertekeit frissiti */
	noSave                   : false,
	/** @var {String} mouseUpCheckInterval	     Ennyi millisecundum-onkent ellenorizze, hogy felengedtuk-e az egergombot */
	mouseUpCheckInterval     : 3000,
	/** @var {String} periodStartTextCls	     A periodus kezdo szoveg dobozanak classa */
	periodStartTextCls       : '.periodStartText',
	/** @var {String} periodEndTextCls	         A periodus vege szoveg dobozanak classa */
	periodEndTextCls         : '.periodEndText',
	/** @var {Number} periodMinWidth	         A periodus min szelessege. Ha a stepWidth ennel kisebb, akkor elkezdi elrejteni az elemeket hogy ne surusudjenek be a slider feliratai.*/
	periodMinWidth           : 30,
	/** @var {Number} sliderFirstElement	     A slider elso elemenek erteke */
	sliderFirstElement       : 1,
	/** @var {String} saveUrl	                 Ajaxos elmentes eseten a cim ahova az adatot kuldi a slider */
	saveUrl                  : undefined,
    /** @var {Bool} isOverlayRefreshEnabled      Overlayes ujratoltes uj ertek eseten*/
	isOverlayRefreshEnabled  : false,
    /** @var {Bool} isPageRefreshEnabled	     Oldal ujratoltes uj ertek eseten*/
	isPageRefreshEnabled     : false,
    /** @var {Obj} integratedSaveCallbackFn	     Ajax valaszt koveto helyi mukodesek megvalositasara callback*/
	integratedSaveCallbackFn : undefined,
	/** @var {String} bodyLoadingCls             Az egesz body-n mukodo loading cursort eloidezo class */
	bodyLoadingCls           : 'loading',
	/** @var {String} lineRoundedCls             A csuszkavonal elejenek kerekseget allito class */
	lineRoundedCls           : 'rnded',
	/** @var {String} overlayContainerId         Oeverlay container id */
	overlayContainerId       : 'overlayContainer',
	/** @var {String} pageContainerId            Page container Id */
	pageContainerId          : 'pageContainer',

	/** --- PRIVATES --- **/

	/** @var {Boolean} _slidingInProgress	    Ebben taroljuk, hogy eppen csusztatas alatt van-e a slider vagy nem */
	_slidingInProgress      : false,
	/** @var {Object} _secondLineEl	            A masodik sor. Ez a sor tartalmazza az ertekeket kijelzo listat */
	_secondLineEl           : undefined,
	/** @var {Object} _secondLineEl	            A harmadik sor, a szamok alatti info (napok) listaja */
	_thirdLineEl            : undefined,
	/** @var {Object} _secondLineEl	            A masodik soron belul a listaelemek */
	_secondLineChildEls     : undefined,
	/** @var {Object} _thirdLineChildEls        A harmadik sor listaelemei */
	_thirdLineChildEls      : undefined,
	/** @var {Object} _selectedEl               A kijeloles jelzo sav */
	_selectedEl             : undefined,
	/** @var {Object} _sliderEl                 A csuszka */
	_sliderEl               : undefined,
	/** @var {Object} _inputMinEl               A Min erteket tarolo input mezo */
	_inputMinEl             : undefined,
	/** @var {Object} _inputMaxEl               A Max erteket tarolo input mezo */
	_inputMaxEl             : undefined,
	/** @var {Object} _mouseDown                Azt tarolja , hogy le van-e nyomva az egergomb vagy nem */
	_mouseDown              : false,
	/** @var {Object} _tickerElement	        A csuszkakat tartalmazo objektum */
	_tickerElements         : undefined,
	/** @var {Number} _maxSliderPos	            Letarolja a max slider left helyzetet */
	_maxSliderPos           : 0,
	/** @var {Number} _minSliderPos	            Letarolja a min slider left helyzetet */
	_minSliderPos           : 0,
	/** @var {Number} _stepWidth				Ez egy lepes szelessege  */
	_stepWidth              : undefined,
	/** @var {string} _dataPeriod               A stathoz tartozo ido periodus (2 hetes) select ID-ja */
	_dataPeriod             : 'input[name=period]',
	/** @var {string} _dataYear                 A stathoz tartozo ev select ID-ja */
	_dataYear               : 'input[name=periodYear]',
    /** @var {Number} _dayFrom                  A kezdonap */
	_dayFrom                : undefined,
    /** @var {Number} _dayTo:                   Az utolso nap */
	_dayTo                  : undefined,
    /** @var {Number} _month                    A honap */
	_month                  : undefined,
    /** @var {Number} _year                     Az ev */
	_year                   : undefined,
	/** @var {Object} _periodElements           data-elements attributumban el tudsz helyezni egy JSON objecktumot, hogy a masodik sorban konkretan milyen elemek legyenek*/
	_periodElements         : undefined,
	/** @var {Number} _minSliderSlideStartPos   a csusztatas kezdetekor tarolt pozicio */
	_minSliderSlideStartPos : 0,
	/** @var {Number} _maxSliderSlideStartPos   a csusztatas kezdetekor tarolt pozicio */
	_maxSliderSlideStartPos : 0,
	/** @var {Array}                            HammerJS Object Array */
	_hammers                : [],
	/** @var {Object} _overlayContainerEl       Overlay Container */
	_overlayContainerEl     : undefined,
	/** @var {Object} _pageContainerEl          Page Container */
	_pageContainerEl        : undefined,

	/**
	 * Standard init function
	 *
	 * @param {Object} el       this.element
	 * @param {Object} config   config
	 */
	init : function(el, config) {
		this._overlayContainerEl = Ext.get(this.overlayContainerId);
		this._pageContainerEl = Ext.get(this.pageContainerId);
		// Get after form-inputs are inited
		setTimeout(function() {
			this._dataYearEl = Ext.get(document.querySelector(this._dataYear));
			this._dataPeriodEl = Ext.get(document.querySelector(this._dataPeriod));
		}.bind(this));
		this._dayFrom = this.element.dom.getAttribute('data-from');
		this._dayTo = this.element.dom.getAttribute('data-to');
		this._month = this.element.dom.getAttribute('data-month');
		this._year = this.element.dom.getAttribute('data-year');
		this._periodElements = this.element.dom.getAttribute('data-elements');
		//A slider felepitese
		this.initSliderComponent();

		RangeSlider.superclass.init.call(this, el, config);
	},

	/**
	 * A csusztatas kezdetekor initeljuk a csusztatashoz szukseges valtozokat
	 *
	 * @param {EventObject} e event
	 */
	initVars : function(e) {
		// Most eppen ezt az elemet csusztatjuk.
		this._sliderEl 				= Ext.get(e.target);
		this._sliderElPageOffset 	= e.center.x;
		// Ha a max csuszkat hasznalom akkor true, ha a min-t akkor false
		this._sliderElLeft 			= Ext.get(e.target).getLeft(true);
	},

	/**
	 * Frissiti a hidden mezokben tarolt min-max ertekeket
	 *
	 */
	refreshRange : function() {
		var min = Math.round(this._minSliderPos / this._stepWidth),
			max = Math.round(this._maxSliderPos / this._stepWidth);

		// Ha vannak attributumban atadott elementek akkor azok erteket rakjuk a hiddenbe
		var minValue = this._periodElements ? Ext.decode(this._periodElements)[0][min] : min + this.sliderFirstElement;

		// Leptetos csuszka eseten a lepes szamat rakjuk ki
		if (this.steppedSlide) {
			this._inputMinEl.set(
				{
					value : minValue
				}
			);
			if (this._inputMaxEl) {
				this._inputMaxEl.set(
					{
						value : max + this.sliderFirstElement
					}
				);
			}
		} // Folyamatos csuszka eseten a left erteket
		else {
			this._inputMinEl.set(
				{
					value : min + this.sliderFirstElement
				}
			);
			if (this._inputMaxEl) {
				this._inputMaxEl.set(
					{
						value : max + this.sliderFirstElement
					}
				);
			}
		}

		// Megjelenitjuk a napokat ha szukseges
		if (this._thirdLineChildEls) {
			var slideDays = this._thirdLineChildEls.elements,
				slideDaysLength = this._thirdLineChildEls.elements.length;
			for (i = 0; i < slideDaysLength; i++) {
				if (i === min || i === max) {
					if (!Ext.fly(slideDays[i]).hasClass(this.visibleDayCls)) {
						Ext.fly(slideDays[i]).addClass(this.visibleDayCls);
					}
				}
				else {
					Ext.fly(slideDays[i]).removeClass(this.visibleDayCls);
				}
			}
		}
	},

	/**
	 * Az egermozgas soran lefuto esemeny. A slider huzgalasat szolgalja.
	 *
	 * @param {EventObject} e event
	 */
	onMouseMove : function(e) {
		e.preventDefault();
		// Drag kozben ne jelolgessen ki semmit
		document.onselectstart = function() {
			return false;
		};

		if (!this._sliderEl) {
			return false;
		}
		// Az uj css 'left' ertek kiszamolasa
		var newLeft = this._sliderElLeft + (this._sliderElPageOffset - e.center.x) * -1;

		//Mozoghat a csuszka, ha az ervenyes tartomanyon belul van
		if (newLeft >= 0 && newLeft < this.sliderTrackWidth - this._stepWidth / 2) {
			//Beallitom a csuszka uj helyzetet
			//Ha leptetes van beallitva
			if (this.steppedSlide) {
				var positionMultiplier = Math.round(newLeft / this._stepWidth);
				this._sliderEl.setStyle('left',
					positionMultiplier * this._stepWidth +
					this._stepWidth / 2 - this._sliderEl.dom.clientWidth / 2 + 'px');
			}
			// Ha folyamatos csusztatas van beallitva
			else {
				this._sliderEl.setStyle('left', newLeft + 'px');
			}

			//Megkeresem a helyzet alapjan hogy milyen left erteket vett fel a 2 csuszka
			this._maxSliderPos = 0;
			this._minSliderPos = 0;
			for (i = 0; i < this._tickerElements.elements.length; i++) {
				//Elso talalat legyen a min ertek
				if (i === 0) {
					this._minSliderPos = this._tickerElements.item(i).getLeft(true);
				}
				else if (this._minSliderPos <= this._tickerElements.item(i).getLeft(true)) {
					this._maxSliderPos = this._tickerElements.item(i).getLeft(true);
				}
				//Ha a masodik talalat kevesebb, az eddigi min maxxa valik, es az uj ertek lesz a min.
				else {
					this._maxSliderPos = this._minSliderPos;
					this._minSliderPos = this._tickerElements.item(i).getLeft(true);
				}
			}
			//Frissitem az inputba beirt ertekeket
			//TODO: optimalizalni kellene, hogy ne minden pixelen fusson le
			//this.refreshRange();

			//Beallitom a csik hosszat es leftjet
			if (!this.noRange) {
				this._selectedLineEl.dom.style.width = this._maxSliderPos - this._minSliderPos + 'px';
				this._selectedLineEl.setStyle('left', this._minSliderPos + this._sliderEl.dom.clientWidth / 2 + 'px');
			}
			else {
				// 5 pix korrekcio szukseges
				this._selectedLineEl.dom.style.width = this._minSliderPos + 5 + 'px';
			}
		}
	},

	/**
	 * Az egergomb elengedeset kovetoen levesszuk a csuszkat mukodteto mousemove esemenyt
	 */
	onBodyMouseUp : function() {
		if (this._slidingInProgress) {
			this._sliderEl 		= undefined;

			Ext.getBody().removeClass('noselect');

			if (this._overlayContainerEl) {
				this._overlayContainerEl.removeClass('noselect');
			}

			if (this._pageContainerEl) {
				this._pageContainerEl.removeClass('noselect');
			}

			document.onselectstart = null;

			this._slidingInProgress = false;

			this.refreshRange();

			// Csak akkor mentjuk el, ha a valamelyik csuszka slideolasa elotti ertek kulonbozik a mentendo ertektol
			// (tehat tortent csuszka valtozas)
			// Nem biztos hogy van mindig input max element (hidden) , ezert igy kerem le az erteket.
			var inputMaxValue = this._inputMaxEl ? this._inputMaxEl.dom.value : null;

			if (this._minSliderSlideStartPos != this._inputMinEl.dom.value || this._maxSliderSlideStartPos != inputMaxValue) { // eslint-disable-line
				this.saveState(this._inputMinEl.dom.value, inputMaxValue);
			}
		}
	},

	/**
	 * Az csuszkan torteno egergomb lenyomasat kovetoen lefuto metodus
	 *
	 * @param {EventObject} e event
	 * @param {DomElement} t target
	 */
	onMouseDown : function(e, t) {
		this.initVars(e, t);
		this._slidingInProgress = true;
		Ext.getBody().addClass('noselect');
        //Moz select fix
		if (this._overlayContainerEl) {
			this._overlayContainerEl.addClass('noselect');
		}
		if (this._pageContainerEl) {
			this._pageContainerEl.addClass('noselect');
		}
		// Letaroljuk, hogy a slide kezdetekor hol allnak a sliderek
		this._minSliderSlideStartPos = this._inputMinEl.dom.value;
		if (this._inputMaxEl) {
			this._maxSliderSlideStartPos = this._inputMaxEl.dom.value;
		}
	},

	/**
	 * Csuszka aktualis allasanak elkuldese AJAX-szal, ha be van kapcsolva a beepitett mentes.
	 * Ha nincs bekapcsolva a beepitett mentes, akkor kivulrol egy esemenyen keresztul meg lehet
	 * adni sajat save callback-et.
	 *
	 * @param {Number} min
	 * @param {Number} max
	 */
	saveState : function(min, max) {
		var newUrl = this.saveUrl.split('?'),
			year = this._dataYearEl ? this._dataYearEl.dom.value : new Date().getFullYear(), //ev lekeres
			period = this._dataPeriodEl.dom.value, //honap es nap lekeres
			fullPeriod = year + '-' + period; // ev-honap-nap osszevonas

		if (this.noSave) {
			return;
		}
        //ujratoltes overlay meghivassal
		if (this.isOverlayRefreshEnabled) {
			this.overlayComponent = Config.get('overlayComponent');
			this.overlayComponent.getOverlay(newUrl[0] + '?period=' + fullPeriod + '&fromDay=' + min + '&toDay=' + max);
		}
        //ujratoltes a tartalomba
		if (this.isPageRefreshEnabled) {
			// Kurzor toltesre allitasa
			Ext.getBody().addClass(this.bodyLoadingCls);
			// Unbindelunk, hogy mentes kozben ne tortenhessen semmi
			this.setSliderEnable(false);

            //Kuldd el az ajaxot
			Connection.Ajax.request({
				type   	 : CONST.TYPE_JSON,
				url   		 : newUrl[0] + '?period=' + fullPeriod + '&fromDay=' + min + '&toDay=' + max,
				scope  	 : this,
				success	 : this.saveSucessCallback,
				error  	 : this.saveErrorCallback,
				failure	 : this.saveErrorCallback,
				method 	 : CONST.GET,
				synchron : true
			});
		}

        // A beepitett ajax mentes.
		if (this.enableIntegratedSave) {
			Connection.AjaxComponent.request({
				type   : CONST.TYPE_JSON,
				scope  : this,
				url    : this.saveUrl,
				params : {
					min : min,
					max : max
				},
				method   : CONST.GET,
				synchron : true,
				success  : function(response) {
					this.saveSucessCallback(response);
				},
				error : function() {
					/* develblock:start */
					console.warn('ERROR: error');
					/* develblock:end */
				},
				failure : function() {
					/* develblock:start */
					console.warn('ERROR: failure');
					/* develblock:end */
				}
			});
		}
	},

	/**
	 * A sikeres mentest kovetoen lefuto callback
	 */
	saveSucessCallback : function(response) {
		Ext.getBody().removeClass(this.bodyLoadingCls);
		this.setSliderEnable(true);
		if (this.integratedSaveCallbackFn) {
			this.integratedSaveCallbackFn.call(null, response);
		}
        // Menteskor esemeny
		this.fireEvent(RangeSlider.ON_SAVE, this);
	},


	/**
	 * A sikertelen mentes kovetoen lefuto callback
	 */
	saveErrorCallback : function() {
		/* develblock:start */
		console.warn('ERROR: error');
		/* develblock:end */
		Ext.getBody().removeClass(this.bodyLoadingCls);
		this.setSliderEnable(true);
	},

	/**
	 * Beallitja valtozoba , hogy az egergomb le van-e nyomva vagy nincs
	 */
	setMouseDown : function(ev, target, options) {
		if (options.up) {
			this._mouseDown = false;
		}
		else {
			this._mouseDown = true;
		}
	},

	/**
	 * Torli a slider JS generalt reszeit
	 */
	destroy : function() {
		Ext.get(this.id).select('ul').remove();
		Ext.get(this.id).select('div').remove();
	},

	/**
	 * A kert idointervallum megvaltozasara  ujrapeldanyositja a slidert
	 */
	onPeriodChange : function() {
		//esemenyek levetele
		this.unbind();
		//rangeSlider elemeinek torlese
		this.destroy();
		//uj letrehozas
		this.initSliderComponent();
		//esemenyek rakotese
		this.bind();
	},

	/**
	 *  Peldanyositja a slider komponenst a megfelelo datum adatokkal
	 *
	 */
	initSliderComponent : function() {
		InitRiot();
		//Add vissza a pontos datumot
		var date = new Date(this._year, this._month - 1, this._dayFrom);

		//Peldanyositsd a valtozokat
		this.sliderElementAmount = parseInt(this._dayTo, 10) - parseInt(this._dayFrom, 10) + 1;
		this.sliderFirstElement = parseInt(this._dayFrom, 10);
		this.firstDayNumber = date.getDay();
		this._inputMinEl = this.element.select(this.inputMinSel).item(0);
		this._inputMaxEl = this.element.select(this.inputMaxSel).item(0);
		this.sliderMinBeginValue = this._inputMinEl.dom.value === '' //Ha a php nem tolti ki
				? this.sliderMinBeginValue === 0 ? parseInt(this._dayFrom, 10) : this.sliderMinBeginValue
				: this._inputMinEl.dom.value;
		if (this._inputMaxEl) {
			this.sliderMaxBeginValue = this._inputMaxEl.dom.value === '' //Ha a php nem tolti ki
				? this.sliderMaxBeginValue === 1 ? parseInt(this._dayTo, 10) : this.sliderMaxBeginValue
				: this._inputMaxEl.dom.value;
		}

		this._minSliderSlideStartPos = this.sliderMinBeginValue;
		this._maxSliderSlideStartPos = this.sliderMaxBeginValue;

		//Slider felepitese
		//A slider kezdo es vegpont ertekenek korrigalasa, hogy 1-tol induljon, mert konnyebb vele szamolni
		this.sliderMinBeginValue = this.sliderMinBeginValue - this.sliderFirstElement + 1;
		this.sliderMaxBeginValue = this.sliderMaxBeginValue - this.sliderFirstElement + 1;
		//Megallapitom egy lepes szelesseget.
		this._stepWidth = this.sliderTrackWidth / this.sliderElementAmount;

		//Korlatozd a kiirhato elemek szamat, hogy ne csusszon egymasra
		var showEveryXElement = Math.ceil(this.periodMinWidth / this._stepWidth),
			daysObject = Config.get('sliderObj.days') || {},
			days = [
				daysObject.sun,
				daysObject.mon,
				daysObject.tue,
				daysObject.wed,
				daysObject.thu,
				daysObject.fri,
				daysObject.sat
			],
			periodDays = [],
			periodDayNames = [],
			periodElements = Ext.decode(this._periodElements),
			caption;

		// Annyi szam es nev lista elemet epitek amennyi a kert elemek szama
		for (i = 0; i < this.sliderElementAmount; i++) {
			//Ha nincs maradek(minden X-edik elem), azokat az elemeket SOHA nem kell megmutatni
			if ((i + 1) % showEveryXElement !== 0) {
				//Ha elso vagy utolso elem akkor kell
				if (i + 1 === 1 || i + 1 === this.sliderElementAmount) {
					caption = periodElements ? periodElements[i] : i + this.sliderFirstElement;
					periodDays[i] = { tag : 'li', html : '<span>&nbsp;</span>' + (i + this.sliderFirstElement) };
					periodDayNames[i] = { tag : 'li', html : days[(i + this.firstDayNumber) % 7] };
				}
				else {
					caption = periodElements ? periodElements[i] : i + this.sliderFirstElement;
					periodDays[i] = {
						tag	 : 'li',
						cls	 : 'notVisible',
						html : '<span>&nbsp;</span>' + (i + this.sliderFirstElement)
					};
					periodDayNames[i] = { tag : 'li', html : days[(i + this.firstDayNumber) % 7], cls : 'notVisible' };
				}
			}
			//Ha van maradek, a szam biztos megjelenhet
			else {
				caption = periodElements ? periodElements[0][i] : i + this.sliderFirstElement;
				periodDays[i] = { tag : 'li', html : '<span>&nbsp;</span>' + caption };

				//Ha a slider azon az erteken all akkor a szoveg is megjelenik (egyebkent csak akkor ha odahuzom)
				if (i === this.sliderMinBeginValue - 1 || i === this.sliderMaxBeginValue - 1) {
					periodDayNames[i] = { tag : 'li', html : days[(i + this.firstDayNumber) % 7], cls : 'visibleDay' };
				}
				else {
					periodDayNames[i] = { tag : 'li', html : days[(i + this.firstDayNumber) % 7] };
				}
			}
		}
		//Slider elemeinek objektumkent letrehozasa
		var contentArray = [
			{ tag : 'div', cls : this.sliderTrackCls },
			{ tag : 'div', cls : this.sliderLineCls },
			{ tag : 'div', cls : 'icon ' + this.tickerSel },
			{ tag : 'ul', cls : this.secondLineCls, children : [periodDays] }
		];

		if (!this.noRange) {
			contentArray.push({ tag : 'div', cls : 'icon ' + this.tickerSel });
		}

		if (this.needThirdLine) {
			contentArray.push({ tag : 'ul', cls : this.thirdLineCls, children : [periodDayNames] });
		}

		//DOM elemek letrehozasa
		for (i = 0; i < contentArray.length; i++) {
			this.element.createChild(contentArray[i]);
		}

		// Cachelheto elementek beallitasa
		this._secondLineEl = this.element.select('.' + this.secondLineCls).item(0);
		this._secondLineChildEls = this._secondLineEl.select(this.secondLineChildSel);
		this._thirdLineEl = this.element.select('.' + this.thirdLineCls).item(0);
		if (this._thirdLineEl) {
			this._thirdLineChildEls = this._thirdLineEl.select(this.thirdLineChildSel);
		}
		this._selectedLineEl = this.element.select('.' + this.sliderLineCls).item(0);
		this._tickerElements = this.element.select('.' + this.tickerSel);

		if (this.noRange) {
			this._selectedLineEl.addClass(this.lineRoundedCls);
		}

		//Beallitom a slider szelesseget
		this.element.setWidth(this.sliderTrackWidth);
		this.element.select('.' + this.sliderTrackCls).item(0).setWidth(this.sliderTrackWidth);

		// Ha leptetos csuszkat akarunk
		if (this.steppedSlide) {
			//Beallitom a ket lista elemeinek a szelesseget
			for (i = 0; i < this._secondLineChildEls.elements.length; i++) {
				this._secondLineChildEls.item(i).setWidth(this._stepWidth);
				if (this._thirdLineChildEls) {
					this._thirdLineChildEls.item(i).setWidth(this._stepWidth);
				}
			}
			// Pozicionalom a csikot
			var beginPosition = this._stepWidth * this.sliderMinBeginValue - this._stepWidth / 2,
				endPosition = this._stepWidth * this.sliderMaxBeginValue - this._stepWidth / 2;
			if (!this.noRange) {
				this._selectedLineEl.setWidth(endPosition - beginPosition);
			}
			else {
				this._selectedLineEl.setWidth(beginPosition);
			}

			if (!this.noRange) {
				this._selectedLineEl.setLeft(beginPosition);
			}
			else {
				this._selectedLineEl.setLeft(0);
			}
			//Pozicionalom a csuszka 2 elemet
			for (i = 0; i < this._tickerElements.elements.length; i++) {
				if (i === 0) {
					this._tickerElements.item(i)
						.setLeft(beginPosition - this._tickerElements.item(i).dom.clientWidth / 2);
				}
				else if (i === 1) {
					this._tickerElements.item(i)
						.setLeft(endPosition - this._tickerElements.item(i).dom.clientWidth / 2);
				}
			}
		}
		else {
			// @TODO: Ha nem leptetos slidert hasznalunk, akkor is pozicionalni kell a csuszkakat
		}
		//A csuszka kezdete-vege szovegek pozicionalasa
		var periodStartTextEl = this.element.select(this.periodStartTextCls).item(0);
		if (periodStartTextEl) {
			periodStartTextEl.setRight(this.sliderTrackWidth);
		}

		var periodEndTextEl = this.element.select(this.periodEndTextCls).item(0);
		if (periodEndTextEl) {
			periodEndTextEl.setLeft(this.sliderTrackWidth);
		}

		// Custom Event
		this.addEvents(
			RangeSlider.ON_SAVE
		);
	},

	/**
	 * U can turn the slider tickers functionality on or off
	 *
	 * @param {Boolean} enable Enable if true, disable if false
	 */
	setSliderEnable : function(enable) {
		if (!enable) {
			enable = true;
		}

		this._hammers.forEach(function(hammer) {
			hammer.get('pan').set({ enable : enable });
		});
	},

	/**
	 * Event Binding
	 */
	bind : function() {
		RangeSlider.superclass.bind.call(this);

		this._tickerElements.each(function(ticker, tickers, i) {
			this._hammers[i] = new Hammer(ticker.dom)
				.on('panstart', this.onMouseDown.bind(this))
				.on('panleft panright', this.onMouseMove.bind(this))
				.on('panend', this.onBodyMouseUp.bind(this));

			this._hammers[i].get('pan').set({ threshold : 0 });
		}.bind(this));

		//Ha van a sliderhez select
		if (this._dataYearEl && this._dataPeriodEl) {
			// Az ev select valtoztatasahoz tartozo esemeny
			this._dataYearEl.on('change', this.onPeriodChange, this);
			// Az idoperiodus select valtoztatasahoz tartozo esemeny
			this._dataPeriodEl.on('change', this.onPeriodChange, this);
		}
	},

	unbind : function() {
		RangeSlider.superclass.unbind.call(this);

		this._hammers.forEach(function(hammer) {
			hammer.destroy();
		});

		//Ha van a sliderhez select
		if (this._dataYearEl && this._dataPeriodEl) {
			// Az ev select valtoztatasahoz tartozo esemeny
			this._dataYearEl.un('change', this.onPeriodChange, this);
			// Az idoperiodus select valtoztatasahoz tartozo esemeny
			this._dataPeriodEl.un('change', this.onPeriodChange, this);
		}
	}
});
