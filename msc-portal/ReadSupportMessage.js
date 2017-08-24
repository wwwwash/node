import Ext from '../../../lib/vendor/ExtCore';
import Chaos from '../../../lib/chaos/Chaos';
import Page from '../../../lib/chaos/Page';
import Config from '../../../lib/chaos/Config';
import Connection from '../../../lib/chaos/Connection';

import ScrollPane from '../../Scroll/ScrollPane';
import AdvancedTextarea from '../../_Form/AdvancedTextarea';

import './Message.scss';

export default function ReadSupportMessage(el, config) {
	ReadSupportMessage.superclass.constructor.call(this, el, config);
}

Chaos.extend(ReadSupportMessage, Page, {

	/** @var {String} messageBoardMainBoxClass      Az uzenetek legfelso kontenere */
	messageBoardMainBoxClass    : 'messageBoardMainContainer',
	/** @var {String} messageBoardScrollBoxClass    Az uzenetek kozepso kontenere, amiben a scroll van */
	messageBoardScrollBoxClass  : 'messageBoardScrollContainer',
	/** @var {String} messageBoardContentBoxClass   Az uzenetek konkret tartalom kontenere */
	messageBoardContentBoxClass : 'messageBoardContent',
	/** @var {String}                               Message header selector */
	messageHeaderSel            : '.messageHeader',

	/*Private*/
	/** @var {Object} _messageBoardMainEl           Az uzenetek legfelso kontener eleme */
	_messageBoardMainEl    : undefined,
	/** @var {Object} _messageBoardScrollEl         Az uzenetek kozepso kontener eleme */
	_messageBoardScrollEl  : undefined,
	/** @var {Object} _messageBoardContentEl        Az uzenetek tartalom kontener eleme */
	_messageBoardContentEl : undefined,
	/** @var {Object}                               Message header element */
	_messageHeaderEl       : undefined,

	/**
	 * Init
	 *
	 * @param {Element} el      This should be the body tag.
	 * @param {Object} config   Config object of this component
	 */
	init : function(el, config) {
		Chaos.addEvents(ScrollPane.EVENT_SCROLL_TOP);
		this._messageBoardMainEl = Ext.get(this.messageBoardMainBoxClass);
		this._messageBoardScrollEl = Ext.get(this.messageBoardScrollBoxClass);
		this._messageBoardContentEl = Ext.get(this.messageBoardContentBoxClass);

		// Advanced Textarea behuzasa
		if (Ext.fly('body')) {
			new AdvancedTextarea('body', {});
		}

		// Init futtatasa
		ReadSupportMessage.superclass.init.call(this, el, config);
	},

	/**
	 * Az uzenetek tartalom dobozanak tetejere valo scrollozas eseten Ajax hivassal uj tartalmakat kerunk
	 *
	 * @param response
	 */
	onScrollTopEvent : function() {
		//Ha nincs cim akkor ne kuldj ajaxot
		if (Config.get('messageLink')) {
			//Kuldd el az ajaxot
			Connection.Ajax.request({
				type   	: 'json',
				url    	: Config.get('messageLink'),
				scope  	: this,
				success	: this.getMessagesSuccessHandler,
				error  	: this.getMessagesErrorHandler,
				failure	: this.getMessagesFailureHandler,
				method 	: 'get'
			});
		}
		//Kosd le a scroll_top esemenyt, azert hogy csak egyszer hivodjon meg
		this._scroll.un(ScrollPane.EVENT_SCROLL_TOP, this.onScrollTopEvent, this);
	},

	/**
	 * Sikeres ajax valasz eseten leforditjuk a valaszt es betoltjuk az uj tartalmakat
	 *
	 * @param response
	 */
	getMessagesSuccessHandler : function(response) {
		//adatok dekodolasa
		response = JSON.parse(response.responseText).data;
		//a kapott js objektumokat taroljuk el Chaosban
		for (let key of Object.keys(response.jsObject)) {
			Config.set(key, response.jsObject[key]);
		}
		//valasz tartalom kinyerese
		this._block = new Ext.Template(response.block);
		//A valasz tartalmat toltsd bele az uzenetek listajaba
		this._block.insertFirst(this._messageBoardContentEl);
		//Lekeri az uj tartalom magassagat, es annyivel lejjebb rakja a scrollt hogy ugyanott allj
		var elementHeight = this._messageBoardContentEl.select('.messagePackBlock').item(0).dom.clientHeight;
		this._messageBoardScrollEl.scrollTo('top', elementHeight);

		//Meretezd at a scrollbart es kosd vissza a scroll_top esemenyt
		this._scroll.setScrollBarHeight();
		this._scroll.on(ScrollPane.EVENT_SCROLL_TOP, this.onScrollTopEvent, this);
	},

	/**
	 * Hibas ajax valasz eseten
	 *
	 * @param response
	 */
	getMessagesErrorHandler : function(response) {
		/* develblock:start */
		console.log('getMessagesErrorHandler', response);
		/* develblock:end */
	},

	/**
	 * Ha nincs ajax valasz
	 *
	 * @param response
	 */
	getMessagesFailureHandler : function(response) {
		/* develblock:start */
		console.log('getMessagesFailureHandler', response);
		/* develblock:end */
	},

	/**
	 * Esemenykezelok feliratkozasa
	 */
	bind : function() {
		//Az uzenetek kontener tetjere valo scrollozas esemenyenek elkapasa
		if (this._scroll) {
			this._scroll.on(ScrollPane.EVENT_SCROLL_TOP, this.onScrollTopEvent, this);
		}

		ReadSupportMessage.superclass.bind.call(this);
	},

	/**
	 * Esemenykezelok torlese
	 */
	unbind : function() {
		//Az uzenetek kontener tetjere valo scrollozas esemenyenek elkapasa levetele
		if (this._scroll) {
			this._scroll.un(ScrollPane.EVENT_SCROLL_TOP, this.onScrollTopEvent, this);
		}

		ReadSupportMessage.superclass.unbind.call(this);
	}
});
