/**
 * A regisztracios folyamatkezeles.
 *
 * @param {type} param
 */

import Ext from '../../../lib/vendor/ExtCore';
import Chaos from '../../../lib/chaos/Chaos';
import Page from '../../../lib/chaos/Page';
import Config from '../../../lib/chaos/Config';

import ScrollPane from '../../Scroll/ScrollPane';

import '../../Overlay/SelectAccountType/SelectAccountType.scss';
import '../../Overlay/ScreenNameAndCategory/ScreenNameAndCategory.scss';

export default function SignupFlow(el, config) {
	SignupFlow.superclass.constructor.call(this, el, config);
}

Chaos.extend(SignupFlow, Page, {

	/* PRIVAT VARS */
	/** @var {Component}                    Form plugin kompones */
	_form              : undefined,
	/** @var {ScrollPane}                    Scroll plugin kompones */
	_scroll            : undefined,
	/**                                     A signup folyamatban szereplo form id-ja**/
	_formId            : 'signup_form',
	/**                                     Backend altal generalt validacios objektum neve **/
	_validationObjName : 'validationObj',
	/* A backend altal generalt hibakodokat es nyelvesitett hibauzeneteket tartalmazo objektum neve*/
	_errorObjName      : 'errorObj',
	/** @var {string}                       Sample ablakok neveihez elotag */
	_samplePrefix      : 'sample',
	/** @var {string}                      the footer id **/
	footerId           : 'footer',
	/** @var {object}                      the footer Ext element **/
	_footerEl          : undefined,
	/** @var {string}                      Selector of the language links in footer **/
	languageLinksSel   : '.footerMiddle ul li a',
	/** @var {string}                      A signup form id-je **/
	_languageLinksEls  : undefined,
	/** @var {string}                      A slide-olni kivant elemek class erteke **/
	_slideContainer    : 'slideContent',
	/** @var {string}                      the signup form id **/
	signupFormId       : 'signup_form',
	/** @var {string}                      class name on form that representing the first, new account step **/
	newAccountStepCls  : 'step-new-account',

	/**
	 * Init
	 *
	 * @param {Element} el      This should be the body tag.
	 * @param {Object} config   Config object of this component
	 */
	init : function(el, config) {
		// Footerben levo language linkek
		this._footerEl = Ext.get(this.footerId);
		this._languageLinksEls = this._footerEl.select(this.languageLinksSel);

		this._unloadMessageNeeded = false; //!Ext.fly(this.signupFormId).hasClass(this.newAccountStepCls);

		// Slider
		var slideContainerEl = Ext.get(this._slideContainer);
		if (slideContainerEl) {
			this._scroll = new ScrollPane(
				slideContainerEl,
				{
					containerId    : 'slideContainer',
					contentId      : 'slideText',
					tpl            : '<div class="scroll-pane"><div class="scrollbar"></div></div>',
					scrollBarClass : 'scrollbar'
				}
			);
		}

		SignupFlow.superclass.init.call(this, el, config);
	},

	/**
	 * Action before unload the page
	 *
	 * @returns {mixed}
	 */
	onBeforeUnload : function() {
		var message = Config.get('signupLeaveText');
		return message;
	},

	/**
	 * Prevents Signup Leave message popping up
	 */
	preventSignupLeaveMessage : function() {
		window.onbeforeunload = function() {};
	},

	/**
	 * Form Submit event handler.
	 */
	onFormSubmit : function() {
		this.preventSignupLeaveMessage();
	},

	/**
	 * footer language links click handler
	 */
	onLanguageLinksClick : function() {
		this.preventSignupLeaveMessage();
	},

	/**
	 *
	 * @private
	 */
	_onRadioChange : function() {},

	/**
	 * Esemenykezelok feliratkozasa
	 */
	bind : function() {
		this._languageLinksEls.on('click', this.onLanguageLinksClick, this);

		if (this._unloadMessageNeeded) {
			window.onbeforeunload = this.onBeforeUnload;
		}

		SignupFlow.superclass.bind.call(this);
	},

	/**
	 * Esemenykezelok torlese
	 */
	unbind : function() {
		this.autoUnbind();
	}
});
