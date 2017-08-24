import Ext from '../../lib/vendor/ExtCore';
import Chaos from '../../lib/chaos/Chaos';

import Overlay from './Overlay';

/**
 *
 * StepOverlay : stepped overlay creator
 *
 */
export default function StepOverlay(el, config) {
	StepOverlay.superclass.constructor.call(this, el, config);
}

Chaos.extend(StepOverlay, Overlay, {

	/** @var {String}             Selector of the video overlay buttons  */
	overlayBtnSel : '.stepOverlayBtn',

	/**
	 * Init
	 *
	 * @param {Element} el      This should be the body tag.
	 * @param {Object} config   Config object of this component
	 */
	init : function(el, config) {
		StepOverlay.superclass.init.call(this, el, config);
	},

	/**
	 * Extend overlaycomponent createPopup function.
	 * @param data
	 */
	createPopup : function(data) {
		StepOverlay.superclass.createPopup.call(this, data);

		this._rightArrowEl.show();
	},

	/**
	 * Handle the 'step' type paging - static paging inside a loaded overlay.
	 *
	 * @param ev
	 * @param target
	 */
	newOverlayButtonsEventHandler : function(ev, target) {
		ev.preventDefault();
		ev.stopPropagation();

		// Store the link element
		var anchor = this._clickedElement = target.tagName.toLowerCase === 'a'
						? target
						: Ext.get(target).findParent('a'),
			href = anchor.getAttribute('href');

		this._postData = anchor.getAttribute(this._postDataSel);

		var direction = href.slice(1),
			stepEls = this._overlayContentElements.item(0).select(this.stepSel),
			activeEl = this._overlayContentElements.item(0).select(this.stepSel + this.stepActiveSel).item(0),
			activeStep = parseInt(activeEl.dom.getAttribute('data-step'), 10),
			lastStep = stepEls.item(stepEls.getCount() - 1).dom.getAttribute('data-step'),
			stepToShow = direction === 'next' ? activeStep + 1 : activeStep - 1,
			stepElToShow = this._overlayContentElements.item(0)
							.select(this.stepSel + '[data-step=' + stepToShow + ']').item(0);

		// Set left-right buttons visibility to the actual step
		if (stepToShow >= lastStep) {
			this._rightArrowEl.hide();
		}
		else {
			this._rightArrowEl.show();
		}

		if (stepToShow <= 1) {
			this._leftArrowEl.hide();
		}
		else {
			this._leftArrowEl.show();
		}
		// Show the step, hide the others
		if (stepElToShow) {
			stepElToShow.radioClass(this.stepActiveCls);
		}
		else {
			/* develblock:start */
			console.warn('Step element cannot be found in the DOM: step ' + stepToShow);
			/* develblock:end */
			return;
		}

		// If we found 'Step X of Y' counter, we update it.
		var stepCountEls = this._overlayContentElements.item(0).select(this.stepCounterSel),
			stepCountActualStepEl = Ext.get(stepCountEls.elements[0]),
			stepCountSumStepsEl = Ext.get(stepCountEls.elements[1]);

		if (stepCountEls) {
			stepCountActualStepEl.update(stepToShow);
			stepCountSumStepsEl.update(lastStep);
		}
	},

	/**
	 * Left key press handler.
	 *
	 * @return void
	 */
	handleLeftKey : function() {
		this._leftArrowEl.triggerClick();
	},

	/**
	 * Right key press handler.
	 *
	 * @return void
	 */
	handleRightKey : function() {
		this._rightArrowEl.triggerClick();
	},

	/**
	 * Bind event listeners
	 */
	bind : function() {
		StepOverlay.superclass.bind.call(this);
	},

	/**
	 * Unbind event listeners
	 */
	unbind : function() {
		StepOverlay.superclass.unbind.call(this);
	}

});