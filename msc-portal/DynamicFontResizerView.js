import Ext from '../../lib/vendor/ExtCore';
import Chaos from '../../lib/chaos/Chaos';
import ChaosObject from '../../lib/chaos/Object';

/**
 * DynamicFontResizerView
 *
 * Service for ContentViewerController
 *
 * Gives back the details of the new block
 * to the overlay
 *
 */

export default function DynamicFontResizerView(el, config) {
	DynamicFontResizerView.superclass.constructor.call(this, el, config);
}

Ext.apply(DynamicFontResizerView, {
	EVENT_INPUT_KEYDOWN : 'input-keydown'
}, {});

Chaos.extend(DynamicFontResizerView, ChaosObject, {

	/** @var {String}    Add note editor box selector*/
	noteEditorBoxSelector : '.note.editor',
	/** @var {String}    Data font size attribute */
	dataFontSizeAttr      : 'data-font-size',

	_wasEmpty : true,

	/**
	 * Standard init function
	 *
	 * @param {Object} el
	 * @param {Object} config
	 *
	 * @return void
	 */
	init : function(el, config) {
		this._addNoteBoxEl = this.element.select(this.noteEditorBoxSelector).item(0);
		this._addNoteBoxTextareaEl = this._addNoteBoxEl.select('textarea').item(0);

		DynamicFontResizerView.superclass.init.call(this, el, config);

		this.addEvents(
			DynamicFontResizerView.EVENT_INPUT_KEYDOWN
		);
	},

	/**
	 * On input keydown
	 *
	 * @param {Object} ev	Event object
	 *
	 * @return void;
	 */
	onNoteTyping : function(ev) {
		this.fireEvent(DynamicFontResizerView.EVENT_INPUT_KEYDOWN, {
			ev    : ev,
			scope : this
		});
	},

	/**
	 * Add class to input field
	 *
	 * @param {Number}	fontSize	To data-font-size attribute
	 *
	 * @return void;
	 */
	setFontData : function(fontSize) {
		this._addNoteBoxTextareaEl.dom.setAttribute(this.dataFontSizeAttr, fontSize);
	},

	/**
	 * Binds the initial event handlers
	 */
	bind : function() {
		DynamicFontResizerView.superclass.bind.call(this);
		this._addNoteBoxTextareaEl.on('keyup', this.onNoteTyping, this);
		this._addNoteBoxTextareaEl.on('keypress', this.onNoteTyping, this);
	},

	/**
	 * Unbinds all event handlers
	 */
	unbind : function() {
		DynamicFontResizerView.superclass.unbind.call(this);
		this.autoUnbind();
	}
});
