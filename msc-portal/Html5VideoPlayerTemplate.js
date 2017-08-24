import Ext from '../../lib/vendor/ExtCore';
import Template from '../../lib/chaos/Template';

/**
 * Html5VideoPlayerTemplate
 * -----------------------
 *
 * Store Html5VideoPlayerTemplate Template
 * Set template config params
 *
 */
export default function Html5VideoPlayerTemplate(config) {
	Html5VideoPlayerTemplate.superclass.constructor.call(this, config);
}

Ext.extend(Html5VideoPlayerTemplate, Template, {

	/** @var {string}   html string */
	tpl : '<video id="{id}" autoplay><source src="{videoUrl}" type="video/mp4" /></video>' +
	'<div class="video-controls" draggable="false">' +
	'<span class="play-pause-btn" >' +
	'<i class="icon-play-1"></i>' +
	'<i class="icon-pause-1"></i>' +
	'</span>' +
	'<div class="current-time">00:00</div>' +
	'<div class="progress-bar">' +
	'<span class="current-progress"></span>' +
	'<span class="buffer-progress"></span>' +
	'</div>' +
	'<div class="remaining-time">00:00</div>' +
	'<div class="volume-controls">' +
	'<div class="volume-control">' +
	'<div class="volume-meter">' +
	'<span class="current-progress"></span>' +
	'</div>' +
	'</div>' +
	'<span class="volume-btn" >' +
	'<i class="icon-volume-one"></i>' +
	'<i class="icon-volume-two"></i>' +
	'<i class="icon-volume-three"></i>' +
	'<i class="icon-mute"></i>' +
	'</span>' +
	'</div>' +
	'<span class="video-fillscreen">' +
	'<i class="icon-normal-size"></i>' +
	'<i class="icon-fill-size"></i>' +
	'</span>' +
	'<span class="video-fullscreen">' +
	'<i class="icon-full-screen"></i>' +
	'<i class="icon-normal-screen"></i>' +
	'</span>' +
	'</div>',

	/**
	 * Initializer
	 *
	 * @return void;
	 */
	init : function() {
		Html5VideoPlayerTemplate.superclass.init.call(this);
	},

	/**
	 * Sets params for template to render.
	 *
	 * @param {Object} data   Apply template params
	 *
	 * @return object;
	 */
	_setTemplateParams : function(data) {
		return data;
	}
});


