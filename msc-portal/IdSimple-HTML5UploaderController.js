import Ext from '../../lib/vendor/ExtCore';

import HTML5Uploader from './HTML5Uploader';
import HTML5UploaderController from './HTML5UploaderController';

export default function IdSimpleHTML5UploaderController (el, config) {
	IdSimpleHTML5UploaderController.superclass.constructor.call(this, el, config);
}

Ext.extend(IdSimpleHTML5UploaderController, HTML5UploaderController, {
	/**
	 * Init method.
	 *
	 * @param {Object} el
	 * @param {Object} config
	 * @return void
	 */
	init : function(el, config) {
		IdSimpleHTML5UploaderController.superclass.init.call(this, el, config);

		this._ui = {};
		this._ui.resultContainer = this._el.next('.resultContainer');
		this._ui.fileName = this._ui.resultContainer.find('.uploadedFileName');
		this._ui.img = this._ui.resultContainer.find('img');
		this._ui.input = this._ui.resultContainer.next('input');
		this._ui.remove = this._ui.resultContainer.find('.removeUploadedImage');
		this._ui.alertIcon = this._ui.input.next('i');
		this._ui.rejectedAlertIcon = this._ui.resultContainer.find('.icon-alert');
		this._ui.okIcon = this._ui.resultContainer.find('.icon-ok');

		this._ui.remove.on('click', this._onRemoveClick.bind(this));
	},

	/**
	 * It'll show the preview of the uploaded image.
	 *
	 * @private
	 */
	_togglePreview : function() {
		this.toggleUploader();
		this._ui.resultContainer.toggleClass(this.cls.hide);
		this._ui.okIcon.toggleClass(this.cls.hide);
		this._ui.rejectedAlertIcon.hide();
		this._ui.img.get(0).onload = function() {this.style.display = 'inline'};
		this._ui.img.css({ display : 'none' });
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
		this._ui.alertIcon.protipHide();
		this._ui.alertIcon.addClass(this.cls.hide);
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
			this._ui.fileName.text(response.data.fileId);
			this._setInput(response.data.fileId);
		}
		else {
			this._addError(HTML5Uploader.ERROR.DEFAULT);
			this._showErrors();
		}
	},

	/**
	 * Handler when remove lonk is clicked.
	 *
	 * @private
	 */
	_onRemoveClick : function() {
		this._togglePreview();
		this._setInput('');
	}

});