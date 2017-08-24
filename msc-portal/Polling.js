import Ext from '../vendor/ExtCore';
import Chaos from './Chaos';

export default function ChaosPolling() {}

/**
 * Check the ChaosPolling instance, if it doesn't exists, create one, and return it.
 *
 * @returns The instance
 */
ChaosPolling.getInstance = function() {
	if (!(ChaosPolling.prototype.instance instanceof ChaosPolling)) {
		ChaosPolling.prototype.instance = new ChaosPolling();
	}
	return ChaosPolling.prototype.instance;
};

Chaos.extend(ChaosPolling, Ext.util.Observable, {
	/** @var {Number}             The base interval of polling. The Polling Events can be ran in N x PollingBaseInterval */
	pollingBaseInterval : 3000,
	/** @var {Array}              Array of Polling Objects. It is fillable from everywhere. IntervalChecker get poll data from it. Structure can be found in the documentation */
	_pollingObjects     : [],
	/** @var {Number}             Running the base timer since.... in milliseconds */
	_runtime            : 0,

	/**
	 * Init
	 * @param {Object} config   Config object of this component
	 */
	init : function() {
		var baseTask = {
			run      : this.intervalChecker,
			interval : this.pollingBaseInterval,
			scope    : this
		};

		var runner = new Ext.util.TaskRunner();

		var runPolling = new Ext.util.DelayedTask(function() {
			runner.start(baseTask);
		});
		runPolling.delay(this.pollingBaseInterval);
	},

	/**
	 * Checking that a poll is needed at this cycle
	 */
	intervalChecker : function() {
		this._runtime += this.pollingBaseInterval;
		var runtimePeriods = this._runtime / this.pollingBaseInterval;

		for (var i in this._pollingObjects) {
			var obj = this._pollingObjects[i];
			if (!('identify' in obj)) {
	            continue;
			}
			// Paused? do not run the callback.
			if (obj.paused == false && runtimePeriods % obj.intervalPeriods == 0) {
				// Run the event
				obj.callbackFn.apply(obj.scope, [obj.params]);
			}
		}
	},

	/**
	 *  Add an event to Polling Objects Array
	 * @param config
	 */
	addPollEvent : function(config) {
		// Cancel fn, if Poll Event is existing with the same identify
		for (var i in this._pollingObjects) {
			if (this._pollingObjects[i].identify == config.identify) {
				return;
			}
		}

		var obj = {
			identify        : config.identify,
			paused          : false,
			intervalPeriods : config.intervalPeriods,
			scope           : config.scope,
			params          : config.params,
			callbackFn      : config.callbackFn
		};

		this._pollingObjects.push(obj);
	},

	/**
	 * Removes poll event from the polling object by identifier.
	 *
	 * @param identify Identify of the event to remove from Polling
	 */
	removePollEvent : function(identify) {
		for (var i in this._pollingObjects) {
			if (this._pollingObjects[i].identify == identify) {
				delete this._pollingObjects[i];
			}
		}
	},

	/**
	 * Pausing a poll event.
	 *
	 * @param identify Identofy of the event to remove from Polling
	 */
	pausePollEvent : function(identify) {
		for (var i in this._pollingObjects) {
			if (this._pollingObjects[i].identify == identify) {
				this._pollingObjects[i].paused = true;
			}
		}
	},

	/**
	 * Continues a poll event.
	 *
	 * @param identify Identofy of the event to remove from Polling
	 */
	continuePollEvent : function(identify) {
		for (var i in this._pollingObjects) {
			if (this._pollingObjects[i].identify == identify) {
				this._pollingObjects[i].paused = false;
			}
		}
	}

});
