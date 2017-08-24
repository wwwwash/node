/**
 * Adds px extension to a number
 *
 * @return string
 */
if (!Number.prototype.px) {
	Number.prototype.px = function () {
		return this + 'px';
	};
}

/**
 * Adds % extension to a number
 *
 * @return string
 */
if (!Number.prototype.percent) {
	Number.prototype.percent = function () {
		return this + '%';
	};
}