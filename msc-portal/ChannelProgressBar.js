import Ext from '../../lib/vendor/ExtCore';
import Chaos from '../../lib/chaos/Chaos';
import ChaosObject from '../../lib/chaos/Object';
import { Broadcaster } from '../../lib/chaos/Broadcaster';

import ChannelProgressBarController from './ChannelProgressBarController';
import ChannelProgressBarView from './ChannelProgressBarView';
import ChannelProgressBarModel from './ChannelProgressBarModel';

/**
 * Channel progress bar component
 */
export default function ChannelProgressBar(el, config) {
	ChannelProgressBar.superclass.constructor.call(this, el, config);
}

ChannelProgressBar.GLOBALEVENT_UPDATE_PROGRESSBAR = 'update-progressbar';

Ext.extend(ChannelProgressBar, ChaosObject, {
	/** @var {String} errorMessage              Error message */
	message                : undefined,
	/** @var {String} progressBarContainerId    Id of progress bar container */
	progressBarContainerId : 'channelProgressBarContainer',

	/**
	 * Initializer.
	 * @param {Object}  el      Context element
	 * @param {Object} config   Config
	 *
	 * @return  void
	 */
	init : function(el, config) {
		this.progressBarEl = Ext.get(this.progressBarContainerId);
		ChannelProgressBar.superclass.init.call(this, el, config);
		if (this.progressBarEl) {
			this.getChannelProgressBarController();
			Chaos.addEvents(
				ChannelProgressBar.GLOBALEVENT_UPDATE_PROGRESSBAR
			);
		}
	},

	/**
	 * Gets an instance of a ChannelProgressBar Controller.
	 *
	 * @return {Object} ChannelProgressBarController
	 */
	getChannelProgressBarController : function() {
		return this._setChannelProgressBarController();
	},

	/**
	 * Sets an instance of a ChannelProgressBarController.
	 *
	 * @return {Object} ChannelProgressBarController
	 */
	_setChannelProgressBarController : function() {
		if (!(this._channelProgressBarController instanceof ChannelProgressBarController)) {
			this._channelProgressBarController = new ChannelProgressBarController({
				el    : this.element,
				items : {
					ChannelProgressBarView : {
						component : this._setChannelProgressBarView()
					},
					ChannelProgressBarModel : {
						component : this._setChannelProgressBarModel()
					}
				}
			});
		}
		return this._channelProgressBarController;
	},

	/**
	 * Returns an instance of a ChannelProgressBarView.
	 *
	 * @return {Object} ChannelProgressBarView
	 */
	_setChannelProgressBarView : function() {
		if (!(this._channelProgressBarView instanceof ChannelProgressBarView)) {
			this._channelProgressBarView = new ChannelProgressBarView(this.element, {});
		}
		return this._channelProgressBarView;
	},

	/**
	 * Returns an instance of a ChannelProgressBarView.
	 *
	 * @return {Object} ChannelProgressBarView
	 */
	_setChannelProgressBarModel : function() {
		if (!(this._channelProgressBarModel instanceof ChannelProgressBarModel)) {
			this._channelProgressBarModel = new ChannelProgressBarModel(this.element, {});
		}
		return this._channelProgressBarModel;
	},

	/**
	 * On update channel progress bar
	 *
	 * @method onUpdateProgressBar
	 *
	 * @return void;
	 */
	onUpdateProgressBar : function() {
		this.getChannelProgressBarController().updateProgressBar();
	},

	/**
	 * Attach initial event handlers.
	 */
	bind : function() {
		ChannelProgressBar.superclass.bind.call(this);
		if (this.progressBarEl) {
			Broadcaster.on(
				ChannelProgressBar.GLOBALEVENT_UPDATE_PROGRESSBAR,
				this.onUpdateProgressBar,
				this
			);
		}
	},

	/**
	 * Detach initial event handlers.
	 */
	unbind : function() {
		ChannelProgressBar.superclass.unbind.call(this);
		this.autoUnbind();
	}
});
