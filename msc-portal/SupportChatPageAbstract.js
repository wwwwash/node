import TweenMax from 'gsap';

import Ext from '../../../lib/vendor/ExtCore';
import Chaos from '../../../lib/chaos/Chaos';
import Page from '../../../lib/chaos/Page';
import { Broadcaster } from '../../../lib/chaos/Broadcaster';

import '../../_SupportChat/SupportChat';
import SupportRatingOverlay from '../../Overlay/SupportRating/SupportRating';

import './SupportChat.scss';

/**
 *
 * Standalone Online Support Chat Page
 * ------------------------------
 *
 * @param Object el       the element
 * @param Object config   config object
 */

export default function SupportChatAbstract(el, config) {
	SupportChatAbstract.superclass.constructor.call(this, el, config);
}

Chaos.extend(SupportChatAbstract, Page, {

	/** @var {Boolean}                        Is the rating alert displayed or not  */
	_isRatingAlertShow    : false,
	/** @var {Boolean}                        Is rating done or not boolean  */
	_isRatingDone         : false,
	/** @var {Number}                         Delay for the "please rate the admin" notification */
	alertTime             : 600000,
	/** @var {String}                         Selector of the rating notification*/
	ratingNotificationSel : '.rate_notification',
	/** @var {String}                         Selector of the rating holder container*/
	ratingHolderSel       : '.rateAlertHolder',
	/** @var {String}                         Selector of the rating done element */
	ratingDoneSel         : '.rateDoneText',
	/** @var {String}                         Support topic boxes link selector */
	topicSelectorSel      : '.topics a',

	/**
	 * Standard init function
	 *
	 * @method init
	 * @param {Object} el
	 * @param {Object} config
	 * @public
	 *
	 * @return void
	 */
	init : function(el, config) {
		// Init
		SupportChatAbstract.superclass.init.call(this, el, config);
		this._ratingHolderEl = this.element.select(this.ratingHolderSel);
		this._rateOverlayButton = this.element.select(this.ratingHolderSel + ' .overlayBtn').item(0);
		this._rateDoneText = this.element.select(this.ratingDoneSel);
		this._rateAlertMsg = this.element.select(this.ratingHolderSel + ' ' + this.ratingNotificationSel).item(0);

		window.supportChat = {};
		// If we have flash, it will call the function. Otherwise it is called by an event coming from socket
		window.supportChat.nickOfTheSupport = this.setSupportNick.bind(this);
	},

	/**
	 * Set Support Nick name for the SLA Measurement MCponent
	 *
	 * @method onCloseSupportChat
	 * @param {String} nick   Support nick name
	 *
	 * @return void
	 */
	setSupportNick : function(nick) {
		window.supportChat.nick = nick;
		if (!this._isRatingAlertShow && nick !== '') {
			this._startRatingAlertDelay();
			this._isRatingAlertShow = true;
		}
	},

	/**
	 * Start the rating alert message delay timer
	 *
	 * @method _startRatingAlertDelay
	 * @private
	 *
	 * @return void
	 */
	_startRatingAlertDelay : function () {
		this._alertTask = new Ext.util.DelayedTask(function() {
			this._showRatingAlert();
		}.bind(this));
		this._alertTask.delay(this.alertTime);
	},

	/**
	 * Shows the notification bubble
	 *
	 * @method _showRatingAlert
	 * @private
	 *
	 * @return void
	 */
	_showRatingAlert : function () {
		if (this._isRatingDone) {
			return;
		}

		if (this._rateOverlayButton) {
			this._isRatingAlertShow = true;
			this._rateOverlayButton.setStyle('display', 'inline-block');
			this._rateAlertMsg.setStyle('display', 'inline-block');

			TweenMax.to(
				[this._rateAlertMsg.dom, this._rateOverlayButton.dom],
				1,
				{
					delay     : 0,
					autoAlpha : 1
				}
			);
		}
	},

	/**
	 * on Rating is done event handler
	 * @method onRatingDone
	 * @public
	 *
	 * @return void
	 */
	onRatingDone : function () {
		this._isRatingDone = true;
		if (this._ratingHolderEl) {
			this._ratingHolderEl.addClass('hide');
		}
		if (this._rateDoneText) {
			this._rateDoneText.removeClass('hide');
		}
	},

	/**
	 * Initial bind method.
	 *
	 * @method bind
	 * @public
	 *
	 * @return void
	 */
	bind : function() {
		SupportChatAbstract.superclass.bind.call(this);

		Broadcaster.on(SupportRatingOverlay.EVENT_ADMIN_RATING_DONE, this.onRatingDone, this);
		Broadcaster.on('support-chat-connected', this.setSupportNick, this);
	},

	/**
	 * Initial unbind method.
	 *
	 * @method unbind
	 * @public
	 *
	 * @return void
	 */
	unbind : function() {
		this.autoUnbind();
	}
});
