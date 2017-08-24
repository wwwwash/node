import Ext from '../../lib/vendor/ExtCore';
import Chaos from '../../lib/chaos/Chaos';
import ChaosObject from '../../lib/chaos/Object';

import Sound from '../Sound/Sound';

/**
 *Character counter component
 */
export default function CharacterCounter(el, config) {
	CharacterCounter.superclass.constructor.call(this, el, config);
}

CharacterCounter.EVENT_WARNING_LIMIT_REACHED = 'warning-limit-reached';
CharacterCounter.EVENT_MAX_CHAR_LIMIT_REACHED = 'max-char-limit-reached';
CharacterCounter.EVENT_WARNING_LIMIT_FALLING = 'warning-limit-falling';

Chaos.extend(CharacterCounter, ChaosObject, {
	/** @var {Number} maxChar	        Beirhato karakterek maximalis szama */
	maxChar             : 4000,
	/** @var {Number} warningChar	    Karakter szam ahol figyelmeztetes jelenik meg [Ha undefined, akkor azt jelenti, hogy nincs ra szukseg] */
	warningChar         : undefined,
	/** @var {String} maxCharText	    Max char eleresekor megjelenitendo szoveg */
	maxCharText         : undefined,
	/** @var {String} warningCharText	Warning char eleresekor megjelenitendo szoveg */
	warningCharText     : undefined,
	/** @var {Boolean} hasWarningLimit	TRUE, ha a max elerese elott kell kuldeni egy figyelmeztetest is */
	hasWarningLimit     : true,
	/** @var {Function} maxCharText	    Max char eleresekor hivando fuggveny */
	maxCharCallback     : Chaos.emptyFn,
	/** @var {Function} warningCharText	Warning char eleresekor hivando fuggveny */
	warningCharCallback : Chaos.emptyFn,
	/** @var {String} inputId	        Beviteli mezo azonositoja amire a karakterszamlalot kotjuk */
	inputId             : 'message',
	/** @var {String} counterId	        Karakter szamlalo azonositoja */
	counterId           : 'char_number',
	/** @var {String} charInfoId		    Karakter szamlalo warning uzeneteit tartalmazo elem azonositoja */
	charInfoId          : undefined,
	/** @var {String} messageErrorId */
	messageErrorId      : 'message_error',
	/** @var {Boolean} isShowCounter          TRUE, ha szukseg van a karakter visszaszamlalas megjelenitesere */
	isShowCounter       : true,
	/** @var {Boolean} isMaxCharSOund         TRUE, ha a maximum karakter eleresnel hangot is kell lejatszani */
	isMaxCharSound      : false,
	/** @var {Boolean} computeMaxChar         TRUE, ha a maxLength attributumbol kell szamolni a maxChar-t */
	computeMaxChar      : false,

	/* ------ PRIVATE VARS ------ */

	/** @var {Booelan} _warningLimitReached   Ha true, akkor a figyelmezteto eventet mar elkuldtuk,
	 *                                       igy nem kuldjuk el ujra minden karakter leutesekor */
	_warningLimitReached : false,
	/** @var {Booelan} _maxCharLimitReached   Ha true, akkor a figyelmezteto eventet mar elkuldtuk,
	 *                                       igy nem kuldjuk el ujra minden karakter leutesekor */
	_maxCharLimitReached : false,
	/** @var {Booelan} _warningLimitFalling   Ha true, akkor a figyelmezteto eventet mar elkuldtuk,
	 *                                       igy nem kuldjuk el ujra minden karakter leutesekor */
	_warningLimitFalling : false,
	/** @var {Object} warningLimitUp         True az erteke, ha egyszer amr elertuk a karakterlimit szamot */
	_warningLimitUp      : false,
	/** @var {Object} _inputEl               Input mezo, amin a szamolast vegezzuk [Ext.Element] */
	_inputEl             : undefined,
	/** @var {Object} _counterEl             Karakter szamlalo [Ext.Element] */
	_counterEl           : undefined,

	/**
	 * Standard init function
	 *
	 * @param {Object} el
	 * @param {Object} config
	 *
	 * @return undefined
	 */
	init : function(el, config) {
		this._inputEl = Ext.get(this.inputId);

		if (this.computeMaxChar) {
			this.maxChar = parseInt(this._inputEl.dom.attributes.maxLength.value, 10);
		}

		CharacterCounter.superclass.init.call(this, el, config);

		// Esemeny hozzaadasa
		this.addEvents(
			CharacterCounter.EVENT_WARNING_LIMIT_REACHED,
			CharacterCounter.EVENT_MAX_CHAR_LIMIT_REACHED,
			CharacterCounter.EVENT_WARNING_LIMIT_FALLING
		);
		// Tiltott hanglejatszassal frissitjuk a szamlalot
		this._refreshCounter(false);
	},

	/**
	 * Karakter szamlalo fuggveny
	 */
	onCharCounterKeyup : function(e) {
		// Let the user move with arrows when max character limit is hit, also don't beep
		switch (e.keyCode) {
			// end button
			case 35: break;
			// home button
			case 36: break;
			// left arrow
			case 37: break;
			// top arrow
			case 38: break;
			// right arrow
			case 39: break;
			// bottom arrow
			case 40: break;
			default:
				this._refreshCounter(true);
				break;
		}
	},

	/**
	 * Refreshes the counters.
	 *
	 * @method refreshCounter
	 * @param {Boolean} enableSound   TRUE, sounds are enabled
	 *
	 * @return {Object}
	 */
	refreshCounter : function(enableSound) {
		this._refreshCounter(enableSound);
		return this;
	},

	/**
	 * Beallitja a szamlalo erteket
	 *
	 * @param {Boolean} enableSound   TRUE, ha engedelyezett a hanglejatszas is
	 *
	 * @return void
	 */
	_refreshCounter : function(enableSound) {
		this.charLeft = this.maxChar - this._inputEl.dom.value.length;
		if (this.isShowCounter) {
			this._counterEl = Ext.get(this.counterId);
		}

		this.checkCharNumber(enableSound);

		/* A karakter szamlalo erteket allitja, 0 ala nem engedjuk */
		if (this.isShowCounter) {
			if (this.charLeft >= 0) {
				this._counterEl.dom.innerHTML = this.charLeft;
			}
			else {
				this._counterEl.dom.innerHTML = 0;
			}
		}
	},

	/**
	 * Leellenorzi a begepelt karakterek szamat es ha elertuk a warning limitet, akkor warning esemenyt triggerel
	 *
	 * @param {Boolean} enableSound   TRUE, ha engedelyezett a hanglejatszas is
	 *
	 * @return void
	 */
	checkCharNumber : function(enableSound) {
		/* Ha elerjuk azt a karakterszamot amiert pluszban kell fizetni, megjelenitjuk az info szoveget es atirjuk az uzenet arat */
		if (this.isWarningNeeded()) {
			this.fireEvent(CharacterCounter.EVENT_WARNING_LIMIT_REACHED, this);
			this.warningCharCallback();
			this._warningLimitUp = true;
		}
		/* Ha elfogy a rendelkezesre allo karakterszam, nem engedjuk tovabb irni */
		else if (this.isMaxCharReached()) {
			// Nem engedjuk a tovabbi karakterek beirasat
			this._inputEl.dom.value = this._inputEl.dom.value.substr(0, this.maxChar);
			// Esemeny trigger
			this.fireEvent(CharacterCounter.EVENT_MAX_CHAR_LIMIT_REACHED, { scope : this, field : this._inputEl });
			this.maxCharCallback();
			if (this.isMaxCharSound && enableSound) {
				this.playAudio();
			}
		}
		else {
			/* Ha egyszer elertuk a figyelmezteto uzenetet, majd toroltunk karakterek, dob egy esemenyt */
			if (this._warningLimitUp) {
				this.fireEvent(CharacterCounter.EVENT_WARNING_LIMIT_FALLING, { scope : this, field : this._inputEl });
				this._warningLimitUp = false;
			}
			// Figyelmezteto esemenyek ujra mehetnek
			this._warningLimitReached = false;
			this._maxCharLimitReached = false;
			this._warningLimitFalling = false;

			// Figyelmezteto uzenet elrejtese
			if (Ext.fly(this.charInfoId)) {
				Ext.fly(this.charInfoId).hide();
			}
		}
	},

	/**
	 * Megvizsgalja, hogy elertuk-e mar azt a begepelt karakterszamot, aminel mar figyelemeztetest kell dobni
	 *
	 * @return {Boolean}   TRUE, ha mehet a figyelemeztetes
	 */
	isWarningNeeded : function() {
		return this.warningChar && this.charLeft < this.warningChar && this.charLeft > 0 && this.hasWarningLimit;
	},

	/**
	 * Megvizsgalja, hogy elertuk-e mar azt a begepelt karakterszamot, aminel tobbet mar nem engedunk irni
	 *
	 * @return {Boolean}   TRUE, ha elertuk a max beirhato karakterszamot
	 */
	isMaxCharReached : function() {
		return this.charLeft <= 0;
	},

	/**
	 * A drag and drop esemeny letiltasa
	 */
	preventDragAndDrop : function(e) {
		e.preventDefault();
	},

	/**
	 * Karakter szamlalo visszaallitasa az eredeti ertekre
	 */
	resetCounter : function() {
		if (this.isShowCounter) {
			Ext.fly(this.counterId).dom.innerHTML = this.maxChar;
		}
		this.charLeft = this.maxChar;
		if (Ext.fly(this.charInfoId)) {
			Ext.fly(this.charInfoId).hide();
		}
	},

	/**
	 * Input mezo focus
	 */
	onInputFocus : function() {
		// Focus esemenyre leellenorizzuk ujra a beirt karakter mennyiseget
		this.checkCharNumber(false);
	},

	/**
	 * Input mezo blur
	 */
	onInputBlur : function() {
		// Blur esemenyre elrejtjuk az figyelmezteto szoveget, ha van
		if (Ext.fly(this.charInfoId)) {
			Ext.fly(this.charInfoId).hide();
		}
	},

	/**
	 * Lejatsza a maxumim karakterszamnal betolto hangot
	 */
	playAudio : function() {
		this.alertSound = this.alertSound || new Sound();
		this.alertSound.playSound();
	},

	/**
	 * Kiszedi a DOM-bol az audio taget
	 */
	removeAudioTag : function() {
		if (this._audioEl) {
			this._audioEl.remove();
		}
	},

	/**
	 * Binds event handlers on initialization
	 */
	bind : function() {
		CharacterCounter.superclass.bind.call(this);

		this._inputEl.on({
			keyup : {
				fn    : this.onCharCounterKeyup,
				scope : this
			},
			focus : {
				fn    : this.onInputFocus,
				scope : this
			},
			blur : {
				fn    : this.onInputBlur,
				scope : this
			}
		});

		if (Ext.isChrome || Ext.isSafari) {
			this._inputEl.on('dragover', this.preventDragAndDrop, this);
		}
		else {
			this._inputEl.on('drop', this.preventDragAndDrop, this);
		}
	},

	/**
	 * Unbinds event handlers on destroy
	 */
	unbind : function() {
		CharacterCounter.superclass.unbind.call(this);

		this._inputEl.un({
			keyup : {
				fn    : this.onCharCounterKeyup,
				scope : this
			},
			focus : {
				fn    : this.onInputFocus,
				scope : this
			},
			blur : {
				fn    : this.onInputBlur,
				scope : this
			}
		});

		if (Ext.isChrome || Ext.isSafari) {
			this._inputEl.un('dragover', this.preventDragAndDrop, this);
		}
		else {
			this._inputEl.un('drop', this.preventDragAndDrop, this);
		}

		this.removeAudioTag();
	}
});
