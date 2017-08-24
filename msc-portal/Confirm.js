import Ext from '../../../lib/vendor/ExtCore';
import Chaos from '../../../lib/chaos/Chaos';
import Config from '../../../lib/chaos/Config';
import { Broadcaster } from '../../../lib/chaos/Broadcaster';
import Overlay from '../Overlay';

/**
 * ConfirmOverlay : confirm overly creator
 */
export default function ConfirmOverlay(el, config) {
	ConfirmOverlay.superclass.constructor.call(this, el, config);
}

ConfirmOverlay.EVENT_OK_CLICK = 'confirmoverlay-ok-click';

Chaos.extend(ConfirmOverlay, Overlay, {

	/** @var {String}                    Selector of the confirm button  */
	overlayBtnSel       : '.confirmIt',
	/** @var {String}                    Route of the confirm overlay block  */
	confirmOverlayRoute : 'ConfirmDialog/Show',

	/**
	 * Init
	 *
	 * @param {Element} el      This should be the body tag.
	 * @param {Object} config   Config object of this component.
	 */
	init : function(el, config) {
		ConfirmOverlay.superclass.init.call(this, el, config);

		Chaos.addEvents(ConfirmOverlay.EVENT_OK_CLICK);
	},

	/**
	 * Opens a confirm overlay that links to the buttons href url.
	 *
	 * @param ev
	 * @param target
	 */
	onOverlayBtnClick : function(ev, target) {
		ev.preventDefault();
		ev.stopPropagation();

		//Kiolvassuk a gombhoz tartozo link elemet
		var anchor = target.tagName.toLowerCase() === 'a' ? target : Ext.get(target).findParent('a'),
			dialogId = anchor.getAttribute('data-confirm-id') || '1',
			confirmOverlayUrl = Chaos.getUrl(this.confirmOverlayRoute, {}, {
				dialogId   : dialogId, confirmUrl : anchor.href
			}, '');

		this._clickedElement = anchor;
		this.openOverlay(confirmOverlayUrl, {});
		Config.set('isOverlayOpened', true);
	},

	/**
	 * Programatically opens a confirm dialog.
	 *
	 * @param {String} dialogId Dialog ID of the dialog (scenarios can be found in the ActionConfirmOverlayBlock)
	 */
	openConfirmDialog : function(dialogId) {
		var confirmOverlayUrl = Chaos.getUrl(this.confirmOverlayRoute, {}, {
			dialogId   : dialogId, confirmUrl : '#'
		}, '');
		this.openOverlay(confirmOverlayUrl, {});
	},

	/**
	 * Opens a real overlay.
	 *
	 * @param ev
	 * @param target
	 */
	onRealOverlayBtnClick : function(ev, target) {
		ev.preventDefault();
		ev.stopPropagation();

		//Kiolvassuk a gombhoz tartozo link elemet
		var anchor = target.tagName.toLowerCase() === 'a' ? target : Ext.get(target).findParent('a'),
			anchorEl = Ext.get(anchor);

		this._postData = anchor.getAttribute(this._postDataSel);

		this._clickedElement = anchor;

		// Collect settings from data attributes
		this.collectDataSettings();

		this.popupHandler(
			anchorEl,
			true,
			false,
			{
				closeBtnName : this.closeBtnSel
			},
			Ext.get('overlay')
		);
	},

	/**
	 * Extend close popup method with "unbind OK button" functionality
	 *
	 * @param {Object} ev Close Click Event Object
	 * @param {Object} target Target of the click event
	 * @param {Object} data Object for passing data to this event handler
	 */
	closePopupEventHandler : function(ev, target, data) {
		ConfirmOverlay.superclass.closePopupEventHandler.call(this, ev, target, data);

		var okClickEventName = ConfirmOverlay.EVENT_OK_CLICK;

		Broadcaster.clearListeners(okClickEventName);
	},

	/**
	 * Bind event listeners
	 */
	bind : function() {
		ConfirmOverlay.superclass.bind.call(this);
		if (Ext.getBody().hasClass('layout-registration')) {
			Ext.getBody().on('click', this.onRealOverlayBtnClick, this, {
				delegate : '.confirmItOverlayBtn'
			});
		}
	},

	/**
	 * Unbind event listeners
	 */
	unbind : function() {
		this.autoUnbind();
	}
});
