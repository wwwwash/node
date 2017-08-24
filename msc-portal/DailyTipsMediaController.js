import CONST from '../../lib/constant/Constants';

import Chaos from '../../lib/chaos/Chaos';
import Controller from '../../lib/chaos/Controller';
import Connection from '../../lib/chaos/Connection';

import DailyTipsWidgetController from './DailyTipsWidgetController';
import MediaDailyTipHTML5UploaderController from '../_Uploader5/MediaDailyTip-HTML5UploaderController';

/**
 * Dashboard Daily Tips Media Controller.
 * Abstract class for the video and the photo controller.
 */

export default function DailyTipsMediaController(el, config) {
	DailyTipsMediaController.superclass.constructor.call(this, el, config);
}

Chaos.extend(DailyTipsMediaController, Controller, {

	/** @var {String} sendTipIdRoute   send tip id ajax request route */
	sendTipIdRoute    : undefined,
	/** @var {Object} uploaderConfigObj Config object for the HTML5Uploader */
	uploaderConfigObj : undefined,
	/** @var {Boolean} _isSent         Tip is sent or not */
	_isSent           : false,
	/** @var {Boolean} _ajaxInProgress Ajax data sending is in progress or not */
	_ajaxInProgress   : false,

	/**
	 * Initializer
	 *
	 * @param {Object} el  Widget Ext Element
	 * @param {Object} tip Tip Ext Element
	 *
	 * @return void
	 */
	init : function(el, tip) {
		this._tipEl = tip;
		this._btnEl = tip.select('.actionBtn').item(0);
		this._uploader = tip.select('.uploader5').item(0);

		this.uploaderFactory();

		this.bind();
	},

	/**
	 * Factory method for HTML5 Uploader
	 * @return void
	 */
	uploaderFactory : function() {
		this._uploaderCmp = new MediaDailyTipHTML5UploaderController(
			this._uploader,
			this.uploaderConfigObj
		);
	},

	/**
	 * Is Note Sent or Not
	 * @return {Boolean} Tip is is sent status or not
	 */
	isSent : function() {
		return this._isSent;
	},

	/**
	 * On upload done callback of the uploader
	 * @private
	 */
	_onUploadDone : function() {
		this._isSent = true;
		this._sendTipId();
	},

	/**
	 * Send Tip Id after upload
	 * @private
	 */
	_sendTipId : function() {
		var tipId = this._tipEl.data(DailyTipsWidgetController.CONST.TIP_ID_ATTR);

		Connection.Ajax.request({
			method : CONST.POST,
			url    : Chaos.getUrl(this.sendTipIdRoute, {}, {}),
			params : { tipId : tipId }
		});
	},

	/**
	 * Controller destroy
	 * @return void
	 */
	destroy : function() {
		if (this._uploaderCmp.destroy) {
			this._uploaderCmp.destroy();
		}
		this.unbind();
		this._tipEl.prev('input').remove();
		this._tipEl.remove();
	},

	/**
	 * Tip 'Next' link click event handler
	 * @param {Object} ev Event Object
	 * @param {Object} target Target Dom Element
	 * @private
	 * @return void
	 */
	_onNextClick : function(ev) {
		var isUploading = this.getUploaderStatus();
		if (isUploading) {
			ev.preventDefault();
		}
		else {
			this._uploaderCmp.hideErrors();
		}
	},

	/**
	 * Setter for _isUploading variable - Is Uplading in progress
	 * @param isUploading
	 * @private
	 */
	_setUploaderStatus : function(isUploading) {
		this._isUploading = isUploading;
	},

	/**
	 * Getter for _isUploading variable - Is Uplading in progress
	 * @returns {Boolean} Is Uplading in progress
	 */
	getUploaderStatus : function() {
		return this._isUploading;
	},

	/**
	 * Binding listeners
	 */
	bind : function() {
		this._tipEl.prev('input').on('click', this._onNextClick, this);
		this._uploaderCmp.on('change', function() { this._setUploaderStatus(true) }.bind(this));
		this._uploaderCmp.on('always', function() { this._setUploaderStatus(false) }.bind(this));
		this._uploaderCmp.on('preparefail', function() { this._setUploaderStatus(false) }.bind(this));
	},

	/**
	 * Unbinding listeners
	 */
	unbind : function() {
		this._tipEl.prev('input').un('click', this._onNextClick, this);
		this._uploaderCmp.un('change', function() { this._setUploaderStatus(true) }.bind(this));
		this._uploaderCmp.un('always', function() { this._setUploaderStatus(false) }.bind(this));
		this._uploaderCmp.un('preparefail', function() { this._setUploaderStatus(false) }.bind(this));
	}
});