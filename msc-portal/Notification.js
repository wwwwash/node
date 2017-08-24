import Ext from '../../lib/vendor/ExtCore';
import Chaos from '../../lib/chaos/Chaos';
import ChaosObject from '../../lib/chaos/Object';

import './Notification.scss';

/**
 * Notification :
 * Shows a notification without reloading the page.
 *
 * Singleton.
 */
export default function Notification(el, config) {
	Notification.superclass.constructor.call(this, el, config);
}

/**
 * Notification component event constant
 * @type {string}
 */
Notification.HIDE_NOTIFICATION = 'hide-notification';

/**
 * Singleton getInstance function
 * @returns {Notification}
 */
Notification.getInstance = function() {
	if (!(Notification.instance instanceof this)) {
		Notification.instance = new Notification(Ext.getBody(), {});
	}
	return Notification.instance;
};

Chaos.extend(Notification, ChaosObject, {

	/** @var {String}                       Hide timeout of the notification. */
	hideTimeOut  : undefined,
	/** @var {String}                      Notification - IconSlide type template */
	iconSlideTpl : '<div class="globalNotification iconSlide">' +
												'<div class="relative">' +
													'<p>{text}</p>' +
													'<div class="iconWrapper">' +
														'<i class="icon-{face}"></i>' +
													'</div>' +
													'<div class="clear"></div>' +
												'</div>' +
											'</div>',
	/** @var {String}                      Notification - Default type template */
	defaultSlideTpl : '<div class="globalNotification defaultSlide {direction}">' +
												'<div class="middleWrapper">' +
													'<div class="iconWrapper">' +
														'<i class="icon-{face}"></i>' +
													'</div>' +
													'<p>{text}</p>' +
													'<div class="clear"></div>' +
												'</div>' +
												'<a href="#close" class="close hide">' +
													'<i class="icon-close-filled"></i>' +
												'</a>' +
											'</div>',
	/** @var {String}                      Default slide animation direciton*/
	defaultDirection        : 'top',
	/** @var {String}                      Close Button Class*/
	closeBtnCls             : 'close',
	/** @var {Boolean}                     Do we need to fire event after slide */
	isFireBlockedAfterSlide : undefined,

	/**
	 * Init
	 *
	 * @param {Element} el      This should be the body tag.
	 * @param {Object} config   Config object of this component
	 */
	init : function(el, config) {
		Notification.superclass.init.call(this, el, config);
	},

	/**
	 * Stores notification variables.
	 * @private
	 */
	_getNotification : function() {
		var dom = this._notification;
		this._notiEl = Ext.get(dom);
		this._notiTextEl = this._notiEl.select('p').item(0);
	},


	/**
	 * Delegate event handler to the close buttons
	 *
	 * @method _addCloseButtonEventHandler
	 * @private
	 *
	 * @return void
	 */
	_addCloseButtonEventHandler : function() {
		if (this._notiEl) {
			this._notiEl.on('click', this.onCloseButtonClick, this, {
				delegate : this.closeBtnCls.dot()
			});
		}
	},

	/**
	 * Create a notification dom element
	 *
	 * @param {Object} params      Text of the notification
	 *        {String} text        Text of the notification
	 *        {String} icon        Icon face in the notification. Represents a
	 *        {String} tpl         Template string for the notification.
	 *        {String} direction   Slide direction
	 * @private
	 */
	_createNotification : function(params) {
		if (this._notification) {
			return;
		}

		var notiTpl = new Ext.Template(params.tpl);

		this._notification = notiTpl.append(Ext.getBody(), {
			text      : params.text,
			face      : params.icon,
			direction : params.direction
		});
		this._notification = Ext.get(this._notification);

		this._getNotification();
		this._addCloseButtonEventHandler();
	},

	/**
	 * Show up IconSlide type notification.
	 * @param {String} text Text of the notification.
	 * @param {String} icon Icon- class of the icon in the notification.
	 * @public
	 */
	iconSlide : function(text, icon) {
		var self = this;

		this._createNotification({
			text : text,
			icon : icon,
			tpl  : this.iconSlideTpl
		});

		setTimeout(function() {
			self._notiEl.setBottom(20);
			self._notiTextEl.setRight(0);
		}, 1);

		setTimeout(function() {
			self._hideIconSlide(self);
		}, this.hideTimeOut);
	},

	/**
	 * Hide function for iconslide notification.
	 * @param {Object} scope Scope of the actions in the function.
	 * @private
	 */
	_hideIconSlide : function(scope) {
		if (!scope._notification) {
			return;
		}

		var	notiEl = scope._notification,
			notiElHeight = notiEl.getHeight(),
			notiTextEl = notiEl.select('p').item(0),
			transitionDelay = window.getComputedStyle(notiTextEl.dom).getPropertyValue('transition-delay');

		notiTextEl.dom.style.transitionDelay = '0s';
		notiEl.dom.style.transitionDelay = transitionDelay;

		notiTextEl.setRight('-100%');
		notiEl.setBottom(-1 * notiElHeight);

		notiEl.on({
			transitionend       : this._removeNotificationElement,
			webkitTransitionEnd : this._removeNotificationElement,
			oTransitionEnd      : this._removeNotificationElement,
			MSTransitionEnd     : this._removeNotificationElement,
			scope               : this
		});
	},


	/**
	 * Show the notification bar
	 *
	 * @method showNotification
	 * @public
	 * @param {Object} params                    Store the 'show' params
	 *        {String} params.text               Text of the notification.
	 *        {String} params.icon               Icon- class of the icon in the notification.
	 *        {String} params.direction          Slide direction
	 *        {String} params.template           Template of notification
	 *        {Boolean} params.autoHideEnabled   True, if the autohide is enabled
	 *        {Boolean} params.closingEnabled    True, if the closing is enabled
	 *
	 * @return void
	 */
	showNotification : function(params) {
		if (this._notification) {
			return;
		}

		var _notificationTpl = params.template ? params.template : this.defaultSlideTpl,
			_direction = params.direction ? params.direction : this.defaultDirection,
			setDirection = this.setDirectionMethodName(_direction);

		this.isFireBlockedAfterSlide = params.blockFireAfterSlide ? params.blockFireAfterSlide : false;
		this.hideTimeOut = params.hideTimeOut ? params.hideTimeOut : 4000;

		this._createNotification({
			text      : params.text,
			icon      : params.icon,
			tpl       : _notificationTpl,
			direction : _direction
		});

		this.setShowDelayTask(setDirection);
		this.setHideDelayTask(setDirection, params.autoHideEnabled);
		this._enableClosing(params.closingEnabled);
	},


	/**
	 * Enabled closing for the notification
	 *
	 * @method _enableClosing
	 * @public
	 * @param {Boolean} enableClosing   True, if the notification closing is enabled
	 *
	 * @return {Object}
	 */
	_enableClosing : function(enableClosing) {
		if (enableClosing) {
			this._notiEl.select(this.closeBtnCls.dot()).removeClass('hide');
		}
	},

	/**
	 * Sets delayed show task
	 *
	 * @method setShowDelayTask
	 * @public
	 * @param {String} setDirection   Slide direction
	 *
	 * @return void
	 */
	setShowDelayTask : function(setDirection) {
		var self = this;
		setTimeout(function() {
			self._notiEl[setDirection]('0');
		}, 1);
	},

	/**
	 * Sets delayed hide task
	 *
	 * @method setHideDelayTask
	 * @public
	 * @param {String}  setDirection   Slide direction
	 * @param {Boolean} autoHideEnabled   Slide direction
	 *
	 * @return void
	 */
	setHideDelayTask : function(setDirection, autoHideEnabled) {
		var self = this;
		if (autoHideEnabled) {
			setTimeout(function() {
				self._hideSlide(self, setDirection);
			}, this.hideTimeOut);
		}
	},

	/**
	 * Set position value method name
	 *
	 * @method setDirectionMethodName
	 * @public
	 * @param {String} direction   Selected direction
	 *
	 * @return {String} setDirection Ext method's name
	 */
	setDirectionMethodName : function(direction) {
		var setDirection;
		if (direction === 'top') {
			setDirection = 'setTop';
		}
		else if (direction === 'bottom') {
			setDirection = 'setBottom';
		}
		return setDirection;
	},

	/**
	 * Hide function for topslide notification.
	 * @param {Object} scope Scope of the actions in the function.
	 * @param {String} direction   Slide direction
	 * @param {Boolean} isEvent   Do we need to fire event after click
	 * @private
	 */
	_hideSlide : function(scope, setDirection, isEvent) {
		if (!scope._notification) {
			return;
		}

		var	notiEl = scope._notification,
			notiElHeight = notiEl.getHeight();

		notiEl[setDirection](-1 * notiElHeight);
		notiEl.on({
			transitionend       : this._removeNotificationElement,
			webkitTransitionEnd : this._removeNotificationElement,
			oTransitionEnd      : this._removeNotificationElement,
			MSTransitionEnd     : this._removeNotificationElement,
			scope               : this
		});

		// Fire an event about hiding the notification if its needed
		if (!this.isFireBlockedAfterSlide) {
			this.fireEvent(Notification.HIDE_NOTIFICATION, this);
		}
		else if (isEvent && this.isFireBlockedAfterSlide) {
			this.fireEvent(Notification.HIDE_NOTIFICATION, this);
		}
	},

	/**
	 * Removes a notification element from the DOM. Event Handler.
	 * @param {Object} ev Event Object
	 * @param {Object} target Target DON
	 * @private
	 */
	_removeNotificationElement : function(ev, target) {
		var el = Ext.get(target);
		if (el.hasClass('globalNotification')) {
			el.remove();
			delete this._notification;
		}
	},


	/**
	 * Close button click event handler
	 *
	 * @method onCloseButtonClick
	 * @public
	 *
	 * @return void
	 */
	onCloseButtonClick : function(ev) {
		ev.preventDefault();
		this._hideSlide(this, 'setBottom', true);
	},

	/**
	 * Binding event handlers
	 */
	bind : function() {
		Notification.superclass.bind.call(this);
	},

	/**
	 * Unbinding event handlers
	 */
	unbind : function() {
		this.autoUnbind();
	}
});

/* develblock:start */
/* eslint-disable */
window.devCalled = 0;
var developers = function(autoHideEnabled) {
	if (typeof autoHideEnabled === 'undefined') {autoHideEnabled = true}
	window.devCalled++;

	if (window.devCalled % 3 === 0) {
		Notification.getInstance().showNotification({
			text            : '<style>.globalNotification { height: 100px!important;}</style><span style="display: block; font-size: 100px;letter-spacing: 30px;text-shadow: 4px 4px 2px rgba(161, 0, 0, 1);"><i class="icon-zsolti"></i><i class="icon-vic"></i><i class="icon-feri"><i class="icon-gabi"><i class="icon-szabi"></i><i class="icon-dani"><i class="icon-topi"><i class="icon-novo"><i class="icon-pigi"></i><i class="icon-petrik"></i></span>', // eslint-disable-line
			direction       : 'bottom',
			autoHideEnabled : autoHideEnabled
		});
	}
};
/* eslint-enable */
/* develblock:end */