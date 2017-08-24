import Ext from '../../lib/vendor/ExtCore';
import Chaos from '../../lib/chaos/Chaos';

import ListFilterAbstract from './Abstract';
import Overlay from '../Overlay/Overlay';

/**
 *
 * NewsFilter
 *
 */

export default function NewsFilter(el, config) {
	NewsFilter.superclass.constructor.call(this, el, config);
}

Chaos.extend(NewsFilter, ListFilterAbstract, {

	/** @var {String} searchFieldElementId           Id of the searchfield input element */
	searchFieldElementId : 'newsFilter',
	/** @var {String} listBlockSel                   class name of the list block */
	listBlockSel         : '.newsList',
	/** @var {String} clearBtnSel                    Selector of clear button in searchfield */
	clearBtnSel          : '.clearLnk',
	/** @param {string}                              Az eredmenyt megjelenito class */
	_showResultClass     : 'show',
	/** @param {string}                              A keeses utani vissza linket megjelenito class */
	_showBackLinkClass   : 'show',
	/** @param {string}                              Az eredmeny mennyiseget kiiro kontener ID */
	_newsResultTextId    : 'newsFilterResultText',
	/** @param {string}                              A vissza gomb elem ID*/
	_backLinkId          : 'backToNewsList',
	/** @param {bool}                                Ha kell ajaxot kuldeni akkor true */
	_sendAjax            : true,

	/**
	 * Init
	 *
	 * @param {Element} el      This should be the body tag.
	 * @param {Object} config   Config object of this component
	 */
	init : function (el, config) {
		//Eredmeny kontener eleme
		this._newsResultText = Ext.get(this._newsResultTextId);
		//Vissza link elem
		this._backLink = Ext.get(this._backLinkId);
		//Call superclass
		NewsFilter.superclass.init.call(this, el, config);
	},

	/**
	 * Functions when the search fired.
	 */
	searchEngine : function () {
		//Checks the change of the search token
		if (this._searchFieldEl.getValue() === this._lastSearchToken) {
			return;
		}
		//Save search token
		this._lastSearchToken = this._searchFieldEl.getValue();
		//Updating ajax params
		this._inputElementList = Ext.get('newsSearch').select('input'); //reszleges input lista(show more param nelkul)
		if (this._sendAjax) {
			this.gatherAjaxParams();
			if (this._ajaxServiceUrl && this._ajaxServiceUrl.length > 0) {
				this.sendAjaxRequest();
			}
		}
	},

	/**
	 * Ajax success event handler
	 * @param response
	 */
	ajaxSuccessHandler : function (response) {
		var ajaxResponse = Ext.util.JSON.decode(response.responseText).data;

		if (!this._lastSearchToken) { //in case of empty content (or back link click)
			this.renderResponseBlock(ajaxResponse);
			this.hideResults();
		}
		else { //normal search
			this.renderResponseBlock(ajaxResponse);
			this._newsResultText.addClass(this._showResultClass);
			//Kiirom az eredmenyt
			this._newsResultText.child('strong').dom.innerHTML = ajaxResponse.newsCount;
			this._backLink.addClass(this._showBackLinkClass);
		}

		//Refresh overlay elements
		Chaos.fireEvent(Overlay.UPDATE_OPEN_OVERLAY_ELEMENTS);
	},

	/**
	 * A kereses fejlecet visszarakja alapallapotba
	 */
	hideResults : function () {
		this._newsResultText.removeClass(this._showResultClass);
		this._backLink.removeClass(this._showBackLinkClass);
	},

	/**
	 * Binds events associated with this class
	 */
	bind : function () {
		NewsFilter.superclass.bind.call(this);
	},

	/**
	 * Unbinds events associated with this class
	 */
	unbind : function () {
		this.autoUnbind();
	}
});
