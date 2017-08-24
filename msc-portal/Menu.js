/* eslint-disable complexity */

import TweenMax from 'gsap';

import Ext from '../../lib/vendor/ExtCore';
import Chaos from '../../lib/chaos/Chaos';
import ChaosObject from '../../lib/chaos/Object';

import './Menu.scss';
/**
 *
 * Menu
 *
 */
export default function Menu(el, config) {
	Menu.superclass.constructor.call(this, el, config);
}

Chaos.extend(Menu, ChaosObject, {

	/** @var {object}         Main menu container element */
	_menuContainerEl : undefined,

	/** @var {object}         The currently clicked menu item element */
	currentItem : undefined,

	/** @var {object}         The submenu element in the clicked main menu element */
	submenuEl : undefined,

	/** @var {object}         The submenu items in the current submenu */
	submenuItems : undefined,

	/** @var {string}         open vs. close */
	action : undefined,

	/** @var {string}         The active submenu class - added AFTER menu is fully opened (after animation) */
	activeSubmenuClass : 'activeSubMenu',

	/** @var {string}         The active submenu class - added on click, on animation START */
	clickedMenuClass : 'clickedMenu',

	/** @var {string}         No close class */
	noCloseClass : 'noClose',

	/** @var {string}         Main menu item selector */
	menuItemSel : '.menuLine',

	/** @var {string}         Class of the notification badge icon */
	notificationCls : 'notification',

	/** @var {string}         Class of the open-state dropdown arrow */
	dropDownUpArrowCls : 'dropDownArrow',

	/** @var {string}         Selector of the menu arrows */
	menuArrowSel : '.menuArrow',

	/** @var {string}         Icon class of the down arrow*/
	downArrowIconCls : 'icon-angle-down',

	/** @var {string}         Icon class of the down arrow*/
	upArrowIconCls : 'icon-angle-up',

	/** @var {string}         Icon class of the noclose icon */
	noCloseIconCls : 'icon-menu-noclose',

	/**
	 * Init
	 *
	 * @param {Element} el      This should be the body tag.
	 * @param {Object} config   Config object of this component
	 */
	init : function(el, config) {
		this._menuContainerEl = el;
		this._initialNoCloseEl = this._menuContainerEl
									.select(this.activeSubmenuClass.dot() + this.noCloseClass.dot()).item(0);

		if (this._initialNoCloseEl) {
			this._initialNoCloseEl.select(this.menuArrowSel).item(0)
				.replaceClass(this.downArrowIconCls, this.noCloseIconCls);
		}

		//Call superclass
		Menu.superclass.init.call(this, el, config);
	},

	/**
	 * Opens the submenu
	 */
	open : function () {
		var submenuHeight = 0;

		this.submenuItems.each(function() {
			submenuHeight += this.getHeight();
		});

		this.currentItem.addClass(this.activeSubmenuClass).addClass(this.clickedMenuClass);

		var arrowEl = this.currentItem.select(this.menuArrowSel).item(0);

		if (arrowEl) {
			arrowEl.replaceClass(this.downArrowIconCls, this.upArrowIconCls);
		}

		// Replace notification badge to arrow
		var notificationEl = this.currentItem.select('.' + this.notificationCls).item(0);

		if (notificationEl) {
			// Store da notification number in data attr
			notificationEl.dom.setAttribute('data-notification', notificationEl.dom.innerHTML);
			notificationEl.dom.innerHTML = '';

			notificationEl.replaceClass(this.notificationCls, this.dropDownUpArrowCls);
		}

		TweenMax.fromTo(
			this.submenuEl.dom,
			0.3,
			{
				css : {
					height : 0
				}
			},
			{
				css : {
					height : submenuHeight
				}
			}
		);
	},

	/**
	 * Closes the submenu
	 *
	 * @param {bool}    Should automaticly search for the open class?
	 */
	close : function(auto) {
		var el = auto ? this._menuContainerEl.select('.activeSubMenu').item(0) : this.currentItem,
			submenuEl = el ? el.select('ul').item(0) : false,
			self = this;

		if (el && el.hasClass(this.noCloseClass)) {
			el = this._menuContainerEl.select('.' + this.activeSubmenuClass).item(1);
			submenuEl = el ? el.select('ul').item(0) : false;
		}

		if (!submenuEl) {
			if (el) {
				el.removeClass(this.activeSubmenuClass).removeClass(this.clickedMenuClass);
			}
			return;
		}

		var arrowEl = el.select(this.menuArrowSel).item(0);
		if (arrowEl) {
			arrowEl.replaceClass(this.upArrowIconCls, this.downArrowIconCls);
		}

		// Set back to notification badge, and retrieve notification number from data attrib
		// ! Cannot handle on-the-fly notification changes
		var notificationEl = el.select(this.menuItemSel + ' ' + this.dropDownUpArrowCls.dot()).item(0);

		if (notificationEl && notificationEl.dom.hasAttribute('data-notification')) {
			notificationEl.replaceClass(this.dropDownUpArrowCls, this.notificationCls);
			notificationEl.dom.innerHTML = notificationEl.dom.getAttribute('data-notification');
		}

		TweenMax.to(
			submenuEl.dom,
			0.3,
			{
				css : {
					height : 0
				},
				onStart : function() {
					el.removeClass(self.clickedMenuClass);
				},
				onComplete : function() {
					el.removeClass(self.activeSubmenuClass);
				}
			}
		);
	},

	/**
	 * On menu item click
	 */
	onItemClick : function(ev, target) {
		this.currentItem = target.tagName.toLowerCase() === 'a'
							? target.parentNode
							: Ext.get(target).findParent('li', 10);
		this.currentItem = Ext.get(this.currentItem);
		this.submenuEl = this.currentItem.select('ul').item(0);
		this.submenuItems = this.submenuEl ? this.submenuEl.select('li') : false;
		this.action = this.currentItem.hasClass(this.activeSubmenuClass) ? 'close' : 'open';

		if (this.currentItem.hasClass(this.noCloseClass)) {
			ev.preventDefault();
			return false;
		}

		if (this.submenuItems) {
			ev.preventDefault();

			if (this.action === 'open') {
				this.close(true);
				this.open();
			}
			else {
				this.close(true);
			}

			return false;
		}
	},

	/**
	 * Binds events associated with this class
	 */
	bind : function() {
		this._menuContainerEl.select(this.menuItemSel).on('click', this.onItemClick, this);
	}
});
