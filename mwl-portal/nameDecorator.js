export default function(performerName = '') { /* eslint func-style: 0 */
	var result = {
		firstPart : performerName
	};
	var parts = performerName.split(/(?=[A-Z])/);
	if (parts.length >= 2) {
		let lastPart = '';
		let firstPart = parts[0];
		for (let i = 1; i < parts.length; i++) {
			lastPart += parts[i];
		}
		result = {
			firstPart : firstPart,
			lastPart  : lastPart
		};
	}
	return result;
}