/**
 * Cookie Class that helps handling cookies.
 *
 * This version fixes some fairly serious issues:
 * handle cases where cookie names are substrings of other cookies
 *
 * @package Chaos
 * @subpackage core
 * @author kovari.tamas
 *
 */

export default ChaosCookie = {
	/**
	 * Sets a cookie.
	 *
	 * @param {string} name      Name of the cookie
	 * @param {string} value     Value of the cookie
	 * @param {Number} *expires   Number of seconds the cookie will be alive (from the date of creation)
	 * @param {string} *path      Cookie path (@see cookie documentation)
	 * @param {string} *domain    Cookie domain
	 * @param {boolean} *secure   ?
	 *
	 * @return void
	 */
	set : function(name, value, expires, path, domain, secure) {
		// if there's no name, exit
		if (typeof name !== 'string' || name == '') { return }

		// get today's date
		var today = new Date();
		today.setTime(today.getTime());

		if (expires) {
			expires *= 1000;
			var expireDate = new Date(today.getTime() + expires);
		}

		document.cookie = name + '=' + escape(value) +
			(expires ? ';expires=' + expireDate.toGMTString() : '') +
			(path ? ';path=' + path : '') +
			(domain ? ';domain=' + domain : '') +
			(secure ? ';secure' : '');
	},

	/**
	 * Gets the value of a cookie
	 *
	 * @param {string} name    name of the cookie.
	 *
	 * @return string      Value of the cookie.
	 */
	get : function(name) {
		// first we'll split this cookie up into name/value pairs
		// note: document.cookie only returns name=value, not the other components
		var allCookies = document.cookie.split(';');
		var tempCookie = '';
		var cookieName = '';
		var cookieValue = '';
		var cookieFound = false; // set boolean t/f default f

		for (var i = 0; i < allCookies.length; i++)		{
			// now we'll split apart each name=value pair
			tempCookie = allCookies[i].split('=');
			// and trim left/right whitespace while we're at it
			cookieName = tempCookie[0].replace(/^\s+|\s+$/g, '');
			// if the extracted name matches passed name
			if (cookieName == name) {
				cookieFound = true;
				// we need to handle case where cookie has no value but exists (no = sign, that is):
				if (tempCookie.length > 1)				{
					cookieValue = unescape(tempCookie[1].replace(/^\s+|\s+$/g, ''));
				}
				// note that in cases where cookie is initialized but no value, null is returned
				return cookieValue;
				break;
			}
			tempCookie = undefined;
			cookieName = '';
		}
		if (!cookieFound)		{
			return undefined;
		}
	},

	/**
	 * Removes a cookie defined by
	 */
	remove : function(name, path, domain) {
		if (ChaosCookie.get(name)) {
			document.cookie = name + '=' +
				(path ? ';path=' + path : '') +
				(domain ? ';domain=' + domain : '') +
				';expires=Thu, 01-Jan-1970 00:00:01 GMT';
		}
	},

	/**
	 * Tests if cookies are enabled in the current browser
	 */
	isCookieEnabled : function() {
		ChaosCookie.set('test', true);
		// Test if it is successed
		var cookieEnabled = ChaosCookie.get('test') ? true : false;
		ChaosCookie.remove('test');
		return cookieEnabled;
	}
};