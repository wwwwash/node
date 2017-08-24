/**
 * @param {jQuery} excludeOfflinePerformersButton
 * @param {jQuery} searchInput
 */
function Toolbar(excludeOfflinePerformersButton, searchInput) {
	console.log('Toolbar initialized.');

	/**
	 * @returns {Boolean}
	 */
	this.isExcludeOfflinePerformersCheckBoxChecked = function () {
		return excludeOfflinePerformersButton.is(':checked');
	};

	/**
	 * @returns {jQuery}
	 */
	this.getSearchInput = function () {
		return searchInput;
	};

	/**
	 * @param {DomainListTable} domainListTable
	 */
	this.onRefreshButtonClick = function (domainListTable) {
		domainListTable.refresh();
	};

	/**
	 * @param {DomainListTable} domainListTable
	 */
	this.onExcludeOfflinePerformersButtonClick = function (domainListTable) {
		domainListTable.refresh();
	};

	/**
	 * @param {string} timer
	 * @param {DomainListTable} domainListTable
	 *
	 * @returns {string}
	 */
	this.onSearchInputKeyUp = function (timer, domainListTable) {
		clearTimeout(timer);
		return setTimeout(domainListTable.refresh(), 500);
	};

	/**
	 * @param {string} timer
	 */
	this.onSearchInputKeyDown = function (timer) {
		clearTimeout(timer);
	};
}
