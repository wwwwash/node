import TweenMax from 'gsap';

import Ext from '../../../lib/vendor/ExtCore';
import Chaos from '../../../lib/chaos/Chaos';
import ChaosObject from '../../../lib/chaos/Object';

import './MemberProfile.scss';

/**
 * Parent Controller for the member profile overlay
 */
export default function MemberProfile(el, config) {
	MemberProfile.superclass.constructor.call(this, el, config);
}

Chaos.extend(MemberProfile, ChaosObject, {

	/** @var {String}           left arrow id */
	leftArrowId     : 'profile_leftArrow',
	/** @var {String}           right arrow id */
	rightArrowId    : 'profile_rightArrow',
	/** @var {String}           active image cls */
	imgActiveCls    : 'active',
	/** @var {String}           under active image cls */
	imgPreActiveCls : 'preActive',

	/** @var {Object}           Left arrow element */
	_leftArrowEl     : undefined,
	/** @var {Object}           Right arrow element */
	_rightArrowEl    : undefined,
	/** @var {Object}           All images in the gallery */
	_galleryImageEls : undefined,
	/** @var {Object}           Overlay Ext.element */
	_overlayEl       : undefined,
	/** @var {Object}           The count of the loaded gallery images */
	_loadedImagesCnt : 0,
	/**
	 * Init
	 *
	 * @param {Element} el      This should be the body tag.
	 * @param {Object} config   Config object of this controller
	 */
	init             : function(el, config) {
		this._overlayEl = this.overlayCmp._overlayElement;
		this._leftArrowEl = Ext.get(this.leftArrowId);
		this._rightArrowEl = Ext.get(this.rightArrowId);
		this._galleryImageEls = this._overlayEl.select('img');

		// If not enough images for stepping
		if (this._galleryImageEls.elements.length < 2) {
			if (this._leftArrowEl) {
				this._leftArrowEl.hide();
			}
			if (this._rightArrowEl) {
				this._rightArrowEl.hide();
			}
		}

		// Add active class for the first image
		this._galleryImageEls.item(0).addClass(this.imgActiveCls);
		this._galleryImageEls.item(0).setOpacity(1);

		MemberProfile.superclass.init.call(this, el, config);
	},

	/**
	 *
	 * @param ev
	 */
	onLeftArrowClick : function(ev) {
		ev.preventDefault();

		this.showImage('prev');
	},

	/**
	 *
	 * @param ev
	 */
	onRightArrowClick : function(ev) {
		ev.preventDefault();

		this.showImage('next');
	},

	/**
	 * Shows the previous - next image.
	 *
	 * @param direction next|prev
	 */
	showImage : function(direction) {
		var nextEl,
			customProps;

		if (TweenMax.isTweening(this._galleryImageEls.elements)) {
			return;
		}

		var activeEl = this._overlayEl.select('img' + this.imgActiveCls.dot()).item(0),
			firstEl = Ext.get(this._galleryImageEls.elements[0]),
			lastEl = Ext.get(this._galleryImageEls.elements[this._galleryImageEls.elements.length - 1]),
			// Animation constant properties
			animProps = {
				opacity    : 1,
				onComplete : function() {

				}
			};

		switch (direction) {
			case 'prev':
				nextEl = activeEl.prev('img') ? activeEl.prev('img') : lastEl;
				this.handleLazyLoad(nextEl.dom);
				nextEl.setStyle('left', 'auto');
				nextEl.setRight(640);
				// supplement object , that contains variable animation properties
				customProps = {
					right : 0
				};
				break;
			case 'next':
			default:
				nextEl = activeEl.next('img') ? activeEl.next('img') : firstEl;
				this.handleLazyLoad(nextEl.dom);
				nextEl.setStyle('right', 'auto');
				nextEl.setLeft(640);
				// supplement object , that contains variable animation properties
				customProps = {
					left : 0
				};
				break;
		}

		// Merge 2 anim property objects
		Ext.apply(animProps, customProps);

		nextEl.setOpacity(0);
		activeEl.radioClass(this.imgPreActiveCls);
		nextEl.radioClass(this.imgActiveCls);

		TweenMax.to(
			nextEl.dom,
			0.3,
			animProps
		);
	},

	/**
	 *
	 * @param {HTMLElement} el The image element.
	 */
	handleLazyLoad : function (el) {
		if (el.src.indexOf('data:') + 1) {
			el.src = el.dataset.src;
		}
	},

	/**
	 *
	 */
	onImageLoaded : function() {
		this._loadedImagesCnt++;

		var self = this,
			activeImgEl = this._overlayEl.select('img' + this.imgActiveCls.dot()).item(0);

		if (this._loadedImagesCnt === this._galleryImageEls.getCount()) {
			TweenMax.to(
				activeImgEl.dom,
				0.3,
				{
					opacity    : 1,
					onComplete : function() {
						self._galleryImageEls.setOpacity(1);
					}
				}
			);
		}
	},

	/**
	 * Binds events
	 */
	bind : function() {
		MemberProfile.superclass.bind.call(this);

		if (this._leftArrowEl) {
			this._leftArrowEl.on('click', this.onLeftArrowClick, this);
		}
		if (this._rightArrowEl) {
			this._rightArrowEl.on('click', this.onRightArrowClick, this);
		}

		this._galleryImageEls.on('load', this.onImageLoaded, this);
	},

	/**
	 * Unbind events
	 */
	unbind : function() {
		this.autoUnbind();
	}
});
