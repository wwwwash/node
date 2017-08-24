import Ext from '../../../lib/vendor/ExtCore';
import Chaos from '../../../lib/chaos/Chaos';
import Config from '../../../lib/chaos/Config';
import { Broadcaster } from '../../../lib/chaos/Broadcaster';

import MediaListAbstract from './MediaListAbstract';
import ProfilePictureHTML5UploaderController from '../../_Uploader5/ProfilePicture-HTML5UploaderController';
import CropOverlayController from '../../Overlay/Crop/Crop';
import HTML5Uploader from '../../_Uploader5/HTML5Uploader';

import './ProfilePicture.scss';

export default function ProfilePicture(el, config) {
	ProfilePicture.superclass.constructor.call(this, el, config);
}

Chaos.extend(ProfilePicture, MediaListAbstract, {

	/** @var {String}               Route of the gallery category overlay block */
	photoCategoryOverlayRoute : 'ProfilePictureCategory/GetOverlay',

	/** @var {String}               Selector of the upload file field */
	uploadContainerId : 'profilePictureUploader',

	/** @var {String}               Chaos Config key for screen name */
	screenNameConfigKey : 'screenName',

	/** @var {Object}               Element of the uplosf button */
	_uploadBtnEl : undefined,

	/** @var {Object}               Uploader5 instance */
	_uploader : undefined,

	/**
	 * Init
	 *
	 * @param {Element} el      This should be the body tag.
	 * @param {Object} config   Config object of this component
	 */
	init : function(el, config) {
		// Init Html5Uploader Chaos plugin for the file input element
		this._uploader = new ProfilePictureHTML5UploaderController(Ext.get(this.uploadContainerId), {
			errorMessages : Config.get('errorObj').html5_uploader,
			url           : Config.get('MWHMediaUploadURL'),
			tokenUrl      : Chaos.getUrl('ProfilePictureUploadToken/Get'),
			preview       : true,
			validate      : Config.get('ProfilePictureValidation')
		});

		this._uploadBtnEl = Ext.get(this._uploader.ui.button.get(0));

		// Call parent class init
		ProfilePicture.superclass.init.call(this, el, config);
	},

	/**
	 * When uploaded file processed, and added to the upload queue.
	 * Opening category selector.
	 */
	_onPrepareOk : function() {
		var overlayUrl;

		this._overlayCmp = Config.get('overlayComponent');
		overlayUrl = Chaos.getUrl(this.photoCategoryOverlayRoute);
		this._overlayCmp.openOverlay(overlayUrl);
	},

	/**
	 * Gets the model name from the menu
	 * @return string perfname of the model
	 */
	getModelName : function() {
		return Config.get(this.screenNameConfigKey);
	},

	/**
	 * Bind events
	 */
	bind : function() {
		ProfilePicture.superclass.bind.call(this);

		this._uploader.on(HTML5Uploader.EV.PREPARE_OK, this._onPrepareOk, this);

		this._uploadBtnEl.on('click', this._onUploadBtnClick, this);

		Broadcaster.on(
            CropOverlayController.EVENT_SEND_MWH_CLICK,
			function() {this._uploader.continueUpload()},
			this
		);
	},

	/**
	 * Unbind events
	 */
	unbind : function() {
		this.autoUnbind();
	}
});
