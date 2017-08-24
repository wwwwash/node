import Ext from '../../../lib/vendor/ExtCore';
import Chaos from '../../../lib/chaos/Chaos';
import ChaosObject from '../../../lib/chaos/Object';
import { InitRiot } from '../../App/App';

import Form from '../../_Form/Form';
import Http from '../../Http/Http';
import '../../_ToggleOnOff/ToggleOnOff';

import './AccountSettings.scss';

export default function AccountSettings(el, config) {
	AccountSettings.superclass.constructor.call(this, el, config);
}

Chaos.extend(AccountSettings, ChaosObject, {

	setPwdRowId : 'setPwdRow',

	formId : 'accountSettingsContent',

	showAllModelEl : undefined,

	limitStudioAccessEl : undefined,

	/**
	 * @param {Element} el
	 * @param {Object} config   Config object of this controller
	 */
	init : function(el, config) {
		InitRiot(el.dom);

		// Toggle On/Off
		this.showAllModelEl = el.dom.querySelector('div[name=showOther]');
		this.limitStudioAccessEl = el.dom.querySelector('div[name=limitedStudioAccess]');

		new Form(
			Ext.get(this.formId),
			{}
		);

		AccountSettings.superclass.init.call(this, el, config);
	},

	onShowAllModelChange : function(isEnabled) {
		Http.post('PropertySettings/SetShowOtherAccountsPost', {
			body : {
				isEnabled   : Number(isEnabled),
				performerId : '',
				isOverlay   : 1
			}
		});
	},

	onLimitedStudioAccessChange : async function(isEnabled) {
		let response = await Http.post('AccountSettings/SetLimitedAccess', {
			body : {
				isEnabled   : Number(isEnabled),
				performerId : '',
				isOverlay   : 1
			}
		});
		let { forwardUrl } = response;
		let setLimitBtnEl = Ext.get(this.setPwdRowId);

		// Turn on
		if (response.forwardUrl) {
			this.overlayCmp.getOverlay(forwardUrl);
		}
		// Turn off
		else if (setLimitBtnEl) {
			setLimitBtnEl.slideOut('t', { remove : false, useDisplay : true });
		}
	},

	/**
	 * Bind event listeners
	 */
	bind : function() {
		if (this.showAllModelEl) {
			this.showAllModelEl._tag.on('change-once', ::this.onShowAllModelChange);
		}
		if (this.limitStudioAccessEl) {
			this.limitStudioAccessEl._tag.on('change-once', ::this.onLimitedStudioAccessChange);
		}
		AccountSettings.superclass.bind.call(this);
	},

	/**
	 * UnBind event listeners
	 */
	unbind : function() {
		if (this.showAllModelEl) {
			this.showAllModelEl._tag.unmount();
		}
		if (this.limitStudioAccessEl) {
			this.limitStudioAccessEl._tag.unmount();
		}
		AccountSettings.superclass.unbind.call(this);
	}
});