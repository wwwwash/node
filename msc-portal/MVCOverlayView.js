import TweenMax from 'gsap';

import Ext from '../../lib/vendor/ExtCore';
import Chaos from '../../lib/chaos/Chaos';
import ChaosObject from '../../lib/chaos/Object';

import Overlay from '../Overlay/Overlay';

/**
 * DMCA Static Page View
 */

export default function MVCOverlayView(el, config) {
	MVCOverlayView.superclass.constructor.call(this, el, config);
}

MVCOverlayView.EVENT_SHOW = 'overlay-show';
MVCOverlayView.EVENT_HIDE = 'overlay-hide';

Chaos.extend(MVCOverlayView, ChaosObject, {
	/** @var {String}     View name. */
	name                : 'MVCOverlayView',
	/** @var {Object}     Overlay background element [Ext.Element] */
	overlayEl           : undefined,
	/** @var {Boolean}    True to set empty the element's content after hide */
	autoDestroy         : true,
	/** @var {Boolean}    True to overwrite content if a show command called when it is already shown */
	allowOverwrite      : false,
	/** @var {Number}     Duration of animations */
	animateDuration     : 0,
	/** @var {String}     ID of the overlay container */
	overlayContainerId  : undefined,
	/** @var {String}     ID of the overlay background */
	overlayBackgroundId : 'mvc_overlay_container',
	/** @var {String}     Current animation Type */
	animationType       : undefined,

	/** @var {Boolean}    True if animation is in progress */
	_isAnimating : false,
	/** @var {Boolean}    True if an overlay is already shown */
	_isShown     : false,
	/**
	 * Standard init function
	 *
	 * @param {Object} el
	 * @param {Object} config
	 *
	 * @return void
	 */
	init         : function(el, config) {
		MVCOverlayView.superclass.init.call(this, el, config);
		this.addEvents(
			MVCOverlayView.EVENT_SHOW,
			MVCOverlayView.EVENT_HIDE
		);
		this._overlayContainerEl = Ext.get(this.overlayContainerId);
	},

	/**
	 * Renders to HTML to the DOM
	 *
	 * @method renderContent
	 * @param {Object} params   Params that contains the html content
	 *
	 * @return {Object} scope to chain
	 */
	renderContent : function(params) {
		this._appendHTMLContent(params);
		return this;
	},

	/**
	 * Appends the given content
	 *
	 * @method _appendHTMLContent
	 * @private
	 *
	 * @param {Object} params   Params that contains the html content
	 *
	 * @return void;
	 */
	_appendHTMLContent : function(params) {
		var content = params.content;
		if (content) {
			if (!this.isVisible()) {
				Ext.DomHelper.overwrite(this.overlayContainerId, content);
				this.show(params);
			}
			else if (this.allowOverwrite) {
				this._swapContent(params);
			}
		}
	},

	/**
	 * Swaps the content with the new one
	 *
	 * @method _swapContent
	 * @private
	 *
	 * @param {Object} params   Content params
	 *
	 * @return void;
	 */
	_swapContent : function(params) {
		this._hideContent(function() {
			this.fireEvent(MVCOverlayView.EVENT_HIDE,
				{
					scope             : this,
					isSwapContentHide : true
				});
			params.isSwapContent = true;
			if (!this.isVisible()) {
				Ext.DomHelper.overwrite(this.overlayContainerId, params.content);
				this.show(params);
			}
		});
	},

	/**
	 * Hides the currently displayed content (and keeps the overlay background displayed).
	 *
	 * @method _hideContent
	 *
	 * @return void;
	 */
	_hideContent : function(callback) {
		var animationParams = this._getHideAnimationParams();
		TweenMax.to(
			this.element.dom,
			this.animateDuration,
			{
				alpha           : 0,
				x               : animationParams.x,
				onCompleteScope : this,
				onComplete      : function() {
					this._isShown = false;
					this.element.display('none');
					if (typeof callback === 'function') {
						callback.call(this);
					}
				}
			}
		);
	},

	/**
	 * Returns with the parameters of the animation
	 * @param params
	 * @returns {*}
	 * @private
	 */
	_getShowAnimationParams : function(params) {
		var animationParams;
		switch (this.animationType) {
			// DEFAULT
			default:
			case Overlay.ANIMATION_TYPE_DEFAULT:
				animationParams = {
					fromParams : {},
					toParams   : {
						onCompleteScope : this,
						onComplete      : function() {
							this.fireEvent(MVCOverlayView.EVENT_SHOW, { scope : this, params : params });
						}
					}
				};
				break;
			// TYPE FALL IN
			case Overlay.ANIMATION_TYPE_FALL_IN:
				animationParams = {
					duration   : 0.8,
					fromParams : {
						y : -this.element.getHeight(false)
					},
					toParams : {
						y     : 0,
						alpha : 1,
						ease  : 'Circ.easeOut'
					}
				};
				break;
			// TYPE SLIDE FROM LEFT
			case Overlay.ANIMATION_TYPE_SLIDE_FROM_LEFT:
				animationParams = {
					fromParams : {
						x : -this.element.getWidth(false)
					},
					toParams : {
						x     : 0,
						alpha : 1
					}
				};
				break;
			case Overlay.ANIMATION_TYPE_SLIDE_FROM_RIGHT:
				animationParams = {
					fromParams : {
						x : Ext.fly(window).getWidth() + this.element.getWidth(false)
					},
					toParams : {
						x     : 0,
						alpha : 1
					}
				};
				break;
		}
		// Adding scope and callback
		animationParams.toParams.onCompleteScope = this;
		animationParams.toParams.onComplete = function() {
			this.fireEvent(MVCOverlayView.EVENT_SHOW, { scope : this, params : params });
		};
		return animationParams;
	},

	/**
	 * Returns with the hide parameters of the animation
	 *
	 * @method _getHideAnimationParams
	 *
	 * @private
	 * @returns {Object}    animationParams
	 */
	_getHideAnimationParams : function() {
		var animationParams;
		switch (this.animationType) {
			// DEFAULT
			default:
			case Overlay.ANIMATION_TYPE_DEFAULT:
				animationParams = {
					x : 0
				};
				break;
			// TYPE SLIDE FROM LEFT
			case Overlay.ANIMATION_TYPE_SLIDE_FROM_LEFT:
				animationParams = {
					x : this.element.getWidth(false)
				};
				break;
			case Overlay.ANIMATION_TYPE_SLIDE_FROM_RIGHT:
				animationParams = {
					x : -this.element.getWidth(false)
				};
				break;
		}
		return animationParams;
	},

	/**
	 * Hides the currently displayed content (and keeps the overlay background displayed).
	 *
	 * @method _showContent
	 *
	 * @return void;
	 */
	_showContent : function(params) {
		var animationParams;
		animationParams = this._getShowAnimationParams(params);
		this.element.display('block');
		TweenMax.fromTo(
			this.element.dom,
			animationParams.duration || this.animateDuration,
			animationParams.fromParams,
			animationParams.toParams
		);
	},

	/**
	 * Sets a hidden style to the overlay elements.
	 *
	 * @method _setHiddenStyle
	 * @private
	 *
	 * @return void;
	 */
	_setHiddenStyle : function() {
		var hiddenStyle = {
			display    : 'block',
			visibility : 'visible',
			opacity    : 0
		};
		this.overlayEl.setStyle(hiddenStyle);
		this._overlayContainerEl.setStyle(hiddenStyle);
	},

	/**
	 * Displays the overlay.
	 *
	 * @method show
	 * @public
	 *
	 * @return void;
	 */
	show : function(params) {
		if (this.overlayEl && !this.isVisible() && !this._isAnimating) {
			if (!params.isSwapContent) {
				this._setHiddenStyle();
			}
			this._isAnimating = true;
			TweenMax.to(
				[this.overlayEl.dom, this._overlayContainerEl.dom],
				this.animateDuration,
				{
					alpha           : 1,
					onCompleteScope : this,
					onComplete      : function() {
						Ext.getBody().addClass('overlay');
						this._onOverlayShow();
					}
				}
			);
			this._showContent(params);
		}
	},

	/**
	 * Callback when overlay become shown
	 *
	 * @method _onOverlayShow
	 * @private
	 *
	 * @return void;
	 */
	_onOverlayShow : function() {
		this._isAnimating = false;
		this._isShown = true;
	},

	/**
	 * Hides the overlay, and removes its content.
	 *
	 * @method hide
	 * @public
	 *
	 * @return void;
	 */
	hide : function(params) {
		if (this.overlayEl && this.isVisible() && !this._isAnimating) {
			this._isAnimating = true;
			TweenMax.to(
				[this.overlayEl.dom, this.element.dom],
				this.animateDuration,
				{
					alpha           : 0,
					onCompleteScope : this,
					onComplete      : function() {
						this.overlayEl.display('none');
						this.element.display('none');
						if (this.autoDestroy) {
							this.element.html('');
						}
						this._onOverlayHide();
						this.fireEvent(MVCOverlayView.EVENT_HIDE, {
							scope             : this,
							params            : params,
							isSwapContentHide : false
						});
						if (Ext.getBody().hasClass('overlay')) {
							Ext.getBody().removeClass('overlay');
						}
					}
				}
			);
		}
	},

	/**
	 * Callback when overlay become hidden.
	 *
	 * @method _onOverlayHide
	 * @private
	 *
	 * @return void;
	 */
	_onOverlayHide : function() {
		this._isAnimating = false;
		this._isShown = false;
		if (this.autoDestroy) {
			this.element.html('');
		}
		Ext.getBody().removeClass('overlay');
	},


	/**
	 * Return with the visibilty
	 *
	 * @method isVisible
	 * @public
	 *
	 * @return {Boolean}
	 */
	isVisible : function() {
		return this._isShown;
	},

	/**
	 * Renders and displays an overlay background.
	 *
	 * @method setOverlayBackground
	 * @public
	 *
	 * @return {Object} created element
	 */
	setOverlayBackground : function() {
		this._overlayBackgroundEl = Ext.get(this.overlayBackgroundId);
		return this._overlayBackgroundEl;
	}
});
