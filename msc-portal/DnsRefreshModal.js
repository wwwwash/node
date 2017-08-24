/**
 * @param {jQuery} modal
 */
function DnsRefreshModal(modal) {
	/** @type {int} */
	this.performerIdSelector = '.performer-id';
	/** @type {string} */
	this.domainSelector = '.domain';
	/** @type {int} */
	this.siteIdSelector = '.site-id';

	console.log('DNS refresh modal initialized.');

	this.show = function () {
		modal.modal();
	};

	this.hide = function () {
		modal.modal('hide');
	};

	/**
	 * @param {int} performerId
	 */
	this.setPerformerId = function (performerId) {
		modal.find(this.performerIdSelector).val(performerId);
	};

	/**
	 * @returns {int}
	 */
	this.getPerformerId = function () {
		return modal.find(this.performerIdSelector).val();
	};

	/**
	 * @param {string} domain
	 */
	this.setDomain = function (domain) {
		modal.find(this.domainSelector).text(domain);
	};

	/**
	 * @returns {string}
	 */
	this.getDomain = function () {
		return modal.find(this.domainSelector).text();
	};

	/**
	 * @param {int} siteId
	 */
	this.setSiteId = function (siteId) {
		modal.find(this.siteIdSelector).val(siteId);
	};

	/**
	 * @returns {int}
	 */
	this.getSiteId = function () {
		return modal.find(this.siteIdSelector).val();
	};

	/**
	 * @param {jQuery}          dnsRefreshButton
	 * @param {DomainListTable} domainListTable
	 *
	 * @returns {boolean}
	 */
	this.onConfirmDnsRefreshButtonClick = function (dnsRefreshButton, domainListTable) {
		$.ajax({
			url  : dnsRefreshButton.attr('data-refresh-url'),
			data : {
				performerId : this.getPerformerId(),
				siteId    		: this.getSiteId()
			}
		})
		.error(function(jqXHR, textStatus) {
			Notification.showError('API error: ' + textStatus);
		})
		.done(function(data) {
			var apiResponse = ApiResponse.createFromResponse(data);
			if (apiResponse.status === ApiResponse.STATUS_OK) {
				this.hide();
				domainListTable.refresh();
				Notification.showSuccess('DNS zone refreshed');
			}
			else if (apiResponse.status === ApiResponse.STATUS_ERROR) {
				Notification.showError('API error: ' + apiResponse.errorMessage);
			}
			else {
				Notification.showError('Unknown error.');
			}
		}.bind(this));

		return false;
	};
}
