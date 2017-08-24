/**
 * Data Consistency Checker.
 */
function ConsistencyChecker() {
	const ACCOUNT_TYPE_STUDIO = 'studio';
	const ACCOUNT_TYPE_PERFORMER = 'performer';

	const ACCOUNT_TYPE_SELECTOR_STUDIO = 'AccountType_Studio';
	const ACCOUNT_TYPE_SELECTOR_PERFORMER = 'AccountType_Performer';

	const ACCOUNT_ID_STUDIO_PLACEHOLDER_TEXT = 'Enter studio id...';
	const ACCOUNT_ID_PERFORMER_PLACEHOLDER_TEXT = 'Enter performer id...';

	const NODE_ANIMATION_CLASS = 'zoomInDown';

	/** /** @type {jQuery} */
	var accountTypeCheckBox = $('input[name=AccountType]');

	/** @type {jQuery} */
	var accountIdInput = $('#AccountId');

	/** @type {jQuery} */
	var startConsistencyCheckButton = $('#StartConsistencyCheck');

	/** @type {jQuery} */
	var progressBar = $('#ProgressBar');

	/** @type {jQuery} */
	var resultContainer = $('#ResultContainer');

	/** @type {jQuery} */
	var nodeTemplate = $($('#NodeTemplate').html());

	/** @type {jQuery} */
	var spinnerTemplate = $($('#SpinnerTemplate').html());

	/** @type {jQuery} */
	var successIndicatorTemplate = $($('#SuccessIndicatorTemplate').html());

	/** @type {jQuery} */
	var errorIndicatorTemplate = $($('#ErrorIndicatorTemplate').html());

	accountTypeCheckBox.change(function (event) {
		var placeholderText = event.currentTarget.id == ACCOUNT_TYPE_SELECTOR_PERFORMER
			? ACCOUNT_ID_PERFORMER_PLACEHOLDER_TEXT
			: ACCOUNT_ID_STUDIO_PLACEHOLDER_TEXT;

		accountIdInput.attr('placeholder', placeholderText);
	});

	startConsistencyCheckButton.click(function () {
		this.startProcess();
	}.bind(this));

	console.log('Data Consistency Checker initialized.');

	this.startProcess = function () {
		var accountId = getSelectedAccountId();
		var accountType = getSelectedAccountType();

		startConsistencyCheckButton.attr('disabled', true);
		progressBar.show();

		Notification.showInfo(
			StringHelper.capitalizeFirstLetter(accountType) + ' consistency check started.'
		);

		switch (accountType) {
			case ACCOUNT_TYPE_STUDIO:
				startStudioCheckProcess(accountId);
				break;

			case ACCOUNT_TYPE_PERFORMER:
				startPerformerCheckProcess(accountId);
				break;

			default:
				progressBar.hide();

				throw new Error('Invalid account type received: ' + accountType);
		}
	};

	/**
	 * @param {Number} studioId
	 */
	var startStudioCheckProcess = function (studioId) {
		initContainerForStudioCheck(studioId).then(function (performerList) {
			checkStudio(studioId, performerList).then(function (performerList) {
				addPerformersNode(performerList).then(function (performerList) {
					checkPerformers(performerList, 0, new $.Deferred()).then(function () {
						startConsistencyCheckButton.attr('disabled', false);
						progressBar.hide();
						Notification.showInfo('Consistency check finished.');
					});
				});
			});
		});
	};

	/**
	 * @param {Number} performerId
	 */
	var startPerformerCheckProcess = function (performerId) {
		resultContainer.html('');
		getPerformer(performerId).then(function (performer) {
			var performerList = [];
			addPerformersNode(performerList).then(function () {
				addPerformerNode(performer.performer).then(function () {
					startConsistencyCheckButton.attr('disabled', false);
					progressBar.hide();
					Notification.showInfo('Consistency check finished.');
				});
			});
		});
	};

	/**
	 * @param {Number} studioId
	 *
	 * @return {jQuery.promise}
	 */
	var initContainerForStudioCheck = function (studioId) {
		resultContainer.html('');
		var dfd = new $.Deferred();

		getStudio(studioId)
			.then(function (studioData) {
				var studio = studioData.studio;

				addStudioNode(studio.studio_name)
					.then(function () {
						dfd.resolve(studioData.performerList);
					});
			})
			.fail(function (error) {
				dfd.reject(error);
			});

		return dfd.promise();
	};

	/**
	 * @param {Number} studioId
	 * @param {object} performerList
	 *
	 * @return {jQuery.promise}
	 */
	var checkStudio = function (studioId, performerList) {
		var dfd = new $.Deferred();
		var studioNode = $('#StudioNode');

		studioNode.find('.list-group-item').addClass('list-group-item-info');
		studioNode.find('.label-pill').html(spinnerTemplate.clone());

		$.ajax({
			url  : startConsistencyCheckButton.attr('data-url-check-studio'),
			data : {
				studioId : studioId
			}
		})
		.error(function (jqXHR, textStatus) {
			progressBar.hide();
			Notification.showError('API error: ' + textStatus);
			dfd.reject(new Error('API error: ' + textStatus));
		})
		.done(function (data) {
			var apiResponse = ApiResponse.createFromResponse(data);
			if (apiResponse.status === ApiResponse.STATUS_ERROR) {
				progressBar.hide();
				Notification.showError('API error: ' + apiResponse.errorMessage);
				dfd.reject(new Error('API error: ' + apiResponse.errorMessage));
			}

			updateStudioNodeWithResult(
				apiResponse.data.result,
				apiResponse.data.diff,
				apiResponse.data.context
			);

			dfd.resolve(performerList);
		});

		return dfd.promise();
	};

	/**
	 * @param {Array}           performerList
	 * @param {Number}          currentIndex
	 * @param {jQuery.Deferred} dfd
	 *
	 * @return {jQuery.Promise}
	 */
	var checkPerformers = function (performerList, currentIndex, dfd) {
		var performerId = Object.keys(performerList)[currentIndex];
		var performer = performerList[performerId];

		addPerformerNode(performer).then(function () {
			if (currentIndex == Object.keys(performerList).length - 1) {
				dfd.resolve();
			}
			else {
				return checkPerformers(performerList, ++currentIndex, dfd);
			}
		});

		return dfd.promise();
	};

	/**
	 * @param {Number} performerId
	 *
	 * @return {jQuery.promise}
	 */
	var checkPerformer = function (performerId) {
		var dfd = new $.Deferred();
		var performerNode = $('#PerformerNode_' + performerId);

		performerNode.find('.list-group-item').addClass('list-group-item-info');
		performerNode.find('.label-pill').html(spinnerTemplate.clone());

		$.ajax({
			url  : startConsistencyCheckButton.attr('data-url-check-performer'),
			data : {
				performerId : performerId
			}
		})
		.error(function (jqXHR, textStatus) {
			progressBar.hide();
			Notification.showError('API error: ' + textStatus);
			dfd.reject(new Error('API error: ' + textStatus));
		})
		.done(function (data) {
			var apiResponse = ApiResponse.createFromResponse(data);
			if (apiResponse.status === ApiResponse.STATUS_ERROR) {
				progressBar.hide();
				Notification.showError('API error: ' + apiResponse.errorMessage);
				dfd.reject(new Error('API error: ' + apiResponse.errorMessage));
			}

			updatePerformerNodeWithResult(
				performerId,
				apiResponse.data.result,
				apiResponse.data.diff,
				apiResponse.data.context
			);

			dfd.resolve();
		});

		return dfd.promise();
	};

	/**
	 * @param {String} studioName
	 *
	 * @returns {jQuery.promise}
	 */
	var addStudioNode = function (studioName) {
		var dfd = new $.Deferred();
		var template = getNodeTemplate('StudioNode');
		template.find('.list-group-item').addClass('studio');
		template.find('.entityName').text(studioName);

		resultContainer.append(template);
		template.addClass('animated ' + NODE_ANIMATION_CLASS);
		template.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function () {
			dfd.resolve();
		});

		return dfd.promise();
	};

	/**
	 * @param {object} performerList
	 *
	 * @return {jQuery.promise}
	 */
	var addPerformersNode = function (performerList) {
		var dfd = new $.Deferred();
		var template = getNodeTemplate('PerformersNode');
		template.find('.list-group-item').addClass('performers indent-level-1');
		template.find('.entityName').text('Performers');

		resultContainer.append(template);
		template.addClass('animated ' + NODE_ANIMATION_CLASS);
		template.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function () {
			dfd.resolve(performerList);
		});

		return dfd.promise();
	};

	/**
	 * @param {object} performer
	 *
	 * @returns {jQuery.promise}
	 */
	var addPerformerNode = function (performer) {
		var dfd = new $.Deferred();
		var performerId = performer.hasOwnProperty('performer_id') ? performer.performer_id : performer.id;
		var screenName = performer.screen_name;
		var template = getNodeTemplate('PerformerNode_' + performerId);
		template.find('.list-group-item').addClass('performer indent-level-2');
		template.find('.entityName').text(screenName);

		$('#PerformersNode').append(template);
		template.addClass('animated ' + NODE_ANIMATION_CLASS);
		template.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function () {
			checkPerformer(performerId)
				.then(function () {
					dfd.resolve(performerId);
				});
		});

		return dfd.promise();
	};

	/**
	 * @param {boolean} result
	 * @param {object}  diff
	 * @param {object} context
	 */
	var updateStudioNodeWithResult = function (result, diff, context) {
		var studioNode = $('#StudioNode');
		var resultClass = result ? 'list-group-item-success' : 'list-group-item-danger';
		var indicatorTemplate = result ? getSuccessIndicatorTemplate() : getErrorIndicatorTemplate(diff, context);

		studioNode.find('.list-group-item').removeClass('list-group-item-info').addClass(resultClass);
		studioNode.find('.label-pill').html(indicatorTemplate);
	};

	/**
	 * @param {number} performerId
	 * @param {boolean} result
	 * @param {object}  diff
	 * @param {object} context
	 */
	var updatePerformerNodeWithResult = function (performerId, result, diff, context) {
		var performerNode = $('#PerformerNode_' + performerId);
		var resultClass = result ? 'list-group-item-success' : 'list-group-item-danger';
		var indicatorTemplate = result ? getSuccessIndicatorTemplate() : getErrorIndicatorTemplate(diff, context);

		performerNode.find('.list-group-item').removeClass('list-group-item-info').addClass(resultClass);
		performerNode.find('.label-pill').html(indicatorTemplate);
	};

	/**
	 * @param {String} id
	 *
	 * @returns {jQuery}
	 */
	var getNodeTemplate = function (id) {
		var template = nodeTemplate.clone();
		template.attr('id', id);

		return template;
	};

	/**
	 * @return {jQuery}
	 */
	var getSuccessIndicatorTemplate = function () {
		return successIndicatorTemplate.clone();
	};

	/**
	 * @param {object} diff
	 * @param {object} context
	 *
	 * @return {jQuery}
	 */
	var getErrorIndicatorTemplate = function (diff, context) {
		var template = errorIndicatorTemplate.clone();
		template.find('.errorDetails').data('context', context);
		template.find('.errorDetails').data('diff', diff);
		template.find('.numberOfErrors').text(Object.keys(diff).length);

		return template;
	};

	/**
	 * @returns {Number}
	 */
	var getSelectedAccountId = function () {
		var accountId = parseInt(accountIdInput.val());

		if (isNaN(accountId)) {
			Notification.showError('No account id provided.');
			throw new Error('No account id provided.');
		}

		return accountId;
	};

	/**
	 * @returns {String}
	 */
	var getSelectedAccountType = function () {
		switch (accountTypeCheckBox.filter('input:checked').attr('id')) {
			case ACCOUNT_TYPE_SELECTOR_PERFORMER:
				return ACCOUNT_TYPE_PERFORMER;

			case ACCOUNT_TYPE_SELECTOR_STUDIO:
				return ACCOUNT_TYPE_STUDIO;

			default:
				Notification.showError('No account type selected.');
				throw new Error('No account type selected.');
		}
	};

	/**
	 * @param {Number} studioId
	 *
	 * @returns {jQuery.promise}
	 */
	var getStudio = function (studioId) {
		var dfd = new $.Deferred();
		$.ajax({
			url  : startConsistencyCheckButton.attr('data-url-get-studio'),
			data : {
				studioId : studioId
			}
		})
		.error(function (jqXHR, textStatus) {
			progressBar.hide();
			Notification.showError('API error: ' + textStatus);
			dfd.reject(new Error('API error: ' + textStatus));
		})
		.done(function (data) {
			var apiResponse = ApiResponse.createFromResponse(data);
			if (apiResponse.status === ApiResponse.STATUS_ERROR) {
				progressBar.hide();
				Notification.showError('API error: ' + apiResponse.errorMessage);
				dfd.reject(new Error('API error: ' + textStatus));
			}
			dfd.resolve(apiResponse.data);
		});

		return dfd.promise();
	};

	/**
	 * @param {Number} performerId
	 *
	 * @return {jQuery.promise}
	 */
	var getPerformer = function (performerId) {
		var dfd = new $.Deferred();
		$.ajax({
			url  : startConsistencyCheckButton.attr('data-url-get-performer'),
			data : {
				performerId : performerId
			}
		})
		.error(function (jqXHR, textStatus) {
			progressBar.hide();
			Notification.showError('API error: ' + textStatus);
			dfd.reject(new Error('API error: ' + textStatus));
		})
		.done(function (data) {
			var apiResponse = ApiResponse.createFromResponse(data);
			if (apiResponse.status === ApiResponse.STATUS_ERROR) {
				progressBar.hide();
				Notification.showError('API error: ' + apiResponse.errorMessage);
				dfd.reject(new Error('API error: ' + textStatus));
			}
			dfd.resolve(apiResponse.data);
		});

		return dfd.promise();
	};
}
