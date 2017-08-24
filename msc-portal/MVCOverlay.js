import Ext from '../../lib/vendor/ExtCore';
import Chaos from '../../lib/chaos/Chaos';
import ChaosObject from '../../lib/chaos/Object';
import { Broadcaster } from '../../lib/chaos/Broadcaster';

import MVCOverlayView from './MVCOverlayView';
import MVCOverlayModel from './MVCOverlayModel';
import MVCOverlayController from './MVCOverlayController';

import './MVCOverlay.scss';

/**
 * MVCOverlay
 *
 *
 */
export default function MVCOverlay(el, config) {
	MVCOverlay.superclass.constructor.call(this, el, config);
}

MVCOverlay.GLOBALEVENT_OVERLAY_SHOW = 'overlay-show';
MVCOverlay.GLOBALEVENT_OVERLAY_HIDE = 'overlay-hide';

MVCOverlay.GLOBALEVENT_OVERLAY_SHOW_DONE = 'overlay-show-done';
MVCOverlay.GLOBALEVENT_OVERLAY_HIDE_DONE = 'overlay-hide-done';

// Animation types
MVCOverlay.ANIMATION_TYPE_FALL_IN					= 'fall-in';
MVCOverlay.ANIMATION_TYPE_SLIDE_FROM_LEFT			= 'slide-left';
MVCOverlay.ANIMATION_TYPE_SLIDE_FROM_RIGHT		= 'slide-right';
MVCOverlay.ANIMATION_TYPE_DEFAULT					= false;

