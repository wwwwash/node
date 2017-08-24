import Chaos from '../../../lib/chaos/Chaos';
import Page from '../../../lib/chaos/Page';

import Form from '../../_Form/Form';

import '../Profile/Profile.scss';

export default function PriceSettingsIndex(el, config) {
	PriceSettingsIndex.superclass.constructor.call(this, el, config);
}

Chaos.extend(PriceSettingsIndex, Page, {

	/* UI elements */
	ui : {
		perMinutePrice : 'perMinutePrice'
	},

	/* Components */
	cmp : {
		form : {
			name : Form,
			el   : 'ui.perMinutePrice'
		}
	},

	/**
	 * Init
	 *
	 * @param {Element} el      This should be the body tag.
	 * @param {Object} config   Config object of this component
	 */
	init : function(el, config) {
		PriceSettingsIndex.superclass.init.call(this, el, config);
	},


	/**
	 * Esemenykezelok feliratkozasa
	 */
	bind : function() {
		PriceSettingsIndex.superclass.bind.call(this);
	},

	/**
	 * Esemenykezelok torlese
	 */
	unbind : function() {
		PriceSettingsIndex.superclass.unbind.call(this);
	}
});
