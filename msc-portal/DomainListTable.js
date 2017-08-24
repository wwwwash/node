/**
 * Domain list table class.
 *
 * @param {DataTables.DataTable} dataTable
 * @param {Toolbar}              toolBar
 */
function DomainListTable(dataTable, toolBar) {
	const COLUMN_SCREEN_NAME = 1;
	const COLUMN_DOMAIN_NAME = 2;
	const COLUMN_ONLINE_STATUS = 4;

	console.log('Domain list table initialized.');

	/**
	 * @param {int} [delay] Refresh delay in milliseconds.
	 */
	this.refresh = function (delay) {
		delay = delay || 0;

		var onlineStatusFilter = toolBar.isExcludeOfflinePerformersCheckBoxChecked() ? [1, 2, 3] : '';

		dataTable.column(COLUMN_ONLINE_STATUS).search(onlineStatusFilter);

		var searchValue = toolBar.getSearchInput().val().length >= 3 ? toolBar.getSearchInput().val() : '';

		dataTable.column(COLUMN_SCREEN_NAME).search(searchValue);
		dataTable.column(COLUMN_DOMAIN_NAME).search(searchValue);

		setTimeout(function () {dataTable.draw(false)}, delay);
	};

	/**
	 * @param {jQuery}      revertButton
	 * @param {RevertModal} revertModal
	 */
	this.onRevertButtonClick = function (revertButton, revertModal) {
		revertModal.setScreenName(revertButton.attr('data-screen-name'));
		revertModal.show();
	};

	/**
	 * @param {jQuery}       disableButton
	 * @param {DisableModal} disableModal
	 */
	this.onDisableButtonClick = function (disableButton, disableModal) {
		disableModal.setPerformerId(disableButton.attr('data-performer-id'));
		disableModal.setScreenName(disableButton.attr('data-screen-name'));
		disableModal.setSiteId(disableButton.attr('data-site-id'));
		disableModal.setRedirectUrl('https://www.livejasmin.com');

		disableModal.show();
	};

	/**
	 * @param {jQuery}      enableButton
	 * @param {EnableModal} enableModal
	 */
	this.onEnableButtonClick = function (enableButton, enableModal) {
		enableModal.setScreenName(enableButton.attr('data-screen-name'));
		enableModal.setPerformerId(enableButton.attr('data-performer-id'));
		enableModal.setSiteId(enableButton.attr('data-site-id'));

		enableModal.show();
	};

	/**
	 * @param {jQuery}          dnsRefreshButton
	 * @param {DnsRefreshModal} dnsRefreshModal
	 */
	this.onDnsRefreshButtonClick = function (dnsRefreshButton, dnsRefreshModal) {
		dnsRefreshModal.setPerformerId(dnsRefreshButton.attr('data-performer-id'));
		dnsRefreshModal.setSiteId(dnsRefreshButton.attr('data-site-id'));
		dnsRefreshModal.setDomain(dnsRefreshButton.attr('data-domain'));

		dnsRefreshModal.show();
	};
}
