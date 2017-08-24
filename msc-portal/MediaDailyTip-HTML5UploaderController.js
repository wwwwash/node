import $ from 'jquery';

import Ext from '../../lib/vendor/ExtCore';
import Chaos from '../../lib/chaos/Chaos';

import HTML5Uploader from './HTML5Uploader';
import HTML5UploaderController from './HTML5UploaderController';
import DailyTipsWidgetController from '../DailyTips/DailyTipsWidgetController';

export default function MediaDailyTipHTML5UploaderController(el, config) {
	MediaDailyTipHTML5UploaderController.superclass.constructor.call(this, el, config);
}

Ext.extend(MediaDailyTipHTML5UploaderController, HTML5UploaderController, {

	/**
	 * UI Selectors
	 */
	_ui : {
		defaultState : '.tip-state--default',
		successState : '.tip-state--success'
	},

	/** @var {String} tipSel                       Main tip element selector */
	tipSel : '.tip',

	/**
	 * Init method.
	 *
	 * @param {Object} el
	 * @param {Object} config
	 * @return void
	 */
	init : function(el, config) {
		MediaDailyTipHTML5UploaderController.superclass.init.call(this, el, config);

		// Override progressbar HTML5UploaderController UI selectors
		this.ui.progressBar = '.uploader5__progress .commonProgressBar';
		this.ui.progressBarBar = '.uploader5__progress .progressContainer';
		this.ui.text = '.uploader5__progress .progressTitle';
		this.ui.percentText = '.uploader5__progress .progressTitle em';
		// Re-fetch with overrided selectors
		this._fetchElements();
	},

	/**
	 * Callback when preparation was OK.
	 * @private
	 * @return void
	 */
	_onPrepareok : function() {
		// In photo daily tips we need a get folder id request after frontend validation, before upload
		if (this.getFolderIdRoute) {
			this._getFolderId();
		}
		// Else we can use the HTML5UploaderController's original method
		else {
			MediaDailyTipHTML5UploaderController.superclass._onPrepareok.call(this);
		}
	},

	/**
	 * Getting folder id via ajax for the get-token-Request
	 * @private
	 * @return void
	 */
	_getFolderId : function() {
		var tipId = this._el.closest(this.tipSel).data(DailyTipsWidgetController.CONST.TIP_ID_ATTR),
			getFolderIdUrl = Chaos.getUrl(this.getFolderIdRoute, { tipId : tipId }, { channelType : 'free' });

		$.get(getFolderIdUrl)
			.done(this._getFolderIdSuccess.bind(this))
			.fail(this._getFolderIdFail.bind(this));
	},

	/**
	 * Success callback of getting folder id
	 * @param {Object} response
	 * @private
	 * @return void
	 */
	_getFolderIdSuccess : function(response) {
		try {
			var folderId = response.content.folderId;
			this.options.formData = { folderId : folderId };
			this.options.tokenUrl = this.tokenUrl;
			this.getTokens();
		}
		catch (e) {
			/* develblock:start */console.warn('Error with the ajax response format');/* develblock:end */
		}
	},

	/**
	 * Folder id request failed callback
	 * @private
	 */
	_getFolderIdFail : function() {
		this._toggleProgressbar();
		this._addError(HTML5Uploader.ERROR.DEFAULT);
		this._showErrors();
	},

	/**
	 * Shows the success state of the tip
	 * @return void
	 */
	showSuccessState : function() {
		var tipEl = this._el.closest(this.tipSel);
		tipEl.find(this._ui.defaultState).addClass('hide');
		tipEl.find(this._ui.successState).removeClass('hide');
	},

	/**
	 * Toggles the visible test on the progressbar.
	 * @private
	 */
	_toggleText : function() {
		this.ui.text.toggleClass(this.cls.hide);
	},

	/**
	 * On upload done event handler
	 * @private
	 */
	_onDone : function() {
		this.options.onDoneCallback.call(this);
		this.showSuccessState();
	},

	/**
	 * Callback when upload has finished.
	 * @private
	 */
	_onAlways : function() {
		this._toggleProgressbar();
		if (this._errors.length) {
			this._showErrors();
		}
	},

	/**
	 * Controller destroy
	 * @return void
	 */
	destroy : function() {
		this._el.off();
	}
});
