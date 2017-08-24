import Chaos from '../../../lib/chaos/Chaos';
import ChaosObject from '../../../lib/chaos/Object';

import Snapshooter from '../../Snapshooter/Snapshooter';

/**
 * Overlay controller for the snapshooter overlay
 */
export default function Snapshot(el, config) {
	Snapshot.superclass.constructor.call(this, el, config);
}

Chaos.extend(Snapshot, ChaosObject, {

	/* String                       Snapshot keszito blokk szelektora*/
	_snapshoterBlockSel : '.snapshot',

	/**
	 * Init
	 *
	 * @param {Element} el      This should be the body tag.
	 * @param {Object} config   Config object of this controller
	 */
	init : function(el, config) {
		Snapshot.superclass.init.call(this, el, config);
		//Snapshot es uploader pedanyositasa
		this._snapshotBlockEl = this.element.select(this._snapshoterBlockSel).item(0);
		this._snapshooterCmp = new Snapshooter(this._snapshotBlockEl, {});
	},

	/**
	 * Binds events
	 */
	bind : function() {
		Snapshot.superclass.bind.call(this);
	},

	/**
	 * Unbind events
	 */
	unbind : function() {
		this.autoUnbind();
	}
});
