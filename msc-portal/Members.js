import Ext from '../../../lib/vendor/ExtCore';
import Chaos from '../../../lib/chaos/Chaos';
import Page from '../../../lib/chaos/Page';
import Config from '../../../lib/chaos/Config';
import Connection from '../../../lib/chaos/Connection';
import { Broadcaster } from '../../../lib/chaos/Broadcaster';

import Form from '../../_Form/Form';
import Overlay from '../../Overlay/Overlay';
import ProgressIndicator from '../../ProgressIndicator/ProgressIndicator';
import PositionSticky from '../../PositionSticky/PositionSticky';
import MemberListFilter from '../../ListFilter/Member';
import ShowMore from '../../ShowMore/ShowMore';

import './Members.scss';

export default function MembersIndex(el, config) {
	MembersIndex.superclass.constructor.call(this, el, config);
}

/**
 * Global event constant for updating member data elements
 * @type {string}
 */
MembersIndex.UPDATE_MEMBER_DATA_ELEMENTS = 'update-member-data-elements';

Chaos.extend(MembersIndex, Page, {

	/** @var {String} name          			Az osszes member gomb classa */
	_memberDataButtonClass       : '.memberDataButton',
	/** @var {String} name          			A member adat gombok aktiv classa */
	_selectedMemberDataClass     : 'selected',
	/** @var {String} name          			A member lenyilo kontener ID elotagja */
	_memberDataCt                : 'memberDataCt',
	/** @var {String} name          			A member lenyilo kontener active classa */
	_activeDataCtClass           : 'activeDataCt',
	/** @var {String} name          			A member lenyilo belso doboz aktiv classa */
	_activeDataInnerCtClass      : 'activeDataInnerCt',
	/** @var {String} name          			Az aktualisan aktiv member gomb elem */
	_activeButtonEl              : undefined,
	/** @var {ob}                   			Overlay kezelo componens */
	_overlayHandler              : undefined,
	/** @var {obj}                  			Overlay-t tartalmazo container element */
	_overlayContainer            : 'overlayContainer',
	/** @var {obj}                  			A rangeSlider objektum */
	_rangeSlider                 : undefined,
	/** @var {String}                 			Disabled link class */
	disabledLinkSel              : 'a.disabled',
	//
	_showMoreBlock               :	undefined,
	//
	_showMorePagesComponents     :	{},
	/** @var {Ext.obj}                  		*/
	_clickedStatusText           : undefined,
	/** @var {Ext.obj}                  		*/
	_statusBoxClass              : '.memberStatusBox',
	/** @var {string}                  			*/
	_activeClass                 : 'active',
	/** @var {string}                  			*/
	_passiveClass                : 'passive',
	/* */
	_memberListFilterComponent   : undefined,
	/* */
	_memberListContainerId       : 'memberListContainer',
	_memberListHeaderContainerId : 'memberListHeaderContainer',
	/** @var {String}			 	            A login folyamatban szereplo form id-ja */
	_formId                      : 'memberlist_form',
	/** @var {String}				            Backend altal generalt validacios objektum neve **/
	_validationObjName           : 'validationObj',
	/** @var {String}				            A backend altal generalt hibakodokat es nyelvesitett hibauzeneteket tartalmazo objektum neve*/
	_errorObjName                : 'errorObj',
	/** @var {Array}                            Azoknak az elementeknek az ID-jat tartalmazo tomb, amik epp ajax toltodnek */
	_loading                     : [],
	/** @var {String}				            Favourite identifier **/
	_favoriteLinkSel             : 'a.favorite',
	/** @var {String}				            Favourite element **/
	_favoriteLinkEl              : undefined,
	/** @var {Object}				            Disabled link elements **/
	_disabledLinkEls             : undefined,
	/** @var {Object}				            Tooltip szovegeket tartalmazo tomb **/
	tooltipTextObj               : {
		favorite   : 'Remove from favourites',
		nofavorite : 'Add to favourites'
	},

	ui : {
		memberListHeaderContainer : 'memberListHeaderContainer',
		pageContainer             : 'pageContainer'
	},

	cmp : {
		stickyFilter : {
			name : PositionSticky,
			el   : 'ui.memberListHeaderContainer'
		}
	},

	/**
	 * Init
	 *
	 * @param {Element} el      This should be the body tag.
	 * @param {Object} config   Config object of this component
	 */
	init : function(el, config) {
		//Add global events in order to enable the update of member data elements
		Chaos.addEvents(
			MembersIndex.UPDATE_MEMBER_DATA_ELEMENTS
		);

		//Bind global events
		Broadcaster.on(MembersIndex.UPDATE_MEMBER_DATA_ELEMENTS, this.updateMemberDataButtonsEventHandler, this);

		this.searchElement();

		this.memberListContainerElement = Ext.get(this._memberListContainerId);
		this.memberListHeaderContainer = Ext.get(this._memberListHeaderContainerId);
		this._favoriteLinkEl = this.element.select(this._favoriteLinkSel);
		this._overlayHandler = Config.get('overlayComponent');

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

		if (this.memberListHeaderContainer) {
			this._memberListFilterComponent = new MemberListFilter(this.memberListHeaderContainer, {});
		}

		// Parse URL if it has member name
		if (window.location.href.indexOf('?memberName') > -1) {
			var params = Util.getUrlParams(window.location.href);

			if (typeof params.memberName === 'string') {
				var url = Chaos.getUrl('MemberProfile/ProfileByName', {
					memberName : params.memberName
				});

				this._overlayHandler.openOverlay(url);
			}
		}

		var self = this;
		if (Ext.get('showMoreHolder')) {
			this._showMoreCmp = new ShowMore(
				self.ui.pageContainer,
				{
					listBlockSel    : '.memberList',
					successCallback : self.ajaxShowMoreSuccessHandler,
					callbackScope   : self
				}
			);
		}

		// Init futtatasa
		MembersIndex.superclass.init.call(this, el, config);
	},

	/**
	 * Ujrakoti az esemenykezeloket az egyes elemekre
	 */
	updateMemberDataButtonsEventHandler : function() {
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
		var memberListContainerElement = Ext.get(this._memberListContainerId);
		if (memberListContainerElement) {
			// Disabled links elements
			this._disabledLinkEls = memberListContainerElement.select(this.disabledLinkSel);
			// Az osszes member gomb selectora
			this._memberDataButtonEl = memberListContainerElement.select(this._memberDataButtonClass);
		}
	},

	/**
	 * Megkeressuk az elemeket az adott tartalmon
	 *
	 * @param element
	 *
	 */
	bindListeners : function() {
		// A member gombokhoz tartozo esemeny
		if (this._memberDataButtonEl) {
			this._memberDataButtonEl.on('click', this.onMemberDataButtonsClick, this);
		}
        //Refresh overlay elements
		Chaos.fireEvent(Overlay.UPDATE_OPEN_OVERLAY_ELEMENTS);
	},

	/**
	 * Megkeressuk az elemeket az adott tartalmon
	 *
	 * @param element
	 *
	 */
	unBindListeners : function() {
		// A member gombokhoz tartozo esemeny levetele
		this._memberDataButtonEl.un('click', this.onMemberDataButtonsClick, this);
	},

	/**
	 * A sikeres ajax valasz esemenykezeloje
	 *
	 * @param {Object} response Az ajax valaszobjektum
	 */
	ajaxShowMoreSuccessHandler : function() {
		// Aktualis member listak
		var memberLists = this.element.select('.memberList');
		this._listBlockLength = memberLists.elements.length - 1;
		this._lastBlock 	= memberLists.item(this._listBlockLength);
		this._newBlock 		= memberLists.item(this._listBlockLength + 1);
		// Megkeressuk az uj elemeket
		this.searchElement(this._newBlock);
		// Az esemeny kezeloket rakotjuk a friss elemekre
		this.unBindListeners();
		this.bindListeners();
	},

	/**
	 * Az info ikonra kattintaskor a lenyilo elem megjeleniteset vegzo funkcio
	 *
	 *  @param ev       A klikk esemeny
	 *  @param target   A kattintott elem
	 */
	onMemberDataButtonsClick : function(ev, target) { // eslint-disable-line
		ev.stopPropagation();
		ev.preventDefault();

		// Ha a kattintott elem nem a link, talald meg azt
		var clickedEl = Ext.get(target).dom.nodeName === 'a'
				? Ext.get(target)
				: Ext.get(Ext.get(target).findParent('a')),

			activeRow = clickedEl.parent(),
			activeDataCt = activeRow.next('.memberDataContainer'),
			lastActiveCt = this.memberListContainerElement.select('.memberDataContainer.activeDataCt').item(0);

		/*  Ha a kattintott aktiv:
		 *  vedd le a kattintott aktiv classat
		 *  vedd le a kattintott kontener aktiv classat
		 *  vedd le a kattintott belso doboz aktiv classat
		 */

		if (clickedEl.hasClass(this._selectedMemberDataClass)) {
			clickedEl.removeClass(this._selectedMemberDataClass);
			activeDataCt.removeClass(this._activeDataCtClass);
			this.getMemberDataIdToLoad(clickedEl, true).removeClass(this._activeDataInnerCtClass);
		}
		else {
			this._activeButtonEl = this.memberListContainerElement
				.select(this._memberDataButtonClass + '.' + this._selectedMemberDataClass).item(0);

			var activeDataInnerCt = activeDataCt.select('.' + this._activeDataInnerCtClass).item(0);

			// Ha a kattintott, es az aktiv elem szuloje NEM ugyanaz
			if (!lastActiveCt || lastActiveCt.prev().dom.id !== clickedEl.parent().dom.id) {
				if (lastActiveCt) {
					lastActiveCt.removeClass(this._activeDataCtClass);
				}
				clickedEl.parent().next('.memberDataContainer').addClass(this._activeDataCtClass);
			}

			//A szulotol fuggetlen vedd le az aktiv classt a gombrol es a belso dobozrol
			if (this._activeButtonEl) {
				this._activeButtonEl.removeClass(this._selectedMemberDataClass);
			}
			if (activeDataInnerCt) {
				activeDataInnerCt.removeClass(this._activeDataInnerCtClass);
			}

			// Megvizsgaljuk hogy esetleg eppen betoltes alatt van-e. Ha igen berakjuk a loadert.
			if (this._loading.indexOf(this.getMemberDataIdToLoad(clickedEl)) > -1) {
				Chaos.fireEvent(
					ProgressIndicator.GLOBALEVENT_ADD_LOCAL_INDICATOR,
					{ element : activeDataCt, noAnim : true }
				);
			}
			else {
				// Eltuntetjuk az esetleges ajax loadert
				Chaos.fireEvent(
					ProgressIndicator.GLOBALEVENT_REMOVE_LOCAL_INDICATOR,
					{ element : activeDataCt, noAnim : true }
				);
			}

			if (!this._activeButtonEl) {
				activeDataCt.addClass(this._activeDataCtClass);
			}
			//Minden esetben adj aktiv classt a kattintott gombnak es a belso doboznak
			clickedEl.addClass(this._selectedMemberDataClass);
			// ha a Href-ben URL van akkor az onnan visszakapott adatot betoltjuk az activeDataCt-be
			var isPath = Util.isPath(clickedEl.getAttribute('href')),
				loadedContentEl = this.getMemberDataIdToLoad(clickedEl, true);

			if (isPath && !loadedContentEl) {
				this.loadAjaxDataToElement(
					clickedEl,
					activeDataCt,
					function () {
						// Az innerCt-t csak itt tudjuk lekerdezni, es megjeleniteni, mert eddig nem letezett
						var contentEl = this.getMemberDataIdToLoad(clickedEl, true);

						if (clickedEl.hasClass('selected')) {
							contentEl.addClass(this._activeDataInnerCtClass);
						}
					}
				);
			}
			// Nem ajaxos betoltes eseten megjelenitjuk az innerCt-t
			else {
				this.getMemberDataIdToLoad(clickedEl, true).addClass(this._activeDataInnerCtClass);
			}
		}
	},

	/**
	 * A kattintott memberDataButton alapjan visszaadja hogy mi lesz a betoltendo element id-je, pl stat_342
	 *
	 * @param clickedEl {Object} A kattintott memberDataButton
	 * @param isExtElement {Boolean} Ha true, akkor lekeri az Ext.elementet es azt adja vissza, ha false akkor csak az id-t
	 */
	getMemberDataIdToLoad : function(clickedEl, isExtElement) {
		var id = clickedEl.dom.getAttribute('data-buttontype') + '_' + clickedEl.parent().dom.id.split('_')[1];
		return isExtElement ? Ext.get(id) : id;
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
			elementIdToLoad = this.getMemberDataIdToLoad(clickedEl);

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

	onFavoriteClick : function(ev, target) {
		ev.preventDefault();

		target = target.tagName.toLowerCase() === 'a' ? target : Ext.get(target).findParent('a', 10);

		var url = target.getAttribute('href'),
			memberAccountId = target.getAttribute('data-member-account-id'),
			self = this;

		this._actualTooltipText = Ext.get(target).select('.icon').item(0).dom.getAttribute('data-title');

		if (this._ajaxRequestDelay) {
			window.clearTimeout(self._ajaxRequestDelay);
		}
		this._ajaxRequestDelay = window.setTimeout(function() {
			Connection.Ajax.request({
				url     : url,
				type    : Connection.TYPE_JSON,
				method  : 'POST',
				scope   : self,
				success : self.onFavoriteRequestSuccess,
				error   : self.onFavoriteRequestError,
				failure : self.onFavoriteRequestError,
				params  : {
					memberAccountId : memberAccountId,
					target          : target
				}
			});
		}, 300);
	},

	onFavoriteRequestSuccess : function(response, opts) {
		if (response.json.data) {
			var targetEl = Ext.get(opts.params.target),
				innerSpanEl = targetEl.select('span').item(0),
				objHasOwnProperties = this.tooltipTextObj.hasOwnProperty('favorite')
					&& this.tooltipTextObj.hasOwnProperty('nofavorite');

			if (objHasOwnProperties) {
				if (this._actualTooltipText === this.tooltipTextObj.favorite) {
					this._actualTooltipText = this.tooltipTextObj.nofavorite;
				}
				else {
					this._actualTooltipText = this.tooltipTextObj.favorite;
				}
				innerSpanEl.dom.setAttribute('data-title', Chaos.translate(this._actualTooltipText));
			}

			innerSpanEl.toggleClass('favoriteHovered');
		}
		else {
			window.location.reload();
		}
	},

	onFavoriteRequestError : function() {
		window.location.reload();
	},

	/**
	 * Prevents disabled buttons click events.
	 *
	 * @param ev
	 */
	onDisabledLinkClick : function(ev) {
		ev.preventDefault();
	},

	/**
	 * Esemenykezelok feliratkozasa
	 */
	bind : function() {
		if (this._memberDataButtonEl) {
			// A member gombokhoz tartozo esemeny
			this._memberDataButtonEl.on('click', this.onMemberDataButtonsClick, this);
		}

		if (this._disabledLinkEls) {
			this._disabledLinkEls.on('click', this.onDisabledLinkClick, this);
		}

		this.element.on('click', this.onFavoriteClick, this, {
			scope    : this,
			delegate : this._favoriteLinkSel
		});

		MembersIndex.superclass.bind.call(this);
	},

	/**
	 * Esemenykezelok torlese
	 */
	unbind : function() {
		this.autoUnbind();
	}
});
