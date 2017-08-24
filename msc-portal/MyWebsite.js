import $ from 'jquery';

import Ext from '../../../lib/vendor/ExtCore';
import Chaos from '../../../lib/chaos/Chaos';
import Page from '../../../lib/chaos/Page';
import { Broadcaster } from '../../../lib/chaos/Broadcaster';
import CONST from '../../../lib/constant/Constants';

import Ajax from '../../Ajax/Ajax';
import VideoPlayer from '../../Video/VideoPlayer';
import Overlay from '../../Overlay/Overlay';

import './MyWebsiteLanding.scss';

/**
 * Standalone My Website Page
 * ------------------------------
 *
 * @param Object el       the element
 * @param Object config   config object
 */

export default function MyWebsiteIndex(el, config) {
	MyWebsiteIndex.superclass.constructor.call(this, el, config);
}

Chaos.extend(MyWebsiteIndex, Page, {

	/** @var {String} openedCls                 Class name of the opened state */
	openedCls               : 'opened',
	/** @var {String} videoPlayingCls           Class name of the playing container */
	videoPlayingCls         : 'video_playing',
	/** @var {Number} videoPlayDelay            Delay time for the video play */
	videoPlayDelay          : 5000,
	/** @var {String} getRecommendedDomainUrl   Url of the recommended domain request */
	getRecommendedDomainUrl : 'MyWebsite/GetRecommendedDomains',
	/** @var {String}                           Available now text element selector */
	availableNowSel         : '.available_now',

	/**
	 * Standard init function
	 *
	 * @method init
	 * @param {Object} el
	 * @param {Object} config
	 *
	 * @return void
	 */
	init : function(el, config) {
		// Elements
		this._websiteContainerEl = this.element.select('.js-website-container').item(0);
		this._websiteDomainContainerEl = this.element.select('.js-my-website-domains-container').item(0);
		this._wantMyWebsiteButtonEl = this.element.select('.js-website-create-button').item(0);
		this._requirementsShowButtonEl = this.element.select('.js-requirements-show-button').item(0);

		this._availableDomainCheckCount = 0;
		this._checkAvailableDomainNames();

		this._initWebsiteVideo();
		// Call parent class init
		MyWebsiteIndex.superclass.init.call(this, el, config);
	},

	/**
	 * Website video player init
	 *
	 * @method _initWebsiteVideo
	 *
	 * @return void
	 */
	_initWebsiteVideo : function() {
		this._videoPlayer = new VideoPlayer().init({
			element : $('.js-video-player-container')
		});
		this._videoPlayer.pause();
		this._websiteVideoEl = Ext.get('video_player');
		this._websiteVideoEl.on('ended', this._onWebsiteVideoEnd, this);
	},

	/**
	 * Handles the video play and pause
	 *
	 * @method _playPauseWebsiteVideo
	 *
	 * @return void
	 */
	_playPauseWebsiteVideo : function() {
		if (!this._videoPlayer.video.paused) {
			this._websiteContainerEl.addClass(this.videoPlayingCls);
			this._videoPlayer.play();
		}
		else {
			this._videoPlayer.pause();
		}
	},

	/**
	 * Video eneded event handler
	 *
	 * @method _onWebsiteVideoEnd
	 *
	 * @return void
	 */
	_onWebsiteVideoEnd : function() {
		this._websiteContainerEl.removeClass(this.videoPlayingCls);
	},

	/**
	 * Event handler of the website reserve ajax request
	 *
	 * @param {String} url  url of the request
	 *
	 * @return void
	 */
	_checkAvailableDomainNames : function() {
		Ajax.request({
			url     : Chaos.getUrl(this.getRecommendedDomainUrl, {}, {}, ''),
			scope 	 : this,
			success : this._onCheckAvailableDomainNamesRequestSuccess,
			error 	 : this._onCheckAvailableDomainNamesRequestError,
			failure : this._onCheckAvailableDomainNamesRequestError,
			method	 : CONST.GET
		});
	},

	/**
	 * Success handler of the domain name ajax request
	 *
	 * @param {Object} response
	 *
	 * @return void
	 */
	_onCheckAvailableDomainNamesRequestSuccess : function(response) {
		var _data = response.json.data;

		if (response.json.status === 'OK' && _data && _data.block !== '') {
			this._websiteDomainContainerEl.dom.innerHTML = _data.block;
			this.element.select(this.availableNowSel).item(0).jq().fadeIn(500);
			this._otherDomainsContainerEl = this.element.select('.js-other-domains').item(0);
			var checkedDomainUrl = this._otherDomainsContainerEl
				.select('input[type=radio]:checked').item(0).data('url');
			this._otherDomainsContainerEl.jq().fadeIn(500);
			if (this._wantMyWebsiteButtonEl) {
				this._wantMyWebsiteButtonEl.dom.setAttribute('href', checkedDomainUrl);
				this._wantMyWebsiteButtonEl.dom.removeAttribute('disabled');
			}
			if (this._requirementsShowButtonEl) {
				this._requirementsShowButtonEl.dom.removeAttribute('disabled');
			}
		}
		else if (response.json.status === 'ERROR') {
			this._onCheckAvailableDomainNamesRequestError(_data);
		}
	},

	/**
	 * Error handler of the domain name ajax request
	 *
	 * @param {Object} response
	 *
	 * @return void
	 */
	_onCheckAvailableDomainNamesRequestError : function(data) {
		/* develblock:start */
		console.warn('Status error after domain request: ', data);
		/* develblock:end */

		if (this._availableDomainCheckCount < 3) {
			this._checkAvailableDomainNames();
			this._availableDomainCheckCount += 1;
		}
		else if (data && data.block !== '') {
			this._websiteDomainContainerEl.dom.innerHTML = data.block;
		}
	},

	/**
	 * Handles click on label element
	 *
	 * @method _onDomainLabelElClick
	 *
	 * @return void
	 */
	_onDomainLabelElClick : function(ev, target) {
		var targetEl = Ext.get(target);
		var actualRadioEl = Ext.get(targetEl.dom.getAttribute('for').toString());
		if (this._wantMyWebsiteButtonEl) {
			this._wantMyWebsiteButtonEl.dom.setAttribute('href', actualRadioEl.data('url'));
		}
	},

	/**
	 * Handles overlay ready state
	 *
	 * @method _onOverlayReady
	 *
	 * @return void
	 */
	_onOverlayReady : function() {
		this._videoPlayer && this._videoPlayer.pause();
	},

	/**
	 * Handles click on the create my website button when we need to show the requirements
	 *
	 * @method _onRequirementsShowButtonClick
	 *
	 * @return void
	 */
	_onRequirementsShowButtonClick : function(ev) {
		ev.preventDefault();

		this._requirementsShowButtonEl.jq().protipShow(
			{
				trigger : 'sticky',
				title   : '#requirement_check'
			}
		);
	},

	/**
	 * Initial bind method.
	 *
	 * @method bind
	 *
	 * @return void
	 */
	bind : function() {
		this.parentClass.constructor.superclass.bind.call(this);

		this.element.on('click', this._onDomainLabelElClick, this, {
			delegate : '.js-domain-label'
		});
		this.element.on('click', this._playPauseWebsiteVideo, this, {
			delegate : '.js-video-player-container'
		});

		this.element.on('click', this._onRequirementsShowButtonClick, this, {
			delegate : '.js-requirements-show-button'
		});

		Broadcaster.on(Overlay.OVERLAY_READY, this._onOverlayReady, this);
	},

	/**
	 * Initial unbind method.
	 *
	 * @method unbind
	 *
	 * @return void
	 */
	unbind : function() {
		this._websiteVideoEl.un('ended', this._onWebsiteVideoEnd, this);
		this.autoUnbind();
	}
});
