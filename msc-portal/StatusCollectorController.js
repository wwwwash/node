import Chaos from '../../lib/chaos/Chaos';
import ChaosController from '../../lib/chaos/Controller';


/**
 * Status Collector Controller
 * ---------------------
 *
 * Search for dom items with 'pending' class and
 * push them back in an array
 *
 * @Dependency : MWHDocumentStatusChecker
 *
 */

export default function StatusCollectorController(el, config) {
	StatusCollectorController.superclass.constructor.call(this, el, config);
}

StatusCollectorController.EVENT_PENDING_IDS_COLLECTED = 'pending-ids-collected';

Chaos.extend(StatusCollectorController, ChaosController, {
	/** @var {String}   Component name */
	name : 'StatusCollectorController',

	/** @var {String}   Pending status class */
	convertingStatusSel : '.commonTabsContent.active .converting',

	/**
	 * Standard initializer
	 *
	 * @param {Object|String} el
	 * @param {Object} config
	 */
	init : function(el, config) {
		StatusCollectorController.superclass.init.call(this, el, config);
		this.addEvents(
			StatusCollectorController.EVENT_PENDING_IDS_COLLECTED
		);
	},

	/**
	 * Collect block id-s with pending_status
	 *
	 * @method collectPendingIds
	 *
	 * @return void;
	 */
	collectPendingMongoIds : function() {
		var pendingItems = this.element.select(this.convertingStatusSel),
			pendingIds = {};
		pendingItems.each(function() {
			pendingIds[this.dom.getAttribute('data-document-id')] = this.dom.getAttribute('data-media-type');
		});
		this.fireEvent(StatusCollectorController.EVENT_PENDING_IDS_COLLECTED, {
			pendingIds : pendingIds
		});
	},

	/**
	 * Initial bind method
	 *
	 * @return void
	 */
	bind : function() {
		StatusCollectorController.superclass.bind.call(this);
	},

	/**
	 * Initial unbind method
	 *
	 * @return void
	 */
	unbind : function() {
		StatusCollectorController.superclass.unbind.call(this);
	}
});