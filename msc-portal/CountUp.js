import Ext from '../../lib/vendor/ExtCore';
import Chaos from '../../lib/chaos/Chaos';
import ChaosPlugin from '../../lib/chaos/Plugin';

/**
 * CounterPlugin
 * Makes a count-up effect to numbers with points
 * @param {Object} el The element which holds the number and the data-attrib
 * @param {Object} options Class options
 */

export default function CountUp(el, options) {
	CountUp.superclass.constructor.call(this, el);

	if (Chaos.isObject(options)) {
		Ext.apply(this, options);
	}
	this.init(el);
}

Chaos.extend(CountUp, ChaosPlugin, {

	/** @param {String} dataAttr    Data attr of the sum, without points and commas etc. */
	dataAttr : 'sum',

	/** @param {Number} steps       Fixed number of steps */
	steps : undefined,

	/** @param {Number} decimals    Number of decimals in the counter */
	decimals : 0,

	/** @param {String} dot         HTML tag for thousands dot */
	dot : undefined,

	/** @param {Bool} pad           To fill up the number with digits while counting */
	pad : false,

	/**
	 * Init
	 * @param element {Object} el The element which holds the number and the data-attrib
	 */
	init : function(element) {
		var el = Ext.get(element),
			target = el.data(this.dataAttr) === null ? el.dom.innerHTML : el.data(this.dataAttr),
			digits = target.toString().trim().length,
			steps = this.steps || (target < 0 ? 51 : 101), // In case we get too low numbers to add
			step = target / steps,
			currentTotal = 0,
			counterInterval = 10,
			runner = new Ext.util.TaskRunner(),
			i = 0,
			addTask = {
				run : function() {
					currentTotal += step;
					i++;
					if (i >= steps) {
						// In case there are some slip because of Math.floor
						if (currentTotal > target) {
							currentTotal = target;
						}
						runner.stop(addTask);
					}

					var parsedTotal = this.pad ?
						this._pad(parseFloat(currentTotal).toFixed(this.decimals), digits) :
						parseFloat(currentTotal).toFixed(this.decimals);


					Ext.fly(el).dom.innerHTML = this._formatNumber(parsedTotal);
				}.bind(this),
				interval : counterInterval
			};
		el.setVisible(true);
		runner.start(addTask);
	},

	/**
	 * It will format the points to display properly
	 *
	 * @param nStr
	 * @returns {string}
	 * @private
	 */
	_formatNumber : function(nStr) {
		var dot = this.dot || '.';
		nStr += '';
		var x = nStr.split('.'),
			x1 = x[0],
			x2 = x.length > 1 ? '.' + x[1] : '',
			rgx = /(\d+)(\d{3})/;
		while (rgx.test(x1)) {
			x1 = x1.replace(rgx, '$1' + dot + '$2');
		}

		return x1 + x2;
	},

	/**
	 * Padding a number to a fixed number of digits
	 * @param {Number} n The input number
	 * @param {Number} width The number of digits of the output
	 * @param {*} z The padding character. Default is 0.
	 * @returns {Number}
	 * @private
	 */
	_pad : function(n, width, z) {
		z = z || '0';
		n += '';
		return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
	}
});

