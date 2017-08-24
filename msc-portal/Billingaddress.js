import riot from 'riot';

import Chaos from '../../../lib/chaos/Chaos';
import Page from '../../../lib/chaos/Page';
import Config from '../../../lib/chaos/Config';

import '../../_AjaxContent/AjaxContent';

import '../Payout/Payout.scss';

export default function BillingAddress (el, config) {
	BillingAddress.superclass.constructor.call(this, el, config);
}

Chaos.extend(BillingAddress, Page, {


	ui : {
		form      : 'form#billing-address-form',
		tabs      : '.tabContainer .tab a',
		payoutTab : '.tab__payout-options'
	},

	/**
	 * Init
	 *
	 * @param {Element} el      This should be the body tag.
	 * @param {Object} config   Config object of this component
	 */
	init : function(el, config) {
		this.ajaxContentTag = document.querySelector('ajax-content')._tag;

		if (!this.ajaxContentTag) {
			this.ajaxContentTag = riot.mount('ajax-content', {
				tabs : Config.get('ajaxContentTabs')
			});
			this.ajaxContentTag = this.ajaxContentTag[0];
		}

		BillingAddress.superclass.init.call(this, el, config);
	},


	/**
	 * Returns the Ajax-Content riot tag.
	 */
	getAjaxContentTag : function() {
		return this.ajaxContentTag;
	},

	/**
	 * Returns the Tabs riot tag.
	 */
	onSubmitSuccess : function(response) {
		this.getAjaxContentTag()
			.setTabProperty('payoutoptions_index', 'disabled', false)
			.saveDefaultOptions();

		if (response.data.redirectUrl) {
			var url = Chaos.getUrl(response.data.redirectUrl);
			this.getAjaxContentTag().navigateTo(url);
		}
	},

	onValidationEnded : function(hasInputError, input, hasGlobalError) {
		this.getAjaxContentTag().setTabProperty('billingaddress_index', 'icon', hasGlobalError ? 'alert' : 'ok');
	},

	/**
	 * Bind events
	 */
	bind : function() {
		BillingAddress.superclass.bind.call(this);
		this.ui.form.dom(true)._tag.on('form-success', this.onSubmitSuccess.bind(this));
		this.ui.form.dom(true)._tag.on('end-validation', this.onValidationEnded.bind(this));
	},

	/**
	 * Unbind events
	 */
	unbind : function() {
		this.autoUnbind();
	}
});
