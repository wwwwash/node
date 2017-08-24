/* eslint-disable complexity */

import Ext from '../../lib/vendor/ExtCore';
import Chaos from '../../lib/chaos/Chaos';
import ChaosObject from '../../lib/chaos/Object';

/**
 * SimpleDisplayElements
 * Quick show hide informations by class names and data attributes
 */
export default function SimpleDisplayElements(el, config) {
	SimpleDisplayElements.superclass.constructor.call(this, el, config);
}

/**
 * Event constants
 * @type {string}
 */
SimpleDisplayElements.ACTION_SHOW_HIDE = 'show-hide-simple-display-element';

Chaos.extend(SimpleDisplayElements, ChaosObject, {

	/** @param {String}         The selector which will trigger the show/hide action */
	triggerSelector : '.showMoreLink',

	/** @param {String}         Data selector for the target content */
	targetDataSelector : 'data-target',

	/** @param {String}         Data selector for the replace text */
	replaceDataSelector : 'data-replace',

	/** @param {String}         Class to add to content when it is shown */
	showClass : 'show',

	/** @param {String}         Show class as a selector */
	showClassSel : '.show',

	/** @param {String}         Data selector for the text container in the link */
	textHolderDataSelector : 'data-text-holder-sel',

	/** @param {String}         Default selector if data-text-holder-sel is not set  */
	textHolderSelector : '.text',

	/** @param {String}         Arrow selector */
	arrowIconSelector : '.icon.linkArrowDown',

	/** @param {String}         Open arrow selector */
	arrowIconActiveClass : 'linkArrowUp',

	/**
	 * Init
	 *
	 * @param {Element} el      This should be the body tag.
	 * @param {Object} config   Config object of this component
	 */
	init : function(el, config) {
		SimpleDisplayElements.superclass.init.call(this, el, config);
	},

	/**
	 * Init
	 *
	 * @param {Object} ev       Event object
	 * @param {Object} target   Event target DOM element
	 */
	onTriggerClick : function(ev, target) {
		ev.preventDefault();

		target = target.className.indexOf(this.triggerSelector) !== -1
					? target
					: Ext.get(target).findParent(this.triggerSelector);

		var clickedEl = Ext.get(target),
			targetId = target.getAttribute(this.targetDataSelector),
			targetEl = Ext.get(targetId),
			textHolderSel = target.getAttribute(this.textHolderDataSelector)
						? target.getAttribute(this.textHolderDataSelector)
						: this.textHolderSelector,
			textHolderEl = clickedEl.select(textHolderSel).item(0),
			textHolder = textHolderEl ? clickedEl.select(textHolderSel).item(0).dom : {},
			currentText = textHolder ? textHolder.innerHTML : false,
			replaceText = target.getAttribute(this.replaceDataSelector),
			arrowEl = clickedEl.select(this.arrowIconSelector)
						? clickedEl.select(this.arrowIconSelector).item(0)
						: false;

		// If the target doesnt exists or clicked el is disabled
		if (!targetEl || clickedEl.hasClass('disabled')) {
			return;
		}

		// Save previous text
		if (currentText) {
			target.setAttribute(this.replaceDataSelector, currentText);
		}

		// Change to new text
		textHolder.innerHTML = replaceText;
		// Show/hide target content based on class
		targetEl.toggleClass(this.showClass);

		//Hide All Protips Inside
		targetEl.jq().protipHideInside();

		// Fire custom event
		Chaos.fireEvent(SimpleDisplayElements.ACTION_SHOW_HIDE, {
			target : targetId,
			show   : targetEl.hasClass(this.showClass)
		});

		// Set arrow
		if (arrowEl) {
			arrowEl.toggleClass(this.arrowIconActiveClass);
		}

		return false;
	},

	reInit : function() {
		this.unbind();
		this.bind();
	},

	/**
	 * Attach events
	 */
	bind : function() {
		Ext.getBody().on('click', this.onTriggerClick, this, {
			scope    : this,
			delegate : this.triggerSelector
		});

		SimpleDisplayElements.superclass.bind.call(this);
	},

	/**
	 * Remove events
	 */
	unbind : function() {
		this.autoUnbind();
	}
});

