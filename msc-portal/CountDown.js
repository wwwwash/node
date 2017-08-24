/* eslint-disable complexity */

import Ext from '../../lib/vendor/ExtCore';
import Chaos from '../../lib/chaos/Chaos';
import ChaosObject from '../../lib/chaos/Object';

export default function CountDown(el, config) {
	CountDown.superclass.constructor.call(this, el, config);
}

CountDown.EVENT_END = 'CountDown-end';
CountDown.EVENT_START = 'CountDown-start';
CountDown.EVENT_STOP = 'CountDown-start';
CountDown.EVENT_SECOND = 'CountDown-second';
CountDown.EVENT_MINUTE = 'CountDown-minute';
CountDown.EVENT_HOUR = 'CountDown-hour';
CountDown.EVENT_DAY = 'CountDown-day';
CountDown.EVENT_WEEK = 'CountDown-week';
CountDown.EVENT_YEAR = 'CountDown-year';

/*
 * CountDown for JSM
 * @version 1.0
 * It can count down from a given UNIX timestamp.
 * For example if the passed parameter is 60, than it will count down from 60 seconds. 3600 = CountDown from 1 hour.
 * Please note that it doesn't work like giving a date and voila CountDown, because JavaScripts built in Date/Time is unreliable, we synchronize with server times (where the timestamp is coming from).
 * It supports a flexible layout template to be customizable as possible.
 */

