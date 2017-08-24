import Ext from '../../lib/vendor/ExtCore';
import Chaos from '../../lib/chaos/Chaos';
import ChaosObject from '../../lib/chaos/Object';
import Connection from '../../lib/chaos/Connection';
import Config from '../../lib/chaos/Config';

/**
 * Channel progress bar model
 */

export default function ChannelProgressBarModel(el, config) {
	ChannelProgressBarModel.superclass.constructor.call(this, el, config);
}

Ext.apply(ChannelProgressBarModel, {
	EVENT_UPDATE_PROGRESSBAR_SUCCESS : 'update-progressbar-success',
	EVENT_UPDATE_PROGRESSBAR_FAILED  : 'update-progressbar-failed'
});

Chaos.extend(ChannelProgressBarModel, ChaosObject, {

	/** @var {String} updateProgressBarUrl url of save photo title service */
	updateProgressBarUrl : '/channel/edit/statusbar',

	/**
	 * Init
	 *
	 * @param {Element} el      Context element
	 * @param {Object} config   Config object of this controller
	 */
	init : function(el, config) {
		ChannelProgressBarModel.superclass.init.call(this, el, config);
		this.addEvents(
			ChannelProgressBarModel.EVENT_UPDATE_PROGRESSBAR_SUCCESS,
			ChannelProgressBarModel.EVENT_UPDATE_PROGRESSBAR_FAILED
		);
		this.channelType = Config.get('channelType');
	},

	/**
	 * Update progress bar via ajax.
	 *
	 * @method updateProgressBar
	 * @public
	 *
	 * @param {Object} params     ajax params
	 *
	 * @return {Object} scope to chain
	 */
	updateProgressBar : function() {
		var url = this.updateProgressBarUrl + '?channelType=' + this.channelType;

		Connection.Ajax.request({
			type    : 'json',
			method  : 'post',
			url     : url,
			scope   : this,
			success : this._updateProgressBarSuccess,
			error   : this._updateProgressBarFailed,
			failure : this._updateProgressBarFailed
		});
		return this;
	},

	/**
	 * Callback for a successful update progress bar request
	 *
	 * @method _updateProgressBarSuccess
	 * @private
	 *
	 * @param {Object} response   Server response
	 *
	 * @return void;
	 */
	_updateProgressBarSuccess : function(response) {
		this.fireEvent(ChannelProgressBarModel.EVENT_UPDATE_PROGRESSBAR_SUCCESS, { scope : this, response : response });
	},

	/**
	 * Callback for a failed update progress bar request
	 *
	 * @method _updateProgressBarFailed
	 * @private
	 *
	 * @param {Object} response   Server response
	 *
	 * @return void;
	 */
	_updateProgressBarFailed : function(response) {
		this.fireEvent(ChannelProgressBarModel.EVENT_UPDATE_PROGRESSBAR_FAILED, { scope : this, response : response });
	}
});
