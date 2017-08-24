import Chaos from '../../lib/chaos/Chaos';

import ListFilterAbstract from './Abstract';
import Overlay from '../Overlay/Overlay';
import ModelsPage from '../Page/Models/Models';

/**
 *
 * ModelListFilter
 *
 */
export default function ModelListFilterComponent(el, config) {
	ModelListFilterComponent.superclass.constructor.call(this, el, config);
}

Chaos.extend(ModelListFilterComponent, ListFilterAbstract, {

	/** @var {String} searchFieldElementId           Id of the searchfield input element */
	searchFieldElementId : 'screenNameFilter',

	/** @var {String} listBlockSel                   class name of the list block */
	listBlockSel : '.modelList',

	/** @var {String} orderByElementId               Id of orderby select element */
	orderByElementId : 'orderBy-component',

	/** @var {String} clearBtnSel                    Selector of clear button in searchfield */
	clearBtnSel : '.clearLnk',

	/**
	 * Init
	 *
	 * @param {Element} el      This should be the body tag.
	 * @param {Object} config   Config object of this component
	 */
	init : function(el, config) {
		// Call superclass
		ModelListFilterComponent.superclass.init.call(this, el, config);
	},

	/**
	 * Renders the block depending on response
	 * @param response      Ajax response
	 *
	 * @return void
	 */
	renderResponseBlock : function(response) {
		ModelListFilterComponent.superclass.renderResponseBlock.call(this, response, true);

		//Refresh overlay elements
		Chaos.fireEvent(Overlay.UPDATE_OPEN_OVERLAY_ELEMENTS);
		//Refresh model filter list elements
		Chaos.fireEvent(ModelsPage.UPDATE_MODEL_DATA_ELEMENTS);
	},

	/**
	 * Binds events associated with this class
	 */
	bind : function() {
		// Call superclass
		ModelListFilterComponent.superclass.bind.call(this);
	},

	/**
	 * Unbinds events associated with this class
	 */
	unbind : function() {
		// Call superclass
		ModelListFilterComponent.superclass.unbind.call(this);
	}
});
