import moment from 'moment-timezone';

/**
 *  Helps to provide humanly readable datetime range with timezone
 *  TODO: unit test!
 */
export default function(dateFrom, dateTo) { /* eslint func-style: 0 */
	if (!dateFrom || !dateTo) {
		return ' ';
	}

	let dateFromMoment = moment(dateFrom);
	let dateToMoment = moment(dateTo);
	let currentTimeZone = moment.tz.guess();
	let result = dateFromMoment.format('MMMM M, ');

	result += dateFromMoment.format(dateFromMoment.minutes() ? 'h:mma - ' : 'ha - ');
	result += dateToMoment.format(dateToMoment.minutes() ? 'h:mma ' : 'ha ');
	result += moment.tz(dateFromMoment, currentTimeZone).format('z');

	return result;
}
