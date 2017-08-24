import Ext from '../../../lib/vendor/ExtCore';
import Chaos from '../../../lib/chaos/Chaos';
import Config from '../../../lib/chaos/Config';
import Page from '../../../lib/chaos/Page';
import Application from '../../../lib/chaos/Application';

import PlaylistEditor from '../../FanClub/PlaylistEditor';
import NotificationMessage from '../../Notification/NotificationMessage';
import ChannelPriceSettings from '../../FanClub/ChannelPriceSettings';
import ChannelProgressBar from '../../FanClub/ChannelProgressBar';
import ChannelAddMedia from '../../FanClub/ChannelAddMedia';
import ChannelEditor from '../../FanClub/ChannelEditor';
import MVCOverlay from '../../FanClub/MVCOverlay';
import ChannelOverlay from '../../FanClub/ChannelOverlay';

import './FanClub.scss';
import './FanClubLanding.scss';


/**
 * Channel Editor's index page
 *
 * @class Index
 * @constructor
 * @extends Chaos.Page
 */
export default function EditorPageAbstract(el, config) {
	EditorPageAbstract.superclass.constructor.call(this, el, config);
}

Ext.apply(EditorPageAbstract, {
	CHANNEL_TYPE_FREE   : 'free',
	CHANNEL_TYPE_PAYING : 'paying'
}, {});

