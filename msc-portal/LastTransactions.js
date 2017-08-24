import Ext from '../../../lib/vendor/ExtCore';
import Chaos from '../../../lib/chaos/Chaos';
import Page from '../../../lib/chaos/Page';
import CONST from '../../../lib/constant/Constants';

import ShowMoreInfo from '../../ShowMore/ShowMore';

import '../Models/Models.scss';

export default function LastTransactions(el, config) {
	LastTransactions.superclass.constructor.call(this, el, config);
}

Chaos.extend(LastTransactions, Page, {
    /**
     * Init
     *
     * @param {Element} el      This should be the body tag.
     * @param {Object} config   Config object of this component
     */
	init : function(el, config) {
        //Stat info ajaxos komponenst
		var container = Ext.get('statisticContent');
		var list = container ? container.select('.tableSummarizeContentCell') : null;

		if (list && list.getCount() > 0) {
            //A show more lenyito peldanyositasa
			new ShowMoreInfo(container, {
				list                : list,
				listItemClass       : '.tableSummarizeContentCell',
				requestMethod       : CONST.POST,
				responseType        : CONST.TYPE_JSON,
				iconClassName       : 'icon-angle-down',
				iconToggleClassName : 'icon-angle-up'
			});
		}

        // Init futtatasa
		LastTransactions.superclass.init.call(this, el, config);
	},


    /**
     * Esemenykezelok feliratkozasa
     */
	bind : function() {
		LastTransactions.superclass.bind.call(this);
	},

    /**
     * Esemenykezelok torlese
     */
	unbind : function() {
		LastTransactions.superclass.unbind.call(this);
	}
});
