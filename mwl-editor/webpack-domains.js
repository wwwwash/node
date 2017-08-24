/*eslint-disable */
const OriginalPath = __webpack_require__.p

Object.defineProperty(__webpack_require__, 'p', {
	get: function(){
		let domains = window.staticConfig.domains;
		return `${domains[Math.floor(Math.random() * domains.length)].replace('\\','')}${OriginalPath}`;
	}
});
/*eslint-enable */