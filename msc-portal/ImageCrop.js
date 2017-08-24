/* eslint-disable complexity */

import $ from 'jquery';

import Ext from '../../lib/vendor/ExtCore';
import Chaos from '../../lib/chaos/Chaos';
import ChaosObject from '../../lib/chaos/Object';

import './ImageCrop.scss';
/**
 *
 * ImageCrop: image cropper tool
 *
 */
export default function ImageCrop(el, config) {
	ImageCrop.superclass.constructor.call(this, el, config);
}

/** Constants */
ImageCrop.RATIO_169 = 16 / 9;
ImageCrop.RATIO_43 = 4 / 3;
ImageCrop.RATIO_11 = 1 / 1;
ImageCrop.RATIO_21 = 2 / 1;
ImageCrop.ACTION_MOVE = 'move';
ImageCrop.ACTION_RESIZE = 'resize';
ImageCrop.ACTION_PINCH = 'pinch';

ImageCrop.DIR_DOWN = 'down';
ImageCrop.DIR_ALL = 'all';
ImageCrop.DIR_SCALE = 'scale';
/** Events */
ImageCrop.EVENT_IMG_NOT_LOADED = 'crop-img-not-loaded';
ImageCrop.EVENT_INITED = 'cropper-inited';


Chaos.extend(ImageCrop, ChaosObject, {

	/** @var {Number} minWidth                  The minimum width */
	minWidth : 0,

	/** @var {Number|Float} ratio               Ratio, set from the constants */
	ratio : 0,

	/** @var {String} downMaxRatio              Max ratio to resize the scroller down */
	downMaxRatio : 1,

	/** @var {String} imageUrl                  The image URL to be loaded */
	imageUrl : undefined,

	/** @var {Number} originalWidth             The original width of the source image */
	originalWidth : 0,

	/** @var {Number} originalHeight            The original height of the source image */
	originalHeight : 0,

	/** @var {String} cropTableId               ID of the imageCropTable */
	cropPictureId : 'cropPicture',

	/** @var {String} downResizerCls            The down resizer knob element's cls */
	downResizerCls : 'down',

	/** @var {String} saveToHiddens             Do we need saving to hidden inputs ? */
	saveToHiddens : false,

	/** @var {String} resizedCls                Crop image is resized to its display size (not the real size) */
	resizedCls : 'resized',

	/** @var {String} cropTableWindowResizeCls  Class on crop table if the window is resizing right now */
	cropTableWindowResizeCls : 'window-resizing',

	/** @var {Object} cls                       CSS classes */
	cls : {
		toolBlock : 'tool',
		resize    : 'resize',
		show      : 'show'
	},

	/** @var {String} _action                   Move vs Resize */
	_action : undefined,

	/** @var {Object} _ev                       Just for storing the current event object */
	_ev : undefined,

	/** @var {Object} _targetEl                 Current event target element. Resize point or the tool itself. */
	_targetEl : undefined,

	/** @var {Object} _resizeEl                 The resizer point element */
	_resizeEl : undefined,

	/** @var {Object} _toolEl                   The tool element */
	_toolEl : undefined,

	/** @var {Object} _imageEl                  Image element which is shown in the crop component */
	_imageEl : undefined,

	/** @var {Number} _windowX                  Current X mouse position relative to window */
	_windowX : 0,

	/** @var {Number} _windowY                  Current Y mouse position relative to window */
	_windowY : 0,

	/** @var {Number} _elemPosLeft              Current left position of the tool el */
	_elemPosLeft : 0,

	/** @var {Number} _elemPosTop               Current top position of the tool el */
	_elemPosTop : 0,

	/** @var {Number} _startOffsetX             Offset to be deducted in position calculation */
	_startOffsetX : 0,

	/** @var {Number} _startOffsetY             Offset to be deducted in position calculation */
	_startOffsetY : 0,

	/** @var {Number} _startPosX                Start position of the tool */
	_startPosX : 0,

	/** @var {Number} _startPosY                Start position of the tool */
	_startPosY : 0,

	/** @var {Number} _startToolTop             Start position of the tool box */
	_startToolTop : 0,

	/** @var {Number} _startToolLeft            Start position of the tool box */
	_startToolLeft : 0,

	/** @var {Number} _minLeft                  Minimum left value that can be assigned for the tool element */
	_minLeft : 0,

	/** @var {Number} _minTop                   Minimum top value that can be assigned for the tool element */
	_minTop : 0,

	/** @var {Number} _maxLeft                  Maximum left value that can be assigned for the tool element */
	_maxLeft : 0,

	/** @var {Number} _maxTop                   Maximum top value that can be assigned for the tool element */
	_maxTop : 0,

	/** @var {Number} _wrapperWidth             The width of the wrapper element */
	_wrapperWidth : 0,

	/** @var {Number} _wrapperHeight            The height of the wrapper element */
	_wrapperHeight : 0,

	/** @var {Number} _toolWidth                The width of the tool element */
	_toolWidth : 0,

	/** @var {Number} _toolHeight               The height of the tool element */
	_toolHeight : 0,

	/** @var {Number} _toolMinWidth             Minimum tool width */
	_toolMinWidth : 0,

	/** @var {Number} _toolMaxWidth             Maximum tool width */
	_toolMaxWidth : 0,

	/** @var {Number} _toolMaxHeight            Maximum tool height */
	_toolMaxHeight : 0,

	/** @var {Number} _displayRatio             Ratio of the displayed image. originalWidth / displayedWidth */
	_displayRatio : 0,

	/** @var {Object} _refreshSecurityTimeout   Run a security timeout when we start loading the image. If imgonload not fires, we call a close overlay method or something. */
	_refreshSecurityTimeout : undefined,


	/** @var {Number} _toolCorrectionMultiplier If the image size changes (rotate) , we can resize the tool by 1.X percent. */
	_toolCorrectionMultiplier : 1,
	/** @var {String} _prevDirection            Storing the previously changed dimension */
	_prevDirection            : undefined,
	/** @var {Boolean} _resizeEnabled           Enable or disable resizing of the tool. internally used. */
	_resizeEnabled            : true,

	/**
	 * Init
	 *
	 * @param {Element} el      This should be the body tag
	 * @param {Object} config   Config object of this component
	 */
	init : function(el, config) {
		this.addEvents(
			ImageCrop.EVENT_IMG_NOT_LOADED,
			ImageCrop.EVENT_INITED
		);

		this._toolEl = this.element.select(this.cls.toolBlock.dot()).item(0);
		this._cropPictureEl = Ext.get(this.cropPictureId);

		var imageDomEl = this._cropPictureEl.select('img').item(0);

		this.attachImgOnload(imageDomEl);

		// If imageUrl set, load it
		if (this.imageUrl) {
			imageDomEl.dom.src = this.imageUrl;
		}

		ImageCrop.superclass.init.call(this, el, config);
	},

	/**
	 * Init procedures after image has been loaded
	 */
	initAfterImgLoad : function() {
		// Get some initial elements and data
		this._resizeEl = this._toolEl.child('span');
		this._imageEl = this.element.select('img').item(0);

		this._cropPictureEl.removeClass(this.cropTableWindowResizeCls);

		window.clearTimeout(this._refreshSecurityTimeout);
		delete this._refreshSecurityTimeout;

		// Remove loader gif and fade in image
		this.fadeInImage(this._imageEl);

		this._wrapperHeight = this._imageEl.getHeight();
		this._wrapperWidth = this._imageEl.getWidth();

		this.originalHeight = this._imageEl.dom.naturalHeight;
		this.originalWidth = this._imageEl.dom.naturalWidth;

		// Set final display ratio
		this.setDisplayRatio();

		// Init cage values
		this.setBorders();

		// Set tool init dimensions and apply
		this.initToolDimensions();

		// Set default values to hiddens
		this.getResults();

		this.fireEvent(ImageCrop.EVENT_INITED);
	},

	/**
	 * Fades in the image by animating its opacity
	 *
	 * @param img Image Ext.Element
	 */
	fadeInImage : function(img) {
		// Remove loader GIF from background
		this._cropPictureEl.setStyle('background', 'none');

		TweenMax.to(
			img.dom,
			0.5,
			{
				opacity : 1
			}
		);
	},

	/**
	 * Calculates and applies inital tool dimensions
	 */
	initToolDimensions : function() {
		this._toolEl.setStyle({
			top    : 0,
			left   : 0,
			width  : this._toolMinWidth + 'px',
			height : this._toolMinWidth / this.ratio + 'px'
		});
		this._toolHeight = this._toolEl.getHeight() * this._toolCorrectionMultiplier;
		this._toolWidth = this._toolEl.getWidth() * this._toolCorrectionMultiplier;
		this._toolEl.addClass(this.cls.show);
	},

	/**
	 * Result getter
	 */
	getResults : function() {
		// Prepared results
		var returnObj = {
			x1 : null,
			y1 : null,
			x2 : null,
			y2 : null
		};

		// Get pixel based values
		returnObj.x1 = parseInt(this._toolEl.getLeft(true) * this._displayRatio, 10);
		returnObj.y1 = parseInt(this._toolEl.getTop(true) * this._displayRatio, 10);
		returnObj.x2 = parseInt((this._toolEl.getLeft(true) + this._toolEl.getWidth()) * this._displayRatio, 10);
		returnObj.y2 = parseInt((this._toolEl.getTop(true) + this._toolEl.getHeight()) * this._displayRatio, 10);

		// Convert to percentage based values
		returnObj.x1 = parseInt(returnObj.x1 / (this.originalWidth / 100), 10);
		returnObj.y1 = parseInt(returnObj.y1 / (this.originalHeight / 100), 10);
		returnObj.x2 = parseInt(returnObj.x2 / (this.originalWidth / 100), 10);
		returnObj.y2 = parseInt(returnObj.y2 / (this.originalHeight / 100), 10);

		// Set form values if saveToHiddens is true, otherwise store in a global variable
		if (this.saveToHiddens) {
			for (let i in returnObj) {
				if (returnObj.hasOwnProperty(i)) {
					document.querySelector('#' + i).value = returnObj[i];
				}
			}
		}

		return returnObj;
	},

	/**
	 * Tool position calculator
	 */
	calcToolPos : function() {
		// Prepared return object
		var returnObj = {
			left : '0px',
			top  : '0px'
		};

		// Calc pos
		returnObj.left = parseInt(this._windowX - this._elemPosLeft
				+ parseInt(this._targetEl.getStyle('left'), 10) - this._startOffsetX, 10) + 'px';
		returnObj.top = parseInt(this._windowY - this._elemPosTop
				+ parseInt(this._targetEl.getStyle('top'), 10) - this._startOffsetY, 10) + 'px';

		// Check min
		returnObj.left = parseInt(returnObj.left, 10) < this._minLeft ? this._minLeft + 'px' : returnObj.left;
		returnObj.top = parseInt(returnObj.top, 10) < this._minTop ? this._minTop + 'px' : returnObj.top;

		// Check max
		returnObj.left = parseInt(returnObj.left, 10) > this._maxLeft ? this._maxLeft + 'px' : returnObj.left;
		returnObj.top = parseInt(returnObj.top, 10) > this._maxTop ? this._maxTop + 'px' : returnObj.top;

		return returnObj;
	},

	/**
	 * Calculates maximum position
	 */
	calcMaxPos : function() {
		this._maxLeft = this._wrapperWidth - this._toolWidth;
		this._maxTop = this._wrapperHeight - this._toolHeight;
	},

	/**
	 * Calculates maximum tool dimensions
	 */
	calcMaxDim : function() {
		this._toolMaxWidth = this._wrapperWidth - parseInt(this._toolEl.getLeft(true), 10);
		this._toolMaxHeight = this._wrapperHeight - parseInt(this._toolEl.getTop(true), 10);
	},

	/**
	 * Calculates new tool dimensions on resize
	 * @param {Number} scale Amount of scale if needed
	 */
	calcToolDimension : function(scale) {
		// Direction of resizing. Undefined or 'all' is for both direction. If scale is set, the direction is scale.
		var direction, newWidth, newHeight;
		if (typeof scale === 'number') {
			direction = ImageCrop.DIR_SCALE;
		}
		else if (this._targetEl.hasClass(this.downResizerCls)) {
			direction = ImageCrop.DIR_DOWN;
		}
		else {
			direction = ImageCrop.DIR_ALL;
		}

		// Prepared return object
		var returnObj = {};

		// If the previous changed dimension was different than the actual
		if (typeof this._prevDirection !== 'undefined' && this._prevDirection !== direction) {
			// Changing direction to ALL
			if (direction === ImageCrop.DIR_ALL) {
				this.onChangeDirectionToAll();
			}
		}
		// Calc dimension
		switch (direction) {
			case ImageCrop.DIR_DOWN:
				newHeight = this._toolHeight - (this._startPosY - this._windowY);
				returnObj.width = this._toolWidth - this._toolEl.getBorderWidth('lr') + 'px';
				returnObj.height = newHeight + 'px';
				break;
			case ImageCrop.DIR_SCALE:
				newWidth = this._toolWidth * scale;
				newHeight = parseInt(newWidth / this.ratio, 10);

				returnObj.width = newWidth + 'px';
				returnObj.height = newHeight + 'px';
				break;
			case ImageCrop.DIR_ALL:
			default:
				newWidth = this._toolWidth - (this._startPosX - this._windowX);
				returnObj.width = newWidth + 'px';
				returnObj.height = parseInt(newWidth / this.ratio, 10) + 'px';

				break;
		}

		returnObj = this.applyMaxDimensionRules(direction, returnObj);
		this._prevDirection = direction;

		return returnObj;
	},

	/**
	 * You can set dimension rules to each directions.
	 *
	 * @param direction
	 * @param newDimensions new dimensions calculated by calcToolDimension()
	 * @returns {*}
	 */
	applyMaxDimensionRules : function(direction, newDimensions) {
		if (typeof direction === 'undefined') {
			direction = ImageCrop.DIR_ALL;
		}
		// Common rules ( prevent to go outside the img etc.)

		// Check for min left - pinch
		if (parseInt(newDimensions.left, 10) && parseInt(newDimensions.left, 10) < 0) {
			newDimensions.left = '0px';
		}

		// Check for max left - pinch
		if (parseInt(newDimensions.left, 10) && parseInt(newDimensions.left, 10) > this._maxLeft) {
			newDimensions.left = this._maxLeft + 'px';
		}

		// Check for min top - pinch
		if (parseInt(newDimensions.top, 10) && parseInt(newDimensions.top, 10) < 0) {
			newDimensions.top = '0px';
		}

		// Check for max top - pinch
		if (parseInt(newDimensions.top, 10) && parseInt(newDimensions.top, 10) > this._maxTop) {
			newDimensions.left = this._maxTop + 'px';
		}

		// Check for min width
		if (parseInt(newDimensions.width, 10) < parseInt(this._toolMinWidth, 10)) {
			newDimensions.width = this._toolMinWidth + 'px';
			newDimensions.height = parseInt(this._toolMinWidth / this.ratio, 10) + 'px';
		}

		// Check for max width
		if (parseInt(newDimensions.width, 10) > this._toolMaxWidth) {
			newDimensions.width = this._toolMaxWidth + 'px';
			newDimensions.height = parseInt(this._toolMaxWidth / this.ratio, 10) + 'px';
			newDimensions.height = parseInt(this._toolMaxWidth / this.ratio, 10) + 'px';
		}

		// Direction specific rules
		switch (direction) {
			case ImageCrop.DIR_DOWN:
				// Check for max height (not taller than image)
				if (parseInt(newDimensions.height, 10) > this._toolMaxHeight) {
					delete newDimensions.width;
					newDimensions.height = this._toolMaxHeight + 'px';
				}
				// Check for max height (not taller than downMaxRatio)
				if (parseInt(newDimensions.height, 10) > parseInt(this._toolWidth * this.downMaxRatio, 10)) {
					delete newDimensions.width;
					newDimensions.height = this._toolWidth * this.downMaxRatio;
				}
				// Check for min height
				if (parseInt(newDimensions.height, 10) < parseInt(newDimensions.width, 10) * this.ratio) {
					newDimensions.width = parseInt(newDimensions.width, 10) + 'px';
					newDimensions.height = parseInt(newDimensions.width, 10) * this.ratio + 'px';
				}
				break;
			case ImageCrop.DIR_SCALE:
			case ImageCrop.DIR_ALL:
			default:
				// Check for max height
				if (parseInt(newDimensions.height, 10) > this._toolMaxHeight) {
					newDimensions.width = parseInt(this._toolMaxHeight * this.ratio, 10) + 'px';
					newDimensions.height = this._toolMaxHeight + 'px';
				}
				break;
		}

		return newDimensions;
	},

	/**
	 * If the resize direction changes from other to 'all'.
	 * We enabling animated resize to jump back to 1:1 ratio
	 */
	onChangeDirectionToAll : function() {
		this._resizeEnabled = false;
		this._toolEl.addClass('resizingTransition');

		this._toolEl.on({
			webkitTransitionEnd : this.onChangeDirectionTransitionEnd,
			transitionend       : this.onChangeDirectionTransitionEnd,
			msTransitionEnd     : this.onChangeDirectionTransitionEnd,
			oTransitionEnd      : this.onChangeDirectionTransitionEnd,
			scope               : this,
			single              : true
		});
	},

	/**
	 * When you change the direction of resizing from 'down' to 'all', an animation start to
	 * jump back to 1:1 ratio, and this is the transitionend method of the animation.
	 */
	onChangeDirectionTransitionEnd : function() {
		this._resizeEnabled = true;
		this._toolEl.removeClass('resizingTransition');
	},

	/**
	 * Move handler
	 */
	doMove : function() {
		this._targetEl.setStyle(this.calcToolPos());
	},

	/**
	 * Resize handler
	 *
	 * @param {Number} scale Amount of scale if we pinch the tool
	 */
	doResize : function(scale) {
		if (this._resizeEnabled) {
			this._toolEl.setStyle(this.calcToolDimension(scale));
		}
	},

	/**
	 * Sets action based on
	 */
	setAction : function(ev) {
		// Set action to pinch
		if (ev.type === 'pinchstart') {
			this._action = ImageCrop.ACTION_PINCH;
			return;
		}

		// Set action to move
		if (this._targetEl.hasClass(this.cls.toolBlock)) {
			this._action = ImageCrop.ACTION_MOVE;
			return;
		}

		// Set action to resize
		if (this._targetEl.hasClass(this.cls.resize)) {
			this._action = ImageCrop.ACTION_RESIZE;
			return;
		}

		this._action = undefined;
	},

	/**
	 * Sets the display ratio based on the original image width and wrapper width
	 */
	setDisplayRatio : function() {
		this._displayRatio = this.originalWidth / this._wrapperWidth;
	},

	/**
	 * Sets initial value borders
	 */
	setBorders : function() {
		this._toolMinWidth = parseInt(this.minWidth / this._displayRatio, 10) * this._toolCorrectionMultiplier;
		this._toolMinHeight = parseInt(this.minHeight / this._displayRatio, 10) * this._toolCorrectionMultiplier;
		this._toolWidth = this._toolEl.getWidth();
		this._toolHeight = this._toolEl.getHeight();
	},

	/**
	 * On mouse down
	 *
	 * @param {Object} e       Event object
	 */
	onMouseDown : function(e) {
		if (typeof this._toolEl === 'undefined') {
			return;
		}
		this._targetEl = Ext.get(e.target);

		this.setAction(e);

		this._startOffsetX = e.center.x - this._targetEl.getX();
		this._startOffsetY = e.center.y - this._targetEl.getY();
		this._startPosX = e.center.x;
		this._startPosY = e.center.y;
		this._startToolLeft = this._toolEl.getLeft(true);
		this._startToolTop = this._toolEl.getTop(true);

		this.setBorders();
		this.calcMaxPos();
		this.calcMaxDim();
	},

	/**
	 * On mouse move
	 *
	 * @param {Object} e       Event object
	 */
	onMouseMove : function(e) {
		this._windowX = e.center.x;
		this._windowY = e.center.y;
		this._elemPosLeft = this._targetEl.getX();
		this._elemPosTop = this._targetEl.getY();
		this._ev = e;

		switch (this._action) {
			case ImageCrop.ACTION_MOVE:
				this.doMove();
				break;
			case ImageCrop.ACTION_RESIZE:
				this.doResize();
				break;
			case ImageCrop.ACTION_PINCH:
				this.doResize(e.scale);
				break;
		}
	},

	/**
	 * On mouse up
	 */
	onMouseUp : function() {
		if (typeof this._toolEl === 'undefined') {
			return;
		}
		this.getResults();
	},

	/**
	 * On window resize
	 */
	onWindowResize : function() {
		this._cropPictureEl.addClass(this.cropTableWindowResizeCls);
		if (this._resizeTimeout) {
			clearTimeout(this._resizeTimeout);
		}
		this._resizeTimeout = setTimeout(this.initAfterImgLoad.bind(this), 1000);
	},

	/**
	 * Attaches onLoad event to the passed dom element
	 *
	 * @param img DOM element
	 */
	attachImgOnload : function(img) {
		var self = this;
		// Run a security timeout when we start loading the image. If imgonload not fires, we call a close overlay method.
		this._refreshSecurityTimeout = window.setTimeout(function() {
			self.fireEvent(ImageCrop.EVENT_IMG_NOT_LOADED);
		}, 10000);

		img.on('load', this.initAfterImgLoad, this);
	},

	/**
	 * Esemenykezelok feliratkozasa
	 */
	bind : function() {
		ImageCrop.superclass.bind.call(this);

		Ext.fly(window)
				.on('resize', this.onWindowResize, this)
				.on('orientationchange', this.onWindowResize, this);

		if (this._hammer) {
			this._hammer.destroy();
		}

		$(window).on('touchmove', function(e) {
			e.preventDefault();
		});

		this._hammer = new Hammer(this._toolEl.dom)
				.on('pinchstart panstart', this.onMouseDown.bind(this))
				.on('pinchmove panmove', this.onMouseMove.bind(this))
				.on('pinchend panend', this.onMouseUp.bind(this));

		this._hammer.get('pan').set({ enable : true, threshold : 1 });
		this._hammer.get('pinch').set({ enable : true });

		Ext.fly(window).on('blur', this.onMouseUp, this);
	},

	/**
	 * Esemenykezelok torlese
	 */
	unbind : function() {
		ImageCrop.superclass.unbind.call(this);
	}
});