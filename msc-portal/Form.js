/* eslint-disable complexity */
/* eslint-disable max-statements */
/* eslint-disable max-depth */
/* eslint-disable block-scoped-var */
/* eslint-disable guard-for-in */

/**
 * Form Component handler class.
 *
 * Encapsulates the validatoion and ajax functions for HTML forms.
 *
 * @package    Registration
 * @subpackage FormComponent
 *
 */

import XRegExp from 'xregexp';
import TweenMax from 'gsap';

import Ext from '../../lib/vendor/ExtCore';
import Chaos from '../../lib/chaos/Chaos';
import ChaosObject from '../../lib/chaos/Object';
import Config from '../../lib/chaos/Config';
import Util from '../../lib/chaos/Util';
import Timer from '../../lib/chaos/Timer';
import Validator from '../../lib/chaos/Validator';
import CONST from '../../lib/constant/Constants';

import AdvancedSelect from './AdvancedSelect';
import SnapshotHTML5UploaderController from '../_Uploader5/Snapshot-HTML5UploaderController';
import DataSender from '../Ajax/DataSender';
import InputHighlight from './InputHighlight';
import Ajax from '../Ajax/Ajax';

import uploaderControllers from '../_Uploader5';

export default function Form(el, config) {
	Form.superclass.constructor.call(this, el, config);
}

/** @const SHOW_UPLOAD_ERROR                        Feltoltesi hiba esemeny konstans / hiba megjelenites */
Form.EVENT_SHOW_UPLOAD_ERROR = 'show-upload-error';
/** @const SHOW_UPLOAD_ERROR                        Fired on all updates */
Form.EVENT_LINKED_FIELD_UPDATE = 'event-advanced-field-update';
/** @const HIDE_UPLOAD_ERROR                        Feltoltesi hiba esemeny konstans / hiba eltuntetes */
Form.EVENT_HIDE_UPLOAD_ERROR = 'hide-upload-error';
/** @const RADIO_CHANGE                             Radiogomb click kattintasra lefuto esemeny */
Form.RADIO_CHANGE = 'radio-change';
/** @const CHAR_KEY_UP                              Az advancedSelectComponentbol jon, ha karakter tipusu leutes tortent */
Form.CHAR_KEY_UP = 'char-key-up';
/** @const GLOBALEVENT_FORM_SUBMIT                  Form kuldes pillanataban lefuto globalis esemeny */
Form.GLOBALEVENT_FORM_SUBMIT = 'form-submit';
/** @const GLOBALEVENT_INPUT_CLEAR                  az input Clear metodusnal zajlo esemeny, kiszol a karakterszamlalonak */
Form.GLOBALEVENT_INPUT_CLEAR = 'input-clear';

/**
 *
 * @param {type} param1
 * @param {type} param2
 * @param {type} param3
 */
