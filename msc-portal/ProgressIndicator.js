import Ext from '../../lib/vendor/ExtCore';
import Chaos from '../../lib/chaos/Chaos';
import ChaosObject from '../../lib/chaos/Object';
import { Broadcaster } from '../../lib/chaos/Broadcaster';

/**
 * ProgressIndicatorComponentComponent handler class.
 *
 * Adds to the DOM and handles local progress indicators
 *
 * @package    common
 * @subpackage ProgressIndicatorComponent
 */


export default function ProgressIndicator(el, config) {
	ProgressIndicator.superclass.constructor.call(this, el, config);
}

ProgressIndicator.GLOBALEVENT_ADD_LOCAL_INDICATOR = 'add-indicator';
ProgressIndicator.GLOBALEVENT_REMOVE_LOCAL_INDICATOR = 'remove-indicator';

/* */
ProgressIndicator.instances = {};

/**
 * Constructing class
 * Local Progress indicator component
 */
Ext.extend(ProgressIndicator, ChaosObject, {
    /* Komponens neve */
	name                        : 'progressindicator',
	/* */
	showCls                     : 'show',
	/* */
	fadeTime                    : 0.3,
	/* */
	_indicator                  : undefined,
	/* */
	_templateString             : undefined,
	/* */
	_template                   : undefined,
	/* */
	_progressIndicatorBlock     : undefined,
	/* */
	_progressIndicatorClassName : 'progressIndicator local',


	/**
	 * Constructor
	 * @param   {Ext.Element} el
     * @param   {Object} config
	 *
	 * @return  void
	 */
	init : function(el, config) {
		var template = Ext.get('ajaxIndicatorContainer').clone().dom;
		template.removeAttribute('id');
		template.classList.add('local');
		this._templateString = Ext.get(template).html(true);

		//Register unique global events
		Chaos.addEvents(
			ProgressIndicator.GLOBALEVENT_ADD_LOCAL_INDICATOR,
			ProgressIndicator.GLOBALEVENT_REMOVE_LOCAL_INDICATOR
		);
		//Global events
		Broadcaster.on(ProgressIndicator.GLOBALEVENT_ADD_LOCAL_INDICATOR,
			this.addLocalIndicatorEventHandler, this
		);

		//Chaos.fireEvent(ProgressIndicator.GLOBALEVENT_HIDE_INDICATOR); -el kell majd dobni
		Broadcaster.on(ProgressIndicator.GLOBALEVENT_REMOVE_LOCAL_INDICATOR,
			this.removeLocalIndicatorEventHandler, this
		);

		//Creating template
		this._template = new Ext.Template(
			this._templateString,
			{
				compiled : false
			}
		);

		// call parent's init
		ProgressIndicator.superclass.init.call(this, el, config);
	},

	/**
	 * Event handler, which triggered by the GLOBALEVENT_ADD_LOCAL_INDICATOR custom event
	 * @param ev
	 */
	addLocalIndicatorEventHandler : function(options) {
		if (options && options.element) {
			this.addIndicator(options.element);
		}
	},

	/**
	 * Event handler, which triggered by the GLOBALEVENT_REMOVE_LOCAL_INDICATOR custom event
	 * @param ev
	 */
	removeLocalIndicatorEventHandler : function(options) {
		var noAnim = typeof options.noAnim !== 'undefined' ? options.noAnim : false;

		if (options && options.element) {
			this.removeIndicator(options.element, noAnim);
		}
	},

	/**
	 * Adds local progress indicator before the element node
	 *
	 * @param {Ext.Element} element
	 */
	addIndicator : function(element) {
		var id = element.dom.id,
			indicator = ProgressIndicator.instances[id];

		// Ha mar van indicator akkor ne rakja be megint
		if (indicator) {
			return;
		}

		//Hozzaadjuk a DOM-hoz a template kodot kiegeszitve a parameterek ertekeivel
		ProgressIndicator.instances[id] = this._template.insertFirst(
			element,
			{
				className : this._progressIndicatorClassName
			},
			true
		);

		ProgressIndicator.instances[id].addClass('show');
	},

	/**
	 * Removes local progress indicator from the dom
	 *
	 * @param {Ext.Element} element
	 */
	removeIndicator : function(element, noAnim) {
		//Tooltip eltuntetes animacio
		var id = element.dom.id,
			indicator = ProgressIndicator.instances[id];
		//Ha nem letezik az indikator akkor nem futunk le
		if (!indicator) {
			return;
		}

		if (noAnim) {
			ProgressIndicator.instances[id].setDisplayed(false);
			ProgressIndicator.instances[id].dom.style.transform = 'none';
			ProgressIndicator.instances[id].removeClass(this.showCls);
			ProgressIndicator.instances[id].remove();
			delete ProgressIndicator.instances[id];
		}
		else {
			var transitionCallback = function() {
				if (typeof ProgressIndicator.instances[id] !== 'undefined') {
					ProgressIndicator.instances[id].removeClass(this.showCls);
					ProgressIndicator.instances[id].remove();
					delete ProgressIndicator.instances[id];
				}
			};
			ProgressIndicator.instances[id].removeClass(this.showCls);
			ProgressIndicator.instances[id].on({
				webkitTransitionEnd : transitionCallback,
				transitionend       : transitionCallback,
				msTransitionEnd     : transitionCallback,
				oTransitionEnd      : transitionCallback,
				scope               : this,
				single              : true
			});
		}
	},

	/**
	 * Binds all basic event listeners.
	 *
	 * @return void
	 */
	bind : function() {
		ProgressIndicator.superclass.bind.call(this);
	},

	/**
	 * Unbinds all basic event listeners.
	 *
	 * @return void
	 */
	unbind : function() {
		ProgressIndicator.superclass.unbind.call(this);
	}
});
