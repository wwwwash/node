import CONST from '../../lib/constant/Constants';

import Ext from '../../lib/vendor/ExtCore';
import Chaos from '../../lib/chaos/Chaos';
import Config from '../../lib/chaos/Config';
import ChaosObject from '../../lib/chaos/Object';
import Connection from '../../lib/chaos/Connection';

import ProgressIndicator from '../ProgressIndicator/ProgressIndicator';

/**
 *
 * SwitchElements : adott dom elem tartalmanak kicsereleset ajaxxal elvegzo komponens
 *
 */
export default function SwitchElements(el, config) {
	SwitchElements.superclass.constructor.call(this, el, config);
}

Chaos.extend(SwitchElements, ChaosObject, {

	/** @var {String} _ajaxBoxClass                 Az ajax hivas ebbe a kontenerbe erkezik meg */
	_ajaxBoxClass                : '.ajaxBox',
	/** @var {String} _basicBoxClass                A nem ajaxos tartalom kontenere */
	_basicBoxClass               : '.basicBox',
	/** @var {String} _stopCreateAjaxCallClassName  Az ajax hivast megallito class */
	_stopCreateAjaxCallClassName : 'stopCreateAjaxCall',
	/** @var {String} _scrollBar                    A scrollbar class */
	_scrollBar                   : '.scroll-pane',

	/*Private vars*/
	/** @var {Obj} _getNewContentButton         Az osszes kattinthato elem ami elinditja a hivast */
	_getNewContentButton : undefined,
	/** @var {Obj} _scrollContainer             Az ajax hivast fogado kontener elem */
	_scrollContainer     : undefined,
	/** @var {Obj} _basicContainer              A nem ajaxos kontener elem */
	basicContainer       : undefined,
	/** @var {Obj} _scrollBarEl                 A scrollbar elem */
	_scrollBarEl         : undefined,

	/**
	 * Init
	 *
	 * @param {Element} el      This should be the body tag.
	 * @param {Object} config   Config object of this component
	 */
	init : function(el, config) {
		//Az osszes kattinthato elem ami elinditja a hivast
		this._getNewContentButton = this.element.select(config.switchElementClass).item(0);
		//A scrollbar kontenere
		this._scrollContainer = this.element.select(this._ajaxBoxClass).item(0);
		//A nem ajaxos tartalom kontenere
		this._basicContainer = this.element.select(this._basicBoxClass).item(0);

		SwitchElements.superclass.init.call(this, el, config);
	},

	/**
	 * Ajax hivast elintezo fuggveny
	 */
	createAjaxCall : function() {
		this.showAjaxContainer();
		//Az ajax hivas egyszer futhat le
		if (!this.element.hasClass(this._stopCreateAjaxCallClassName)) {
			//Add hozza az ajax megallito classt
			this.element.addClass(this._stopCreateAjaxCallClassName);
			Chaos.fireEvent(ProgressIndicator.GLOBALEVENT_ADD_LOCAL_INDICATOR, { element : this.element });
			//Kuldd el az ajaxot
			Connection.Ajax.request({
				type   	: CONST.TYPE_JSON,
				async   : true,
				url   		: this._getNewContentButton.dom.href,
				scope  	: this,
				success	: this.createAjaxCallSuccessHandler,
				error  	: this.createAjaxCallErrorHandler,
				failure	: this.createAjaxCallFailureHandler,
				method 	: CONST.GET
			});
		}
	},

	/**
	 * Adott doboz tartalmanak lecsereleset vegzo fuggveny
	 */
	switchElement : function(data) {
		//Template letrehozas
		this._template = new Ext.Template(data.block);
		this._template.insertFirst(this._scrollContainer);

		//Ha vannak atadott srollbar kontener elemek, akkor keresd meg oket
		var listContainer = this.element.select('.statusInfoList').item(0);

		//Ha a kulso doboz kisebb mint a belso, akkor rakj ra scrollbart
		if (this._scrollContainer.dom.clientHeight < listContainer.dom.clientHeight) {
			//Peldanyositjuk a scrollbart
			this._scrollPane = new ScrollPane(this.element, {
				containerId    : this._scrollContainer.dom.id,
				contentId      : listContainer.dom.id,
				tpl      			   : '<div class="scroll-pane"><div class="scrollbar"></div></div>',
				scrollBarClass : 'scrollbar'
			});
		}
		this._scrollBarEl = this.element.select('.scroll-pane').item(0);
	},

	/**
	 * Az ajax kontenert megjelenito fuggveny
	 */
	showAjaxContainer : function() {
		this._scrollContainer.dom.style.zIndex = 10;
		if (this._scrollBarEl) {
			this._scrollBarEl.dom.style.zIndex = 10;
		}
		this._basicContainer.dom.style.zIndex = 0;
	},

	/**
	 * Az ajax kontenert elrejto fuggveny
	 */
	hideAjaxContainer : function() {
		this._scrollContainer.dom.style.zIndex = 0;
		if (this._scrollBarEl) {
			this._scrollBarEl.dom.style.zIndex = 0;
		}
		this._basicContainer.dom.style.zIndex = 20;
	},

	/**
	 * Az ajax hivas sikeressege eseten
	 */
	createAjaxCallSuccessHandler : function(response) {
		this.switchElement(Ext.util.JSON.decode(response.responseText).data);
		Chaos.fireEvent(ProgressIndicator.GLOBALEVENT_REMOVE_LOCAL_INDICATOR, { element : this.element });
		Config.get('overlayComponent').findNewOverlayButtons();
	},

	/**
	 * Az ajax hivasban levo tartalom hibaja eseten
	 */
	createAjaxCallErrorHandler : function(response) {
		/* develblock:start */
		console.log('popupHandlerErrorHandler', response);
		/* develblock:end */
		Chaos.fireEvent(ProgressIndicator.GLOBALEVENT_REMOVE_LOCAL_INDICATOR, { element : this.element });
		this.element.removeClass(this._stopCreateAjaxCallClassName);
	},

	/**
	 * Az ajax hivas hibaja eseten
	 */
	createAjaxCallFailureHandler : function(response) {
		Chaos.fireEvent(ProgressIndicator.GLOBALEVENT_REMOVE_LOCAL_INDICATOR, { element : this.element });
		/* develblock:start */
		console.log('popupHandlerFailureHandler', response);
		/* develblock:end */
	},

	/**
	 * Esemenykezelok feliratkozasa
	 */
	bind : function() {
		//Az esemeny ami elinditja az ajax hivast (csak ha letezik a link amit hivni kell!)
		if (this._getNewContentButton) {
			this.element.on('mouseenter', this.createAjaxCall, this);
			this.element.on('mouseleave', this.hideAjaxContainer, this);
		}

		SwitchElements.superclass.bind.call(this);
	},

	/**
	 * Esemenykezelok torlese
	 */
	unbind : function() {
		//Az esemeny levetele ami elinditja az ajax hivast (csak ha letezik a link amit hivni kell!)
		if (this._getNewContentButton) {
			this.element.un('mouseenter', this.createAjaxCall, this);
			this.element.un('mouseleave', this.hideAjaxContainer, this);
		}

		SwitchElements.superclass.unbind.call(this);
	}
});

