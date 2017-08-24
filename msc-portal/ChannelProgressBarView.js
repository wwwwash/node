import Ext from '../../lib/vendor/ExtCore';
import Chaos from '../../lib/chaos/Chaos';
import ChaosObject from '../../lib/chaos/Object';

/**
 * Channel progress bar view
 */
export default function ChannelProgressBarView(el, config) {
	ChannelProgressBarView.superclass.constructor.call(this, el, config);
}

Chaos.extend(ChannelProgressBarView, ChaosObject, {

	/** @var {String} progressBarContainerId Id of progress bar container */
	progressBarContainerId : 'channelProgressBarContainer',
	/** @var {String} progressBarTitleId     Id of progress bar title */
	progressBarTitleId     : 'channelCreationProgressTitle',
	/** @var {String} photoSectionCls        Class of photo section */
	photoSectionCls        : 'photos_section',
	/** @var {String} noteSectionCls         Class of note section */
	noteSectionCls         : 'note_section',
	/** @var {String} videoSectionCls        Class of video section */
	videoSectionCls        : 'video_section',
	/** @var {String} sectionCaptionCls      Class of section caption block */
	sectionCaptionCls      : 'caption',

	/**
	 * Standard init function
	 *
	 * @param {Object} el
	 * @param {Object} config
	 *
	 * @return void
	 */
	init : function(el, config) {
		ChannelProgressBarView.superclass.init.call(this, el, config);
		this._collectElements();
	},

	/**
	 * Collects the required elements to bind them
	 *
	 * @method _collectElements
	 *
	 * @return void;
	 */
	_collectElements : function() {
		this.progressBarContainerEl = Ext.get(this.progressBarContainerId);
		this.progressBarTitleEl = Ext.get(this.progressBarTitleId);

		this.photoSectionEl = this.progressBarContainerEl.select('.' + this.photoSectionCls).item(0);
		this.noteSectionEl = this.progressBarContainerEl.select('.' + this.noteSectionCls).item(0);
		this.videoSectionEl = this.progressBarContainerEl.select('.' + this.videoSectionCls).item(0);

		this.photoSectionIconEl = this.photoSectionEl.select('i').item(0);
		this.noteSectionIconEl = this.noteSectionEl.select('i').item(0);
		this.videoSectionIconEl = this.videoSectionEl.select('i').item(0);
	},

	/**
	 * Refresh the channel progress bar with new classes and text from response
	 *
	 * @method refreshProgressBar
	 * @param {Object} response    ajax response
	 *
	 * @return void;
	 */
	refreshProgressBar : function(response) {
		var data = response.json.content;
		this.photoSectionEl.dom.removeAttribute('class');
		this.photoSectionEl.addClass(`${data.posts.image.length} ${data.posts.image.color} ${this.photoSectionCls}`);
		this.noteSectionEl.dom.removeAttribute('class');
		this.noteSectionEl.addClass(`${data.posts.note.length} ${data.posts.note.color} ${this.noteSectionCls}`);
		this.videoSectionEl.dom.removeAttribute('class');
		this.videoSectionEl.addClass(`${data.posts.video.length} ${data.posts.video.color} ${this.videoSectionCls}`);

		if (this.photoSectionIconEl) {
			this.photoSectionIconEl.dom.removeAttribute('class');
			this.photoSectionIconEl.addClass(data.posts.image.icon);
		}
		if (this.noteSectionIconEl) {
			this.noteSectionIconEl.dom.removeAttribute('class');
			this.noteSectionIconEl.addClass(data.posts.note.icon);
		}
		if (this.videoSectionIconEl) {
			this.videoSectionIconEl.dom.removeAttribute('class');
			this.videoSectionIconEl.addClass(data.posts.video.icon);
		}

		if (data.posts.image.iconVisibility === 0) {
			this.photoSectionEl.addClass('hidden');
		}
		else {
			this.photoSectionEl.removeClass('hidden');
		}
		if (data.posts.note.iconVisibility === 0) {
			this.noteSectionEl.addClass('hidden');
		}
		else {
			this.noteSectionEl.removeClass('hidden');
		}
		if (data.posts.video.iconVisibility === 0) {
			this.videoSectionEl.addClass('hidden');
		}
		else {
			this.videoSectionEl.removeClass('hidden');
		}
		this.progressBarTitleEl.html(data.title);
	},

	/**
	 * Binds events
	 */
	bind : function() {
		ChannelProgressBarView.superclass.bind.call(this);
	},

	/**
	 * Unbind events
	 */
	unbind : function() {
		ChannelProgressBarView.superclass.unbind.call(this);
	}
});
