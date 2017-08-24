import Ext from '../vendor/ExtCore';
import Chaos from './Chaos';
import ChaosObject from './Object';
import Application from './Application';
import CONST from '../constant/Constants';

import Ajax from '../../component/Ajax/Ajax';

export default function ChaosAjaxGet(el, config) {
	ChaosAjaxGet.superclass.constructor.call(this, el, config);
}

Ext.extend(ChaosAjaxGet, ChaosObject, {

	/**
	 * Init
	 */
	init : function(el, config) {
		ChaosAjaxGet.superclass.init.call(this, el, config);
	},

	/**
	 *
	 * @param url
	 * @param data
	 * @param callback
	 * @param callbackScope
	 */
	get : function(url, data, callback, callbackScope) {
		if (typeof url === 'undefined') {
			/* develblock:start */
			console.warn('URL must be set');
			/* develblock:end */
			return;
		}
		if (typeof callback === 'undefined') {
			var callback = Chaos.emptyFn;
		}
		if (typeof data === 'undefined' || data == null) {
			var data = {};
		}

		var router = Application.getInstance().getRouter();

		// If the given url is a route handler, we handle it as a route handler
		if (router.routeTable[url]) {
			var requestUrl = router.generateUrl(url, {}, data);
		}
		else {
			var requestUrl = url;
		}

		var tId = Ajax.request({
			type    : CONST.TYPE_JSON,
			url     : requestUrl,
			params  : {},
			scope   : callbackScope,
			success : callback,
			method  : CONST.GET
		});

		return tId;
	}
});

/**
 * Shorthand for ajax get functions.
 *
 * @param {String } url URL or Route handler to call. If URL, do not use data param.
 * @param {Object} data Data Object to GET
 * @param {Function} callback Callback of the ajax request
 * @param {Object} callbackScope Scope of the callback function
 * @returns {String} request identifier
 */
Chaos.GetData = function(url, data, callback, callbackScope) {
	// Singleton
	if (!ChaosAjaxGet.instance) {
		ChaosAjaxGet.instance = new ChaosAjaxGet(Ext.getBody(), {});
	}

	var tId = ChaosAjaxGet.instance.get(url, data, callback, callbackScope);

	return tId;
};