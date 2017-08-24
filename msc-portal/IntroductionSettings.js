import Chaos from '../../../lib/chaos/Chaos';
import Page from '../../../lib/chaos/Page';

import '../Profile/Profile.scss';

export default function IntroductionSettingsIndex (el, config) {
	IntroductionSettingsIndex.superclass.constructor.call(this, el, config);
}

Chaos.extend(IntroductionSettingsIndex, Page, {

	/**
	 * Init
	 *
	 * @param {Element} el      This should be the body tag.
	 * @param {Object} config   Config object of this component
	 */
	init : function(el, config) {
		IntroductionSettingsIndex.superclass.init.call(this, el, config);
	},


	/**
	 * Esemenykezelok feliratkozasa
	 */
	bind : function() {
		IntroductionSettingsIndex.superclass.bind.call(this);
	},

	/**
	 * Esemenykezelok torlese
	 */
	unbind : function() {
		IntroductionSettingsIndex.superclass.unbind.call(this);
	}
});
