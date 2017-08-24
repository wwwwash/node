import Ext from '../vendor/ExtCore';

/**
 * Internationalization class for Chaos FW.
 *
 * @package    Chaos
 * @subpackage Core
 */
export default function ChaosI18n() {

}

/**
 * Retrieves the instance of the I18n class.
 *
 * @return I18n   The instance of the internationalization class.
 */
ChaosI18n.getInstance = function() {
	if (!(ChaosI18n.prototype.instance instanceof ChaosI18n)) {
		ChaosI18n.prototype.instance = new ChaosI18n();
	}
	return ChaosI18n.prototype.instance;
};

Ext.apply(ChaosI18n.prototype, {
	/**
	 * @const The default language.
	 */
	DEFAULT_LANGUAGE : 'en',

	/**
	 * @var string   The current language.
	 */
	language : 'en',

	/**
	 * @var object   The object which contains the known translations.
	 */
	translationTables : {
		en : {}
	},

	/**
	 * Sets the current language.
	 *
	 * @param string language   The language to set.
	 *
	 * @return void
	 */
	setLanguage : function(language) {
		this.language = language;
	},

	/**
	 * Retrieves the current language.
	 *
	 * @return string   The current language.
	 */
	getLanguage : function() {
		return this.language;
	},

	/**
	 * Sets the translation table for the given language.
	 *
	 * @param string language           The 2 character long language code.
	 * @param object translationTable   The translationTable to add to the language's collection.
	 *
	 * @return void
	 */
	setTranslationTable : function(language, translationTable) {
		if (typeof this.translationTables[language] !== 'object') {
			this.translationTables[language] = {};
		}

		Ext.apply(this.translationTables[language], translationTable);
	},

	/**
	 * Adds a new translation item to the current translation table. If lang is defined, uses it,
	 * otherwise
	 *
	 * @param string text         key in the translation table
	 * @param string translation  translation of the item
	 * @param string lang         language (optional)
	 *
	 * @return undefined
	 */
	addTranslation : function(text, translation, lang) {
		var language = this.getCurrentLanguage(lang);
		var table = this.translationTables[language];

		if (typeof table !== 'object') {
			table = {};
		}

		if (typeof text === 'string') {
			table[text] = translation;
		}

		if (typeof text === 'object') {
			Ext.apply(table, text);
		}
	},

	/**
	 * Returns the current language
	 *
	 */
	getCurrentLanguage : function(language) {
		// If the language parameter is not present use the current language.
		if (typeof language !== 'string' || typeof language === 'string' && language.length == 0) {
			language = this.language;
		}
		// If there are no current language or the current language has not any translation table
		// use the default language.
		if (typeof language !== 'string'
			|| typeof language === 'string' && language.length == 0
			|| typeof this.translationTables[language] !== 'object'
		) {
			language = this.DEFAULT_LANGUAGE;
		}
		return language;
	},

	/**
	 * Retrieves a translation from the translation repository with aplying the given parameters for the placeholders.
	 *
	 * @param string text       The translation key.
	 * @param object params     The values for the placeholders.
	 * @param string language   [optional] The language key to force a specific language.
	 *
	 * @return string   The translated text with the replaced placeholders.
	 */
	getTranslation : function(text, params, language) {
		var result = text;
		//var key = text.toLowerCase();
		var key = text;

		language = this.getCurrentLanguage(language);
		// Trying to get the translation from the translation table.
		// If we can't get it, we will use the original string from the parameter list.
		if (typeof this.translationTables[language] === 'object') {
			if (typeof this.translationTables[language][key] === 'string') {
				result = this.translationTables[language][key];
			}
		}

		// Trying to replace the placeholders to it's values.
		if (typeof params === 'object') {
			result = this.replacePlaceholders(result, params);
		}

		return result;
	},

	/**
	 * Replaces the placeholders in the string.
	 *
	 * @param string text   The text.
	 * @param object params   The values for the placeholders.
	 *
	 * @return string   The text with the replaced placeholders.
	 */
	replacePlaceholders : function(text, params) {
		for (prop in params) {
			if (typeof params[prop] === 'string' || typeof params[prop] === 'number') {
				var placeholder = '{' + prop + '}';
				text = text.replace(placeholder, params[prop]);
			}
		}

		return text;
	}
});