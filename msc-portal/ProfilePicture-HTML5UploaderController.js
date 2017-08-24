import Ext from '../../lib/vendor/ExtCore';
import Chaos from '../../lib/chaos/Chaos';

import HTML5UploaderController from './HTML5UploaderController';
import CropOverlayController from '../Overlay/Crop/Crop';
import GlobalProgressIndicator from '../ProgressIndicator/GlobalProgressIndicator';

export default function ProfilePictureHTML5UploaderController(el, config) {
	ProfilePictureHTML5UploaderController.superclass.constructor.call(this, el, config);
}

Ext.extend(ProfilePictureHTML5UploaderController, HTML5UploaderController, {

	/**
	 * Init method.
	 *
	 * @param {Object} el
	 * @param {Object} config
	 * @return void
	 */
	init : function(el, config) {
		ProfilePictureHTML5UploaderController.superclass.init.call(this, el, config);
	},

	/**
	 * Public function to tell the uploader to continue the process.
	 * After cropper finished.
	 */
	continueUpload : function() {
		this.options.formData = Object.assign(
			this.options.formData,
			CropOverlayController.cropData
		);
		this.getTokens();
	},

	/**
	 * After upload successfully finished.
	 * @private
	 */
	_onDone : function(ev) {
		ProfilePictureHTML5UploaderController.superclass._onAlways.call(this, ev);
		Chaos.fireEvent(GlobalProgressIndicator.GLOBALEVENT_SHOW_INDICATOR);
		window.location.reload();
	},

	/**
	 * Callback when preparation is okay.
	 * Also overides the default upload progress.
	 * We need to open the cropper and interrupt.
	 *
	 * @param ev
	 * @private
	 */
	_onPrepareok : function(ev) {
		CropOverlayController.dataURL = ev.results[Object.keys(ev.results)[0]];
	}

});