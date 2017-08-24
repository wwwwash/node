import Ext from '../../lib/vendor/ExtCore';
import Chaos from '../../lib/chaos/Chaos';
import Config from '../../lib/chaos/Config';
import ChaosObject from '../../lib/chaos/Object';
import { Broadcaster } from '../../lib/chaos/Broadcaster';

import NotificationMessageController from '../FanClub/NotificationMessageController';
import NotificationMessageView from '../FanClub/NotificationMessageView';

/**
 * Displays notification message in tooltip
 */
export default function NotificationMessage(el, config) {
	NotificationMessage.superclass.constructor.call(this, el, config);
}

NotificationMessage.GLOBALEVENT_SHOW_NOTIFICATION_MESSAGE = 'notification-message';
NotificationMessage.GLOBALEVENT_HIDE_NOTIFICATION_MESSAGE = 'hide-notification-message';

Ext.extend(NotificationMessage, ChaosObject, {
	/** @var {String} errorMessage       Error message */
	message : undefined,

	/**
	 * Initializer.
	 * @param {Object}  el      Context element
	 * @param {Object} config   Config
	 *
	 * @return  void
	 */
	init : function(el, config) {
		NotificationMessage.superclass.init.call(this, el, config);
		this.getNotificationMessageController();
		Chaos.addEvents(
			NotificationMessage.GLOBALEVENT_SHOW_NOTIFICATION_MESSAGE
		);
		this.message = Config.get('errorObj');
	},

	/**
	 * Gets an instance of a NotificationMessage Controller.
	 *
	 * @return {Object} NotificationMessageController
	 */
	getNotificationMessageController : function() {
		return this._setNotificationMessageController();
	},

	/**
	 * Sets an instance of a NotificationMessageController.
	 *
	 * @return {Object} NotificationMessageController
	 */
	_setNotificationMessageController : function() {
		if (!(this._notificationMessageController instanceof NotificationMessageController)) {
			this._notificationMessageController = new NotificationMessageController({
				el    : this.element,
				items : {
					NotificationMessageView : {
						component : this._setNotificationMessageView()
					}
				}
			});
		}
		return this._notificationMessageController;
	},

	/**
	 * Returns an instance of a NotificationMessageView.
	 *
	 * @return {Object} NotificationMessageView
	 */
	_setNotificationMessageView : function() {
		if (!(this._notificationMessageView instanceof NotificationMessageView)) {
			this._notificationMessageView = new NotificationMessageView(this.element, {});
		}
		return this._notificationMessageView;
	},

	/**
	 * Show notification message event handler
	 *
	 * @param {Object} ev Event Object
	 * @method onShowNotificationMessage
	 *
	 * @return void;
	 */
	onShowNotificationMessage : function(ev) {
		var message = ev.message || this.message.general.system_error,
			icon = ev.icon,
			pos = ev.position;

		this._notificationMessageController.showNotificationMessage(ev.targetEl, message, icon, pos);
	},

	/**
	 * Hide notification message event handler
	 *
	 * @param {Object} ev Event Object
	 * @method onHideNotificationMessage
	 *
	 * @return void;
	 */
	onHideNotificationMessage : function(ev) {
		this._notificationMessageController.hideNotificationMessage(ev.targetEl);
	},

	/**
	 * Attach initial event handlers.
	 */
	bind : function() {
		NotificationMessage.superclass.bind.call(this);
		Broadcaster.on(NotificationMessage.GLOBALEVENT_SHOW_NOTIFICATION_MESSAGE, this.onShowNotificationMessage, this);
		Broadcaster.on(NotificationMessage.GLOBALEVENT_HIDE_NOTIFICATION_MESSAGE, this.onHideNotificationMessage, this);
	},

	/**
	 * Detach initial event handlers.
	 */
	unbind : function() {
		NotificationMessage.superclass.unbind.call(this);
		this.autoUnbind();
	}
});
