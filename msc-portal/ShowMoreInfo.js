import CONST from '../../lib/constant/Constants';

import Ext from '../../lib/vendor/ExtCore';
import Chaos from '../../lib/chaos/Chaos';
import ChaosObject from '../../lib/chaos/Object';
import Connection from '../../lib/chaos/Connection';

import GlobalProgressIndicator from '../ProgressIndicator/GlobalProgressIndicator';

/**
 *
 * ShowMoreInfo : Showing more data , details of a table row
 *
 */
export default function ShowMoreInfo(el, config) {
	ShowMoreInfo.superclass.constructor.call(this, el, config);
}

Chaos.extend(ShowMoreInfo, ChaosObject, {

	/* */
	list                : undefined,
	/* */
	listItemClass       : '',
	/* */
	requestMethod       : CONST.POST,
	/* */
	responseType        : CONST.TYPE_JSON,
	/* */
	iconElement         : undefined,
	/* */
	iconClassName       : '',
	/* */
	iconToggleClassName : '',
	/* Aktualisan kivalasztott listaelem */
	actualTarget        : undefined,
	/* A listaelemekhez tartozo mar lekerdezett tartalmak listaja - jQuery*/
	contentList         : {},
	/** @var {Number}       Delay before showing ajax loader */
	ajaxLoaderDelay     : 1000,
	/** @var {String}       Selector of the table row, where we insert after the the details */
	detailsAfterItSel   : '.row-group-end',
	/** @var {String}      Class for hide things */
	hideCls             : 'ph-hide',

	/**
	 * Init
	 *
	 * @param {Element} el      This should be the body tag.
	 * @param {Object} config   Config object of this component
	 */
	init : function(el, config) {
		ShowMoreInfo.superclass.init.call(this, el, config);
	},

	/**
	 *
	 * @param ev
	 */
	onClickHandler : function(ev) {
		ev.stopEvent();
		//Ha az elemnek nincs id-ja, akkor keszitunk belole egy Ext.Element peldanyt
		var target = Ext.get(ev.target.id) || new Ext.Element(ev.target);
		//Ha a kattintott tartalom rendelkezik a jelzo osztallyal, akkor elmentjuk egyebkent megkeressuk a megfelelo szulo elemet
		target = target.hasClass(this.listItemClass) ? target : target.findParent(this.listItemClass, 3, true);

		//Bezarjuk az esetlegesen korabban megnyitott elemet
		if (this.actualTarget && this.actualTarget !== target) {
			this.closeInfoContent(this.contentList[this.actualTarget.data('id')]);
		}
		//Elmentjuk az uj elem referenciajat
		this.actualTarget = target;

		//Ha van ikon akkor elmentjuk a referenciat hozza
		this.iconElement = this.actualTarget.child(this.getClassByName(this.iconClassName))
							|| this.actualTarget.child(this.getClassByName(this.iconToggleClassName));

		//Lenyitjuk az elemet, vagy lekerdezzuk a hozza tartozo tartalmat
		if (this.actualTarget.data('id') in this.contentList) {
			this.toggleInfoContentVisibility(this.contentList[this.actualTarget.data('id')]);
		}
		else {
			target = this.actualTarget.child('[data-details-url]');
			if (target) {
				this.sendajaxRequest(target.getAttribute('data-details-url'), this.actualTarget.parent());
			}
		}
	},

	/**
	 *
	 * @param className
	 */
	getClassByName : function(className) {
		return className.indexOf('.') > 0 ? className : '.' + className;
	},

	/**
	 *
	 * @param content
	 */
	attachContent : function(content) {
		if (!content) {return}
		var insertAfterThisElement = this.actualTarget.findParent('tr', 3, true);
		insertAfterThisElement = insertAfterThisElement.next(this.detailsAfterItSel) || insertAfterThisElement;

		var el = $(content.toString().trim()).insertAfter($(insertAfterThisElement.dom));

		this.contentList[this.actualTarget.data('id')] = el;

		//Ha van ikon amit kezelni kell, akkor kezeljuk
		if (this.iconElement && this.iconElement.hasClass(this.iconClassName)) {
			this.iconElement.removeClass(this.iconClassName);
			this.iconElement.addClass(this.iconToggleClassName);
		}
	},

	/**
	 *
	 * @param content
	 */
	toggleInfoContentVisibility : function(content) {
		if (!content) {return}

		content.toggleClass(this.hideCls);

		//Ha van ikon amit kezelni kell, akkor kezeljuk
		if (this.iconElement) {
			if (this.iconElement.hasClass(this.iconClassName)) {
				this.iconElement.removeClass(this.iconClassName);
				this.iconElement.addClass(this.iconToggleClassName);
			}
			else {
				this.iconElement.removeClass(this.iconToggleClassName);
				this.iconElement.addClass(this.iconClassName);
			}
		}
	},

	closeInfoContent : function(content) {
		if (!content) {return}
		content.addClass(this.hideCls);
		//Ha van ikon amit kezelni kell, akkor kezeljuk
		if (this.iconElement) {
			this.iconElement.removeClass(this.iconToggleClassName);
			this.iconElement.addClass(this.iconClassName);
		}
	},

	/**
	 * popupok altalanos kezeleset teszi lehetove
	 *
	 * @return void
	 */
	sendajaxRequest : function(url, targetTr) {
		if (!url) {
			return;
		}

		if (this._showMoreAjaxRequestRunning) {
			return;
		}

		this._showMoreAjaxRequestRunning = true;

		Chaos.fireEvent(GlobalProgressIndicator.GLOBALEVENT_SHOW_INDICATOR);

		Connection.Ajax.request({
			type    	: this.responseType,
			url    		: url,
			params  	: this.params,
			scope   	: this,
			success 	: this.ajaxSuccessHandler,
			error   	: this.ajaxErrorHandler,
			failure 	: this.ajaxFailureHandler,
			method  	: this.requestMethod,
			targetTr	: targetTr
		});
	},

	/**
	 *
	 * @param response
	 */
	ajaxSuccessHandler : function(response) {
		this._showMoreAjaxRequestRunning = false;
		Chaos.fireEvent(GlobalProgressIndicator.GLOBALEVENT_HIDE_INDICATOR);

		var responseText = JSON.parse(response.responseText).data;

		if (responseText.block) {
			//Some code here
			this.attachContent(responseText.block);
		}
		/* develblock:start */
		else {
			//Some code here
			console.log('No relevant response data!', responseText);
		}
		/* develblock:end */
	},

	/**
	 *
	 * @param response
	 */
	ajaxErrorHandler : function(response) {
		this._showMoreAjaxRequestRunning = false;
		Chaos.fireEvent(GlobalProgressIndicator.GLOBALEVENT_HIDE_INDICATOR);

		/* develblock:start */
		console.log('ajaxErrorHandler', response);
		/* develblock:end */
	},

	/**
	 *
	 * @param response
	 */
	ajaxFailureHandler : function(response) {
		this._showMoreAjaxRequestRunning = false;
		Chaos.fireEvent(GlobalProgressIndicator.GLOBALEVENT_HIDE_INDICATOR);

		/* develblock:start */
		console.log('ajaxFailureHandler', response);
		/* develblock:end */
	},

	/**
	 *
	 */
	bind : function() {
		if (this.list) {
			this.list.on('click', this.onClickHandler, this);
		}
		ShowMoreInfo.superclass.bind.call(this);
	},

	/**
	 *
	 */
	unbind : function() {
		if (this.list) {
			this.list.un('click', this.onClickHandler, this);
		}
		ShowMoreInfo.superclass.unbind.call(this);
	}
});

