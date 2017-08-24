export default function(oldArray, from, to) { /* eslint func-style: 0 */
	let newArray = [];
	if (oldArray) {
		/* Cover some edge cases */
		if (from === null || from.constructor === Array) {
			from = 0;
		}

		if (to === null || to === 0 || to.constructor === Array) {
			to = oldArray.length - 1;
		}
		else {
			to = oldArray.length >= to + 1 ? to : oldArray.length - 1;
		}

		/* Do the actual split */
		newArray = oldArray.slice(from, to + 1);
	}
	return newArray;
}