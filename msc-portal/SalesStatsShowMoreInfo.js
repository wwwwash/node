import Ext from '../../lib/vendor/ExtCore';
import Chaos from '../../lib/chaos/Chaos';

import ShowMoreInfo from '../ShowMore/ShowMoreInfo';
import GlobalProgressIndicator from '../ProgressIndicator/GlobalProgressIndicator';

/**
 *
 * SalesStatsShowMoreInfo : Special data handling child for ShowMoreInfo in Sales Statistics page.
 *
 */
export default function SalesStatsShowMoreInfo(el, config) {
	SalesStatsShowMoreInfo.superclass.constructor.call(this, el, config);
}

Chaos.extend(SalesStatsShowMoreInfo, ShowMoreInfo, {

	/** @var {String}       Table rows that are not details rows */
	notDetailsRowSel : 'tr:not(.detailsRow)',
	/** @var {String}       Total table ID */
	totalTableId     : 'salesStatsTable',
	/** @var {String}       Pretence table ID */
	pretenceTableId  : 'salesDataContainer',
	/** @var {String}       Class on detail rows (drop-down lines) */
	detailsRowCls    : 'detailsRow',
	/** @var {Number}       Delay before showing ajax loader */
	ajaxLoaderDelay  : 100,

	/**
	 * Init
	 *
	 * @param {Element} el      This should be the body tag.
	 * @param {Object} config   Config object of this component
	 */
	init : function(el, config) {
		this.list = this.element.select(this.listItemClass);

		if (!this.list || this.list.getCount() < 1) {
			return;
		}

		SalesStatsShowMoreInfo.superclass.init.call(this, el, config);
	},

	/**
	 * Handles the success ajax call of the get details function
	 *
	 * @param response
	 * @param request
	 */
	ajaxSuccessHandler : function(response, request) {
		this._showMoreAjaxRequestRunning = false;
		Chaos.fireEvent(GlobalProgressIndicator.GLOBALEVENT_HIDE_INDICATOR);

		var responseText = JSON.parse(response.responseText).data;

		// Get the index of the row that we clicked.
		var trs = request.targetTr.parent().select(this.notDetailsRowSel),
			// Starts from 1 because of the table header
			rowIndex = parseInt(trs.indexOf(request.targetTr), 10),
			totalTableEl = Ext.get(this.totalTableId),
			pretenceTableEl = Ext.get(this.pretenceTableId),
			// are details opened down ?
			openedDetails = request.targetTr.next().hasClass(this.detailsRowCls);

		if (!openedDetails) {
			// Generate total table
			var pretenceTotalsHtml = responseText.pretenceTotalBlock;

			this.attachContent(totalTableEl, rowIndex, pretenceTotalsHtml);

			// Generate pretence table
			var pretenceEarningsHtml = responseText.earningsByDayBlock;

			this.attachContent(pretenceTableEl, rowIndex, pretenceEarningsHtml);

			this.contentList[this.actualTarget.data('id')] = this.element.select('.detailsRow{display!=none}');
		}
	},

	/**
	 * Attach html content to the given table's X indexed row
	 *
	 * @param table Context table
	 * @param rowIndex Row index after we want to inject detail rows
	 * @param content Conent to append
	 */
	attachContent : function(table, rowIndex, content) {
		var	trs = table.select(this.notDetailsRowSel);
		trs.item(rowIndex).dom.insertAdjacentHTML('afterend', content);

		if (this.iconElement && this.iconElement.hasClass(this.iconClassName)) {
			this.iconElement.removeClass(this.iconClassName);
			this.iconElement.addClass(this.iconToggleClassName);
		}
	},

	bind : function() {
		SalesStatsShowMoreInfo.superclass.bind.call(this);
	},

	unbind : function() {
		SalesStatsShowMoreInfo.superclass.unbind.call(this);
	}
});
