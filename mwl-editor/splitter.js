export default function(oldArray, from, to) { /* eslint func-style: 0 */
	let newArray = [];
	if (oldArray) {
		for (let i = from; i <= to; i++) {
			newArray.push(oldArray[i]);
		}
	}
	return newArray;
}