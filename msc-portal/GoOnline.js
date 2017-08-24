import Ext from '../../../lib/vendor/ExtCore';
import Chaos from '../../../lib/chaos/Chaos';
import Config from '../../../lib/chaos/Config';
import Page from '../../../lib/chaos/Page';

import './GoOnline.scss';

export default function GoOnline (el, config) {
	GoOnline.superclass.constructor.call(this, el, config);
}

Chaos.extend(GoOnline, Page, {

	/** @var {String} name          Name of the class */
	name            : 'goonline',
	/** @var {boolean} closeChatCalled	 */
	closeChatCalled : false,
	/** @var {String} exitBtnId		Id of the exit button */
	exitBtnId       : 'exitButton',
	/** @var {String} flashObject	Name of the applet */
	flashObject     : 'starapplet',

	/**
	 * Init
	 *
	 * @param {Element} el      This should be the body tag.
	 * @param {Object} config   Config object of this component
	 */
	init : function(el, config) {
		// Exit button
		this._exitButtonEl = Ext.get(this.exitBtnId);

		// Flash applet
		this._flashApplet = Chaos.getFlashMovieObject(this.flashObject);

		// Init futtatasa
		GoOnline.superclass.init.call(this, el, config);
	},

	/**
	 * onExitBtnClick
	 * Calls the closeChat() Flash function
	 *
	 * @param ev     Event
	 */
	onExitBtnClick : function (ev) {
		ev.preventDefault();
		if (!this.closeChatCalled) {
			this.closeChatCalled = true;
			// if flash is dead, it will redirect anyway
			var task = new Ext.util.DelayedTask(function() {
				this.chatEnd();
			}, this);
			task.delay(2000);
			if (typeof this._flashApplet.closeChat === 'function') {
				if (task) {
					task.cancel();
				}
				this._flashApplet.closeChat(true);
			}
		}
	},

	/**
	 * It will redirect you to dashboard
	 */
	chatEnd : function() {
		window.location.href = Config.get('dashboardLink');
	},

	/**
	 * Esemenykezelok feliratkozasa
	 */
	bind : function() {
		this._exitButtonEl.on('click', this.onExitBtnClick, this);

		GoOnline.superclass.bind.call(this);
	},

	/**
	 * Esemenykezelok torlese
	 */
	unbind : function() {
		this._exitButtonEl.un('click', this.onExitBtnClick, this);

		GoOnline.superclass.unbind.call(this);
	}
});

/**
 * Flash calls if the flash closed the chat
 */
window.chatEnd = function () {
	GoOnline.prototype.chatEnd();
};
