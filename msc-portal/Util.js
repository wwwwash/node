import Ext from '../vendor/ExtCore';
import Config from './Config';
import { Broadcaster } from './Broadcaster';
import Sound from '../../component/Sound/Sound';

import Form from '../../component/_Form/Form';

export default ChaosUtil = {

	decodeEntities : (function() {
		// this prevents any overhead from creating the object each time
		var element = document.createElement('div');

		function decodeHTMLEntities (str) {
			if (str && typeof str === 'string') {
				// strip script/html tags
				str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '');
				str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, '');
				element.innerHTML = str;
				str = element.textContent;
				element.textContent = '';
			}

			return str;
		}

		return decodeHTMLEntities;
	}()),

	/**
	 * Atalakitja a backendtol erkezo regexp formatumot a js altal ertelmezheto formatumra
	 *
	 * @param {String} pattern Backendtol kapott regexp pattern
	 *
	 * @return {Object} A JS altal kezelheto Regexp formatumot es a modifiereket tartalmazo objektum {pattern: [RegeXp]*, modifier: /g}
	 */
	regexpParser : function(pattern) {
		var result  	= { pattern : pattern, modifier : '' },
			pattern 	= pattern.toString(),
			delimiter 	= pattern.charAt(0);
		//kivalasztjuk az elso hatarolot, majd megkeressuk az utolso elofordulasat
		//majd az utolso elofordulasa utani resz a modifier
		if (pattern.indexOf(delimiter) === 0) {
			var first = 0,
				last = pattern.lastIndexOf(delimiter);
			result.pattern = pattern.substring(first + 1, last);
			// Az 'u' modifier szuksegtelen az XRegExp szamara, sot hibat okoz ha van, igy ezt kivesszuk
			result.modifier = pattern.substring(last + 1).replace('u', '');
		}

		return result;
	},

	/**
	 * Updates the query string of the given url or the current url
	 *
	 * @param   {string}  key
	 * @param   {string}  value
	 * @param   {string}  url
	 * @returns {string}  new url
	 */
	updateQueryString : function(key, value, url) {
		if (!url) {url = window.location.href}
		var re = new RegExp('([?&])' + key + '=.*?(&|#|$)(.*)', 'gi'),
			hash;

		if (re.test(url)) {
			if (typeof value !== 'undefined' && value !== null)				{return url.replace(re, '$1' + key + '=' + value + '$2$3')}

			hash = url.split('#');
			url = hash[0].replace(re, '$1$3').replace(/(&|\?)$/, '');
			if (typeof hash[1] !== 'undefined' && hash[1] !== null)					{url += '#' + hash[1]}
			return url;
		}

		if (typeof value !== 'undefined' && value !== null) {
			var separator = url.indexOf('?') !== -1 ? '&' : '?';
			hash = url.split('#');
			url = hash[0] + separator + key + '=' + value;
			if (typeof hash[1] !== 'undefined' && hash[1] !== null)					{url += '#' + hash[1]}
			return url;
		}
		return url;
	},

	/**
	 * A tul hosszu stringet alakitja at ugy, hogy maxChar(maximum karakterszam) hosszu legyen es a vegen a 'replacer'-ben szereplo karaktersorozat szerepeljen
	 *
	 * @param str      string  Az atalakitando string
	 * @param maxChar  int     maximum karakterszam, ilyen hosszu lesz a vegeredmeny string (a replacer karakterekkel egyutt)
	 * @param replacer string  A string veget zaro karaktersorozat (pl.: '...')
	 *
	 * @return str String Az atalakitott string
	 */
	dottify : function (str, maxChar, replacer) {
		//Castolunk
		str = str.toString();
		maxChar = parseInt(maxChar);
		replacer = replacer ? replacer.toString() : '...';
		//Valtozok deklaralasa
		var l = str.length,
			rl = replacer.length,
			pos = maxChar - rl;
		//Megvizsgaljuk, hogy hosszabb e a str mint a maxChar
		if (l > maxChar)		{
			str = str.slice(0, pos)
					 .concat(replacer);
		}

		return str;
	},

	/**
	 * returns window scrolltop position
	 */
	getScrollTop : function() {
		var doc = document.documentElement, body = document.body,
			scrollTop = doc && doc.scrollTop || body && body.scrollTop || 0;

		return scrollTop;
	},

	/**
	 * Converts an array to a string to make it postable via ajax.
	 *
	 * @method stringifyArray
	 * @param {String} prefix   Prefix which will be the array name
	 * @param {Array}  array    Array to stringify
	 * @return {String}
	 */
	stringifyArray : function(prefix, array) {
		var i,
			separator = '&',
			result = '';
		if (array.length === 0) {
			return prefix + '[]=\'\'';
		}
		for (i = 0; i < array.length; i++) {
			if (i === array.length - 1) {
				separator = '';
			}
			result += prefix + '[]=' + array[i] + separator;
		}
		return result;
	},

	/**
	 * Megallapitja egy stringrol hogy utvonal-e.
	 * Linkekben  megnezzuk a href-et, eleresi utvonal van-e ott, vagy nem (pl. hash)
	 *
	 * @param {string }str
	 * @returns {boolean}
	 */
	isPath : function(str) {
		var re1 = '((?:\\/[\\w\\.\\-]+)+)';	// Unix Path 1
		var p = new RegExp(re1, ['i']);
		var m = p.exec(str);
		if (m != null) {
			return true;
		}

		return false;
	},

	/**
	 * Visszaadja az adott elementben levo szoveget trimmelve
	 *
	 * @param {Object} element A lekerdezni kivant element
	 * @param {Object} noEscape In some cases, HTML escaping is not needed (html attributes)
	 */
	getText : function(element, noEscape) {
		if (!element) {
			return false;
		}
		var innerText = Ext.get(element).dom.textContent || Ext.get(element).dom.innerText;

		if (innerText) {
			return noEscape ? innerText.trim() : ChaosUtil.escapeHTML(innerText.trim());
		}

		return false;
	},

	/**
	 * Encodes the given string
	 *
	 * @param {string} str   String to encode
	 */
	base64Encode : function(str) {
		var keyStr = 'ABCDEFGHIJKLMNOP' +
					'QRSTUVWXYZabcdef' +
					'ghijklmnopqrstuv' +
					'wxyz0123456789+/' +
					'=',
			str = escape(str),
			output = '',
			chr1, chr2, chr3 = '',
			enc1, enc2, enc3, enc4 = '',
			i = 0;

		do {
			chr1 = str.charCodeAt(i++);
			chr2 = str.charCodeAt(i++);
			chr3 = str.charCodeAt(i++);

			enc1 = chr1 >> 2;
			enc2 = (chr1 & 3) << 4 | chr2 >> 4;
			enc3 = (chr2 & 15) << 2 | chr3 >> 6;
			enc4 = chr3 & 63;

			if (isNaN(chr2)) {
				enc3 = enc4 = 64;
			}
			else if (isNaN(chr3)) {
				enc4 = 64;
			}

			output = output +
			keyStr.charAt(enc1) +
			keyStr.charAt(enc2) +
			keyStr.charAt(enc3) +
			keyStr.charAt(enc4);
			chr1 = chr2 = chr3 = '';
			enc1 = enc2 = enc3 = enc4 = '';
		}
		while (i < str.length);

		return output;
	},

	/**
	 * Tries to decode an encoded string
	 *
	 * @param {string} str   Encoded string
	 */
	base64Decode : function(str) {
		var keyStr = 'ABCDEFGHIJKLMNOP' +
					'QRSTUVWXYZabcdef' +
					'ghijklmnopqrstuv' +
					'wxyz0123456789+/' +
					'=',
			output = '',
			chr1, chr2, chr3 = '',
			enc1, enc2, enc3, enc4 = '',
			i = 0;

		// remove all characters that are not A-Z, a-z, 0-9, +, /, or =
		var base64test = /[^A-Za-z0-9\+\/\=]/g;
		if (base64test.exec(str)) {
			/* develblock:start */
			console.warn('There were invalid base64 characters in the input text.\n' +
			'Valid base64 characters are A-Z, a-z, 0-9, \'+\', \'/\',and \'=\'\n' +
			'Expect errors in decoding.');
			/* develblock:end */
			return false;
		}

		str = str.replace(/[^A-Za-z0-9\+\/\=]/g, '');

		do {
			enc1 = keyStr.indexOf(str.charAt(i++));
			enc2 = keyStr.indexOf(str.charAt(i++));
			enc3 = keyStr.indexOf(str.charAt(i++));
			enc4 = keyStr.indexOf(str.charAt(i++));

			chr1 = enc1 << 2 | enc2 >> 4;
			chr2 = (enc2 & 15) << 4 | enc3 >> 2;
			chr3 = (enc3 & 3) << 6 | enc4;

			output += String.fromCharCode(chr1);

			if (enc3 !== 64) {
				output += String.fromCharCode(chr2);
			}
			if (enc4 !== 64) {
				output += String.fromCharCode(chr3);
			}

			chr1 = chr2 = chr3 = '';
			enc1 = enc2 = enc3 = enc4 = '';
		} while (i < str.length);

		return unescape(output);
	},

	/**
	 * @param {object} queryParams
	 */
	encodeQueryString : function(queryParams) {
		var queryStringParts = [],
			value;

		for (var qParam in queryParams) {
			value = queryParams[qParam];

			if (value instanceof Array) {
				for (var i = 0; i < value.length; i++) {
					queryStringParts.push(encodeURIComponent(qParam) + '[]=' + encodeURIComponent(value[i]));
				}

				continue;
			}

			queryStringParts.push(encodeURIComponent(qParam) + '=' + encodeURIComponent(value));
		}

		return queryStringParts.join('&');
	},

	/**
	 * Method for matching different tags in url
	 *
	 * @param {string} url       Url to test [optional - if undefined location url will be used]
	 *
	 * @return object params   Object containing each params of given url
	 */
	getUrlParams : function (url) {
		var regex = /(?:\?|#|&(?:amp;)?)([^=&#]+)(?:=?([^&#]*))/g,
			match, params = {},
			decode = function (s) {return decodeURIComponent(s.replace(/\+/g, ' '))},
			currUrl;

		currUrl = typeof url === 'undefined' ? window.location.href : url;

		while (match = regex.exec(currUrl)) {
			params[decode(match[1])] = decode(match[2]);
		}
		return params;
	},

	/**
	 * Removes the host part from the current url
	 *
	 * @param {string} url     Url to test [optional - if undefined location url will be used]
	 * @public
	 *
	 * @return string url   Modified url
	 */
	getUrlWithoutHost : function(url) {
		var currUrl = typeof url === 'undefined' ? window.location.href : url,
			sourceUrl = currUrl.replace('http://', '').replace('https://', '').split(/[/?#]/);

		sourceUrl.shift();
		return '/' + sourceUrl.join('/');
	},

	/**
	 * karakter szamlalo alkalmazas
	 *
	 * @param {object} obj				azon elemek gyujtemenye, amelyekre ra akarjuk rakni a karakter szamlalot
	 * @param {string} counterClass		az a class amit figyelnunk kell
	 * @param {object} templateObj		a szamlalas fuggvenyeben cserelgetheto a szoveg
	 *									az objektum tartalmazza az adott szoveg egyes es tobbes szamu verziojat
	 * @returns void
	 */
	characterCounter : function(obj, counterClass, templateObj) {
		/* ha nincs parameter */
		if (typeof obj === 'undefined' || obj.undefined) {
			return;
		}

		if (obj instanceof Ext.Element || obj instanceof HTMLElement) {
			obj = Ext.select('#' + obj.id);
		}

		//minden elemnek a maxLength erteket eltaroljuk
		var objMaxLength = {};

		/* megszamoljuk hogy mennyi szabad karakter van meg hatra */
		Ext.each(obj.elements, function(element) {
			var elem		= Ext.get(element);
			//ha van adva maxLength
			if (elem && elem.dom && elem.dom.maxLength !== -1 && elem.dom.maxLength !== 524288) {
				objMaxLength[elem.id]	= elem.dom.maxLength || parseInt(elem.dom.getAttribute('maxlength'));

				//Elso lefutaskor esemeny nelkul is szamoljuk meg a beleirt karakterek szamat
				var firstRun = true,
					self = this;

				var firstRunFn = function() {
					firstRun = false;
					var chars = self.value.length;
					//ha van olyan elem amelynek meg van adva a counterClass stilus
					if (!counterClass) {
						return;
					}
					var child = elem.parent().child(counterClass);
					// If the child doesn't exists, try to find at the next el
					if (!child) {
						child = elem.parent().next(counterClass);
					}
					if (child) {
						var textType = objMaxLength[elem.id] - chars < 2 ? 'singular' : 'plural';
						//irjuk at a html tartalmat
						child.dom.innerHTML = Config.get(templateObj).charCounterText[textType];
						//irjuk at a szamokat
						child.dom.children[0].innerHTML = objMaxLength[elem.id] - chars;
					}
				};

				Broadcaster.addEvents(Form.GLOBALEVENT_INPUT_CLEAR);
				Broadcaster.on(Form.GLOBALEVENT_INPUT_CLEAR, firstRunFn, this);

				if (firstRun) {
					firstRunFn();
				}
				//Minden tovabbi szamlalas csak kayup esemenyre tortenik
				elem.on('keyup', function(e) {
					//Ha spec billentyuk lettek lenyomva
					if ((e.keyCode > 0 && e.keyCode < 47 ||
						 e.keyCode > 90 && e.keyCode < 94 ||
						 e.keyCode > 111 && e.keyCode < 146)
						// Del es backspace es space nem szamit spec billnek
						 && (e.keyCode != 8 && e.keyCode != 46 && e.keyCode != 32)) {
						return false;
					}
					// megszamoljuk mennyi karakter van eppen
					// Chrome-ban az ujsor karaktereket hozza kell adni a length-hez.
					var newLines = this.dom.value.match(/\n/g);
					var chars = Ext.isChrome && newLines
						? this.dom.value.length + newLines.length
						: this.dom.value.length;
					//ha tobbet akar beleirni mint amennyi lehetseges, megallitjuk (hiaba mokolta a html-t
					if (chars > objMaxLength[elem.id]) {
						elem.dom.value = elem.dom.value.substring(0, objMaxLength[elem.id]);
						return false;
					}
					else if (chars === objMaxLength[elem.id]) {
						this.alertSound = this.alertSound || new Sound();
						this.alertSound.playSound();
					}
					if (!counterClass) {
						return;
					}
					//ha van olyan elem amelynek meg van adva a counterClass stilus
					var child = elem.parent().child(counterClass);
					// If not child, try in the next el
					if (!child) {
						var child = elem.parent().next(counterClass);
					}
					if (child) {
						var textType = objMaxLength[elem.id] - chars < 2 ? 'singular' : 'plural';
						//irjuk at a html tartalmat
						child.dom.innerHTML = Config.get(templateObj).charCounterText[textType];
						//irjuk at a szamokat
						child.dom.children[0].innerHTML = objMaxLength[elem.id] - chars;
					}
				});
			}
		});
	 },

	/**
	 * A kapott string erteket megvizsgalva ellenorzi, hogy megfelelo a datum vagy sem
	 *
	 * @param {string} dateStr    yyyy-mm-dd vagy yyyy/mm/dd
	 *
	 * @returns {Boolean}
	 */
	isDate : function (dateStr) {
		var datePat = /^(\d{4})(\/|-)(\d{1,2})(\/|-)(\d{1,2})$/,
			matchArray = dateStr.match(datePat); // is the format ok?

		return matchArray !== null;
	},

	 /**
	  * Szokoevet vizsgalo fugveny
	  *
	  * @param {string}     date    a datum amit vizsgalni szeretnenk (y/m/d) pl.: 2000-12-13
	  *
	  * @returns {Boolean}
	  */
	isValidDate : function (date) {
		var bits = date.split('-'),
			y = bits[0] || 0,
			m = bits[1] || 0,
			d = bits[2] || 0,
			daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; // Alapertelmezetten nem szokoevi napok (note: zero index a Januar)

	 // Ha osztható 4-el és nem osztható 100-zal
	 // Vagy osztható 400-al, akkor szokoev
	  if (!(y % 4) && y % 100 || !(y % 400)) {
		daysInMonth[1] = 29;
	  }

	  return d <= daysInMonth[--m];
	},

	/**
	 * Converts seconds to time HH:MM:SS
	 * @param secSum Seconds
	 * @returns {string}
	 */
	secToTime : function (secSum) {
		var hrs,
			mins,
			secs,
			arr = [];

		secSum = parseInt(secSum);

		hrs = Math.floor(secSum / 3600);
		mins = Math.floor(secSum / 60) - hrs * 60;
		secs = secSum % 60;

		if (hrs) {
			arr.push(hrs < 10 ? '0' + hrs : hrs);
		}

		// Easiest number padding method
		arr.push(mins < 10 ? '0' + mins : mins);
		arr.push(secs < 10 ? '0' + secs : secs);

		return arr.join(':');
	},

	/**
	 * Determines the version of internet explorer
	 *
	 * @method getIEVersion
	 * @public
	 *
	 * @return {Number}  IE version
	 */
	getIEVersion : function() {
		var version = -1; // Return value assumes failure.
		if (navigator.appName == 'Microsoft Internet Explorer') {
			var userAgent = navigator.userAgent;
			var ieVerRegexp = new RegExp('MSIE ([0-9]{1,}[\.0-9]{0,})');
			if (ieVerRegexp.exec(userAgent) != null)				{version = parseFloat(RegExp.$1)}
		}
		else if (navigator.appName == 'Netscape')		{
			var ua = navigator.userAgent;
			var re = new RegExp('Trident/.*rv:([0-9]{1,}[\.0-9]{0,})');
			if (re.exec(ua) != null)				{version = parseFloat(RegExp.$1)}
		}
		return version;
	},

	/**
	 * Returns the given string after replaced the invalid characters in it with HTML entities
	 * @method escapeHTML
	 * @param {String} string String to escape
	 * @return {String}
	 */
	escapeHTML : function(string) {
		return string.replace(/[\"&'\/<>]/g, function (a) {
			return {
				'"'  : '&quot;', '&'  : '&amp;', '\'' : '&#39;',
				'/'  : '&#47;', '<'  : '&lt;', '>'  : '&gt;'
			}[a];
		});
	},

	/**
	 * Returns a random number between min, max
	 *
	 * @method rand
	 * @param {Number} min  Number to set min value
	 * @param {Number} max  Number to set max value
	 * @return {Number}
	 */
	rand : function(min, max) {
		var argc = arguments.length;
		if (argc === 0) {
			min = 0;
			max = 2147483647;
		}
		else if (argc === 1) {
			throw new Error('Warning: rand() expects exactly 2 parameters, 1 given');
		}
		return Math.floor(Math.random() * (max - min + 1)) + min;
	},

	/**
	 * Returns array difference
	 *
	 * @param {Array} a1
	 * @param {Array} a2
	 * @returns {Array}
	 */
	arrayDiff : function(a1, a2) {
		var result = [];
		for (var i = 0, iLen = a1.length; i < iLen; i++) {
			if (a2.indexOf(a1[i]) === -1) {
				result.push(a1[i]);
			}
		}
		return result;
	}
};

// Ext addition with isIE9
if (typeof Ext.isIE9 === 'undefined') {
	Ext.isIE9 = ChaosUtil.getIEVersion() == '9';
}
// Ext addition with isIE10
if (typeof Ext.isIE10 === 'undefined') {
	Ext.isIE10 = ChaosUtil.getIEVersion() == '10';
}
// Ext addition with isIE11
if (typeof Ext.isIE11 === 'undefined') {
	Ext.isIE11 = ChaosUtil.getIEVersion() == '11';
}
