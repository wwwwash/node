import Chaos from '../../lib/chaos/Chaos';

import CommonWidgetController from './CommonWidgetController';

export default function GoogleAnalyticsWidgetController(el, config) {
	GoogleAnalyticsWidgetController.superclass.constructor.call(this, el, config);
}

Chaos.extend(GoogleAnalyticsWidgetController, CommonWidgetController, {

	init : function(el, config) {
		setTimeout(() => {
			this._formTag = this.element.dom.querySelector('form')._tag;
			this._formInputTag = this.element.dom.querySelector('form-input')._tag;

			GoogleAnalyticsWidgetController.superclass.init.call(this, el, config);
		}, 10);
	},

	onWidgetClose : function(ev) {
		GoogleAnalyticsWidgetController.superclass.onWidgetClose.call(this, ev);
		this._formInputTag.trigger(this._formInputTag.CONST.RIOT_ELEMENT_HIDE_ERROR_EVENT);
	},

	onAjaxRequestSuccess : function(response) {
		if (!response && !response.status !== 'OK') {
			return;
		}

		/* develblock:start */
		console.log('Success on GA tracking code save request:', response);
		/* develblock:end */
	},

	onAjaxRequestError : function(response) {
		if (!response && !response.status !== 'ERROR') {
			return;
		}

		/* develblock:start */
		console.error('Error on GA tracking code save request:', response);
		/* develblock:end */

		//@TODO: Show error message
	},

	bind : function() {
		GoogleAnalyticsWidgetController.superclass.bind.call(this);

		this._formTag.on(this._formTag.CONST.FORM_AJAX_SUCCESS, this.onAjaxRequestSuccess.bind(this), this);
		this._formTag.on(this._formTag.CONST.FORM_AJAX_ERROR, this.onAjaxRequestError.bind(this), this);
	},

	unbind : function() {
		GoogleAnalyticsWidgetController.superclass.unbind.call(this);
	}
});
