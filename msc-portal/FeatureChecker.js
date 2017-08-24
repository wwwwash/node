import FeatureChecker from 'feature-checker';

import Config from '../../lib/chaos/Config';

export const CONST = {
	Flash : {
		PLUGIN_BLOCKED   : 'flash-plugin-blocked',
		PLUGIN_NOT_FOUND : 'flash-plugin-not-found',
		PLUGIN_ENABLED   : 'flash-plugin-enabled'
	}
};

/**
 * Model representing the thread list.
 */
export default class FeatureCheckerClass {

	/**
	 * Access CONST constant per instance
	 */
	static CONST = CONST;

	/**
	 * Returns the current status of flash plugin
	 * @param {function} callback   Callback function with result passed as a parameter
	 * @return {void}
	 */
	getFlashPluginStatus(callback) {
		if (!(this._featureChecker instanceof FeatureChecker)) {
			this._featureChecker = new FeatureChecker({
				appletUrl : Config.get('dummyFlashAppletSrc'),
				timeout   : 2000
			});
		}
		var self = this;
		this._featureChecker.getFeatures(function(res) {
			var status = res.flash;
			if (status.enabled === true && status.blocked === false) {
				self._userFlashVersion = status.version;
				callback(CONST.Flash.PLUGIN_ENABLED);
			}
			else if (status.enabled === false && status.blocked === true) {
				callback(CONST.Flash.PLUGIN_BLOCKED);
			}
			else {
				callback(CONST.Flash.PLUGIN_NOT_FOUND);
			}
		});
	}

}
