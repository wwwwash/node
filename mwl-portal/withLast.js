export default function(array, options) {/* eslint func-style: 0 */
	if (array.constructor !== Array || array.length < 1) {
		return '';
	}

	return options.fn(array[array.length - 1]);
}