Chaos.extend(CountDown, ChaosObject, {

	/** @var {String}					Timestamp to CountDown to. This will overwrite the value coming from the data selector */
	timestamp : 0,

	/** @var {String}					Display template (it can also include HTML or any kind of string)
	 *                                  It is separated into blocks using [] brackets.
	 *                                  The whole block will be removed on zero if it was set in hideOnZero,
	 *                                  so it's ideal for separators for ex. */
	template : '[[{d}] [{h}] [{m}] [{s}]',

	/** @var {Array}					Which values should we hide when it's null */
	hideOnZero : [],

	/** @var {String}					Default data selector to get the timestamp from (from the initialized DOM element) */
	dataSelector : 'data-time',

	/** @var {String}					Start separator for block units */
	blockSeparatorStart : '[',

	/** @var {String}					End separator for block units */
	blockSeparatorEnd : ']',

	/** @var {Boolean}					Boolean for deciding that we need two digits or not */
	twoDigits : false,

	/** PRIVATES */

	/** @var {Object}					The main time object, it will store the current time out values */
	_timeObject : { y : 0, w : 0, d : 0, h : 0, m : 0, s : 0 },

	/** @var {Object}					The previous seconds object */
	_timePrevObject : undefined,

	/** @var {Object}					The Ext TaskRunner component which controls our CountDown */
	_timerTask : undefined,

	/** @var {Object}					Task properties passed to Ext Task Runner */
	_task : undefined,

	/** @var {Object}					The generated timer will be appended to this Ext Element */
	_targetElement : undefined,

	/** @var {Int}					    Timestamp which is used to calculate in each second */
	_tempstamp : 0,

	/** @var {Object}					Generated Ext Template for the class template variable */
	_template : undefined,

	/**
	 * Standard init function
	 *
	 * @param {Object} el
	 * @param {Object} config
	 *
	 * @return void
	 */
	init : function(el, config) {
		// Register events
		this.addEvents(
			CountDown.EVENT_START,
			CountDown.EVENT_END,
			CountDown.EVENT_STOP,
			CountDown.EVENT_SECOND,
			CountDown.EVENT_MINUTE,
			CountDown.EVENT_HOUR,
			CountDown.EVENT_DAY,
			CountDown.EVENT_WEEK,
			CountDown.EVENT_YEAR
		);

		// Save the element to draw to
		this._targetElement = el;

		// Get timestamp
		this.getTimestamp();

		// Init the CountDown
		this.startTimer();

		// Superclass call
		CountDown.superclass.init.call(this, el, config);
	},

	/**
	 * Initializes the interval
	 *
	 * @return void
	 */
	startTimer : function() {
		this._timerTask = new Ext.util.TaskRunner();

		this._task = {
			run      : this.generate,
			interval : 1000,
			scope    : this
		};

		this.start();
	},

	/**
	 * Task function to be iterated in each cycle
	 *
	 * @return void
	 */
	generate : function() {
		this._tempstamp = this.timestamp;

		if (this.template.indexOf('{y}') >= 0) {
			this._timeObject.y = Math.floor(this._tempstamp / (60 * 60 * 24 * 365));
			this._tempstamp -= 60 * 60 * 24 * 365 * this._timeObject.y;
		}

		if (this.template.indexOf('{w}') >= 0) {
			this._timeObject.w = Math.floor(this._tempstamp / (60 * 60 * 24 * 7));
			this._tempstamp -= 60 * 60 * 24 * 7 * this._timeObject.w;
		}

		if (this.template.indexOf('{d}') >= 0) {
			this._timeObject.d = Math.floor(this._tempstamp / (60 * 60 * 24));
			this._tempstamp -= 60 * 60 * 24 * this._timeObject.d;
		}

		this._timeObject.h = Math.floor(this.timestamp % (60 * 60 * 24) / (60 * 60));
		this._timeObject.m = Math.floor(this.timestamp % ((60 * 60 * 24)) % (60 * 60) / 60);
		this._timeObject.s = Math.floor(this.timestamp % (60 * 60 * 24) % (60 * 60) % 60);

		this.callEvents();
		this.draw();

		// Save previous time object for compare
		this._timePrevObject = JSON.parse(JSON.stringify(this._timeObject));

		// Reduce timestamp by 1
		this.timestamp--;

		/* DEBUG */
		// console.log('Year: ' + this._timeObject.y + ' Week: ' + this._timeObject.w + ' Day: ' + this._timeObject.d + ' Hour: ' + this._timeObject.h + ' Minute: ' + this._timeObject.m + ' Second: ' + this._timeObject.s);
	},

	getTimestamp : function() {
		this.timestamp = parseInt(this.timestamp || this._targetElement.data(this.dataSelector), 10);
	},

	/**
	 * This will draw and append the final template.
	 *
	 * @return void
	 */
	draw : function() {
		var output = this.template,
			replaceString;

		// Handle hide on zero
		for (var i = 0; i < this.hideOnZero.length; i++) {
			if (this._timeObject[this.hideOnZero[i]] !== 0) {
				continue;
			}
			replaceString = '{' + this.hideOnZero[i] + '\}';

			// Pattern thanks to Andy1210
			output = output.replace(new RegExp('\\' + this.blockSeparatorStart + '[^\\' + this.blockSeparatorStart + ']*\\' + replaceString + '.*?\\' + this.blockSeparatorEnd, 'gm'), ''); // eslint-disable-line
		}

		// Do final replaces
		output = output
			.replace(new RegExp('\\' + this.blockSeparatorEnd, 'g'), '')
			.replace(new RegExp('\\' + this.blockSeparatorStart, 'g'), '')
			.replace('{y}', this.twoDigits && this._timeObject.y < 10 ? '0' + this._timeObject.y.toString() : this._timeObject.y.toString()) // eslint-disable-line
			.replace('{w}', this.twoDigits && this._timeObject.w < 10 ? '0' + this._timeObject.w.toString() : this._timeObject.w.toString()) // eslint-disable-line
			.replace('{d}', this.twoDigits && this._timeObject.d < 10 ? '0' + this._timeObject.d.toString() : this._timeObject.d.toString()) // eslint-disable-line
			.replace('{h}', this.twoDigits && this._timeObject.h < 10 ? '0' + this._timeObject.h.toString() : this._timeObject.h.toString()) // eslint-disable-line
			.replace('{m}', this.twoDigits && this._timeObject.m < 10 ? '0' + this._timeObject.m.toString() : this._timeObject.m.toString()) // eslint-disable-line
			.replace('{s}', this.twoDigits && this._timeObject.s < 10 ? '0' + this._timeObject.s.toString() : this._timeObject.s.toString()); // eslint-disable-line

		// Draw please
		this._targetElement.html(output);
	},

	/**
	 * It will check if there are events to fire
	 *
	 * @return void
	 */
	callEvents : function() {
		// First run, there is no prev time object
		if (!this._timePrevObject) {
			this._timePrevObject = this._timeObject;
		}

		var dataObject = {
			timestamp    : this.timestamp,
			currentTimes : this._timeObject,
			prevTimes    : this._timePrevObject
		};

		/* Year changed */
		if (this._timeObject.y !== this._timePrevObject.y) {
			this.fireEvent(CountDown.EVENT_YEAR, {
				data  : dataObject,
				scope : this.scope || this || window
			}, CountDown.EVENT_YEAR);
		}

		/* Week changed */
		if (this._timeObject.w !== this._timePrevObject.w) {
			this.fireEvent(CountDown.EVENT_WEEK, {
				data  : dataObject,
				scope : this.scope || this || window
			}, CountDown.EVENT_WEEK);
		}

		/* Day changed */
		if (this._timeObject.d !== this._timePrevObject.d) {
			this.fireEvent(CountDown.EVENT_DAY, {
				data  : dataObject,
				scope : this.scope || this || window
			}, CountDown.EVENT_DAY);
		}

		/* Hour changed */
		if (this._timeObject.h !== this._timePrevObject.h) {
			this.fireEvent(CountDown.EVENT_HOUR, {
				data  : dataObject,
				scope : this.scope || this || window
			}, CountDown.EVENT_HOUR);
		}

		/* Minute changed */
		if (this._timeObject.m !== this._timePrevObject.m) {
			this.fireEvent(CountDown.EVENT_MINUTE, {
				data  : dataObject,
				scope : this.scope || this || window
			}, CountDown.EVENT_MINUTE);
		}

		/* Second changed */
		if (this._timeObject.s !== this._timePrevObject.s) {
			this.fireEvent(CountDown.EVENT_SECOND, {
				data  : dataObject,
				scope : this.scope || this || window
			}, CountDown.EVENT_SECOND);
		}

		/* END */

		if ( //this._timeObject.y === 0 &&
			//this._timeObject.w === 0 &&
			this._timeObject.d === 0 &&
			this._timeObject.h === 0 &&
			this._timeObject.m === 0 &&
			this._timeObject.s === 0) {
			// CountDown ended, stop the timer
			this._timerTask.stop(this._task);
			this.fireEvent(CountDown.EVENT_END, {
				data  : dataObject,
				scope : this.scope || this || window
			}, CountDown.EVENT_END);
		}
	},

	/**
	 * Start method for CountDown
	 *
	 * @return void
	 */
	start : function() {
		this._timerTask.start(this._task);
		this.fireEvent(CountDown.EVENT_START, {
			timestamp : this._tempstamp, scope     : this.scope || this || window
		}, CountDown.EVENT_START);
	},

	/**
	 * Stop method for CountDown
	 *
	 * @return void
	 */
	stop : function() {
		this._timerTask.stop(this._task);
		this.fireEvent(CountDown.EVENT_STOP, {
			timestamp : this._tempstamp,
			scope     : this.scope || this || window
		}, CountDown.EVENT_STOP);
	},

	/**
	 * Try to guess what's this...
	 *
	 * @var {String}    Needle we search for
	 * @var {Array}     Haystack we search in
	 *
	 * @return bool
	 */
	inArray : function(needle, haystack) {
		for (let i = 0; i < haystack.length; i++) {
			if (haystack[i] === needle) {
				return true;
			}
		}
		return false;
	},

	/**
	 * Binds the initial event handlers
	 */
	bind : function() {
		CountDown.superclass.bind.call(this);
	},

	/**
	 * Unbinds all event handlers
	 */
	unbind : function() {
		CountDown.superclass.unbind.call(this);
	}
});