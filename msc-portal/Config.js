import Ext from '../vendor/ExtCore';

/**
 * Configuration handler class for Chaos FW.
 *
 * @package    Chaos
 * @subpackage Core
 */
export default Config = {
	REG_PLUGINS : 'plugins',
	/**
	 * @var object   A konfiguraciot tartalmazo object.
	 */
	config      : {},

	/**
	 * Retrieves the specified configuration option.
	 *
	 * @param string name           The name of the option.
	 * @param mixed  defaultValue   The default value if the specified config does not exists.
	 *
	 * @return mixed   A konfig erteke.
	 */
	get : function(name, defaultValue) {
		// if "." is present, means that split needed to get the real path
		// ie. plugins.captcha.color means: get this.config["plugins"]["captcha"]["color"] or
		// this.config.plugins.captcha.color
		if (name.indexOf('.') >= 0) {
			var parts = name.split('.'),
				part,
				currentPart = this.config,
				currentKey;

			for (var i = 0; i < parts.length; i++) {
				currentKey = parts[i];

				if (currentPart instanceof Object) {
					currentPart = currentPart[currentKey];
				}
				/* develblock:start */
				else {
					console.warn('Config path does not exists: ' + name);
				}
				/* develblock:end */
			}

			return currentPart;
		}

		if (typeof this.config[name] !== 'undefined') {
			return this.config[name];
		}


		if (typeof defaultValue !== 'undefined') {
			return defaultValue;
		}

		return undefined;
	},

	/**
	 * Sets one or more option in the configuration.
	 *
	 * @param string|object nameOrValues   The name of the config option or an object with config options.
	 * @param mixed         value          The value of the config option. this will be ignored if the nameOrValues
	 *                                     parameter is an object.
	 *
	 * @return void
	 */
	set : function(nameOrValues, value) {
		switch (typeof nameOrValues) {
			case 'object':
				Ext.apply(nameOrValues, value);
				break;
			// TODO: number-t engedelyezzunk?
			case 'string':
			case 'number':
				this.config[nameOrValues] = value;
				break;
			default:
				console.trace();
				throw 'Invalid type for nameOrValues parameter. String or object required, ' + typeof nameOrValues + ' given.';
		}
	},

	/**
	 * Removes an option from the configuration.
	 *
	 * @param string name   The name of the config option.
	 *
	 * @return void
	 */
	remove : function(name) {
		if (this.config[name]) {
			delete this.config[name];
		}
	}
};

/**
 * Setup initial values
 */
Config.set(Config.REG_PLUGINS, {});
