import Chaos from '../../lib/chaos/Chaos';
import Portal from './PortalLayout';

export default function ModelCenterSimple(el, config) {
	ModelCenterSimple.superclass.constructor.call(this, el, config);
}

Chaos.extend(ModelCenterSimple, Portal, {
	/**
	 * Init
	 *
	 * @param {Element} el      This should be the body tag.
	 * @param {Object} config   Config object of this component
	 */
	init : function(el, config) {
		// Init futtatasa
		ModelCenterSimple.superclass.init.call(this, el, config);
	},

	/**
	 * Esemenykezelok feliratkozasa
	 */
	bind : function() {
		ModelCenterSimple.superclass.bind.call(this);
	},

	/**
	 * Esemenykezelok torlese
	 */
	unbind : function() {
		ModelCenterSimple.superclass.unbind.call(this);
	}
});
