import Chaos from '../../lib/chaos/Chaos';
import ChaosObject from '../../lib/chaos/Object';

export default function ChannelOverlayModel(el, config) {
	ChannelOverlayModel.superclass.constructor.call(this, el, config);
}

Chaos.extend(ChannelOverlayModel, ChaosObject, {

	/**
	 * Init
	 *
	 * @param {Element} el      Context element
	 * @param {Object} config   Config object of this controller
	 */
	init : function(el, config) {
		ChannelOverlayModel.superclass.init.call(this, el, config);
	}
});
