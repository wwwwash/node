import Ext from '../vendor/ExtCore';
import Chaos from './Chaos';
import ChaosObject from './Object';

/**
 * Timer osztaly, mely idozitokent szolgal, barmely ezt a funkcionalitast igenylo feladatnal
 * Elonye, hogy akarhany peldanyt futtatunk belole, mindig csak egy setInterval hivas fog futni a hatterben, mely jelentos eroforrast sporol meg szamunkra
 * Ezen felul kotheto ra esemenykezelo, így egy jol kezelheto modon (closurek es lambda fv-ek nelkul) hasznalhatjuk.
 *
 * //Felhasznalasi ajanlas
 * var timer = new ChaosTimer({ repeatCount : 1, delay : 1000 });//Termeszetesen osztaly valtozokent is peldanyosithao.
 * timer.on(ChaosTimer.TimerEvent.TIMER, this.timerEventHandler, this);
 * timer.start();
 *
 * //Timer esemenykezeloje, mely 'delay' idokozonkent lefut, osszesen 'repeatCount' alkalommal (repeatcount == 0 eseten folyamatos)
 * timerEventHandler: function (ev) {
 *		//Do something
 *		this.sendAjaxRequest(
 *	    //If you wanna stop then reset
 *		if(wannaStop){
 *			timer.reset();
 *		}
 * }
 *
 * Timer osztaly konstruktora
 * @param config
 * @constructor
 */
export default function ChaosTimer(config) {
	var defaultConfig = {};
	config = Ext.applyIf(config, defaultConfig);
	this.originalConfig = config;

	//A konfig propertyket atalakitja "osztaly" memberekke
	Ext.apply(this, config);

	//Inicializalas
	this.init(config);
}

/**
 * Interval identifier
 * @var {int}
 */
ChaosTimer.interval = 0;

/**
 * A regisztralt timer peldanyokat tartalmazo tomb
 * @var {array}
 */
ChaosTimer.runningTimers = [];

/**
 * Timer esemenyek objektuma/listaja
 * @var {object}
 */
ChaosTimer.TimerEvent = {};

/**
 * Timer esemeny konstans
 * @var {String}
 */
ChaosTimer.TimerEvent.TIMER = 'ChaosTimer.TimerEvent.TIMER';

/**
 * Timer esemeny konstans
 * @var {String}
 */
ChaosTimer.TimerEvent.TIMER_COMPLETE = 'ChaosTimer.TimerEvent.TIMER_COMPLETE';

/**
 * Timer tick metodusa/ A setInterval kezelo fuggvenyekent szolgalo metodus
 */
ChaosTimer.update = function() {
	var actTime,
		i,
		lgth,
		timer;

	actTime = (new Date()).getTime();
	lgth = ChaosTimer.runningTimers.length - 1;
	for (i = lgth; i >= 0; i--)	{
		timer = ChaosTimer.runningTimers[i];
		if (!timer || !timer.running)		{
			continue;
		}

		if (actTime - timer.lastFired < timer.delay)		{
			continue;
		}
		else		{
			timer.currentCount++;
			timer.lastFired = actTime;
			timer.fireEvent(ChaosTimer.TimerEvent.TIMER, timer.startArgs);

			if (timer.currentCount == timer.repeatCount && timer.repeatCount > 0)			{
				timer.stop();
				timer.fireEvent(ChaosTimer.TimerEvent.TIMER_COMPLETE, { });
			}
		}
	}
};

/**
 * Leallitja az osszes regisztralt timert
 */
ChaosTimer.stopAll = function() {
	var i = 0,
		lgth = ChaosTimer.runningTimers.length - 1;

	for (i = lgth; i >= 0; i--) {
		var timer = ChaosTimer.runningTimers[i];
		if (timer)		{
			timer.stop();
		}
	}
};

/**
 * Leallitja a timerek szamlalojanak alapjaul szolgalo setintervalt
 */
ChaosTimer.shutdown = function() {
	ChaosTimer.stopAll();
	clearInterval(ChaosTimer.interval);
};

/**
 * Globalis timer inicializalo metodus, ha meg nincs elinditva a setinterval szamlalo, akkor elinditja
 */
ChaosTimer.init = function () {
	if (!ChaosTimer.interval)	{
		ChaosTimer.interval = setInterval(ChaosTimer.update, 50);
	}
};

/**
 * Timer osztaly
 */
Chaos.extend(ChaosTimer, Ext.util.Observable, {
	/** @var {int}                Azt jelzi, hogy hanyszor futott mar le a timer */
	currentCount : 0,
	/** @var {int}                Azt a timestampet tarolja, amikor a timer legutoljara lefutott */
	lastFired    : 0,
	/** @var {int}                Azt jelzi, hogy a timer eppen fut e vagy sem */
	running      : false,
	/** @var {int}                A timer inditasanak idejet tarolja*/
	startTime    : 0,
	/** @var {int}                A timer futasanak idointervallumat tarolja millisecundumban / Ennyi idokozonkent fut le a timer */
	delay        : 0,
	/** @var {int}                Ennyiszer fog lefutni a timer */
	repeatCount  : 0,
	/** @var {int}                This arguments can be usable when we start the timer */
	startArgs    : undefined,

	/**
	 * Init
	 *
	 * @param {Object} config   Config object of this component
	 */
	init : function(config) {
		// new event appeared in ChaosTimer: init / fires when init was started.
		this.addEvents({
			init        : true,
			// create custom event for Chaos.Log
			'chaos-log' : true
		});

		// fire event init event to be caught by other components (plugins for instance)
		this.fireEvent(ChaosObject.EVENT_INIT, this);

		// add event to Chaos.Log
		if (Chaos.Log && Chaos.Log.log) {
			this.on(ChaosObject.EVENT_CHAOS_LOG, Chaos.Log.log, this);
		}

		// bind events and listeners listed in this array
		if (this.listeners instanceof Object) {
			// definde scope
			var scope = listeners.scope || this || window;

			// iterate through items
			for (var listenerName in listeners) {
				// one listener
				var listener = listeners[listenerName];

				// if listener name is not "scope" or other reserved word then bind listener to the event
				if (!listenerName.match(this.noEventName)) {
					this.on(listenerName, listener, scope);
				}
			}
		}

		//Elinditjuk a globalis timert ha meg nem fut
		ChaosTimer.init();
	},

	/**
	 * Timer inditasa
	 *
	 * @var {Object} args We are able to pass an arguments object to the started fn
	 *
	 * @return void
	 */
	start : function(args) {
		if (this.running) {
			return;
		}

		this.startArgs = args;

		this.startTime = (new Date()).getTime();
		this.lastFired = this.startTime;
		this.running = true;

		ChaosTimer.runningTimers.push(this);
	},

	/**
	 * Timer leallitasa
	 *
	 * @return void
	 */
	stop : function() {
		this.running = false;
		this.startArgs = undefined;

		var idx = ChaosTimer.runningTimers.indexOf(this);
		if (idx != -1) {
			ChaosTimer.runningTimers.splice(idx, 1);
		}
	},

	/**
	 * Timer resetelese es megallitasa
	 *
	 * @return void
	 */
	reset : function() {
		this.stop();
		this.currentCount = 0;
	},

	/**
	 * Ujraindit
	 */
	restart : function(args) {
		if (typeof args === 'undefined') {
			var args = null;
		}

		this.reset();
		this.start(args);
	}
});
