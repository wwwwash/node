import Ext from '../../../lib/vendor/ExtCore';
import Chaos from '../../../lib/chaos/Chaos';
import ChaosObject from '../../../lib/chaos/Object';
import Form from '../../_Form/Form';

import AdvancedTextarea from '../../_Form/AdvancedTextarea';
import ShowMore from '../../ShowMore/ShowMore';

/**
 * Parent Controller for the member notes overlay
 */
export default function MemberNotes(el, config) {
	MemberNotes.superclass.constructor.call(this, el, config);
}

Chaos.extend(MemberNotes, ChaosObject, {

	/** @var {Object} overlayCmp                Overlay component instance coming from init config */
	overlayCmp     : undefined,
	/** @var {String} noteSel                   Selector of the note elements */
	noteSel        : '.note',
	/** @var {String} showMoreBtnCls            Class of show more buttons */
	showMoreBtnCls : '.showMoreButton',
	/** @var {String} formId                    Id of memberNotes form */
	formId         : 'memberNotes',

	// PRIVATES

	/** @var {Elementj} _showMoreButtonEl       Show more button element */
	_showMoreButtonEl : undefined,
	/** @var {String} formId                    Id of memberNotes form */
	_showMoreBlock    : undefined,

	/**
	 * Init
	 *
	 * @param {Element} el      This should be the body tag.
	 * @param {Object} config   Config object of this controller
	 */
	init : function(el, config) {
		// Getting the form
		var _formEl = Ext.get(this.formId);
		if (_formEl) {
			this._form = new Form(_formEl, {
				setDelay : 2000 // We set delay for synchronise data with server after first request. Can be deleted when backend solved the problem.
			});
		}
		// Advanced Textarea
		new AdvancedTextarea('newNote', {});

		// Overlay content element
		this.overlayEl = this.overlayCmp.getOverlayContentElement();

		// Getting the show more button
		this._showMoreButtonEl = this.getShowmoreButton();

		this._wallMessageTxtEl = Ext.get(this.wallMessageTxtId);

		// Show more Component
		if (this._showMoreButtonEl) {
			this._showMoreCmp = new ShowMore(
				Ext.get('memberNotesWrapper'),
				{
					listBlockSel    : '.noteList',
					successCallback : this.ajaxShowMoreSuccessHandler,
					callbackScope   : this
				});
		}

		MemberNotes.superclass.init.call(this, el, config);
	},

	/**
	 * Gets the actual show more button
	 *
	 * @return Ext.element
	 */
	getShowmoreButton : function() {
		return this.overlayEl.select(this.showMoreBtnCls).item(0);
	},

	/**
	 * Ajax success handler
	 *
	 * @param {Object} response Az ajax valaszobjektum
	 *
	 * @return void
	 */
	ajaxShowMoreSuccessHandler : function() {
		this.unbind();
		this.bind();
	},

	/**
	 * Binds events
	 */
	bind : function() {
		MemberNotes.superclass.bind.call(this);
	},

	/**
	 * Unbind events
	 */
	unbind : function() {
		MemberNotes.superclass.unbind.call(this);
	}
});
