/* eslint-disable complexity */
/* eslint-disable max-depth */

import Ext from '../../lib/vendor/ExtCore';
import Chaos from '../../lib/chaos/Chaos';
import ChaosObject from '../../lib/chaos/Object';
import Timer from '../../lib/chaos/Timer';
import Util from '../../lib/chaos/Util';
import CONST from '../../lib/constant/Constants';

import ScrollPane from '../Scroll/ScrollPane';
import Ajax from '../Ajax/Ajax';

export default function AdvancedSelect(el, config) {
	AdvancedSelect.superclass.constructor.call(this, el, config);
}

/**
 * Filter komponens tipus konstans
 * @type {string}
 */
AdvancedSelect.TYPE_FILTER = 'filter';

/**
 * Select komponens tipus konstans
 * @type {string}
 */
AdvancedSelect.TYPE_SELECT = 'select';

/**
 * Select komponens tipus konstans
 * @type {string}
 */
AdvancedSelect.TYPE_AJAX = 'ajax';

/**
 * A peldanyositott AdvancedSelectComponent komponensek listaja
 * @type {Array}
 */
AdvancedSelect.componentList = [];

/**
 * Globalis body esemenykezelo, amit az elso peldanyositott komponens bindel, es az utolso pedig unbindel
 * @param ev
 * @param target
 */
AdvancedSelect.onBodyClickHandler = function(ev, target) {
	var i = AdvancedSelect.componentList.length - 1;
	for (i; i >= 0; --i) {
		var component = AdvancedSelect.componentList[i];
		//Ha a dropdown lista be van zarva akkor nem megyunk tovabb
		//if (component && (!component.isDropDownListClosed() || component.type === AdvancedSelect.TYPE_FILTER)) {
		if (component && !component.isDropDownListClosed()) {
			//Get element
			var element = Ext.get(target.id) || new Ext.Element(target);
			//Ha nem tartozik a komponens elemei koze (3 szinttel visszamenoleg) akkor lefuttatjuk a bezarast
			if (element && !element.findParent('[id*=' + component.componentId + ']', 3, true)) {
				AdvancedSelect.closeComponentDropDown(component);
			}
		}
	}
	// Atadjuk a focust annak az elemnek, amire kattintva lett. Removed: GB-4540
	//target.focus();
};

/**
 * Bezarja az osszes dropdownt, a parameterben kapott komponens kivetelevel
 * @param actualComponent
 */
AdvancedSelect.closeAllDropDown = function(actualComponent) {
	var i = AdvancedSelect.componentList.length - 1;
	for (i; i >= 0; --i) {
		var component = AdvancedSelect.componentList[i];
		//Ha a dropdown lista be van zarva akkor nem megyunk tovabb
		if (component.id !== actualComponent.id && !component.isDropDownListClosed()) {
			AdvancedSelect.closeComponentDropDown(component);
		}
	}
};

/**
 * A komponens, melynek be kell zarni a dropdownjat
 * @param component
 */
AdvancedSelect.closeComponentDropDown = function(component) {
	if (component.type !== AdvancedSelect.TYPE_AJAX) {
		if (component.temporarySelectedListElement) {
			//Ha van temp elem kivalasztva, akkor azt elmentjuk
			component.setSelectedListElement(component.temporarySelectedListElement, true);
		}
		else {
			//Kivalasztunk egyet a listabol (ami utan bezarodik a lista)
			component.writeSelectedListElementValue();
		}
	}
	else if (component._textInputElement.dom.value.length === 0) {
		component.setInputElementPlaceholder(component.getTextInputElement().getValue());
	}
	//Bezarjuk a legordulo listat
	component.closeDropDownList(true);
};

//TODO: Potolni az osztaly kommenteleset, pontos mukodes leirasat
/**
 *
 * A komponens megfelelo mukodesehez a HTMLnek a kovetkezokeppen kell felepulnie:
 * +----------------------------------------------+
 * | component container                          |
 * | +--------------------------------------+---+ |
 * | | scroll container                     |s  | |
 * | | +----------------------------------+ |c  | |
 * | | | list container                   | |r  | |
 * | | |  +----------------------------+  | |o  | |
 * | | |  | list content               |  | |l  | |
 * | | |  |                            |  | |l  | |
 * | | |  |                            |  | |B  | |
 * | | |  |  . . . . . . . . . . . . . |  | |a  | |
 * | | |                                  | |r  | |
 * | | +----------------------------------+ |El | |
 * | +--------------------------------------+---+ |
 * +----------------------------------------------+
 *
 */
