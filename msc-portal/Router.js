import Ext from '../vendor/ExtCore';
import Config from './Config';
import ChaosI18n from './I18n';

/**
 * Url router class.
 *
 * @package    Chaos
 * @subpackage Core
 */
export default function ChaosRouter(routeTable, i18n) {
	this.init(routeTable, i18n);
}

Ext.extend(ChaosRouter, Ext.util.Observable, {
	/** @var object   The list of the routeHandlers. */
	routeTable : undefined,

	/** @var ChaosI18n   The instance of the I18n class to retrieve the current language. */
	i18n : undefined,

	/**
	 * Initializes the router object.
	 *
	 * @param object     routeTable   The routes to set.
	 * @param ChaosI18n i18n         [optional]The instance of the ChaosI18n object.
	 *
	 * @return void
	 */
	init : function(routeTable, i18n) {
		this.routeTable = {};

		Ext.apply(this.routeTable, routeTable);

		if (i18n instanceof ChaosI18n) {
			this.i18n = i18n;
		}
	},

	/**
	 * Retrieves an URL based on the given route and parameters.
	 *
	 * @param string  routeHandler   The name of the route.
	 * @param object  routeParams    The parameters for the route.
	 * @param object  queryParams    Parameters to set as the 'query' part of the URL.
	 * @param string  anchor         The hash part of the URL.
	 * @param boolean disableLang
	 *
	 * @return string   The generated url.
	 *
	 * @throws exception   If the given route does not exists.
	 */
	generateUrl : function(routeHandler, routeParams, queryParams, anchor, disableLang) {
		if (typeof this.routeTable[routeHandler] !== 'string') {
			var msg = 'The given route handler does not exists: ' + routeHandler;
			console.error('The given route handler does not exists: ' + routeHandler);
			throw msg;
		}

		var uri = this.routeTable[routeHandler];

		// Removing the method suggestion.
		if (uri.indexOf('[') == 0) {
			uri = uri.substr(uri.indexOf(']') + 1);
		}

		if (Config.get('urlRewriteOff') && routeParams) {
			queryParams = queryParams || {};
			queryParams = Ext.apply({}, queryParams, routeParams);
			routeParams = undefined;
		}

		// Replacing the placeholders.
		if (uri.indexOf('{') !== -1) {
			for (paramName in routeParams) {
				var pattern = new RegExp('\\{' + paramName + ':(?:\\w+|\\*)(?:\\(.+\\))?\\}');
				// TODO: Validate the type of the parameter's value. [Pred]
				uri = uri.replace(pattern, routeParams[paramName]);
			}
		}

		// If any placeholdes left, throw an error.
		if (uri.indexOf('{') != -1) {
			throw 'One or more route parameters are missing.';
		}

		if (typeof queryParams === 'object') {
			var queryString = '',
				value;
			for (var qParam in queryParams) {
				value = queryParams[qParam];
				if (value instanceof Array) {
					for (var i = 0; i < value.length; i++) {
						queryString += encodeURIComponent(qParam) + '[]=' + encodeURIComponent(value[i]) + '&';
					}
				}
				else {
					queryString += encodeURIComponent(qParam) + '=' + encodeURIComponent(value) + '&';
				}
			}

			if (queryString.length > 0) {
				if (uri.indexOf('?') > -1) {
					if (uri.charAt(uri.length - 1) != '?') {
						uri += '&';
					}
					uri += queryString;
				}
				else {
					uri = uri + '?' + queryString;
				}
			}
		}
		/* if data sent by serializeForm function  */
		else if (typeof queryParams === 'string') {
			if (uri.indexOf('?') > -1) {
				if (uri.charAt(uri.length - 1) != '?') {
					uri += '&';
				}
				uri += queryParams;
			}
			else {
				uri = uri + '?' + queryParams;
			}
		}

		if (uri.charAt(uri.length - 1) == '&') {
			uri = uri.substring(0, uri.length - 1);
		}

		// put anchor to the end of the uri
		if (typeof anchor === 'string' && anchor.length > 0) {
			uri = uri + '#' + anchor;
		}

		// add language to the beginning of the url
		if (this.i18n instanceof ChaosI18n && disableLang != true) {
			uri = '/' + this.i18n.getLanguage() + uri;
		}

		return uri;
	}
});
