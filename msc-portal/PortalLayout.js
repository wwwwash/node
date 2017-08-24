import Ext from '../../lib/vendor/ExtCore';
import Chaos from '../../lib/chaos/Chaos';
import Layout from '../../lib/chaos/Layout';
import { Broadcaster } from '../../lib/chaos/Broadcaster';

import Overlay from '../Overlay/Overlay';
import NewWindow from '../NewWindow/NewWindow';
import { InitRiot } from '../App/App';

/**
 * Layout handles all the tasks needed to be done before a page start.
 * Parent Class of all the layouts.
 */
export default function PortalLayout(el, config) {
	PortalLayout.superclass.constructor.call(this, el, config);
}

Chaos.extend(PortalLayout, Layout, {

	/** @var {String} linkSel                       Selector of the link elements */
	linkSel           : 'a, button',
	/** @var {String} disabledCls                   Disabled class on link elements */
	disabledCls       : 'disabled',
	/** @var {String} overlayContentId              Id of the inner overlay content */
	overlayContentCls : 'overlayContent',
	/** @var {String}                               Link elements */
	_linkEls          : undefined,
	/** @var {String}                               Main container seelector. */
	mainContainerSel  : '#mainContainer',

	/**
	 * Init
	 *
	 * @param {Element} el      This should be the body tag.
	 * @param {Object} config   Config object of this component
	 */
	init : function(el, config) {
		this._linkEls = this.element.select(this.linkSel);

		PortalLayout.superclass.init.call(this, el, config);

		// run newwindow helper globally
		new NewWindow(Ext.getBody(), {});
	},

	/**
	 * On link click.
	 * Prevent native event if has disabled class.
	 *
	 * @param ev EventObject
	 * @param target Target DOM element
	 */
	onLinkClick : function(ev, target) {
		var targetEl = Ext.get(target);

		if (targetEl.hasClass(this.disabledCls)) {
			ev.preventDefault();
			ev.stopPropagation();
		}
	},

	/**
	 *
	 * @private
	 */
	_onOverlayReady : function () {
		var overlayEls = Ext.select(this.overlayContentCls.dot());
		var last = overlayEls.elements.length - 1;
		var overlayEl = overlayEls.item(last);

		this._linkEls = overlayEl.select(this.linkSel);
		this._linkEls.on('click', this.onLinkClick, this);
		InitRiot(overlayEl.dom);
	},

	/**
	 * Esemenykezelok feliratkozasa
	 */
	bind : function() {
		PortalLayout.superclass.bind.call(this);

		this._linkEls.on('click', this.onLinkClick, this);
		Broadcaster.on(Overlay.OVERLAY_READY, this._onOverlayReady, this);
	},

	/**
	 * Esemenykezelok torlese
	 */
	unbind : function() {
		this.autoUnbind();
	}
});
