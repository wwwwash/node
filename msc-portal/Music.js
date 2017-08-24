import Chaos from '../../lib/chaos/Chaos';
import { Broadcaster } from '../../lib/chaos/Broadcaster';

import ListFilterAbstract from './Abstract';
import ModelListFilter from './Model';
import Overlay from '../Overlay/Overlay';
import MembersPage from '../Page/Members/Members';

/**
 *
 * MusicListFilter
 *
 */

export default function MusicListFilterComponent(el, config) {
	MusicListFilterComponent.superclass.constructor.call(this, el, config);
}

//Global Events
MusicListFilterComponent.REINIT_MUSIC_COMPONENTS = 'music-reinit';

Chaos.extend(MusicListFilterComponent, ListFilterAbstract, {

	/** @var {String} searchFieldElementId           Id of the searchfield input element */
	searchFieldElementId : 'musicNameFilter',

	/** @var {String} listBlockSel                   class name of the list block */
	listBlockSel : '.musiclist',

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
		// Adding the events
		Chaos.addEvents(
			MusicListFilterComponent.REINIT_MUSIC_COMPONENTS
		);
		//Call superclass
		MusicListFilterComponent.superclass.init.call(this, el, config);
	},

	/**
	 * Renders the block depending on response
	 * @param response      Ajax response
	 *
	 * @return void
	 */
	renderResponseBlock : function(response) {
		ModelListFilter.superclass.renderResponseBlock.call(this, response, true);

		if (this._listBlockEls.elements.length) {
			// Sending global event for reinit music components
			Broadcaster.fireEvent(MusicListFilterComponent.REINIT_MUSIC_COMPONENTS, {});
		}

		//Refresh overlay elements
		Chaos.fireEvent(Overlay.UPDATE_OPEN_OVERLAY_ELEMENTS);
		//Refresh member filter list elements
		Chaos.fireEvent(MembersPage.UPDATE_MEMBER_DATA_ELEMENTS);
	},

	/**
	 * Binds events associated with this class
	 */
	bind : function() {
		// Call superclass
		MusicListFilterComponent.superclass.bind.call(this);
	},

	/**
	 * Unbinds events associated with this class
	 */
	unbind : function() {
		// Call superclass
		MusicListFilterComponent.superclass.unbind.call(this);
	}
});
