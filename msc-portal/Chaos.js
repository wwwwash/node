import Ext from '../vendor/ExtCore';
import { Broadcaster } from './Broadcaster';
import Application from './Application';
import I18n from './I18n';
import Validator from './Validator';
import './String';
import './Element';
import './Number';

/**
 * Core Chaos class which contains basic methods and shorthands for commonly used functions.
 *
 * @package    Chaos
 * @subpackage Core
 *
 * @requires jQuery
 */
export default Chaos = {
	/** @const The prefix used for HTML id-s. */
	ID_PREFIX      : 'chaos-',
	/** @const string used in comparisons */
	TYPE_UNDEFINED : 'undefined',
	/** @const string used in comparisons */
	TYPE_FUNCTION  : 'function',
	/** @const string used in comparisons */
	TYPE_OBJECT    : 'object',
	/** @const object used in comparisons */
	TYPE_NULL      : null,
	/** @const name of the plugins registry entry */
	REG_PLUGINS    : 'plugins',

	/**
	 * An empty function to register as requried callbacks if no action is required.
	 */
	emptyFn : function() {},

	/**
	 * Check if the given parameter is an array or not.
	 *
	 * @param mixed variable   The variable to check.
	 *
	 * @return bool   TRUE, if the given parameter is an array.
	 */
	isArray : function(variable) {
		return variable instanceof Array;
	},

	/**
	 * Checks whether the variable is defined or not.
	 *
	 * @param mixed   variable   Variable to check
	 *
	 * @return true if the variable is defined, false otherwise.
	 */
	isDefined : function(variable) {
		return typeof variable !== Chaos.TYPE_UNDEFINED;
	},

	/**
	 * Checks whether the variable is a function or not.
	 *
	 * @param mixed   variable   Variable to check
	 *
	 * @return true if the variable is a function, false otherwise.
	 */
	isFunction : function(variable) {
		return typeof variable === Chaos.TYPE_FUNCTION;
	},

	/**
	 * Checks whether the variable is an object or not.
	 *
	 * @param mixed   variable   Variable to check
	 *
	 * @return true if the variable is an object, false otherwise.
	 */
	isObject : function(variable) {
		return typeof variable === Chaos.TYPE_OBJECT;
	},

	/**
	 * Shortand for Chaos.Application.generateUrl method.
	 *
	 * @param string routeHandler   The name of the route.
	 * @param object routeParams    The parameters for the route.
	 * @param object queryParams    Parameters to set as the 'query' part of the URL.
	 * @param string anchor         The hash part of the URL.
	 * @param boolean disableLang   Deletes the language from the URL.
	 *
	 * @return string   The generated url.
	 *
	 * @throws exception   If the given route does not exists.
	 */
	getUrl : function(routeHandler, routeParams, queryParams, anchor, disableLang) {
		return Application.getInstance().getRouter().generateUrl(routeHandler, routeParams, queryParams, anchor, disableLang);
	},

	/**
	 * Shortand for I18n.getTranslation method.
	 *
	 * @param string key        The translation key.
	 * @param object params     The values for the placeholders.
	 * @param string language   [optional] The language key to force a specific language.
	 *
	 * @return string   The translated text if exists, or the original string if no translation found.
	 */
	translate : function(text, params, language) {
		return I18n.getInstance().getTranslation(text, params, language);
	},

	/**
	 * Fires one or more callbacks.
	 *
	 * @param mixed  callback   The callback function(s).
	 *                          function: just one function to use.
	 *                          object:   a function with a specified scope. (Two properties required:
	 *                                     * fn:    the function itself
	 *                                     * scope: the scope of the function
	 *                          array:    a list of callback functions (an array filled with the above options)
	 * @param object args       The arguments to pass to the callback.
	 * @param object scope      The scope for the callback.
	 *
	 * @return void
	 */
	fireCallback : function(callback, args, scope) {
		if (typeof args === 'object' && !Chaos.isArray(args)) {
			args = Array.prototype.slice.call(args);
		}

		switch (typeof callback) {
			case 'function':
				scope = scope || document || window;
				callback.apply(scope, args);
				break;
			case 'object':
				if (typeof callback.fn === 'function') {
					var fnScope = callback.scope | scope;

					Chaos.fireCallback(
						callback.fn,
						args,
						fnScope
					);
				}
				else if (Chaos.isArray(callback)) {
					for (var i = 0; i < callback.length; i++) {
						Chaos.fireCallback(callback[i], args, scope);
					}
				}
				break;
			default:
		}
	},

	/**
	 * Generates a time based random id.
	 *
	 * @return string   The random id.
	 */
	generateId : function(prefix) {
		var time = new Date();
		var id = false;
		prefix = prefix ? prefix + '-' : '';

		time = new Date();
		id = prefix + time.valueOf() + '-' + Math.floor(Math.random() * 1000);

		return id;
	},

	/**
	 * Registers a new validator.
	 *
	 * @param string   name   The name of the validator.
	 * @param function fn     The function to use.
	 *
	 * @return void
	 */
	registerValidator : function(name, fn) {
		if (typeof fn === 'function') {
			Validator[name] = fn;
		}
	},

	/**
	 * Returns the value of a meta tag defined by name parameter
	 *
	 * @param string name     Name of the meta tag
	 *
	 * @return string         value of the selected meta tag.
	 */
	getMeta : function(name) {
		var metas = document.getElementsByTagName('meta');

		for (var j = 0; j < metas.length; j++) {
			if (metas[j].getAttribute('name') == name) {
				return metas[j].getAttribute('content');
			}
		}
	},

	/**
	 * Returns with an embedded flash object depending from the current browser
	 *
	 * @param string movieName   Name parameter of embedded movie.
	 *
	 * @return dom element
	 */
	getFlashMovieObject : function(movieName, returnDom) {
		var el;

		if (!Ext.isIE && !Ext.isIE11) {
			if (document.embeds && document.embeds[movieName]) {
				el = document.embeds[movieName];
			}
			else if (document.getElementById(movieName) &&
				document.getElementById(movieName).getElementsByTagName('embed')[0]) {
				el = document.getElementById(movieName).getElementsByTagName('embed')[0];
			}
			else {
				el = document.getElementById(movieName);
			}
		}
		else if (document.getElementById(movieName)) {
			el = document.getElementById(movieName);
		}
		return returnDom === true ? Ext.get(el) : el;
	},

	/**
	 * Chaos.extend only allows 3-arguments of Ext.extend because of simplicity and the compressor
	 *
	 */
	extend : function(subclass, superclass, overrides) {
		/* develblock:start */
		if (!(superclass instanceof Function)) {
			throw new Error('Error extending ' + overrides.name + ': parent not found. Check Chaos.extend arguments!');
		}

		if (typeof overrides !== 'object') {
			throw new Error('Error extending a class: overrides is not an object.');
		}
		/* develblock:end */

		Ext.extend(subclass, superclass, overrides);
	},

	/**
	 * Adds a global event to the global event handler
	 */
	addEvents : function(eventName) {
		Broadcaster.addEvents([eventName]);
	},

	/**
	 * Fires a global event from global event handler
	 */
	fireEvent : function(eventName, args) {
		Broadcaster.fireEvent(eventName, args);
	}
};

// Registering shortands.
Chaos.ns = Ext.namespace;
Chaos.tr = Chaos.translate;
Chaos.url = Chaos.getUrl;

