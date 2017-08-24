import CONST from '../../../lib/constant/Constants';
import Ext from '../../../lib/vendor/ExtCore';
import Chaos from '../../../lib/chaos/Chaos';
import ChaosObject from '../../../lib/chaos/Object';
import Connection from '../../../lib/chaos/Connection';

import './MyWebsiteConfirm.scss';

/**
 * Overlay controller object for the 'my website confirm' overlay
 */

export default function MyWebsiteConfirm(el, config) {
	MyWebsiteConfirm.superclass.constructor.call(this, el, config);
}

Chaos.extend(MyWebsiteConfirm, ChaosObject, {

	/** @var {String}               Route of the my-website page  */
	myWebsiteIndexRoute : 'MyWebsite/Index',

	/**
	 * Init
	 *
	 * @param {Element} el      This should be the body tag.
	 * @param {Object} config   Config object of this controller
	 */
	init : function(el, config) {
		// Elements
		this._createNowButtonEl = this.element.select('.js-create-now-button').item(0);
		// Domain url for registration
		this._domainNameUrl = Ext.get('myWebsiteConfirm').select('input[type=radio]:checked').item(0).data('url');

		MyWebsiteConfirm.superclass.init.call(this, el, config);
	},

	/**
	 * Handles click on create now button element
	 *
	 * @method _onCreateNowButtonClick
	 *
	 * @return void
	 */
	_onCreateNowButtonClick : function(ev) {
		ev.preventDefault();
		this._createNowButtonEl.dom.setAttribute('disabled', 'disabled');
		this.tryToReserveWebsite(this._domainNameUrl);
	},

	/**
	 * Handles click on label element
	 *
	 * @method _onDomainLabelElClick
	 *
	 * @return void
	 */
	_onDomainLabelElClick : function(ev, target) {
		var targetEl = Ext.get(target);
		var actualRadioEl = Ext.get(targetEl.dom.getAttribute('for').toString());
		this._domainNameUrl = actualRadioEl.data('url');
	},

	/**
	 * Handles click on close button
	 *
	 * @method _onCloseConfirmationButtonClick
	 *
	 * @return void
	 */
	_onCloseConfirmationButtonClick : function(ev) {
		ev.preventDefault();

		this.overlayCmp.closePopupEventHandler();
	},

	/**
	 * Event handler of the website reserve ajax request
	 *
	 * @param {String} url  url of the request
	 *
	 * @return void
	 */
	tryToReserveWebsite : function(url) {
		Connection.Ajax.request({
			url	     : url,
			scope  	 : this,
			success	 : this.onReserveSuccess,
			error  	 : this.onReserveError,
			failure	 : this.onReserveError,
			method 	 : CONST.GET,
			synchron : true
		});
	},

	/**
	 * Success handler of the website reserve ajax request
	 *
	 * @param {Object} response
	 *
	 * @return void
	 */
	onReserveSuccess : function (response) {
		var _data = response.json.data;
		this.overlayCmp.closePopupEventHandler();
		if (_data && _data.forwardUrl !== '') {
			window.location.href = _data.forwardUrl;
		}
		else {
			/* develblock:start */
			console.warn('No forwardUrl in data: ', _data);
			/* develblock:end */
			// Go back to the my website index page
			window.location.href = Chaos.getUrl(this.myWebsiteIndexRoute);
		}
	},

	/**
	 * Error handler of the website reserve ajax request
	 *
	 * @param {Object} response
	 *
	 * @return void
	 */
	onReserveError : function (response) {
		this.overlayCmp.closePopupEventHandler();
		/* develblock:start */
		console.warn('Cannot reserve website! Response: ', response);
		/* develblock:end */
		// Go back to the my website index page
		window.location.href = Chaos.getUrl(this.myWebsiteIndexRoute);
	},

	/**
	 * Binds events
	 */
	bind : function() {
		MyWebsiteConfirm.superclass.bind.call(this);
		this._createNowButtonEl.on('click', this._onCreateNowButtonClick, this);
		this.element.on('click', this._onDomainLabelElClick, this, {
			delegate : '.js-recommended-domain-label'
		});

		this.element.on('click', this._onCloseConfirmationButtonClick, this, {
			delegate : '.js-confirmation-close-button'
		});
	},

	/**
	 * Unbind events
	 */
	unbind : function() {
		this.autoUnbind();
	}
});