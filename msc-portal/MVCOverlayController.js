import Ext from '../../lib/vendor/ExtCore';
import Chaos from '../../lib/chaos/Chaos';
import ChaosController from '../../lib/chaos/Controller';
import { Broadcaster } from '../../lib/chaos/Broadcaster';

import VideoPlayer from '../Video/VideoPlayer';

/**
 * MVCOverlayController.
 *
 *
 */
export default function MVCOverlayController(el, config) {
	MVCOverlayController.superclass.constructor.call(this, el, config);
}

MVCOverlayController.EVENT_OVERLAY_SHOW_DONE = 'overlay-show-done';
MVCOverlayController.EVENT_OVERLAY_HIDE_DONE = 'overlay-hide-done';
MVCOverlayController.EVENT_OVERLAY_RENDER_DONE = 'overlay-render-done';

Chaos.extend(MVCOverlayController, ChaosController, {

	/** @var {String}    Overlay container DIV id, where all content will be appended. */
	overlayContainerId : 'mvc_overlay_container',
	/** @var {String}    Overlay background element's ID */
	overlayId          : 'mvc_overlay_container',
	/** @var {Boolean}   True, if a click on the overlay background closes the whole overlay */
	exitOnOverlayClick : true,
	/** @var {Boolean}   True, if a click on the overlay background closes the whole overlay */
	exitOnEsc          : true,
	/** @var {String}    Selector for the close button on the overlay*/
	closeSel           : 'closeBtn',

	/* -------- PRIVATES -------- */

	/** @var {Object}   For storing each request and identifying with a unique ID */
	_requests : {},
	/** @var {Object}   Default callbacks */
	_callback : {
		success : function() {
		},
		error : function() {
		}
	},

	/**
	 * Standard init function
	 *
	 * @param {Object} el
	 * @param {Object} config
	 *
	 * @return void
	 */
	init : function(el, config) {
		this._overlayEl = Ext.get(this.overlayId);
		MVCOverlayController.superclass.init.call(this, el, config);

		this.addEvents(
			MVCOverlayController.EVENT_OVERLAY_SHOW_DONE,
			MVCOverlayController.EVENT_OVERLAY_HIDE_DONE,
			MVCOverlayController.EVENT_OVERLAY_RENDER_DONE
		);
	},

	/**
	 * Stores an overlay request.
	 *
	 * @method addRequest
	 * @param {Object} params   Params that will be stored
	 *
	 * @return {String}
	 */
	addRequest : function(params) {
		var _oId = Chaos.generateId('o');
		params._oId = _oId;
		if (!params.callback) {
			params.callback = this._callback;
		}
		else {
			Ext.applyIf(params.callback, this._callback);
		}
		this._requests[_oId] = params;
		return _oId;
	},

	/**
	 * Gets the content by calling the model layer's getDocuments method.
	 *
	 * @method getDocuments
	 * @public
	 *
	 * @param {Object} params   Params for get content request ajax
	 *
	 * @return {Object} scope
	 */
	getContent : function(params) {
		this.MVCOverlayModel.getContent(params);
		return this;
	},

	/**
	 * Shows the overlay and its content also
	 *
	 * @method show
	 * @public
	 *
	 * @return {Object} scope
	 */
	show : function() {
		this.MVCOverlayView.show();
		return this;
	},

	/**
	 * Hides the overlay and its content also
	 *
	 * @method hide
	 * @public
	 *
	 * @return {Object} scope
	 */
	hide : function() {
		if (this._overlayBackgroundEl) {
			this._overlayBackgroundEl.un('click', this.onClosePopupClick, this);
		}
		this.MVCOverlayView.hide();
		return this;
	},
	/**
	 * Changes the type of the animation in the view
	 * @param animationType AnimationType (check in Component)
	 */
	changeAnimationType : function(animationType) {
		this.MVCOverlayView.animationType = animationType || false;
	},

	/**
	 * Callback for a successfull get content response.
	 *
	 * @method getContentSuccess
	 * @param {Object} ev   Event Object
	 *
	 * @return void;
	 */
	onGetContentSuccess : function(ev) {
		var content = ev.response.json.data.content;
		this._activeWindow = ev.oId;
		this.MVCOverlayView.renderContent({
			content  : content, response : ev.response.json.data, oId      : ev.oId
		}); // Todo: error handling
	},

	/**
	 * Callback for a failed get content response.
	 *
	 * @method getContentError
	 * @param {Object} ev   Event object
	 *
	 * @return void;
	 */
	onGetContentError : function(ev) {
		this._callRequestCallback({
			request       : this._getOverlayRequest(ev.oId),
			callbackFn    : 'onError',
			callbackScope : 'onErrorScope'
		});
	},

	/**
	 * Callback for a failed get content response.
	 *
	 * @method getContentFailure
	 * @param {Object} ev   Event object
	 *
	 * @return void;
	 */
	onGetContentFailure : function(ev) {
		this._callRequestCallback({
			request       : this._getOverlayRequest(ev.oId),
			callbackFn    : 'onError',
			callbackScope : 'onErrorScope'
		});
	},

	/**
	 * Event handler after the view layer finished the displaying process.
	 *
	 * @method onOverlayShow
	 * @param {Object} ev   Event object
	 *
	 * @return void;
	 */
	onOverlayShow : function(ev) {
		var params = ev.params;
		this._callRequestCallback({
			request       : this._getOverlayRequest(this.getActiveWindow()),
			callbackFn    : 'onShow',
			callbackScope : 'onShowScope',
			response      : params.response
		});
		if (this.exitOnOverlayClick) {
			if (!this._overlayBackgroundEl) {
				this._overlayBackgroundEl = this.MVCOverlayView.setOverlayBackground();
				this._overlayBackgroundEl.on('click', this.onClosePopupClick, this);
			}
		}
		var closeButtonEl = this.element.select('.' + this.closeSel);
		if (closeButtonEl) {
			closeButtonEl.on('click', this.onClosePopupButtonClick, this);
		}
		this.fireEvent(MVCOverlayController.EVENT_OVERLAY_SHOW_DONE, { scope : this, response : params });
	},

	/**
	 * Event handler after the view layer finished the hiding process.
	 *
	 * @method onOverlayHide
	 * @param {Object} ev   Event object
	 *
	 * @return void;
	 */
	onOverlayHide : function(ev) {
		this.setOverlayClick(true);
		this._callRequestCallback({
			request       : this._getOverlayRequest(this.getActiveWindow()),
			callbackFn    : 'onHide',
			callbackScope : 'onHideScope'
		});
		delete this._overlayBackgroundEl;
		this.fireEvent(
			MVCOverlayController.EVENT_OVERLAY_HIDE_DONE, {
				scope             : this, isSwapContentHide : ev.isSwapContentHide
			}
		);
	},

	/**
	 * Returns the currently shown window id.
	 *
	 * @method getActiveWindow
	 * @public
	 *
	 * @return {String};
	 */
	getActiveWindow : function() {
		return this._activeWindow;
	},

	/**
	 * Escape key event handler
	 *
	 * @return void
	 */
	onEscKeypress : function(ev) {
		// If a video is in fullscreen mode
		if (this.singlePreventHide) {
			this.singlePreventHide = false;
			return;
		}
		// if escape was pressed
		if (ev.keyCode === 27 && this.exitOnEsc && this.MVCOverlayView.isVisible()) {
			this.MVCOverlayView.hide();
		}
	},

	/**
	 * Overlay click handler
	 *
	 * @return void
	 **/
	onClosePopupClick : function(ev, target) {
		if (this.exitOnOverlayClick && this.MVCOverlayView.isVisible() && target.id === this.overlayId) {
			this.MVCOverlayView.hide();
		}
	},

	/**
	 * Overlay Close Button click handler
	 *
	 * @param {Object} ev   Event object
	 *
	 * @return void
	 */
	onClosePopupButtonClick : function(ev) {
		ev.stopPropagation();
		ev.preventDefault();
		if (this.MVCOverlayView.isVisible()) {
			this.MVCOverlayView.hide();
		}
	},

	/**
	 * Returns a stored overlay request by the given ID.
	 *
	 * @method _getOverlayRequest
	 * @private
	 * @param {String} oId   Request ID
	 *
	 * @return {Object}
	 */
	_getOverlayRequest : function(oId) {
		return this._requests[oId];
	},

	/**
	 * Tries to call a callback with the response.
	 *
	 * @method _callRequestCallback
	 * @private
	 *
	 * @param {Object} params   Params for the callback call
	 *
	 * @return void;
	 */
	_callRequestCallback : function(params) {
		var request = params.request,
			fn = params.callbackFn,
			scope = request[params.callbackScope];
		if (typeof request[fn] === 'function') {
			request[fn].call(scope || this, params.response);
		}
	},

	/**
	 * Enable or disable Overlay Click
	 *
	 * @method setOverlayClick
	 * @param {Boolean} param If true click on overlay background is enabled
	 * @public
	 *
	 * @return void
	 */
	setOverlayClick : function(param) {
		this.exitOnOverlayClick = param;
	},

	/**
	 * Binds the initial event handlers
	 *
	 * @return void
	 */
	bind : function() {
		MVCOverlayController.superclass.bind.call(this);

		Broadcaster.on(VideoPlayer.EVENT_FULLSCREEN_CHANGE, function (ev) {
			this.singlePreventHide = ev.isFullscreen;
		}.bind(this));

		if (this.exitOnEsc) {
			Ext.fly(document).on('keyup', this.onEscKeypress, this);
		}

		if (this.exitOnOverlayClick && this._overlayBackgroundEl) {
			this._overlayBackgroundEl.on('click', this.onClosePopupClick, this);
		}
	},

	/**
	 * Unbinds all event handlers
	 *
	 * @return void
	 */
	unbind : function() {
		MVCOverlayController.superclass.unbind.call(this);

		Broadcaster.un(VideoPlayer.EVENT_FULLSCREEN_CHANGE, function (ev) {
			this.singlePreventHide = ev.isFullscreen;
		}.bind(this));

		if (this.exitOnEsc) {
			Ext.fly(document).un('keyup', this.onEscKeypress, this);
		}

		if (this.exitOnOverlayClick && this._overlayBackgroundEl) {
			this._overlayBackgroundEl.on('click', this.onClosePopupClick, this);
		}
	}
});