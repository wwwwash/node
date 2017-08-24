/**
 * Draggable Plugin v0.2
 *
 * Adds easy support for drag and drop elements.
 * The plugin will pass different arguments to callbacks.
 * Supports axis movement and container locking.
 * It can create a clone to move.
 *
 * Usage:
 * $('#element').draggable({
 *     item: '.item',
 *     clone: true,
 *     positionFixed: true,
 *     animateDrop: 250
 * });
 *
 * @package    jQuery.Plugin
 * @subpackage DraggableComponent
 * @author     winter (Victor Vincent)
 */

import $ from 'jquery';

import './jquery.dragable.scss';

// Constants
var DATA_DRAGGABLE_INSTANCE = 'draggableInstance',

	CLASS_CLONE = 'draggable-clone',
	CLASS_DRAGGING = 'draggable-dragging',
	CLASS_STATE_DRAGGING = 'draggable-state-dragging',
	CLASS_HOVER = 'draggable-hover',

	SELECTOR_ITEM = '.draggable-item',
	SELECTOR_BODY = 'body',
	SELECTOR_CLONE = '.' + CLASS_CLONE,
	SELECTOR_UNTARGETABLE = 'draggable-untargetable',

	EVENT_MOUSEUP = 'mouseup',
	EVENT_MOUSEDOWN = 'mousedown',
	EVENT_MOUSEMOVE = 'mousemove',
	EVENT_MOUSEOVER = 'mouseover',
	EVENT_MOUSEENTER = 'mouseenter',
	EVENT_MOUSELEAVE = 'mouseleave',

	SELF_EVENT = {
		DRAG_START   : 'draggable-dragstart',
		DRAG_MOVE    : 'draggable-dragmove',
		DRAG_END     : 'draggable-dragend',
		ITEM_IN      : 'draggable-itemin',
		ITEM_OUT     : 'draggable-itemout',
		DROPZONE_IN  : 'draggable-dropzone-in',
		DROPZONE_OUT : 'draggable-dropzone-out'
	},

	CSS_FIXED = 'fixed',

	PX = 'px',
	NONE = 'none',
	MOVE = 'move',
	DIV = 'div';

// Add draggable to the jQuery element prototype
$.fn.draggable = function(options) {
	// Recursive call if element collection is passed
	if (this.length > 1) {
		this.each(function() {
			$(this).draggable(options);
		});
	}
	else {
		// Save the instance on the element
		this.data(DATA_DRAGGABLE_INSTANCE, new DraggableClass(this, options));
	}

	return this;
};

// Add destroy to element
$.fn.draggableDestroy = function() {
	this.data(DATA_DRAGGABLE_INSTANCE).destroy();
};

// Singleton to access event constants
$.draggable = SELF_EVENT;

// Declare class
var DraggableClass = function(el, options) {
	options = options || {};
	this.init(el, options);
};

