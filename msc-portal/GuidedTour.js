import Ext from '../../lib/vendor/ExtCore';
import Chaos from '../../lib/chaos/Chaos';
import Config from '../../lib/chaos/Config';
import ChaosObject from '../../lib/chaos/Object';
import { Broadcaster } from '../../lib/chaos/Broadcaster';

/**
 * This component is handling the Guided Tour's events , and flow.
 */
export default function GuidedTour(el, config) {
	GuidedTour.superclass.constructor.call(this, el, config);
}

/* CONSTANTS */
/* Step Events - All have to be a Broadcaster event */
GuidedTour.USERMENU_HOVER = 'loggedin-menu-over';
GuidedTour.USERMENU_OUT = 'loggedin-menu-out';

Chaos.extend(GuidedTour, ChaosObject, {

	/** @var {String} Url Hash triggering first login overlay */
	firstLoginOverlayUrlHash       : '#firstStudioLogin',
	/** @var {String} Url Hash triggering first single login overlay */
	firstSingleLoginOverlayUrlHash : '#firstSingleLogin',
	/** @var {String} Url Hash triggering 'single to studio convert' overlay */
	singleToStudioOverlayUrlHash   : '#singleToStudio',
	/** @var {String} Heltip Cmp coming from ModelCenterBasic */
	helptipCmp                     : undefined,
	/** @var {String} Container that contains guided tour tooltips - ID */
	tourContainerId                : 'guidedTourTooltipContainer',
	/** @var {String} Selector of the helptip inside the _tourContainerEl */
	heltipSel                      : '.guide',
	/** @var {String} data-attribute that contains the element id to attach position of the helptip */
	attachToDataAttrib             : 'data-attachto',
	/** @var {String} First Login Overlay Route */
	firstLoginOverlayRoute         : 'Models/FirstLoginOverlay',
	/** @var {String} First Single Login Overlay Route */
	firstSingleLoginOverlayRoute   : 'Dashboard/FirstSingleLoginOverlay',
	/** @var {String} Single to Studio Overlay Route */
	singleToStudioOverlayRoute     : 'Models/FirstSingleLoginOverlay',
	/** @var  {String} first login overlay OK button selector */
	firstLoginOkBtnSel             : '.closeButton',
	/** @var {String} id of the profile selector container */
	selectProfileId                : 'selectProfileMainContainer',
	/** @var {String} id of the logged in button */
	loggedInButtonId               : 'loggedInButton',

	// Object to record step events, and attach methods to them. All event have to be a Broadcaster Event !
	steps : {
		[GuidedTour.USERMENU_HOVER] : 'userMenuTipMoveDown',
		[GuidedTour.USERMENU_OUT]   : 'userMenuTipMoveUp'
	},

	/* PRIVATES */

	/** @var {Object} Global overlay component stored in this variable */
	_overlayComponent  : undefined,
	/** @var {Object} Container that contains guided tour tooltips */
	_tourContainerEl   : undefined,
	/** @var {Object} tip element can be found in the DOM */
	_tourTooltip       : undefined,
	/** @var {Object} first login overlay OK button ext element*/
	_firstLoginOkBtnEl : undefined,


	init : function (el, config) {
		// Storing overlayComponent in a class variable
		this._overlayComponent = Config.get('overlayComponent');
		// Guided Tour Tooltips' container element
		this._tourContainerEl = Ext.get(this.tourContainerId);

		if (!this._tourContainerEl) {
			return;
		}
		// Record the tips can be found in the DOM
		this._tourTooltip = this._tourContainerEl.select(this.heltipSel).item(0);

		// Congrats Overlay: User Log in, Backend throw a URL#hash, Congrats Overlay Opens
		this.handleHashOverlays();

		if (this._tourTooltip) {
			// Get the id of element where we want to position the tip
			var _attachToId = this._tourTooltip.dom.getAttribute(this.attachToDataAttrib);

			if (Ext.fly(_attachToId)) {
				this.helptipCmp
                    .triggerOpen(this._tourTooltip)
                    // Attach heltip position to a given element
                    .attachTo(_attachToId);
			}
		}
		GuidedTour.superclass.init.call(this, el, config);
	},

	/**
	 * Handles the overlay open cases on hash change
	 */
	handleHashOverlays : function() {
		var overlayRoute;

		switch (window.location.hash) {
			case this.firstSingleLoginOverlayUrlHash:
				overlayRoute = this.firstSingleLoginOverlayRoute;
				break;

			case this.singleToStudioOverlayUrlHash:
				overlayRoute = this.singleToStudioOverlayRoute;
				break;
			case this.firstLoginOverlayUrlHash:
				overlayRoute = this.firstLoginOverlayRoute;
				break;
		}

		if (overlayRoute) {
			var url = Chaos.getUrl(overlayRoute, {}, {}, '');
			this._overlayComponent.openOverlay(url);
		}
	},

	/**
	 * step events handler.
	 *
	 * @param options Options coming from the event. (target id, and scope)
	 * @param eventName Name of the event, recorded key in the 'steps' object
	 */
	stepHandler : function (options, eventName) {
		// Ha nem ehhez az elementhez tartozo step van, akkor hagyjuk az esemenyt.
		if (!this._tourTooltip || options.targetId !== this._tourTooltip.dom.getAttribute(this.attachToDataAttrib)) {
			return;
		}

		switch (eventName) {
			case 'userMenuTipMoveDown':
				var selectProfileMainContainerEl = Ext.get(this.selectProfileId);
				this.helptipCmp.attachTo(selectProfileMainContainerEl.parent());
				this.helptipCmp._helptipEl.setTop(55);
				break;
			case 'userMenuTipMoveUp':
				var loggedinBtnEl = Ext.get(this.loggedInButtonId);
				this.helptipCmp.attachTo(loggedinBtnEl);
				break;
		}
	},

	/**
	 * Handling URL Hash change event
	 */
	onHashChange : function () {
		this.handleHashOverlays();
	},

	/**
	 * Cross Browser solution for pointer-events: none (click).
	 *
	 * @param ev
	 */
	pointerEventsNone : function (ev) {
		ev.stopEvent();
	},

	/**
	 * Attaches the events for stephandler.
	 *
	 * @param eventName Name of the event that we'd like to attach
	 * @param eventId The event Id that representates the event in the stepHandler
	 */
	stepHandlerAttacher : function (eventName, eventId) {
		Broadcaster.on(eventName, function (options) {
			this.stepHandler(options, eventId);
		}, this);
	},

	/**
	 * Detaches the events for stephandler.
	 *
	 * @param eventName Name of the event that we'd like to attach
	 * @param eventId The event Id that representates the event in the stepHandler
	 */
	stepHandlerDetacher : function (eventName, eventId) {
		Broadcaster.un(eventName, function (options) {
			this.stepHandler(options, eventId);
		}, this);
	},

	/**
	 * Bind event handlers
	 */
	bind : function () {
		GuidedTour.superclass.bind.call(this);

		// Helptip clickthrough/pointer-events:none IE polyfill
		if (this.helptipCmp._helpTipEl) {
			this.helptipCmp._helptipEl.on('click', this.pointerEventsNone, this);
		}

		// Attach outer step methods to event according to the Step Object ('steps').
		for (let step in this.steps) {
			if (this.steps.hasOwnProperty(step)) {
				var objValue = this.steps[step];

				if (objValue) {
					this.stepHandlerAttacher(step, objValue);
				}
			}
		}

		Ext.fly(window).on('hashchange', this.onHashChange, this);
	},

	/**
	 * Unbind event handlers
	 */
	unbind : function () {
		this.autoUnbind();
	}
});
