import moment from 'moment';

/**
 *  NOTE: the backend helper uses PHP date format
 *  We need to keep the same API.
 *  To keep it simple for now we support only the needed formats
 *
 *  TODO: unit test!
 */
export default function(date, format) { /* eslint func-style: 0 */
	if (!date) {
		return ' ';
	}
	var supportedFormat = [
		'h:i'
	];

	var phpToJSDateFormats = {
		'h:i' : 'HH:mm'
	};

	if (supportedFormat.indexOf(format) < 0) {
		return date;
	}

	return moment(date).format(phpToJSDateFormats[format]);
}
