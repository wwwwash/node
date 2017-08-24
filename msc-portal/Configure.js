/* develblock:start */
if (!window.consoleGroup && console.groupCollapsed) {
	window.consoleGroup = true;
	console.groupCollapsed('Initialization state');
}
/* develblock:end */

class PublicPath {
	static get Url() {
		if (PublicPath.IsDev && PublicPath.IsDevServer) {
			return 'https://localhost.dhdevel.com:3000/';
		}
		if (PublicPath.IsDev) {
			return `${location.origin.replace('portal', 'static')}/jasmin/cache/`;
		}
		return `//static${Math.floor(Math.random() * 4) + 1}.dditscdn.com/msc/jasmin/cache/`;
	}

	static get IsDev() {
		return !!(location.origin.indexOf('dhdevel.com') + 1);
	}

	static get IsDevServer() {
		return !!module.hot;
	}
}

__webpack_public_path__ = PublicPath.Url;  // eslint-disable-line
