import Ext from '../../lib/vendor/ExtCore';
import Chaos from '../../lib/chaos/Chaos';
import ChaosController from '../../lib/chaos/Controller';

import DailyTipsPhotoController from './DailyTipsPhotoController';
import DailyTipsVideoController from './DailyTipsVideoController';
import DailyTipsNoteController from './DailyTipsNoteController';

/**
 * Dashboard Daily Tips Widget Controller.
 * Handles the JS business logic for the Daily Tips Widget
 */


export default function DailyTipsWidgetController(el, config) {
	if (!el) {
		return;
	}
	DailyTipsWidgetController.superclass.constructor.call(this, el, config);
}

DailyTipsWidgetController.CONST = {
	TIP_ID_ATTR   : 'tipId',
	TIP_TYPE_ATTR : 'tipType'
};

Chaos.extend(DailyTipsWidgetController, ChaosController, {

	/** @var {String} name          Name of the Controller */
	name          : 'DailyTipsWidgetController',
	/** @var {String} tipSel        Selector of the tip elements */
	tipSel        : '.tip',
	/** @var {String} tipControlSel Selector of the next links */
	tipControlSel : '.tip-control',
	/** @var {String} counterNumSel Selector of the counter elements' number wrapper (wrap of digits) */
	counterNumSel : '.counter em',
	/** @var {Object} _tipInstances Object of tip controller instances (dailytip note,photo,video controllers) */
	_tipInstances : {},

	/**
	 * Initializer
	 * @param {Object} el Widget Ext Element
	 * @return void
	 */
	init : function(el) {
		this._widgetEl = Ext.get(el);
		this._tipControlEls = this._widgetEl.select(this.tipControlSel);

		var tipEls = this._widgetEl.select(this.tipSel);

		tipEls.each(this._tipInitializerHandler.bind(this));

		this.bind();
	},

	/**
	 * Handles initializer methods for every single tip element
	 * @param {Object} tip Tip ext element
	 * @private
	 * @return void
	 */
	_tipInitializerHandler : function(tip) {
		tip = Ext.get(tip.dom);

		var	id = tip.data(DailyTipsWidgetController.CONST.TIP_ID_ATTR),
			type = tip.data(DailyTipsWidgetController.CONST.TIP_TYPE_ATTR);

		switch (type) {
			case 'photo':
				this._tipInstances[id] = new DailyTipsPhotoController(tip);
				break;
			case 'video':
				this._tipInstances[id] = new DailyTipsVideoController(tip);
				break;
			case 'note':
				this._tipInstances[id] = new DailyTipsNoteController(tip);
				break;
		}
	},

	/**
	 * Tip 'Next' link click event handler
	 * @param {Object} ev Event Object
	 * @param {Object} target Target Dom Element
	 * @private
	 * @return void
	 */
	_onNextClick : function(ev, target) {
		var targetEl = Ext.get(target),
			tipEl = targetEl.next(this.tipSel),
			tipId = tipEl.data(DailyTipsWidgetController.CONST.TIP_ID_ATTR);

		this._destroyTipInstance(tipId);
	},

	/**
	 * Destroys a given tips' instance if its available & sent
	 * @param {String} tipId Tip ID
	 * @private
	 * @return void
	 */
	_destroyTipInstance : function(tipId) {
		// Destroy Note/Photo/Video tip controller instance, if it is in sent status
		if (this._tipInstances[tipId] && this._tipInstances[tipId].isSent()) {
			if (this._tipInstances[tipId].destroy) {
				this._tipInstances[tipId].destroy();
			}
			delete this._tipInstances[tipId];
			this._recalculateCounters();
		}
	},

	/**
	 * Recalculates the sum and index number in the counter
	 * @private
	 */
	_recalculateCounters : function() {
		var counterNumEls = this._widgetEl.select(this.counterNumSel),
			sum = counterNumEls.getCount();

		counterNumEls.each(function(el, els, index) {
			el.html(sum - index + ' / ' + sum);
		});
	},

	/**
	 * Bind listeners
	 */
	bind : function() {
		this._tipControlEls.on('click', this._onNextClick, this);
	},

	/**
	 * Unbind listeners
	 */
	unbind : function() {
		this._tipControlEls.un('click', this._onNextClick, this);
	}
});