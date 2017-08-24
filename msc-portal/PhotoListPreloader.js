import Ext from '../../lib/vendor/ExtCore';
import ChaosObject from '../../lib/chaos/Object';
import ChaosTimer from '../../lib/chaos/Timer';

/**
 * PhotoListPreloaderComponent. Preloads and shows the given photo list
 */
export default function PhotoListPreloader(el, config) {
	PhotoListPreloader.superclass.constructor.call(this, el, config);
}

/**
 *
 */
Ext.extend(PhotoListPreloader, ChaosObject, {

	/** @var {String}               REQUIRED AT INSTANTIATING - Selector of the image boxes that we want to preload */
	imageBoxSel       : undefined,
	/** @var {String}               Class that indicates loading state on photo boxes */
	loadingCls        : 'loading',
	/** @var {String}               Pattern to recognize and separate URL from CSS value */
	_uriPattern       : undefined,
	/** @var {String}               Timer that removes loading class after X seconds from boxes. in case of trouble. */
	_imageLoadedTimer : undefined,

	/**
	 * AdvancedTextarea komponens
	 * @param   {type} el     Az elem
	 * @param   {type} config
	 *
	 * @return  void
	 */
	init : function(el, config) {
		// Check imageBoxSel existance - It must be set at instantiating!
		if (typeof this.imageBoxSel === 'undefined') {
			/* develblock:start */
			console.warn('imageBoxSel variable is not set!');
			/* develblock:end */
			return;
		}

		this._uriPattern = /\b((?:[a-z][\w-]+:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))/ig; // eslint-disable-line

		this.preload();

		// call parent's init
		PhotoListPreloader.superclass.init.call(this, el, config);
	},

	/**
	 * Run preload logic
	 */
	preload : function() {
		// Remove loading class (fade in) when a given image is loaded.
		var preloadImgs = {},
			self = this;

		this.element.select(this.imageBoxSel).each(function() {
			var bgImg = this.getStyle('background-image').match(self._uriPattern)[0],
				imgId = this.id,
				imgEl = Ext.get(imgId);

			preloadImgs[imgId] = new Image();

			// Remove loading class from the given image when it is loaded
			preloadImgs[imgId].onload = function() {
				self.forceLoadPhoto(imgEl);
			};

			preloadImgs[imgId].src = bgImg;
		});
		// Start an automatic, delayed loading class remover task. In case of any trouble, it will remove the loading class after 10 secs.
		this._imageLoadedTimer = new ChaosTimer({
			repeatCount : 1,
			delay       : 10000
		});

		this._imageLoadedTimer.un(ChaosTimer.TimerEvent.TIMER, this.forceLoadPhoto, this);
		this._imageLoadedTimer.on(ChaosTimer.TimerEvent.TIMER, this.forceLoadPhoto, this);
		this._imageLoadedTimer.start();
	},

	/**
	 * In case of any trouble (JS cant recognize image loaded state after 10 seconds), we can remove loading class from all photos.
	 *
	 * @param {Object}img Optional. Ext.Element or Ext.CompositeElement. If not set, all boxes forced to loaded state.
	 */
	forceLoadPhoto : function(img) {
		var elements = img || this.element.select(this.imageBoxSel);
		elements.removeClass(this.loadingCls);
	},

	/**
	 * Binds all basic event listeners.
	 *
	 * @return void
	 */
	bind : function() {
		PhotoListPreloader.superclass.bind.call(this);
	},

	/**
	 * Unbinds all basic event listeners.
	 *
	 * @return void
	 */
	unbind : function() {
		PhotoListPreloader.superclass.unbind.call(this);
	}
});
