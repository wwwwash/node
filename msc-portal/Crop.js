import Ext from '../../../lib/vendor/ExtCore';
import Chaos from '../../../lib/chaos/Chaos';
import ChaosObject from '../../../lib/chaos/Object';
import Config from '../../../lib/chaos/Config';
import { Broadcaster } from '../../../lib/chaos/Broadcaster';

import ImageCrop from '../../Image/ImageCrop';
import Form from '../../_Form/Form';

export default function Crop(el, config) {
	Crop.superclass.constructor.call(this, el, config);
}

Crop.EVENT_SEND_MWH_CLICK = 'onSendToMwhClick';
Crop.dataURL = undefined;
Crop.cropData = undefined;

Chaos.extend(Crop, ChaosObject, {

	/** @var {String}                    Btn selector for overlay closing and upload starting */
	sendToMwhBtnId : 'sendToMwh',

	/** @var {String}                    Chaos Config key for screen name */
	screenNameConfigKey : 'screenName',

	/** @var {String}                    Save Crop buttons selector */
	saveCropBtnSel : 'button',

	/** @var {String}                    Save Crop buttons selector */
	disabledAttribute : 'disabled',

	/** @var {String}                    ID of the crop overlay */
	cropOverlayId : 'cropOverlay',

	formContainerId : 'cropImageForm',

	/** @var {Object}                    Coming from OverlayController automatically */
	overlayCmp : undefined,

	/** @var {Object}                    Coming from OverlayController automatically */
	response : undefined,

	/** @var {Object}                    Btn which triggers the overlay close and upload start (at this moment:) */
	_sendToMwhBtnEl : undefined,

	/** @var {Object}                    Element of the crop overlay */
	_cropOverlayEl : undefined,

	/** @var {Object}                    Crop Component */
	_cropCmp : undefined,

	/**
	 * Init
	 *
	 * @param {Element} el
	 * @param {Object} config   Config object of this controller
	 */
	init : function(el, config) {
		this._cropOverlayEl = Ext.get(this.cropOverlayId);
		this._sendToMwhBtnEl = Ext.get(this.sendToMwhBtnId);
		this._saveCropBtnEls = this._cropOverlayEl.select(this.saveCropBtnSel);

		var response = this.response,
			imageDomSrc = this._cropOverlayEl.select('img').item(0).dom.src,
			dataURL = Crop.dataURL,
			imageBlob = this._getImageFromBlob(dataURL),
			imageSrc = dataURL.length > 0 ? imageBlob : imageDomSrc;


		// Crop component instantiate
		this._cropCmp = new ImageCrop(this._cropOverlayEl, {
			imageUrl      : imageSrc,
			borderOffset  : 4,
			saveToHiddens : true,
			minWidth      : response.ratio == '16:9' ? response.min169Width : response.min43Width,	// eslint-disable-line
			ratio         : response.ratio == '16:9' ? ImageCrop.RATIO_169 : ImageCrop.RATIO_43		// eslint-disable-line
		});

		new Form(Ext.get(this.formContainerId), {});

		Crop.superclass.init.call(this, el, config);

		/* develblock:start */
		console.log('[Controller] Crop init done!');
		/* develblock:end */
	},

	/**
	 * Getting image from a BLOB.
	 * Image data handling must be with BLOB, because it won't cause memory leak.
	 * @param {String} dataURL of the image
	 * @returns {Object}
	 * @private
	 */
	_getImageFromBlob : function(dataURL) {
		var blob = this._dataURLToBlob(dataURL),
			urlCreator = window.URL || window.webkitURL,
			imageUrl = urlCreator.createObjectURL(blob);

		return imageUrl;
	},

	/**
	 * Creates and returns a blob from a data URL (either base64 encoded or not).
	 *
	 * @param {string} dataURL The data URL to convert.
	 * @return {Object} A blob representing the array buffer data.
	 * @private
	 */
	_dataURLToBlob : function(dataURL) {
		var BASE64_MARKER = ';base64,';
		var parts = dataURL.split(BASE64_MARKER);
		var contentType = parts[0].split(':')[1];
		var raw = window.atob(parts[1]);
		var rawLength = raw.length;
		var uInt8Array = new Uint8Array(rawLength);

		if (dataURL.indexOf(BASE64_MARKER) === -1) {
			parts = dataURL.split(',');
			contentType = parts[0].split(':')[1];
			raw = decodeURIComponent(parts[1]);

			return new Blob([raw], { type : contentType });
		}

		for (var i = 0; i < rawLength; ++i) {
			uInt8Array[i] = raw.charCodeAt(i);
		}

		return new Blob([uInt8Array], {
			type : contentType
		});
	},

	/**
	 * Click on the SendToMwh button. Handles the popup closing and crop data gathering.
	 * @private
	 */
	_onSendToMwhClick : function() {
		var mwhData = this._gatherMWHData();

		if (mwhData) {
			Broadcaster.fireEvent(
				Crop.EVENT_SEND_MWH_CLICK,
				this
			);
			this.overlayCmp.closePopupEventHandler();
		}
		/* develblock:start */
		else {
			console.warn('Failed to gather MWH data!');
		}
		/* develblock:end */
	},

	/**
	 * Gets the model name from the menu
	 * @return string perfname of the model
	 */
	getModelName : function() {
		return Config.get(this.screenNameConfigKey);
	},

	/**
	 * Gathering data for MWH.
	 * These datas coming from the
	 * @private
	 */
	_gatherMWHData : function() {
		var cropData43,
			cropData169;

		// Trying to fetch 4:3 crop data from the dom
		try {
			cropData43 = {
				x1 : document.getElementById('x1').value,
				x2 : document.getElementById('x2').value,
				y1 : document.getElementById('y1').value,
				y2 : document.getElementById('y2').value
			};
		}
		catch (e) {
			/* develblock:start */
			console.warn('4:3 coordinates cannot be found in the overlay DOM!');
			/* develblock:end */

			return false;
		}

		// Trying to fetch 16:9 crop data from the overlay response
		try	{
			var croppingCoordinates = this.response.croppingCoordinates['16:9'];
			cropData169 = {
				x1 : croppingCoordinates.x1,
				x2 : croppingCoordinates.x2,
				y1 : croppingCoordinates.y1,
				y2 : croppingCoordinates.y2
			};
		}
		catch (e) {
			/* develblock:start */
			console.warn('16:9 coordinates cannot be found in the overlay response!');
			/* develblock:end */

			return false;
		}

		var cropData = Crop.cropData = {
			croppingCoordinates : {
				'16:9' : cropData169,
				'4:3'  : cropData43
			},
			category : this.response.category
		};

		return cropData;
	},

	/**
	 * Cropper inited event handler.
	 * Removes disabled attribute from Save Crop buttons on cropper init.
	 *
	 * @private
	 */
	_onCropperInited : function() {
		this._saveCropBtnEls.each(function(el) {
			el.dom.removeAttribute(this.disabledAttribute);
		}.bind(this));
	},

	/**
	 * Bind event listeners
	 */
	bind : function() {
		Crop.superclass.bind.call(this);

		if (this._sendToMwhBtnEl) {
			this._sendToMwhBtnEl.on('click', this._onSendToMwhClick, this);
		}

		// In case of image loading failure , refresh the page.
		this._cropCmp.on(ImageCrop.EVENT_IMG_NOT_LOADED, location.reload, this, { single : true });
		this._cropCmp.on(ImageCrop.EVENT_INITED, this._onCropperInited, this, { single : true });
	},

	/**
	 * UnBind event listeners
	 */
	unbind : function() {
		this.autoUnbind();
	}
});