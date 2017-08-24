export default function(firstVal, secondVal) { /* eslint func-style: 0 */
	if (Array.isArray(firstVal)) {
		firstVal = firstVal.length;
	}
	if (Array.isArray(secondVal)) {
		secondVal = secondVal.length;
	}
	return firstVal === secondVal;
}