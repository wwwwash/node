import Chaos from '../../lib/chaos/Chaos';
import Config from '../../lib/chaos/Config';

import DailyTipsMediaController from './DailyTipsMediaController';

/**
 * Dashboard Daily Tips Photo Controller.
 * Handles the JS business logic for every 'Photo' type Daily Tip
 */

export default function DailyTipsPhotoController(el, config) {
	DailyTipsPhotoController.superclass.constructor.call(this, el, config);
}

Chaos.extend(DailyTipsPhotoController, DailyTipsMediaController, {

	/** @var {String} sendTipIdRoute   send tip id ajax request route */
	sendTipIdRoute : 'TipChannelPhotoVisibilitySettings/Update',

	init : function(el, tip) {
		/** @var {Object} uploaderConfigObj Config object for the HTML5Uploader */
		this.uploaderConfigObj = {
			errorMessages    : Config.get('errorObj').html5_uploader,
			url              : Config.get('MWHMediaUploadURL'),
			tokenUrl         : Chaos.getUrl('ChannelImageUploadToken/Get', {}, { channelType : 'free' }),
			preview          : false,
			validate         : Config.get('ChannelPhotoValidation'),
			onDoneCallback   : this._onUploadDone.bind(this),
			getFolderIdRoute : 'ChannelImageFolder/GetFolderIdByTipId'
		};

		DailyTipsPhotoController.superclass.init.call(this, el, tip);
	}
});
