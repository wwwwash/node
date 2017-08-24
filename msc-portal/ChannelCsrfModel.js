import Chaos from '../../lib/chaos/Chaos';
import ChaosObject from '../../lib/chaos/Object';

export default function ChannelCsrfModel(el, config) {
	ChannelCsrfModel.superclass.constructor.call(this, el, config);
}

Chaos.extend(ChannelCsrfModel, ChaosObject, {

	/** @var {String} csrfSel   Selector of the CSRF hidden element */
	csrfSel : '.channelEditor [name="csrfToken"]',

	/**
	 * Init
	 *
	 * @param {Object} config   Config object of this controller
	 */
	init : function(el, config) {
		ChannelCsrfModel.superclass.init.call(this, el, config);
	},

	/**
	 * Returns the Channel editors global csrf token
	 *
	 * @return {String}
	 */
	get : function () {
		return this.element.select(this.csrfSel).item(0).getValue();
	},

	/**
	 * Sets the csrf token value for the channel actions
	 * @param csrf
	 * @return {boolean}
	 */
	set : function (csrf) {
		this.element.select(this.csrfSel).item(0).setValue(csrf);
		return true;
	}
});
