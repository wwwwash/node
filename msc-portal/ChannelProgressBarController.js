import Ext from '../../lib/vendor/ExtCore';
import Chaos from '../../lib/chaos/Chaos';
import ChaosController from '../../lib/chaos/Controller';

import ChannelProgressBarModel from './ChannelProgressBarModel';

/**
 * Channel progress bar controller
 */
export default function ChannelProgressBarController(el, config) {
	ChannelProgressBarController.superclass.constructor.call(this, el, config);
}

Ext.apply(ChannelProgressBarController, {
	EVENT_UPDATE_PROGRESSBAR_SUCCESS : 'update-progressbar-success',
	EVENT_UPDATE_PROGRESSBAR_FAILED  : 'update-progressbar-failed'
});

Chaos.extend(ChannelProgressBarController, ChaosController, {

	/**
	 * Init
	 *
	 * @param {Element} el      Context element
	 * @param {Object} config   Config object of this controller
	 */
	init : function(el, config) {
		ChannelProgressBarController.superclass.init.call(this, el, config);
		this.addEvents(
			ChannelProgressBarController.EVENT_UPDATE_PROGRESSBAR_SUCCESS,
			ChannelProgressBarController.EVENT_UPDATE_PROGRESSBAR_FAILED
		);
	},

	/**
	 * Update channel progress bar
	 *
	 * @method updateProgressBar
	 *
	 * @return void;
	 */
	updateProgressBar : function() {
		this.ChannelProgressBarModel.updateProgressBar();
	},

	/**
	 * Callback for a successfull update progressbar request
	 *
	 * @method onUpdateProgressBarSuccess
	 * @param {Object} ev    Event object
	 *
	 * @return void;
	 */
	onUpdateProgressBarSuccess : function(ev) {
		this.ChannelProgressBarView.refreshProgressBar(ev.response);
	},

	/**
	 * Callback for a failed update progressbar request
	 *
	 * @method onUpdateProgressBarFailed
	 *
	 * @return void;
	 */
	onUpdateProgressBarFailed : function() {

	},

	/**
	 * Binds events
	 */
	bind : function() {
		ChannelProgressBarController.superclass.bind.call(this);
		this.ChannelProgressBarModel.on(
			ChannelProgressBarModel.EVENT_UPDATE_PROGRESSBAR_SUCCESS,
			this.onUpdateProgressBarSuccess,
			this
		);
		this.ChannelProgressBarModel.on(
			ChannelProgressBarModel.EVENT_UPDATE_PROGRESSBAR_FAILED,
			this.onUpdateProgressBarFailed,
			this
		);
	},

	/**
	 * Unbind events
	 */
	unbind : function() {
		ChannelProgressBarController.superclass.unbind.call(this);
	}
});
