import riot from 'riot';

import Notification from '../Notification/Notification';

/**
 * Constant representing common fetch states
 */
export const STATE = {
	INITIALIZING : 'init',
	LOADING      : 'loading',
	LOADED       : 'loaded'
};

var toQueryString = function(obj) {
	var parts = [];
	for (let i in obj) {
		if (obj.hasOwnProperty(i)) {
			parts.push(encodeURIComponent(i) + '=' + encodeURIComponent(obj[i]));
		}
	}
	return parts.join('&');
};

/**
 * Abstract model class, implements fetch, adds observable
 */
export default class {

	/**
	 * Access STATE constant per instance
	 */
	STATE = STATE

	/**
	 * Timeout for the model's general error message
	 */
	generalErrorTimeout = null

	/**
	 * Model data
	 * @type {Array}
	 */
	data = []

	/**
	 * Returns current state.
	 * @returns {string}
	 */
	get state() {
		return this._state;
	}

	/**
	 * Sets current state and triggers update event.
	 * @param {string} state
	 */
	set state(state) {
		this._state = state;
		this.trigger('update', state);
	}

	/**
	 * Makes model observable and sets initial state.
	 */
	constructor() {
		riot.observable(this);
		this.state = STATE.INITIALIZING;

		if (this.bind) {
			this.bind();
		}
	}

	/**
	 * Fetch request. Extends native fetch.
	 * @param {string} url    URL to fetch.
	 * @param {object} config Native fetch config options.
	 * @returns {Promise.<TResult>}
	 */
	fetch(url, config = {}) {
		let headers = new Headers();

		// Extend
		config = Object.assign({
			credentials : 'include',
			headers
		}, config);

		headers.append('X-Requested-With', 'XMLHttpRequest');

		// Set State
		this.state = config.state || STATE.LOADING;

		// Convert simple objects to FormData
		if (typeof config.body === 'object' && !(config.body instanceof FormData)) {
			let fd = new FormData();
			for (let i in config.body) {
				if (config.body.hasOwnProperty(i)) {
					fd.append(i, config.body[i]);
				}
			}
			config.body = fd;
		}

		// Convert query object to query strings
		if (typeof config.query === 'object') {
			url = `${url}?${toQueryString(config.query)}`;
		}
		// Do request and return it's promise
		return window.fetch(url, config).then(response => response.json())
			.then(response => {
				if (response.success || response.status === 'OK') {
					setTimeout(() => this.state = config.state || STATE.LOADED);
					return response;
				}
				throw Error(response.errorMessage);
			})
			.catch(error => {
				this.showGlobalError(error);
				setTimeout(() => this.state = config.state || STATE.LOADED);
				throw Error(error);
			});
	}

	/**
	 * Raises global error message in Messenger
	 * @param {String} text Text for the error message
	 */
	showGlobalError(text = 'Unknown error.') {
		clearTimeout(this.generalErrorTimeout);
		this.generalErrorTimeout = setTimeout(() => {
			Notification.getInstance().showNotification({
				text            : text,
				icon            : 'error',
				direction       : 'top',
				autoHideEnabled : true
			});
		});
	}
}
