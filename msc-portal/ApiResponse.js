/**
 * Represents an API response.
 *
 * @param {String} [status]
 * @param {Number} [errorCode]
 * @param {String} [errorMessage]
 * @param {*} [data]
 */
function ApiResponse(status, errorCode, errorMessage, data) {
	status = status || null;
	errorCode = errorCode || null;
	errorMessage = errorMessage || null;
	data = data || null;

	ApiResponse.STATUS_OK = 'OK';
	ApiResponse.STATUS_ERROR = 'ERROR';

	/** @type {String} */
	this.status = status;

	/** @type {Number} */
	this.errorCode = errorCode;

	/** @type {String} */
	this.errorMessage = errorMessage;

	/** @type {*} */
	this.data = data;

	/**
	 * @param {object} responseData
	 *
	 * @returns {ApiResponse}
	 */
	ApiResponse.createFromResponse = function (responseData) {
		return new ApiResponse(
			responseData.status,
			responseData.errorCode,
			responseData.errorMessage,
			responseData.data
		);
	};

	/**
	 * @param {object} jqXHR
	 *
	 * @returns {ApiResponse}
	 */
	ApiResponse.createFromJqXHR = function (jqXHR) {
		var parsedJqXHR = $.parseJSON(jqXHR.responseText);

		return new ApiResponse(
			parsedJqXHR.status,
			parsedJqXHR.errorCode,
			parsedJqXHR.errorMessage,
			parsedJqXHR.data
		);
	};
}
