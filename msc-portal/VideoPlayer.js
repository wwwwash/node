/* eslint-disable max-statements */
/* eslint-disable complexity */

import $ from 'jquery';
import 'jquery-ui/ui/widgets/slider';

import Ext from '../../lib/vendor/ExtCore';
import Chaos from '../../lib/chaos/Chaos';
import Plugin from '../../lib/chaos/Plugin';
import Cookie from '../../lib/chaos/Cookie';
import Config from '../../lib/chaos/Config';
import { Broadcaster } from '../../lib/chaos/Broadcaster';

import Html5VideoPlayerTemplate from './Html5VideoPlayerTemplate';
import FlashVideoPlayerTemplate from './FlashVideoPlayerTemplate';

import './VideoPlayer.scss';

/**
 * Handles the video playing capabilities for the html video player.
 * Sits on the given container that consists the video tag and the predefined control elements.
 * @param {object} config
 * @constructor
 */

export default function VideoPlayer(config) {
	VideoPlayer.superclass.constructor.call(this, config);
}

VideoPlayer.EVENT_FULLSCREEN_CHANGE = 'videoplayer-fullscreen-change';
VideoPlayer.ICON_PLAY_CLASS = 'play';
VideoPlayer.ICON_PAUSE_CLASS = 'pause';
VideoPlayer.HIDE_CONTROLS_CLASS = 'hide-controls';
VideoPlayer.ICON_MUTED_CLASS = 'muted';
VideoPlayer.ICON_FILL_ON_CLASS = 'on';
VideoPlayer.SHOW_FILL_BUTTON_CLASS = 'show-fill-button';
VideoPlayer.SHOW_FULLSCREEN_BUTTON_CLASS = 'show-fullscreen-button';
VideoPlayer.SHOW_VOLUME_CONTROL_CLASS = 'show-volume-controls';
VideoPlayer.VIDEO_CONTAINER_CLASS = 'video_player_container';
VideoPlayer.MOUSE_MOVE_CONTROLS_HIDE_TIMEOUT = 3000;
VideoPlayer.FULLSCREEN_ENABLED = document.fullscreenEnabled ||
		document.mozFullScreenEnabled ||
		document.webkitFullscreenEnabled ||
		document.msFullscreenEnabled;
VideoPlayer.IS_HTML5_IGNORED = function() {return Ext.isIE9};

/**
 * Returns the formatted time.
 *
 * @param {number} time
 * @returns {string}
 */
VideoPlayer.FORMAT_TIME = function(time) {
	var minutes = Math.floor(time / 60),
		seconds = Math.floor(time % 60);
	if (typeof minutes !== 'number') {
		minutes = 0;
	}
	if (typeof seconds !== 'number') {
		seconds = 0;
	}
	return (minutes < 10 ? '0' : '') + minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
};

/**
 * Checks for mp4 support in the browser.
 *
 * @returns {bool}
 */
VideoPlayer.SUPPORTS_MP4 = (function() {
	var video = document.createElement('video');
	return video && video.canPlayType && video.canPlayType('video/mp4') !== '';
}());

