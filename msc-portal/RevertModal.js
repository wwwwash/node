/**
 * @param {jQuery} modal
 */
function RevertModal(modal) {
	/** @type {string} */
	this.screenNameSelector = '.screen-name';

	console.log('Revert modal initialized.');

	this.show = function () {
		modal.modal();
	};

	this.hide = function () {
		modal.modal('hide');
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
	 * @param {jQuery}          confirmRevertButton
	 * @param {DomainListTable} domainListTable
	 *
	 * @returns {boolean}
	 */
	this.onConfirmRevertButtonClick = function (confirmRevertButton, domainListTable) {
		$.ajax({
			url  : confirmRevertButton.attr('data-revert-url'),
			data : {
				screenName : this.getScreenName()
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
				Notification.showSuccess('Website has been reverted');
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
