import Ext from '../../lib/vendor/ExtCore';
import Chaos from '../../lib/chaos/Chaos';
import Controller from '../../lib/chaos/Controller';

export default function ChannelOverlayController(el, config) {
	ChannelOverlayController.superclass.constructor.call(this, el, config);
}

Ext.apply(ChannelOverlayController, {
	EVENT_MEDIA_ITEM_CLICK : 'media-item-click'
}, {});

Chaos.extend(ChannelOverlayController, Controller, {

	/**
	 * Init
	 *
	 * @param {Element} el      Context element
	 * @param {Object} config   Config object of this controller
	 */
	init : function(el, config) {
		ChannelOverlayController.superclass.init.call(this, el, config);
		this.addEvents(ChannelOverlayController.EVENT_MEDIA_ITEM_CLICK);
	},

	/**
	 * Eventhandler for a view event when a media element was clicked.
	 *
	 * @param {Object} ev   ChannelOverlayView event object
	 */
	onMediaItemClick : function(ev) {
		this.fireEvent(ChannelOverlayController.EVENT_MEDIA_ITEM_CLICK, {
			scope : this,
			ev    : ev
		});
	},

	/**
	 * Binds events
	 */
	bind : function() {
		ChannelOverlayController.superclass.bind.call(this);
	},

	/**
	 * Unbind events
	 */
	unbind : function() {
		ChannelOverlayController.superclass.unbind.call(this);
	}
});
