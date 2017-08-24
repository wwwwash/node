import CONST from '../../../lib/constant/Constants';

import Ext from '../../../lib/vendor/ExtCore';
import Chaos from '../../../lib/chaos/Chaos';
import ChaosObject from '../../../lib/chaos/Object';
import { Broadcaster } from '../../../lib/chaos/Broadcaster';

/**
 * Parent Controller for the confirm overlays
 */

export default function ConfirmController(el, config) {
	ConfirmController.superclass.constructor.call(this, el, config);
}

Chaos.extend(ConfirmController, ChaosObject, {

	/** @var {Object} overlayCmp                Overlay component instance coming from init config */
	overlayCmp : undefined,

	/** @var {String} okButtonSel               Selector of the ok button */
	okButtonSel : '.okButton',

	/** @var {String} _okButtonEl               Element of the ok button */
	_okButtonEl : undefined,

	/**
	 * Init
	 *
	 * @param {Element} el      This should be the body tag.
	 * @param {Object} config   Config object of this controller
	 */
	init : function(el, config) {
		this._okButtonEl = this.overlayCmp.element.select(this.okButtonSel).item(0);

		ConfirmController.superclass.init.call(this, el, config);
	},

	/**
	 * On OK btn click
	 *
	 * @param ev
	 * @param target
	 */
	onOkClick : function(ev, target) {
		var targetEl = Ext.get(target),
			href = targetEl.dom.getAttribute('href');

		if (!href || href === '#') {
			ev.preventDefault();
			// First we fire the OK Click event, THEN we shall call the closepopup, because closepopup is
			// calling a 'detach event ok click' method.
			Broadcaster.fireEvent('confirmoverlay-ok-click');
			this.overlayCmp.closePopupEventHandler();
		}
	},

	/**
	 * On window key up event handler
	 * @param e
	 */
	_onWindowKeyup : function (e) {
		if (e.keyCode === CONST.keyCode.ENTER) {
			this._okButtonEl.triggerClick();
		}
	},

	/**
	 * Binds events
	 */
	bind : function() {
		ConfirmController.superclass.bind.call(this);

		this._okButtonEl.on('click', this.onOkClick, this);
		Ext.fly(window).on('keyup', this._onWindowKeyup, this);
	},

	/**
	 * Unbind events
	 */
	unbind : function() {
		this.autoUnbind();
	}
});
