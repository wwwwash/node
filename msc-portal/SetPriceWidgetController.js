import Chaos from '../../lib/chaos/Chaos';

import ChannelPriceSettingsComponent from '../FanClub/ChannelPriceSettings';
import CommonWidgetController from './CommonWidgetController';

export default function SetPriceWidgetController(el, config) {
	SetPriceWidgetController.superclass.constructor.call(this, el, config);
}

Chaos.extend(SetPriceWidgetController, CommonWidgetController, {

	init : function(el, config) {
		SetPriceWidgetController.superclass.init.call(this, el, config);

		let cmpEl = document.querySelector('#channelPrice-component');
		if (!(this._channelPriceSettingsComponent instanceof ChannelPriceSettingsComponent) && cmpEl) {
			this._channelPriceSettingsComponent = new ChannelPriceSettingsComponent(
                cmpEl,
				{
					isMwl : true
				}
			);
		}
	},

	bind : function() {
		SetPriceWidgetController.superclass.bind.call(this);
	},

	unbind : function() {
		this.autoUnbind();
	}
});
