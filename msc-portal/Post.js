import Ext from '../vendor/ExtCore';
import Chaos from './Chaos';
import ChaosObject from './Object';
import Application from './Application';
import CONST from '../constant/Constants';

import Ajax from '../../component/Ajax/Ajax';

export default function ChaosAjaxPost(el, config) {
	ChaosAjaxPost.superclass.constructor.call(this, el, config);
}

Chaos.extend(ChaosAjaxPost, ChaosObject, {
	/**
	 * Init
	 */
	init : function(el, config) {
		ChaosAjaxPost.superclass.init.call(this, Ext.getBody(), {});
	},

	/**
	 * Sends POST request
	 *
	 * @param url
	 * @param data
	 * @param callback
	 * @param callbackScope
	 */
	post : function(url, data, callback, callbackScope) {
		if (typeof url === 'undefined') {
			/* develblock:start */
			console.warn('url must be set');
			/* develblock:end */
			return;
		}
		if (typeof data === 'undefined') {
			var data = {};
		}
		// if data is set, concat URL with queryparams based on it
		if (typeof callback === 'undefined') {
			var callback = Chaos.emptyFn;
		}

		var router = Application.getInstance().getRouter();

		// If the given url is a route handler, we handle it as a route handler
		if (router.routeTable[url]) {
			var requestUrl = router.generateUrl(url, {}, {});
		}
		else {
			var requestUrl = url;
		}

		Ajax.request({
			type    : CONST.TYPE_JSON,
			url     : requestUrl,
			params  : data,
			scope   : callbackScope,
			success : callback,
			method  : CONST.POST
		});
	}

});

/**
 * Shorthand for ajax post functions.
 * @param {String } url URL or Route handler to call
 * @param {Object} data Data Object to POST
 * @param {Function} callback Callback of the ajax request
 * @param {Object} callbackScope Scope of the callback function
 */
Chaos.PostData = function(url, data, callback, callbackScope) {
	// Singleton
	if (!ChaosAjaxPost.instance) {
		ChaosAjaxPost.instance = new ChaosAjaxPost(Ext.getBody(), {});
	}
	ChaosAjaxPost.instance.post(url, data, callback, callbackScope);
};