import Ext from '../../lib/vendor/ExtCore';
import Chaos from '../../lib/chaos/Chaos';
import Config from '../../lib/chaos/Config';
import { Broadcaster } from '../../lib/chaos/Broadcaster';

import VideoPlayer from './VideoPlayer';
import Overlay from '../Overlay/Overlay';

/**
 *
 * VideoPlayerOverlay : videoplayer overlay creator
 *
 */
export default function VideoPlayerOverlay(el, config) {
	VideoPlayerOverlay.superclass.constructor.call(this, el, config);
}

Chaos.extend(VideoPlayerOverlay, Overlay, {

	/** @var {String}             Selector of the video overlay buttons  */
	overlayBtnSel : '.videoOverlayBtn',

	/** @var {String}             The next-prev video overlay buttons' selector  */
	_loadOverlayBtnSel : '.loadVideoBtn',

	/** @var {String}             The video container selector  */
	_videoPlayerCtnSel : '.video_player_container',

	/**
	 * Init
	 *
	 * @param {Element} el      This should be the body tag.
	 * @param {Object} config   Config object of this component
	 */
	init : function(el, config) {
		VideoPlayerOverlay.superclass.init.call(this, el, config);
	},

	/**
	 * Instantiates the Video Player Plugin
	 *
	 * @public
	 *
	 * @return void;
	 */
	initVideoPlayer : function() {
		this._videoCtnEl = this._overlayElement.select(this._videoPlayerCtnSel).item(0);

		if (this._videoCtnEl) {
			var videoUrl = this._videoCtnEl.data('video-url');
			this._videoPlayer = new VideoPlayer().init({
				element  : $(this._videoCtnEl.dom),
				videoUrl : videoUrl
			});
		}
	},

	/**
	 * Handles overlay buttons , next-prev btns in the video player overlay
	 *
	 * @param ev
	 * @param target
	 */
	newOverlayButtonsEventHandler : function(ev, target) {
		ev.stopEvent();

		// Store the link element
		var anchor = this._clickedElement = target.tagName.toLowerCase === 'a'
						? target
						: Ext.get(target).findParent('a'),
			videoUrl = anchor.getAttribute('href');

		this.loadVideo(videoUrl);
	},

	closePopupEventHandler : function(ev, target, data) {
		//csak ESC billentyure zarjunk be.
		if (ev && ev.type === 'keyup' && ev.keyCode !== 27) {
			return;
		}
		if (ev) {
			ev.preventDefault();
			ev.stopPropagation();
		}

		//Kimentem a top erteket ahova majd vissza kell pozicionalni
		var windowTop = this._mainContainerElement.dom.offsetTop;

		//elrejtjuk az elemeket
		this.changeDisplay(this._overlayElement, 'none');
		this.changeDisplay(this._overlayObj, 'none');

		// Overlay closed
		Config.set('isOverlayOpened', false);

		//leszedjuk az esemenykezeloket
		Ext.fly(window).un('resize', this.resizeOverlayContainer, this)
			.un('keyup', this.closePopupEventHandler, this)
			.un('keyup', this.galleryKeyUpHandler, this);
		this._overlayObj.un('click', this.closePopupEventHandler, this);

		//A main container visszaallitasa eredetire
		this.setElementStyle(
			'',
			this,
			{
				element  : this._mainContainerElement,
				position : 'relative',
				top      : 0,
				left     : 0
			}
		);

		// Fire an event about closing the overlay
		this.fireEvent(Overlay.CLOSE_OVERLAY, this);

		// allitsuk vissza a poziciot eredetire
		window.scrollTo(0, Math.abs(windowTop));

		//toroljuk a DOM-bol ha kell
		if (data && data.destroyPopup) {
			var el = this.getOverlayContentElement().dom.children[0];

			if (el) {
				el.remove();
			}
		}

		//Bezaras utan frissiti az oldalt
		if (this._refreshAfterClosure) {
			window.location.reload();
		}
		// Ha nem lesz oldalfrissites akkor unbindeljuk es megsemmisitjuk a datasendert, hogy ne kavarjon be
		else {
			this._dataSender.unbind();
			delete this._dataSender;
			Broadcaster.fireEvent(Overlay.OVERLAY_UNBIND_CMPS);
		}

		// Plain window resize
		$(window).trigger('resize');

		// Remove the video player
		if (this._videoCtnEl && this._videoPlayer) {
			this._videoPlayer.remove();
		}
	},

	/**
	 * Loads a given video.
	 *
	 * @param videoUrl String   URL of the video to load
	 *
	 * @return void;
	 */
	loadVideo : function(videoUrl) {
		if (this._videoCtnEl) {
			this._videoPlayer.remove();
			this._videoPlayer = new VideoPlayer().init({
				element  : this._videoCtnEl.jq(),
				videoUrl : videoUrl
			});
		}
		this.setNextPrev();
	},

	/**
	 * Bind event listeners
	 */
	bind : function() {
		VideoPlayerOverlay.superclass.bind.call(this);
		Broadcaster.on(Overlay.OVERLAY_READY, this.initVideoPlayer, this);
	},

	/**
	 * Unbind event listeners
	 */
	unbind : function() {
		this.autoUnbind();
	}

});