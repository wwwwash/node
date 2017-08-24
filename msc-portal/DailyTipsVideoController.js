import Chaos from '../../lib/chaos/Chaos';
import Config from '../../lib/chaos/Config';

import DailyTipsMediaController from './DailyTipsMediaController';

/**
 * Dashboard Daily Tips Video Controller.
 * Handles the JS business logic for every 'Video' type Daily Tip
 */

export default function DailyTipsVideoController(el, config) {
	DailyTipsVideoController.superclass.constructor.call(this, el, config);
}

Chaos.extend(DailyTipsVideoController, DailyTipsMediaController, {

	/** @var {String} sendTipIdRoute   send tip id ajax request route */
	sendTipIdRoute : 'TipChannelVideoVisibilitySettings/Update',

	init : function(el, tip) {
		/** @var {Object} uploaderConfigObj Config object for the HTML5Uploader */
		this.uploaderConfigObj = {
			errorMessages    : Config.get('errorObj').html5_uploader,
			url              : Config.get('MWHMediaUploadURL'),
			tokenUrl         : Chaos.getUrl('ChannelVideoUploadToken/Get', {}, { channelType : 'free' }),
			preview          : false,
			validate         : Config.get('ChannelVideoValidation'),
			onDoneCallback   : this._onUploadDone.bind(this),
			getFolderIdRoute : null
		};

		DailyTipsVideoController.superclass.init.call(this, el, tip);
	}
});
