import TweenMax from 'gsap';

import Ext from '../../../lib/vendor/ExtCore';
import CONST from '../../../lib/constant/Constants';
import Chaos from '../../../lib/chaos/Chaos';
import ChaosObject from '../../../lib/chaos/Object';
import Connection from '../../../lib/chaos/Connection';
import AdvancedTextarea from '../../_Form/AdvancedTextarea';
import { Broadcaster } from '../../../lib/chaos/Broadcaster';

import './SupportRating.scss';

/**
 * Overlay controller object for the 'support rating' overlays
 */
export default function SupportRating(el, config) {
	SupportRating.superclass.constructor.call(this, el, config);
}

SupportRating.EVENT_ADMIN_RATING_DONE = 'admin-rating-done';

Chaos.extend(SupportRating, ChaosObject, {

	/** @var {String}               Id of the rating box overlay */
	ratingBoxId : 'supportRating',

	/** @var {String}               Url of the rate */
	_ratingUrl : 'SupportChat/SendRating',

	/** @var {String}               Class name of the no rate message */
	noRateMsgSel : 'noratemsg',

	/** @var {Boolean}              No rate message is hided or not */
	_noRateMsgHided : false,

	/**@var {String}                Id of the ajax loader indicator */
	ajaxIndicatorContainerId : 'ajaxIndicatorContainer',

	/**@var {String}                Class name of the ajax loader indicator */
	ajaxIndicatorShowCls : 'show',

	/**@var {String}                Id of the textarea */
	supportRateTextFieldId : 'supportRateField',

	/**@var {String}                Class name of the fullfilled stars */
	fullCls : 'full',

	/**
	 * Init
	 *
	 * @param {Element} el      This should be the body tag.
	 * @param {Object} config   Config object of this controller
	 */
	init : function(el, config) {
		Chaos.addEvents(
			SupportRating.EVENT_ADMIN_RATING_DONE
		);

		// Elements
		this._ratingBox = Ext.get(this.ratingBoxId);
		this._reporterType = this._ratingBox.data('reporter-type');
		this._reporterName = this._ratingBox.data('reporter-name');
		this._ratingStars = this._ratingBox.select('a');
		this._submitButton = this._ratingBox.select('button').item(0);
		this._dontwantButton = this._ratingBox.select('button').item(1);
		this._textarea = this._ratingBox.select('textarea').item(0);
		this._progressIndicator = Ext.get(this.ajaxIndicatorContainerId);
		this._noRateMsg = this._ratingBox.select('.' + this.noRateMsgSel).item(0);

		//Advanced Textarea
		this.advancedTextarea = new AdvancedTextarea(this.supportRateTextFieldId, {});

		SupportRating.superclass.init.call(this, el, config);
	},

	/**
	 * Show No rating specified message
	 * @method showNoRateMsg
	 * @public
	 *
	 * @return void
	 */
	showNoRateMsg : function () {
		if (this._noRateMsg) {
			this._noRateMsg.setStyle('display', 'block');
			TweenMax.to(
				this._noRateMsg.dom,
				1,
				{
					autoAlpha : 1
				}
			);
		}
	},

	/**
	 * Hide  No rating specified message
	 * @method hideNoRateMsg
	 * @public
	 *
	 * @return void
	 */
	hideNoRateMsg : function () {
		if (this._noRateMsg) {
			TweenMax.to(
				this._noRateMsg.dom,
				0.5,
				{
					autoAlpha : 0
				}
			);
		}
	},

	/**
	 * Set The rating stars
	 * @method setRatingStars
	 * @public
	 *
	 * @param el
	 * @return void
	 */
	setRatingStars : function (ev, target) {
		if (!this._noRateMsgHided) {
			this.hideNoRateMsg();
			this._noRateMsgHided = true;
		}

		var element = Ext.get(target),
			star,
			items,
			i;

		if (!element) {
			return;
		}

		star = element.getAttribute('data-rate');

		if (star) {
			items = this._ratingStars;

			for (i = 0; i < 4; i++) {
				items.item(i).removeClass(this.fullCls);
			}

			for (i = 0; i < star; i++) {
				if (!items.item(i).hasClass(this.fullCls)) {
					items.item(i).addClass(this.fullCls);
					this.rating = i + 1;
				}
			}
		}
	},

	/**
	 * Rating text getter
	 * @method getText
	 * @public
	 *
	 * @return {String}
	 */
	getText : function () {
		return this._textarea.dom.value;
	},

	/**
	 * on Dont want to rate button Click event handler
	 *
	 * @method onDontwantButtonClick
	 * @public
	 *
	 * @return void
	 */
	onDontwantButtonClick : function (ev) {
		ev.preventDefault();
	},

	/**
	 * on submit button event handler
	 *
	 * @method onSubmitButtonClick
	 * @public
	 * @param ev
	 *
	 * @return void
	 */
	onSubmitButtonClick : function (ev) {
		ev.preventDefault();

		var rating = this.rating,
			text = this.getText() || '',
			supportNick = window.supportChat.nick,
			reporterType = this._reporterType,
			reporterName = this._reporterName;

		if (!rating) {
			this.showNoRateMsg();
			return;
		}

		this.sendRating({
			params :
			{
				ratingValue  : rating,
				adminName    : supportNick,
				ratingText   : text,
				reporterType : reporterType,
				reporterName : reporterName
			}
		});
	},

	/**
	 * Send rating via ajax.
	 *
	 * @method sendRating
	 * @public
	 *
	 * @param {Object} params   Request params
	 *
	 * @return void;
	 */
	sendRating : function (params) {
		var self = this;
		this._progressIndicator.addClass(this.ajaxIndicatorShowCls);

		Connection.Ajax.request({
			url     : Chaos.getUrl(self._ratingUrl),
			scope   : self,
			params  : params.params,
			type    : CONST.TYPE_JSON,
			success : function (response) {
				self.sendRatingSuccess(response);
			},
			error : function (response) {
				self.sendRatingError(response);
			},
			failure : function (response) {
				self.sendRatingFailure(response);
			}
		});
	},

	/**
	 * Callback for a successful send rating response.
	 *
	 * @method sendRatingSuccess
	 * @public
	 *
	 * @return void;
	 */
	sendRatingSuccess : function () {
		this._progressIndicator.removeClass(this.ajaxIndicatorShowCls);
		this.overlayCmp.closePopupEventHandler();
		Broadcaster.fireEvent(SupportRating.EVENT_ADMIN_RATING_DONE);
	},

	/**
	 * Callback for a failed send rating response.
	 *
	 * @method sendRatingError
	 * @public
	 * @param {Object} response   Server response
	 *
	 * @return void;
	 */
	sendRatingError : function (response) {
		/* develblock:start */
		console.log(response, 'error');
		/* develblock:end */
	},

	/**
	 * Callback for a failed send rating response.
	 *
	 * @method sendRatingFailure
	 * @public
	 * @param {Object} response   Server response
	 *
	 * @return void;
	 */
	sendRatingFailure : function (response) {
		/* develblock:start */
		console.log(response, 'failure');
		/* develblock:end */
	},

	/**
	 * Binds events
	 */
	bind : function() {
		SupportRating.superclass.bind.call(this);

		if (this._ratingStars) {
			this._ratingStars.on('mouseenter', this.setRatingStars, this);
		}
		if (this._submitButton) {
			this._submitButton.on('click', this.onSubmitButtonClick, this);
		}
		if (this._dontwantButton) {
			this._dontwantButton.on('click', this.onDontwantButtonClick, this);
		}
	},

	/**
	 * Unbind events
	 */
	unbind : function() {
		this.autoUnbind();
	}
});