Chaos.extend(MVCOverlay, ChaosObject, {

	/** @var {String}    Overlay background element's ID. */
	overlayId          : 'mvc_overlay',
	/** @var {String}    Overlay container element's ID where the content will be pushed. */
	overlayContainerId : 'mvc_overlay_container',
	/** @var {Boolean}    True to overwrite content if a show command called when it is already shown */
	allowOverwrite     : false,

	animationType : false,
	/** @var {Boolean}    true if the overlay is manage the page's scrollbar */
	manageScroll  : true,

	/* -------- PRIVATES -------- */

	/**
	 * Standard init function
	 *
	 * @param {Object} el
	 * @param {Object} config
	 *
	 * @return void
	 */
	init : function (el, config) {
		MVCOverlay.superclass.init.call(this, el, config);
		Chaos.addEvents(
			MVCOverlay.GLOBALEVENT_OVERLAY_SHOW,
			MVCOverlay.GLOBALEVENT_OVERLAY_HIDE,
			MVCOverlay.GLOBALEVENT_OVERLAY_SHOW_DONE,
			MVCOverlay.GLOBALEVENT_OVERLAY_HIDE_DONE
		);
		this._setMVCOverlayController();
	},

	/**
	 * Sets an overlay view instance.
	 *
	 * @method _setOverlayView
	 * @private
	 *
	 * @return {Object} instance
	 */
	_setOverlayView : function() {
		if (!(this._overlayView instanceof MVCOverlayView)) {
			this._overlayView = new MVCOverlayView(this.overlayContainerId, {
				overlayEl          : Ext.get(this.overlayId),
				overlayContainerId : this.overlayContainerId,
				allowOverwrite     : this.allowOverwrite,
				animationType      : this.animationType
			});
		}
		return this._overlayView;
	},

	/**
	 * Sets an overlay model layer
	 *
	 * @method _setOverlayModel
	 * @private
	 *
	 * @return {Object} instance
	 */
	_setOverlayModel : function() {
		if (!(this._overlayModel instanceof MVCOverlayModel)) {
			this._overlayModel = new MVCOverlayModel(this.element, {});
		}
		return this._overlayModel;
	},

	/**
	 * Sets an overlay controller
	 *
	 * @method _setMVCOverlayController
	 * @private
	 *
	 * @return {Object} instance
	 */
	_setMVCOverlayController : function() {
		if (!(this._overlayController instanceof MVCOverlayController)) {
			this._overlayController = new MVCOverlayController({
				items : {
					MVCOverlayModel : {
						component : this._setOverlayModel(),
						listeners : {
							'get-content-success' : 'onGetContentSuccess',
							'get-content-error'   : 'onGetContentError',
							'get-content-failure' : 'onGetContentFailure'
						}
					},
					MVCOverlayView : {
						component : this._setOverlayView(),
						listeners : {
							'overlay-show' : 'onOverlayShow',
							'overlay-hide' : 'onOverlayHide'
						}
					}
				}
			});
			this._overlayController.on(
				MVCOverlayController.EVENT_OVERLAY_SHOW_DONE, this.onOverlayShowDone, this);
			this._overlayController.on(
				MVCOverlayController.EVENT_OVERLAY_HIDE_DONE, this.onOverlayHideDone, this);
		}
		return this._overlayController;
	},

	/**
	 * Gets an instance of the overlay controller
	 *
	 * @method _getMVCOverlayController
	 * @private
	 *
	 * @return {Object} controller instance
	 */
	_getMVCOverlayController : function() {
		return this._setMVCOverlayController();
	},

	/**
	 * Return the overlay model instance.
	 *
	 * @method getOverlayModel
	 * @public
	 *
	 * @return {Object} instance of overlay model
	 */
	_getOverlayModel : function() {
		return this._setOverlayModel();
	},

	/**
	 * Return the overlay view instance.
	 *
	 * @method _getOverlayView
	 * @public
	 *
	 * @return {Object} instance of overlay model
	 */
	_getOverlayView : function() {
		return this._setOverlayView();
	},

	/**
	 * Global event handler that starts to show an overlay
	 *
	 * @method onGlobalOverlayShow
	 * @param {Object} params   Event params
	 *

	 * @return void;
	 */
	onGlobalOverlayShow : function(params) {
		if (typeof params.exitOnOverlayClick === 'boolean') {
			this._getMVCOverlayController().setOverlayClick(params.exitOnOverlayClick);
		}
		params._oId = this._getMVCOverlayController().addRequest(params);
		var allowOverwrite = params.allowOverwrite !== undefined ? params.allowOverwrite : this.allowOverwrite;
		if (!this._getOverlayView().isVisible() || allowOverwrite) {
			this._getOverlayView().allowOverwrite = allowOverwrite;
			this._getOverlayModel().getContent(params);
		}
		if (params.animationType) {
			this._getMVCOverlayController().changeAnimationType(params.animationType);
		}
	},

	/**
	 * Global event handler that starts to hide an overlay
	 *
	 * @method onGlobalOverlayShow
	 * @param {Object} ev   Event object
	 *
	 * @return void;
	 */
	onGlobalOverlayHide : function(ev = {}) {
		if (ev.animationType) {
			this._getMVCOverlayController().changeAnimationType(ev.animationType);
		}
		this._getMVCOverlayController().hide(ev);
	},

	/**
	 * Event handler after the view layer finished the displaying process.
	 *
	 * @method onOverlayShowDone
	 * @param {Object} ev   Event object
	 *
	 * @return void;
	 */
	onOverlayShowDone : function(ev) {
		Chaos.fireEvent(
			MVCOverlay.GLOBALEVENT_OVERLAY_SHOW_DONE,
			{ scope : this, response : ev.response }
		);
	},

	/**
	 * Event handler after the view layer finished the hiding process.
	 *
	 * @method onOverlayHideDone
	 * @param {Object} ev   Event object
	 *
	 * @return void;
	 */
	onOverlayHideDone : function(ev) {
		Chaos.fireEvent(MVCOverlay.GLOBALEVENT_OVERLAY_HIDE_DONE,
			{
				scope             : this,
				isSwapContentHide : ev.isSwapContentHide
			});
	},

	/**
	 * Binds the initial event handlers
	 *
	 * @return void
	 */
	bind : function () {
		MVCOverlay.superclass.bind.call(this);
		Broadcaster.on(MVCOverlay.GLOBALEVENT_OVERLAY_SHOW, this.onGlobalOverlayShow, this);
		Broadcaster.on(MVCOverlay.GLOBALEVENT_OVERLAY_HIDE, this.onGlobalOverlayHide, this);
	},

	/**
	 * Unbinds all event handlers
	 *
	 * @return void
	 */
	unbind : function () {
		MVCOverlay.superclass.unbind.call(this);
		Broadcaster.un(MVCOverlay.GLOBALEVENT_OVERLAY_SHOW, this.onGlobalOverlayShow, this);
		Broadcaster.un(MVCOverlay.GLOBALEVENT_OVERLAY_HIDE, this.onGlobalOverlayHide, this);
	}
});