Chaos.extend(AdvancedSelect, ChaosObject, {

	/** @var {String} name              Name of the class */
	name                       : 'AdvancedSelectComponent',
	/* */
	type                       : 'select',
	/**/
	_selectElement             : undefined,
	//Elements
	/* */
	_textInputElement          : undefined,
	/* */
	_listElement               : undefined,
	/* */
	_dropDownContainerElement  : undefined,
	/* */
	_listContainerElement      : undefined,
	/* */
	_componentContainerElement : undefined,
	/* */
	_scrollContainerElement    : undefined,
	/* */
	_scrollPane                : undefined,

	/**/
	_inputTag                         : 'input',
	/**/
	_containerTag                     : 'div',
	/**/
	_listTag                          : 'ul',
	/**/
	_componentContainerClassName      : '', //'selectContainer',
	/* */
	selectContainerSel                : '.selectContainer',
	/**/
	_dropDownIdPostfix                : '-dropDown',
	/**/
	_slideContainerIdPostfix          : '-slide',
	/**/
	_dropDownClassName                : 'dropDownContainer',
	/**/
	_listContainerClassName           : 'slideContainer',
	/**/
	_buttonClassName                  : 'icon selectArrow',
	/**/
	_buttonIdPostfix                  : '-icon',
	/**/
	_listIdPostFix                    : '-list',
	/**/
	_listClassName                    : 'listContainer',
	/**/
	_scrollContainerClassName         : 'scrollContainer',
	/* */
	_scrollContainerIdPostfix         : '-scrollContainer',
	/**/
	copyAttributes                    : true,
	/**/
	sort                              : false,
	/**/
	sortAttr                          : 'data-priority',
	/**/
	sortDesc                          : false,
	/**/
	alternativeSpellings              : true,
	/**/
	alternativeSpellingsAttr          : 'data-alternative-spellings',
	/**/
	removeValuelessOptions            : true,
	/**/
	relevancySorting                  : true,
	/**/
	relevancySortingPartialMatchValue : 1,
	/**/
	relevancySortingStrictMatchValue  : 5,
	/**/
	relevancySortingBoosterAttr       : 'data-relevancy-booster',
	/**/
	_options                          : [],
	/**/
	_inputPostfix                     : '-input',
	/* */
	_componentContainerIdPostfix      : '-container',
	/* */
	_scrollContainerPrefix            : '-scrollContainer',
	/* */
	_selectedOption                   : undefined,
	/* */
	_selectedListElement              : undefined,
	/* */
	_selectedValue                    : undefined,
	/* */
	temporarySelectedListElement      : undefined,
	/* */
	_totalListElementCount            : 0,
	/* */
	_listElementsPerPage              : 10,
	/* A pageUp/pageDown megnyomasa eseten tarolja az aktualis page szamot */
	_pageNumber                       : 0,
	/* AUTOFILL KAPCSOLO */
	_autoFillEnabled                  : false,
	/* */
	_enableCustomValue                : false,
	/* */
	componentId                       : '',
	/**/
	_lastMathingListElement           : '',
	/* */
	dataAttributePrefix               : 'data-',
	/* */
	defaultValue                      : -1,
	/* */
	ajaxResponseType                  : CONST.TYPE_JSON,
	/* */
	ajaxMethod                        : CONST.POST,
	/* */
	hidableEmptyOptionSel             : '.hidableEmptyOption',
	/* */
	placeholderText                   : undefined,
	/* */
	maskTpl                           : '<div class="mask"></div>',
	/* */
	loadWithError                     : false,

	/* @var {Array}                   Initially disabled option elements (not disabled by other selectboxes) */
	_initialDisabledOptions : [],

	_jumpToCache : '',

	/*  Az egyedi ajax valasz kezelo metodus amely feldolgozza az egyes AJAX service-ek altal adott valaszt es atalakitja a komponens szamara hasznalhato formara
	 *  azaz, visszad egy listat a megjelenitheto adatokrol (varoslista, orszaglista stb.)
	 *  Ezt a visszakapott valasztombot, elmentjuk a this._options-be, amit a komponens mar hasznalni tud.
	 *  {Function}
	 */
	ajaxResponseHandler : undefined,
	/* Ilyen mezoneven/parameterneven kuldi fel a komponens az input mezo erteket Ajaxos mukodes eseten*/
	ajaxFieldName       : '',
	/* Egyedi Ajax hivas parameterek megadasara szolgalo objektum */
	ajaxParams          : {},
	/* Az ajax serice url-je */
	ajaxServiceUrl      : '',
	/* */
	ajaxDelayTimer      : undefined,
	/**/
	ajaxTokenSizeLimit  : 2,
	/**/
	ajaxDelayInterval   : 500,
	/* */
	dataAttributes      : {
		'data-type'                  : 'type',
		'data-url'                   : 'ajaxServiceUrl',
		'data-field'                 : 'ajaxFieldName',
		'data-params'                : 'ajaxParams',
		'data-default-position'      : 'defaultValue',
		'data-ajax-token-size-limit' : 'ajaxTokenSizeLimit'
	},

	/**/
	keyCode : {
		BACKSPACE       : 8,
		SHIFT           : 16,
		CTRL            : 17,
		ALT             : 18,
		CAPS            : 20,
		COMMA           : 188,
		DELETE          : 46,
		DOWN            : 40,
		END             : 35,
		ENTER           : 13,
		ESCAPE          : 27,
		HOME            : 36,
		LEFT            : 37,
		NUMPAD_ADD      : 107,
		NUMPAD_DECIMAL  : 110,
		NUMPAD_DIVIDE   : 111,
		NUMPAD_ENTER    : 108,
		NUMPAD_MULTIPLY : 106,
		NUMPAD_SUBTRACT : 109,
		PAGE_DOWN       : 34,
		PAGE_UP         : 33,
		PERIOD          : 190,
		RIGHT           : 39,
		SPACE           : 32,
		TAB             : 9,
		UP              : 38
	},

	/** Should we clear the input on focus */
	clearOnFocus      : false,
	/** Class for clearing the input on focus */
	_clearClass       : 'clearOnFocus',
	/** @var {String}                 Class that shows focus state of the select-input */
	focusCls          : 'focus',
	/** @var {Boolean}                Indicates if the value has been selected from the list */
	_selectedFromList : false,

	/**
	 * Init
	 *
	 * @param {Element} el      This should be the body tag.
	 * @param {Object} config   Config object of this component
	 */
	init : function(el, config) {
		//A kapott select elemet eltaroljuk ezt FONTOS eltarolnunk, mivel a this.element egy flyWeight elem es a fly stacken levo utolso select elemt adja vissza, ami a kesobbiekben lekerdezve nem mindig a megfelelo
		this._selectElement = Ext.get(el.id);
		// Default Value beallitasa
		this.defaultValue = this._selectElement.getValue();
		//Komponens id elmentese
		this.componentId = this._selectElement.id;
		//Letrehozzuk a komponens elemeit a DOM-ban
		this.constructComponentElements();
		//Kinyerjuk az adatot a hidden select <option> elemeibol
		this._options = this.extractOptions(this._selectElement);
		//Beallitjuk az input tulajdonsagait
		this.setTextInputAttributes();
		//Legordulo lista feltoltese alapertelmezett ertekekkel
		this.constructListElement(this._options);
		//Elrejtjuk a select elemet
		this._selectElement.setStyle('display', 'none');
		//Elmentjuk a komponenst a globalis komponenslistaba
		AdvancedSelect.componentList.push(this);
		//Set clear on focus option
		this.clearOnFocus = this._selectElement.hasClass(this._clearClass);
		// jump to cache clearer timer
		this._cacheClearTimer = new Timer({ repeatCount : 1, delay : 1000 });
		this._cacheClearTimer.on(Timer.TimerEvent.TIMER, this.clearJumpToCache, this);

		var firstChild;

		//Az alapertelmezetten kivalasztott elemeket elmentjuk es/vagy beleirjuk a placeholderekbe (a value nelkuli elemeket csak a placehgolderekbe irjuk)
		if (this._selectedOption) {
			var listElement = this.getSpecificListElementByValue(
				this.getCustomAttribute(this._selectedOption, 'value')
			);

			if (listElement) {
				this.setSelectedListElement(listElement, true);
				//this.writeSelectedListElementValue();
			}
			else {
				firstChild = this._selectElement.select('option').item(0);
				if (firstChild) {
					this.setInputElementPlaceholder(Util.getText(firstChild));
				}
			}
		}
		else {
			firstChild = this._selectElement.select('option').item(0);
			if (firstChild) {
				this.setInputElementPlaceholder(Util.getText(firstChild));
			}
		}

		//LEGORDITO GOMB LATHATOSAGANAK ALLITASA
		if (this.type === AdvancedSelect.TYPE_AJAX) {
			var classStr = this._selectedValue && !this.loadWithError ? 'icon-ok' : 'icon-ok hide';
			this._buttonElement.set({
				cls : classStr
			});
		}

		this.selectMatchingElement();

		if (this._selectElement.dom.hasAttribute('disabled') || this._selectElement.hasClass('disabled')) {
			this.enableMask();
		}

		// Init futtatasa
		AdvancedSelect.superclass.init.call(this, el, config);
	},

	/**
	 * Letrehoz egy maszkot a select folott
	 */
	createMask : function() {
		var containerEl = this.element.findParent('.inputs', null, true),
			dh = Ext.DomHelper,
			containerWidth = containerEl.getWidth(),
			containerHeight = containerEl.getHeight();
		this.mask = dh.append(containerEl, this.maskTpl);
		this.mask = Ext.get(this.mask);

		this.mask.setStyle({
			width    : containerWidth + 'px',
			height   : containerHeight + 'px',
			position : 'absolute',
			top      : 0,
			zIndex   : 1
		});
	},

	/**
	 * Megjeleniti a maszkot, vagy letrehozza ha meg nincs
	 */
	enableMask : function() {
		if (this.mask) {
			this.mask.setDisplayed(true);
		}
		else {
			this.createMask();
		}
	},

	/**
	 * Elrejti a maszkot
	 */
	disableMask : function() {
		this.element.dom.removeAttribute('disabled');
		this._textInputElement.dom.removeAttribute('disabled');

		if (this.mask) {
			this.mask.setDisplayed(false);
		}
	},

	/**
	 * Is masked or not.
	 * @returns {boolean}
	 */
	isMasked : function() {
		return this.element.dom.hasAttribute('disabled');
	},

	/**
	 * A kapott ertek alapjan kivalasztja, hogy van e megfelelo listaelem a legorduloben
	 * @param   value
	 * @returns {Ext.Element}
	 */
	getSpecificListElementByValue : function(value) {
		var list = this._listElement.select('li');

		for (var i = 0, len = list.getCount(); i < len; i++) {
			var el = list.item(i);

			if (el.data('value') === value) {
				return el;
			}
		}

		return undefined;
	},

	/**
	 * Konfiguralja a komponenshez tartozo reszegysegeket (dropdown,slider/scroller)
	 */
	constructComponentElements : function() {
		//DomHelper referencia eltarolasa
		var dh = Ext.DomHelper;

		//A komponenst befoglalo kontener elem
		this._componentContainerElement = dh.insertAfter(
			this._selectElement,
			{
				tag   : this._containerTag,
				id    : this.componentId + '' + this._componentContainerIdPostfix,
				class : this._componentContainerClassName
			},
			true
		);

		//Letrehozzuk a hozzatarozo input elemet
		this._textInputElement = dh.append(
			this._componentContainerElement,
			{ //befoglalo div
				tag : this._inputTag,
				id  : this.componentId + this._inputPostfix
			},
			true
		);
		//Legordulo elemet lenyito gomb elem
		this._buttonElement = dh.insertAfter(
			this._textInputElement,
			{ //slide befoglalo divje
				tag   : this._containerTag,
				id    : this.componentId + this._buttonIdPostfix,
				class : this._buttonClassName
			},
			true
		);

		//A dropdown/legordulo elemet befgolalo scrollozhato kontener
		this._scrollContainerElement = dh.insertAfter(
			this._buttonElement,
			{
				tag   : this._containerTag,
				id    : this.componentId + this._scrollContainerIdPostfix,
				class : this._scrollContainerClassName
			},
			true
		);
		this._scrollContainerElement.setStyle('display', 'none');

		//A listakonetenert befoglalo dropdown kontener
		this._dropDownContainerElement = dh.append(
			this._scrollContainerElement,
			{ //befoglalo div
				tag   : this._containerTag,
				id    : this.componentId + this._dropDownIdPostfix,
				class : this._dropDownClassName
			},
			true
		);

		//Listaelemet befoglalo kontener
		this._listContainerElement = dh.append(
			this._dropDownContainerElement,
			{ //slide befoglalo divje
				tag   : this._containerTag,
				id    : this.componentId + this._slideContainerIdPostfix,
				class : this._listContainerClassName
			},
			true
		);

		//ul listaelem
		this._listElement = dh.append(
			this._listContainerElement,
			{ //ul
				tag   : this._listTag,
				id    : this.componentId + this._listIdPostFix,
				class : this._listClassName
			},
			true
		);
		this._listElement.setStyle('display', 'none');
	},

	/**
	 * A hidden <select> elem attributumait atmasolja az input elemre
	 */
	setTextInputAttributes : function() {
		//Lemasoljuk a element tulajdonsagait
		if (this.copyAttributes) {
			var i = 0,
				attrs = {},
				rawAttrs = this._selectElement.dom.attributes,
				length = rawAttrs.length;

			for (i; i < length; i++) {
				var key = rawAttrs[i].nodeName,
					value = rawAttrs[i].value;

				//A szamunkra fontos egyedi data attributumok ertekeit feldolgozzuk
				if (key.match(this.dataAttributePrefix)) {
					this.parseAttribute(key, value);
				}
				else if (key !== 'name' && key !== 'id' &&
					typeof this._selectElement.dom.getAttribute(key) !== 'undefined') {
					attrs[key] = value;
				}

				if (key === 'id') {
					attrs[key] = value.split('-')[0];
				}

				if (!Ext.isIE) {
					attrs.type = 'text';
				}
			}
			//Class lemasolasa < IE9 hack
			//this._textInputElement.dom.className = this._selectElement.dom.className;
			if (Ext.isIE) {
				this._textInputElement.set({ cls : this._selectElement.dom.getAttribute('class') });
			}

			// Disable autocomplete
			attrs.autocomplete = 'off';

			// Non-autosuggest fields are not editable
			if (this.type !== AdvancedSelect.TYPE_AJAX) {
				attrs.readonly = '';
			}

			// On autosuggest fields, we send the input's value, so MOVE the 'name' attr from select to input
			if (this.type === AdvancedSelect.TYPE_AJAX) {
				var nameAttr = this._selectElement.dom.getAttribute('name');
				this._selectElement.dom.removeAttribute('name');
				attrs.name = nameAttr;
			}

			//A kiolvasott tulajdonsagok masolasa
			this._textInputElement.set(attrs);
		}
	},

	/**
	 * Az egyedi adat attributumok ertekeit elmentjuk a hozzajuk tartozo valtozokba
	 * (data-type, data-field, data-url stb.)
	 * @param name   Attributum neve
	 * @param value  Attributum erteke
	 */
	parseAttribute : function(name, value) {
		if (value) {
			if (this.dataAttributes[name]) {
				this[this.dataAttributes[name]] = value;
			}
			else {
				this[name] = value;
			}
		}
	},

	/**
	 * TODO: Mit csinal ez a fv valojaban? At kell nevezni?
	 * @returns {Array} A szurt eredmeny lista amit meg kell jeleniteni
	 */
	autoComplete : function() {
		var term = this.getInputElementValue(),
			splitTerm = term.split(' '), //Szavak szerint szetszedi a szoveget
			matchers = [],
			k = 0,
			splitTermLength = splitTerm.length;

		//Vegigmegyunk a beirt szavakon
		for (k; k < splitTermLength; k++) {
			if (splitTerm[k].length > 0) {
				//A talalatok listaja
				var matcher = {};

				//Reszleges egyezesek listaja
				matcher.partial = new RegExp(this.escapeRegex(splitTerm[k]), 'i');

				//Ha a relevancia szerinti kereses be van allitva, akkor szo eleji egyezest vizsgal
				if (this.relevancySorting) {
					matcher.strict = new RegExp('^' + this.escapeRegex(splitTerm[k]), 'i');
				}

				//Az egyezeseket elmenjuk
				matchers.push(matcher);
			}
		}

		//A szures eredmenye
		var filterResult = this.filter(term, matchers);

		return filterResult.sort(function(a, b) {
			return b.relevancy_score - a.relevancy_score; // eslint-disable-line
		});
	},

	/**
	 *
	 * @param {String} term        Az inputba beirt ekresoszo
	 * @param {Array}  matchers A relevans talalati szavak tombje
	 * @returns {Array} A szurt talalatok tombje
	 */
	filter : function(term, matchers) {
		var length = this._options.length,
			matchersLength = matchers.length,
			result = [];

		//Vegigmegyunk az options elemein
		for (let i = 0; i < length; i++) {
			var option = this._options[i],
				partialMatches = 0,
				strictMatch = false,
				splitOptionMatches = [];

			//Ha relevancia szerinti listazast szeretnenk
			if (this.relevancySorting) {
				splitOptionMatches = option.matches.split(' ');
			}

			//Vegigmegyunk a talalti listan
			for (let j = 0; j < matchersLength; j++) {
				//Ha talalunk egyezest
				if (matchers[j].partial.test(option.matches)) {
					partialMatches++;
				}
				//Ha relevancia szerinti listazast szeretnenk
				if (this.relevancySorting) {
					for (let q = 0; q < splitOptionMatches.length; q++) {
						if (matchers[j].strict.test(splitOptionMatches[q])) {
							strictMatch = true;
							break;
						}
					}
				}
			}

			if (this.relevancySorting) {
				var optionScore = 0;

				optionScore += partialMatches * this.relevancySortingPartialMatchValue;
				if (strictMatch) {
					optionScore += this.relevancySortingStrictMatchValue;
				}

				option.relevancy_score = optionScore; // eslint-disable-line
				optionScore *= option.relevancy_score_booster; // eslint-disable-line
			}

			if (!term || matchers.length === partialMatches) {
				result.push(option);
			}
		}

		return result;
	},

	/**
	 * Ha a komponens tipusa TYPE_SELECT, akkor nem futtatjuk a filter metodust
	 * @returns {Ext.Element}  A keresoszora egyezo lista elem
	 */
	selectMatchingElement : function(term) {
		term = term || this.getSelectedValue();

		var list = this._listElement.select('li');

		if (!term) {
			return this._lastMathingListElement = list.item(0);
		}

		var pattern = '^' + this.escapeRegex(term),
			regExp = new RegExp(pattern, 'i'),
			selectedElement,
			li;

		for (var i = 0, length = list.getCount(); i < length; i++) {
			li = list.item(i);
			if (regExp.test(li.data('value'))) {
				selectedElement = li;
				this._lastMathingListElement = selectedElement;

				break;
			}

			selectedElement = this._lastMathingListElement;
		}

		return selectedElement;
	},

	/**
	 * A parameterben kapott DOM elem (<select>) elemeit felolvassa es egy rendezett listat keszit beloluk
	 * @param   {Ext.Element}  field  A hidden <select> elem referenciaja
	 *
	 * @returns {Array}        Options tomb
	 */
	extractOptions : function(field) {
		this._optionElements = Ext.get(field).select('option');
		var options = [],
			numberOfOptions = this._optionElements.getCount();

		// Vegigmegyunk a select tag osszes optionjen
		for (var i = 0; i < numberOfOptions; i++) {
			var elem = Ext.get(this._optionElements.elements[i]),
				option = {
					realValue : elem.getValue(),
					cls       : elem.dom.className,
					label     : Util.getText(elem),
					disabled  : elem.getAttribute('disabled')
				};
			//Ha egy <option> elem ki van valasztva, akkor azt elmentjuk
			if (elem.dom.selected) {
				this._selectedOption = elem;
			}
			//A value nelkuli, vagy az ures value-val rendelkezo option elemeket nem tesszuk bele a listaba!!
			if (this.removeValuelessOptions && option.realValue === '') {
				//Kihagyjuk az ertek nelkuli optionoket
			}
			else {
				// prepare the 'matches' string which must be filtered on later
				option.matches = option.label;

				var alternativeSpellings = elem.getAttribute(this.alternativeSpellingsAttr);

				//
				if (alternativeSpellings) {
					option.matches += ' ' + alternativeSpellings;
				}

				// give each option a weight paramter for sorting
				if (this.sort) {
					var weight = parseInt(elem.getAttribute(this.sortAttr), 10);

					if (weight) {
						option.weight = weight;
					}
					else {
						option.weight = numberOfOptions;
					}
				}

				// add relevancy score
				if (this.relevancySorting) {
					option.relevancy_score = 0; // eslint-disable-line
					option.relevancy_score_booster = 1; // eslint-disable-line
					var boostBy = parseFloat(elem.getAttribute(this.relevancySortingBoosterAttr));
					if (boostBy) {
						option.relevancy_score_booster = boostBy; // eslint-disable-line
					}
				}

				// add option to combined array
				options.push(option);
			}
		}

		// sort the options based on weight
		if (this.sort) {
			if (this.sortDesc) {
				options.sort(function(a, b) {
					return b.weight - a.weight;
				});
			}
			else {
				options.sort(function(a, b) {
					return a.weight - b.weight;
				});
			}
		}

		// return the set of options, each with the following attributes: realValue, label, matches, weight (optional)
		return options;
	},

	/**
	 * Ez a fuggveny vegzi a szurt lista megjelenitest
	 *
	 * @param {Array} data A listaelemeket tartalmazo tomb. Elemei objektumok a kovetkezo felepitessel:
	 * {
	 *   label                   : "United States",
	 *   matches                 : "United States US USA United States of America",
	 *   realValue              : "United States",
	 *   relevancy_score         : 0,
	 *   relevancy_score_booster : 3.5
	 * }
	 */
	render : function(data) {
		//Elmentjuk a listaelemek szamat
		this._totalListElementCount = data.length;
		//Felepitjuk a listat a kapott adatok alapjan
		this.constructListElement(data);

		//Lathatova tesszuk a listat
		this._listElement.setStyle({ display : 'block' });

		//SCROLLBAR MEGJELENITESE HA SZUKSEGES
		if (data.length > 0) {
			//Scrollbar megjelenitese
			if (data.length > this._listElementsPerPage) {
				//Megjelenitjuk a scrollbart
				this.showScrollPane();
			}
			else {
				//Eltuntetjuk a scrollbart
				this.hideScrollPane();
			}

			//Laponkenti elemek szamanak beallitasa lathato terulet alapjan - Felfele kerekitve
			var temp = this._listContainerElement.getHeight() / this._listElement.select('li').item(0).getHeight();

			this._listElementsPerPage = this.isInt(temp) ? temp : (temp >> 0) + 1;
		}
		else {
			//Eltuntetjuk a scrollbart
			this.hideScrollPane();
			//Bezarjuk a legordulo listat
			this.closeDropDownList(true);
		}
	},

	/**
	 * Elkesziti a legordulo lista tartalmat es hozzaadja a DOM-hoz
	 * @param elementList
	 */
	constructListElement : function(elementList) {
		//Eltaroljuk a domhelper referenciat
		var dh = Ext.DomHelper,
			listElements = [];

		this._initialDisabledOptions = [];

		//Toroljuk a lista tartalmat
		this._listElement.update('');
		//Vegigmegyunk a listaelemeket tartalmazo tombbon, es felepitjuk beloluk a megjelenitendo dom elemeket
		//Elkeszitjuk a <li> elemeket az _options objektum tartalma alapjan

		for (var i = 0; i < elementList.length; i++) {
			var classes = elementList[i].cls,
				isDisabled = elementList[i].disabled &&
					(elementList[i].disabled === 'disabled' || elementList[i].disabled === true),
				status = isDisabled ? ' disabled' : ' enabled';

			if (isDisabled) {
				this._initialDisabledOptions.push(elementList[i].realValue);
			}

			listElements.push(
				{
					tag          : 'li',
					'data-value' : elementList[i].realValue,
					id           : this._listElement.getAttribute('id') + '-element-' + i,
					html         : elementList[i].label ? elementList[i].label.toString().trim() :
						elementList[i].toString().trim(),
					tabindex : 0,
					count    : i,
					cls      : classes + status
				}
			);
		}
		//Hozza adjuk a DOM-hoz az elemeket
		dh.append(this._listElement, listElements);

		// Lementjuk a placeholder szoveget (pl. Please Choose).
		// Csak elso alkalommal, mikor kap erteket, mert utana eltunik a hideableEmptyOption
		var placeholderTextEl = this._selectElement.select(this.hidableEmptyOptionSel).item(0);
		if (placeholderTextEl) {
			this.placeholderText = Util.getText(placeholderTextEl);
		}

		//Elhelyezzuk az esemenykezeloket a lista elemeken
		this._listElement.select('li')
			.on('keydown', this.onListKeyDownHandler, this)
			.on('click', this.onListItemClickHandler, this);
	},

	/**
	 * Megjelenitjuk a scrollbart
	 */
	showScrollPane : function() {
		if (!this._scrollPane) {
			//Peldanyositjuk a scrollbart
			this._scrollPane = new ScrollPane(this._dropDownContainerElement, {
				useNativeScroll : false,
				containerId     : this._listContainerElement.dom.id,
				contentId       : this._listElement.dom.id,
				tpl             : '<div class="scroll-pane"><div class="scrollbar"></div></div>',
				scrollBarClass  : 'scrollbar'
			});
		}
		else {
			this._scrollPane.getScrollBar().show();
			this._scrollPane.setScrollBarHeight();
		}
	},

	/**
	 * Eltuntetjuk a scrolbart
	 */
	hideScrollPane : function() {
		if (this._scrollPane) {
			this._scrollPane.getScrollBar().hide();
		}
	},

	///////////////////////
	// UTILITY FUNCTIONS //
	///////////////////////

	/**
	 * Escapeli a kapott regExpet
	 * @param value regExp string
	 * @returns {string}
	 */
	escapeRegex : function(value) {
		return value.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');
	},

	/**
	 * Megmondja egy szamrol, hogy egesz e
	 * @param n szam ertek (float,integer)
	 *
	 * @returns {boolean}
	 */
	isInt : function(n) {
		return n % 1 === 0;
	},

	/**
	 * Megvizsgalja, hogy a kapott parameter fugveny e
	 */
	isFunction : function(functionToCheck) {
		var getType = {};
		return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
	},

	/**
	 * Ha nem a PAGE_UP/PAGE_DOWN  -al navigalunk, akkor updatelni kell, hogy hanyadik oldalon tartunk
	 *
	 * @param id Az eppen kivalasztott elem sorszama / idja
	 */
	updatePageNumber : function(id) {
		this._pageNumber = (id / this._listElementsPerPage >> 0) + 1;
	},

	/**
	 * Megadja, hogy a legordulo lista nyitva van e vagy sem
	 *
	 * @returns {boolean}
	 */
	isDropDownListClosed : function() {
		return this._scrollContainerElement.getStyle('display') === 'none';
	},

	/**
	 * Megnyitja a legordulo menut
	 */
	openDropDownList : function() {
		//Bezarjuk a tobbi legorditett dropdownt FONTOS, hogy elobb zarjuk be a tobbit es utana nyissuk csak a jelenlegit
		AdvancedSelect.closeAllDropDown(this);
		//Rendereles
		this._scrollContainerElement.setStyle('display', 'block');
		this.render(this.getElementsToRender());

		if (!this._textInputElement.hasClass(this.focusCls)) {
			this._textInputElement.addClass(this.focusCls);
		}

		this.fireEvent('open', this.id);
	},

	/**
	 *
	 * @return {Array}
	 */
	getInitiallyDisabledOptions : function () {
		return this._initialDisabledOptions;
	},

	/**
	 * Akomponens modtol fuggoen szuri az adatokat es visszaadja, hogy mit kell renderelni
	 * @returns {Array}
	 */
	getElementsToRender : function() {
		return this.type === AdvancedSelect.TYPE_FILTER && this.isFiltered() ?
			this.autoComplete() : this._options;
	},

	/**
	 * Megallapitja hogy a filter tipusu select eppen filterezes alatt all-e
	 *
	 * @returns {boolean}
	 */
	isFiltered : function() {
		if (this.type !== AdvancedSelect.TYPE_FILTER) {
			return false;
		}

		// kikeresem a hidableEmptyOption class-al megjelolt placeholder textet, ha az van az inputban,
		// akkor sem filterezunk
		if (this.getInputElementValue() === this.placeholderText) {
			return false;
		}

		// Ha _emptyOptionClass
		var isFiltered = this.getOptionByText(this.getInputElementValue()) ? false : true;

		return isFiltered;
	},

	/**
	 * Bezarja a liegordulo listat es atallitja a focust az input mezore
	 */
	closeDropDownList : function(looseFocus) {
		// Ha mar el van rejtve akkor hagyjuk az egeszet
		if (!this._scrollContainerElement.isVisible()) {
			return;
		}
		//Eltuntetjuk a listat a kivalasztas utan
		this._scrollContainerElement.setStyle('display', 'none');
		// Ha bezaraskor ures a textinputelement, akkor a DOM selectet is reseteljuk
		if (this._textInputElement.dom.value.trim() === '') {
			this._selectElement.dom.selectedIndex = -1;
		}
		// Megnezzuk, hogy a kivalasztott item temporary-e, ha igen, visszarakjuk a placeholdertextet
		if (this.placeholderText) {
			this.setInputElementPlaceholder(this.placeholderText);
		}
		//Eldobjuk e a focust, vagy atadjuk az inputnak
		if (!looseFocus) {
			//Visszaadjuk a focust az input elemenek
			//this.setFocus(this._textInputElement);
		}
		// TODO: form js-ben a helye [szokasos]
		if (this._textInputElement.hasClass(this.focusCls)) {
			this._textInputElement.removeClass(this.focusCls);
		}
	},

	/**
	 * A kivalasztott listaelem erteket irja bele az input mezobe
	 */
	writeSelectedListElementValue : function(usePlaceholder) {
		var textValue = this.getActaulText();
		if (textValue) {
			if (usePlaceholder) {
				this.setInputElementPlaceholder(textValue);
			}
			else {
				this.setInputElementValue(textValue);
			}
		}
	},

	/**
	 * Beleirja a kivalasztott elem erteket a komponenshez tartozo input mezobe
	 * @param value
	 */
	setInputElementValue : function(value) {
		this._textInputElement.dom.value = value.toString();
	},

	/**
	 * Beleirja a kivalasztott elem erteket a komponenshez tartozo input mezo placeholderebe
	 * @param value
	 */
	setInputElementPlaceholder : function(value) {
		if (value) {
			this._textInputElement.set({
				placeholder : value.toString()
			});
		}
	},

	/**
	 * Visszaadja a komponenshez tartozo input elem erteket
	 * @returns {String}
	 */
	getInputElementValue : function() {
		return this.getCustomAttribute(this._textInputElement, 'value');
	},

	/**
	 * Beallitja/elmenti a kivalasztott listalemet
	 *
	 * @param {Ext.Element} el Kivalasztott listaelem
	 * @param {boolean} [finalElement] Jelzi, hogy veglegesen leirjuk e az elemet, vagy csak a tempbe/placeholderbe keruljon az ertek
	 *
	 */
	setSelectedListElement : function(el, finalElement) {
		//Ha az elem letezik
		if (el && !el.hasClass('disabled')) {
			var actualValue = '';

			// Indicate the the value was selected from the list
			this._selectedFromList = true;

			//Beallitjuk a focust a kivalasztott elemre
			this.setFocus(el);
			//Ha vegleges a kivalasztas, akkor elmentjuk
			if (finalElement && !el.hasClass(this.hidableEmptyOption)) {
				actualValue = el.data('value') || (Ext.get(el.dom.id) ? Util.getText(el) : '');
				//Elmentjuk a kivalaszott elemet
				this._selectedListElement = el;
				//Elmentjuk a kivalasztott elem erteket, hogy ne kell jen mindig lekerdezgetni
				this._selectedValue = actualValue;
				//Beallitjuk a kijelolest a hidden select elemen is
				this.setSelectedOptionElement(actualValue);
				//Toroljuk a temp elemet
				this.temporarySelectedListElement = undefined;
			}
			else {
				//Ha ideiglenes a kivalasztas, akkro egy ideiglenes valtozoba tesszuk, amig nem veglegesul
				this.temporarySelectedListElement = el;
				//Az input elem placeholderet toltjuk csak ki
				this._textInputElement.dom.placeholder = Util.getText(el, true);
			}
		}
	},

	/**
	 * Beallitjuk a kijelolest a hidden select elemen
	 * @param {string} value Listaelem erteke melyet be kell allitani kivalasztottkent
	 */
	setSelectedOptionElement : function(value) {
		var i = 0,
			initialValue = this.getActualValue(),
			length = this._optionElements
				? this._optionElements.getCount()
				: 0;//Lekerdezzuk, hogy hany <option> elemunk van domban

		//Eltavolitjuk a select=true kapcsolot a korabbi kivalasztott elemrol (ha volt ilyen)
		if (this._selectedOption && this.getCustomAttribute(this._selectedOption, 'value') !== value) {
			this._selectedOption.dom.selected = false;
			this._selectedOption.dom.removeAttribute('selected');
		}

		//Vegigmegyunk az <option> elemeken
		for (i; i < length; i++) {
			var option = this._optionElements.item(i),
				optionValue = option.dom.getAttribute('value');

			// Remove old selected attributes
			if (option.dom.hasAttribute('selected')) {
				option.dom.removeAttribute('selected');
			}

			if (value === optionValue) {
				//Kivalasztjuk a megfelelo <option> elemet
				option.selected = true;

				//Eltaroljuk a referenciaban
				this._selectedOption = option;
				this._selectedOption.dom.selected = true;
				this._selectedOption.set(
					{
						selected : 'selected'
					}
				);
				//Kilepunk a ciklusbol
				break;
			}
		}
		// Megallapitjuk hogy select erteke valtozott-e vagy ugyanarra kattintottunk, ami eddig ki volt valasztva
		var valueChanged = initialValue !== this.getCustomAttribute(this._selectedOption, 'value');

		//Beleirjuk az inputba a kivalaszott erteket
		this.writeSelectedListElementValue();

		if (this.events) {
			this.fireEvent('change', { valueChanged : valueChanged }, this);
		}
	},

	/**
	 *
	 * @returns {*}
	 */
	getElement : function() {
		return Ext.get(this.id);
	},

	/**
	 *
	 * @returns {*}
	 */
	getTextInputElement : function() {
		return this._textInputElement;
	},

	/**
	 * Lekerdezhetove teszi a kivalasztott <option> elemet a hidden selectbol
	 * @returns Ext.Element
	 */
	getSelectedOptionElement : function() {
		return this._selectedOption;
	},

	/**
	 * A kivalasztott option elem value attributumat adja vissza
	 * @returns {String}
	 */
	getActualValue : function() {
		return this._selectedOption ? this._selectedOption.getValue() : undefined;
	},

	/**
	 * @returns {Array}
	 */
	getValues : function() {
		return this._options.map(function(obj) { return obj.realValue });
	},

	/**
	 * A kivalasztott option elem textContent attributumat adja vissza
	 */
	getActaulText : function() {
		//Szandekosan az option alapjan van visszaadva, mert a textinput kesobb irodik be ill. csak tajekoztato jellegu
		var txt = this._selectedOption.getAttribute('textContent') || this._selectedOption.getAttribute('innerText');

		return txt.trim();
	},

	/**
	 * Megnezi, hogy a megadott innerText-el van-e option.
	 *
	 * @param innerText A keresett option belso szovege
	 * @returns {boolean} Jelen pillanatban csak booleanra van szukseges de gond nelkul atirhato mixed-re,
	 *                    csak false-t dobjon ha nincs talalat.
	 */
	getOptionByText : function(innerText) {
		var foundOptionEl = this._listElement.select('li:nodeValue(' + innerText + ')').item(0);

		return foundOptionEl ? true : false;
	},

	/**
	 * Visszaad egy elemet bizonyos szabalyok alapjan, melyet aztan beallithatunk kivalasztottnak
	 * @returns {Ext.Element}
	 */
	findElementToSelect : function() {
		var selectedListElement;
		if (this.type === AdvancedSelect.TYPE_FILTER && this.isFiltered()) {
			selectedListElement = this._listElement.select('li:first-child').item(0);
		}
		else {
			selectedListElement = this.selectMatchingElement();
		}

		return selectedListElement;
	},

	/**
	 * A targetkent kapott elem megkapja a focust
	 * @param target Ext.Element/HTMLElement
	 */
	setFocus : function(target) {
		if (target && !Ext.isIE8) {
			Ext.get(target).dom.focus();
		}
	},

	///////////////////////////
	// EVENT HANDLER SECTION //
	///////////////////////////
	/**
	 *
	 * @param ev
	 */
	onInputKeyDownHandler : function(ev) {
		switch (ev.keyCode) {
			case this.keyCode.TAB:
				//Ha van ideiglenesen kivalasztott elem, akkor azt beleirjuk
				if (this.type !== AdvancedSelect.TYPE_AJAX) {
					if (this.temporarySelectedListElement) {
						this.setSelectedListElement(this.temporarySelectedListElement, true);
					}
					else {
						this.writeSelectedListElementValue();
					}
				}
				else {
					this.setInputElementPlaceholder(this._textInputElement.dom.value);
				}
				this.closeDropDownList();
				break;
			case this.keyCode.ENTER:
			case this.keyCode.NUMPAD_ENTER:
				ev.stopEvent();
				this.openDropDownList();
				this.setSelectedListElement(this.findElementToSelect());
				break;
			default:
				// We edited the input which means that we didn't use the list
				this._selectedFromList = false;
				break;
		}
	},

	/**
	 *
	 * @param ev
	 */
	onInputKeyUpHandler : function(ev) {
		switch (ev.keyCode) {
			case this.keyCode.ESCAPE:
				ev.preventDefault();
				ev.stopPropagation();
				//Ha van ideiglenesen kivalasztott elem, akkor azt beleirjuk
				if (this.type !== AdvancedSelect.TYPE_AJAX) {
					if (this.temporarySelectedListElement) {
						this.setSelectedListElement(this.temporarySelectedListElement, true);
					}
					else {
						this.writeSelectedListElementValue();
					}
				}
				else {
					this.setInputElementPlaceholder(this._textInputElement.dom.value);
				}
				this.closeDropDownList();
				break;

			case this.keyCode.UP :
			case this.keyCode.LEFT :
			case this.keyCode.RIGHT :
			case this.keyCode.ENTER :
			case this.keyCode.NUMPAD_ENTER:
			case this.keyCode.SHIFT :
			case this.keyCode.CTRL :
			case this.keyCode.ALT :
			case this.keyCode.CAPS :
			case this.keyCode.TAB :
				//Fontos, hogy a TAB (es a tobbi gomb) kulon legyen kezelve, hogy az input es a lista kozott menjen a TAB valtas
				//A tobbi megjelolt gomb pedig alapertelmezetten ne csinaljon semmit
				break;

			case this.keyCode.END :
				//Ha akcio billentyukombinaciot hasznal a user, akkor nem szolunk kozbe
				if (ev.ctrlKey || ev.shiftKey) {
					return;
				}
				ev.preventDefault();
				ev.stopPropagation();
				this.openDropDownList();
				this.setSelectedListElement(this._listElement.select('li:last-child').item(0));
				break;

			case this.keyCode.HOME :
			case this.keyCode.PAGE_UP :
			case this.keyCode.PAGE_DOWN :
			case this.keyCode.DOWN :
				//Ha akcio billentyukombinaciot hasznal a user, akkor nem szolunk kozbe
				if (ev.ctrlKey || ev.shiftKey) {
					return;
				}
				ev.preventDefault();
				ev.stopPropagation();
				this.openDropDownList();
				this.setSelectedListElement(this._listElement.select('li:first-child').item(0));
				break;

			default:
				//Ha akcio billentyukombinaciot hasznal a user, akkor nem szolunk kozbe
				if (ev.ctrlKey || ev.shiftKey) {
					return;
				}
				//Az alapertelmezett mukodest felulbiraljuk
				ev.preventDefault();
				ev.stopPropagation();
				// Dobunk egy esemenyt arrol, hogy karater tipusu leutes tortent
				this.fireEvent('char-key-up', {}, this);
				//
				if (this.type === AdvancedSelect.TYPE_AJAX) {
					//Ha meg nincs ajax delay timer, akkor letrehozzuk
					if (!this.ajaxDelayTimer) {
						this.ajaxDelayTimer = new Timer({ repeatCount : 1, delay : this.ajaxDelayInterval });
						this.ajaxDelayTimer.on(Timer.TimerEvent.TIMER, this.ajaxDelayTimerHandler, this);
						this.ajaxDelayTimer.start();
					}
					else {
						//Reseteljuk a timert es ujrainditjuk
						this.ajaxDelayTimer.reset();
						this.ajaxDelayTimer.start();
					}
				}
				else {
					//Alapertelmezetten keressen/szurjon
					this.openDropDownList();
					// Handling Jump To Cache
					this._cacheClearTimer.restart();
					this._jumpToCache += String.fromCharCode(ev.keyCode);
					//Sima szoveg bevitele eseten ez fog lefutni
					this.setSelectedListElement(this.selectMatchingElement(this._jumpToCache));
				}
				break;
		}
	},

	/**
	 * Clears Jump To Cache
	 */
	clearJumpToCache : function() {
		this._jumpToCache = '';
	},

	/**
	 * Ajax hivast keslelteto timer esemenykezeloje
	 */
	ajaxDelayTimerHandler : function() {
		var token = this.getInputElementValue();
		if (token.length >= this.ajaxTokenSizeLimit) {
			//Leallitjuk a timert
			this.ajaxDelayTimer.reset();
			//Keszitunk egy objektumot a custom mezonevvel es az input mezo ertekevel
			var params = {};
			params[this.ajaxFieldName] = token;
			//Osszefesuljuk a 2 objektumot
			Ext.apply(this.ajaxParams, params);
			//Elkuldjuk az ajax kerest
			this.sendAjaxRequest(
				this.ajaxServiceUrl,
				this.ajaxParams
			);
		}
	},

	/**
	 *
	 * @param ev
	 * @param target
	 */
	onListKeyDownHandler : function(ev, target) {
		switch (ev.keyCode) {
			case this.keyCode.SHIFT :
				//Firefoxban, SHIFT beragadas miatt kellett
				ev.preventDefault();
				ev.stopPropagation();
				break;

			case this.keyCode.TAB :
				if (this.type !== AdvancedSelect.TYPE_AJAX) {
					if (this.temporarySelectedListElement) {
						this.setSelectedListElement(this.temporarySelectedListElement, true);
					}
					else {
						this.writeSelectedListElementValue();
					}
				}
				else {
					this.setInputElementPlaceholder(this._textInputElement.dom.value);
				}
				this.closeDropDownList();
				this.setFocus(this._textInputElement);
				break;

			case this.keyCode.HOME :
				ev.preventDefault();
				ev.stopPropagation();
				this.openDropDownList();
				this.setSelectedListElement(this._listElement.select('li:first-child').item(0));
				//Ha az autofill funckcio be van kapcsolva
				if (this._autoFillEnabled) {
					this.writeSelectedListElementValue();
				}
				break;

			case this.keyCode.END :
				ev.preventDefault();
				ev.stopPropagation();
				this.openDropDownList();
				//this.setSelectedListElement(this._listElement.select('li:last-child').item(0));
				this.setSelectedListElement(this.getNextEnabledListElement(this._listElement.getCount() - 1));
				//Ha az autofill funckcio be van kapcsolva
				if (this._autoFillEnabled) {
					this.writeSelectedListElementValue();
				}
				break;

			//Lapozas felfele
			case this.keyCode.PAGE_UP :
				ev.preventDefault();
				ev.stopPropagation();
				//
				this._pageNumber = this._pageNumber > 0 ? this._pageNumber - 1 : this._pageNumber;
				var temp = this._pageNumber * this._listElementsPerPage;
				var selectedElementUp = temp < 1 ? 1 : temp;
				this.setSelectedListElement(this.getNextEnabledListElement(selectedElementUp, true));
				//Ha az autofill funckcio be van kapcsolva
				if (this._autoFillEnabled) {
					this.writeSelectedListElementValue();
				}
				break;

			//Lapozas lefele
			case this.keyCode.PAGE_DOWN :
				ev.preventDefault();
				ev.stopPropagation();
				//
				var tempDown = this._totalListElementCount / this._listElementsPerPage;
				var maxPageNumber = this._totalListElementCount % this._listElementsPerPage > 0 ? (tempDown >> 0) + 1 :
					tempDown;
				this._pageNumber = this._pageNumber < maxPageNumber ? this._pageNumber + 1 : maxPageNumber;
				tempDown = this._pageNumber * this._listElementsPerPage;
				var selectedElementDown = tempDown > this._totalListElementCount
					? this._totalListElementCount
					: tempDown;
				this.setSelectedListElement(this.getNextEnabledListElement(selectedElementDown));
				//Ha az autofill funckcio be van kapcsolva
				if (this._autoFillEnabled) {
					this.writeSelectedListElementValue();
				}
				break;

			//Kijeloles leptetese lefele
			case this.keyCode.DOWN :
				ev.preventDefault();
				ev.stopPropagation();
				//A kovetkezo listaelem kapja a focust
				if (target.nextElementSibling) {
					var countDown = this.getCustomAttribute(Ext.get(target.nextElementSibling.id), 'count');
					this.updatePageNumber(countDown);
					//Beallitjuk a kivalasztott listaelemet
					this.setSelectedListElement(this.getNextEnabledListElement(countDown));
					//Ha az autofill funckcio be van kapcsolva
					if (this._autoFillEnabled) {
						this.writeSelectedListElementValue();
					}
				}
				break;

			//Kijeloles leptetese felfele
			case this.keyCode.UP :
				ev.preventDefault();
				ev.stopPropagation();
				//Az elozo listaelem kapja a focust
				if (target.previousElementSibling) {
					var countUp = this.getCustomAttribute(Ext.get(target.previousElementSibling.id), 'count');
					this.updatePageNumber(countUp);
					//Beallitjuk a kivalasztott listaelemet
					this.setSelectedListElement(this.getNextEnabledListElement(countUp, true));
					//Ha az autofill funckcio be van kapcsolva
					if (this._autoFillEnabled) {
						this.writeSelectedListElementValue();
					}
				}
				break;

			//Elem kivalasztasa
			case this.keyCode.NUMPAD_ENTER:
			case this.keyCode.ENTER :
				ev.preventDefault();
				ev.stopPropagation();
				var selectedListElement = this._listElement.select('#' + target.id).item(0);
				if (selectedListElement && selectedListElement.hasClass('disabled')) {
					return;
				}
				//Beallitjuk a kivalasztott elemet
				this.setSelectedListElement(Ext.get(target.id), true);
				//Beleirjuk a kivalasztott elem erteket az input mezobe
				//this.writeSelectedListElementValue();
				//Bezarjuk a dropdownt
				this.closeDropDownList();
				break;

			//Kilepes a legordulobol, input elem torlese, a lista bezarasa
			case this.keyCode.ESCAPE :
				ev.preventDefault();
				ev.stopPropagation();
				//Ha van ideiglenesen kivalasztott elem, akkor azt beleirjuk
				if (this.type !== AdvancedSelect.TYPE_AJAX) {
					if (this.temporarySelectedListElement) {
						this.setSelectedListElement(this.temporarySelectedListElement, true);
					}
					else {
						this.writeSelectedListElementValue();
					}
				}
				else {
					this.setInputElementPlaceholder(this._textInputElement.dom.value);
				}
				this.closeDropDownList();
				break;

			default:
				this.setFocus(this._textInputElement);
				break;
		}
	},

	/**
	 * Sets a list element to disabled state.
	 * Enables all the non-initially disabled list elements (that is enabled this way before)
	 *
	 * @param {Array} values           Values array to disable
	 */
	disableOptionsByValue : function(values) {
		var selectedValue = this.getSelectedValue();

		for (var i = 0, len = this._options.length; i < len; i++) {
			var option = this._options[i];

			if (typeof option === 'function') {
				continue;
			}

			var listEl = this.element.dom.querySelector('[value="' + option.realValue + '"]');

			// Should be disabled.
			if (option.realValue.inArray(values) && option.realValue != selectedValue) { //eslint-disable-line
				option.disabled = true;
				listEl.setAttribute('disabled', 'disabled');
			}
			// Should be enabled.
			else if (
				!!option.disabled &&
				parseInt(option.realValue, 10) !== 0 &&
				!option.realValue.inArray(values)
			) {
				option.disabled = false;
				listEl.removeAttribute('disabled');
			}
		}
	},

	/**
	 * Returns the select element selected value
	 *
	 * @returns {string}
	 */
	getSelectedValue : function() {
		return this.getCustomAttribute(this._selectElement, 'value');
	},

	/**
	 * Selects a given data attr (camelcase) by
	 * @param {String} dataAttr Data attr which value we want to retrieve
	 * @param {String} value List item value
	 */
	getSelectedDataAttr : function(dataAttr) {
		var selectedOptionEl = this.getSelectedOptionElement();

		return selectedOptionEl.data(dataAttr);
	},

	/**
	 *
	 * @param el
	 * @param attr
	 */
	getCustomAttribute : function(el, attr) {
		var element = Ext.get(el.dom);
		return element.getAttribute(attr);
	},

	/**
	 *
	 * @param {Number}  listItemCount
	 * @param {Boolean} descending
	 * @returns {Ext.Element}
	 */
	getNextEnabledListElement : function(listItemCount, descending) {
		if (isNaN(listItemCount)) {
			return '';
		}
		listItemCount = parseInt(listItemCount, 10);
		var selectedListElement = this._listElement.select('li').item(listItemCount);
		if (selectedListElement && !selectedListElement.hasClass('disabled')) {
			return selectedListElement;
		}
		else if (descending) {
			return this.getNextEnabledListElement(listItemCount - 1, descending);
		}
		return this.getNextEnabledListElement(listItemCount + 1, descending);
	},

	/**
	 * A lista elemek kattintas esemenykezeloje
	 *
	 * @param ev         click event
	 * @param target     event target element
	 */
	onListItemClickHandler : function(ev, target) {
		var selectedListElement = this._listElement.select('#' + target.id).item(0);
		if (selectedListElement && selectedListElement.hasClass('disabled')) {
			ev.preventDefault();
			ev.stopPropagation();
			return;
		}
		//Beallitjuk a kivalasztott elemet
		this.setSelectedListElement(Ext.get(target.id), true);
		//Beleirjuk a kivalasztott elem erteket az input mezobe
		//this.writeSelectedListElementValue();
		//Bezarjuk a dropdownt
		this.closeDropDownList();
	},

	/**
	 * A legordulo lista gombjanak esemenykezeloje
	 * @param ev     Esemeny
	 */
	onInputClickHandler : function(ev) {
		ev.stopPropagation();

		if (this.clearOnFocus) {
			this.clear();
		}

		if (!this.isDropDownListClosed()) {
			this.closeDropDownList();

			return;
		}

		//Ha be van zarva akkor ki kell nyitni

		if (this.type === AdvancedSelect.TYPE_AJAX) {
			if (this._textInputElement.dom.value.length >= this.ajaxTokenSizeLimit) {
				this.openDropDownList();
			}

			return;
		}

		// TODO: Hack, kinyomozni miert mukodik maskepp a nationality
		if (this._textInputElement.dom.id !== 'nationality') {
			this.setDefaultListElementAsSelected();
		}

		this.openDropDownList();
		this.setSelectedListElement(this.findElementToSelect());
	},

	/**
	 * Blur event handler for the input element
	 */
	onInputBlurHandler : function() {
		/* TODO: Better handling, same with city and memberName fields in the ajaxResponseHandler method */
		if (!this._selectedFromList && this._textInputElement.dom.id === 'memberName') {
			this._textInputElement.dom.value = '';
		}
	},

	/**
	 * Az elso valasztasnal a kotelezo mezok eseteben egy alapertelmezett ertektol inditjuk a legorditest
	 * ez lesz az elso legorditesnel kivalasztva, ha kapunk ilyen erteket/propertyt
	 */
	setDefaultListElementAsSelected : function() {
		if (this.defaultValue > 0 && !this._selectedListElement) {
			var defaultListElement = this.getSpecificListElementByValue(this.defaultValue);
			if (defaultListElement) {
				this.setSelectedListElement(defaultListElement, true);
			}
		}
	},

	//////////////////
	// AJAX SECTION //
	//////////////////
	/**
	 * Ajax kommunikaciot megvalosito metodus
	 *
	 * @param {String} url A megfelelo ajax action url-je
	 * @param {Object} params Az action altal igenyelt parameterek objektuma
	 */
	sendAjaxRequest : function(url, params) {
		Ajax.request({
			type    : this.ajaxResponseType || CONST.TYPE_JSON,
			url     : url,
			params  : params,
			scope   : this,
			success : this.ajaxSuccessHandler,
			error   : this.ajaxErrorHandler,
			failure : this.ajaxFailureHandler,
			method  : this.ajaxMethod || CONST.POST
		});
	},

	/**
	 * A sikeres ajax keres esemenykezeloje
	 *
	 * @param response
	 */
	ajaxSuccessHandler : function(response) {
		var isCityField = this._textInputElement.dom.id === 'city'; // TODO: ideiglenesen refactig...[szokasos]
		var isMemberField = this._textInputElement.dom.id === 'memberName'; // TODO: -||- [winter]

		if (this.isFunction(this.ajaxResponseHandler)) {
			//Az egyedi ajax valasz kezelo metodus kimenetet elmentjuk egy tombbe,
			//A tomb alapjan frissitjuk a <select> komponens elemeit
			var result = this.ajaxResponseHandler.call(this, response) || [];
			//Ha nincs valaszthato elem, akkor beallitjuk a jelenleg beirtat, kiveve varosnal es membernel
			if ((!result || result.length === 0) && !isCityField && !isMemberField) {
				result = [this._textInputElement.dom.value];
			}
			//Frissiti a hidden select option elemeit az ajax valasznak megfeleloen
			this.updateElementList(result);
			//Megjelenitjuk a legordulo listat a kapott valasz alapjan
			this.openDropDownList();
			if (!isCityField && !isMemberField) {
				//Visszaadjuk a focust az input elemenek
				this.setFocus(this._textInputElement);
			}
			// TODO: form js-ben a helye [szokasos]
			else if (this._textInputElement.hasClass(this.focusCls)) {
				this._textInputElement.removeClass(this.focusCls);
			}
		}
	},

	/**
	 * Frissiti a hidden select option elemeit az ajax valasznak megfeleloen
	 * @param {Array}   optionList
	 * @param {Boolean} keepPlaceholder
	 */
	updateElementList : function(optionList, keepPlaceholder) {
		//Toroljuk a lista tartalmat
		this._selectElement.update('');

		//Vegigmegyunk a listaelemeket tartalmazo tombbon, es felepitjuk beloluk a megjelenitendo dom elemeket
		//Elkeszitjuk a <li> elemeket az _options objektum tartalma alapjan
		for (var i = optionList.length - 1; i >= 0; i--) {
			var option = optionList[i],
				val = option.value || option.toString().trim(),
				html = option.textContent || option.toString().trim();
			if (option) {
				//Beallitjuk selectednek az elso elemet
				if (i === 0 && !keepPlaceholder) {
					option.selected = true;
				}
				// IE8 Ext bug miatt nativan adjuk hozza a domhoz az option-oket.
				this._selectElement.dom.options.add(new Option(html, val), null);
			}
		}

		//Optionok kinyerese
		this._options = this.extractOptions(this._selectElement.id);
		//Lista ujraepitese
		this.constructListElement(this._options);
		//Ha nem ajaxos komponens akkor valasszon
		if (this.type !== AdvancedSelect.TYPE_AJAX && !keepPlaceholder) {
			//Alapertelmezetten kivalsztjuk az elsot az uj listabol
			this.setSelectedListElement(this._listElement.select('li:first-child').item(0), true);
		}
		// Clear input value if needed
		if (keepPlaceholder) {
			this._textInputElement.dom.value = '';
		}
	},

	/**
	 * Torli a kivalasztott ertekeket
	 */
	clear : function(removeOptions) {
		this._selectedListElement = undefined;
		this._selectedOption = undefined;
		this._textInputElement.dom.value = '';
		this._textInputElement.dom.placeholder = '';
		if (removeOptions) {
			this._selectElement.update('');
			this._listElement.update('');
			this._options = {};
		}
	},

	/**
	 * Resets the select to the placeholder.
	 */
	reset : function() {
		this._selectedListElement = undefined;
		this._selectedOption = undefined;

		var firstChild = this._selectElement.select('option').item(0);
		if (firstChild && firstChild.getValue() === '') {
			this._textInputElement.dom.placeholder = Util.getText(firstChild);
			this._textInputElement.dom.value = '';
		}
	},

	/**
	 * Resets the select to the first selectable option
	 * @TODO: maybe the reset() method could be work the same like this.
	 */
	resetToFirstOption : function() {
		var firstChild = this._selectElement.select('option').item(0);
		if (firstChild) {
			this.setSelectedListElement(this._listElement.select('li').item(0), true);
		}
	},

	/**
	 *
	 * @param cssSelector Az eltavolitando elem CSS selectora
	 */
	removeElement : function(cssSelector) {
		//TODO: Altalanositani a metodust / ne csak CSS selector, hanem ertek alapjan is lehessen torolni elemet
		if (this._type !== AdvancedSelect.TYPE_AJAX) {
			var optionEl = this._selectElement.select(cssSelector).item(0);
			if (optionEl) {
				optionEl.remove();
			}
			else {
				return;
			}

			//Optionok kinyerese
			this._options = this.extractOptions(this._selectElement);
			//Lista ujraepitese
			this.constructListElement(this._options);
		}
		else {
			throw new Error('This is an AJAX type component, you are not allowed to remove an element manually!');
		}
	},

	/**
	 * @param {Object} optionObj <option> -t leiro objektum
	 * @param placeholder csak a placeholderbe kerul leirasra az elem (ez a 'Please choose' tipusu default elemekhez jo)
	 */
	addElement : function(optionObj, placeHolder) {
		// Checking option existance
		var option = this._selectElement.select('option:first').item(0);

		if (option.dom.innerHTML === optionObj.html) {
			return;
		}

		if (this._type !== AdvancedSelect.TYPE_AJAX) {
			var dh = Ext.DomHelper;
			//TODO: Altalanositani a metodust / megvizsgalni, az updateOptionElements metodussal osszevetni
			//Hozza adjuk a DOM-hoz az elemeket
			dh.insertFirst(this._selectElement, optionObj);
			//Optionok kinyerese
			this._options = this.extractOptions(this._selectElement);
			//Lista ujraepitese
			this.constructListElement(this._options);
			//Beallitjuk kivalasztottnak
			//TODO: A :contains CSS selector nem szi meg a specialis karatereket, azert ezt is at kell alakitani
			if (placeHolder) {
				//Kitoroljuk az input erteket
				this.clear();
			}
			//Beallitjuk a kivant erteket
			this.setSelectedListElement(this._listElement.select('li:contains(' + optionObj.html.toString().trim() +
				')').item(0), !placeHolder);
			//Beleirjuk az erteket az input mezo placeholderebe
			//this.writeSelectedListElementValue(true);
		}
		else {
			//TODO: Error uzenetek angolul!
			throw new Error('This is an AJAX type component, you are not allowed to add an element manually!');
		}
	},

	/**
	 * A sikertelen ajax keres esemenykezeloje
	 *
	 * @param {Object} response Az ajax valaszobjektum
	 */
	ajaxFailureHandler : function(response) {
		/* develblock:start */
		console.warn('WARNING! Ajax call has failed! --> ', response.status);
		/* develblock:end */
	},

	/**
	 * Ajax szerviz hivasi hiba esemenykezeloje
	 */
	ajaxErrorHandler : function() {
		/* develblock:start */
		console.warn('WARNING! Ajax call error! --> ');
		/* develblock:end */
	},

	/**
	 * Esemenykezelok feliratkozasa
	 */
	bind : function() {
		//Body esemenykezelo COMisztralasa
		if (AdvancedSelect.componentList.length <= 1) {
			Ext.getBody()
				.on('mouseup', AdvancedSelect.onBodyClickHandler, this);
		}

		//Input eleme esemenykezeloi
		this._textInputElement
			.on('keydown', this.onInputKeyDownHandler, this)
			.on('keyup', this.onInputKeyUpHandler, this)
			.on('click', this.onInputClickHandler, this);

		//A legordito gomb esemenykezeloje
		this._buttonElement
			.on('click', this.onInputClickHandler, this);

		AdvancedSelect.superclass.bind.call(this);
	},

	/**
	 * Esemenykezelok torlese
	 */
	unbind : function() {
		//Kivesszuk a komponenst a globalis komponenslistaba
		AdvancedSelect.componentList.splice(AdvancedSelect.componentList.indexOf(this), 1);

		//Ha mar nincs komponens a listaban, akkor lekotjuk a body click esemenykezelot
		if (AdvancedSelect.componentList.length < 1) {
			Ext.getBody()
				.un('mouseup', AdvancedSelect.onBodyClickHandler, this);
		}

		this._textInputElement
			.un('keydown', this.onInputKeyDownHandler, this)
			.un('keyup', this.onInputKeyUpHandler, this)
			.un('click', this.onInputClickHandler, this);

		this._buttonElement
			.un('click', this.onInputClickHandler, this);

		this._listElement.select('li')
			.un('keydown', this.onListKeyDownHandler, this)
			.un('click', this.onListItemClickHandler, this);

		AdvancedSelect.superclass.unbind.call(this);
	}
});
