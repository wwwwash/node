import Ext from '../../lib/vendor/ExtCore';
import Chaos from '../../lib/chaos/Chaos';
import ChaosObject from '../../lib/chaos/Object';

export default function ChannelOverlayView(el, config) {
	ChannelOverlayView.superclass.constructor.call(this, el, config);
}

Ext.apply(ChannelOverlayView, {
	EVENT_MEDIA_ITEM_CLICK : 'media-item-click'
}, {});

Chaos.extend(ChannelOverlayView, ChaosObject, {

	/** @var {String} name    Class name of a media item */
	mediaItemCls         : 'mediaItemClickBox',
	/** @var {String} name    Class name of a video media play button */
	videoPlayBtnCls      : 'js-play',
	/** @var {String} name    Class name of a delete button for the media items */
	mediaDeleteButtonCls : 'delete_media',
	/** @var {String} name    Class name of a rotate button for the media items */
	mediaRotateButtonCls : 'rotate_media',
	/** @var {String}         Selector of the parent media box */
	mediaBoxSel          : '.mediaBox',
	/** @var {String}        Class of disabled status on media box */
	disabledCls          : 'disabled',
	mediaZoomBtnCls   		 : 'js-zoom',

	/**
	 * Init
	 *
	 * @param {Element} el      Context element
	 * @param {Object} config   Config object of this controller
	 */
	init : function(el, config) {
		ChannelOverlayView.superclass.init.call(this, el, config);
		this.addEvents(ChannelOverlayView.EVENT_MEDIA_ITEM_CLICK);
	},

	/**

	 * Fires an event when an item has been clicked.
	 *
	 * @param {Object} ev   Browser event object
	 *
	 * @return void;
	 */
	onMediaItemClick : function(ev) {
		ev.preventDefault();
		var target = Ext.get(ev.target),
			mediaBox = target.parent(this.mediaBoxSel);

		if (mediaBox.hasClass(this.disabledCls)) {
			return;
		}

		this.fireEvent(ChannelOverlayView.EVENT_MEDIA_ITEM_CLICK, {
			scope  : this,
			itemEl : target
		});
	},

	/**
	 * Binds events
	 */
	bind : function() {
		ChannelOverlayView.superclass.bind.call(this);
		this.element.on('click', this.onMediaItemClick, this, {
			delegate : this.mediaZoomBtnCls.dot()
		});
		this.element.on('click', this.onMediaItemClick, this, {
			delegate : this.videoPlayBtnCls.dot()
		});
	},

	/**
	 * Unbind events
	 */
	unbind : function() {
		this.autoUnbind();
	}
});
