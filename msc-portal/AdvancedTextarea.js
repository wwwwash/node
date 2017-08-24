import Ext from '../../lib/vendor/ExtCore';
import ChaosObject from '../../lib/chaos/Object';

import ScrollPane from '../Scroll/ScrollPane';

/**
 * AdvancedTextarea
 * @deprecated
 * Adds ScrollPane to the textarea
 */

export default function AdvancedTextarea(el, config) {
	AdvancedTextarea.superclass.constructor.call(this, el, config);
}

Ext.extend(AdvancedTextarea, ChaosObject, {

	/** @var {String}              a textarea scrollpane container class-a. Ezt kell szinezned.*/
	containerCls        : 'txt_pane_container',
	/** @var {String}              a textarea scrollpane container ID suffix. */
	containerIdSuffix   : '_txt_pane_container',
	/** @var {String}              fake content element. felveszi a textarea tartalmanak magassagat. */
	fakeContentCls      : 'txt_fakecontent',
	/** @var {String}              fake content element ID suffix.  */
	fakeContentIdSuffix : '_txt_fakecontent',
	/** @var {Number}              a textarea magassaga borderek nelkul */
	_innerHeight        : undefined,
	/** @var {Number}              a textarea also es felso paddingjanak sumja */
	_padding            : 0,
	/** @var {Boolean}             Megakadajozza az ujsor karakter bevitelet */
	preventNewLine      : false,

		/**
		 * AdvancedTextarea komponens init
		 *
		 * @param   {type} el     Az elem
		 * @param   {type} config
		 *
		 * @return  void
		 */
	init : function(el, config) {
		this._innerHeight = this.element.getHeight() - this.element.getBorderWidth('tb');
		this._padding = this.element.getPadding('tb');
			// Felepitjuk a szukseges HTML elementeket
		this.constructDom();

			//Peldanyositjuk a scrollbart
		this._scrollPane = new ScrollPane(this.textareaContainer, {
			containerId              : this.slideContainer.dom.id,
			contentId                : this.fakeContent.dom.id,
			tpl                   		 : '<div class="scroll-pane"><div class="scrollbar"></div></div>',
			scrollBarClass           : 'scrollbar',
			useNativeScroll          : false,
			nativeSlideContainerMode : true
		});

		this.setBarVisibility();

		AdvancedTextarea.superclass.init.call(this, el, config);
	},

	/**
	 * Megepiti a ScrollPane komponens altal igenyelt HTML elementeket,
	 * nemileg modositva.
	 *
	 * @return void
	 */
	constructDom : function() {
		var dh = Ext.DomHelper;

		// A komponenst befoglalo kontener elem
		this.textareaContainer = dh.insertAfter(
			this.element,
			{
				tag   : 'div',
				id    : this.element.id + this.containerIdSuffix,
				class : this.containerCls
			},
			true
		);

		// Magassag alittasa a textarea-hoz
		this.textareaContainer.setStyle({
			height : this.element.getHeight() - this.element.getBorderWidth('tb') + 'px'
		});

		// A slideContainer az most a textarea lesz, es nem bele, hanem utana rakjuk a ScrollPane elementeket
		this.slideContainer = this.element;

		// Egy fake kontent divet berakunk, felveszi a textarea scrollheight-et.
		this.fakeContent = dh.insertAfter(
			this.slideContainer,
			{
				tag   : 'div',
				id    : this.element.id + this.fakeContentIdSuffix,
				class : this.fakeContentCls
			},
			true
		);

		// A fake kontentet magassagat a textarea scrollheight-hez allitjuk
		this.fakeContent.setStyle({
			height    : this.element.dom.scrollHeight + 'px',
			minHeight : this._innerHeight + 'px'
		});
	},

	/**
	 * Megallapitja , hogy a scrollheight kisebb vagy nagyobb a textarea magassaganal,
	 * ennek megfeleloen allitja be hogy latszodjon-e a bar vagy ne.
	 *
	 * @return void
	 */
	setBarVisibility : function() {
		var is_firefox30 = navigator.userAgent.toLowerCase().indexOf('firefox/30'), // eslint-disable-line
			scrollHeight = Ext.isGecko && !is_firefox30 // eslint-disable-line
							? this.element.dom.scrollHeight + this._padding
							: this.element.dom.scrollHeight;

		// Nem kell scroll, ha a a tartalom nincs olyan magas mint a textarea
		if (this._scrollPane._scrollBarEl && scrollHeight <= this._innerHeight) {
			this._scrollPane.getScrollBar().hide();
		} // ha pedig nem latszik es magasabb, akkor megjelenitjuk
		else if (!this._scrollPane._scrollBarEl.isVisible() && scrollHeight > this._innerHeight) {
			this._scrollPane.getScrollBar().show();
		}
	},


	/**
	 * Textarea keyupra frissiti a fake content es a scrollpane mereteit
	 *
	 * @return void
	 */
	elementOnKeyUp : function() {
		this.fakeContent.setStyle({
			height : this.element.dom.scrollHeight + 'px'
		});

		this._scrollPane.setScrollBarHeight();

		// Beallitom hogy latszodjon-e vagy ne
		this.setBarVisibility();
	},

	/**
	 * Textarea keydownra vizsgalja, hogy entert utottunk-e, ha igen, akkor nincs akcio
	 *
	 * @param ev
	 * @return void
	 */
	elementOnKeyDown : function(ev) {
		if (ev.keyCode === 13 && this.preventNewLine) {
			ev.preventDefault();
			ev.stopPropagation();
		}
	},

    /**
     * When the element changed from outside.
     *
     */
	elementOnChange : function() {
		setTimeout(::this.setBarVisibility, 200);
	},

	/**
	 * Megsemmisiti a kontenert es a csuszkat
	 *
	 * @return void
	 */
	destroy : function() {
		this.unbind();

		this.textareaContainer.remove();
		this.fakeContent.remove();
	},

	/**
	 * Binds all basic event listeners.
	 *
	 * @return void
	 */
	bind : function() {
		AdvancedTextarea.superclass.bind.call(this);

		this.element.on('keyup', this.elementOnKeyUp, this)
					.on('keydown', this.elementOnKeyDown, this)
					// textarea changed from outside
					.on('change', this.elementOnChange, this);
	},

	/**
	 * Unbinds all basic event listeners.
	 *
	 * @return void
	 */
	unbind : function() {
		AdvancedTextarea.superclass.unbind.call(this);

		this.element.un('keyup', this.elementOnKeyUp, this)
					.un('keydown', this.elementOnKeyDown, this)
					.un('change', this.elementOnChange, this);
	}
});
