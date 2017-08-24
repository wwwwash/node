import Chaos from '../../lib/chaos/Chaos';
import ChaosObject from '../../lib/chaos/Object';

export default function NotificationMessageView(el, config) {
	NotificationMessageView.superclass.constructor.call(this, el, config);
}

Chaos.extend(NotificationMessageView, ChaosObject, {

	/**
	 * Initialize
	 *
	 * @param {Element} el      Context element
	 * @param {Object} config   Config object of this controller
	 */
	init : function(el, config) {
		NotificationMessageView.superclass.init.call(this, el, config);
	},

	/**
	 * Show notification message tooltip
	 *
	 * @method showNotificationMessage
	 * @public
	 * @param {Object} targetEl  Target element
	 * @param {String} message   Notification message
	 * @param {String} icon      Icon for the message
	 * @param {String} pos       Tooltip Position
	 *
	 * @return void
	 */
	showNotificationMessage : function(targetEl, message, icon, pos) {
		targetEl.jq().protipShow({
			title     : message,
			trigger   : 'sticky',
			position  : pos || 'top',
			offsetTop : 5,
			icon      : icon || false
		});
	},

	/**
	 * Hide notification message tooltip
	 *
	 * @method hideNotificationMessage
	 * @public
	 * @param {Object} targetEl  Target element
	 *
	 * @return void
	 */
	hideNotificationMessage : function(targetEl) {
		if (targetEl) {
			targetEl.jq().protipHide();
		}
	}
});
