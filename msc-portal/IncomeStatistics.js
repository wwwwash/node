import Ext from '../../../lib/vendor/ExtCore';
import Chaos from '../../../lib/chaos/Chaos';
import Page from '../../../lib/chaos/Page';
import CONST from '../../../lib/constant/Constants';

import Form from '../../_Form/Form';
import Calendar from '../../Calendar/Calendar';
import SalesStatsShowMoreInfo from '../../SalesStats/SalesStatsShowMoreInfo';
import HorizontalScroll from '../../Scroll/HorizontalScroll';

import '../Payout/Payout.scss';

export default function IncomeStatisticsIndex(el, config) {
	IncomeStatisticsIndex.superclass.constructor.call(this, el, config);
}

Chaos.extend(IncomeStatisticsIndex, Page, {

	/** @var {String} name          Name of the class */
	name : 'incomestatistics',

	ui : {
		pageContainer            : 'pageContainer',
		salesDataTableContainer  : 'salesDataTableContainer',
		salesDataTable           : 'salesDataContainer',
		salesDataScrollContainer : 'salesDataScrollContainer',
		salesStatsTableRows      : '#salesStatsTable .tableRow',
		salesDataTableRows       : '#salesDataContainer .tableRow',
		summarizeCells           : '.tableSummarizeContentCell',
		selectSalesStatPeriodBox : 'selectSalesStatPeriodBox',
		fromDate                 : 'fromDate',
		toDate                   : 'toDate'
	},

	cmp : {
		form : {
			name : Form,
			el   : 'ui.selectSalesStatPeriodBox'
		},
		fromDate : {
			name : Calendar,
			el   : 'ui.fromDate',
			opts : {
				_periodObject : {
					periodStartInputId : 'fromDate',
					periodEndInputId   : 'toDate'
				}
			}
		},
		toDate : {
			name : Calendar,
			el   : 'ui.toDate',
			opts : {
				_periodObject : {
					periodStartInputId : 'fromDate',
					periodEndInputId   : 'toDate'
				}
			}
		},
		salesStatsShowMore : {
			name : SalesStatsShowMoreInfo,
			el   : 'ui.pageContainer',
			opts : {
				listItemClass       : '.tableSummarizeContentCell',
				requestMethod       : CONST.POST,
				responseType        : CONST.TYPE_JSON,
				iconClassName       : 'linkArrowDown',
				iconToggleClassName : 'linkArrowUp'
			}
		},
		horizontalScroll : {
			name : HorizontalScroll,
			el   : 'ui.salesDataTableContainer',
			opts : {
				containerId    : 'salesDataScrollContainer',
				contentId      : 'salesDataContainer',
				tpl            : `<div class="scroll-pane-horizontal"><div class="scrollbar"><span class="icon horizontalScrollIcon"></span></div></div>`,
				scrollBarClass : 'scrollbar'
			},
			sleep : true
		}
	},

	/**
	 * Init
	 *
	 * @param {Element} el      This should be the body tag.
	 * @param {Object} config   Config object of this component
	 */
	init : function (el, config) {
		IncomeStatisticsIndex.superclass.init.call(this, el, config);

		if (this.ui.salesDataTable.el().getWidth() > this.ui.salesDataScrollContainer.el().getWidth()) {
			this.horizontalScroll.start();
		}

		// Sets the second table's rows height according to the first table's rows height.
		this.ui.salesStatsTableRows.els().each(function(element, elements, index) {
			element = Ext.get(element.dom);
			var rowHeight = element.getHeight();

			this.ui.salesDataTableRows.els().item(index).setHeight(rowHeight);
		}.bind(this));
	}
});
