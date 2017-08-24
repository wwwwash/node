/* eslint-disable complexity */

import $ from 'jquery';

import Ext from '../../lib/vendor/ExtCore';
import Connection from '../../lib/chaos/Connection';

export default function MWHPollPlugin(config) {
	MWHPollPlugin.superclass.constructor.call(this, config);
	this.init(config);
}

MWHPollPlugin.STATUS = {
	UPLOADED         : 'uploaded',
	PENDING          : 'pending_upload',
	WAITING_APPROVAL : 'waitingForApproval',
	PENDING_ROTATE   : 'pending_rotate',
	ENABLED          : 'enabled',
	CONVERTING       : 'converting',
	FAILED           : 'failed'
};

MWHPollPlugin.EVENT = {
	CONVERTED      : 'file-converted',
	CONVERT_FAILED : 'file-convert_failed',
	ALL_READY      : 'all-file-status-ready',
	ENABLED        : 'content-status-enabled',
	REQUEST_FAILED : 'request-failed'
};

Ext.extend(MWHPollPlugin, Ext.util.Observable, {

	/**
	 * Defaults.
	 */
	config : {
		pause : 5000,
		url   : undefined
	},

	/**
	 * Queue of unresolved id's.
	 */
	_queue : [],

	/**
	 * Request timeout task.
	 */
	_task : undefined,

	/**
	 * Init
	 *
	 * @param {Element} el      This should be the body tag.
	 * @param {Object} config   Config object of this component
	 */
	init : function(config) {
		this.config = Object.assign(this.config, config);

		$.each(MWHPollPlugin.EVENT, function(key, value) {
			this.addEvents(value);
		}.bind(this));
	},

	/**
	 * Adds a mongodID to the queue.
	 *
	 * @param id
	 */
	add : function(id) {
		if (id && !this._queue.indexOf(id) + 1) {
			this._queue.push(id);
		}
		if (this._queue.length) {
			this._start();
		}
	},

	/**
	 * Removes an ID fromt eh queue.
	 * Stops the polling if queue gets empty.
	 *
	 * @param id
	 */
	remove : function(id) {
		this._queue.splice(this._queue.indexOf(id), 1);
		if (!this._queue.length) {
			this._stop();
		}
	},

	/**
	 * Aborts polling but keeps the queue.
	 */
	abort : function() {
		this._stop();
	},

	/**
	 * Purges the queue and stops the polling.
	 */
	purge : function() {
		this._stop();
		this._queue = [];
	},

	/**
	 * Starts the polling.
	 *
	 * @private
	 */
	_start : function() {
		this._task = this._task || setTimeout(
			this._doRequest.bind(this),
			this.config.pause
		);
	},

	/**
	 * Stops the polling.
	 *
	 * @private
	 */
	_stop : function() {
		this._task = clearTimeout(this._task);
	},

	/**
	 * Runs the polling request.
	 *
	 * @private
	 */
	_doRequest : function() {
		Connection.Ajax.request({
			url    : this.config.url,
			type   : 'json',
			method : 'POST',
			params : {
				documentIds : this._queue
			},
			scope   : this,
			success : this._onRequestSuccess,
			error   : this._onRequestFail,
			failure : this._onRequestFail
		});
	},

	/**
	 * Polling request success callback
	 *
	 * @param response {Object} AJAX request response object.
	 * @private
	 */
	_onRequestSuccess : function(response) {
		var id, status;
		var docs = response.json.data;

		for (id in docs) {
			if (docs.hasOwnProperty(id)) {
				status = docs[id].status;

				switch (status) {
					case MWHPollPlugin.STATUS.ENABLED:
					case MWHPollPlugin.STATUS.WAITING_APPROVAL:
						this.remove(id);
						this.fireEvent(MWHPollPlugin.EVENT.ENABLED, docs[id]);
						break;
					case MWHPollPlugin.STATUS.FAILED:
						this.remove(id);
						this.fireEvent(MWHPollPlugin.EVENT.CONVERT_FAILED, docs[id]);
						break;
					case MWHPollPlugin.STATUS.PENDING_ROTATE:
					case MWHPollPlugin.STATUS.UPLOADED:
					case MWHPollPlugin.STATUS.PENDING:
					case MWHPollPlugin.STATUS.CONVERTING:
					default: break;
				}
			}
		}

		this._stop();

		if (this._queue.length) {
			this._start();
		}
		else {
			this.fireEvent(MWHPollPlugin.EVENT.ALL_READY);
		}
	},

	/**
	 * Polling request fail callback
	 *
	 * @param response {Object} AJAX request response object.
	 * @private
	 */
	_onRequestFail : function(response) {
		this.fireEvent(MWHPollPlugin.EVENT.REQUEST_FAILED, response);
	}
});