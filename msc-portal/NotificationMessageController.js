import Chaos from '../../lib/chaos/Chaos';
import ChaosController from '../../lib/chaos/Controller';

/**
 *
 */
export default function NotificationMessageController(el, config) {
	NotificationMessageController.superclass.constructor.call(this, el, config);
}

Chaos.extend(NotificationMessageController, ChaosController, {

	/**
	 * Init
	 *
	 * @param {Element} el      Context element
	 * @param {Object} config   Config object of this controller
	 */
	init : function(el, config) {
		NotificationMessageController.superclass.init.call(this, el, config);
	},

	/**
	 * Show notification message tooltip
	 *
	 * @method showNotificationMessage
	 *
	 * @param {Object} targetEl  Target element
	 * @param {String} message   Notification message
	 * @param {String} icon      Icon for the notification
	 * @param {String} pos       Position of the tooltip
	 *
	 * @return void;
	 */
	showNotificationMessage : function(targetEl, message, icon, pos) {
		this.NotificationMessageView.showNotificationMessage(targetEl, message, icon, pos);
	},

	/**
	 * Hide notification message tooltip
	 *
	 * @method hideNotificationMessage
	 *
	 * @param {Object} targetEl  Target element
	 *
	 * @return void;
	 */
	hideNotificationMessage : function(targetEl) {
		this.NotificationMessageView.hideNotificationMessage(targetEl);
	},

	/**
	 * Binds events
	 */
	bind : function() {
		NotificationMessageController.superclass.bind.call(this);
	},

	/**
	 * Unbind events
	 */
	unbind : function() {
		NotificationMessageController.superclass.unbind.call(this);
	}
});
