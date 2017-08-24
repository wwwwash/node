import Ext from '../../lib/vendor/ExtCore';

import HTML5Uploader from './HTML5Uploader';
import HTML5UploaderController from './HTML5UploaderController';

export default function SnapshotHTML5UploaderController(el, config) {
	SnapshotHTML5UploaderController.superclass.constructor.call(this, el, config);
}

Ext.extend(SnapshotHTML5UploaderController, HTML5UploaderController, {

	/**
	 * Init method.
	 *
	 * @param {Object} el
	 * @param {Object} config
	 * @return void
	 */
	init : function (el, config) {
		SnapshotHTML5UploaderController.superclass.init.call(this, el, config);
	},

	_onAfterChange : function () {

	},

	_onAfterPrepareok : function () {

	},

	_onAfterDone : function (ev) {
		var response = JSON.parse(ev.result);
		if (!response.status !== 'ERROR') {
			this._addError(HTML5Uploader.ERROR.IMAGE_MIN_WIDTH.DEFAULT);
			this._showErrors();
		}
	},

	_onAfterPreparefail : function () {
		this._toggleProgressbar();
		this._showErrors();
	}
});
