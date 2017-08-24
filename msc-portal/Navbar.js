/**
 * Internal navigation bar.
 */
function Navbar() {
	/** @type {string} Data consistency checker navigation link selector. */
	Navbar.NAV_LINK_DATA_CONSISTENCY_CHECKER = '#DataConsistencyCheckerNavLink';

	/** @type {string} Model White Label navigation link selector. */
	Navbar.NAV_LINK_MODEL_WHITE_LABEL = '#ModelWhiteLabelNavLink';

	/** @type {string} Motivator navigation link selector. */
	Navbar.NAV_LINK_MOTIVATOR = '#MotivatorNavLink';

	/** @type {string} Synchronization navigation link selector */
	Navbar.NAV_LINK_SYNCHRONIZATION = '#SynchronizationNavLink';

	/** @type {string[]} List of available navigation link selectors. */
	Navbar.navigationLinks = [
		Navbar.NAV_LINK_DATA_CONSISTENCY_CHECKER,
		Navbar.NAV_LINK_MODEL_WHITE_LABEL,
		Navbar.NAV_LINK_MOTIVATOR,
		Navbar.NAV_LINK_SYNCHRONIZATION
	];

	/** @type {string} Exit button selector. */
	this.exitButton = '#ExitButton';

	/** @type {string} Confirm exit button selector. */
	this.confirmExitButton = '#ConfirmExitButton';

	/** @type {string} Confirm exit modal selector. */
	this.confirmExitModal = '#ConfirmExitModal';

	// Bind exit button click.
	$(this.exitButton).click(function (event) {
		event.preventDefault();
		$(this.confirmExitModal).modal();
	}.bind(this));

	// Bind confirm exit button click.
	$(this.confirmExitButton).click(function () {
		window.location.href = $(this.exitButton).attr('href');
	}.bind(this));

	console.log('Navbar initialized.');

	/**
	 * Activates the given navigation link.
	 *
	 * @param {string} navigationLink
	 *
	 * @throws Exception
	 */
	Navbar.activateNavLink = function (navigationLink) {
		if (Navbar.navigationLinks.indexOf(navigationLink) === -1)			{throw new Error('Invalid navigation link received: ' + navigationLink)}

		Navbar.navigationLinks.forEach(function (item) {
			$(item).removeClass('active');
		});

		$(navigationLink).addClass('active');
	};
}

