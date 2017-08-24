export default function(amount, currency, locale) { /* eslint func-style: 0 */
	let numberFormat = new Intl.NumberFormat(locale, {style : 'currency', currency : currency});
	return numberFormat.format(amount);
}