Ext.extend(Form, ChaosObject, {
	/* Az osztaly neve */
	name                      : 'form',
	/* Ext.CompositeElement         Az input tiupusu elemek listaja */
	_inputElements            : undefined,
	/* Ext.CompositeElement         A select tipusu elemek listaja */
	_selectElements           : undefined,
	/* Ext.CompositeElement         CheckBox elemek listaja*/
	_checkBoxElements         : undefined,
	/* Ext.CompositeElement         CheckBox ikonok listaja*/
	_checkBoxElementsIcons    : undefined,
	/* Ext.CompositeElement         Radio gomb elemek listaja*/
	_radioButtonElements      : undefined,
	/* Ext.CompositeElement         Radio gomb ikonok listaja*/
	_radioButtonElementsIcons : undefined,
	/* Ext.CompositeElement         Submit tipusu inputok listaja*/
	_submitButtonElements     : undefined,
	/* Ext.CompositeElement         Clear tipusu inputok listaja*/
	_clearButtonElements      : undefined,
	/* Ext.Object                   A validalando modulok objektuma*/
	_modules                  : {},
	/* Ext.Object                   Ez egy objektum, amely field listat tartalmaz, illetve a hozzajuk tartozo modulneveket*/
	_fields                   : {},
	/* Ext.CompositeElement         A kategoria selector befoglalo elemei */
	_selectorBoxes            : undefined,
	/* String                       boxSelector CSS osztaly neve*/
	_boxSelector              : '.selectorBox, .choosePersonBox',
	/* String                       boxSelector neve*/
	_boxSelectorName          : 'selectorBox',
	_newBoxSelectorName       : 'choosePersonBox',
	/* Ext.Element                  A backend altal atadott errorTooltipTemplate HTML elem*/
	_errorTooltipTemplate     : undefined,
	/* String                       Az hiba tooltipet tartalmazo DOM objektum CSS osztalyanak neve */
	_errorContainerClass      : '.errorContainer',
	/* String                       A selecteket tartalmazo elem */
	_selectContainerClassName : 'selectContainer',
	/* String                       A selecteket tartalmazo elem CSS osztalya*/
	_selectContainerClass     : '.selectContainer',
	/* String                        Az error tipusu tooltipek id prefixe */
	_errorPrefix              : 'error',
	/* String                        Error CSS class neve*/
	_errorClassName           : 'error',
	/* String                        A tooltipeket tartalmazo DOM elemek jelzo CSS classa (Olyan elemhez adunk tooltipet, aminek van TC classa)*/
	_tooltipContainerClass    : '.TC',
	/* String                        hint container CSS class*/
	_hintContainerClass       : '.hintContainer',
	/* String                        hint CSS class */
	_hintClass                : '.hint',
	/* String                        hide CSS class */
	_hideClassName            : 'hide',
	/* String                        hide float left CSS class */
	_hideFloatLeftClass       : 'hide-fl',
	/* String                       Sikeres validalast jelolo zold pipa ikon osztalya*/
	_successClass             : '.icon-ok',
	/* String                       Class of rejected state warning icon */
	_rejectedCls              : 'rejected',
	/* String                       Class of rejected state field */
	_rejectedFieldCls         : 'rejectedField',
	/* String                       Kepfeltolto elemek CSS classa*/
	_uploadBlockClass         : '.uploadBlock',
	/* String                       Img uploader elements class prefix */
	_uploadBlockClassPrefix   : 'uploadBlock_',
	/* Ext.CompositeElement         Kepfeltolto elemek listaja*/
	_uploadBlockElements      : undefined,
	/* Array                        Kepfeltolto elemeket vezerlo JS komponensek listaja*/
	_uploaderComponents       : [],
	/* String                       Snapshot keszito blokk szelektora*/
	_snapshoterBlockSel       : '.snapshotUploader',
	/* Ext.CompositeElement         Snapshotkeszito elemek listaja*/
	_snapshotBlockElements    : undefined,
	/* Array                        Snapshotkeszito elemeket vezerlo JS komponensek listaja*/
	_snapshoterComponents     : [],
	/* String                       Char counter DOM elem CSS classa */
	_charCounterElementClass  : 'CC',
	/* String                       Char counter CSS classa */
	_charCounterClass         : '.charCounter',
	/* String                       A hint szoveg egyes es tobbes szamban megirt verzioit tartalmazo objektum neve */
	_hintTextObjectName       : 'globalDataObj',
	/* ID sample imaget tarolo img tag id-ja */
	_documentImageIdPrefix    : 'documentImage',
	/* ID smaple imaget tarolo elem */
	_documentImageElementList : undefined,
	/* */
	_ajaxValidationList       : {},
	/* Object                       A validalas soran ebbe az objektumba jegyezzuk, hogy melyik fieldet milyen eredmennyel validaltuk */
	_validationHistory        : {},
	/* Object                       A validacios adatokat tartalmazo objektum */
	_validationObj            : {},
	/* Object                       A backend altal generalt hibuzeneteket tartalmazo objektum */
	_errorObj                 : {},
	/* String                       A backend altal generalt globalisan elerheto objektum neve */
	_globalObjName            : 'globalDataObj',
	/* String                       Valasztasra figyelmezteto, kivalaszthatatlan opcio classja */
	_emptyOptionClass         : '.hidableEmptyOption',
	/* String                       Valasztasra figyelmezteto, kivalaszthatatlan opcio classneve */
	_emptyOptionClassName     : 'hidableEmptyOption',
	/* Boolean						Szabalyozza a form kuldest: ha true, akkor a kuldes megall */
	_submitButtonClicked      : false,
	/* Boolean						Szabalyozza a city mezo kiuriteset: ha true akkor torolheto a tartalom */
	_isDefaultCityValueAdded  : true,
	/* Boolean						Szabalyozza a geoIp-s select mezok defaultra allitasat: ha true akkor allithato */
	_defaultGeoIpValue        : true,
	/* String                       Ez a CSS osztaly jelzi, hogy mely info tooltipeket kell eltavolitanunk a DOM-bol, ha a hozza tartozo field erteke megvaltozik*/
	_hideOnChangeClass        : '.hideOnChange',
	/* boolean 						Validaljunk e az oldalon barmit (ha nincs validationObj akkor false-ra all) */
	_isValidationNeeded       : true,
	/* boolean 						Validaljunk ajaxosan vagy sem */
	needAjaxValidation        : true,
	/* boolean 						ajaxosan kuldjuk-e a formot vagy ne */
	sendWithAjax              : false,

	/**
	 * called before ajax request
	 *
	 * @callback onAjaxSend
	 * @param {DataSender} dataSender
	 */

	/**
	 * @type {onAjaxSend}
	 */
	onAjaxSend                   : null,
	/* */
	advancedSelectComponents     : undefined,
	/* */
	//inputBlackList:                 ['country', 'ethnicity'],
	inputBlackList               : [],
	/* boolean 						a module_box azt jelenti, hogy az adott elem logikailag egy validalasi egyseget kepez. */
	moduleBoxCls                 : 'moduleBox',
	/* string                       A photos filter form id-je a profile/photos oldalon */
	photosFilterFormId           : 'photosFilterForm',
	/* string                       A snapshot order form id-je a profile/snapshots oldalon */
	snapshotGalleryFilterFormId  : 'snapshotGalleryFilterForm',
	/* string                       Class for automatic upper case first letter */
	_ucfirstClass                : 'ucfirst',
	/* Object                       a Timer that continously restarting if there is an Ajax validation in progress after submit click */
	_submitWaitTimer             : undefined,
	/* Object                       an Object that contains the field IDs of the running ajax validations (plus its value that we validating) */
	_isAjaxValidationInProgress  : {},
	/* Boolean                      if we need form prevalidation */
	_prevalidationNeeded         : false,
	/** @var {string}               class name on form that representing the first, new account step **/
	newAccountStepCls            : 'step-new-account',
	/** @var {string}               Body id of the signup flow **/
	signupFlowBodyId             : 'signup_signupflow',
	/** @var {string}               Data selector on the country element if zipcode is required **/
	zipCodeDataSelector          : 'data-zip-code-required',
	/** @var {string}               ID of the zip input container **/
	zipInputId                   : 'input_zip',
	/** @var {string}               Form row selector **/
	formRowSel                   : '.form_row',
	/** @var {String}               Class that shows focus state of the select-input */
	focusCls                     : 'focus',
	/** @var {String}               Class of editable forms */
	_editableClass               : 'editable',
	/** @var {String}               ID suffix of the value holder container when field is editable (FORM_ID+SUFFIX) */
	_editableValueHolderIdSuffix : 'ValueHolder',
	/** @var {String}               ID suffix of the edit link when field is editable (FORM_ID+SUFFIX) */
	_editableEditLinkIdSuffix    : 'EditLink',
	/** @var {Boolean}              Is this form an inline editable field */
	_isEditable                  : false,
	/** @var {string}               Data selector on the document type element if expiry date is required **/
	expiryDateDataSelector       : 'data-expiry-date-required',
	/** @var {string}               Selector that encloses the expiry date element **/
	moduleExpiryDateSelector     : 'module-expiry-date',
	/** @var {string}               No require ZIP code in form please ! */
	noRequireZipPlease           : false,
	/** @var {array}                Array of field which has InputHighlightt component */
	_highlightCmp                : [],
	/** @var {String}               Selector of input elements which has a highlight initially */
	highlightSel                 : '[data-highlight]',
	/** @var {String}               Value of the actually selected category option */
	_actualCategoryOptionVal     : undefined,
	/** @type {DataSender} */
	_dataSender                  : null,

	/**
	 * Form validator plugin
	 * @param   {type} el     A validalando form elem
	 * @param   {type} config A validalasi adatok (szabalyok, error message teplate)
	 *
	 * @return  void
	 */
	init : function (el, config) {
		Chaos.addEvents(
			Form.EVENT_SHOW_UPLOAD_ERROR,
			Form.EVENT_HIDE_UPLOAD_ERROR,
			Form.GLOBALEVENT_FORM_SUBMIT,
			Form.GLOBALEVENT_INPUT_CLEAR,
			Form.RADIO_CHANGE,
			Form.EVENT_LINKED_FIELD_UPDATE
		);

		//Egyedi validatorok regisztralasa
		Chaos.registerValidator('regexp', this.regexpValidator);
		Chaos.registerValidator('interval', this.intervalValidator);

		//A validacios adatokat tartalmazo objektum
		if (config.validationObj || Config.get('validationObj')) {
			this._validationObj = config.validationObj || Config.get('validationObj');
		}
		else {
			this._isValidationNeeded = false;
		}

		/* Prevalidation needed on pages with password field */
		this._prevalidationNeeded = Ext.getBody().id == 'signup_signupflow' && this.element.hasClass(this.newAccountStepCls); // eslint-disable-line

		//A backend altal generalt hibuzeneteket tartalmazo objektum
		this._errorObj = config.errorObj || Config.get('errorObj');

		//Ha kapunk a configban kulon errorContainer class-t akkor azt elmentjuk
		this._errorContainerClass = this._validationObj.errorContainerClass || this._errorContainerClass;

		//A validalando modulok es input mezok/elemek listai
		if (this._validationObj.data) {
			this._modules = this._validationObj.data.modules;
			this._fields = this._validationObj.data.fields;
		}

		//Eltaroljuk a select elemeket
		this._selectElements = this.element.select('select');
		//A tovabbfejlesztett select komponenseket tarolo objektum
		this.advancedSelectComponents = {};
		//A select elemekhez peldanyositunk egy vezerlo komponenst
		for (let i = this._selectElements.getCount() - 1; i >= 0; i--) {
			var selectElement = Ext.get(this._selectElements.elements[i]),
				hasError = selectElement.dom.className.indexOf(this._errorClassName) != '-1', // eslint-disable-line
				// eleg szolid megoldas (felulirni a kapott parametert az tenyleg elegszolid)
				config = { // eslint-disable-line
					loadWithError : hasError
				};

			//Komponens peldanyositasa
			var advancedSelectement = new AdvancedSelect(
				selectElement,
				config
			);
			switch (advancedSelectement.type) {
				//Ajax valasz kezelo metodus atadasa az ajaxos komponenseknek
				case AdvancedSelect.TYPE_AJAX:
					advancedSelectement.ajaxResponseHandler = function (response) {
						var obj = response.json,
							errorCode = obj.data.errorCode,
							errorMessage = obj.data.errorMessage,
							status = obj.status,
							result = [];

						if (status === 'OK') {
							result = obj.data.list;
						}
						/* develblock:start */
						else {
							console.error(errorCode, ' - ', errorMessage);
						}
						/* develblock:end */

						return result;
					};//Itt adhato meg az egyedi ajax valasz success esemenykezeloje, amely minden esetben vissza kell adjon egy tombot amit a komponens feldolgozhat*/
					break;
				case AdvancedSelect.JSON_OBJECT:
					break;

				default:
					// az ajaxos mezoket nem szabad blaclist-be tenni, mert nem fog mukodni a 'pipa' megjelenites sem
					this.inputBlackList.push(advancedSelectement.id.split('-')[0]);
					break;
			}

			//
			advancedSelectement.on('change', this.onSelectChange, this);
			advancedSelectement.on('open', this.onSelectOpen, this);

			//Eltaroljuk a select elem referenciajat
			this.advancedSelectComponents[selectElement.id] = advancedSelectement;
		}

		//Specialis AjaxParams
		if (this.advancedSelectComponents['city-component'] && this.advancedSelectComponents['country-component']) {
			let countryCode = this.advancedSelectComponents['country-component'].getSelectedOptionElement().dom.value;
			Ext.apply(
				this.advancedSelectComponents['city-component'].ajaxParams, { countryCode }
			);
		}

		//Eltaroljuk az input elemeket
		this._inputElements = this.element.select('input[type=text], input[type=password], textarea');
		//Eltaroljuk a checkbox elemeket
		this._checkBoxElements = this.element.select('input[type=checkbox]');
		//Eltaroljuk a checkbox elemeket takaro ikonokat
		this._checkBoxElementsIcons = this.element.select('span[id*=checkbox-]');
		//Eltaroljuk a radiobutton elemeket
		this._radioButtonElements = this.element.select('input[type=radio]');
		//Eltaroljuk a radiobutton elemeket takaro ikonokat
		this._radioButtonElementsIcons = this.element.select('span[id*=radio-]');
		//Eltaroljuk submit elemeket
		this._submitButtonElements = this.element.select('button[type=submit]');
		//Eltaroljuk submit linkeket
		this._submitLinkElements = this.element.select('button[type=submit]');

		// Merge
		Ext.apply(this._submitButtonElements.elements, this._submitLinkElements.elements);

		// Clear gombok
		this._clearButtonElements = this.element.select('.clearBtn');
		// Labels
		this._labelEls = this.element.select('span[id*=radio-] + p, span[id*=checkbox-] + p');

		//Eltaroljuk a selector boxokat
		this._selectorBoxes = this.element.select(this._boxSelector);
		//Id sample image lista
		this.getDocumentImageElementList();

		//Kep feltolto komponensek pedanyositasa
		this._uploadBlockElements = this.element.select(this._uploadBlockClass);

		var count = this._uploadBlockElements.getCount();
		var currentUploaderObj = {};

		for (i = 0; i < count; i++) {
			currentUploaderObj.el = this._uploadBlockElements.item(i);
			currentUploaderObj.url = currentUploaderObj.el.data('url');

			currentUploaderObj.controller = uploaderControllers[currentUploaderObj.el.data('controller')];
			currentUploaderObj.validate = Config.get(currentUploaderObj.el.data('validate'));

			this._uploaderComponents[i] = new currentUploaderObj.controller(
				currentUploaderObj.el.select('.uploader5').item(0) || currentUploaderObj.el,
				currentUploaderObj
			);
		}

		//Snapshot es uploader pedanyositasa
		this._snapshotBlockEl = this.element.select(this._snapshoterBlockSel).item(0);
		if (this._snapshotBlockEl) {
			var snapshooterUploaderEl = this._snapshotBlockEl.select('.uploader5').item(0);
			new SnapshotHTML5UploaderController(snapshooterUploaderEl, {
				url            : snapshooterUploaderEl.data('url'),
				validate       : Config.get(snapshooterUploaderEl.data('validate')),
				snapshooterCmp : this._snapshooterCmp
			});
		}

		// If sendAjax is true, we use the DataSender compont
		if (this.sendWithAjax) {
			var formAction = this.element.dom.getAttribute('action');

			// slide-right animation functionality for ajaxed selectcomponent's okIcon
			this._selectElements.each(function () {
				this.findParent('.selectContainer', null, true).addClass('okBehind');
			});

			this._dataSender = new DataSender(
				this.element,
				{
					setDelay        : config.setDelay,
					postUrl         : formAction,
					synchron        : false,
					errorCallbackFn : function () {
						location.reload(true);
					}
				}
			);
		}

		//Megkeressuk az oldalon a PHP validacio utan generalt tooltipeket, es ezeket regisztraljuk a JS manipulaciohoz
		var errorTooltipCollection = Ext.select(this._errorClassName.dot()),
			length = errorTooltipCollection.getCount();

		for (let i = 0; i < length; i++) {
			// Remove ok icon (valid format, but invalid value)
			var icon = errorTooltipCollection.item(i).parent().select(this._successClass).item(0);
			if (icon) {
				icon.addClass(this._hideClassName);
			}
		}

		/*
		 * A backendtol kapott objektumon vegig megyunk es megnezzuk,
		 * van-e rajta vagy a szulo dom-jan this._errorPrefix.
		 * Ha van, akkor levalidaljuk a kesobbi validaciok miatt, amennyien nincs, nem csinalunk semmit
		 */
		for (let key in this._fields) {
			var field = Ext.get(key);
			if (field && field.hasClass(this._rejectedFieldCls)) {
				continue;
			}

			if (field && (field.parent().hasClass(this._errorClassName) || field.hasClass(this._errorClassName))) {
				this._validationHistory[field.id] = {
					isValid : false,
					field   : field
				};
			}
		}

		// eloszor nezzuk meg, hogy kell-e ajaxosan validalni.
		if (this.needAjaxValidation) {
			//Ez az objektum tartja nyilvan, hogy melyik mezonek/form elemnek van szuksege ajax validaciora, es milyen !egyedi! parameterekre van ehhez szukseg
			this._ajaxValidationList = {
				email : {
					url    : Config.get('emailValidationUrl'),
					params : {},
					value  : undefined
				},
				screenName : {
					url    : Config.get('screenNameValidationUrl'),
					params : {
						performerId : this.element.child('input[name=performerId]')
							? this.element.child('input[name=performerId]').dom.value
							: ''
					},
					value : undefined
				}
			};
		}

		//Letiltjuk a submit gombot, ha box selector oldal van es nincs kivalasztott doboz
		var boxCount = this._selectorBoxes.getCount();
		if (boxCount > 0) {
			var k = 0;
			this._submitButtonElements.addClass('disabled');
			for (k; k < boxCount; k++) {
				var box = this._selectorBoxes.item(k);
				if (box.hasClass('selected')) {
					this._submitButtonElements.removeClass('disabled');
					break;
				}
			}
		}
		Util.characterCounter(this._inputElements, this._charCounterClass, this._hintTextObjectName);

		// Check if it's an inline editable field
		if (el.hasClass(this._editableClass)) {
			this._isEditable = true;
			this._editLinkEl = Ext.get(this.element.dom.id + this._editableEditLinkIdSuffix);
		}

		// call parent's init
		Form.superclass.init.call(this, el, config);
	},

	/**
	 * Run thru the form fields given by the backend, and validates every single field.
	 */
	validateAllFields : function () {
		for (let field in this._fields) {
			var fieldEl = Ext.get(field);
			if (fieldEl) {
				this.startValidation(fieldEl);
			}
		}
	},

	/**
	 * Checking that the form is valid or invalid at this time. By a very simple method.
	 *
	 * @returns {boolean}
	 */
	hasInValidFields : function () {
		var errorInputFieldsSel = 'input.' + this._errorClassName + ', textarea.' + this._errorClassName,
			errorField = this.element.select(errorInputFieldsSel),
			errorCount = 0;

		errorField.each(function () {
			++errorCount;
		});

		if (errorCount > 0) {
			return true;
		}
		return false;
	},

	/**
	 * A validalasi folyamat belepesi pontja
	 *
	 * @param {Ext.element} field   A validalando module egyik input mezoje
	 */
	startValidation : function (field) {
		if (!this._isValidationNeeded) {
			return;
		}

		//Lekerdezzuk a szukseges adatokat
		var fId = field.dom.id.split('-')[0],
			moduleId = this._fields[fId],
			module = this._modules[moduleId],
			rules = module ? module.rules : [],
			result = this.validateElement(field, rules); //Validalas eredmenye

		//Ha van valid valaszobjektum
		if (result) {
			field = result.field;
			//Eltaroljuk a validalas erteket a validacios historyba
			this._validationHistory[fId] = result;
			//Ha valid a mezo
			if (result.isValid) {
				//Eltuntetjuk a hibauzenenet a valid field mellol
				this.hideError(field);
				//Megnezzuk, hogy validalando e a modul, ha igen akkor attol fuggoen, hogy a tobbi mezo valid e, elkezdjuk a modularis validaciot
				if (module) {
					//Megnezzuk, hogy a tobbi mezo is valid e es ki vannak e toltve
					var fieldList = module.fields,
						fieldListCache = [],
						length = fieldList.length;

					//Elofordulhat olyan specialis modul, ahol backend reszrol egy egyseget kepeznek az elemek, frontend/validacio reszrol viszont kulon kell kezelni oket (pl.: category selector boxok)
					//ebben az esetben az egyik parentnek (pl. selectorBox) moduleBox class-t kell adni.
					var moduleBox = field.findParent('.' + this.moduleBoxCls, null, true);
					if (moduleBox) {
						//vegigmegyunk a fieldlistan, ez megnezzuk , hogy a moduleboxon belul van-e
						for (var j in fieldList) {
							if (!fieldList.hasOwnProperty(j)) {
								continue;
							}
							var selector = ' *[name=' + fieldList[j] + ']',
								fieldToPush = moduleBox.select(selector).item(0);
							// Ha az adott element a moduleBox-on belul van akkor fieldListCache-be tesszuk amit kesobb
							// atrakunk a fieldList helyere
							if (fieldToPush) {
								fieldListCache.push(fieldList[j]);
							}
						}
						fieldList = fieldListCache;
						length = fieldList.length;
					}
					for (let i = 0; i < length; i++) {
						//Elmentjuk az aktualis field id-jat
						var fieldId = fieldList[i],
							historyObj = this._validationHistory[fieldId], //Ha mar van olyan modul elem, amely volt validalva, es invalid, akkor szerepel a historyban, es azt ujravalidaljuk
							fieldIsValid = historyObj
								? historyObj.isValid
								: result.isValid;
						// Ha a modulhoz tartozo masik elem mar volt validalva es nem valid
						if (!fieldIsValid) {
							this.startValidation(Ext.get(fieldId));
						}
					}

					//MODULARIS VALIDACIO
					//Meghivjuk a modularis validalot(ez mar csak a template tipusu validalast vegzi el ujra)
					var moduleResult = this.validateModule(moduleId, fieldList);

					//Ha van valid valaszobjektum, akkor azt elkezdjuk kiertekelni
					if (moduleResult && moduleResult.fieldList) {
						//Deklaraljuk a valtozokat
						fieldList = moduleResult.fieldList;
						length = fieldList.length;
						//Vegigmegyunk az osszes mezon, es a validitas alapjan eldontjuk, hogy hibat kell megjeleniteni, vagy eltuntetni
						for (i = 0; i < length; i++) {
							//Elmentjuk a field erteket, hogy ne kelljen mindig belecimezni a tombbe
							field = Ext.get(fieldList[i]);
							//Ha a modul valid
							if (moduleResult.isValid) {
								//Eltuntetjuk a hibat jelzo elemeket
								this.hideError(field);
							}
							else {
								//Megjelenitjuk az error uzenetet jelzo tooltipet es beallitjuk az error class-t az elemen
								this.showError(field, moduleResult.errorMessage);
								//Azert lett kiveve, mert a modul osszes elemen hibat kell jelezni nem csak az elson
								//return false;
							}
						}
					}
				}
				if (field.hasClass('validateOriginal') &&
					field.data('original') == field.getValue() && // eslint-disable-line
					!field.parent().findParent(this._rejectedFieldCls.dot(), 10, true)) {
					this.showError(field);
				}
				else if (field.parent().findParent(this._rejectedFieldCls.dot(), 10, true)) {
					var wrap = field.parent().findParent(this._rejectedFieldCls.dot(), 10, true);
					if (wrap.hasClass('validateOriginal') && wrap.data('original') === field.getValue()) {
						this.showError(field);
					}
				}
				else if (field.dom.value !== '') {
					// ha minden valid akkor megjelenitjuk a valid jelzest
					this.showOkIcon(field);
				}
			}
			else {
				//Megjelenitjuk az error uzenetet jelzo popupot es beallitjuk az error class-t az elemen
				this.showError(field, result.errorMessage);
				//Eltuntetjuk a pipat a mezo mellol
				this.hideOkIcon(field);
			}
		}
	},

	/**
	 * Egy megadott mezo validalasat vegzo metodus
	 *
	 * @param {Ext.Element} field validalando elem
	 * @param {Array}       rules validalasi szabalyok tombje
	 *
	 * @return {obj} result
	 */
	validateElement : function (field, rules) {
		var length = rules
				? rules.length
				: 0,
			fieldId = field.dom.id.split('-')[0],
			result = undefined;
		for (i = 0; i < length; i++) {
			//Ha nem template tipusu a szabaly
			if (rules[i].field && fieldId === rules[i].field) {
				//Checkbox eseten
				switch (field.dom.type) {
					case 'checkbox':
						result = this.validateValue(field.dom.checked, rules[i]);
						break;
					case 'select-one':
						//TODO: Jo lesz ez igy ? Nem tul altalanos!!!! Atgondolni, nem kothetjuk feltetlenul az advancedSelectComponenshez!
						result = this.validateValue(this.advancedSelectComponents[field.id].getActualValue(), rules[i]);
						break;
					default:
						result = this.validateValue(field.value || field.dom.value, rules[i]);
						break;
				}
				//Eltaroljuk a filed-et is a validalasnal
				result.field = field;

				//Ha a mezo nem valid, akkor rogton visszaterunk a validalas eredmenyevel
				if (!result.isValid) {
					//Ha kapunk highlight kulcsban kiemelendo szavak regexpjet, akkor atadjuk az InputHighlightt kompinak
					if (result.highlight && result.highlight.length > 0) {
						InputHighlight.set(fieldId, Array(result.highlight));
					}

					return result;
				}
			}
		}

		//Ha szukseges, akkor a mezot validaljuk ajaxosan is
		if (result && result.isValid && this._ajaxValidationList[field.id]) {
			var params = {};
			params[field.dom.name] = field.dom.value;
			params.field = field.id;
			//Megvizsgaljuk, hogy ajax validalas utan is valid e az ertek, azaz biztos, hogy nincs e regisztralva backenden az ertek
			this.validateByAjax(field, params);
		}
		else {
			return result;
		}
	},

	/**
	 * A modularis validalast vegzo metodus
	 * @param   {string} moduleId - a modul azonosito kulcsa a validationObj-ben
	 * @param   {Array}  fieldList - amo dulhoz tartozo fieldek listaja
	 *
	 * @return  {Object}        {isValid: true|false, errorMessage:''|'Error message.'}
	 */
	validateModule : function (moduleId, fieldList) {
		//Megvizsgaljuk, hogy a modul validalhato e
		let i = 0,
			rules = this._modules[moduleId].rules,
			length = rules ? rules.length : 0;

		for (; i < length; i++) {
			//Ha template tipusu a szabaly
			var validationRule = rules[i],
				validationTemplate = validationRule.template,
				result = undefined;
			if (validationTemplate) {
				var valueToValidate = this.replaceValidationTemplate(validationTemplate, fieldList);
				//Az elem validalas, es az eredmeny eltarolasa
				result = this.validateValue(valueToValidate, validationRule);
				result.fieldList = fieldList;
			}

			//Ha a mezo nem valid, akkor rogton visszaterunk a validalas eredmenyevel
			if (result && !result.isValid) {
				return result;
			}
		}

		//Ha nem validalhato a modul, akkor null/undefined ertek megy vissza
		return result;
	},

	/**
	 * Validalja a parameterkent kapott erteket, a hozzatartozo szabalyok alapjan
	 *
	 * @param   {*}             value  validalando input elem erteke
	 * @param   {Array}         rule   elemhez tartozo validalasi szabalyok
	 *
	 * @return  {Object}        {isValid: true|false,errorMessage:''|'Error message.'}
	 */
	validateValue : function (value, rule) {
		// Trim value
		if (typeof value === 'string') {
			value = value.trim();
			value = value.replace(/(\r\n|\n|\r)/gm, '');
		}

		//Initialize variables
		var result = {
			isValid      : true,
			highlight    : '',
			errorMessage : ''
		};

		var dateTimeStamp, regexp;

		//Ez csak szoveges mezoknek lehet megadva, azt mutatja, hogy kotelezo e kitolteni
		if (rule.rule_type === 'mandatory' && !!rule.rule === true) {
			result.isValid = Validator.empty(value);
		}

		//Csak szam erteku mezo eseten hasznaljuk, vizsgalja, hogy egy szam a megadott intervallumban van e
		if (rule.rule_type === 'interval') {
			result.isValid = Validator.interval(value, rule.rule.min, rule.rule.max);
		}

		//Validalas korra
		if (rule.rule_type === 'age') {
			//Ebben az esetben a value-ben jon a Date string, ami az atalakitott templatebol szarmazik
			var now = new Date(),
				limitTimeStamp = new Date(now.getFullYear() - rule.rule, now.getMonth(), now.getDate());

			dateTimeStamp = this.generateDateObject(value);
			//Beallitjuk a vizsgalat alapjan, hogy valid e az ertek
			result.isValid = dateTimeStamp <= limitTimeStamp;
		}

		//Datum validalas
		if (typeof value === 'string' && Util.isDate(value) && !Util.isValidDate(value)) {
			result.isValid = Util.isValidDate(value);
		}

		//Lejarati datum figyeles
		if (rule.rule_type === 'date_interval' && Util.isDate(value)) {
			var minInterval = rule.rule.min;
			dateTimeStamp = this.generateDateObject(value);

			result.isValid = minInterval <= dateTimeStamp.valueOf() / 1000;
		}

		//Regexp alapu validaciot vegzo szabaly
		if (rule.rule_type === 'regexp' && rule.rule !== true && rule.highlight !== true) {
			//Atalakitjuk a regexp-et a js altal ertelmezheto formatumra
			regexp = Util.regexpParser(rule.rule);
			result.isValid = Validator.regexp(value, regexp.pattern, regexp.modifier);
		}

		//Regexp alapu validaciot vegzo szabaly, ami a mezoben levo kiemelest vegzi (spamfilter)
		if (rule.rule_type === 'regexp' && rule.rule !== true && rule.highlight === true) {
			//Atalakitjuk a regexp-et a js altal ertelmezheto formatumra
			regexp = Util.regexpParser(rule.rule);
			result.highlight = rule.rule;
			// Ez esetben forditott esetben lesz valid a regexp
			result.isValid = !Validator.regexp(value, regexp.pattern, regexp.modifier);
		}
		//Megnezzuk, hogy valid e a mezo, ha nem, akkor kilepunk a ciklusbol es visszaterunk a kitoltott valasz objektummal
		if (!result.isValid) {
			result.errorMessage = rule.error_message;
		}

		return result;
	},


	/**
	 * Gets document image element list into a component variable (ID Sample images)
	 *
	 * @return void
	 */
	getDocumentImageElementList : function () {
		//Id sample image lista
		this._documentImageElementList = this.element.select('img[class*=' + this._documentImageIdPrefix + ']');
	},


	/**
	 * Template ertek cserelo metodus
	 *
	 * @param {string}    template        a validalo template, amiben cserelni kell az ertekeket
	 * @param {obj}        fieldIdList        az uj prametereket tartalmazo tomb
	 *
	 * @return string result
	 */
	replaceValidationTemplate : function (template, fieldIdList) {
		var pattern,
			value,
			selectComponentName,
			regex,
			i = 0,
			length = fieldIdList.length;

		for (; i < length; i++) {
			//Kulcs kialakitasa
			var key = fieldIdList[i],
				replaceKey = '{' + key + '}';
			//Escapeeljuk a csere kulcsot
			pattern = replaceKey.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
			//Letrehozzuk a cserelo RegExp-et

			//regex = new XRegExp(pattern, 'gim'); //case insensitive, multiline, global replace
			regex = new XRegExp(pattern, 'gim');
			//Cyclic replace of the
			selectComponentName = key + '-component';

			if (selectComponentName in this.advancedSelectComponents) {
				value = this.advancedSelectComponents[selectComponentName].getActualValue();
			}
			else {
				value = Ext.fly(key).dom.value;
			}


			template = template.replace(regex, value);
		}

		return template;
	},

	/**
	 * A backendtol kapott datum string alapjan general egy objektumot
	 *
	 * @param dateString 1981-8-1 formatumu szoveg
	 *
	 * @return {Date} A bemeneti karakterstringbol letrehozott Date object
	 */
	generateDateObject : function (dateString) {
		var dateArr = dateString.split('-'),
			y = dateArr[0] || 0,
			m = dateArr[1] - 1 || 0,
			d = dateArr[2] || 0;

		return new Date(y, m, d);
	},

	/**
	 * Input elemek FocusIn esemenykezeloje
	 */
	onInputFocus : function (ev, target) {
		var field = Ext.get(target.id);

		// Megjelenitjuk a segitseget a kitolteshez,
		// ha a user belekattint es eltuntetjuk a hibauzenetet
		if (this.showHint(field)) {
			this.hideError(field);
		}

		// ha van success jelzes, de valamiert atirja megis - rosszul - akkor tuntessuk el az ikont
		if (field.parent().child(this._successClass)) {
			field.parent().child(this._successClass).addClass(this._hideClassName);
		}

		if (field.parent().findParent(this._rejectedFieldCls.dot(), 10, true)) {
			var wrap = field.parent().findParent(this._rejectedFieldCls.dot(), 10, true);
			if (!wrap.data('original')) {
				wrap.addClass('validateOriginal').data('original', field.getValue());
			}
		}
		else if (field.hasClass(this._rejectedFieldCls) && !field.hasClass('validateOriginal')) {
			field.addClass('validateOriginal');
			field.data('original', field.getValue());
		}
	},

	/**
	 * Input elemek Blur esemenykezeloje
	 */
	onInputBlur : function (ev, target) {
		//Ha az adott input nem szerepel a tiltolistan, akkor tovabbengedjuk
		if (this.inputBlackList.indexOf(target.id) !== -1) {
			return;
		}

		var field = Ext.get(target.id);

		//Fontos az Ext.get mivel atadjuk egy masik fuggvenynek,
		//ahol muveleteket akarunk vele vegezni a kesobbiekben!!!
		this.startValidation(field);

		//Eltuntetjuk a segitseget a kitolteshez, ha a user belekattint
		this.hideHint(field);

		// Leszedjuk, ha valamiert megis rajta maradna
		field.removeClass(this.focusCls);
	},

	/**
	 * Select elemek Change esemenykezeloje
	 *
	 * @param {obj} ev
	 * @param {obj} target
	 */
	onSelectChange : function (ev, target) {
		//Ha advancedSelect komponensrol van szo, akkor azt hasznaljuk, ha nem akkor pedig a targetet magat
		var isTargetAdvancedSelect = target.name === 'AdvancedSelectComponent',
			select = isTargetAdvancedSelect
				? target.getElement()
				: target,
			rejectedEl = select.parent().next(this._rejectedCls.dot());
		if (rejectedEl) {
			rejectedEl.jq().protipShow({
				trigger : 'hover'
			}).protipHide();
		}

		if (isTargetAdvancedSelect) {
			//Frissitjuk a kapcsolodo mezoket, ha szukseg van ra/ha vannak ilyenek
			var valueChanged = ev.valueChanged;
			this.updateLinkedFields(target, valueChanged);
		}

		//Eltuntetjuk a hiba bubit a select korul
		this.hideError(select);
		//Atadjuk a validalando elem referenciajat
		this.startValidation(select);
		//3 melysegre visszamenoleg lekerdezzuk azt a szulo elemet amely rendelkezik a TC classal
		//Ezt atadjuk az eltavolitast kezelo metodusnak
		this.removeInfoTooltip(Ext.get(target));
	},

	/**
	 * AdvancedSelect open event handler.
	 *
	 * @param target
	 */
	onSelectOpen : function (target) {
		var targetEl = Ext.get(target),
			rejectedEl = targetEl.parent().next(this._rejectedCls.dot());

		if (rejectedEl) {
			rejectedEl.jq().protipShow();
		}
	},

	/**
	 * Input elemek ertek valtozasanak esemenykezeloje
	 *
	 * @param {obj} ev
	 * @param {obj} target
	 */
	onInputChange : function (ev, target) {
		var field = Ext.get(target);
		this._inputFirstPressHappened = false;

		this.removeInfoTooltip(field);

		if (field.hasClass(this._ucfirstClass)) {
			target.value += '';
			var f = target.value.charAt(0).toUpperCase();
			target.value = f + target.value.substr(1);
		}
	},

	/**
	 * Az advanced select komponensbol erkezo esemeny.
	 * Akkor fut le, ha karakter tipusu billentyuleutes tortenik az input elementen
	 *
	 * @param e
	 * @param cmp A komponens
	 */
	onCharKeyUp : function (e, cmp) {
		var targetEl = Ext.get(cmp.id),
			rejectedEl = targetEl.parent(this._tooltipContainerClass).next(this._rejectedCls.dot());

		this.removeInfoTooltip(targetEl);

		if (rejectedEl) {
			rejectedEl.jq().protipHide();
		}
	},

	/**
	 * Eltavolitja a DOM-bol a parameterkent kapott mezo testverisegeben levo, megjelolt infoToolTipet
	 *
	 * @param {Ext.Element} tooltipContainer  A tooltipeket tartalmazo kontener
	 */
	removeInfoTooltip : function (tooltipContainer) {
		if (tooltipContainer) {
			var ttEl = tooltipContainer.parent().select('i.protip').item(0);
			if (ttEl && ttEl.hasClass(this._hideOnChangeClass)) {
				this.hideError(ttEl, false);
			}
		}
	},

	/**
	 * Specialis metodus, frissiti/torli/beallitja a parameterben kapott elemhez valamilyen modon kapcsolodo mezok ertekeit
	 * @param select AdvancedSelect elem
	 * @param {boolean} valueChanged tortent-e ertekvaltozas vagy csak ugyanazt valasztottam ki
	 */
	updateLinkedFields : function (advancedSelect, valueChanged) {
		var self = this,
			selectedEl,
			subCategories,
			selectedOptionValue;

		this.fireEvent(Form.EVENT_LINKED_FIELD_UPDATE, {
			advancedSelectEl : advancedSelect,
			valueChanged     : valueChanged
		});

		//Toroljuk a advancedSelect mezo alapertelmezett option szovegeit (pl.: 'Please Choose')
		advancedSelect.removeElement(this._emptyOptionClass);

		switch (advancedSelect.id) {
			case 'state-component':
				//Toroljuk az alapertelmezetetn a geoIP alapjan beallitott state/nationality ertekeket
				this.removeGeoIpValues(advancedSelect);
				break;
			case 'beneficiaryCountry-component':
			case 'country-component':
				//Toroljuk az alapertelmezetetn a geoIP alapjan beallitott state/nationality ertekeket
				this.removeGeoIpValues(advancedSelect);

				selectedEl = advancedSelect.getSelectedOptionElement();

				var	countryCode = selectedEl.dom.value;
				//Country valsztaskor figyelnunk kell, hogy mit valaszt, mert
				//US eseten meg kell jelenitenunk a 'State' modult is.
				//Megvizsgaljuk, hogy el kell tuntetni, vagy meg kell jeleniteni a state selectet
				this.updateStateModuleVisibility(countryCode);

				// In the Payout options, in the Wire Transfer option
				this.updateChexxFormFieldsVisibility(countryCode);

				//data-zip-code-required
				var zipEl = Ext.get(this.zipInputId);
				if (zipEl && !this.noRequireZipPlease) {
					var zipRowEmEl = zipEl.findParent(this.formRowSel, 20, true).select('label em').item(0),
						valObj = Config.get('validationObj');
					if (parseInt(selectedEl.dom.getAttribute(this.zipCodeDataSelector), 10)) {
						valObj.data.modules.zip.rules[0].mandatory = true;
						Config.set('validationObj', valObj);
						if (zipRowEmEl) {
							zipRowEmEl.removeClass('hidden');
						}
					}
					else {
						valObj.data.modules.zip.rules[0].mandatory = false;
						Config.set('validationObj', valObj);
						if (zipRowEmEl) {
							zipRowEmEl.addClass('hidden');
						}
					}
				}

				//Specialis AjaxParams atadasa a city advancedSelect komponensnek
				var cityComponent = this.getCityComponent();

				if (cityComponent) {
					Ext.apply(
						cityComponent.ajaxParams,
						{
							countryCode : countryCode
						}
					);
				}

				// Company reg managing director reg ID Pages handling
				// Shows data-page-number-of-id
				var pageNumberOfId = parseInt(selectedEl.data('pageNumberOfId'), 10);

				if (pageNumberOfId) {
					this._uploadBlockElements.each(function () {
						var blockId = parseInt(this.id.replace(self._uploadBlockClassPrefix, ''), 10);

						if (pageNumberOfId >= blockId) {
							this.parent().removeClass(self._hideClassName);
						}
						else {
							this.parent().addClass(self._hideClassName);
						}
					});
				}
				break;

			case 'documentType-component':
			case 'documentType':
				this.getDocumentImageElementList();

				//Lekerdezzuk a modul nevet
				selectedEl = advancedSelect.getSelectedOptionElement();

				var	inputElem = Ext.get('idNumber'),
					moduleName = this._fields[advancedSelect.id],
					rules = this._modules[moduleName].rules,
					length = rules.length;

				//Vegigmegyunk a modul szabalyain
				for (let i = 0; i < length; i++) {
					//Eltaroljuk a szabalyok tombjet, ill az indexet
					var rule = rules[i],
						regexpList = rule.regexpList,
						idx = parseInt(selectedEl.dom.value, 10);

					if (rule.rule_type === 'regexp' && regexpList && regexpList[idx]) {
						//Kicserelejuk a szabalyt
						rule.rule = regexpList[idx];
					}
				}

				//Kicsereljuk az id kepet
				length = this._documentImageElementList.getCount();
				for (let i = 0; i < length; i++) {
					var documentImageElement = this._documentImageElementList.item(i),
						clsName = this._documentImageIdPrefix + '_' + selectedEl.dom.value;
					if (documentImageElement.dom.classList.contains(clsName)) {
						documentImageElement.removeClass('hide');
					}
					else {
						documentImageElement.addClass('hide');
					}
				}

				// Hide expiration date if not mandatory
				if (parseInt(selectedEl.dom.getAttribute(this.expiryDateDataSelector), 10)) {
					Ext.each(this._modules.idExpiryDate.rules, function (currentRule) {
						Ext.get(self.moduleExpiryDateSelector).removeClass('hidden');

						if (currentRule.hasOwnProperty('mandatory')) {
							currentRule.mandatory = true;
						}
					});
				}
				else {
					Ext.each(this._modules.idExpiryDate.rules, function (currentRule) {
						Ext.get(self.moduleExpiryDateSelector).addClass('hidden');

						if (currentRule.hasOwnProperty('mandatory')) {
							currentRule.mandatory = false;
						}
					});
				}

				//Ha szukseg van ra akkor validalunk az uj szabalyok alapjan
				if (Validator.empty(inputElem.dom.value)) {
					this.startValidation(inputElem);
				}

				break;

			case 'nudityCategoryType-component':
			case 'nonNudityCategoryType-component':
				//kell egy value, aztan a value alapjan fel kell keresni az uj selecteket a subcategory listaba betenni
				var selectedCategory = Ext.fly(advancedSelect.id).dom.getAttribute('data-category'),
					subCategoriesList = [];

				selectedOptionValue = Ext.fly(advancedSelect.id).select('option[selected]').item(0).dom.value;
				subCategories = Config.get('selectCategory').subCategoriesByCategoryType[selectedCategory][selectedOptionValue]; // eslint-disable-line

				for (key in subCategories) {
					subCategoriesList.push({
						value       : key,
						name        : subCategories[key].label,
						textContent : subCategories[key].name
					});
				}

				switch (selectedCategory) {
					case 'nudity':
						componentName = 'nuditySubCategory-component';
						break;
					case 'non_nudity':
						componentName = 'nonNuditySubCategory-component';
						break;
					default:
						break;
				}
				this.advancedSelectComponents[componentName].disableMask();
				this.advancedSelectComponents[componentName].updateElementList(subCategoriesList, true);
				break;

			case 'hotFlirtCategoryType-component':
				var	jsObjectData = Config.get('selectCategory'),
					// Bejarjuk a jsobjectet, lekerjuk a kivalsztott hotflirt kategoria alkategoriait (ami csak egy)
					// .... Ennek az egy alkategorianak az object key-e lesz a subcategory value
					subCategory = Object.keys(subCategories)[0];

				// Kiszedjuk a jsObjectbol a kivalasztott elemhez tartozo subcategory erteket.
				selectedOptionValue = Ext.fly(advancedSelect.id).select('option[selected]').item(0).dom.value;
				subCategories = jsObjectData.subCategoriesByCategoryType.hot_flirt[selectedOptionValue];

				Ext.fly('hotFlirtSubCategory').set({
					value : subCategory
				});
				break;

			case 'bankCountry-component':
				var params = {
					bankCountry : advancedSelect.getActualValue()
				};
				if (valueChanged) {
					this.overlayComponent = Config.get('OverlayElement');
					this.overlayComponent.getOverlay(advancedSelect.ajaxServiceUrl, params);
				}
				break;
			case 'photosFilter-component':
				if (valueChanged) {
					Ext.fly(this.photosFilterFormId).dom.submit();
				}
				break;
			case 'snapshotGalleryOrder-component':
				if (valueChanged) {
					Ext.fly(this.snapshotGalleryFilterFormId).dom.submit();
				}
				break;
			case 'recipientType-component':
				var url = advancedSelect.ajaxServiceUrl + '?' + advancedSelect.element.dom.name + '='
						+ advancedSelect.getSelectedOptionElement().getAttribute('value');

				this.overlayComponent = Config.get('OverlayElement');
				this.overlayComponent.getOverlay(url);
				break;
			case 'delivery-component':
				selectedEl = advancedSelect.getSelectedOptionElement();
				var	value = selectedEl.dom.value,
					row = Ext.get('row_phone');

				switch (parseInt(value, 10)) {
					case 1:
					case 2:
						this.animateInputShow(row);
						break;
					case 3:
						this.animateInputHide(row);
						break;
				}
				break;
			default:
				/* develblock:start */
				console.log('default: updateLinkedFields with ID:', advancedSelect.id);
				/* develblock:end */
				break;
		}
	},

	/**
	 * Megallapitja, hogy az atadott select element country valaszto-e
	 *
	 * @param element A vizsgalni kivant select
	 * @returns {boolean}
	 */
	isCountrySelect : function (element) {
		switch (Ext.fly(element).dom.id) {
			case 'beneficiaryCountry-component':
			case 'country-component':
				return true;
			default:
				return false;
		}
	},

	/**
	 * Visszaadja az eppen elofordulo city select komponenst
	 *
	 * @returns {*} A city komponens
	 */
	getCityComponent : function () {
		return this.advancedSelectComponents['city-component'] ||
			this.advancedSelectComponents['beneficiaryCity-component'];
	},

	/**
	 * A geoIp altal generalt ertekek atallitasaert felelos fg
	 *
	 * @param advancedSelect Az advancedSelect amire kattintott
	 */
	removeGeoIpValues : function (advancedSelect) {
		//Kiolvassuk a configban letett geoIp adatokat
		var geoIpData = Config.get(this._globalObjName).geoIpData,
			stateField = Ext.get('select_state'),
			isSelectStateVisible = stateField && stateField.parent('span').hasClass(this._hideFloatLeftClass),
			selectStateCmp = this.advancedSelectComponents['state-component'],
			self = this;

		//Country valasztaskor az allamot es a nationalityt 'Please choose'-ra kell aliitani TODO: nationality-t miert kell? [szokasos]
		if (this._defaultGeoIpValue && this.isCountrySelect(advancedSelect) && !isSelectStateVisible) {
			//Default option letrehozasa
			var option = {
				tag   : 'option',
				html  : Config.get(this._globalObjName).emptySelectOption,
				class : this._emptyOptionClassName
			};
			//Default option hozzaadasa es beallitasa
			if (selectStateCmp) {
				selectStateCmp.addElement(option, true);
				selectStateCmp._optionElements.each(function () {
					if (this.dom.hasAttribute('selected')) {
						this.dom.removeAttribute('selected');
					}
					if (this.hasClass(self._emptyOptionClassName)) {
						this.dom.setAttribute('selected', 'selected');
					}
				});
			}
			// TODO: ez nem kell szerintem [szokasos]
			/*if (this.advancedSelectComponents['nationality-component']) {
			 this.advancedSelectComponents['nationality-component'].addElement(option, true);
			 }*/
		}

		var citySelect = this.getCityComponent();

		//Country vagy State esteen vissza kell allitani a cimet uresre, ha meg az eredeti erteken van
		if (citySelect && (this.isCountrySelect(advancedSelect) || advancedSelect.id === 'state-component')) {
			//Varos ertekeket tartalmazo select-input elem referenciaja
			var cityInput = citySelect.getTextInputElement();

			//Kitoroljuk az alapertelmezetten megadott varos erteket
			if (geoIpData.city && this._isDefaultCityValueAdded && geoIpData.city === cityInput.dom.value) {
				citySelect.clear(true);
				this.hideOkIcon(cityInput);
			}
			//Kitoroltuk a default erteket
			this._isDefaultCityValueAdded = false;
			//Ha az orszag, vagy az allam valtozik, akkor a varoshoz tartozo infoTooltipet is eltuntetjuk
			this.removeInfoTooltip(cityInput);
			//Ha az orszag valtozott akkor toroljuk a nationalityhez tartozo infotooltipet
			if (this.isCountrySelect(advancedSelect) && Ext.fly('nationality')) {
				this.removeInfoTooltip(Ext.get('nationality'));
			}
		}
	},

	/**
	 * State modul megjeleniteset/eltunteteset vegzo fgv.
	 *
	 * @param countryCode A country select erteke
	 */
	updateStateModuleVisibility : function (countryCode) {
		var selectState = Ext.get('select_state');

		if (!selectState) {
			return;
		}

		var stateElementParent = selectState.parent();

		if (countryCode === 'US') {
			this.animateInputShow(stateElementParent);
		}
		else {
			this.animateInputHide(stateElementParent);
		}
	},

	/**
	 * Wire transfer fields update.
	 * Will be refactored, according to the backend guys ;)
	 */
	updateChexxFormFieldsVisibility : function (countryCode) {
		var fieldsToKeep;

		if (this.element.dom.id !== 'savePayoutChexxContent') {
			return;
		}
		if (!countryCode) {
			fieldsToKeep = [
				'country'
			];
		}
		else if (countryCode === 'US') {
			fieldsToKeep = [
				'country',
				'abaCode',
				'accountNumber',
				'beneficiaryName',
				'beneficiaryCountry',
				'city',
				'address',
				'accountType',
				'minimumAmount'
			];
		}
		else {
			fieldsToKeep = [
				'country',
				'bankName',
				'swiftCode',
				'ibanAccountNumber',
				'beneficiaryName',
				'beneficiaryCountry',
				'city',
				'address',
				'minimumAmount'
			];
		}

		for (i in this._fields) {
			var el = Ext.fly(i).findParent('.form_row', 5, true),
				handlerFn = fieldsToKeep.indexOf(i) > -1 ? this.animateInputShow : this.animateInputHide;

			handlerFn.call(this, el);
		}
	},

	animateInputShow : function (el) {
		var self = this;
		TweenMax.to(
			el.dom,
			0.3,
			{
				opacity    : 1,
				float      : 'left',
				height     : '60px',
				display    : 'block',
				onComplete : function () {
					el.removeClass(self._hideFloatLeftClass);
				}
			}
		);
	},

	animateInputHide : function (el) {
		var self = this;
		TweenMax.to(
			el.dom,
			0.3,
			{
				height     : 0,
				opacity    : 0,
				display    : 'none',
				onComplete : function () {
					el.addClass(self._hideFloatLeftClass);
				}
			}
		);
	},

	/**
	 * Displays a Hint next to the corresponding field
	 *
	 * @param field
	 */
	showHint : function (field) {
		if (Ext.fly(field).parent().child(this._hintClass)) {
			TweenMax.to(
				Ext.fly(field).parent().child(this._hintClass).dom,
				0.2,
				{
					opacity : 1
				}
			);
			return true;
		}

		return false;
	},
	/**
	 * Hides the hint window if exists
	 *
	 */
	hideHint : function (field) {
		if (Ext.fly(field).parent().child(this._hintClass)) {
			TweenMax.to(
				Ext.fly(field).parent().child(this._hintClass).dom,
				0.2,
				{
					opacity : 0
				}
			);
		}
	},
	/**
	 *    Shows an error message bound to the field. if field is null, or 'general' it shows a
	 *    window with error message.
	 *
	 *    @param field    Validalando elem
	 *    @param msg      Hiba uzenet
	 *
	 *    @todo: normailze field: accept only string (name of the field)
	 */
	showError : function (field, msg) {
		var doShow = function(tooltipEl, errorEl, title) {
			errorEl.addClass('error');
			// Hide previous error first
			tooltipEl.jq().protipHide();
			tooltipEl.jq().protipShow({
				title   : title,
				icon    : 'alert',
				trigger : 'sticky'
			});
		};

		// ha van succes jelzes, de valamiert atirja megis - rosszul - akkor tuntessuk el az ikont
		this.hideOkIcon(field);

		if (field.attr('type') === 'checkbox') {
			field = field.findParent('.protip', 5, true);
			doShow(field, field, msg || field.data('ptTitle'));
		}
		else if (field.hasClass('protip')) {
			doShow(
				field,
				field,
				msg || field.data('ptTitle')
			);
		}
		else if (field.findParent('.inputs', 10, true)) {
			doShow(
				field.findParent('.inputs', 10, true),
				field.parent().child('input'),
				msg || field.findParent('.inputs', 10, true).data('ptTitle') || field.data('ptTitle')
			);
		}
		else if (field.findParent(this._selectContainerClass, 5, true)) {
			doShow(
				field.findParent(this._selectContainerClass, 5, true),
				field.parent().child('input'),
				msg || field.findParent('.inputs', 10, true).data('ptTitle')
			);
		}
		else {
			doShow(field, field, msg || field.data('ptTitle'));
		}

		this.hideRejectedWarning(field);
	},
	/**
	 * Eltunteti a megadott hibauzenet tooltipet
	 *
	 * @param {Ext.element} field A validalas utan hibas mezo elem
	 * @param {boolean} showOkIcon Kell-e OK ikon megjelenites
	 *
	 * @return {void}
	 */
	hideError : function (field, showOkIcon) {
		var actAsText = [
			null,
			'text',
			'password'
		];

		if (typeof showOkIcon === 'undefined') {
			showOkIcon = true;
		}
		//Ha nincs megadva field, akkor visszaterunk
		if (!field) {
			return;
		}

		var type = field.dom.tagName.toLowerCase() === 'object' ? 'uploader' : field.attr('type');

		var parent;

		if (showOkIcon === true) {
			this.showOkIcon(field);
		}

		// Levesszuk a mezorol az errort jelzo css classt
		// beallitjuk a mezonek az errort jelzo css classt
		// ha ez egy select akkor a selectContainernek kell adni
		if (type === 'checkbox') {
			field.findParent('.protip', 5, true).jq().protipHide();
		}
		else if (field.findParent(this._selectContainerClass, 5, true)) {
			field.parent().select('input').item(0).removeClass(this._errorClassName);
			parent = field.findParent('.protip', 5, true);
			if (parent) {
				parent.jq().protipHide();
			}
		}
		else if (actAsText.indexOf(type) + 1) {
			parent = field.findParent('.protip', 5, true);
			field.removeClass(this._errorClassName);
			if (parent) {
				parent.jq().protipHide();
				parent.removeClass(this._errorClassName);
			}
		}
		else if (field.findParent('.inputs', 10, true)) {
			field.findParent('.inputs', 10, true).jq().protipHide();
		}
		else if (type === 'uploader') {
			var icon = field.parent().parent().select('i').item(0);
			field.removeClass(this._errorClassName).jq().protipHide();
			if (icon) {
				icon.addClass('hide').jq().protipHide();
			}
		}
		else {
			field.removeClass(this._errorClassName);
			field.jq().protipHide();
		}
	},

	/**
	 *
	 */
	hideRejectedWarning : function (field) {
		// Hide Rejected protip
		var blockEl = Ext.get(field).findParent('.inputs', 10, true);

		if (!blockEl) {
			return;
		}

		var rejectedEl = blockEl.hasClass(this._rejectedFieldCls)
							? blockEl
							: blockEl.select(this._rejectedFieldCls.dot()).item(0);

		if (rejectedEl) {
			rejectedEl.jq().protipHide();
		}
	},

	/**
	 * Get icon of a field.
	 *
	 * @param field   Form field
	 * @param iconSel Icon selector
	 * @returns {*}
	 */
	getIcon : function (field, iconSel) {
		if (!field || !iconSel) {
			return;
		}

		// In case of uploadblock, we do not find the first parent
		var fieldParent = field.findParent(this._uploadBlockClass, null, true) || field.parent();

		if (fieldParent) {
			var icon = fieldParent.child(iconSel);
			return icon;
		}
		return false;
	},

	/**
	 * Megjelenítjuk a valid jelzest
	 *
	 * @param {Ext.element} field A validalt mezo elem
	 * @return {Object} OK Icon
	 */
	showOkIcon : function (field) {
		var icon = this.getIcon(field, this._successClass);

		// If we simple don't have rejected tooltip
		if (field && icon) {
			icon.removeClass('hide');
		}

		if (field) {
			field.removeClass(this._errorClassName);
		}

		return icon;
	},

	/**
	 * Eltuntetjuk a valid jelzest
	 *
	 * @param {Ext.element} field A validalt mezo elem
	 * @return {Object} OK Icon
	 */
	hideOkIcon : function (field) {
		var icon = this.getIcon(field, this._successClass);

		if (field && icon) {
			icon.addClass('hide');
		}

		return icon;
	},

	/**
	 * Submits form when clicking on submit button
	 */
	onSubmitClick : function (ev, target) {
		if (target.className.indexOf('noAjax') > -1) {
			return true;
		}

		// Submit with prevalidation
		if (this._prevalidationNeeded && this.element.select('input[type="password"]').length) {
			this.validateAllFields();

			this._submitWaitTimer = new Timer({
				repeatCount : 1,
				delay       : 50
			});

			this._submitWaitTimer.un(Timer.TimerEvent.TIMER, this.submitFormWithPassword, this);
			this._submitWaitTimer.on(Timer.TimerEvent.TIMER, this.submitFormWithPassword, this);
			this._submitWaitTimer.start({
				ev     : ev,
				target : target
			});

			ev.preventDefault();
			ev.stopPropagation();
			return true;
		}
		else if (this._prevalidationNeeded) {
			this.validateAllFields();
			if (!this.hasInValidFields()) {
				this.submitForm(ev, target);
			}
			else {
				ev.preventDefault();
				ev.stopPropagation();
				return false;
			}
		}
		// Submit without prevalidation
		else {
			this.submitForm(ev, target);
		}
	},

	/**
	 * In Froms with password, we apply prevalidation.
	 *
	 * @param config
	 * @returns {boolean}
	 */
	submitFormWithPassword : function (config) {
		// Checking that there is any ajax validation in progress
		if (Object.keys(this._isAjaxValidationInProgress).length > 0) {
			// Ajax in progress, rechecking until its done
			this.disableSubmitClick();
			// TODO: megoldani hogy ha JS hiba van akkor ne fusson vegtelen
			this._submitWaitTimer.restart({ ev : config.ev, target : config.target });
			return;
		}
		this.enableSubmitClick();


		// If no ajax validation in progress, checking the form's invalid fields
		if (!this.hasInValidFields() &&
			!this._submitButtonClicked &&
			!this._submitButtonElements.item(0).hasClass('disabled')) {
			// invalid fields doesnt exists, sending is not in progress, all ok, send the form
			Chaos.fireEvent(Form.GLOBALEVENT_FORM_SUBMIT, config);
			this.disableSubmitClick();
			this.element.dom.submit();
			return true;
		}
		// Validation is not ok.
		this.enableSubmitClick();
		return false;
	},

	/**
	 * Form submit method.
	 *
	 * @param config
	 * @returns {boolean}
	 */
	submitForm : function (ev, target) {
		if (!this._submitButtonClicked && !this._submitButtonElements.item(0).hasClass('disabled')) {
			Chaos.fireEvent(Form.GLOBALEVENT_FORM_SUBMIT, { scope : this, ev : ev, target : target });
			this.disableSubmitClick();
			return true;
		}
		ev.preventDefault();
		ev.stopPropagation();
		return false;
	},

	/**
	 * Runs when an ajax submit trigger fired ( select change, input change...)
	 */
	onAjaxSubmitTrigger : function (ev, target) {
		var self = this,
			el = target._selectElement;

		if (!this.sendWithAjax) {
			return;
		}

		if (this.onAjaxSend) {
			this.onAjaxSend(this._dataSender);
		}

		this.showOkIcon(el);

		setTimeout(function () {
			self.hideOkIcon(el);
		}, 2000);

		this._dataSender.dataSender();
	},


	/**
	 * Clear all the inputs of the Form
	 */
	onClearButtonClick : function (ev) {
		ev.preventDefault();
		ev.stopPropagation();

		this._inputElements.each(function () {
			this.dom.value = '';

			Chaos.fireEvent(Form.GLOBALEVENT_INPUT_CLEAR, { scope : this, ev : ev });
		});
	},

	/**
	 * Submit form on keydown event too
	 *
	 * @param {obj} ev       event
	 */
	onSubmitKeyDown : function (ev) {
		var charCode = ev.getCharCode();
		if (ev.target.nodeName && ev.target.nodeName === 'INPUT') {
			if (charCode === 13 && !ev.shiftKey && this.isDisabledOnEnter === false) { // ENTER pressed
				this.disableSubmitClick();
			}
			else if (charCode === 13 && ev.shiftKey) {
				ev.preventDefault();
			}
		}
	},

	/**
	 * Enables the disabled submit button
	 */
	enableSubmitClick : function () {
		this._submitButtonClicked = false;

		this._submitButtonElements.each(function () {
			this.removeClass('disabled');
			this.dom.removeAttribute('disabled');
		});
	},

	/**
	 * Disable to submit the form for 5 seconds after you submitted.
	 *
	 */
	disableSubmitClick : function () {
		if (!this._submitButtonElements || this._submitButtonElements.item(0).hasClass('noDisable')) {
			return;
		}
		this._submitButtonClicked = true;
		this._submitButtonElements.addClass('disabled');

		var disableSubmitTimer = new Timer({
			repeatCount : 1,
			delay       : 5000
		});

		disableSubmitTimer.on(Timer.TimerEvent.TIMER, this.onSubmitTimerComplete, this);
		disableSubmitTimer.start();
	},

	/**
	 * A submit gomb setTimeout lejartanak esemenykezeloje
	 */
	onSubmitTimerComplete : function () {
		this._submitButtonClicked = false;
		this._submitButtonElements.removeClass('disabled');

		if (this._submitButtonElements.removeAttribute) {
			this._submitButtonElements.removeAttribute('disabled');
		}
	},

	/**
	 * Radio vagy check box eseten kattintas
	 *
	 * @param {obj} ev            description
	 * @param {obj} target        description
	 *
	 * @return void;
	 */
	onSetCheckClick : function (ev, target) {
		var targetEl = Ext.get(target),
			currentTarget = target,
			currentTargetId = currentTarget.id,
			currentCheckElement = currentTargetId.replace(currentTargetId.split('-')[0] + '-', ''),
			hiddenInputEl = Ext.get(currentCheckElement),
			errorTooltip = targetEl.parent() ? targetEl.parent().child(this._errorContainerClass) : false;

		if (errorTooltip) {
			this.hideError(errorTooltip, false);
		}

		if (hiddenInputEl) {
			this.setChecked(ev, Ext.get(hiddenInputEl.dom));
		}
	},

	/**
	 * Radio, and Checkbox label click
	 *
	 * @param ev EventObject
	 * @param target Target of the event
	 */
	onCheckLabelClick : function (ev, target) {
		var el = Ext.get(target).prev();

		if (el && typeof el.triggerClick === 'function') {
			el.triggerClick();
		}
	},

	/**
	 * Uploader hiba esemenykezeloje
	 */
	onShowUploadError : function (ev) {
		this.showError(ev.field, ev.msg);
	},

	/**
	 * Uploader hiba esemenykezeloje
	 */
	onHideUploadError : function (ev) {
		this.hideError(ev.field, true);
		this.hideRejectedWarning(ev.field);
	},

	/**
	 * Get checked value of radio button group.
	 *
	 * @param name string Input checkbox name (checkbox group name)
	 * @return string Selected value.
	 */
	getChecked : function (name) {
		var element = Ext.select('input[name="' + name + '"]:checked').item(0);

		if (element) {
			return element.dom.value;
		}

		return false;
	},

	/**
	 * Bejelelolt allapot kezelese, radio vagy check box eseten
	 *
	 * @param   ev        obj          Az esemeny
	 * @param   target  string    Az aktualis HTML elem
	 *
	 * @return void;
	 */
	setChecked : function (ev, target) {
		var hiddenInputEl = Ext.get(target),                                              // @var  hiddenInputEl		  object       A rejtett mezo objektuma
			hiddenInputType = hiddenInputEl.dom.type,                                       // @var  hiddenInputType	      string       A rejtett mezo type erteke
			hiddenInputName = hiddenInputEl.dom.name,                                       // @var  hiddenInputName	      string       A rejtett mezo name erteke
			elIcon = Ext.get(hiddenInputType + '-' + hiddenInputEl.id),            // @var  hiddenInputName       string       A rejtett mezo name erteke
			box = Ext.get('box-' + hiddenInputEl.id),						   // @var  box					  Ext.Element
			hiddenInputChecked = hiddenInputType === 'radio' || ev.type === 'click' // eslint-disable-line
				? hiddenInputEl.dom.checked											// eslint-disable-line
				? false																// eslint-disable-line
				: true																// eslint-disable-line
				: hiddenInputEl.dom.checked;										// eslint-disable-line
		if (elIcon && elIcon.hasClass('disabled')) {
			return;
		}
		if (hiddenInputChecked) {
			if (hiddenInputType === 'radio') {
				//ha kell a radio icont modositani
				var hiddenInputAll = this.element.select('input[name*=' + hiddenInputName + ']');   // Az osszes ugyanolyan name ertekkel rendeklezo rejtett mezo

				Ext.each(hiddenInputAll.elements, function (elem) {
					if (Ext.get('radio-' + elem.id)) {
						Ext.get('radio-' + elem.id)
							.addClass(hiddenInputType + '-inactive')
							.removeClass(hiddenInputType + '-active');
					}
				});

				// ha a radio gomb egy boxban tartozkodik
				// akkor kulon mukodesek lephetnek eletbe
				if (box.hasClass(this._boxSelectorName) || box.hasClass(this._newBoxSelectorName)) {
					this.selectBox(box);
				}
			}
			else if (elIcon) {
				elIcon.removeClass(hiddenInputType + '-inactive');
			}
			hiddenInputEl.dom.checked = true;

			if (elIcon) {
				if (elIcon) {
					elIcon.addClass(hiddenInputType + '-active');
				}
			}
			this.fireEvent(Form.RADIO_CHANGE, this, target);
		}
		else if (hiddenInputType !== 'radio' && !hiddenInputEl.getAttribute('disabled')) {
			if (elIcon) {
				elIcon.addClass(hiddenInputType + '-inactive');
				elIcon.removeClass(hiddenInputType + '-active');
			}
			hiddenInputEl.dom.checked = false;
		}

		//Validaljuk a checkboxot is
		this.startValidation(Ext.get(hiddenInputEl.dom.id));

		if (this._isCategoryBox(target)) {
			this._actualCategoryOptionVal = hiddenInputEl.dom.value;
			this._checkCategoryName('screenName');
		}

		switch (Ext.fly(target).dom.id) {
			case 'hasNoExpiry':
				var module = Ext.get('module-expiry-date');
				var protipHolder = Ext.get('select_expiryDay_expiryMonth_expiryYear');

				if (Ext.fly(target).dom.checked) {
					//module.jq().protipHideInside();
					//$.protip()._hideAll();
					protipHolder.jq().protipHide();

					module.jq().slideUp(function () {
						$(this).addClass(PH.cls.hide);
					});
				}
				else {
					module.jq()
						.removeClass(PH.cls.hide)
						.slideDown(function () {
							// Re-open only error protips, but not info protips.
							//module.jq().protipShowInside();
							//module.jq().find('i').protipHide();
							//$.protip()._showAll();
						});
				}
		}

		return false;
	},

	/**
	 * Sets the radio and checkbox elements to FOCUSED with adding a class.
	 *
	 * @param   ev        obj          Event Object
	 * @param   target  string    Target DON element
	 */
	setFocused : function (ev, target) {
		var icon = Ext.get(target).next('.icon');
		if (icon) {
			icon.addClass('focus');
		}
	},

	/**
	 * Sets the radio and checkbox elements to BLURRED with adding a class.
	 *
	 * @param   ev        obj          Event Object
	 * @param   target  string    Target DON element
	 */
	setBlurred : function (ev, target) {
		Ext.fly(target).next('.icon').removeClass('focus');
	},

	/*
	 * selectBoxok sajatos mukodeseinek lekezelesere szolgalo fgv.
	 *
	 * @param {Ext.Element}    selectedBox    A box
	 *
	 * @return void
	 */
	selectBox : function (selectedBox) {
		Ext.each(this._selectorBoxes.elements, function () {
			var boxEl = Ext.get(this);
			boxEl.jq().protipHideInside();
			boxEl.removeClass('selected');
		});

		selectedBox.addClass('selected');

		this._submitButtonElements.removeClass('disabled');
	},

	/**
	 * Megallapitja, hogy az atadott select element country valaszto-e
	 *
	 * @param element A vizsgalni kivant select
	 * @returns {boolean}
	 */
	_isCategoryBox : function (hiddenInput) {
		var _inputEl = Ext.get(hiddenInput);
		return _inputEl.dom.getAttribute('name') === 'mainCategory' ? true : false;
	},

	/**
	 * Korabban tarolt kategoria alapjan ellenorizzuk a screen nevet
	 *
	 * @private
	 *
	 * @param name {String}     kategorianev bekero elem
	 *
	 * @returns void;
	 */
	_checkCategoryName : function (name) {
		var _inputVal = Ext.get(name).getValue();
		// Ha nem ures az input
		if (_inputVal !== '') {
			this._ajaxValidationList[name].params[name] = _inputVal;
			this._ajaxValidationList[name].params.field = name;
			this.sendValidationAjaxRequest(this._ajaxValidationList[name].url, this._ajaxValidationList[name].params);
		}
	},

	/**
	 * Prevalidation setter method
	 */
	turnOnPrevalidation : function () {
		this._prevalidationNeeded = true;
	},

	/**
	 * Regexp alapu validaciot vegzo metodus
	 * @param {Number} value
	 * @param {Number} min minimum limit
	 * @param {Number} max maximum limit
	 *
	 * @returns bool TRUE|FALSE
	 */
	intervalValidator : function (value, min, max) {
		return value >= min && value <= max;
	},

	/**
	 * Regexp alapu validaciot vegzo metodus
	 * @param {String} value validalando ertek / lehet ures string is
	 * @param {String} pattern validalo szabaly / lehet ures string is
	 * @param {String} modifier validalo szabalyhoz tartozo modosito
	 *
	 * @returns bool TRUE if the value fits the pattern
	 */
	regexpValidator : function (value, pattern, modifier) {
		if (value === null ||
			value === undefined ||
			pattern === null ||
			pattern === undefined) {
			return false;
		}
		//var regexp = new XRegExp(pattern);

		var regexp = new XRegExp(pattern, modifier);
		return regexp.test(value);
	},

	//////////////////
	// AJAX SECTION //
	//////////////////

	/**
	 * Az ajax validalasi folyamat belepesi pontja
	 *
	 * @param {Ext.Element} field A validalando mezo
	 * @param {Object} uniqueParams A mezohoz tartozo egyedi parameterek, melyek az ajax validaciohoz elengedhetetlenek
	 *
	 */
	validateByAjax : function (field, uniqueParams) {
		// Checking that an other event is validating this field at this time. If yes, terminate this validation.
		// An important detail is that the field is want to check the same value or not. If yes, we dont terminate,
		// this new value shall be revalidated.
		if (this._prevalidationNeeded &&
			field.id in this._isAjaxValidationInProgress &&
			this._isAjaxValidationInProgress[field.id] === uniqueParams[field.id]) {
			return;
		}

		//Eltaroljuk a mezo erteket
		var value = field.dom.value,
			//Megvizsgaljuk, hogy szukseg van e ajax hivasra
			sendAjax = this._ajaxValidationList[field.id] && this._ajaxValidationList[field.id].value !== value;

		//Ha szukseg van ra felhivunk a backendre
		if (sendAjax) {
			//Osszefesuljuk a 2 objektumot
			Ext.apply(this._ajaxValidationList[field.id].params, uniqueParams);
			//Meghivjuk az ajax hivast lebonyolito metodust, a megfelelo parameterekkel
			this.sendValidationAjaxRequest(
				this._ajaxValidationList[field.id].url,
				this._ajaxValidationList[field.id].params
			);
			//Elvegezzuk a mezo ertekenek menteset a nyilvantarto objektumba
			this._ajaxValidationList[field.id].value = value;
		}
		//Megnezzuk, hogy a korabbi validalasi eredmeny mi volt
		else if (this._ajaxValidationList[field.id].isValid) {
			//Megjelenitjuk a zold pipat
			this.showOkIcon(field);
		}
		else {
			//Ha nincs szukseg ajax hivasra, (nem valtozott a mezo erteke) akkor megjelenitjuk a korabbi hibauzenentet
			this.showError(field, this._ajaxValidationList[field.id].errorMessage);
			//Eltuntetjuk a pipat a mezo mellol
			this.hideOkIcon(field);
		}
	},

	/**
	 * Ajax kommunikaciot megvalosito metodus
	 *
	 * @param {String} url A megfelelo ajax action url-je
	 * @param {Object} params Az action altal igenyelt parameterek objektuma
	 */
	sendValidationAjaxRequest : function (url, params) {
		// Ha valami miatt nem jonne field a paramsban, akkor is eldocog valahogy a cucc
		if (params.field) {
			this._isAjaxValidationInProgress[params.field] = params[params.field];
		}
		// We need to store and send the actual category value if it was selected
		if (this._actualCategoryOptionVal) {
			params.mainCategoryId = this._actualCategoryOptionVal;
		}

		Ajax.request({
			type    : CONST.TYPE_JSON,
			url     : url,
			params  : params,
			scope   : this,
			success : this.ajaxValidationSuccessHandler,
			error   : this.ajaxValidationErrorHandler,
			failure : this.ajaxValidationFailureHandler,
			method  : CONST.POST
		});
	},

	/**
	 * A sikeres ajax valasz esemenykezeloje
	 *
	 * @param {Object} response Az ajax valaszobjektum
	 */
	ajaxValidationSuccessHandler : function (response, request) {
		if (request.params.field) {
			delete this._isAjaxValidationInProgress[request.params.field];
		}

		var obj = response.json,
			errorReason = obj.data.errorReason,
			status = obj.status,
			field = obj.requestParams ? Ext.get(obj.requestParams.field) : undefined,
			spamExpression = obj.data.spamExpression;

		//Ha a status OK, eltuntetjuk a hibat jelzo elemeket
		if (status === 'OK') {
			if (!spamExpression && InputHighlight.registry[field.dom.id] instanceof InputHighlight) {
				InputHighlight.registry[field.dom.id].destroy();
			}
			//Eltuntetjuk a hibauzenetet, ha van
			this.hideError(field);
			//Megjelenitjuk a zold pipat
			this.showOkIcon(field);
			//Eltaroljuk a validalas eredmenyet a nyilvantartasban
			this._ajaxValidationList[field.id].isValid = true;
		}
		else {
			//Megjelenitjuk a hibauzenetet
			this.showError(field, errorReason);
			//Eltaroljuk a validalas eredmenyet a nyilvantartasban
			this._ajaxValidationList[field.id].isValid = false;
			//Elmentjuk a hibauzenetet, hogy kesobb is meg tudjuk jeleniteni
			this._ajaxValidationList[field.id].errorMessage = errorReason;

			if (spamExpression) {
				InputHighlight.set(field.dom.id, Array(spamExpression));
			}
		}
	},

	/**
	 * A sikertelen ajax keres esemenykezeloje
	 *
	 * @param {Object} response Az ajax valaszobjektum
	 */
	ajaxValidationFailureHandler : function (response, request) {
		if (request.params.field) {
			delete this._isAjaxValidationInProgress[request.params.field];
		}

		/* develblock:start */
		console.warn('WARNING! Ajax call has failed! --> ', response.status);
		/* develblock:end */
	},

	/**
	 * Ajax szerviz hivasi hiba esemenykezeloje
	 */
	ajaxValidationErrorHandler : function (response, request) {
		if (request.params.field) {
			delete this._isAjaxValidationInProgress[request.params.field];
		}

		/* develblock:start */
		console.warn('WARNING! Ajax call error! --> ');
		/* develblock:end */
	},

	/////////////////////
	// END AJAX SECTION//
	/////////////////////

	/**
	 *
	 * @param ev
	 * @param target
	 */
	onInputKeyDown : function (ev, target) {
		if (this._inputFirstPressHappened !== true) {
			var targetEl = Ext.get(target),
				// tooltip container parent. '.TC'
				parentTC = targetEl.parent(this._tooltipContainerClass),
				tooltip = parentTC ? parentTC.child(this._errorContainerClass) : null,
				rejectedIconEl = parentTC ? parentTC.child(this._rejectedCls.dot()) : null;

			this.hideError(tooltip, false);

			targetEl.removeClass(this._errorClassName);
			// We are checking that we have Content-parts in the rejected message for every field in a module.
			// If we have, we remove the given part from the rejected protip.
			if (rejectedIconEl) {
				rejectedIconEl.jq().protipShow({
					trigger : 'hover'
				}).protipHide();
			}
			this._inputFirstPressHappened = true;
		}
	},

	/**
	 * Destroy method
	 */
	destroy : function () {
		this.unbind();
	},

	/**
	 * Handle editable link click and cancel button
	 * @returns {boolean}
	 */
	onEditableLinkClick : function () {
		var valueHolderEl = Ext.get(this.element.dom.id + this._editableValueHolderIdSuffix);
		var formEl = this.element;
		var defaultValue = valueHolderEl.dom.textContent.trim();
		var self = this;
		var selectEl = formEl.select('select').item(0);

		valueHolderEl.addClass('hide');
		formEl.addClass('show');

		formEl.select('.cancel').removeAllListeners().on('click', function () {
			formEl.removeClass('show');
			valueHolderEl.removeClass('hide');
			if (selectEl && self.advancedSelectComponents[selectEl.dom.id]) {
				self.advancedSelectComponents[selectEl.dom.id].setSelectedOptionElement(defaultValue);
				self.advancedSelectComponents[selectEl.dom.id].setInputElementValue(defaultValue);
			}
			return false;
		}, { single : true });

		return false;
	},

	/**
	 * Binds all basic event listeners.
	 *
	 * @return void
	 */
	bind : function () {
		this._clearButtonElements.on('click', this.onClearButtonClick, this);
		this._submitButtonElements.on('click', this.onSubmitClick, this);
		this._checkBoxElements.on('change', this.setChecked, this);
		this._checkBoxElements.on('focus', this.setFocused, this);
		this._checkBoxElements.on('blur', this.setBlurred, this);
		this._radioButtonElements.on('change', this.setChecked, this);
		this._checkBoxElementsIcons.on('click', this.onSetCheckClick, this);

		this._radioButtonElementsIcons.on('click', this.onSetCheckClick, this);

		this._labelEls.on('click', this.onCheckLabelClick, this);

		this._selectorBoxes.on('click', this.onSetCheckClick, this);
		this._inputElements
			.on('change', this.onAjaxSubmitTrigger, this)
			.on('change', this.onInputChange, this)
			.on('focus', this.onInputFocus, this)
			.on('blur', this.onInputBlur, this)
			.on('keydown', this.onInputKeyDown, this);
		// advancedSelect-ekbol inputjaban tortent karakter tipusu leutes esemenye
		for (let i in this.advancedSelectComponents) {
			var selectEl = this.advancedSelectComponents[i];
			selectEl.on('change', this.onAjaxSubmitTrigger, this);
			selectEl.on('char-key-up', this.onCharKeyUp, this);
		}

		this.element.on('keydown', this.onSubmitKeyDown, this);

		if (this._isEditable && this._editLinkEl) {
			this._editLinkEl.on('click', this.onEditableLinkClick, this);
		}

		this.constructor.superclass.bind.call(this);
	},

	/**
	 * Unbinds all basic event listeners.
	 *
	 * @return void
	 */
	unbind : function () {
		this.autoUnbind();
	}
});

