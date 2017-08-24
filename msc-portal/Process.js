import Ext from '../../../lib/vendor/ExtCore';
import Chaos from '../../../lib/chaos/Chaos';
import ChaosObject from '../../../lib/chaos/Object';
import Form from '../../_Form/Form';

/**
 * Parent Controller for the confirm overlays
 */
export default function Process(el, config) {
	Process.superclass.constructor.call(this, el, config);
}

Chaos.extend(Process, ChaosObject, {
	/**
	 * Init
	 *
	 * @param {Element} el      This should be the body tag.
	 * @param {Object} config   Config object of this controller
	 */
	init : function(el, config) {
		this._form = new Form(
			Ext.get('migrationFinishProcess'),
			{}
		);

		Process.superclass.init.call(this, el, config);
	},

	/**
	 * Binds events
	 */
	bind : function() {
		Process.superclass.bind.call(this);
	},

	/**
	 * Unbind events
	 */
	unbind : function() {
		Process.superclass.unbind.call(this);
	}
});
