import i18n from '../../lib/helpers/languageHelper.es6';
import bbcodeToHtml from '../../lib/helpers/bbcodeToHtml.es6';

export default function(text = '', options) { /* eslint func-style: 0 */
	let key = text.trim().toLowerCase(),
		translated = i18n.translate(key),
		variables = options.hash;

	//keep the default text if it is not translated
	if (translated === key) {
		translated = text;
	}

	//resolve bbcodes
	translated = bbcodeToHtml(translated);

	for (let variable in variables) {
		if (variables.hasOwnProperty(variable)) {
			translated = translated.replace(new RegExp(`{${variable}}`, 'g'), variables[variable]);
		}
	}

	return translated;
}
