import Chaos from '../../../lib/chaos/Chaos';
import Page from '../../../lib/chaos/Page';

import '../../_Messenger/MessengerApp';

import './Message.scss';

export default function MessageIndex(el, config) {
	MessageIndex.superclass.constructor.call(this, el, config);
}

Chaos.extend(MessageIndex, Page, {

    /**
     * Init
     *
     * @param {Element} el      This should be the body tag.
     * @param {Object} config   Config object of this component
     */
	init : function(el, config) {
		// Init futtatasa
		MessageIndex.superclass.init.call(this, el, config);
	},

    /**
     * Esemenykezelok feliratkozasa
     */
	bind : function() {
		MessageIndex.superclass.bind.call(this);
	},

    /**
     * Esemenykezelok torlese
     */
	unbind : function() {
		MessageIndex.superclass.unbind.call(this);
	}
});
