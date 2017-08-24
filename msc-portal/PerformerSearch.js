/**
 * @param {jQuery} input
 */
function PerformerSearch(input) {
	this.serviceUrlAttributeName = 'data-service-url';

	input.autocomplete({
		minLength : 3,
		delay     : 500,
		source    : function (request, response) {
			$.ajax({
				url     : input.attr(this.serviceUrlAttributeName),
				data    : { term : request.term },
				success : function(data) {
					var apiResponse = ApiResponse.createFromResponse(data);
					if (apiResponse.status === ApiResponse.STATUS_OK) {
						response(apiResponse.data);
					}
					else if (apiResponse.status === ApiResponse.STATUS_ERROR) {
						Notification.showError('API error: ' + apiResponse.errorMessage);
						response([]);
					}
					else {
						Notification.showError('Unknown error.');
						response([]);
					}
				},
				error : function (jqXHR) {
                	var response = ApiResponse.createFromJqXHR(jqXHR);
					Notification.showError('API error: ' + response.errorMessage);
				},
				dataType : 'json'
			});
		}.bind(this),
		select : function() {
			this.markInputAsValid();
		}.bind(this)
	});

	input.keydown(function (event) {
		this.onInputKeyDown(event);
	}.bind(this));

	console.log('Performer search initialized.');

	/**
	 * @param {object} event
	 */
	this.onInputKeyDown = function(event) {
		if (event.keyCode >= 46) {
			this.markInputAsInvalid();
		}
	};

	this.markInputAsValid = function() {
		input.removeClass('invalid');
		input.addClass('valid');
	};

	this.markInputAsInvalid = function() {
		input.removeClass('valid');
		input.addClass('invalid');
	};
}
