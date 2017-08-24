/* eslint-disable complexity */
/* eslint-disable no-nested-ternary */
/* eslint-disable max-statements */
/* eslint-disable max-depth */

import Ext from '../../lib/vendor/ExtCore';
import Chaos from '../../lib/chaos/Chaos';
import ChaosObject from '../../lib/chaos/Object';
import Config from '../../lib/chaos/Config';

import ScrollPane from '../Scroll/ScrollPane';

/**
 *
 * Calendar : Calendar
 *
 */

export default function Calendar(el, config) {
	Calendar.superclass.constructor.call(this, el, config);
}

Chaos.extend(Calendar, ChaosObject, {

	/** @var {Number} _day                      A kivalasztott day */
	_day                      : undefined,
	/** @var {Number} _month                    A kivalasztott month */
	_month                    : undefined,
	/** @var {Number} _year                     A kivalasztott year */
	_year                     : undefined,
	/** @var {String} _calendarContainerClass   Class of the calendar container */
	_calendarContainerClass   : '.calendarBox',
	/** @var {String} _calendarLayerClass       A kattinthato reteg classa ami elinditja a naptarat*/
	_calendarLayerClass       : '.calendarLayer',
	/** @var {String} _showCalendarClass        A calendart megjelenito class*/
	_showCalendarClass        : 'show',
	/** @var {String} _stepYearContainerClass   Az evet valto sor kontenere*/
	_stepYearContainerClass   : 'year',
	/** @var {String} _stepMonthContainerClass  A honapot valto sor kontenere*/
	_stepMonthContainerClass  : 'month',
	/** @var {String} _stepGeneralClass         A lepteto nyilacskak altalanos classa*/
	_stepGeneralClass         : 'stepPeriod',
	/** @var {String} _prevPeriodClass          A BALRA lepteto(ertek csokkento) nyil classa*/
	_prevPeriodClass          : 'prevPeriod',
	/** @var {String} _nextPeriodClass          A JOBBRA lepteto(ertek novelo) nyil classa*/
	_nextPeriodClass          : 'nextPeriod',
	/** @var {String} _hideStepArrowClass       A nyilakat elrejto class*/
	_hideStepArrowClass       : 'hideArrow',
	/** @var {String} _showSelectContainerClass A select kontenert megjelenito class*/
	_showSelectContainerClass : 'show',
	/** @var {Object}  _periodObject            Ha a naptar fugg masik naptartol akkor itt atadhatok az ID-k*/
	_periodObject             : undefined,
	/** @var {Object}  _calendarObject          A naptarhoz adatokat tartalmazo object*/
	_calendarObject           : 'calendarObj',
	/** @var {String} _dayTodayClass            A nap mai ertekenek classa*/
	_dayTodayClass            : 'today',
	/** @var {String} _daySelectedClass         A nap kivalasztott ertekenek classa*/
	_daySelectedClass         : 'selected',
	/** @var {String} _dayValidClass            A nap ervenyes ertekeinek classa*/
	_dayValidClass            : 'valid',

	/* Private */

	/** @var {Bool} _calendarContainerEl            A calendar kontener elem */
	_calendarContainerEl : undefined,
	/** @var {Obj} _calendarInputEl                A calendarhoz tartozo input elem */
	_calendarInputEl     : undefined,
	/** @var {Obj} _stepPeriodElements              A honapokat es eveket lepteto nyil elemek*/
	_stepPeriodElements  : undefined,
	/** @var {Number} _currentDay                   A mostani day */
	_currentDay          : undefined,
	/** @var {Number} _currentMonth                 A mostani month */
	_currentMonth        : undefined,
	/** @var {Number} _currentYear                  A mostani year */
	_currentYear         : undefined,

	_savedDay : undefined,

	_savedMonth : undefined,

	_savedYear          : undefined,
	/** @var {Obj} _yearText                        Az evszamot tartalmazo elem */
	_yearText           : undefined,
	/** @var {Obj} _monthText                       A honap nevet tartalmazo elem */
	_monthText          : undefined,
	/** @var {Obj} _dayElements                     Az osszes nap elem */
	_dayElements        : undefined,
	/** @var {Obj}                                  Ev link elem */
	_yearLink           : undefined,
	/** @var {Obj}                                  Honap link elem */
	_monthLink          : undefined,
	/** @var {Obj}                                  A lenyilo lista fokontener elem */
	_selectDataCt       : undefined,
	/** @var {Obj}                                  A lenyilo lista scrollkontener elem */
	_scrollContainer    : undefined,
	/** @var {Obj}                                  A lenyilo lista tartalom kontener elem */
	_listContainer      : undefined,
	/** @var {Obj}                                  A masik naptar elem (ha van fuggoseg) */
	_otherCalendarEl    : undefined,
	/** @var {Bool}                                 True ha a masik kontener a felso korlat , azaz max datum */
	_otherCalendarIsMax : false,
	/** @var {String}                               A min ev ertek a DOMbol kiszedve*/
	_dateYearMin        : undefined,
    /** @var {String}                               A min honap ertek a DOMbol kiszedve*/
	_dateMonthMin       : undefined,
    /** @var {String}                               A min nap ertek a DOMbol kiszedve*/
	_dateDayMin         : undefined,
    /** @var {String}                               A max ev ertek a DOMbol kiszedve*/
	_dateYearMax        : undefined,
    /** @var {String}                               A max honap ertek a DOMbol kiszedve*/
	_dateMonthMax       : undefined,
    /** @var {String}                               A max nap ertek a DOMbol kiszedve*/
	_dateDayMax         : undefined,
	/** @var {Obj}                                  A kattinthato reteg eleme ami megnyitja a naptarat*/
	_calendarLayer      : undefined,
	/** @var {Obj}                                  A MASIK NAPTAR kattinthato reteg eleme ami megnyitja a naptarat*/
	_otherCalendarLayer : undefined,
	/** @var {Obj}                                  A scroll elem*/
	_scroll             : undefined,


	/**
	 * Init
	 *
	 * @param {Element} el      This should be the body tag.
	 * @param {Object} config   Config object of this component
	 */
	init : function(el, config) {
		//Calendar kontener
		this._calendarContainerEl = this.element.select(this._calendarContainerClass).item(0);
		//Calendar input mezo
		this._calendarInputEl = this.element.select('.calendar').item(0);
		//Calendar kattinthato reteg megnyitashoz
		this._calendarLayer = this.element.select(this._calendarLayerClass).item(0);

		//A calendarban kiirt ev szoveges eleme
		this._yearText = this._calendarContainerEl.select('.calendarYear').item(0);
		//A calendarban kiirt honap szoveges eleme
		this._monthText = this._calendarContainerEl.select('.calendarMonth').item(0);
		//A link ami megnyitja az evek listajat
		this._yearLink = this._yearText.parent();
		//A link ami megnyitja a honapok listajat
		this._monthLink = this._monthText.parent();
		//Lepteteshez szukseges nyilacskak
		this._stepPeriodElements = this._calendarContainerEl.select('.' + this._stepGeneralClass);
		//A lista kontener elemek
		this._selectDataCt = this._calendarContainerEl.select('.selectData').item(0);
		this._scrollContainer = this._selectDataCt.select('.scrollData').item(0);
		this._listContainer = this._selectDataCt.select('.listContainer').item(0);

		//Minimum es maximum ertekek DOM-bol
		this._dateYearMin = this._calendarInputEl.dom.getAttribute('data-min-year');
		this._dateMonthMin = this._calendarInputEl.dom.getAttribute('data-min-month');
		this._dateDayMin = this._calendarInputEl.dom.getAttribute('data-min-day');
		this._dateYearMax = this._calendarInputEl.dom.getAttribute('data-max-year');
		this._dateMonthMax = this._calendarInputEl.dom.getAttribute('data-max-month');
		this._dateDayMax = this._calendarInputEl.dom.getAttribute('data-max-day');

		//talad meg a periodus input elemeit (kulso elemeket)
		if (this._periodObject) {
			if (this._periodObject.periodStartInputId === this._calendarInputEl.parent().id) {
				this._otherCalendarEl = Ext.get(this._periodObject.periodEndInputId);
				this._otherCalendarIsMax = true;
			}
			if (this._periodObject.periodEndInputId === this._calendarInputEl.parent().id) {
				this._otherCalendarEl = Ext.get(this._periodObject.periodStartInputId);
			}
			this._otherCalendarLayer = this._otherCalendarEl.select(this._calendarLayerClass).item(0);
		}

		Calendar.superclass.init.call(this, el, config);
	},

	/**
	 * Naptar megjeleniteset vegzo funkcio
	 */
	showCalendar : function(ev) {
		//Allitsd meg ha a masik nyitva van
        //jelenitsd meg a calendar dobozt
		this._calendarContainerEl.addClass(this._showSelectContainerClass);

        //Generald a tartalmat hogyha szukseges
        //hivd meg a generateCalendar-t
		this.generateCalendar();
        //kosd ra a kattinto esemenyeket
		if (ev) {
			ev.stopPropagation();
		}
		this.addCalendarEvents();
		this.handleStepArrows();
	},

	/**
	 * Naptar megjeleniteset vegzo funkcio
	 */
	hideCalendar : function() {
		//ha talalsz nyitott allapotut akkor azokat zard be es
		this._calendarContainerEl.removeClass(this._showCalendarClass);
		//kosd le az osszes esemenyt:
		this.removeCalendarEvents();
		//Ha volt lista nyitva, zard be
		if (this._selectDataCt.hasClass(this._showSelectContainerClass)) {
			this._selectDataCt.removeClass(this._showSelectContainerClass);
			this._listContainer.select('li').un('click', this.onSelectListClick, this);
		}
	},

	/**
	 * Aktualis datum beallitasa
	 */
	getDate : function() {
		var today = new Date();
		this._currentYear = today.getFullYear();
		this._currentMonth = today.getMonth() + 1; //January is 0!
		this._currentDay = today.getDate();
	},

	/**
	 * Napok szamanak lekerdezese adott honapban
	 */
	getDaysInMonth : function(year, month) {
		return new Date(year, month, 0).getDate();
	},

	/**
	 * Naptar generalasa
	 */
	generateCalendar : function() {
		//Kerem a mai datumot
		this.getDate();

		this._year = this._savedYear;
		this._month = this._savedMonth;
		this._day = this._savedDay;

		if (!this._year || !this._month || !this._day) {
            //Lekerem a max ertekeket
			var maxValues = this.validator('noInvestigation'),
            //Megnezem van e default ertek(PHP)
				defaultValue = this._calendarInputEl.dom.getAttribute('value').split('-'), //A default ertek MINDIG a helyes formatumban legyen a DOMban!
				dateFormat = Config.get(this._calendarObject).dateFormat, //formatum pl: y-m-d
				yearIndex = dateFormat.indexOf('y') / 2,
				monthIndex = dateFormat.indexOf('m') / 2,
				dayIndex = dateFormat.indexOf('d') / 2;
            //A datum valtozok aktualis ertekeit levizsgalom. Ha van mentett ertek szuper, ha nincs akkor a max lehetseges erteket veszi fel
			this._year = this._savedYear
							? this._savedYear
							: parseInt(defaultValue[yearIndex], 10)
								? parseInt(defaultValue[yearIndex], 10)
								: maxValues[0];
			this._month = this._savedMonth
							? this._savedMonth
							: parseInt(defaultValue[monthIndex], 10)
								? parseInt(defaultValue[monthIndex], 10)
								: maxValues[1];
			this._day = this._savedDay
							? this._savedDay
							: parseInt(defaultValue[dayIndex], 10)
								? parseInt(defaultValue[dayIndex], 10)
								: maxValues[2];
		}

		//Az adatokkal kitoltom a honap es ev mezoket, es napokat generalok
		this.refreshYear(this._year);
		this.refreshMonth(this._month);
		this.generateDays();
	},

	/**
	 * Ev frissites
	 *
	 * @param {number} year   ev erteke
	 */
	refreshYear : function(newyear) {
		this._yearText.dom.innerHTML = newyear;
	},

	/**
	 * Honap frissites
	 *
	 * @param {number} month   a honap szama 1-12 kozti ertek
	 */
	refreshMonth : function(newmonth) {
		this._monthText.dom.innerHTML = Config.get(this._calendarObject).monthArray[newmonth - 1];
	},

	/**
	 * Napok generalasa
	 */
	generateDays : function() {
		//szedd le az esemenyeket
		if (this._dayElements) {
			this._dayElements.un('click', this.onDayClick, this);
		}
		//Napkontener tartalom torles
		// IE8 miatt ciklussal toroljuk
		var daysContainerTable = this._calendarContainerEl.select('.daysContainer').item(0).dom;
		while (daysContainerTable.hasChildNodes()) {
			daysContainerTable.removeChild(daysContainerTable.firstChild);
		}

		//Keresd meg hany napos a honap
		var monthDayAmount = this.getDaysInMonth(this._year, this._month),
		//Kerdezd le a korlatokat
			validate = this.validator('fullValidation'),
			minDay = validate[4],
			maxDay = validate[5],
			//A het melyik napja a kivalasztott
			saveddate = new Date(this._year, this._month - 1, 1),
			firstDayNumber = saveddate.getDay() === 0 ? 7 : saveddate.getDay(), //Korrekcio: vasarnap eseten a fg 0-at ad
			month = [];

		//Nap elemek letrehozasa
		for (i = 0; i < monthDayAmount + firstDayNumber - 1; i++) {
			//Az i ciklus csak hetente fut bele
			if (i % 7 === 0) {
				//Minden heten 7-szer fut le a napgeneralo, kiveve az utolso hetet
				var week = 7,
					weekAmount = Math.floor((monthDayAmount + firstDayNumber - 1) / 7);
				if (i === weekAmount * 7) { //utolso het
					week = (monthDayAmount + firstDayNumber - 1) % 7;
				}
				//Napgeneralo
				var cells = [];
				for (let k = 0; k < week; k++) {
					//Valtozok kinullazasa
					var isToday = '',
						isSelected = '',
						valid = '';
					//Mai nap beallitasa
					if (this._year === this._currentYear && this._month === this._currentMonth) {
						isToday = i + k - firstDayNumber + 2 === this._currentDay ? ' ' + this._dayTodayClass : '';
					}
					//Aktualisan kivalasztott beallitasa
					if (this._year === this._savedYear && this._month === this._savedMonth) {
						isSelected = i + k - firstDayNumber + 2 === this._savedDay ? ' ' + this._daySelectedClass : '';
					}
					//Valid ertekek beallitasa
					if (i + k - firstDayNumber + 2 >= minDay && i + k - firstDayNumber + 2 <= maxDay) {
						valid = ' ' + this._dayValidClass;
					}
					//Elso het generalasa
					if (i === 0) {
						//Pozicionalo cella generalasa
						if (k === firstDayNumber - 2) {
							let content = {
								tag     : 'td',
								colspan : firstDayNumber - 1
							};
							cells.push(content);
						}
						//Elso het tobbi cellaja
						else if (k > firstDayNumber - 2) {
							let content = {
								tag     : 'td',
								dataday : i + k - firstDayNumber + 2,
								cls     : 'days' + isSelected + isToday + valid,
								html    : i + k - firstDayNumber + 2
							};
							cells.push(content);
						}
					}
					//Tobbi het tobbi napjanak generalasa
					else {
						var content = {
							tag     : 'td',
							dataday : i + k + 2 - firstDayNumber,
							cls     : 'days' + isSelected + isToday + valid,
							html    : i + k + 2 - firstDayNumber
						};
						cells.push(content);
					}
				}
				var weekEl = {
					tag      : 'tr',
					children : cells
				};
				month.push(weekEl);
			}
		}
		//Table body
		var tableBody = {
			tag      : 'tbody',
			children : month
		};
		//Hozd letre a tablazatot
		var dh = Ext.DomHelper,
			table = this._calendarContainerEl.select('.daysContainer').item(0),

			createTable = dh.append( // eslint-disable-line
			table,
			tableBody
		);

		//Kosd ra az uj elemekre az esemenyeket
		this._dayElements = this._calendarContainerEl.select('.' + this._dayValidClass);
		this._dayElements.on('click', this.onDayClick, this);
	},

	/**
	 * Lista generalasa
	 *
	 * @param {String} type     Meg kell adni honap vagy ev listat generalunk. Ertekei: year , month
	 */
	generateSelectList : function(type) {
		//Valid ertekek lekerdezese
		var validate = this.validator('fullValidation'),
			minYearValue = validate[0],
			maxYearValue = validate[1],
			minMonthValue = validate[2] - 1,
			maxMonthValue = validate[3],
			listContent;

		//Esetleges tartalom kiurites
		this._listContainer.dom.innerHTML = '';

		if (type === 'year') {
			for (let i = minYearValue; i <= maxYearValue; i++) {
				listContent = {
					tag      : 'li',
					datayear : i,
					html     : i
				};
				this._listContainer.createChild(listContent);
			}
		}
		else if (type === 'month') {
			if (!validate) {
				return false;
			}
			for (let i = minMonthValue; i < maxMonthValue; i++) {
				listContent = {
					tag       : 'li',
					datamonth : i,
					html      : Config.get(this._calendarObject).monthArray[i]
				};
				this._listContainer.createChild(listContent);
			}
		}
		/* develblock:start */
		else {
			console.log('Invalid Param!');
		}
		/* develblock:end */
		//Elemekhez esemeny kotes
		this._listContainer.select('li').on('click', this.onSelectListClick, this);
	},

	/**
	 *
	 */
	onSelectListClick : function(ev) {
		//Tuntesd el a select kontenert
		this._selectDataCt.removeClass(this._showSelectContainerClass);
		//kosd le az esemenyeket (ha ujranyitom ujra fog epulni az egesz)
		this._listContainer.select('li').un('click', this.onSelectListClick, this);

		//Frissitsd a megfelelo mezoket
		if (ev.target.getAttribute('datayear')) {
			this._year = parseInt(ev.target.getAttribute('datayear'), 10);
            // Evvaltasnal ellenorizd a honap ervenyesseget
			var validate = this.validator('fullValidation');
			if (this._month < validate[2]) { //Ha a min-nel kisebb
				this._month = parseInt(validate[2], 10);
				this.refreshMonth(this._month);
			}
			else if (this._month > validate[3]) { //Ha a maxnal nagyobb
				this._month = parseInt(validate[3], 10);
				this.refreshMonth(this._month);
			}
			this.refreshYear(this._year);
			this.generateDays();
		}
		else if (ev.target.getAttribute('datamonth')) {
			this._month = parseInt(ev.target.getAttribute('datamonth'), 10) + 1;
			this.refreshMonth(this._month);
			this.generateDays();
		}
		/* develblock:start */
		else {
			console.log('Invalid Element!');
		}
		/* develblock:end */
		this.handleStepArrows();
	},

	/**
	 * Evre kattintas eseten
	 */
	onYearClick : function() {
		this._selectDataCt.addClass(this._showSelectContainerClass);
		this.generateSelectList('year');
		//Ha hosszu a lista adj hozza scrollt
		this.handleLongLists();
	},

	/**
	 * Honapra kattintas eseten
	 */
	onMonthClick : function() {
		this._selectDataCt.addClass(this._showSelectContainerClass);
		this.generateSelectList('month');
		//Ha hosszu a lista adj hozza scrollt
		this.handleLongLists();
	},

	/**
	 * Napra kattintas eseten
	 */
	onDayClick : function(ev) {
		//mentsd el a KATTINTOTT nap erteket valtozoba
		this._day = ev.target.getAttribute('dataday');
        //Mentsd le az erzekeket
		this.saveCalendarValues();
		//hivd meg a hideCalendart
		this.hideCalendar();
	},

	/**
	 *  A kinyithato ev es honap listak tulfolyasat kezeli
	 */
	handleLongLists : function() {
		//Kerd le a kontenerek ID-jat
		var selectDataId = this._selectDataCt.dom.id,
			scrollDataId = this._scrollContainer.dom.id,
			listDataId = this._listContainer.dom.id;

		//meglevo scroll-pane torles
		this._scroll = undefined;
		if (this._selectDataCt.select('.scroll-pane').item(0)) {
			this._selectDataCt.select('.scroll-pane').item(0).remove();
		}
		//Ha a tartalom nagyobb mint ami elfer akkor adj hozza scrollbart
		if (this._listContainer.getHeight() > this._listContainer.parent().getHeight()) {
			this.addScrollPane(selectDataId, scrollDataId, listDataId);
		}
	},

	/**
	 *  Scroll pane peldanyositasa
	 *
	 *  @param {String} selectDataId    a fokontener ID
	 *  @param {String} scrollDataId    a kozepso scroll kontener ID
	 *  @param {String} listDataId      a tartalom kontener ID
	 */
	addScrollPane : function(selectDataId, scrollDataId, listDataId) {
		//scroll peldanyositas
		this._scroll = new ScrollPane(Ext.get(selectDataId),
			{
				containerId    : scrollDataId,
				contentId      : listDataId,
				tpl      			   : '<div class="scroll-pane"><div class="scrollbar"></div></div>',
				scrollBarClass : 'scrollbar'
			}
		);
	},

	/**
	 * Evek es honapok lepteteset vegzi
	 */
	stepNextPeriod : function(ev) {
		var target = Ext.get(ev.target).hasClass(this._stepGeneralClass)
						? Ext.get(ev.target)
						: Ext.get(ev.target).parent();
		var validate = this.validator('fullValidation');
		var minYear = validate[0],
			maxYear = validate[1],
			minMonth = validate[2],
			maxMonth = validate[3];

		//Honap valtas eseten
		if (target.parent().hasClass(this._stepMonthContainerClass)) {
			//LEfele leptetes
			if (target.hasClass(this._prevPeriodClass)) {
				//Ha az ev nagyobb a korlatnal, es  januarnal allunk alapbol
				if (this._year > minYear && this._month === 1) {
					//Honap december lesz, ev leptetodik
					this._month = 12;
					this._year = parseInt(this._year, 10) - 1;
					this.refreshYear(this._year);
				}
				//Ha az ev a korlatnal van, de a honap meg leptetheto VAGY az ev nagyobb a korlatnal
				else if (this._year === minYear && this._month > minMonth || this._year > minYear) {
					this._month = parseInt(this._month, 10) - 1;
				}
				else {
					return false;
				}
			}
			else if (this._year < maxYear && this._month === 12) {
				//Honap januar lesz, az ev leptetodik
				this._month = 1;
				this._year = parseInt(this._year, 10) + 1;
				this.refreshYear(this._year);
			}
			//Ha az ev a korlatnal van, de a honap meg leptetheto VAGY az ev kisebb a korlatnal
			else if (this._year === maxYear && this._month < maxMonth || this._year < maxYear) {
				this._month = parseInt(this._month, 10) + 1;
			}
			else {
				return false;
			}
			//A honap neve a vegen frissul
			this.refreshMonth(this._month);
		}
		//Ev valtas eseten
		else {
			if (target.hasClass(this._prevPeriodClass)) {
				this._year = this._year > minYear ? parseInt(this._year, 10) - 1 : this._year;
				//Ev frissitese utan ujra kell validalni
				validate = this.validator('fullValidation');
				minMonth = validate[2];
				maxMonth = validate[3];
				if (this._month < minMonth) {
					this._month = parseInt(minMonth, 10);
					this.refreshMonth(this._month);
				}
			}
			else {
				this._year = this._year < maxYear ? parseInt(this._year, 10) + 1 : this._year;
				//Ev frissitese utan ujra kell validalni
				validate = this.validator('fullValidation');
				minMonth = validate[2];
				maxMonth = validate[3];
				if (this._month > maxMonth) {
					this._month = parseInt(maxMonth, 10);
					this.refreshMonth(this._month);
				}
			}
			this.refreshYear(this._year);
		}
		this.generateDays();
		//Kezeld a nyilcskak megjeleniteset
		this.handleStepArrows();
	},

	/**
	 * Kezeli a nyilacskak megjeleniteset
	 */
	handleStepArrows : function() {
		var validate = this.validator('fullValidation'),
			prevYearEl,
			nextYearEl,
			prevMonthEl,
			nextMonthEl;

		//Jard be az osszes nyilat (Flyweight miatt elvesznek kozbe az elemek)
		for (i = 0; i < this._stepPeriodElements.elements.length; i++) {
			//A nem latszo nyilakat mutasd meg
			if (this._stepPeriodElements.item(i).hasClass(this._hideStepArrowClass)) {
				this._stepPeriodElements.item(i).removeClass(this._hideStepArrowClass);
			}

			//Rejtsd el amiket el kell rejteni
			//A honap nyilak
			if (this._stepPeriodElements.item(i).parent().hasClass(this._stepMonthContainerClass)) {
				if (this._stepPeriodElements.item(i).hasClass(this._prevPeriodClass)) {
					//Ha a min honap ugyanaz mint amin most allunk, tuntesd el a prev leptetot
					prevMonthEl = this._stepPeriodElements.item(i);
					if (validate[0] === this._year && validate[2] === this._month) {
						prevMonthEl.addClass(this._hideStepArrowClass);
					}
				}
				else if (this._stepPeriodElements.item(i).hasClass(this._nextPeriodClass)) {
					//Ha a max honap ugyanaz mint amin most allunk, tuntesd el a next leptetot
					nextMonthEl = this._stepPeriodElements.item(i);
					if (validate[1] === this._year && validate[3] === this._month) {
						nextMonthEl.addClass(this._hideStepArrowClass);
					}
				}
			}
			//Az ev nyilak
			else if (this._stepPeriodElements.item(i).parent().hasClass(this._stepYearContainerClass)) {
				if (this._stepPeriodElements.item(i).hasClass(this._prevPeriodClass)) {
					//Ha a min ev ugyanaz mint amin most allunk, tuntesd el a prev leptetot
					prevYearEl = this._stepPeriodElements.item(i);
					if (validate[0] === this._year) {
						prevYearEl.addClass(this._hideStepArrowClass);
					}
				}
				else if (this._stepPeriodElements.item(i).hasClass(this._nextPeriodClass)) {
					//Ha a max ev ugyanaz mint amin most allunk, tuntesd el a next leptetot
					nextYearEl = this._stepPeriodElements.item(i);
					if (validate[1] === this._year) {
						nextYearEl.addClass(this._hideStepArrowClass);
					}
				}
			}
		}
	},

	/**
	 * Ertekek kimenteset vegzi
	 */
	saveCalendarValues : function() {
		//Validald az ertekeket mentes elott, es korrigalj ha kell
		var validate = this.validator('fullValidation'),
			minYear = parseInt(validate[0], 10),
			maxYear = parseInt(validate[1], 10),
			minMonth = parseInt(validate[2], 10),
			maxMonth = parseInt(validate[3], 10),
			minDay = parseInt(validate[4], 10),
			maxDay = parseInt(validate[5], 10);
		this._year = this._year < minYear ? minYear : this._year > maxYear ? maxYear : this._year;
		this._month = this._month < minMonth ? minMonth : this._month > maxMonth ? maxMonth : this._month;
		this._day = this._day < minDay ? minDay : this._day > maxDay ? maxDay : this._day;
        //correct day if necessary
		var maxDayInThisMonth = this.getDaysInMonth(this._year, this._month);
		this._day = this._day > maxDayInThisMonth ? maxDayInThisMonth : this._day;

		//Keresd ki a datum formatumat, es bontsd szet
		var dateFormat = Config.get(this._calendarObject).dateFormat, //formatum pl: y-m-d
			dateFormatNames = dateFormat.split('-'), //szetvagom
			dayFormat = this._day < 10 ? '0' + this._day : this._day, //a nap 2jegyu legyen mindenkepp
			monthFormat = this._month < 10 ? '0' + this._month : this._month, //a honap 2jegyu legyen mindenkepp
			dateObject = { //osszeszedem az ertekeket
				y : this._year,
				m : monthFormat,
				d : dayFormat
			};
		//Ird bele a megfelelo formatumot az inputba
		this._calendarInputEl.dom.value = dateObject[dateFormatNames[0]] + '-' + dateObject[dateFormatNames[1]] + '-' + dateObject[dateFormatNames[2]]; // eslint-disable-line
		//Ird be az input saved attributumaba is (erre azert van szukseg hogy a masik naptar elerje hogy itt mi van lementve)
		this._calendarInputEl.dom.setAttribute('data-saved', this._day + '-' + this._month + '-' + this._year);
		//Mentsd le valtozoba is (azert hogy a komponens peldany fixen tudja mik az ertekek , ne kelljen mashonnan osszeszedni)
		this._savedDay = this._day;
		this._savedMonth = this._month;
		this._savedYear = this._year;
	},

	/**
	 * Meghatarozza meddig mehetunk a naptarban, mik a valid ertekek
	 *
	 * @param {string} returnType  Itt lehet megadni milyen valaszt kerunk.
	 */
	validator : function(returnType) {
		//Masik mezo ertekei (ha 2 naptar van, es az egyik a min datum, a masik a max akkor egymast is korlatozzak hiszen ertekeik nem haladhatjak meg a masiket)
		var otherYear,
			otherMonth,
			otherDay,
			minYearDate,
			minMonthDate,
			minDayDate,
			maxYearDate,
			maxMonthDate,
			maxDayDate;


		if (this._otherCalendarEl && this._otherCalendarEl.child('input').dom.getAttribute('data-saved')) {
			var otherCalendar = this._otherCalendarEl.child('input').dom.getAttribute('data-saved').split('-');
			otherYear = otherCalendar[2];
			otherMonth = otherCalendar[1];
			otherDay = otherCalendar[0];
		}

		if (this._otherCalendarIsMax) {
			//ez a min, tehat a masik ertekenel nem lehet nagyobb
			minYearDate = this._dateYearMin;
			minMonthDate = this._dateMonthMin;
			minDayDate = this._dateDayMin;
			maxYearDate = otherYear
							? parseInt(otherYear, 10)
							: this._dateYearMax ? this._dateYearMax : this._currentYear;
			maxMonthDate = otherMonth
							? parseInt(otherMonth, 10)
							: this._dateMonthMax ? this._dateMonthMax : this._currentMonth;
			maxDayDate = otherDay
							? parseInt(otherDay, 10)
							: this._dateDayMax ? this._dateDayMax : this._currentDay;
		}
		else {
			//ez a max, tehat annak az ertekenel nem lehet kisebb
			minYearDate = otherYear ? parseInt(otherYear, 10) : this._dateYearMin;
			minMonthDate = otherMonth ? parseInt(otherMonth, 10) : this._dateMonthMin;
			minDayDate = otherDay ? parseInt(otherDay, 10) : this._dateDayMin;
			maxYearDate = this._dateYearMax ? this._dateYearMax : this._currentYear;
			maxMonthDate = this._dateMonthMax ? this._dateMonthMax : this._currentMonth;
			maxDayDate = this._dateDayMax ? this._dateDayMax : this._currentDay;
		}

		//Csak visszaadja a korlatokat
		if (returnType === 'noInvestigation') {
			return [maxYearDate, maxMonthDate, maxDayDate];
		}

		//Megnezi mik a valid honapok az adott evben, illetve a valid napok adott honapban. Visszater a korlatokkal.
		if (returnType === 'fullValidation') {
			//var validArray = new Array()
			//A jelenlegi datum beesik e az intervallumba?
			if (minYearDate > this._year || this._year > maxYearDate) {
				return false;
			}
				//Az ev max es min egyszerre
			if (minYearDate === this._year && maxYearDate === this._year) {
				if (this._month === minMonthDate && this._month === maxMonthDate) {
					return [minYearDate, maxYearDate, minMonthDate, maxMonthDate, minDayDate, maxDayDate];
				}
				else if (this._month === minMonthDate) {
					return [minYearDate, maxYearDate, minMonthDate, maxMonthDate, minDayDate, 32];
				}
				else if (this._month === maxMonthDate) {
					return [minYearDate, maxYearDate, minMonthDate, maxMonthDate, 0, maxDayDate];
				}
				return [minYearDate, maxYearDate, minMonthDate, maxMonthDate, 0, 32];
			}
				//Az ev csak minimum
			else if (minYearDate === this._year) {
				if (this._month === minMonthDate) {
					return [minYearDate, maxYearDate, minMonthDate, 12, minDayDate, 32];
				}
				return [minYearDate, maxYearDate, minMonthDate, 12, 0, 32];
			}
				//Az ev csak maximum
			else if (maxYearDate === this._year) {
				if (this._month === maxMonthDate) {
					return [minYearDate, maxYearDate, 1, maxMonthDate, 0, maxDayDate];
				}
				return [minYearDate, maxYearDate, 1, maxMonthDate, 0, 32];
			}
			//Egyik se

			//Az ev korlatot visszaadom, a tobbi korlatlanul valid
			return [minYearDate, maxYearDate, 1, 12, 0, 32];
		}
		/* develblock:start */

		console.log('Invalid param!');

		/* develblock:end */
	},

	/**
	 * Rakoti a szukseges esemenyeket a naptarra
	 */
	addCalendarEvents : function() {
		//katt az evre
		this._yearLink.on('click', this.onYearClick, this);
		//katt a honapra
		this._monthLink.on('click', this.onMonthClick, this);
		//katt az ev vagy honap leptetore
		this._stepPeriodElements.on('click', this.stepNextPeriod, this);
		//body click eseten bezaro funkcio
		Ext.getBody().on('mouseup', this.hideCalendar, this);
		this._calendarContainerEl.on('click', function(ev) { ev.stopPropagation() });
		this._calendarContainerEl.on('mouseup', function(ev) { ev.stopPropagation() });
        //A masik naptar megnyitasa eseten
		if (this._otherCalendarLayer) {
			this._otherCalendarLayer.on('click', this.hideCalendar, this);
		}
	},

	/**
	 * Lekoti a szukseges esemenyeket a naptarrol
	 */
	removeCalendarEvents : function() {
		///katt az evre
		this._yearLink.un('click', this.onYearClick, this);
		//katt a honapra
		this._monthLink.un('click', this.onMonthClick, this);
		//katt az ev vagy honap leptetore
		this._stepPeriodElements.un('click', this.stepNextPeriod, this);
		//body click eseten  bezaro funkcio levetele
		Ext.getBody().un('mouseup', this.hideCalendar, this);
		this._calendarContainerEl.un('click', function(ev) { ev.stopPropagation() });
		this._calendarContainerEl.un('mouseup', function(ev) { ev.stopPropagation() });
        //A masik naptar megnyitasa eseten levetele
		if (this._otherCalendarLayer) {
			this._otherCalendarLayer.un('click', this.hideCalendar, this);
		}
	},

	openOtherCalendar : function() {
		this.fireEvent(Calendar.ON_HIDE, this);
	},

	/**
	 * Esemenykezelok feliratkozasa
	 */
	bind : function() {
		//calendar classal rendelkezo input belekattintas eseten indul a naptar megjelenites
		this._calendarLayer.on('click', this.showCalendar, this);

		Calendar.superclass.bind.call(this);
	},

	/**
	 * Esemenykezelok torlese
	 */
	unbind : function() {
		//calendar classal rendelkezo input belekattintas eseten indul a naptar megjelenites levetele
		this._calendarLayer.un('click', this.showCalendar, this);

		Calendar.superclass.unbind.call(this);
	}
});

