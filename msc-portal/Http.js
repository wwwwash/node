const DEFAULT = {
	credentials : 'include'
};

const OK_STATUS_MAP = [
	true,
	'ok',
	'OK'
];

/**
 * Comminized HTTP tools.
 */
export class Http {

	// The last request object
	request = null;

	// The last response object
	response = null;

	/**
	 * Fetch wrapper to handle
	 * API requests in a common way.
	 *
	 * @param   {string} url    Request URL
	 * @param   {object} config Fetch config
	 * @returns {Promise.<T>} Fetch promise
	 * @constructor
	 */
	fetch(url, config = DEFAULT) {
		config = {
			...DEFAULT,
			...config
		};

		// Backend needs this header to validate AJAX requests
		config.headers = config.headers || new Headers();
		config.headers.append('X-Requested-With', 'XMLHttpRequest');

		// Only create formData if body is a plain object
		if (config.body && !(config.body instanceof FormData)) {
			config.body = Http.ObjectToFormData(config.body);
		}

		// It's a Minion routing, parse it
		if (url.split('/').length === 2) {
			let { routeParams, routeQueries, routeAnchor, routeLanguage = true } = config;
			url = App.application.router.generateUrl(url, routeParams, routeQueries, routeAnchor, !routeLanguage);
		}

		// Clear out some stuff
		this.response = null;
		this.request = { url, config };

		return fetch(url, config)
			// Process native response object
			.then(response => {
				this.response = response;
				let { statusText } = response;

				if (!response.ok) {
					throw Error(`Request error: ${statusText}`);
				}
				return response.json();
			})
			// Process server response object
			.then(response => {
				let { data, status, errorText, errorCode, success } = response;

				if (!config.skipStatus && !OK_STATUS_MAP.includes(status) && !success) {
					throw Error(`${errorCode} ${errorText}`);
				}
				return config.skipStatus
					? response
					: data;
			})
			.catch(error => {
				/* develblock:start */
				console.error(`Fetch request error: ${error}`);
				/* develblock:end */
				throw Error(error);
			});
	}

	/**
	 * Shorthand for get request
	 * @param args
	 * @returns {Promise.<T>}
	 */
	get(...args) {
		return this.fetch(...args);
	}

	/**
	 * Shorhand for post request
	 * @param url
	 * @param config
	 * @returns {Promise.<T>}
	 */
	post(url, config = {}) {
		config.method = 'POST';
		return this.fetch(url, config);
	}

	/**
	 * Converts a plain object to FormData
	 * @param data
	 * @returns {FormData}
	 */
	static ObjectToFormData(data) {
		let body = new FormData();
		for (let key of Object.keys(data)) {
			body.append(key, data[key]);
		}
		return body;
	}
}

export default new Http();

let ObjectToFormData = Http.ObjectToFormData;
export { ObjectToFormData };