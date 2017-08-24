import Ext from '../../lib/vendor/ExtCore';
import Chaos from '../../lib/chaos/Chaos';
import ChaosObject from '../../lib/chaos/Object';

export default function TabSwitcherView(el, config) {
	TabSwitcherView.superclass.constructor.call(this, el, config);
}

TabSwitcherView.EVENT = {
	ON_TAB_CLICK : 'tabswitcher-on-tab-click'
};

Chaos.extend(TabSwitcherView, ChaosObject, {

	/** @var {String}                            Selector of the tab list elements */
	tabListSel           : '.commonTab',
	/** @var {String}                            Selector of the hideable content elements */
	hideableCtnSel       : '.commonTabsContent',
	/** @var {String}                            Invisible overflow class */
	invisibleOverflowCls : 'invisibleOverflow',
	/** @var {String}                            Active class */
	activeCls            : 'active',

	/* PRIVATES */
	/** @var {Object}    Stores the tab list elements */
	_tabListEls     : undefined,
	/** @var {Object}    Stores the hideable content elements */
	_hideableCtnEls : undefined,

	/**
	 * Initialize view.
	 *
	 * @param {Element} el      Context element
	 * @param {Object} config   Config object of this controller
	 */
	init : function(el, config) {
		this._collectElements();

		this._setInitialActiveTab();

		TabSwitcherView.superclass.init.call(this, el, config);
	},

	/**
	 * Collects the required elements to bind them
	 *
	 * @method _collectElements
	 *
	 * @return void;
	 */
	_collectElements : function() {
		this._tabListEls = this.element.select(this.tabListSel);
		this._hideableCtnEls = this.element.select(this.hideableCtnSel);
	},

	/**
	 * Set the active tab after open the page by the url hash
	 *
	 * @method _setInitialActiveTab
	 *
	 * @return void;
	 */
	_setInitialActiveTab : function() {
		if (window.location.hash) {
			window.scrollTo(0, 0);

			var i,
				hash = window.location.hash,
				link,
				contentEl;

			this._tabListEls.removeClass(this.activeCls);
			this._hideableCtnEls.removeClass(this.activeCls);

			for (i = 0; i < this._tabListEls.elements.length; i++) {
				link = this._tabListEls.item(i).select('a').item(0);

				if (hash === link.dom.hash) {
					link.parent().addClass(this.activeCls);
					contentEl = Ext.select(link.attr('href')).item(0);
					contentEl.addClass(this.activeCls);
				}
			}
		}
	},

	/**
	 * Handles the click event on tab elements
	 *
	 * @method onTabClick
	 *
	 * @return void;
	 */
	onTabClick : function(ev, target) {
		ev.preventDefault();

		var targetEl = Ext.get(target),
			childEl = targetEl.select('a').item(0),
			targetSel = childEl.attr('href'),
			contentEl = Ext.select(targetSel).item(0),
			contentId = contentEl.id;

		if (targetSel) {
			var scrollTop = window.pageYOffset || window.document.documentElement.scrollTop;

			window.location.hash = targetSel;

			window.scrollTo(0, scrollTop);
		}

		// Hide all protips in the content element
		var activeContentEl = this.element.select(this.hideableCtnSel + this.activeCls.dot()).item(0);
		activeContentEl.jq().protipHideInside();

		this._tabListEls.removeClass(this.activeCls);
		targetEl.addClass(this.activeCls);

		this._hideableCtnEls.removeClass(this.activeCls);
		contentEl.addClass(this.activeCls);

		Chaos.fireEvent(TabSwitcherView.EVENT.ON_TAB_CLICK, {
			ev        : ev,
			target    : target,
			targetSel : targetSel,
			contentId : contentId
		});
	},

	/**
	 * Binds events
	 */
	bind : function() {
		TabSwitcherView.superclass.bind.call(this);

		this.element.on('click', this.onTabClick, this, {
			delegate : this.tabListSel
		});
	},

	/**
	 * Unbind events
	 */
	unbind : function() {
		this.autoUnbind();
	}
});
