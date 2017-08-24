/* Follow a similar implementation and unit tests
   of the PHP counterpart TruncateTextHelper.
 */

export default function(string, maxLength) {
	var _ellipsis = '...',
		_string = string,
		_maxLength = Math.max(maxLength, 0);

	if (_string.length <= _maxLength) {
		return _string;
	}

	_maxLength -= _ellipsis.length;
	_maxLength = Math.max(_maxLength, 0);

	// Find the longest text possible before a word boundary.
	_string = _string.substr(0, _maxLength);
	var pos = _string.lastIndexOf(' ');

	if (pos >= 0) {
		_string = _string.substring(0, pos);
		_string += ' ' + _ellipsis;
	}
	else {
		_string = _ellipsis;
	}

	return _string;
}