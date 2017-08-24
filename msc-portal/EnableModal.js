/**
 * @param {jQuery} modal
 */
function EnableModal(modal) {
	/** @type {int} */
	this.performerIdSelector = '.performer-id';
	/** @type {string} */
	this.screenNameSelector = '.screen-name';
	/** @type {int} */
	this.siteIdSelector = '.site-id';

	console.log('Enable modal initialized.');

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
	 * @param {string} screenName
	 */
	this.setScreenName = function (screenName) {
		modal.find(this.screenNameSelector).text(screenName);
	};

	/**
	 * @returns {string}
	 */
	this.getScreenName = function () {
		return modal.find(this.screenNameSelector).text();
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
	 * @param {jQuery}          enableButton
	 * @param {DomainListTable} domainListTable
	 *
	 * @returns {boolean}
	 */
	this.onConfirmEnableButtonClick = function (enableButton, domainListTable) {
		$.ajax({
			url  : enableButton.attr('data-enable-url'),
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
				domainListTable.refresh(1000);
				Notification.showSuccess('Website has been enabled');
			}
			else if (apiResponse.status === ApiResponse.STATUS_ERROR) {
				Notification.showError('API error: ' + apiResponse.errorMessage);
			}
			else {
				Notification.showError('Unknown error');
			}
		}.bind(this));

		return false;
	};
}
