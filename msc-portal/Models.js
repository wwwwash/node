/* eslint-disable complexity */

import Ext from '../../../lib/vendor/ExtCore';
import Chaos from '../../../lib/chaos/Chaos';
import Connection from '../../../lib/chaos/Connection';
import Page from '../../../lib/chaos/Page';
import Config from '../../../lib/chaos/Config';
import Util from '../../../lib/chaos/Util';
import { Broadcaster } from '../../../lib/chaos/Broadcaster';

import Http from '../../Http/Http';
import Form from '../../_Form/Form';
import PositionSticky from '../../PositionSticky/PositionSticky';
import ModelListFilter from '../../ListFilter/Model';
import ShowMore from '../../ShowMore/ShowMore';
import ProgressIndicator from '../../ProgressIndicator/ProgressIndicator';
import '../../_ToggleOnOff/ToggleOnOff';

import './Models.scss';
import '../../Overlay/AccountSettings/AccountSettings.scss';

export default function ModelsIndex(el, config) {
	ModelsIndex.superclass.constructor.call(this, el, config);
}

/**
 * Global event constant for updating model data elements
 * @type {string}
 */
ModelsIndex.UPDATE_MODEL_DATA_ELEMENTS = 'update-model-data-elements';

Chaos.extend(ModelsIndex, Page, {
	/** @var {String} name          			Az osszes model gomb classa */
	_modelDataButtonClass     : '.modelDataButton',
	/** @var {String} name          			A model adat gombok aktiv classa */
	_selectedModelDataClass   : 'selected',
	/** @var {String} name          			A model lenyilo kontener ID elotagja */
	_modelDataCt              : 'modelDataCt',
	/** @var {String} name          			A model lenyilo kontener active classa */
	_activeDataCtClass        : 'activeDataCt',
	/** @var {String} name          			A model lenyilo belso doboz aktiv classa */
	_activeDataInnerCtClass   : 'activeDataInnerCt',
	/** @var {String} name          			Az aktualisan aktiv model gomb elem */
	_activeButtonEl           : undefined,
	/** @var {ob}                   			Overlay kezelo componens */
	_overlayHandler           : undefined,
	/** @var {obj}                  			Overlay-t tartalmazo container element */
	_overlayContainer         : 'overlayContainer',
	/** @var {obj}                  			A rangeSlider objektum */
	_rangeSlider              : undefined,
	//
	_showMoreBlock            :	undefined,
	//
	_showMorePagesComponents  :	{},
	/** @var {Ext.obj}                  		*/
	_clickedStatusText        : undefined,
	/** @var {Ext.obj}                  		*/
	_statusBoxClass           : '.modelStatusBox',
	/** @var {string}                  			*/
	_activeClass              : 'active',
	/** @var {string}                  			*/
	_passiveClass             : 'passive',
	/* */
	_modelListFilterComponent : undefined,
	/* */
	_modelListContainerId     : 'modelListContainer',
	/** @var {String}			 	            A login folyamatban szereplo form id-ja */
	_formId                   : 'modellist_form',
	/** @var {String}				            Backend altal generalt validacios objektum neve **/
	_validationObjName        : 'validationObj',
	/** @var {String}				            A backend altal generalt hibakodokat es nyelvesitett hibauzeneteket tartalmazo objektum neve*/
	_errorObjName             : 'errorObj',
	/** @var {Array}                            Azoknak az elementeknek az ID-jat tartalmazo tomb, amik epp ajax toltodnek */
	_loading                  : [],

	ui : {
		filterStickWrapper : 'filterStickWrapper',
		pageContainer      : 'pageContainer',
		screenNameFilter   : 'screenNameFilter'
	},

	cmp : {
		filter : {
			name : PositionSticky,
			el   : 'ui.filterStickWrapper'
		}
	},

	/**
	 * Init
	 *
	 * @param {Element} el      This should be the body tag.
	 * @param {Object} config   Config object of this component
	 */
	init : function(el, config) {
		//Add global events in order to enable the update of model data elements
		Chaos.addEvents(
			ModelsIndex.UPDATE_MODEL_DATA_ELEMENTS
		);

		//Bind global events
		Broadcaster.on(ModelsIndex.UPDATE_MODEL_DATA_ELEMENTS, this.updateModelDataButtonsEventHandler, this);

		this.searchElement(Ext.get(el));
		this.modelListContainerElement = Ext.get(this._modelListContainerId);

		// form hasznalatahoz szukseges objektum letrehozasa.overwrite
		var _formEl = Ext.get(this._formId);

		if (_formEl) {
			this._form = new Form(
				_formEl,
				{
					validationObj      : Config.get(this._validationObjName),
					errorObj           : Config.get(this._errorObjName) || {},
					needAjaxValidation : false
				}
			);
		}
		//

		if (this.modelListContainerElement) {
			this._modelListFilterComponent = new ModelListFilter(this.modelListContainerElement, {});
		}

		var self = this;
		if (Ext.get('showMoreHolder')) {
			this._showMoreCmp = new ShowMore(
				self.ui.pageContainer,
				{
					listBlockSel    : '.modelList',
					successCallback : self.ajaxShowMoreSuccessHandler,
					callbackScope   : self
				}
			);
		}

		// Delay first run, we need to wait the switchers
		setTimeout(() => this.bindListeners(true), 500);

		// Init futtatasa
		ModelsIndex.superclass.init.call(this, el, config);
	},

	/**
	 * Ujrakoti az esemenykezeloket az egyes elemekre
	 */
	updateModelDataButtonsEventHandler : function() {
		//Updateli az elemeket
		this.updateElements(this.element);
	},

	/**
	 * Megkeressuk az elemeket az adott tartalmon
	 *
	 * @param element
	 *
	 */
	searchElement : function() {
		var modelListContainerElement = Ext.get(this._modelListContainerId);

		if (modelListContainerElement) {
			// Az osszes model gomb selectora
			this._modelDataButtonEl = modelListContainerElement.select(this._modelDataButtonClass);
		}
	},

	/**
	 * Megkeressuk az elemeket az adott tartalmon
	 *
	 * @param skipLocalBind {boolean} Skips local bind oO
	 *
	 */
	bindListeners : function(skipLocalBind = false) {
		if (!skipLocalBind) {
			this.bind();
		}

		this.element.dom.querySelectorAll('div[data-is=toggle-on-off]').forEach(el =>
			el._tag.on('change-once', ::this.onSwitchClick)
		);
	},

	/**
	 * Megkeressuk az elemeket az adott tartalmon
	 *
	 * @param element
	 *
	 */
	unBindListeners : function() {
		this.autoUnbind();
	},

	/**
	 * A sikeres ajax valasz esemenykezeloje
	 *
	 * @param {Object} response Az ajax valaszobjektum
	 */
	ajaxShowMoreSuccessHandler : function() {
		var _lists = this.element.select('.modelList');
		this._showMorePage = _lists.item(_lists.elements.length - 1).data('page');
		this._newBlock 		= this.element.select('div[data-page=' + this._showMorePage + ']').item(0);
		// Megkeressuk az uj elemeket
		this.searchElement(this._newBlock);
		// Az esemeny kezeloket rakotjuk a friss elemekre
		this.unBindListeners();
		this.bindListeners();
	},

	/**
	 * A kapcsolo kattintas esemenyre a kulso komponens ot hivja meg hogy kosse ra a site specifikus ertekeket
	 *
	 * @param {Object} clickedEl: kattintott elem
	 * @param {Object} scope: this
	 */
	onSwitchClick : async function(isEnabled, tag) {
		this._clickedStatusText = Ext.get(tag.root).parent().select('.detailsMainData').item(0);

		let url = tag.root.dataset.url;
		let performerId = tag.root.dataset.model;

		let response = await Http.post(url, {
			body : {
				isEnabled : Number(isEnabled),
				performerId
			}
		});

		let { helpTipText, status, statusText } = response;
		let modelBox = Ext.get('model_' + performerId);
		let protipEl = this._clickedStatusText.select('.protip').item(0);

		this._clickedStatusText.select('h4').item(0).dom.innerHTML = statusText.toUpperCase();
		protipEl.jq().protipSet({
			title : helpTipText
		});

		if (status) {
			modelBox.select(this._statusBoxClass)
				.item(0).select('span').item(0).dom.innerHTML = status.toUpperCase();

			if (isEnabled) {
				modelBox.addClass(this._activeClass);
				modelBox.removeClass(this._passiveClass);
			}
			else {
				modelBox.addClass(this._passiveClass);
				modelBox.removeClass(this._activeClass);
			}
		}
	},

	/**
	 * Az info ikonra kattintaskor a lenyilo elem megjeleniteset vegzo funkcio
	 *
	 *  @param ev       A klikk esemeny
	 *  @param target   A kattintott elem
	 */
	onModelDataButtonsClick : function(ev, target) {
		ev.stopPropagation();
		ev.preventDefault();

		// Ha a kattintott elem nem a link, talald meg azt
		var clickedEl = Ext.get(target).dom.nodeName === 'a'
				? Ext.get(target)
				: Ext.get(Ext.get(target).findParent('a')),

			activeRow = clickedEl.parent(),
			activeDataCt = activeRow.next('.modelDataContainer'),
			lastActiveCt = this.modelListContainerElement.select('.modelDataContainer.activeDataCt').item(0);

		/*  Ha a kattintott aktiv:
		 *  vedd le a kattintott aktiv classat
		 *  vedd le a kattintott kontener aktiv classat
		 *  vedd le a kattintott belso doboz aktiv classat
		 */

		if (clickedEl.hasClass(this._selectedModelDataClass)) {
			clickedEl.removeClass(this._selectedModelDataClass);
			activeDataCt.removeClass(this._activeDataCtClass);
			this.getModelDataIdToLoad(clickedEl, true).removeClass(this._activeDataInnerCtClass);
		}
		else {
			this._activeButtonEl = this.modelListContainerElement.select(
				this._modelDataButtonClass + '.' + this._selectedModelDataClass
			).item(0);

			var activeDataInnerCt = activeDataCt.select('.' + this._activeDataInnerCtClass).item(0);

			// Ha a kattintott, es az aktiv elem szuloje NEM ugyanaz
			if (!lastActiveCt || lastActiveCt.prev().dom.id !== clickedEl.parent().dom.id) {
				if (lastActiveCt) {
					lastActiveCt.removeClass(this._activeDataCtClass);
				}
				clickedEl.parent().next('.modelDataContainer').addClass(this._activeDataCtClass);
			}

			//A szulotol fuggetlen vedd le az aktiv classt a gombrol es a belso dobozrol
			if (this._activeButtonEl) {
				this._activeButtonEl.removeClass(this._selectedModelDataClass);
			}
			if (activeDataInnerCt) {
				activeDataInnerCt.removeClass(this._activeDataInnerCtClass);
			}

			// Megvizsgaljuk hogy esetleg eppen betoltes alatt van-e. Ha igen berakjuk a loadert.
			if (this._loading.indexOf(this.getModelDataIdToLoad(clickedEl)) > -1) {
				Chaos.fireEvent(
					ProgressIndicator.GLOBALEVENT_ADD_LOCAL_INDICATOR, {
						element : activeDataCt,
						noAnim  : true
					});
			}
			else {
				// Eltuntetjuk az esetleges ajax loadert
				Chaos.fireEvent(
					ProgressIndicator.GLOBALEVENT_REMOVE_LOCAL_INDICATOR, {
						element : activeDataCt, noAnim  : true
					});
			}

			if (!this._activeButtonEl) {
				activeDataCt.addClass(this._activeDataCtClass);
			}
			//Minden esetben adj aktiv classt a kattintott gombnak es a belso doboznak
			clickedEl.addClass(this._selectedModelDataClass);
			// ha a Href-ben URL van akkor az onnan visszakapott adatot betoltjuk az activeDataCt-be
			var isPath = Util.isPath(clickedEl.getAttribute('href')),
				loadedContentEl = this.getModelDataIdToLoad(clickedEl, true);

			if (isPath && !loadedContentEl) {
				this.loadAjaxDataToElement(
					clickedEl,
					activeDataCt,
					function () {
						// Az innerCt-t csak itt tudjuk lekerdezni, es megjeleniteni, mert eddig nem letezett
						var contentEl = this.getModelDataIdToLoad(clickedEl, true);

						if (clickedEl.hasClass('selected')) {
							contentEl.addClass(this._activeDataInnerCtClass);
						}
					}
				);
			}
			// Nem ajaxos betoltes eseten megjelenitjuk az innerCt-t
			else {
				this.getModelDataIdToLoad(clickedEl, true).addClass(this._activeDataInnerCtClass);
			}
		}
	},

	/**
	 * A kattintott modelDataButton alapjan visszaadja hogy mi lesz a betoltendo element id-je, pl stat_342
	 *
	 * @param clickedEl {Object} A kattintott modelDataButton
	 * @param isExtElement {Boolean} Ha true, akkor lekeri az Ext.elementet es azt adja vissza, ha false akkor csak az id-t
	 */
	getModelDataIdToLoad : function(clickedEl, isExtElement) {
		var isIsExtElement = typeof isExtElement !== 'undefined' ? isExtElement : false,
			id = clickedEl.dom.getAttribute('data-buttontype') + '_' + clickedEl.parent().dom.id.split('_')[1],
			ret = isIsExtElement ? Ext.get(id) : id;

		return ret;
	},

	/**
	 * Megadott url-rol ajax-szal valaszt ker, majd betolti azt a megadott
	 * dom elementben. Megadhato egy success callback is.
	 *
	 * @param url {String} ajax url
	 * @param element {Object} ext.element ahova toltodik a valasz
	 * @param callback {Function} success callback fv
	 */
	loadAjaxDataToElement : function(clickedEl, element, callback) {
		var self = this,
			url = clickedEl.dom.href,
			// Ez annak az elementnek az ID-je amit be fogunk tolteni.
			elementIdToLoad = this.getModelDataIdToLoad(clickedEl);

		// Ha mar folyamatban van az adott tartalom betoltese akkor nem futunk le
		if (this._loading.indexOf(elementIdToLoad) > -1) {
			return;
		}

		// Hozzaadjuk a loading tombhoz a betoltendo element id-t
		this._loading.push(elementIdToLoad);

		Chaos.fireEvent(ProgressIndicator.GLOBALEVENT_ADD_LOCAL_INDICATOR, { element : element });

		Connection.Ajax.request({
			url     : url,
			success : function(response) {
				self.loadAjaxDataSuccess(response, element, elementIdToLoad);
				if (typeof callback === 'function') {
					callback.call(self);
				}
			},
			error : function(response) {
				self.loadAjaxDataError(response, element, elementIdToLoad);
			},
			failure : function(response) {
				self.loadAjaxDataError(response, element, elementIdToLoad);
			},
			dataType : 'JSON'
		});
	},

	/**
	 *
	 * @param response
	 */
	loadAjaxDataSuccess : function(response, element, elementIdToLoad) {
		var responseObj = JSON.parse(response.responseText),
			responseBlock = responseObj.data.block;

		Chaos.fireEvent(ProgressIndicator.GLOBALEVENT_REMOVE_LOCAL_INDICATOR, { element : element, noAnim : true });

		var i = this._loading.indexOf(elementIdToLoad);
		if (i !== -1) {
			this._loading.splice(i, 1);
		}

		Ext.DomHelper.insertHtml('afterBegin', element.dom, responseBlock);
	},

	/**
	 *
	 * @param response
	 */
	loadAjaxDataError : function(response, element) {
		Chaos.fireEvent(ProgressIndicator.GLOBALEVENT_REMOVE_LOCAL_INDICATOR, { element : element });
	},

	/**
	 * Updateli az egyes elemeket
	 */
	updateElements : function(element) {
		//Levesszuk az esemenykezeloket
		this.unBindListeners();
		// Megkeressuk az uj elemeket
		this.searchElement(element);
		// Az esemeny kezeloket rakotjuk a friss elemekre
		this.bindListeners();
	},

	/**
	 * Esemenykezelok feliratkozasa
	 */
	bind : function() {
		if (this._modelDataButtonEl) {
			// A model gombokhoz tartozo esemeny
			this._modelDataButtonEl.on('click', this.onModelDataButtonsClick, this);
		}

		this.parentClass.constructor.superclass.bind.call(this);

		if (this.ui.screenNameFilter.exists()) {
			this.ui.screenNameFilter.el().on('focus', function() {
				this.filter.fireEvent(PositionSticky.EVENT_PREVENT_RESIZE);
			}, this);
		}
	},

	/**
	 * Esemenykezelok torlese
	 */
	unbind : function() {
		this.autoUnbind();
	}
});
