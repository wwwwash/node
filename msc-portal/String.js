/**
 * In Array function implementation.
 *
 * @param array
 * @returns {boolean}
 */
if (!String.prototype.inArray) {
	String.prototype.inArray = function(array) {
		return array.indexOf(this.toString()) != -1;
	};
}

/**
 * Uppercase first character
 * @return {String}
 */
if (!String.prototype.ucFirst) {
	String.prototype.ucFirst = function() {
		return this.charAt(0).toUpperCase() + this.slice(1);
	};
}

/**
 * Puts a dot before a string. Can be usable for making selectors out of classes.
 */
if (!String.prototype.dot) {
	String.prototype.dot = function () {
		return '.' + this;
	};
}

/**
 * The nano template engine.
 * Simply replace {var} with {var: value}
 *
 * @see https://github.com/trix/nano
 * @param data Object to apply
 * @returns {string}
 */
if (!String.prototype.tpl) {
	String.prototype.tpl = function (data) {
		return this.replace(/\{([\w\.]*)}/g, function(str, key) {
			var keys = key.split('.'), v = data[keys.shift()];
			for (var i = 0, l = keys.length; i < l; i++) {v = v[keys[i]]}
			return typeof v !== 'undefined' && v !== null ? v : '';
		});
	};
}
