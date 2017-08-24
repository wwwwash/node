import $ from 'jquery';

import Ext from '../../lib/vendor/ExtCore';
import PH from '../../lib/constant/Phrame';
import { Broadcaster } from '../../lib/chaos/Broadcaster';

import HTML5Uploader from './HTML5Uploader';
import HTML5UploaderController from './HTML5UploaderController';
import Snapshooter from '../Snapshooter/Snapshooter';

import './IdUploader.scss';

export default function IdHTML5UploaderController(el, config) {
	IdHTML5UploaderController.superclass.constructor.call(this, el, config);
}

Ext.extend(IdHTML5UploaderController, HTML5UploaderController, {

	_isUploaded : undefined,

	/**
	 * Init method.
	 *
	 * @param {Object} el
	 * @param {Object} config
	 * @return void
	 */
	init : function(el, config) {
		IdHTML5UploaderController.superclass.init.call(this, el, config);

		this._ui = {};
		this._ui.item = this._el.closest('.js-item');
		this._ui.input = this._ui.item.find('input[type=hidden]');
		this._ui.uploaded = this._ui.item.find('.js-uploaded');
		this._ui.img = this._ui.uploaded.find('img');
		this._ui.uploader = this._ui.item.find('.js-uploader');
		this._ui.icon = this._ui.item.find('.js-icon i');
		this._ui.reject = this._ui.item.find('.js-reject');

		this._ui.item.on('click', '.js-remove', this._onRemoveClick.bind(this));
		this._ui.img.on('load', function() {$(this).removeClass(PH.cls.hide)});

		this._isUploaded = !this._ui.uploaded.hasClass(PH.cls.hide);
	},

	/**
	 * It'll show the preview of the uploaded image.
	 *
	 * @private
	 */
	_togglePreview : function() {
		this.toggleUploader();

		if (this._isUploaded) {
			this._hidePreview();
		}
		else {
			this._showPreview();
		}
		this._isUploaded = !this._isUploaded;
	},

	_hidePreview : function() {
		this._ui.uploaded.toggleClass(PH.cls.hide, true);
		this._ui.uploader.toggleClass(PH.cls.hide, false);
		this._ui.icon
			.removeClass(PH.icon.join(' '))
			.addClass(PH.cls.protip)
			.addClass(PH.icon.info);
	},

	_showPreview : function() {
		this._ui.uploaded.toggleClass(PH.cls.hide, false);
		this._ui.uploader.toggleClass(PH.cls.hide, true);
		this._ui.icon
			.protipHide()
			.removeClass(PH.icon.join(' '))
			.removeClass(PH.cls.protip)
			.addClass(PH.icon.ok);

		this._ui.img.addClass(PH.cls.hide);
		this._ui.img.attr('src', this.readerResults[Object.keys(this.readerResults)[0]]);
	},

	/**
	 * Sets the hidden input value.
	 *
	 * @param value
	 * @private
	 */
	_setInput : function(value) {
		this._ui.input.val(value);
	},

	/**
	 * After input value is changed.
	 *
	 * @private
	 */
	_onAfterChange : function() {
		this._ui.reject.protipHide().remove();
	},

	/**
	 * Handler after upload has finished.
	 *
	 * @param ev
	 * @private
	 */
	_onAfterDone : function(ev) {
		var response = JSON.parse(ev.result);

		if (response.status !== 'ERROR') {
			this._togglePreview();
			this._setInput(response.data.fileId);
		}
		else {
			this._addError(HTML5Uploader.ERROR.DEFAULT);
			this._showErrors();
		}
	},

	/**
	 * Handler when remove link is clicked.
	 *
	 * @private
	 */
	_onRemoveClick : function(ev) {
		ev.preventDefault();

		this._togglePreview();
		this._setInput('');
	},

	_onSnapshooterReady : function(ev) {
		this.add(ev.dataUri, 'snapshot.jpg', 'image/jpeg');
	},

	bind : function() {
		if (this._el.attr('id') === 'snapshotUploader') {
			Broadcaster.on(
				Snapshooter.EVENT_SNAPSHOT_IMAGE_READY,
				this._onSnapshooterReady, this
			);
		}

		IdHTML5UploaderController.superclass.bind.call(this);
	}

});