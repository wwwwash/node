import Ext from '../../lib/vendor/ExtCore';
import Chaos from '../../lib/chaos/Chaos';
import Connection from '../../lib/chaos/Connection';

import GlobalProgressIndicator from '../ProgressIndicator/GlobalProgressIndicator';

export default function ConnectionComponent(config) {
	ConnectionComponent.superclass.constructor.call(this, config);
}

/**
 *
 */
Chaos.extend(ConnectionComponent, Connection, {
	overlayIndicatorClass : '.overlayBlock',

	/**
	 * Init
	 *
	 * @param {Element} el      This should be the body tag.
	 * @param {Object} config   Config object of this component
	 */
	init : function() {
		ConnectionComponent.superclass.init.call(this);
	},

	/**
	 * Sends a request to the server defined by config
	 *
	 * @param {Object} options     The parameter to the request call
	 *
	 * @return undefined
	 */
	request : function(options) {
		if (!options) {
			return;
		}
		var isOverlay = Ext.select(this.overlayIndicatorClass).getCount() > 0 ? 1 : 0;
			//Extend options with specific parameter
		if (options.params) {
			if (typeof options.params.isOverlay !== 'number' && isOverlay > 0) {
				options.params.isOverlay = isOverlay;
			}
		}
		else if (isOverlay > 0) {
			options.params = { isOverlay : isOverlay };
		}

		//Ha szinkron tipusu a hivas, akkor kell csak porgettyu
		if (options.synchron) {
			//Show ajax progress indicator
			Chaos.fireEvent(GlobalProgressIndicator.GLOBALEVENT_SHOW_INDICATOR);
		}
		//Delete synchron property, because its not needed in the further process
		delete options.synchron;
		//

		var rqObj = ConnectionComponent.superclass.request.call(this, options);

		return rqObj.tId;
	},

	/**
	 * callback on success
	 *
	 * @param {String} response
	 * @param {Object} options
	 *
	 * @return undefined
	 */
	onSuccess : function(response, options) {
		// Lejart session eseten tovabb dob a redirectURL-re
		try {
			var responseObj = Ext.decode(response.responseText);
			if (parseInt(responseObj.errorCode, 10) === 1000 && responseObj.status === 'ERROR') {
				var url = responseObj.data.redirectUrl;
				if (url) {
					window.location.href = url;
					return;
				}
			}
		}
		catch (e) {
			/* develblock:start */
			console.warn(e);
			/* develblock:end */
		}

		ConnectionComponent.superclass.onSuccess.call(this, response, options);

		if (this.getRunningReqsCount() === 0 && options.preventLoaderHide !== true) {
			//Hide progress indicator
			Chaos.fireEvent(GlobalProgressIndicator.GLOBALEVENT_HIDE_INDICATOR);
		}
	},

	/**
	 * callback on failure
	 *
	 * @param {String} response
	 * @param {Object} options
	 *
	 * @return undefined
	 */
	onFailure : function(response, options) {
		//Hide progress indicator
		Chaos.fireEvent(GlobalProgressIndicator.GLOBALEVENT_HIDE_INDICATOR);
		//
		ConnectionComponent.superclass.onFailure.call(this, response, options);
	},

	/**
	 *
	 * @param response
	 * @param options
	 */
	onError : function(response, options) {
		//Hide progress indicator
		Chaos.fireEvent(GlobalProgressIndicator.GLOBALEVENT_HIDE_INDICATOR);
		//
		ConnectionComponent.superclass.onError.call(this, response, options);
	}
});
