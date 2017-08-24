/**
 * TouchList Component
 *
 * Adds touch pan functionality to the commonTabs
 * Should be instantiated to tab container.
 *
 * @TODO duplicate code with MediaListAbstract
 */

import Hammer from 'hammerjs';
import Ext from '../../lib/vendor/ExtCore';
import ChaosObject from '../../lib/chaos/Object';
import PH from '../../lib/constant/Phrame';
import IsMobile from '../../lib/chaos/IsMobile';

export default function TouchList(el, config) {
	if (!TouchList.instance) {
		TouchList.superclass.constructor.call(this, el, config);
	}
}

Ext.extend(TouchList, ChaosObject, {

	/** @var {String}                           Selector of one item in the list */
	itemSel             : 'ph-col',
	/** @var {String}                           Selector of the row element */
	rowSel              : 'ph-row',
	/** @var {String}                           Class of animated state row */
	animatedCls         : 'animated',
	/** @var {String}                           Active tab class name */
	activeCls           : 'active',
	/** @var {Number}                           You can set an active element, it scrolls into the view at the init */
	activeElIndex       : 0,
	/** @var {Boolean}                          Shall be functional only on mobile devices */
	onlyOnMobile        : false,
	/** @var {Boolean}                          Shall be functional only on mobile devices - portrait mode */
	onlyOnPortrait      : true,
	/** @var {Boolean}                          If you click on a nearly item, it scrolls into viewport. This feature can be disabled with this bool. */
	noScrollToNeighbour : true,
	/** @var {Boolean}                          Item is in forefront. Not necessary selected, but it scrolled to the front. */
	foreFrontCls        : 'foreFront',
	/** @var {Object}                           HammerJS Object */
	_hammer             : undefined,
	/** @var {Number}                           Actual pan value of the row on mobile */
	_rowPan             : 0,
	/** @var {Object}                           Row element */
	_rowEl              : undefined,
	/** @var {Object}                           setTimeout object to prevent too frequent resize events */
	_resizeTimeout      : undefined,

	/**
	 * Init function
	 * @param   {Object} el     Ext element of the commonTabs
	 * @param   {Object} config Config object
	 *
	 * @return  void
	 */
	init : function(el, config) {
		this._rowEl = this.element.select(this.rowSel).item(0);
		this._itemEls = this._rowEl.select(this.itemSel);

		TouchList.superclass.init.call(this, el, config);

		if (this.isFunctionalityAllowed() && this.activeElIndex) {
			var activeItemPosition = this._getNthItemPosition(this.activeElIndex);
			var activeItemEl = this._rowEl.dom.querySelectorAll(this.itemSel)[this.activeElIndex];

			this.setRowCSSTranslate(activeItemPosition, true);
			this.radioClass(activeItemEl, this.foreFrontCls);
		}

		this.setupMobileGestures();
	},

	/**
	 * Sets CSS TranslateX value on the row.
	 * @param {Number} num PX value of the new css translateX - or an element in the set
	 * @param {Boolean} finalPos Should it store the position? Are we scrolling to the final position?
	 * @return void
	 */
	setRowCSSTranslate : function(num, finalPos) {
		if (typeof finalPos === 'undefined') {
			finalPos = false;
		}
		if (finalPos) {
			this._rowPan = num;
		}

		this._rowEl.dom.style.transform = 'translate3d(' + num + 'px, 0, 0)';
		this._rowEl.dom.style.webkitTransform = 'translate3d(' + num + 'px, 0, 0)';
	},

	/**
	 * Handles Pan events , coming from HammerJS.]
	 * @param {Object} ev HammerJS Event Object
	 * @return void
	 * @private
	 */
	_panHandler : function(ev) {
		var newPan = this._rowPan + ev.deltaX,
			itemCnt = this._rowEl.select(this.itemSel).getCount(),
			itemWidth = this._rowEl.dom.getBoundingClientRect().width,
			maxPan = (itemCnt - 1) * itemWidth * -1,
			pannedEl;

		if (this._rowEl.hasClass(this.animatedCls)) {
			return;
		}

		if (newPan > 0) {
			this._rowPan = 0;
			pannedEl = this._rowEl.select(this.itemSel).item(0).dom;
			this.radioClass(pannedEl, this.foreFrontCls);
			return;
		}
		if (newPan < maxPan) {
			this._rowPan = maxPan;
			pannedEl = this._rowEl.select(this.itemSel).item(itemCnt - 1).dom;
			this.radioClass(pannedEl, this.foreFrontCls);
			return;
		}
		switch (ev.type) {
			case 'panleft':
			case 'panright':
				this.setRowCSSTranslate(newPan);
				break;
			case 'panstart':
				this._rowEl.dom.style.pointerEvents = 'none';
				break;
			case 'panend':
				this._rowEl.dom.style.pointerEvents = 'auto';
				this._rowPan = newPan;
				this._jumpToClosestItem();
				break;
		}
	},

	/**
	 * Jumps to the closest item in the row , in mobile mode.
	 * @return void
	 * @private
	 */
	_jumpToClosestItem : function() {
		var itemBoxWidth = this._rowEl.dom.getBoundingClientRect().width,
			itemEls = this._rowEl.dom.querySelectorAll(this.itemSel),
			closestIndex = Math.round(Math.abs(this._rowPan) / itemBoxWidth),
			closestEl = itemEls[closestIndex],
			scrollToPx = this._getNthItemPosition(closestIndex);

		this.setRowCSSTranslate(scrollToPx, true);
		this.radioClass(closestEl, this.foreFrontCls);
	},

	/**
	 * Returns the negative px position of a given item by its index.
	 * @param {number} nth Index of the desired item
	 * @returns {number} Negative px position
	 * @private
	 */
	_getNthItemPosition : function(index) {
		var itemBoxWidth = this._rowEl.dom.getBoundingClientRect().width;
		return index * itemBoxWidth * -1;
	},

	/**
	 * Returns that the screen is mobile and is portrait or not.
	 * @returns {boolean}
	 */
	isPortraitScreen : function() {
		if (!IsMobile.any()) {
			return false;
		}

		if (window.matchMedia('(orientation: portrait)').matches) {
			return true;
		}

		return false;
	},

	/**
	 * Is functionality allowed ?
	 * @returns {boolean}
	 */
	isFunctionalityAllowed : function() {
		// @TODO This condition suxxx
		if (
			(!this.onlyOnMobile || IsMobile.any()) &&
			(!this.onlyOnPortrait || !IsMobile.any() || this.isPortraitScreen()) &&
			PH.onScreen('mobile')
		) {
			return true;
		}
		return false;
	},

	/**
	 * Creates/Handles mobile gesture handlers.
	 *
	 * @return void
	 */
	setupMobileGestures : function() {
		// Init hammerJS Swiping on gallery on mobile screen only
		if (this.isFunctionalityAllowed()) {
			if (!this._hammer) {
				this._hammer = new Hammer(this.element.dom)
					.on('panleft panright panend panstart', this._panHandler.bind(this));
			}

			// Enabling existing Hammer
			this._hammer.get('pan').set({ enable : true });
		}
		// Disabling existing Hammer
		else if (this._hammer) {
			this._hammer.get('pan').set({ enable : false });
		}
	},

	/**
	 * On Window Resize event handler.
	 * Set the row css translate position to active tab
	 *
	 * @return void
	 * @private
	 */
	_onWindowResize : function() {
		if (this._resizeTimeout) {
			clearTimeout(this._resizeTimeout);
		}

		this._resizeTimeout = setTimeout(function() {
			var activeTabPos = this._getNthItemPosition(this.activeElIndex);
			var activeTabEl = this._rowEl.dom.querySelectorAll(this.itemSel)[this.activeElIndex];

			this.setupMobileGestures();

			if (this.isFunctionalityAllowed()) {
				this.setRowCSSTranslate(activeTabPos, true);
				this.radioClass(activeTabEl, this.foreFrontCls);
			}
			else {
				this.setRowCSSTranslate(0, true);
			}
		}.bind(this), 200);
	},

	/**
	 * Remove class from siblings, and add to el.
	 *
	 * @param {Object} el Dom element to be affected
	 * @param {String} cls Class to put on el
	 * @return void
	 */
	radioClass : function(el, cls) {
		[].forEach.call(el.parentNode.children, function(child) {
			child.classList.remove(cls);
		});
		el.classList.add(cls);
	},

	/**
	 * On item mousedown. On neighbour items click, scroll to there, if this function is enabled.
	 *
	 * @param {Object} ev     Event Object
	 * @param {Object} target Target Element
	 * @private
	 */
	_onItemMouseDown : function(ev, target) {
		if (this.noScrollToNeighbour || !this.isFunctionalityAllowed()) {
			return;
		}
		ev.preventDefault();

		var targetItemEl = $(target).closest(this.itemSel),
			targetItemIndex = $(this.itemSel, this.element.jq()).index(targetItemEl);
		if (!targetItemEl[0].classList.contains(this.foreFrontCls)) {
			var px = this._getNthItemPosition(targetItemIndex);
			this.setRowCSSTranslate(px, true);
			this.radioClass(targetItemEl[0], this.foreFrontCls);
		}
	},

	/**
	 * On item click. Prevent default functionality to eliminate mousemove click event,
	 * and add link-like behaviour if needed.
	 *
	 * @param {Object} ev     Event Object
	 * @param {Object} target Target Element
	 * @private
	 */
	_onItemClick : function(ev, target) {
		if (this.noScrollToNeighbour || !this.isFunctionalityAllowed()) {
			return;
		}

		ev.preventDefault();

		var targetItemEl = $(target).closest(this.itemSel),
			targetLinkEl = $(targetItemEl).find('a');
		if (targetItemEl[0].classList.contains(this.foreFrontCls)) {
			window.location.href = targetLinkEl[0].href;
		}
	},

	/**
	 * Binds all basic event listeners.
	 *
	 * @return void
	 */
	bind : function() {
		TouchList.superclass.bind.call(this);

		this._itemEls.on('mousedown', this._onItemMouseDown, this);
		this._itemEls.on('click', this._onItemClick, this);
		Ext.fly(window).on('resize', this._onWindowResize, this);
		Ext.fly(window).on('orientationchange', this._onWindowResize, this);
	},

	/**
	 * Unbinds all basic event listeners.
	 *
	 * @return void
	 */
	unbind : function() {
		this.autoUnbind();
	}
});
