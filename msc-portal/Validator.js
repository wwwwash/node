import Connection from './Connection';

/**
 *
 */
export default ChaosValidator = {
	patterns : {
		screenName : /^[a-zA-Z0-9]+$/,
		loginName  : /^[a-zA-Z0-9\-\_]+$/,
		email      : /^[a-z0-9_.-]+@([a-z0-9-]+\.)+[a-z]{2,4}$/i,
		password   : /^[a-zA-Z0-9]+$/,
		simple     : /^\w*(?=.{6,})\w*$/,
		url        : /(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/,
		number     : /^[0-9]*/
	},

	/**
	 * Checks the value's length is more than the limit.
	 * Returns only if value is not empty.
	 *
	 * @param mixed value           The value to check.
	 * @param number|object config   The config for the validator. If it is a number than the function uses as the limit.
	 *                               If object, the 'limit' property will be used.
	 *
	 * @return bool   TRUE, if the value is more than the limit.
	 */
	min : function(value, config) {
		if (this.empty(value)) {
			return value.length >= (typeof config === 'object' ? config.limit : config);
		}
	},

	/**
	 * Checks the value is less than the limit.
	 * Returns only if value is not empty.
	 *
	 * @param number value           The number to check.
	 * @param number|object config   The config for the validator. If it is a number than the function uses as the limit.
	 *                               If object, the 'limit' property will be used.
	 *
	 * @return bool   TRUE, if the value is less than the limit.
	 */
	max : function(value, config) {
		if (this.empty(value)) {
			return value.length <= (typeof config === 'object' ? config.limit : config);
		}
	},

	/**
	 * Tests the value is empty.
	 *
	 * @param mixed value   The value to check.
	 *
	 * @return bool   TRUE if the value is empty.
	 */
	empty : function(value) {
		// Explicit empty valuesű
		if (value === ''
			|| value === null
			|| value === false
			|| typeof value === 'undefined'
			|| typeof value === 'number' && isNaN(value)
		) {
			return false;
		}

		return true;
	},

	/**
	 * Check the given value is equals to config's value.
	 * Returns only if value is not empty.
	 *
	 * @TODO kideriteni: mi az isStrist, honnan jon?
	 *
	 * @param mixed value    Value to check.
	 * @param mixed config   The config for the validator. If object, the 'value' property will be used.
	 */
	equals : function(value, config) {
		if (this.empty(value)) {
			if (config.isStrist) {
				return value === config.dom.value;
			}

			return value == (typeof config === 'object' ? config.dom.value : config);
		}
	},

    /**
     * Check the given value is equals to default value.
     *
     * @param mixed value         Value to check.
	 * @param mixed defaultText   The default value.
     */
	choose : function(value, defaultText) {
		return value != defaultText;
	},

	/**
	 * Returns with the type of the given value. If the config is an object tests by its type.
	 * If it has only one parameter will return with the type of the given value.
	 *
	 * @param mixed value    The value to check.
	 * @param mixed config   [optional] The config for the validator. If object, the 'type' property will be used.
	 *
	 * @return string   A primitive type.
	 */
	type : function(value, config) {
		if (!config) {
			return typeof value;
		}
		return typeof value === (typeof config === 'object' ? config.type : config);
	},

	/**
	 * Validates a screen name by a predefined pattern.
	 * Returns only if value is not empty.
	 *
	 * @param mixed value   The value to check.
	 *
	 * @return bool   TRUE if the value fits the given pattern.
	 */
	screenName : function(value) {
		if (this.empty(value)) {
			var testPattern = this.getPattern('screenName');
			if (testPattern) {
				return testPattern.test(value);
			}
		}
	},

	/**
	 * Validates an model name by a predefined pattern.
	 * Returns only if value is not empty.
	 *
	 * @param mixed value   The value to check.
	 *
	 * @return bool   TRUE if the value fits the given pattern.
	 */
	loginName : function(value) {
		if (this.empty(value)) {
			var emailPattern = this.getPattern('loginName');
			if (emailPattern) {
				return emailPattern.test(value);
			}
		}
	},

	/**
	 * Validates an email address by a predefined pattern.
	 * Returns only if value is not empty.
	 *
	 * @param mixed value   The value to check.
	 *
	 * @return bool   TRUE if the value fits the given pattern.
	 */
	email : function(value) {
		if (this.empty(value)) {
			var emailPattern = this.getPattern('email');
			if (emailPattern) {
				return emailPattern.test(value);
			}
		}
	},

	/**
	 * Validates a password by a predefined pattern.
	 * Returns only if value is not empty.
	 *
	 * @param mixed value   The value to check.
	 *
	 * @return bool   TRUE if the value fits the given pattern.
	 */
	password : function(value) {
		if (this.empty(value)) {
			var passwordPattern = this.getPattern('password');
			if (passwordPattern) {
				return passwordPattern.test(value);
			}
		}
	},

	simple : function(value) {
		if (this.empty(value)) {
			var simplePattern = this.getPattern('simple');
			if (simplePattern) {
				return simplePattern.test(value);
			}
		}
	},

	/**
	 * Validates a url address by a predefined pattern.
	 * Returns only if value is not empty.
	 *
	 * @param mixed value   The value to check.
	 *
	 * @return bool   TRUE if the value fits the given pattern. It has to be a string containing ONLY numbers.
	 */
	url : function(value) {
		if (this.empty(value)) {
			var urlPattern = this.getPattern('url');
			if (urlPattern) {
				return urlPattern.test(value);
			}
		}
	},

	/**
	 * Tests if the given value is numeric.
	 * Returns only if value is not empty.
	 *
	 * @param mixed value   The value to check.
	 *
	 * @return bool   TRUE if the value is a number.
	 */
	number : function(value) {
		if (this.empty(value)) {
			var numberPattern = this.getPattern('number');
			if (numberPattern) {
				return numberPattern.test(value);
			}
		}
	},

	/**
	 * Returns with a pattern.
	 *
	 * TODO: config-ot kitalalni. (konfigolhato min es max ertekek??)
	 *
	 * @param string value   Type of a pattern which will be used by a validator function.
	 *                       Possible keywords for patterns:
	 *                       email, password, url, number
	 *
	 * @return regexp   A regular expression.
	 */
	getPattern : function(value) {
		return this.patterns[value];
	},

	/**
	 * REMOTE FIELD VALIDATION AJAX COMPONENT
	 *  @errorNodeClass:	the css class for the error Message
	 *  @errorTemplate:		template of the error Message
	 *
	 *  @remote: function
	 *  @param object  field           Input field object to be validated
	 *  @param string  value           Value we want to test
	 *  @param string  url             Request url
	 *  @param object  element         The form's elements object that contains the input field
	 *  @param boolean showErrMsg      if true, errorMessage should show up
	 *  @param object  form            JSM.form.Form, that contains the field
	 *  @param function callback       function that should be called on
	 *  @param boolean xDomainNeeded   True, if cross-domain request is needed [optional, default: false]
	 */
	remote : function(field, value, url, element, showErrMsg, form, callback, xDomainNeeded) {
		if (value != '' && (value && value.length > 3)) {
			var params = { value : value },
				method = xDomainNeeded ? 'POST' : 'GET',
				// when xdomain request needed we have to convert given url's protocol to https
				requestUrl = xDomainNeeded ? Connection.Ajax.setXDomainUrl(url, true) : url;

			// @config: contains the URL where to send the value to validate
			Connection.Ajax.request({
				url     : requestUrl,
				method  : method,
				params  : params,
				type    : 'json',
				xdomain : xDomainNeeded || false,
				success : function(response, opts) {
					form.hideError(field);
					if (typeof callback === 'function') {
						callback.call(form, true, response, opts);
					}
				},
				error : function(response, opts) {
					// show errors only if showErrMsg set to true
					if (showErrMsg) {
						// copy to a local variable to speed up
						var errors = response.json.errors;

						// if errors is a string, show it (and fire showerror event)
						if (typeof errors === 'string') {
							form.fireEvent('showerror', field.dom, errors);
							form.showError(field.dom, errors);
						}
						// otherwise if object, show each message (only String or Object is accepted)
						else if (typeof errors === 'object') {
							// iterate through messages
							for (var fieldName in errors) {
								var msg = errors[fieldName];
								// fire showerror event
								form.fireEvent('showerror', field.dom, msg);
								// show error (remove it!)
								form.showError(field.dom, msg);
							}
						}
					}

					// @todo: change to fireEvent
					if (typeof callback === 'function') {
						callback.call(form, false, response, opts);
					}

					return true;
				},
				failure : function(response, opts) {
					// @todo: change to fireEvent
					if (typeof callback === 'function') {
						callback.call(form, false, response, opts);
					}
					return false;
				},
				scope : ChaosValidator
			});
		}
	}
};
