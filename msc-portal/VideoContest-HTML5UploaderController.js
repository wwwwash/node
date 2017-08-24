import $ from 'jquery';

import Ext from '../../lib/vendor/ExtCore';
import Chaos from '../../lib/chaos/Chaos';
import { Broadcaster } from '../../lib/chaos/Broadcaster';
import PH from '../../lib/constant/Phrame';

import HTML5Uploader from './HTML5Uploader';
import HTML5UploaderController from './HTML5UploaderController';
import TagManager from '../TagManager/TagManager';
import MWHPollPlugin from '../MWH/MWHPollPlugin';

export default function VideoContestHTML5UploaderController(el, config) {
	VideoContestHTML5UploaderController.superclass.constructor.call(this, el, config);
}

VideoContestHTML5UploaderController.EV = {
	POLL_OK   : 'poll-ok',
	POLL_FAIL : 'poll-fail'
};

Ext.extend(VideoContestHTML5UploaderController, HTML5UploaderController, {

	/**
	 * Poll plugin instance.
	 */
	poll : undefined,

	/**
	 * Upload is stoppped before tag adding or not yet.
	 */
	_uploadStopped : false,

	/**
	 * Some jQuery elements.
	 */
	_ui : {
		converting        : '.convertingContainer',
		uploader          : '.uploader5',
		uploaderContainer : '.uploaderContainer',
		player            : '.playerContainer'
	},

	/**
	 * Init method.
	 *
	 * @param {Object} el
	 * @param {Object} config
	 * @return void
	 */
	init : function(el, config) {
		// Fetch elements
		$.each(this._ui, function(key, sel) {
			this._ui[key] = $(sel);
		}.bind(this));

		// Create poll instance
		this.poll = new MWHPollPlugin({
			url : this.statusUrl
		});

		// Add custom events
		$.each(VideoContestHTML5UploaderController.EV, function(key, value) {
			this.addEvents(value);
		}.bind(this));

		VideoContestHTML5UploaderController.superclass.init.call(this, el, config);
	},

	/**
	 * Hides the uploader container.
	 */
	hideContainer : function() {
		this._ui.uploaderContainer.toggleClass(this.cls.hide);
	},

	/**
	 * Toggles converting and uploader boxes.
	 */
	toggleConverting : function() {
		this._ui.uploader
			.add(this._ui.converting)
			.toggleClass(this.cls.hide);
	},

	/**
	 * Shows converting box.
	 */
	showConverting : function() {
		this._ui.uploader.addClass(this.cls.hide);
		this._ui.converting.removeClass(this.cls.hide);
	},

	/**
	 * Hides converting box.
	 * @private
	 */
	_hideConverting : function() {
		this._ui.uploader.removeClass(this.cls.hide);
		this._ui.converting.addClass(this.cls.hide);
	},

	/**
	 * Callback after upload is done.
	 * @private
	 */
	_onAfterDone : function() {
		this.poll.purge();
		this.poll.add(this._mongos[0]);
		this.showConverting();
	},

	/**
	 * Callback when upload is failed.
	 * @private
	 */
	_onFail : function() {
		this._addError(HTML5Uploader.ERROR.DEFAULT);
	},

	/**
	 * Show the error tooltip.
	 * @param title {String}
	 * @private
	 */
	_showErrorTooltip : function(title) {
		var errorObj = {};
		var warning = Chaos.translate('Your previous upload failed.');
		errorObj[warning] = title;
		var errorMsg = this.buildErrorMsg(errorObj);

		this.ui.buttonLink.protipShow({
			gravity  : false,
			classes  : this.cls.tooltip + ' ' + PH.cls.protipCommonClose,
			position : 'top',
			title    : errorMsg,
			trigger  : 'sticky'
		});
	},

	/**
	 * Hides error tooltip.
	 * @private
	 */
	_hideErrorTooltip : function() {
		this.ui.buttonLink.protipHide();
	},

	/**
	 * On video upload start. Remove failed protip.
	 * @private
	 */
	_onBeforeStart : function() {
		this._hideErrorTooltip();
	},

	/**
	 * This prevents to start upload after getting tokens,
	 * and adds a tooltip to warn the user to set minimum 1 tag.
	 * @private
	 */
	_onGettokensok : function() {
		this._uploadStopped = true;
		this.ui.progress.protipShow({
			title    : Chaos.translate('Please select all used songs to start the upload'),
			trigger  : 'sticky',
			gravity  : false,
			position : 'bottom'
		});
	},

	/**
	 * This will continues uploading after we get the tokens.
	 */
	continueUploadAfterTokensOk : function() {
		this.ui.progress.protipHide();
		VideoContestHTML5UploaderController.superclass._onGettokensok.call(this);
	},

	/**
	 * This is invoked after a tag succesfully added.
	 * @private
	 */
	_onTagAdded : function() {
		if (this._uploadStopped) {
			this.continueUploadAfterTokensOk();
			this._uploadStopped = false;
		}
	},

	/**
	 * This is invoked after a tag succesfully removed.
	 * @private
	 */
	_onTagRemoved : function () {},

	/**
	 * Callback when polling status gets enabled.
	 * @param ev
	 * @private
	 */
	_onStatusEnabled : function(ev) {
		this.fireEvent(VideoContestHTML5UploaderController.EV.POLL_OK, ev);
	},

	/**
	 * Callback when polling status gets failed.
	 * @param ev
	 * @private
	 */
	_onStatusFailed : function(ev) {
		this._hideConverting();
		this._showErrorTooltip(ev.status_reason);
	},

	/**
	 * Callback when polling AJAX request was failed.
	 * @param ev
	 * @private
	 */
	_onStatusRequestFailed : function(ev) {
		this.fireEvent(VideoContestHTML5UploaderController.EV.POLL_FAIL, ev);
		this._hideConverting();

		/* develblock:start */
		console.error('Status request failed :( ', ev);
		/* develblock:end */
	},

	/**
	 * Events pls.
	 */
	bind : function() {
		VideoContestHTML5UploaderController.superclass.bind.call(this);

		this.poll.on(MWHPollPlugin.EVENT.ENABLED, this._onStatusEnabled, this);
		this.poll.on(MWHPollPlugin.EVENT.CONVERT_FAILED, this._onStatusFailed, this);
		this.poll.on(MWHPollPlugin.EVENT.REQUEST_FAILED, this._onStatusRequestFailed, this);

		Broadcaster.on(TagManager.GLOBALEVENT_CONTEST_TAG_ADDED, this._onTagAdded, this);
		Broadcaster.on(TagManager.GLOBALEVENT_CONTEST_TAG_REMOVED, this._onTagRemoved, this);
	}

});