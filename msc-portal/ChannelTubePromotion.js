import $ from 'jquery';

import Ext from '../../lib/vendor/ExtCore';
import Chaos from '../../lib/chaos/Chaos';
import ChaosObject from '../../lib/chaos/Object';

export default function ChannelTubePromotion(el, config) {
	ChannelTubePromotion.superclass.constructor.call(this, el, config);
}

ChannelTubePromotion.PROMO_VIDEO_API_KEY = 'videoId';
ChannelTubePromotion.DEFAULT_RESPONSE_MESSAGE_LIFETIME = 5000;

Ext.extend(ChannelTubePromotion, ChaosObject, {
	promoRemoveURL : null,
	promoAddURL    : null,

	promoActiveCls   : 'promo-enabled-active',
	promoInactiveCls : 'promo-enabled-inactive',

	promoAskActivationCls   : 'promo-ask-activation',
	promoAskDeactivationCls : 'promo-ask-deactivation',

	promoActivationCls             : 'js-promo-activate',
	promoActivationConfirmationCls : 'js-promo-ask-activate',

	promoDeactivationCls             : 'js-promo-deactivate',
	promoDeactivationConfirmationCls : 'js-promo-ask-deactivate',

	promoAskCls    : 'promo-ask',
	promoAskCancel : 'js-promo-ask-cancel',

	promoResponse        : 'promo-response-message',
	promoResponseRemoved : 'promo-response-message-removed',
	promoResponseAdded   : 'promo-response-message-added',
	promoResponseError   : 'promo-response-message-error',

	videoItemWrapperCls : 'video',
	hideCls             : 'hide',
	controlsCls         : 'controls',

	/**
	 * Initializer.
	 * @param {Element}  el      Context element
	 * @param {Object} config   Config
	 *
	 * @return  void
	 */
	init : function(el, config) {
		ChannelTubePromotion.superclass.init.call(this, el, config);

		this.promoRemoveURL = Chaos.getUrl('PromoVideo/UnMarkVideoAsPromo');
		this.promoAddURL = Chaos.getUrl('PromoVideo/MarkVideoAsPromo');
	},

	_onPromoAskDeactivationClick : function(event, target) {
		var currentVideoWrapper = target.closest(this.videoItemWrapperCls.dot());
		var currentAskBox = $(currentVideoWrapper).find(this.promoAskDeactivationCls.dot());
		$(currentAskBox).removeClass(this.hideCls);
	},

	_onPromoAskActivationClick : function(event, target) {
		var currentVideoWrapper = target.closest(this.videoItemWrapperCls.dot());
		var currentAskBox = $(currentVideoWrapper).find(this.promoAskActivationCls.dot());
		$(currentAskBox).removeClass(this.hideCls);
	},

	_onPromoAskCancelClick : function(event, target) {
		var currentAskBox = target.closest(this.promoAskCls.dot());
		$(currentAskBox).addClass(this.hideCls);
	},

	_onPromoActivationClick : function(event, target) {
		var $currentVideoWrapper = $(target.closest(this.videoItemWrapperCls.dot()));
		var currentActionButton = $currentVideoWrapper.find(this.promoActivationConfirmationCls.dot());
		var successNotification = $currentVideoWrapper.find(this.promoResponseAdded.dot());
		var errorNotification = $currentVideoWrapper.find(this.promoResponseError.dot());

		var data = {};
		data[ChannelTubePromotion.PROMO_VIDEO_API_KEY] = $currentVideoWrapper.data('id');
		this.requestTogglePromo(this.promoAddURL, data)
			.done(function(response) {
				if (response.data && response.data === true) {
					// promo activation went fine
					// change the wrapper class to indicate the new status
					$currentVideoWrapper
						.removeClass(this.promoInactiveCls)
						.addClass(this.promoActiveCls);

					// change the action triggered by the promo icon
					$(currentActionButton)
						.addClass(this.promoDeactivationConfirmationCls)
						.removeClass(this.promoActivationConfirmationCls);

					// show the confirmation message
					var notification = $(successNotification).removeClass(this.hideCls);
					this._hideResponseAfter(notification);
					this._hideControlsAndRestoreAfter($currentVideoWrapper);
				}
				else {
					// promo activation failed for some reason
					this._showActivationFailed($currentVideoWrapper, errorNotification);
				}
			}.bind(this))
			.fail(function() {
				this._showActivationFailed($currentVideoWrapper, errorNotification);
			}.bind(this))
			.always(function() {
				// hides the confirmation overlay
				this._onPromoAskCancelClick(event, target);
			}.bind(this));
	},

	_showActivationFailed : function($currentVideoWrapper, errorNotification) {
		var notification = $(errorNotification).removeClass(this.hideCls);
		this._hideResponseAfter(notification);
		this._hideControlsAndRestoreAfter($currentVideoWrapper);
	},

	_onPromoDeactivationClick : function(event, target) {
		var data = {};

		var $currentVideoWrapper = $(target.closest(this.videoItemWrapperCls.dot()));
		var currentActionButton = $currentVideoWrapper.find(this.promoDeactivationConfirmationCls.dot());
		var successNotification = $currentVideoWrapper.find(this.promoResponseRemoved.dot());
		var errorNotification = $currentVideoWrapper.find(this.promoResponseError.dot());
		var notification;

		data[ChannelTubePromotion.PROMO_VIDEO_API_KEY] = $currentVideoWrapper.data('id');

		this.requestTogglePromo(this.promoRemoveURL, data)
			.done(function(response) {
				if (response.data && response.data === true) {
					// promo deactivation went fine
					// change the wrapper class to indicate the new status
					$currentVideoWrapper
						.removeClass(this.promoActiveCls)
						.addClass(this.promoInactiveCls);

					// change the action triggered by the promo icon
					$(currentActionButton)
						.removeClass(this.promoDeactivationConfirmationCls)
						.addClass(this.promoActivationConfirmationCls);

					// show the confirmation message
					notification = $(successNotification).removeClass(this.hideCls);
					this._hideResponseAfter(notification);
					this._hideControlsAndRestoreAfter($currentVideoWrapper);
				}
				else {
					notification = $(errorNotification).removeClass(this.hideCls);
					this._hideResponseAfter(notification);
					this._hideControlsAndRestoreAfter($currentVideoWrapper);
				}
			}.bind(this))
			.fail(function() {
				notification = $(errorNotification).removeClass(this.hideCls);
				this._hideResponseAfter(notification);
				this._hideControlsAndRestoreAfter($currentVideoWrapper);
			}.bind(this))
			.always(function() {
				// hides the confirmation overlay
				this._onPromoAskCancelClick(event, target);
			}.bind(this));
	},

	/**
	 * Request backend to change the promo status
	 *
	 * @returns {jQuery.Deferred.promise}
	 */
	requestTogglePromo : function(url, payload) {
		return $.post(url, payload);
	},

	/**
	 * Promo activation / deactivation response message
	 * should be hidden after some DELAY
	 *
	 */
	_hideResponseAfter : function(responseElement) {
		responseElement.removeClass(this.hideCls);
		setTimeout(function() {
			responseElement.addClass(this.hideCls);
		}.bind(this), ChannelTubePromotion.DEFAULT_RESPONSE_MESSAGE_LIFETIME);
	},

	/**
	 * When a promo activation / deactivation response message
	 * shows, we hide the related controls icons for a while
	 */
	_hideControlsAndRestoreAfter : function(currentVideoBlock) {
		var _controls = currentVideoBlock.find(this.controlsCls.dot()).addClass(this.hideCls);
		setTimeout(function() {
			_controls.removeClass(this.hideCls);
		}.bind(this), ChannelTubePromotion.DEFAULT_RESPONSE_MESSAGE_LIFETIME);
	},

	/**
	 * Attach initial event handlers.
	 */
	bind : function() {
		this.element.on('click', this._onPromoActivationClick, this, {
			delegate : this.promoActivationCls.dot()
		});
		this.element.on('click', this._onPromoDeactivationClick, this, {
			delegate : this.promoDeactivationCls.dot()
		});
		this.element.on('click', this._onPromoAskDeactivationClick, this, {
			delegate : this.promoDeactivationConfirmationCls.dot()
		});
		this.element.on('click', this._onPromoAskActivationClick, this, {
			delegate : this.promoActivationConfirmationCls.dot()
		});
		this.element.on('click', this._onPromoAskCancelClick, this, {
			delegate : this.promoAskCancel.dot()
		});
		ChannelTubePromotion.superclass.bind.call(this);
	},

	/**
	 * Detach initial event handlers.
	 */
	unbind : function() {
		this.autoUnbind();
	}
});
