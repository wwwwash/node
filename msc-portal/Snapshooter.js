import Webcam from 'webcamjs';

import CONST from '../../lib/constant/Constants';
import Ext from '../../lib/vendor/ExtCore';
import Chaos from '../../lib/chaos/Chaos';
import ChaosObject from '../../lib/chaos/Object';
import Connection from '../../lib/chaos/Connection';
import { Broadcaster } from '../../lib/chaos/Broadcaster';

import './Snapshooter.scss';

/**
 * Snapshooter
 * Handles the WebcamJS plugin and the snapshot functionality
 * WebcamJS plugin src: https://github.com/jhuckaby/webcamjs
 */

export default function Snapshooter(el, config) {
	Snapshooter.superclass.constructor.call(this, el, config);
}

// Snapshooter Constants
Snapshooter.STATE_LIVE = 'live';
Snapshooter.STATE_TAKE = 'take';
Snapshooter.STATE_READY = 'ready';
Snapshooter.STATE_RESULT = 'result';
Snapshooter.STATE_UPLOAD = 'upload';
Snapshooter.STATE_ERROR = 'error';

// Snapshooter Global Events
Snapshooter.EVENT_SNAPSHOT_IMAGE_READY = 'snapshot-image-ready';

Ext.extend(Snapshooter, ChaosObject, {

	/** @var {String} containerHideCls          Class name for hiding elements */
	containerHideCls : 'ph-invisible',
	/** @var {String} counterAttr               Name of the counter attribute */
	counterAttr      : 'counter',
	/** @var {String} disabledAttr              Attr name for disable element */
	disabledAttr     : 'disabled',
	/** @var {String} flashUrlAttr              Name of the flash url attribute */
	flashUrlAttr     : 'flash-url',
	/** @var {Boolean} forceFlash               Forcing flash is needed or not */
	forceFlash       : false,
	/** @var {String} userIdAttr                Name of the user id attribute */
	userIdAttr       : 'user-id',
	/** @var {String} snapshotRoute             Snapshot url for id request */
	snapshotRoute    : 'SnapshotUpload/Binary',
	/** @var {Object} jsCls                     Object containing all usable JS classes */
	jsCls            : {
		resultContainer        : '.js-container-result',
		takeContainer          : '.js-container-take',
		cameraContainer        : '.js-container-camera',
		readyContainer         : '.js-container-ready',
		counterContainer       : '.js-container-counter',
		cameraWarningContainer : '.js-container-warning',
		gridContainer          : '.js-container-grid',
		takeButton             : '.js-button-take',
		resetButton            : '.js-button-reset',
		checkButton            : '.js-button-check',
		continueButton         : '.js-button-continue'
	},
	/** @var {Boolean} _isCameraLive            Camera is live or not */
	_isCameraLive      : false,
	/** @var {Boolean} _takeButtonClicked       Take button was clicked or not */
	_takeButtonClicked : false,

	/**
	 * Init method.
	 *
	 * @param {Object} el
	 * @param {Object} config
	 * @return void
	 */
	init : function (el, config) {
		Broadcaster.addEvents(
			Snapshooter.EVENT_SNAPSHOT_IMAGE_READY
		);

		// Container Elements
		this._resultContainerEl = this.element.select(this.jsCls.resultContainer).item(0);
		this._takeContainerEl = this.element.select(this.jsCls.takeContainer).item(0);
		this._cameraContainerEl = this.element.select(this.jsCls.cameraContainer).item(0);
		this._readyContainerEl = this.element.select(this.jsCls.readyContainer).item(0);
		this._counterContainerEl = this.element.select(this.jsCls.counterContainer).item(0);
		this._counterSpanEls = this._counterContainerEl.select('span');
		this._cameraWarningEl = this.element.select(this.jsCls.cameraWarningContainer).item(0);
		this._gridContainerEl = this.element.select(this.jsCls.gridContainer).item(0);
		this._jsContainerEls = this.element.select('[class*="js-container"]');

		// User id
		this._dataUserId = this.element.data(this.userIdAttr);

		// Button Elements
		this._takeButtonEl = this.element.select(this.jsCls.takeButton).item(0);
		this._resetButtonEl = this.element.select(this.jsCls.resetButton).item(0);
		this._checkButtonEl = this.element.select(this.jsCls.checkButton).item(0);
		this._continueButtonEl = Ext.select(this.jsCls.continueButton).item(0);

		this._initWebcamJS(this.element.data(this.flashUrlAttr));

		Snapshooter.superclass.init.call(this, el, config);
	},

	/**
	 * Initialization and setting up the Webcam JS plugin.
	 * @param flashUrl {String} Url of the flash file.
	 * @private
	 * @return void
	 */
	_initWebcamJS : function (flashUrl) {
		Webcam.set({
			width       : 770,
			height      : 576,
			dest_width  : 960, // eslint-disable-line
			dest_height : 718, // eslint-disable-line
			force_flash : this.forceFlash // eslint-disable-line
		});
		if (flashUrl) {
			Webcam.setSWFLocation(flashUrl);
		}
		Webcam.attach(this.jsCls.cameraContainer);
	},

	/**
	 * Method for counting down before taking snapshot.
	 * @param fromNum {String} Value of the starting number.
	 * @private
	 * @return void
	 */
	_countDown : function (fromNum) {
		this.setState('take');
		var i = 0;
		this._countDownInterval = setInterval(function () {
			this._counterSpanEls.removeClass('count');
			if (i === parseInt(fromNum, 10)) {
				clearInterval(this._countDownInterval);
				Webcam.snap(this._setCameraImage.bind(this));
			}
			else {
				this._counterSpanEls.item(i).addClass('count');
			}
			i++;
		}.bind(this), 1000);
	},

	/**
	 * Method that creates the actual snapshot image with camera flash effect.
	 * @param data {String} Base64 format of the jpeg.
	 * @private
	 * @return void
	 */
	_setCameraImage : function (data) {
		this.appendImageWithSrc(data);
		this._cameraFlash();
		this.setState('result');
		this._snapshotDataUri = data;
	},

	/**
	 * Ajax request for file id.
	 * @param data_uri {String} Base64 format of the jpeg.
	 * @private
	 * @return void
	 */
	_fileIdRequest : function (dataUri) {
		Connection.Ajax.request({
			url     : Chaos.getUrl(this.snapshotRoute, { userId : this._dataUserId }, {}),
			type    : Chaos.Connection.TYPE_JSON,
			success : this._fileIdRequestSuccess,
			params  : { Filedata : dataUri },
			error   : this._fileIdRequestError,
			failure : this._fileIdRequestError,
			scope   : this,
			method  : CONST.POST
		});
	},

	/**
	 * Success callback for file id request.
	 * @param response {Object} Response object after ajax suscess
	 * @private
	 * @return void
	 */
	_fileIdRequestSuccess : function (response) {
		this.fileId = response.json.data.fileId;
	},

	/**
	 * Error callback for file id request.
	 * @param response {Object} Response object after ajax suscess
	 * @private
	 * @return void
	 */
	_fileIdRequestError : function (response) {
		/* develblock:start */
		console.log(response);
		/* develblock:end */
	},

	/**
	 * Creates a camera flash effect.
	 * @private
	 * @return void
	 */
	_cameraFlash : function () {
		this._flashTpl = Ext.DomHelper.markup({
			tag : 'div',
			cls : 'cameraFlash'
		});
		Ext.DomHelper.append(this._resultContainerEl, this._flashTpl);
		this._resultContainerEl.select('div').item(0).fadeOut({
			duration : 0.5,
			remove   : true
		});
	},

	/**
	 * Appends an image with custom source to the result container.
	 * @param data_uri {String} Base64 format of the jpeg.
	 * @public
	 * @return void
	 */
	appendImageWithSrc : function (dataUri) {
		this._imageTpl = Ext.DomHelper.markup({
			tag : 'img',
			src : dataUri
		});
		Ext.DomHelper.append(this._resultContainerEl, this._imageTpl);
		this.element.jq().protipHide();
	},

	/**
	 * Handles the state of actual process.
	 * @param state {String} Actual state of the process.
	 * @public
	 * @return void
	 */
	setState : function (state) {
		var self = this;
		this._jsContainerEls.each(function () {
			this.addClass(self.containerHideCls);
		});

		switch (state) {
			case Snapshooter.STATE_READY:
				this._resultContainerEl.dom.innerHTML = '';
				this._takeContainerEl.removeClass(this.containerHideCls);
				this._cameraContainerEl.removeClass(this.containerHideCls);
				if (this._isCameraLive && this._takeButtonClicked) {
					this._gridContainerEl.removeClass(this.containerHideCls);
				}
				break;
			case Snapshooter.STATE_RESULT:
				this._resultContainerEl.select('div').item(0).dom.innerHTML = '';
				this._resultContainerEl.removeClass(this.containerHideCls);
				this._readyContainerEl.removeClass(this.containerHideCls);
				break;
			case Snapshooter.STATE_UPLOAD:
				this._resultContainerEl.removeClass(this.containerHideCls);
				break;
			case Snapshooter.STATE_TAKE:
				this._gridContainerEl.removeClass(this.containerHideCls);
				this._cameraContainerEl.removeClass(this.containerHideCls);
				this._resultContainerEl.removeClass(this.containerHideCls);
				this._counterContainerEl.removeClass(this.containerHideCls);
				break;
			case Snapshooter.STATE_ERROR:
				this._resultContainerEl.dom.innerHTML = '';
				this._takeContainerEl.removeClass(this.containerHideCls);
				this._cameraContainerEl.removeClass(this.containerHideCls);
				if (!this._isCameraLive) {
					this._cameraWarningEl.removeClass(this.containerHideCls);
				}
				break;
			default :
		}
	},

	/**
	 * Callback when camera is live.
	 * @private
	 * @return void
	 */
	_onWebcamLive : function () {
		this._takeButtonEl.dom.removeAttribute(this.disabledAttr);
		this._isCameraLive = true;
		this.element.jq().protipHide();
	},

	/**
	 * Callback when we can not load the camera.
	 * @private
	 * @return void
	 */
	_onWebcamLoadError : function () {
		this._cameraWarningEl.removeClass(this.containerHideCls);
		this._gridContainerEl.addClass(this.containerHideCls);
		this._takeButtonEl.dom.setAttribute(this.disabledAttr, this.disabledAttr);
	},

	/**
	 * Callback when take snapshot button was clicked.
	 * @param ev {Object} Event object.
	 * @private
	 * @return void
	 */
	_onTakeSnapshotClick : function (ev) {
		ev.preventDefault();

		this._takeContainerEl.addClass(this.containerHideCls);
		this._counterContainerEl.removeClass(this.containerHideCls);
		this._countDown(this._counterContainerEl.data(this.counterAttr));
		this._gridContainerEl.removeClass(this.containerHideCls);
		this._takeButtonClicked = true;
	},

	/**
	 * Callback when take snapshot button was hovered.
	 * @private
	 * @return void
	 */
	_onTakeSnapshotMouseOver : function () {
		if (!this._takeButtonEl.dom.hasAttribute(this.disabledAttr)) {
			this._gridContainerEl.removeClass(this.containerHideCls);
		}
	},

	/**
	 * Callback when take snapshot button was leaved.
	 * @private
	 * @return void
	 */
	_onTakeSnapshotMouseLeave : function () {
		if (!this._takeButtonEl.dom.hasAttribute(this.disabledAttr) && !this._takeButtonClicked) {
			this._gridContainerEl.addClass(this.containerHideCls);
		}
	},

	/**
	 * Callback when reset button was clicked.
	 * @param ev {Object} Event object.
	 * @private
	 * @return void
	 */
	_onResetSnapshotClick : function (ev) {
		ev.preventDefault();

		this._takeButtonClicked = false;
		this._resultContainerEl.dom.innerHTML = '';
		this.setState('ready');
	},

	/**
	 * Callback when check again button was clicked.
	 * @param ev {Object} Event object.
	 * @private
	 * @return void
	 */
	_onCheckSnapshotClick : function (ev) {
		ev.preventDefault();

		Webcam.reset();
		this._initWebcamJS();
		this._cameraWarningEl.addClass(this.containerHideCls);
	},

	/**
	 * Callback when continue button was clicked.
	 * @param ev {Object} Event object.
	 * @private
	 * @return void
	 */
	_onContinueButtonClick : function (ev) {
		ev.preventDefault();

		Chaos.fireEvent(Snapshooter.EVENT_SNAPSHOT_IMAGE_READY, {
			fileId  : this.fileId,
			dataUri : this._snapshotDataUri
		});
	},

	/**
	 * Binds all basic event listeners.
	 * @public
	 * @return void
	 */
	bind : function () {
		if (this._takeButtonEl) {
			this._takeButtonEl.on('click', this._onTakeSnapshotClick, this);
			this._takeButtonEl.on('mouseover', this._onTakeSnapshotMouseOver, this);
			this._takeButtonEl.on('mouseleave', this._onTakeSnapshotMouseLeave, this);
		}
		if (this._resetButtonEl) {
			this._resetButtonEl.on('click', this._onResetSnapshotClick, this);
		}
		if (this._checkButtonEl) {
			this._checkButtonEl.on('click', this._onCheckSnapshotClick, this);
		}
		if (this._continueButtonEl) {
			this._continueButtonEl.on('click', this._onContinueButtonClick, this);
		}

		Webcam.on('live', this._onWebcamLive.bind(this));
		Webcam.on('error', this._onWebcamLoadError.bind(this));

		Snapshooter.superclass.bind.call(this);
	},

	/**
	 * Unbinds all basic event listeners.
	 * @public
	 * @return void
	 */
	unbind : function () {
		this.autoUnbind();
	}
});
