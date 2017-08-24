import Ext from '../vendor/ExtCore';
import Connection from './Connection';
import Layout from './Layout';
import { Broadcaster } from './Broadcaster';
import Router from './Router';

/**
 * Application class to manage the changes on the site and contains the site related instance of Chaos.Router class.
 * This class initializes the entrie page handler system.
 *
 * @package    Chaos
 * @subpackage Core
 */
export default function Application() {
	this.init();
}

/**
 * Retrieves the instance of the Application class.
 *
 * @return Application   The instance of the application class.
 */
Application.getInstance = function() {
	if (window.console === undefined) {
		window.console = {
			log   : function(msg) { },
			info  : function(msg) { },
			warn  : function(msg) { },
			error : function(msg) { }
		};
	}
	if (!(Application.prototype.instance instanceof Application)) {
		Application.prototype.instance = new Application();
	}

	return Application.prototype.instance;
};

/** CONSTANTS */
/** @const {String} DEFAULT_PAGE_ID default page id if not set */
Application.DEFAULT_PAGE_ID = 'index';
/** @const {String} EVENT_LAYOUTCHANGE layoutchange event constant */
Application.EVENT_LAYOUTCHANGE = 'layoutChange';
/** @const {String} LAYOUT_PREFIX    prefix of the css classname that contains layout name */
Application.LAYOUT_PREFIX = 'layout-';

/** CLASS EXTENSION */
Ext.extend(Application, Ext.util.Observable, {
	/** @var Chaos.Router   Stores the instance of the router class. */
	router : null,
	/** @var Chaos.Layout   Layout of the current page. */
	layout : null,
	/**
	 * Initializes the page handling system.
	 *
	 * @return void
	 */
	init   : function() {
		// If the AJAX class is present initialize it.
		if (Connection.Ajax) {
			Connection.Ajax.init();
		}

		// Global event handler
		this.broadcaster = Broadcaster;

		// adding custom events for layout change
		var obj = {};
		obj[Application.EVENT_LAYOUTCHANGE] = true;

		this.addEvents(obj);

		window.onerror = this.handleError;

		/* develblock:start */
		console.info('INIT: Application');
		/* develblock:end */
	},

	/**
	 * Runs the environment right after initialization.
	 * Tasks are:
	 *  - get page id, and instantiate the corresponding page cclass
	 *  - create and init layout
	 *  - tie layout and page together
	 */
	run : function(config) {
		this.config = config;
		// get id
		this.pageId = document.body.id;

		/* develblock:start */
		if (window.console.groupCollapsed && window.consoleGroup) {
			setTimeout(function() {
				console.groupEnd();
			}, 500);
		}
		/* develblock:end */

		// init layouts
		return this._initLayout();
	},

	/**
	 * Results the name of the layout should be used for the current page.
	 *
	 * @return {String|undefined} Name of the layout acquired from document.body class
	 */
	_getLayoutName : function() {
		// get body
		var body = Ext.get(document.body);

		// get classes from body className (separated by one or more spaces)
		var classNames = body.dom.className.split(/\s+/);

		// loop through classes, if one match, it breaks the loop and
		for (var idx in classNames) {
			var name = classNames[idx];

			if (typeof name === 'string') {
				// if one match, return it
				var prefixIndex = name.indexOf(Application.LAYOUT_PREFIX);
				if (prefixIndex == 0) {
					var prefixLength = Application.LAYOUT_PREFIX.length;
					// convert layout name to Capitalized classname
					return name.substr(prefixLength, 1).toUpperCase() + name.substr(prefixLength + 1, name.length - prefixLength);
				}
			}
		}
		// if no match, return undefined
		return undefined;
	},

	_initLayout : async function() {
		// get layout name
		let layoutId = this._getLayoutName();
		let controller = await this.config.layoutLoader(layoutId);

		this.setLayout(new controller(document.body, {}));

		return await this._initPage();
	},

	/**
	 * Initializes
	 *
	 *
	 */
	_initPage : async function() {
		var pageId = document.body.id || Application.DEFAULT_PAGE_ID;
		var pageClass = pageId.split('_');
		pageClass = pageClass.map(v => v.charAt(0).toUpperCase() + v.slice(1));
		pageClass = pageClass.join('');

		let controller = await this.config.pageLoader(pageClass);

		if (controller) {
			this.getLayout().setPage(new controller(document.body, {}));
		}
		/* develblock:start */
		else {
			console.warn(pageClass + ' Controller does not exists!');
		}
		/* develblock:end */
	},

	/**
	 * Common error handler.
	 *
	 * @param string errorMsg     The error message.
	 * @param string url          The URL where the error occured.
	 * @param number lineNumber   The line where the error occured.
	 *
	 * @return undefined
	 */
	handleError : function(errorMsg, url, lineNumber) {
		// TODO: Implement a common error handler method. [Pred]
		// TODO: It is an options to send an AJAX request to the server to log the JS errors.
		/* develblock:start */
		console.error('>>>>>> ' + errorMsg + ' -- ' + url + ' @ ' + lineNumber);
		/* develblock:end */
		// return false;
	},

	/**
	 * Retrieves the router instance.
	 *
	 * @return Chaos.Router   The router's instance.
	 */
	getRouter : function() {
		return this.router;
	},

	/**
	 * Sets the router's instance.
	 *
	 * @param Router router   The instance of the router.
	 *
	 * @return void
	 */
	setRouter : function(router) {
		if (router instanceof Router) {
			this.router = router;
		}
		else {
			throw 'Invalid router object provided.';
		}
	},

	/**
	 * Sets the layout object. Destroys previous one.
	 *
	 * @param {Chaos.Layout} layout      The new layout object.
	 *
	 * @return undefined
	 */
	setLayout : function(layout) {
		if (layout instanceof Layout && layout !== this.layout) {
			if (this.layout instanceof Layout) {
				this.layout.destroy();
			}

			this.fireEvent(Application.EVENT_LAYOUTCHANGE, { oldLayout : this.layout, newLayout : layout });

			this.layout = layout;
		}
		window.layout = layout;
	},

	/**
	 * Returns the currently set layout object
	 *
	 * @return {Chaos.Layout}
	 */
	getLayout : function() {
		return this.layout;
	}
});
