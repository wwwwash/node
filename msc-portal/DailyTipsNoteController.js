import Chaos from '../../lib/chaos/Chaos';
import Controller from '../../lib/chaos/Controller';
import Connection from '../../lib/chaos/Connection';
import Util from '../../lib/chaos/Util';

import DailyTipsWidgetController from './DailyTipsWidgetController';

/**
 * Dashboard Daily Tips Note Controller.
 * Handles the JS business logic for every 'Note' type Daily Tip
 */

export default function DailyTipsNoteController(el, config) {
	DailyTipsNoteController.superclass.constructor.call(this, el, config);
}

Chaos.extend(DailyTipsNoteController, Controller, {

	/** @var {Boolean} _isSent         Tip is sent or not */
	_isSent         : false,
	/** @var {Boolean} _ajaxInProgress Ajax data sending is in progress or not */
	_ajaxInProgress : false,

	/**
	 * Initializer
	 *
	 * @param {Object} el  Widget Ext Element
	 * @param {Object} tip Tip Ext Element
	 *
	 * @return void
	 */
	init : function(el, tip) {
		this._tipEl = tip;
		this._tipId = tip.data(DailyTipsWidgetController.CONST.TIP_ID_ATTR);
		this._inputEl = tip.select('input').item(0);
		this._csrfEl = tip.select('input[name="csrfToken"]').item(0);
		this._btnEl = tip.select('.actionBtn').item(0);
		this._defaultStateEl = tip.child('.tip-note-state--default');
		this._successStateEl = tip.child('.tip-note-state--success');
		this._answerEl = this._successStateEl.child('.successFirstLine');
		this._answerTpl = this._answerEl.dom.innerHTML;

		Util.characterCounter(this._inputEl);

		this.bind();
	},

	/**
	 * Is Note Sent or Not
	 * @return {Boolean} Tip is is sent status or not
	 */
	isSent : function() {
		return this._isSent;
	},

	/**
	 * On Create button click
	 * @param {Object} ev     Event Object
	 * @private
	 * @return void
	 */
	_onBtnClick : function(ev) {
		ev.preventDefault();

		if (!this._ajaxInProgress) {
			this.sendNote();
		}
	},

	/**
	 * Returns with the full tip text. Answer template + input value
	 */
	getFullAnswerText : function() {
		return this._answerTpl.replace('{input}', this._inputEl.dom.value.trim());
	},

	/**
	 * Shows the success state of the tip, with the full answer.
	 * @return void
	 */
	showSuccessState : function() {
		this._answerEl.dom.innerHTML = this.getFullAnswerText();

		this._defaultStateEl.addClass('hide');
		this._successStateEl.removeClass('hide');
	},

	/**
	 * Send the note via ajax
	 * @return void
	 */
	sendNote : function() {
		// Simple empty validation
		if (this._inputEl.dom.value.trim() === '') {
			return;
		}

		var answerText = this.getFullAnswerText(),
			csrfToken = this._csrfEl.dom.value.trim();
		this._ajaxInProgress = true;

		// Show loader in button
		this._btnEl.child('i').removeClass('hide');

		this._btnEl.jq().protipHide();

		Connection.Ajax.request({
			url    : this._btnEl.dom.href,
			method : 'POST',
			params : {
				csrfToken : csrfToken,
				content   : answerText || '',
				tipId     : this._tipId
			},
			type    : Connection.TYPE_JSON,
			success : this.onSendSuccess,
			error   : this.onSendError,
			failure : this.onSendError,
			scope   : this
		});
	},

	/**
	 * Success case of sending a note
	 */
	onSendSuccess : function() {
		this._ajaxInProgress = false;
		this._isSent = true;

		this.showSuccessState();
	},

	/**
	 * Error case of sending a note
	 */
	onSendError : function() {
		this._ajaxInProgress = false;
		this._btnEl.child('i').addClass('hide');
		this._btnEl.jq().protipShow({
			title : Chaos.translate('An error occured. Please try again!')
		});
	},

	/**
	 * Controller destroy
	 * @return void
	 */
	destroy : function() {
		this.unbind();
		this._tipEl.prev('input').remove();
		this._tipEl.remove();
	},

	/**
	 * Binding event handlers
	 */
	bind : function() {
		this._btnEl.on('click', this._onBtnClick, this);
	},

	/**
	 * Unbinding event handlers
	 */
	unbind : function() {
		this._btnEl.un('click', this._onBtnClick, this);
	}
});