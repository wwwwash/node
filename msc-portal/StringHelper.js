function StringHelper() {
	console.log('StringHelper initialized.');

	/**
	 * Capitalizes the first letter of the given string.
	 *
	 * @param {string} string
	 */
	StringHelper.capitalizeFirstLetter = function (string) {
		return string[0].toUpperCase() + string.slice(1);
	};
}
