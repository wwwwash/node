import Chaos from '../../lib/chaos/Chaos';
import Portal from './PortalLayout';

export default function Error(el, config) {
	Error.superclass.constructor.call(this, el, config);
}

Chaos.extend(Error, Portal, {
    /**
     * Init
     *
     * @param {Element} el      This should be the body tag.
     * @param {Object} config   Config object of this component
     */
	init : function(el, config) {
        // Init futtatasa
		Error.superclass.init.call(this, el, config);
	},

    /**
     * Esemenykezelok feliratkozasa
     */
	bind : function() {
		Error.superclass.bind.call(this);
	},

    /**
     * Esemenykezelok torlese
     */
	unbind : function() {
		Error.superclass.unbind.call(this);
	}
});
