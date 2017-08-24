import Chaos from '../../lib/chaos/Chaos';

import ListFilterAbstract from './Abstract';
import Overlay from '../Overlay/Overlay';
import MembersPage from '../Page/Members/Members';

/**
 *
 * MemberListFilter
 *
 */
export default function MemberListFilter(el, config) {
	MemberListFilter.superclass.constructor.call(this, el, config);
}

Chaos.extend(MemberListFilter, ListFilterAbstract, {

	/** @var {String} searchFieldElementId           Id of the searchfield input element */
	searchFieldElementId : 'memberNameFilter',

	/** @var {String} listBlockSel                   class name of the list block */
	listBlockSel : '.memberList',

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
		//Call superclass
		MemberListFilter.superclass.init.call(this, el, config);
	},

	/**
	 * Renders the block depending on response
	 * @param response      Ajax response
	 *
	 * @return void
	 */
	renderResponseBlock : function(response) {
		MemberListFilter.superclass.renderResponseBlock.call(this, response, true);

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
		MemberListFilter.superclass.bind.call(this);
	},

	/**
	 * Unbinds events associated with this class
	 */
	unbind : function() {
		// Call superclass
		MemberListFilter.superclass.unbind.call(this);
	}
});
