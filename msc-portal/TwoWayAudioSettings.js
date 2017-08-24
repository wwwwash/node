import Chaos from '../../../lib/chaos/Chaos';
import Page from '../../../lib/chaos/Page';

import Form from '../../_Form/Form';
import Http from '../../Http/Http';
import '../../_ToggleOnOff/ToggleOnOff';

import './TwoWayAudioSettings.scss';

export default function TwoWayAudioSettings(el, config) {
	TwoWayAudioSettings.superclass.constructor.call(this, el, config);
}

Chaos.extend(TwoWayAudioSettings, Page, {

	/** @var {String}         Disabled class of the switch button/option */
	switchButtonDisabledCls : 'disabled',

	/** @var {String}         Az settings kapcsolok kikapcsolt allapota*/
	_settingsSwitcherOffClass : 'off',

	/* UI elements */
	ui : {
		/** @var {String}      Az osszes setting kapcsolo */
		settingsSwitcher : '.switchOption, .switchButton',

		/** @var {String}      Az twoWayAudio kapcsolo formja */
		twoWayAudioSwitchForm : 'switchTwoWayAudio',

		/** @var {String}      Az twoWayAudio bekapcsolt allapotban megjeleno formja */
		twoWayAudioForm : 'changeAudioSettings',

		/** @var {String}      the switchcontainer */
		switchContainer : '.switchContainer',

		statusHeaderContainer : '#pageContainer .statusHeader'
	},

	/* Components */
	cmp : {
		form : {
			name : Form,
			el   : 'ui.twoWayAudioForm'
		}
	},

	/**
	 * Init
	 *
	 * @param {Element} el      This should be the body tag.
	 * @param {Object} config   Config object of this component
	 */
	init : function(el, config) {
		// Init futtatasa
		this.switchEl = document.querySelector('[data-is=toggle-on-off]');
		TwoWayAudioSettings.superclass.init.call(this, el, config);
	},

	/**
	 * A kapcsolohoz tartozo rejtett tartalom megjeleniteset vegzo funkcio.
	 * Kiegesziti a kapcsolo komponens mukodeset.
	 */
	onSettingSwitcherClick : function (isEnabled, tag) {
		let url = tag.root.dataset.url;

		if (!isEnabled) {
			this.ui.statusHeaderContainer.el().removeClass('active');
			this.ui.statusHeaderContainer.el().addClass('inactive');
			this.ui.twoWayAudioForm.el().removeClass('show');
		}
		else {
			this.ui.twoWayAudioForm.el().addClass('show');
			this.ui.statusHeaderContainer.el().removeClass('inactive');
			this.ui.statusHeaderContainer.el().addClass('active');
		}

		Http.post(url, {
			body : {
				isEnabled   : Number(isEnabled),
				performerId : ''
			}
		});
	},

	/**
	 * Esemenykezelok feliratkozasa
	 */
	bind : function() {
		TwoWayAudioSettings.superclass.bind.call(this);

		// A settinges kapcsolokhoz tartozo esemeny
		this.ui.settingsSwitcher.els().on('click', this.onSettingSwitcherClick, this);

		// Wait for switcher to mount
		setTimeout(() => this.switchEl._tag.on('change-once', ::this.onSettingSwitcherClick), 500);
	},

	/**
	 * Esemenykezelok torlese
	 */
	unbind : function() {
		this.autoUnbind();
	}
});
