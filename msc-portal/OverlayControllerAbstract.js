import Ext from '../../lib/vendor/ExtCore';
import Chaos from '../../lib/chaos/Chaos';

import overlayLoader from './';

/**
 * Overlay Controller abstract.
 * Handles overlay's functions
 */
export default function OverlayControllerAbstract(el, config) {
	OverlayControllerAbstract.superclass.constructor.call(this, el, config);
}

Chaos.extend(OverlayControllerAbstract, Ext.util.Observable, {
    /**
     * Id alapjan peldanyositjuk a megfelelo js osztalyokat
     *
     * @param pageId
     */
	pageController : async function(overlayId, clickedButton, response, overlayCmp) {
		let controller = await overlayLoader(overlayId);

        // Init overlay controller if exists
		if (controller) {
			this._controller = new controller(overlayCmp.element, {
				overlayCmp : overlayCmp,
				formCmp    : this._form,
				response
			});
		}
		else {
			/* develblock:start */
			console.warn(`Standalone Overlay controller not found for '${overlayId}'`);
			/* develblock:end */
		}
	}

});
