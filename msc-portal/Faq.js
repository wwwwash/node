import Chaos from '../../../lib/chaos/Chaos';
import Page from '../../../lib/chaos/Page';

import SimpleDisplayElements from '../../ShowHide/SimpleDisplayElements';

import './Faq.scss';

export default function Faq(el, config) {
	Faq.superclass.constructor.call(this, el, config);
}

Chaos.extend(Faq, Page, {

	/**
	 * Init
	 *
	 * @param {Element} el      This should be the body tag.
	 * @param {Object} config   Config object of this component
	 */
	init : function(el, config) {
		// Init futtatasa
		Faq.superclass.init.call(this, el, config);

		// Init show/hide content elements
		new SimpleDisplayElements(document.body, {});
	},


	/**
	 * Esemenykezelok feliratkozasa
	 */
	bind : function() {
		Faq.superclass.bind.call(this);
	},

	/**
	 * Esemenykezelok torlese
	 */
	unbind : function() {
		Faq.superclass.unbind.call(this);
	}
});