Chaos.extend(EditorPageAbstract, Page, {
	/**
	 * Init
	 *
	 * @method init
	 * @param {Element} el      Element
	 * @param {Object} config   Configurables
	 *
	 * @return void
	 */
	init : function(el, config) {
		Chaos.getUrl = function(routeHandler, routeParams, queryParams, anchor, disableLang) {
			queryParams = queryParams || {};
			if (queryParams) {
				queryParams = Ext.apply({
					channelType : Config.get('channelType')
				}, queryParams);
			}
			return Application
				.getInstance()
				.getRouter()
				.generateUrl(routeHandler, routeParams, queryParams, anchor, disableLang);
		};
		EditorPageAbstract.superclass.init.call(this, el, config);
		this.getPlaylistEditorComponent();
		this.getChannelEditorComponent();
		this.getChannelAddMediaComponent();
		this.getChannelOverlayComponent();
		this.getMVCOverlayComponent();
		this.getNotificationMessageComponent();
		this.getChannelProgressBarComponent();
		this.getChannelPriceSettingsComponent();
	},

	getPlaylistEditorComponent : function() {
		return this._setPlaylistEditorComponent();
	},

	_setPlaylistEditorComponent : function() {
		if (!(this._playlistEditorComponent instanceof PlaylistEditor)) {
			this._playlistEditorComponent = new PlaylistEditor(this.element, {
				channelType : Config.get('channelType')
			});
		}
		return this._playlistEditorComponent;
	},

	/**
	 * Gets an instance of a NotificationMessageComponent.
	 *
	 * @return {Object} NotificationMessage
	 */
	getNotificationMessageComponent : function() {
		return this._setNotificationMessageComponent();
	},

	/**
	 * Sets an instance of a NotificationMessageComponent.
	 *
	 * @return {Object} NotificationMessage
	 */
	_setNotificationMessageComponent : function() {
		if (!(this._notificationMessageComponent instanceof NotificationMessage)) {
			this._notificationMessageComponent = new NotificationMessage(this.element, {});
		}
		return this._notificationMessageComponent;
	},

	/**
	 * Gets an instance of a ChannelProgressBarComponent.
	 *
	 * @return {Object} MChannelProgressBar
	 */
	getChannelProgressBarComponent : function() {
		return this._setChannelProgressBarComponent();
	},

	/**
	 * Gets an instance of a ChannelPriceSettingsComponent.
	 *
	 * @return {Object} ChannelPriceSettings
	 */
	getChannelPriceSettingsComponent : function() {
		return this._setChannelPriceSettingsComponent();
	},

	/**
	 * Sets an instance of a ChannelPriceSettingsComponent.
	 *
	 * @return {Object} ChannelPriceSettings
	 */
	_setChannelPriceSettingsComponent : function() {
		if (
			!(this._channelPriceSettingsComponent instanceof ChannelPriceSettings)
			&& Ext.get('channelPrice-component')
		) {
			this._channelPriceSettingsComponent = new ChannelPriceSettings(
				Ext.get('channelPrice-component'),
				{}
			);
		}
		return this._channelPriceSettingsComponent;
	},

	/**
	 * Sets an instance of a ChannelProgressBarComponent.
	 *
	 * @return {Object} ChannelProgressBar
	 */
	_setChannelProgressBarComponent : function() {
		if (!(this._channelProgressBarComponent instanceof ChannelProgressBar)) {
			this._channelProgressBarComponent = new ChannelProgressBar(this.element, {});
		}
		return this._channelProgressBarComponent;
	},

	/**
	 * Gets an instance of Channel Add Media Component
	 *
	 * @method getChannelAddMediaComponent
	 *
	 * @return void;
	 */
	getChannelAddMediaComponent : function() {
		this._setChannelAddMediaComponent();
	},

	/**
	 * Sets a component that handles adding photos in overlay
	 *
	 * @method _setOverlayAddPhotosComponent
	 * @private
	 *
	 * @return {Object} component instance
	 */
	_setChannelAddMediaComponent : function() {
		if (!(this._channelAddMediaComponent instanceof ChannelAddMedia)) {
			this._channelAddMediaComponent = new ChannelAddMedia(
				'main_container', {
					mediaPrivacy : this.mediaPrivacy
				});
		}
		return this._channelAddMediaComponent;
	},

	/**
	 * Gets an instance of a MediaManagerController.
	 *
	 * @return {Object} MediaManagerController
	 */
	getChannelEditorComponent : function() {
		return this._setChannelEditorComponent();
	},

	/**
	 * Sets an instance of a MediaManagerController.
	 *
	 * @return {Object} MediaManagerController
	 */
	_setChannelEditorComponent : function() {
		if (!(this._channelEditorComponent instanceof ChannelEditor)) {
			this._channelEditorComponent = new ChannelEditor(this.element, {});
		}
		return this._channelEditorComponent;
	},

	/**
	 * Gets an instance of a MVCOverlayComponent.
	 *
	 * @return {Object} MVCOverlayComponent
	 */
	getMVCOverlayComponent : function() {
		return this._setMVCOverlayComponent();
	},

	/**
	 * Sets an instance of a MVCOverlayComponent.
	 *
	 * @return {Object} MVCOverlayComponent
	 */
	_setMVCOverlayComponent : function() {
		if (!(this._MVCOverlayComponent instanceof MVCOverlay)) {
			this._MVCOverlayComponent = new MVCOverlay(this.element, {});
		}
		return this._MVCOverlayComponent;
	},

	/**
	 * Get the current ChannelOverlay Component instance
	 *
	 * @method getChannelOverlayComponent
	 * @public
	 *
	 * @return {Object} Component instance
	 */
	getChannelOverlayComponent : function() {
		return this._setChannelOverlayComponent();
	},

	/**
	 * Instantiate the Component of ChannelOverlay
	 *
	 * @method _channelOverlayComponent
	 * @private
	 *
	 * @return {Object} component instance
	 */
	_setChannelOverlayComponent : function() {
		if (!(this._channelOverlayComponent instanceof ChannelOverlay)) {
			this._channelOverlayComponent = new ChannelOverlay(this.element, {});
		}
		return this._channelOverlayComponent;
	},

	/**
	 * Initial bind method.
	 *
	 * @method bind
	 *
	 * @return void
	 */
	bind : function() {
		EditorPageAbstract.superclass.bind.call(this);
	},

	/**
	 * Initial unbind method.
	 *
	 * @method unbind
	 *
	 * @return void
	 */
	unbind : function() {
		this.autoUnbind();
	}
});