Chaos.extend(VideoPlayer, Plugin, {
	_seekingInProgress        : false,
	_hiderTimeout             : undefined,
	_videoUrl                 : undefined,
	_isVolumeControlAvailable : true,
	_isFullScreenAvailable    : true,
	_isFillScreenAvailable    : true,
	video                     : undefined,
	$video                    : undefined,
	$playPauseBtn             : undefined,
	$progressBar              : undefined,
	$currentProgress          : undefined,
	$volumeMaxBtn             : undefined,
	$fullScreenBtn            : undefined,
	$fillScreenBtn            : undefined,
	$volumeMeter              : undefined,
	$currentTime              : undefined,
	$remainingTime            : undefined,
	$bufferProgress           : undefined,

	init : function(host) {
		VideoPlayer.superclass.init.call(this, host);
		this._videoUrl = host.videoUrl || this.element.data('video-url');
		this._isVolumeControlAvailable = Chaos.isDefined(host.volumeControlAvailable)
					? host.volumeControlAvailable
					: this._isVolumeControlAvailable;
		this._isFullScreenAvailable = Chaos.isDefined(host.fullScreenAvailable)
					? host.fullScreenAvailable
					: this._isFullScreenAvailable;
		this._isFillScreenAvailable = Chaos.isDefined(host.fillScreenAvailable)
					? host.fillScreenAvailable
					: this._isFillScreenAvailable;

		if (!this._videoUrl) {
			return this;
		}

		if (!VideoPlayer.SUPPORTS_MP4 || VideoPlayer.IS_HTML5_IGNORED()) {
			this._embedVideoObject();
			return this;
		}
		this.element
			.addClass(VideoPlayer.VIDEO_CONTAINER_CLASS)
			.html(new Html5VideoPlayerTemplate().render({ id : 'video_player', videoUrl : this._videoUrl }));

		this.$video = this.element.find('video');
		this.video = this.$video.get(0);
		this.$playPauseBtn = this.element.find('.play-pause-btn');
		this.$progressBar = this.element.find('.progress-bar');
		this.$currentProgress = this.$progressBar.find('.current-progress');
		this.$bufferProgress = this.$progressBar.find('.buffer-progress');
		this.$volumeMaxBtn = this.element.find('.volume-btn');
		this.$fullScreenBtn = this.element.find('.video-fullscreen');
		this.$fillScreenBtn = this.element.find('.video-fillscreen');
		this.$volumeMeter = this.element.find('.volume-meter');
		this.$currentTime = this.element.find('.current-time');
		this.$remainingTime = this.element.find('.remaining-time');

		if (this._isFullScreenEnabled()) {
			this.element.addClass(VideoPlayer.SHOW_FULLSCREEN_BUTTON_CLASS);
		}

		if (this._isVolumeControlAvailable) {
			this.element.addClass(VideoPlayer.SHOW_VOLUME_CONTROL_CLASS);
			this.setVolumeToValue(parseFloat(Cookie.get('videoPlayerVolume') || 1));
			this._updateMutedStatus(Cookie.get('videoPlayerMuted') === 'true');
		}

		this._bindVideoControls();

		return this;
	},

	/**
	 * Binds the events to the video controls, play, pause, volume, fullscreen.
	 * Also the video event listeners.
	 * @private
	 */
	_bindVideoControls : function() {
		this.$playPauseBtn.click($.proxy(this._videoPlayPause, this));
		this.$volumeMaxBtn.click($.proxy(this._onVideoVolumeControl, this));
		this.$fullScreenBtn.click($.proxy(this._onFullScreenClick, this));
		this.$fillScreenBtn.click($.proxy(this._onFillScreenClick, this));

		this.$progressBar.slider({
			min   : 0,
			max   : 100,
			value : 0,
			step  : 0.01,
			slide : $.proxy(this._onTimeSeek, this),
			stop  : $.proxy(this._onTimeSeekEnd, this),
			start : $.proxy(this._onTimeSeekStart, this)
		});
		this.$volumeMeter.slider({
			orientation : 'vertical',
			min         : 0,
			max         : 1,
			value       : this.video.volume,
			step        : 0.01,
			slide       : $.proxy(this._onVolumeSeek, this)
		});
		this.$video.bind({
			'pause play' : $.proxy(this._onVideoPlayPause, this),
			timeupdate   : $.proxy(this._onVideoTimeUpate, this),
			ended        : $.proxy(this._onVideoEnded, this),
			progress     : $.proxy(this._onProgress, this),
			loadeddata   : $.proxy(this._onLoadedData, this),
			click        : $.proxy(this._videoPlayPause, this),
			dblclick     : $.proxy(this._onFullScreenClick, this)
		});
		this.element.bind({
			mousemove               : $.proxy(this._onMouseMove, this),
			'contextmenu mousedown' : $.proxy(this._onContextMenu, this)
		});
		$(window).on('resize webkitfullscreenchange mozfullscreenchange fullscreenchange MSFullscreenChange',
			$.proxy(this._onLoadedData, this));
	},

	/**
	 * Unbinds the event listeners.
	 * @private
	 */
	_unbind : function() {
		if (this.$video) {
			this.$playPauseBtn.unbind();
			this.$volumeMaxBtn.unbind();
			this.$fullScreenBtn.unbind();
			this.$fillScreenBtn.unbind();
			this.$progressBar.unbind();
			this.$volumeMeter.unbind();
			this.$video.unbind();
			this.element.unbind();
			$(window).off('resize webkitfullscreenchange mozfullscreenchange fullscreenchange MSFullscreenChange',
				$.proxy(this._onLoadedData, this));
		}
	},

	/**
	 * Prevents right clicking on the video, to prevent video thieving.
	 * @param {Object.Event} ev
	 * @private
	 */
	_onContextMenu : function(ev) {
		ev.preventDefault();
	},

	/**
	 * Handles the mousemove event.
	 * On mousemove it toggles the controls hider class, and restarts the timer.
	 * @private
	 */
	_onMouseMove : function() {
		if (this._hiderTimeout) {
			clearTimeout(this._hiderTimeout);
			this._hiderTimeout = null;
		}
		this.element.removeClass(VideoPlayer.HIDE_CONTROLS_CLASS);
		this._hiderTimeout = setTimeout(
			$.proxy(this.element.addClass, this.element, VideoPlayer.HIDE_CONTROLS_CLASS),
			VideoPlayer.MOUSE_MOVE_CONTROLS_HIDE_TIMEOUT
		);
	},

	/**
	 * On video timeupdate updates the progressbar.
	 * @private
	 */
	_onVideoTimeUpate : function() {
		if (!this._seekingInProgress) {
			var realCurrentTime = Math.min(this.video.currentTime, this.video.duration),
				progress = Math.round(realCurrentTime / this.video.duration * 10000) / 100;
			this.$currentProgress.width(progress + '%');
			this.$progressBar.slider('option', 'value', progress);
			this.$currentTime.text(VideoPlayer.FORMAT_TIME(realCurrentTime));
			this.$remainingTime.text(VideoPlayer.FORMAT_TIME(this.video.duration - realCurrentTime));
		}
	},

	/**
	 * Handles the progress event, and draws the video buffer status.
	 * @private
	 */
	_onProgress : function() {
		if (this.video.buffered.length) {
			var realBufferTime = Math.min(this.video.buffered.end(this.video.buffered.length - 1), this.video.duration),
				progress = Math.round(realBufferTime / this.video.duration * 10000) / 100;
			this.$bufferProgress.width(progress + '%');
		}
	},

	/**
	 * Handles the video ended event. Quits from fullscreen, pauses the video and jumps to the beginning.
	 * @private
	 */
	_onVideoEnded : function() {
		this.exitFullscreen();
		this.pause();
		this.video.currentTime = 0;
	},

	/**
	 * When the metadata is loaded, we are checking a video resolution, if we need the fill button or not.
	 * @private
	 */
	_onLoadedData : function(ev) {
		this.element.toggleClass(VideoPlayer.SHOW_FILL_BUTTON_CLASS, this._canFillScreen());

		if (ev.type.indexOf('fullscreenchange') > 0) {
			var isFullscreen = this.isFullscreen();
			Broadcaster.fireEvent(VideoPlayer.EVENT_FULLSCREEN_CHANGE, { isFullscreen : isFullscreen });
		}
	},

	/**
	 * Changes the play/pause button on video play/pause events.
	 * @param {jQuery.Event} e
	 * @private
	 */
	_onVideoPlayPause : function(e) {
		switch (e.type) {
			case 'pause':
				this.$playPauseBtn.addClass(VideoPlayer.ICON_PLAY_CLASS)
					.removeClass(VideoPlayer.ICON_PAUSE_CLASS);
				break;
			case 'play':
				this.$playPauseBtn.removeClass(VideoPlayer.ICON_PLAY_CLASS)
					.addClass(VideoPlayer.ICON_PAUSE_CLASS);
				break;
		}
	},

	/**
	 * Toggles the video play/pause status.
	 * @private
	 */
	_videoPlayPause : function() {
		if (this.video.paused) {
			this.video.play();
		}
		else {
			this.video.pause();
		}
	},

	/**
	 * Mutes/unmutes the video audio.
	 * @private
	 */
	_onVideoVolumeControl : function() {
		this._updateMutedStatus(!this.video.muted);
	},

	/**
	 * Handles the time seek start event for the video time slider.
	 * @private
	 */
	_onTimeSeekStart : function() {
		this._seekingInProgress = true;
	},

	/**
	 * The time seek event handler for the video.
	 * @param {Object.Event} e
	 * @param {Object} slider   Slider object defined by the jquery ui slider.
	 * @private
	 */
	_onTimeSeek : function(e, slider) {
		this.$currentProgress.width(slider.value + '%');
	},

	/**
	 * Handles the time seek end event for the video time slider.
	 * @param {Object.Event} e
	 * @param {Object} slider   Slider object defined by the jquery ui slider.
	 * @private
	 */
	_onTimeSeekEnd : function(e, slider) {
		this._seekingInProgress = false;
		this._seekToPercent(slider.value);
	},

	/**
	 * Handles the volume seeking event for the volume slider.
	 * @param {Object.Event} e
	 * @param {Object} slider   Slider object defined by the jquery ui slider.
	 * @private
	 */
	_onVolumeSeek : function(e, slider) {
		this.setVolumeToValue(slider.value);
		this._updateMutedStatus(false, slider.value === 0);
	},

	/**
	 * Handles the fullscreen button click. Toggles the fullscreen state.
	 * @private
	 */
	_onFullScreenClick : function(ev) {
		ev.stopPropagation();
		if (this._isFullScreenEnabled()) {
			if (this.isFullscreen()) {
				this.exitFullscreen();
			}
			else {
				this.requestFullscreen();
			}
		}
	},

	/**
	 * Handles the fill screen button click.
	 * @private
	 */
	_onFillScreenClick : function() {
		this.toggleFillScreen();
	},

	/**
	 * Handles the mute classes and cookies when the video muted status changes.
	 *
	 * @param muted   The new value for the video muted property.
	 * @param toggleClass   Determines if we want to add or remove the muted class on the button.
	 * @private
	 */
	_updateMutedStatus : function(muted, toggleClass) {
		this.video.muted = muted;
		if (typeof toggleClass === 'undefined') {
			toggleClass = muted;
		}
		this.$volumeMeter.add(this.$volumeMaxBtn).toggleClass(VideoPlayer.ICON_MUTED_CLASS, toggleClass);
		Cookie.set('videoPlayerMuted', this.video.muted);
	},

	/**
	 * Sets the videos currentTime to the given percent in relation to the duration.
	 * @param {number} percent
	 * @private
	 */
	_seekToPercent : function(percent) {
		this.video.currentTime = this.video.duration * (percent / 100);
	},

	/**
	 * Toggles the fill screen method.
	 */
	toggleFillScreen : function() {
		// IE11 has it by default
		if (typeof this.video.msZoom !== 'undefined') {
			this.video.msZoom = !this.video.msZoom;
			this.$fillScreenBtn.toggleClass(VideoPlayer.ICON_FILL_ON_CLASS, this.video.msZoom);
		}
		else if (this.$video.data('transformed')) {
			$(window).off('resize', $.proxy(this._fillScreen, this));
			this.$video.data('transformed', false);
			TweenMax.to(this.$video, 0.2, { transform : 'scale(1)' });
			this.$fillScreenBtn.removeClass(VideoPlayer.ICON_FILL_ON_CLASS);
		}
		else {
			$(window).on('resize', $.proxy(this._fillScreen, this));
			this._fillScreen();
			this.$fillScreenBtn.addClass(VideoPlayer.ICON_FILL_ON_CLASS);
		}
	},

	/**
	 * Calculates the scale ratio for filling the screen.
	 * @returns {number}   scale ratio
	 * @private
	 */
	_getScaleRatio : function() {
		var holderRatio = this.$video.width() / this.$video.height(),
			videoRatio = this.video.videoWidth / this.video.videoHeight;
		return holderRatio > videoRatio ? holderRatio - videoRatio + 1 : videoRatio - holderRatio + 1;
	},

	/**
	 * Determines if the screen can be filled or not.
	 * @returns {boolean}   Returns if we should display the fill button or not.
	 * @private
	 */
	_canFillScreen : function() {
		return this._isFillScreenAvailable &&
			Math.floor(this._getScaleRatio() * 100) !== 100;
	},

	/**
	 * Sets the element scaling by the calculated value.
	 * @private
	 */
	_fillScreen : function() {
		var scaleRatio = this._getScaleRatio();
		this.$video.data('transformed', true);
		if (arguments[0]) {
			this.$video.css('transform', 'scale(' + scaleRatio + ')');
		}
		else {
			TweenMax.to(this.$video, 0.2, { transform : 'scale(' + scaleRatio + ')' });
		}
		this.element.toggleClass(VideoPlayer.SHOW_FILL_BUTTON_CLASS, this._canFillScreen());
	},

	_embedVideoObject : function() {
		this.element.html(new FlashVideoPlayerTemplate().render({
			id            : 'flash_player',
			videoUrl      : this._videoUrl,
			playerSrc     : Config.get('videoPlayerFlashSrc'),
			contolSrc     : Config.get('advancedMediaControlFlashSrc'),
			volumeVisible : this._isVolumeControlAvailable ? 1 : 0
		}));
	},

	_isFullScreenEnabled : function() {
		return VideoPlayer.FULLSCREEN_ENABLED && this._isFullScreenAvailable;
	},

	/**
	 * Takes the video to fullscreen.
	 * @return void;
	 */
	requestFullscreen : function() {
		var container = this.element.get(0);
		if (container.requestFullscreen) {
			container.requestFullscreen();
		}
		else if (container.mozRequestFullScreen) {
			container.mozRequestFullScreen();
		}
		else if (container.webkitRequestFullScreen) {
			container.webkitRequestFullScreen();
		}
		else if (container.msRequestFullscreen) {
			container.msRequestFullscreen();
		}
	},

	/**
	 * Handles the crossbrowser exit fullscreen api call.
	 */
	exitFullscreen : function() {
		if (document.exitFullscreen) {
			document.exitFullscreen();
		}
		else if (document.mozCancelFullScreen) {
			document.mozCancelFullScreen();
		}
		else if (document.webkitExitFullscreen) {
			document.webkitExitFullscreen();
		}
		else if (document.msExitFullscreen) {
			document.msExitFullscreen();
		}
	},

	/**
	 * Returns the fullscreen state of the browser, considering multiple brower apis.
	 * @returns {boolean}
	 */
	isFullscreen : function() {
		return Boolean(document.fullscreenElement || document.mozFullScreenElement ||
		document.webkitFullscreenElement || document.msFullscreenElement);
	},

	/**
	 * Sets the volume value to the given. Also stores to cookies.
	 * @param {Number} volume   New volume value
	 */
	setVolumeToValue : function(volume) {
		this.$volumeMeter.find('span.current-progress').height(volume * 100 + '%');
		this.video.volume = volume;
		this.$volumeMaxBtn.attr('data-volume-level',
			volume < 0.25 ? 0 : volume < 0.5 ? 1 : volume < 0.75 ? 2 : 3); // eslint-disable-line
		Cookie.set('videoPlayerVolume', volume);
	},

	/**
	 * Returns the video container for appending pleasure.
	 * @returns {*|jQuery|HTMLElement}
	 */
	getVideoElement : function() {
		return this.element;
	},

	/**
	 * Pauses the video.
	 */
	pause : function() {
		this.video.pause();
	},

	/**
	 * Plays the video.
	 */
	play : function() {
		this.video.play();
	},

	/**
	 * Loads the video.
	 */
	load : function() {
		this.video.load();
	},

	/**
	 * Unbinds the event listeners from the video, and removes it safely from the DOM.
	 * @return void;
	 */
	remove : function() {
		this._unbind();
		if (this.video) {
			try {
				this.video.pause();
				this.video.src = '';
				this.video.load();
				$(this.video).remove();
			}
			catch (e) {
				/* develblock:start */
				console.log('Video element already deleted');
				/* develblock:end */
			}
		}
		delete this.$video;
		delete this.video;
	}
});

