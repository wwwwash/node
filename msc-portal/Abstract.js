/* eslint-disable complexity */
/* eslint-disable max-depth */

import CONST from '../../lib/constant/Constants';

import Ext from '../../lib/vendor/ExtCore';
import Chaos from '../../lib/chaos/Chaos';
import ChaosObject from '../../lib/chaos/Object';
import { InitRiot } from '../App/App';

import AdvancedSelect from '../_Form/AdvancedSelect';
import Connection from '../../lib/chaos/Connection';

/**
 *
 * ListFilterAbstract
 *
 */
export default function ListFilterAbstract(el, config) {
	ListFilterAbstract.superclass.constructor.call(this, el, config);
}

/** @var {String} On evety filter search event */
ListFilterAbstract.FILTER_SEARCH_EVENT_DONE = 'filter-search';

Chaos.extend(ListFilterAbstract, ChaosObject, {

	/** @var {String} searchFieldElementId           Id of the searchfield input element */
	searchFieldElementId : undefined,

	/** @var {String} listBlockSel                   Class name of the list block */
	listBlockSel : undefined,

	/** @var {String} orderByElementId               Id of orderBy select element */
	orderByElementId : undefined,

	/** @var {String} clearBtnSel                    Selector of clear button in searchfield */
	clearBtnSel : undefined,

	/** @var {Boolean} checkForLastSearchedToken     Disable/enable checking of last searched token in searchengine */
	checkForLastSearchedToken : true,

	/* PRIVATES */

	/** @var {Array} _orderByEls                      Array of select element that triggers filtering */
	_orderByEls : [],

	/** @var {Element} _searchFieldEl                Searchfield input element */
	_searchFieldEl : undefined,

	/** @var {Object} _inputElementList              List of input elements */
	_inputElementList : undefined,

	/** @var {Object} _selectElementList             List of select elements */
	_selectElementList : undefined,

	/** @var {Object} _domHelper                     Reference to domHelper */
	_domHelper : undefined,

	/** @var {String} _lastSearchToken               Last searched value */
	_lastSearchToken : '',

	/** @var {String} _ajaxServiceUrl                Ajax service url */
	_ajaxServiceUrl : '',

	/** @var {Regexp} _ajaxUrlPattern                Regex for testing ajax url */
	_ajaxUrlPattern : /(http|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/gi,

	/** @var {Object} _ajaxParams                    Object for individual params */
	_ajaxParams : {},

	/**
	 * Init
	 *
	 * @param {Element} el      This should be the body tag.
	 * @param {Object} config   Config object of this component
	 */
	init : function(el, config) {
		//Get reference to domhelper
		this._domHelper = Ext.DomHelper;
		//Store key elements references
		this._searchFieldEl = Ext.get(this.searchFieldElementId);
		this._clearBtnEl = this.element.select(this.clearBtnSel).item(0);

		this.setSelectChangeHandlers(true);

		this._inputElementList = this.element.select('input');
		this._selectElementList = this.element.select('select');
		//saving ajax url
		if (this._searchFieldEl) {
			this._ajaxServiceUrl = this._searchFieldEl.dom.getAttribute('data-url');
		}
		this._lastSearchToken = this._searchFieldEl.getValue();
		//Call superclass
		ListFilterAbstract.superclass.init.call(this, el, config);
	},

	/**
	 * Input blur event handler
	 *
	 * @return void
	 */
	onInputBlurHandler : function () {
		this.searchEngine();
	},

	/**
	 * On input keydown event handler.
	 * @param ev
	 */
	onInputKeyDown : function(ev) {
		// IE10 enter system sound fix
		if (Ext.isIE && ev.button === 12) {
			ev.preventDefault();
		}
	},

	/**
	 * Input keyup event handler
	 * @param ev
	 *
	 * @return void
	 */
	onInputKeyUpHandler : function (ev) {
		// Handle the clear btns visibility
		if (this._clearBtnEl && this._searchFieldEl.dom.value === '') {
			this._clearBtnEl.setStyle('display', 'none');
		}
		else if (this._clearBtnEl) {
			this._clearBtnEl.setStyle('display', 'block');
		}

		//Check keycode
		switch (ev.keyCode) {
			case CONST.keyCode.ENTER :
			case CONST.keyCode.NUMPAD_ENTER:
				//Az alapertelmezett mukodest felulbiraljuk
				ev.preventDefault();
				ev.stopPropagation();
				this.searchEngine();
				break;

			default:
				break;
		}
	},

	/**
	 * Functions when the search fired.
	 *
	 * @return void
	 */
	searchEngine : function() {
		//Checks the change of the search token
		if (this.checkForLastSearchedToken && this._searchFieldEl.getValue() === this._lastSearchToken) {
			return;
		}
		//Save search token
		this._lastSearchToken = this._searchFieldEl.getValue();
		//Updating ajax params
		this.gatherAjaxParams();
		//if(this._ajaxServiceUrl.toString().match(this._ajaxUrlPattern)){
		if (this._ajaxServiceUrl && this._ajaxServiceUrl.length > 0) {
			//Elkuldjuk az ajax kerest
			this.sendAjaxRequest();
		}
	},

	/**
	 * Bind or unbinds select change event handlers
	 *
	 * @param {Boolean} bind Bind or unbind event handler
	 *
	 * @return void
	 */
	setSelectChangeHandlers : function(bind) {
		var lgth = AdvancedSelect.componentList.length;
		//Saving the reference to associated elements
		for (var i = 0; i < lgth; i++) {
			if (AdvancedSelect.componentList[i].id) {
				this._orderByEls[i] = AdvancedSelect.componentList[i];
				if (bind) {
					this._orderByEls[i].on('change', this.onSelectChangeHandler, this);
				}
				else {
					this._orderByEls[i].un('change', this.onSelectChangeHandler, this);
				}
			}
		}
	},

	/**
	 * Select change event handler
	 *
	 * @return void
	 */
	onSelectChangeHandler : function (params) {
		if (params.valueChanged === true) {
			//Updating ajax params
			this.gatherAjaxParams();
			//if(this._ajaxServiceUrl.toString().match(this._ajaxUrlPattern)){
			if (this._ajaxServiceUrl && this._ajaxServiceUrl.length > 0) {
				//Elkuldjuk az ajax kerest
				this.sendAjaxRequest();
			}
		}
	},

	/**
	 * Gathering/updating ajax parameters
	 *
	 * @return void
	 */
	gatherAjaxParams : function() {
		//Add custom ajaxparam
		var i = 0,
			lgth = this._inputElementList.getCount();

		//Fill all ajax params
		//All input elements with a name attribute will be sent to the service
		this._ajaxParams = {};
		for (i; i < lgth; i++) {
			let name = this._inputElementList.item(i).getAttribute('name');
			if (name) {
				if (Ext.isIE9 || Ext.isIE8) {
					if (this._inputElementList.item(i).dom.getAttribute('placeholder') ===
						this._inputElementList.item(i).getValue()) {
						this._ajaxParams[name] = this._inputElementList.item(i).dom.value = '';
					}
					else {
						this._ajaxParams[name] = this._inputElementList.item(i).getValue();
					}
				}
				else {
					this._ajaxParams[name] = this._inputElementList.item(i).getValue();
				}
			}
		}
		//Reset iterator variables
		i = 0;
		sellgth = this._selectElementList.getCount();

		//All select elements with a name attribute will be sent to the service
		for (i; i < sellgth; i++) {
			var selectedOption = this._selectElementList.child('option[selected=*]').item(i);
			let name = selectedOption ? selectedOption.getAttribute('name') : '';
			if (name) {
				this._ajaxParams[name] = selectedOption.getValue();
			}
		}
	},

	/**
	 * Sends ajax request to server
	 *
	 * @return void
	 */
	sendAjaxRequest : function() {
		Connection.Ajax.request({
			type    	: CONST.TYPE_JSON,
			url    		: this._ajaxServiceUrl,
			params  	: this._ajaxParams,
			scope   	: this,
			success 	: this.ajaxSuccessHandler,
			error   	: this.ajaxErrorHandler,
			failure 	: this.ajaxFailureHandler,
			method  	: CONST.POST,
			synchron : true
		});
	},

	/**
	 * Ajax success event handler
	 * @param response
	 *
	 * @return void
	 */
	ajaxSuccessHandler : function(response) {
		this.renderResponseBlock(Ext.util.JSON.decode(response.responseText).data);
		this.fireEvent(ListFilterAbstract.FILTER_SEARCH_EVENT_DONE, this);
	},

	/**
	 * Renders the block depending on response
	 * @param {Object}  response      Ajax response
	 * @param {Boolean} jumpToTop     Jump to top of the page or not
	 *
	 * @return void
	 */
	renderResponseBlock : function(response, jumpToTop = false) {
		this._listBlockEls = Ext.select(this.listBlockSel);
		this._listBlockParentEl = this._listBlockEls.item(0).parent();

		if (this._listBlockEls.elements.length) {
			//Delete all pages
			this._listBlockEls.remove();
		}

		//Add element to DOM
		if (response.block) {
			this._domHelper.append(
				this._listBlockParentEl,
				response.block
			);
		}
		if (jumpToTop) {
			window.scrollTo(0, 0);
		}
		InitRiot();
	},

	/**
	 * Ajax Error handler
	 * @param response
	 *
	 * @return void
	 */
	ajaxErrorHandler : function(response) {
		/* develblock:start */
		console.log('Ajax call error! ', response);
		/* develblock:end */
	},

	/**
	 * Ajax failure handler
	 * @param response
	 *
	 * @return void
	 */
	ajaxFailureHandler : function(response) {
		var response = Ext.util.JSON.decode(response.responseText); // eslint-disable-line
	},

	/**
	 * On clear button click handler
	 * @param ev
	 *
	 * @return void
	 */
	onClearBtnClick : function(ev) {
		ev.preventDefault();
		ev.stopPropagation();

		this._searchFieldEl.dom.value = '';
		this._clearBtnEl.setStyle('display', 'none');
		this.onInputBlurHandler();
		this._searchFieldEl.dom.focus();
	},

	/**
	 * On reset filter button click.
	 *
	 * @param ev
	 * @private
	 *
	 * @return void
	 */
	_onResetFilterBtnClick : function(ev) {
		ev.preventDefault();
	},

	/**
	 * Binds events associated with this class
	 */
	bind : function() {
		if (this._clearBtnEl) {
			this._clearBtnEl.on('mousedown', this.onClearBtnClick, this);
		}
		if (this._searchFieldEl) {
			this._searchFieldEl.on('blur', this.onInputBlurHandler, this, { delay : 100 });
			this._searchFieldEl.on('keyup', this.onInputKeyUpHandler, this);
			this._searchFieldEl.on('keydown', this.onInputKeyDown, this);
		}

		ListFilterAbstract.superclass.bind.call(this);
	},

	/**
	 * Unbinds events associated with this class
	 */
	unbind : function() {
		if (this._clearBtnEl) {
			this._clearBtnEl.un('mousedown', this.onClearBtnClick, this);
		}
		if (this._searchFieldEl) {
			this._searchFieldEl.un('blur', this.onInputBlurHandler, this, { delay : 100 });
			this._searchFieldEl.un('keyup', this.onInputKeyUpHandler, this);
			this._searchFieldEl.un('keydown', this.onInputKeyDown, this);
		}

		ListFilterAbstract.superclass.unbind.call(this);
	}
});
