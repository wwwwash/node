import riot from 'riot';
import Ext from '../../../lib/vendor/ExtCore';
import Chaos from '../../../lib/chaos/Chaos';
import Page from '../../../lib/chaos/Page';
import Config from '../../../lib/chaos/Config';

import Form from '../../_Form/Form';
import Overlay from '../../Overlay/Overlay';
import '../../_AjaxContent/AjaxContent';

import './Payout.scss';

export default function PayoutOptionsIndex(el, config) {
	PayoutOptionsIndex.superclass.constructor.call(this, el, config);
}

Chaos.extend(PayoutOptionsIndex, Page, {

	/** @var {String} _payoutMethodButtonClass    A payout gombok classa*/
	_payoutMethodButtonClass   : '.payoutButton',
	/** @var {obj} _overlayContainer               Overlay-t tartalmazo container element */
	_overlayContainer          : 'overlayContainer',
	/** @var {String} _instructionSentClose        A kifizetesi metodus megvaltoztatasat visszaigazolo alert bezaro gomb */
	_instructionSentClose      : 'instructionSentClose',
	/** @var {String} _instructionSentCloseClass   A kifizetesi metodus megvaltoztatasat visszaigazolo alertet eltunteto class */
	_instructionSentCloseClass : 'hide',

	/*Private vars*/

	/** @var {Obj} _payoutMethodButtonEl            A fizetesi mod gomb elemei */
	_payoutMethodButtonEl        : undefined,
	/** @var {Obj} _overlayHandler                  Az overlay objektum peldanya */
	_overlayHandler              : undefined,
	/** @var {Obj} _instructionSentCloseEl          A kifizetesi metodus megvaltoztatasat visszaigazolo alert bezaro gomb elem */
	_instructionSentCloseEl      : undefined,
	/** @var {String} _editableMinimumAmountFormId  Id of the editable minimum amount form */
	_editableMinimumAmountFormId : 'editableMinimumAmountForm',

	/**
	 * Init
	 *
	 * @param {Element} el      This should be the body tag.
	 * @param {Object} config   Config object of this component
	 */
	init : function(el, config) {
		let tabs = Config.get('ajaxContentTabs');
		this.ajaxContentTag = document.querySelector('ajax-content')._tag;

		if (!this.ajaxContentTag && tabs) {
			this.ajaxContentTag = riot.mount('ajax-content', { tabs });
			this.ajaxContentTag = this.ajaxContentTag[0];
		}

		// Az osszes payout method gomb selectora
		this._payoutMethodButtonEl = this.element.select(this._payoutMethodButtonClass);

		//Overlay behuzas
		this._overlayHandler = Config.get('overlayComponent', this._overlayHandler);


		// A kifizetesi metodus megvaltoztatasat visszaigazolo alert bezaro gomb elem */
		this._instructionSentCloseEl = Ext.get(this._instructionSentClose);

		var editableFormEl = Ext.get(this._editableMinimumAmountFormId);
		if (editableFormEl) {
			new Form(editableFormEl, {});
		}

		// Init futtatasa
		PayoutOptionsIndex.superclass.init.call(this, el, config);
	},

	/**
	 * A payout gombokra valo kattintas eseten nyit egy overlay ablakot.
	 * @param ev
	 * @param target
	 */
	onPayoutMethodClick : function(ev, target) {
		ev.preventDefault();
		ev.stopPropagation();

		if (target.className.indexOf('disabled') + 1) {
			return false;
		}

		var url = Ext.get(target).dom.href;
		this._overlayHandler.openOverlay(url, {});
	},

	/**
	 * A kifizetesi metodus megvaltoztatasat visszaigazolo alertet bezaro funkcio
	 * @param ev
	 * @param target
	 */
	onInstructionSentCloseClick : function(ev, target) {
		Ext.get(target).parent().parent().addClass(this._instructionSentCloseClass);
	},

	/**
	 * Returns the Ajax-Content riot tag.
	 */
	getAjaxContentTag : function() {
		return this.ajaxContentTag;
	},

	/**
	 *
	 * @private
	 */
	_onOverlaysClose : function() {
		// Refresh page
		//let tag = this.getAjaxContentTag();
		//tag && tag.refreshPage();
	},

	/**
	 * Esemenykezelok feliratkozasa
	 */
	bind : function() {
		Config.get('overlayComponent').on(Overlay.CLOSE_OVERLAY, this._onOverlaysClose, this);

		//A kifizetesi metodus megvaltoztatasat visszaigazolo alert bezaro gombjahoz tartozo esemeny
		if (this._instructionSentCloseEl) {
			this._instructionSentCloseEl.on('click', this.onInstructionSentCloseClick, this);
		}
		// A payout method gombokhoz tartozo esemeny
		this._payoutMethodButtonEl.on('click', this.onPayoutMethodClick, this);

		PayoutOptionsIndex.superclass.bind.call(this);
	},

	/**
	 * Esemenykezelok torlese
	 */
	unbind : function() {
		Config.get('overlayComponent').un(Overlay.CLOSE_OVERLAY, this._onOverlaysClose, this);

		//A kifizetesi metodus megvaltoztatasat visszaigazolo alert bezaro gombjahoz tartozo esemeny levetele
		if (this._instructionSentCloseEl) {
			this._instructionSentCloseEl.un('click', this.onInstructionSentCloseClick, this);
		}
		// A payout method gombokhoz tartozo esemeny levetele
		this._payoutMethodButtonEl.un('click', this.onPayoutMethodClick, this);

		PayoutOptionsIndex.superclass.unbind.call(this);
	}
});
