import Chaos from '../../../lib/chaos/Chaos';
import Page from '../../../lib/chaos/Page';

import Form from '../../_Form/Form';
import AdvancedTextarea from '../../_Form/AdvancedTextarea';

import '../Profile/Profile.scss';

export default function PersonalDataSettingsIndex(el, config) {
	PersonalDataSettingsIndex.superclass.constructor.call(this, el, config);
}

Chaos.extend(PersonalDataSettingsIndex, Page, {

	/* UI elements */
	ui : {
		/** @var {String} standAloneContent   Content container */
		standAloneContent : 'personalDataForm',
		/** @var {String} textarea            Textareas */
		textarea          : 'textarea',
		/** @var {String} showMoreLanguage    Show more language class */
		showMoreLanguage  : '.more a',
		/** @var {String} exapandableLangs    Expandable (show/hide toggleable) language block element */
		exapandableLangs  : '.spokenLanguages.expandable'
	},

	/* Components */
	cmp : {
		form : {
			name : Form,
			el   : 'ui.standAloneContent'
		},
		advancedTextArea : {
			name : AdvancedTextarea,
			el   : 'ui.textarea'
		}
	},

	/** @var {String} expandedLangShowCls   Class which indicates show state on the 'other languages' block */
	expandedLangShowCls : 'show',

	/** @var {String} showMoreIconAlterClsAttr   Alternate class data attribute in Showmore Language link */
	showMoreIconAlterClsAttr : 'alternateClass',

	/**
	 * Init
	 *
	 * @param {Element} el      This should be the body tag.
	 * @param {Object} config   Config object of this component
	 */
	init : function(el, config) {
		PersonalDataSettingsIndex.superclass.init.call(this, el, config);

		// If other languages are shown by default, toggle the showmore icon to show its opened state.
		if (this.ui.exapandableLangs.el().hasClass(this.expandedLangShowCls)) {
			this.toggleShowMoreIcon();
		}
	},

	/**
	 * Click event handler on show more languages link.
	 * @param {Object} ev Event Handler
	 */
	onShowMoreLanguageClick : function(ev) {
		ev.preventDefault();
		// Toggle show class on 'other languages' container
		this.ui.exapandableLangs.el().dom.classList.toggle(this.expandedLangShowCls);
		this.toggleShowMoreIcon();
	},

	/**
	 * Toggles the class in the Show more link's icon (down or up state)
	 */
	toggleShowMoreIcon : function() {
		var icon = this.ui.showMoreLanguage.el().select('i').item(0),
			cls = icon.dom.className,
			alternateCls = icon.data(this.showMoreIconAlterClsAttr);

		// Replace the 'class' and the 'alternate-class' on the icon element (up versus down arrow)
		icon.addClass(alternateCls).removeClass(cls);
		icon.data(this.showMoreIconAlterClsAttr, cls);
	},

	/**
	 * Attach event handlers
	 */
	bind : function() {
		PersonalDataSettingsIndex.superclass.bind.call(this);

		this.ui.showMoreLanguage.el().on('click', this.onShowMoreLanguageClick, this);
	},

	/**
	 * Detach event handlers
	 */
	unbind : function() {
		PersonalDataSettingsIndex.superclass.unbind.call(this);

		this.ui.showMoreLanguage.el().un('click', this.onShowMoreLanguageClick, this);
	}
});