// Extend it's prototype
$.extend(true, DraggableClass.prototype, {

	/** @var _defaults {Object}      Default options */
	_defaults : {
		/** @var {String} item The selector to be used for draggable items. */
		item          : SELECTOR_ITEM,
		/** @var [String] handler The selector to be used as a handler inside the item. If not provided, the element will be used itself. */
		handler       : undefined,
		/** @var [String] dropzone Only allow to drop items into this zone. */
		dropzone      : undefined,
		/** @var {String} untargetable A selector for untargetable elements. Actions on this element won't trigger drag inside a draggable element. */
		untargetable  : SELECTOR_UNTARGETABLE,
		/** @var {Bool} Y Only allow to move item on Y-axis. */
		Y             : false,  // @TODO implement
		/** @var {Bool} X Only allow to move item on X-axis. */
		X             : false,  // @TODO implement
		/** @var {Bool} clone Move only a clone element instead of moving the original one. */
		clone         : false,
		/** @var {Bool} positionFixed Indicates of our drag-zone is in a position: fixed; element so it will count in at calculations. */
		positionFixed : false,
		/** @var {Number} animateDrop Tells us how much to animate our element at drop state in milliseconds. */
		animateDrop   : 0,
		/** @var {Bool} lock Indicates if we want to lock moving into a container. */
		lock          : false,  // @TODO implement
		/** @var {Callback} onStart */
		onStart       : $.noop, // @TODO implement
		/** @var {Callback} onEnd */
		onEnd         : $.noop, // @TODO implement
		/** @var {Callback} onMove */
		onMove        : $.noop  // @TODO implement
	},

	/**
	 * Constructor
	 *
	 * @param el        {jQuery}    Wrapper element holding
	 * @param options   [Object]    Custom settings
	 */
	init : function(el, options) {
		this._options = $.extend({}, this._defaults, options);
		this._el = {};
		this._el.dragzone = el;
		this._el.dropzone = this._getDropzone();
		this._el.clone = undefined;
		this._dragOffset = { X : 0, Y : 0 };
		this._isDragging = false;
		this._isAnimating = false;
		this._ie = this._detectIE();
		this._didMouseMove = false;

		this._setHandler();
		this._bind();
	},

	/**
	 * Destructor
	 */
	destroy : function() {
		this._unbind();
	},

	/**
	 * Gets the the dropzone based on the options:
	 * this._options.dropzone === true      The element itself
	 * this._options.dropzone == string     Selector
	 * this._options.dropzone == falsy      Body Element
	 *
	 * @returns {jQuery}
	 * @private
	 */
	_getDropzone : function() {
		if (this._options.dropzone === true) {
			return this._el.dragzone;
		}
		else if (this._options.dropzone) {
			return $(this._options.dropzone);
		}
		return $(SELECTOR_BODY);
	},

	/**
	 * Sets the handler element based on the given options.
	 * If no handler selector provided the item selector will be used itself.
	 *
	 * @private
	 */
	_setHandler : function() {
		this._options.handler = this._options.handler || this._options.item;
	},

	/**
	 * Create the clone element if needed.
	 *
	 * @private
	 */
	_setClone : function(el) {
		if (this._options.clone) {
			this._el.clone = el.clone(true, true).addClass(CLASS_CLONE).css({
				position      : CSS_FIXED,
				zIndex        : 300,
				width         : el.outerWidth() + PX,
				height        : el.outerHeight() + PX,
				left          : el.offset().left,
				top           : el.offset().top,
				pointerEvents : NONE
			});
		}
		else {
			this._el.clone = el;
		}
	},

	/**
	 * Drag event handler.
	 *
	 * @param ev {jQuery.Event}
	 * @returns {*}
	 * @private
	 */
	_onMouseDown : function(ev) {
		var el = $(ev.currentTarget);

		// Return in case the clicked elements should be untargetable
		if (el.hasClass(CLASS_DRAGGING) || this._isAnimating || this._isDragging || ev.target.className.indexOf(this._options.untargetable) > -1
			|| $(ev.target).parent('.' + this._options.untargetable).length) {return}

		this._isDragging = true;
		this._el.entered = el;
		this._el.dragging = el;
		this._dragOffset.X = el.offset().left - ev.originalEvent.clientX;
		this._dragOffset.Y = el.offset().top - ev.originalEvent.clientY;

		if (this._ie && this._ie < 11) {
			this._dragOffset.Y =
				el.offset().top
				- el.height()
				- ev.originalEvent.clientY
				- this._dragOffset.Y
				+ $(window).scrollTop();
		}

		this._setClone(el);

		if (this._options.clone) {
			this._el.clone.insertAfter(el);
		}

		el.addClass(CLASS_DRAGGING);
		$(SELECTOR_BODY).addClass(CLASS_STATE_DRAGGING);

		return this._cancelEvent(ev);
	},

	/**
	 * On Mouse Move Event Handler
	 * @param ev {Object} jQuery Event Object
	 * @returns {boolean}
	 * @private
	 */
	_onMouseMove : function(ev) {
		if (!this._isDragging || this._isAnimating) {
			return;
		}
		var x = ev.originalEvent.clientX;
		var y = ev.originalEvent.clientY;

		if (this._options.positionFixed) {
			y -= $(window).scrollTop();
		}

		this._el.clone.css({
			left : x + this._dragOffset.X + 'px',
			top  : y + this._dragOffset.Y + 'px'
		});

		this._isInsertBefore = this._el.dragging.index() > this._el.entered.index();
		this._didMouseMove = true;

		return this._cancelEvent(ev);
	},

	/**
	 * On Mouse Up Event Handler
	 * @private
	 */
	_onMouseUp : function(ev) {
		if (!this._isDragging || this._isAnimating) {
			return;
		}

		var offset = this._el.dragging.offset();
		offset.top -= $(window).scrollTop();
		this._isDragging = false;
		this._isAnimating = true;

		this._el.clone.animate(offset, this._didMouseMove ? this._options.animateDrop : 0, $.proxy(function() {
			this._isAnimating = false;
			this._el.clone.remove();
			this._el.dragging.removeClass(CLASS_DRAGGING);

			var isMouseOver = this._pointIsInsideElement(this._el.dragging, ev.clientX, ev.clientY);

			if (isMouseOver) {
				this._el.dragging.addClass(CLASS_HOVER);
			}

			this._didMouseMove = false;

			$(SELECTOR_BODY).removeClass(CLASS_STATE_DRAGGING);

			if (typeof this._options.onEnd === 'function') {
				this._options.onEnd.call(this, this._el.dragging);
			}
		}, this));
	},

	/**
	 * Checks that point is inside an element.
	 * @param {Object} el The jQuery element
	 * @param {Number} x The X coord of the point
	 * @param {Number} y The Y coord of the point
	 * @returns {boolean} is inside or not
	 * @private
	 */
	_pointIsInsideElement : function(el, x, y) {
		// IE9 and over
		var bounds = el[0].getBoundingClientRect(),
			yOk = y >= bounds.top && y <= bounds.top + bounds.height,
			xOk = x >= bounds.left && x <= bounds.left + bounds.width;

		return xOk && yOk;
	},

	/**
	 * On Mouse Over Event Handler
	 * @param ev {Object} jQuery Event Object
	 * @private
	 */
	_onMouseOver : function(ev) {
		if (!this._isDragging) {
			return;
		}

		var el = $(ev.currentTarget);
		this._el.entered = el;

		if (!this._el.dragging.is(el)) {
			if (this._isInsertBefore) {
				this._el.dragging.insertBefore(el);
			}
			else {
				this._el.dragging.insertAfter(el);
			}
		}
	},

	/**
	 * Mouse enter event handler.
	 * @private
	 */
	_onMouseEnter : function() {},

	/**
	 * Mouse leave event handler.
	 * @private
	 */
	_onMouseLeave : function() {
		if (this._el.dragging) {
			this._el.dragging.removeClass(CLASS_HOVER);
		}
	},

	/**
	 * Common event cancellation method.
	 * @param ev
	 * @returns {boolean}
	 * @private
	 */
	_cancelEvent : function(ev) {
		if (ev.originalEvent.stopPropagation) {ev.originalEvent.stopPropagation()}
		if (ev.originalEvent.preventDefault) {ev.originalEvent.preventDefault()}
		ev.originalEvent.cancelBubble = true;
		ev.originalEvent.returnValue = false;
		return false;
	},

	/**
	 * Binds drag events.
	 *
	 * @private
	 */
	_bind : function() {
		this._el.dragzone
			.on(EVENT_MOUSEDOWN, this._options.handler, $.proxy(this._onMouseDown, this))
			.on(EVENT_MOUSEOVER, this._options.handler, $.proxy(this._onMouseOver, this))
			.on(EVENT_MOUSEENTER, this._options.handler, $.proxy(this._onMouseEnter, this))
			.on(EVENT_MOUSELEAVE, this._options.handler, $.proxy(this._onMouseLeave, this));

		$(document)
			.on(EVENT_MOUSEUP, $.proxy(this._onMouseUp, this))
			.on(EVENT_MOUSEMOVE, $.proxy(this._onMouseMove, this))
			.on(EVENT_MOUSEENTER, $.proxy(this._onMouseEnter, this))
			.on(EVENT_MOUSELEAVE, $.proxy(this._onMouseLeave, this));
	},

	/**
	 * Unbinds drag events.
	 *
	 * @private
	 */
	_unbind : function() {
		eval('(' + this.bind.toString().replace(/\.on\(/g, '.off(') + ')').call(this);
	},

	/**
	 * Everyone knows it's IE. F@K U!
	 * @returns {*}
	 * @private
	 */
	_detectIE : function() {
		var ua = window.navigator.userAgent;

		var msie = ua.indexOf('MSIE ');
		if (msie > 0) {
			// IE 10 or older => return version number
			return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
		}

		var trident = ua.indexOf('Trident/');
		if (trident > 0) {
			// IE 11 => return version number
			var rv = ua.indexOf('rv:');
			return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
		}

		var edge = ua.indexOf('Edge/');
		if (edge > 0) {
			// IE 12 => return version number
			return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
		}

		// other browser
		return false;
	}
});