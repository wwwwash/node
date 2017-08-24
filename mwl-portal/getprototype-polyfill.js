/*eslint-disable */
(function() {
	var nativeGetPrototypeOf = Object.getPrototypeOf;

	Object.getPrototypeOf = function(object) {
		if (object.__proto__) {
			return object.__proto__;
		} else {
			return nativeGetPrototypeOf.call(Object, object);
		}
	};
})();
/*eslint-enable */