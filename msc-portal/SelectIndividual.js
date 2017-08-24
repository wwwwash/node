import CONST from '../../../lib/constant/Constants';
import Chaos from '../../../lib/chaos/Chaos';
import ChaosObject from '../../../lib/chaos/Object';


export default function SelectIndividual(el, config) {
	SelectIndividual.superclass.constructor.call(this, el, config);
}

Chaos.extend(SelectIndividual, ChaosObject, {

	/**
	 * Overlay component instance coming from init config
	 *
	 * @type {Object} overlayCmp
	 */
	overlayCmp : undefined,

	/**
	 * Init
	 *
	 * @param {Element} el      This should be the body tag.
	 * @param {Object} config   Config object of this controller
	 */
	init : function(el, config) {
		this.ui = {
			searchInput : this.overlayCmp.getOverlayContentElement().select('.searchInput').item(0),
			searchClear : this.overlayCmp.getOverlayContentElement().select('.clearSearch').item(0)
		};

		this.searchClearCheckVisibility();

		SelectIndividual.superclass.init.call(this, el, config);
	},

	searchInputKeyUp : function(event) {
		var keyEnter = CONST.keyCode.ENTER;

		if (event.keyCode === keyEnter) {
			this.searchSend();
		}

		this.searchClearCheckVisibility();
	},

	searchClearCheckVisibility : function() {
		var value = this.ui.searchInput.getValue().trim();

		if (value.length > 0) {
			this.ui.searchClear.show();
		}
		else {
			this.ui.searchClear.hide();
		}
	},

	searchClearClick : function() {
		this.ui.searchInput.dom.value = '';
		this.searchSend();
	},

	searchSend : function() {
		var val = this.ui.searchInput.getValue().trim();
		var url = this.ui.searchInput.getAttribute('data-url');
		var key = this.ui.searchInput.getAttribute('name');

		var params = {};
		params[key] = val;

		this.overlayCmp.getOverlay(url, params);
	},

	bind : function() {
		SelectIndividual.superclass.bind.call(this);
		this.ui.searchInput.on('keyup', this.searchInputKeyUp, this);
		this.ui.searchClear.on('click', this.searchClearClick, this);
	},

	unbind : function() {
		this.ui.searchInput.un('keyup', this.searchInputKeyUp, this);
		this.ui.searchClear.un('click', this.searchClearClick, this);
		SelectIndividual.superclass.unbind.call(this);
	}
});
