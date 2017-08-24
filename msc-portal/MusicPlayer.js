import Ext from '../../lib/vendor/ExtCore';
import Chaos from '../../lib/chaos/Chaos';
import ChaosObject from '../../lib/chaos/Object';
import { Broadcaster } from '../../lib/chaos/Broadcaster';


/**
 * Music Player Component
 *
 * @class MusicPlayerComponent
 * @constructor
 * @extends Chaos.Object
 */
export default function MusicPlayer(el, config) {
	MusicPlayer.superclass.constructor.call(this, el, config);
}

/** Global Events */
MusicPlayer.MUSIC_START = 'music-start';
MusicPlayer.MUSIC_PAUSE = 'music-pause';

Chaos.extend(MusicPlayer, ChaosObject, {

	/** @var {String}                 Selector of the time counter element */
	timeSel      : '.progress em',
	/** @var {String}                 Selector of the audio element */
	audioSel     : 'audio',
	/** @var {String}                 Selector of the seeker container */
	seekerCtSel  : '.seeker_ct',
	/** @var {String}                 Selector of the seeker background element */
	seekerSel    : '.seeker_bg',
	/** @var {String}                 Selector of the seeker button element */
	seekerBtnSel : '.seeker_bg a',
	/** @var {String}                 Selector of the play button */
	playBtnSel   : '.play',
	/** @var {String}                 Type of the audio element */
	audioType    : 'audio/mpeg',

	/** PRIVATES */

	/** @var {Element}                Time counter element */
	_timeEl      : undefined,
	/** @var {Element}                Audio element */
	_audioEl     : undefined,
	/** @var {Boolean}                isPlaying boolean */
	_isPlaying   : false,
	/** @var {Element}                Seeker container element */
	_seekerCtEl  : undefined,
	/** @var {Element}                Seeker element */
	_seekerEl    : undefined,
	/** @var {Element}                Seeker button element */
	_seekerBtnEl : undefined,
	/** @var {Element}                Play button element */
	_playBtnEl   : undefined,

	/**
	 * Init
	 *
	 * @method init
	 * @param {Element} el      Element
	 * @param {Object} config   Configurables
	 *
	 * @return void
	 */
	init : function(el, config) {
		// Adding the events
		Chaos.addEvents(
			MusicPlayer.MUSIC_START,
			MusicPlayer.MUSIC_PAUSE
		);

		// Storing Audio elements
		this._noscriptEl = this.select('noscript').item(0);
		this._seekerCtEl = this.select(this.seekerCtSel).item(0);
		this._seekerEl = this.select(this.seekerSel).item(0);
		this._seekerBtnEl = this.select(this.seekerBtnSel).item(0);
		this._timeEl = this.select(this.timeSel).item(0);
		this._playBtnEl = this.select(this.playBtnSel).item(0);
		this._playBtnIconEl = this.select(this.playBtnSel + ' i').item(0);

		// Creating the audio element of noscript tag attributes
		this._createAudioElement();

		// Store instance for global access
		MusicPlayer.instance = this;

		// Removing the unnecessary noscript element
		if (this._audioEl) {
			this._noscriptEl.remove();
		}

		MusicPlayer.superclass.init.call(this, el, config);
	},

	/**
	 * Creates the audio element
	 *
	 * @method _createAudioElement
	 * @private
	 *
	 * @return void
	 */
	_createAudioElement : function() {
		this._audioEl = Ext.get(document.createElement('audio'));
		this._audioEl.dom.src = this._noscriptEl.data('src');
		this._audioEl.dom.type = this._noscriptEl.data('type');

		// Appending to the main element
		this._audioEl.appendTo(this.element);

		// Loading the source
		this._audioEl.dom.preload = 'none';
	},

	/**
	 * Pause button click event handler
	 *
	 * @method _onPlayBtnClick
	 * @private
	 * @param {event} ev
	 *
	 * @return void
	 */
	_onPlayBtnClick : function(ev) {
		ev.preventDefault();

		if (!this._audioEl.dom.paused) {
			this.pauseMusic();
		}
		else {
			this.playMusic();
		}
	},

	/**
	 * Play Music
	 *
	 * @method playMusic
	 * @public
	 *
	 * @return void
	 */
	playMusic : function() {
		if (!this._audioEl.dom.paused && (Ext.isIE || Ext.isIE11)) {
			this._audioEl.dom.load();
		}
		this._audioEl.dom.play();
		this.playTimer();

		if (this._playBtnIconEl.hasClass('icon-play')) {
			this._playBtnIconEl
				.removeClass('icon-play')
				.addClass('icon-pause');
		}

		Broadcaster.fireEvent(MusicPlayer.MUSIC_START, {});

		this._isPlaying = true;
	},

	/**
	 * Play song timer
	 *
	 * @method playTimer
	 * @public
	 *
	 * @return void
	 */
	playTimer : function() {
		var self = this;
		var pTimer = setInterval(function() {
			if (self._isPlaying) {
				var duration = self._audioEl.dom.duration;
				var currentTime = self._audioEl.dom.currentTime;
				var percent = currentTime / duration * 100;
				var minutes = Math.floor(currentTime / 60);
				var seconds = Math.floor(currentTime % 60);

				if (seconds.toString().length === 1) {
					seconds = '0' + seconds;
				}

				self._seekerEl.setStyle('width', percent + '%');
				self._timeEl.dom.innerHTML = minutes + ':' + seconds;

				// If song end
				if (currentTime === duration) {
					self.pauseMusic();
					self._seekerEl.setStyle('width', '0%');
					self._timeEl.dom.innerHTML = '0:00';

					clearInterval(pTimer);
				}
			}
		}, 50);
	},

	/**
	 * Pause Music
	 *
	 * @method pauseMusic
	 * @public
	 *
	 * @return void
	 */
	pauseMusic : function() {
		this._audioEl.dom.pause();

		if (this._playBtnIconEl.hasClass('icon-pause')) {
			this._playBtnIconEl
				.removeClass('icon-pause')
				.addClass('icon-play');
		}

		this._isPlaying = false;

		Broadcaster.fireEvent(MusicPlayer.MUSIC_PAUSE, {});
	},

	/**
	 * Pauses MusicPlayer instance if new one started
	 *
	 * @method pauseInstance
	 * @public
	 *
	 * @return void
	 */
	pauseInstance : function() {
		if (this._isPlaying) {
			this.pauseMusic();
		}
	},

	/**
	 * Finds the seeker _findSeekerPosition
	 *
	 * @method _onBodyMouseMove
	 * @private
	 * @param {event} ev
	 *
	 * @return void
	 */
	_findSeekerPosition : function(ev) {
		var seekerCtWidth = this._seekerCtEl.getWidth();
		var seekerCtLeft = this._seekerCtEl.getLeft();

		// @var Object  Mouse Position
		this._mousePos = {
			x : ev.browserEvent.pageX
		};

		var mousePosX = parseInt(this._mousePos.x, 10) - seekerCtLeft;
		var seekerPercent = mousePosX / seekerCtWidth * 100;

		if (seekerPercent < 0) {
			seekerPercent = 0;
		}

		if (seekerPercent > 100) {
			seekerPercent = 100;
		}
		this._seekerEl.setStyle('width', seekerPercent + '%');

		this._setSongCurrentPosition(seekerPercent);
	},

	/**
	 * Set song current position (for seeking)
	 *
	 * @method _setSongCurrentPosition
	 * @private
	 * @param {number} percent
	 *
	 * @return void
	 */
	_setSongCurrentPosition : function(percent) {
		var duration = this._audioEl.dom.duration,
			currentTime;

		if (isNaN(duration)) {
			return;
		}

		currentTime = duration * (percent / 100);

		this._audioEl.dom.currentTime = currentTime;
	},

	/**
	 * On Seeker container element click event handler
	 *
	 * @method _onSeekerCtnClick
	 * @private
	 * @param {event} ev
	 *
	 * @return void
	 */
	_onSeekerCtnClick : function(ev) {
		ev.preventDefault();

		this._findSeekerPosition(ev);
	},

	/**
	 * onSeeker button mousedown event handler
	 *
	 * @method _onSeekerBtnMouseDown
	 * @private
	 * @param {event} ev
	 *
	 * @return void
	 */
	_onSeekerBtnMouseDown : function(ev) {
		ev.preventDefault();

		// Load only the metadata because of tracking
		this._audioEl.dom.preload = 'metadata';
		Ext.getBody().on('mousemove', this._onBodyMouseMove, this);
		Ext.getBody().on('mouseup', this._onBodyMouseUp, this);
	},

	/**
	 * onBody mousemove event handler
	 *
	 * @method _onBodyMouseMove
	 * @private
	 * @param {event} ev
	 *
	 * @return void
	 */
	_onBodyMouseMove : function(ev) {
		this._findSeekerPosition(ev);
		this._audioEl.dom.pause();
	},

	/**
	 * onBody mouseup event handler
	 *
	 * @method _onBodyMouseUp
	 * @private
	 *
	 * @return void
	 */
	_onBodyMouseUp : function() {
		Ext.getBody().un('mousemove', this._onBodyMouseMove, this);
		Ext.getBody().un('mouseup', this._onBodyMouseUp, this);
		if (this._isPlaying) {
			this._audioEl.dom.play();
		}
	},

	/**
	 * Initial bind method.
	 *
	 * @method bind
	 *
	 * @return void
	 */
	bind : function() {
		MusicPlayer.superclass.bind.call(this);

		if (this._playBtnEl) {
			this._playBtnEl.on('click', this._onPlayBtnClick, this);
		}
		if (this._seekerBtnEl) {
			this._seekerBtnEl.on('mousedown', this._onSeekerBtnMouseDown, this);
		}
		if (this._seekerCtEl) {
			this._seekerCtEl.on('click', this._onSeekerCtnClick, this);
		}

		Broadcaster.on(
			MusicPlayer.MUSIC_START,
			this.pauseInstance,
			this
		);
	},

	/**
	 * Initial unbind method.
	 *
	 * @method unbind
	 *
	 * @return void
	 */
	unbind : function() {
		this.autoUnbind();
	}
});
