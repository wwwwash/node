import CONST from '../../lib/constant/Constants';

import Ext from '../../lib/vendor/ExtCore';
import Chaos from '../../lib/chaos/Chaos';
import ChaosObject from '../../lib/chaos/Object';
import Ajax from '../Ajax/Ajax';
import { InitRiot } from '../App/App';

export default function ShowMore(el, config) {
	ShowMore.superclass.constructor.call(this, el, config);
}

Chaos.extend(ShowMore, ChaosObject, {

	/** @var {String} showMoreBtnSel                  Selector of the show more button */
	showMoreBtnSel         : '.showMoreButton',
	/** @var {String} showmoreBtnContainerId          Id of the show more button container */
	showMoreBtnContainerId : 'showMoreHolder',
	/** @var {String} listBlockSel                    Selector of the container of one page's thumbnails */
	listBlockSel           : '.showMoreListBlock',
	/** @var {Function} successCallback               Callback function on success ajax request (Attach event handlers, etc.)*/
	successCallback        : undefined,
	/** @var {Object} callbackScope                   Scope of the callback fn */
	callbackScope          : undefined,
	/** @var {String} hideCls                         Class name of hide */
	hideCls                : 'hide',
	/** @var {Boolean} isAppendable                   Append insted of insertAfter */
	isAppendable           : false,

	/**
	 * Init
	 *
	 * @param {Element} el      This should be the body tag.
	 * @param {Object} config   Config object of this component
	 */
	init : function (el, config) {
		ShowMore.superclass.init.call(this, el, config);
	},

	/**
	 * Event handler of the Show more button click
	 *
	 * @param {Object} event object
	 * @param {DomElement} Target of the event
	 */
	onShowMoreClick : function (ev, target) {
		ev.preventDefault();
		ev.stopPropagation();

		this._showMoreHolderEl = Ext.get(this.showMoreBtnContainerId);
		this._showMoreBtnEl = this.element.select(this.showMoreBtnSel);
		this._whiteLoaderEl = Ext.DomHelper.markup({
			tag : 'span',
			cls : 'whiteLoader'
		});

		this._showMoreBtnEl.addClass(this.hideCls);
		Ext.DomHelper.append(this._showMoreHolderEl, this._whiteLoaderEl);

		var ajaxUrl = target.href,
			pageContainerEls = Ext.select(this.listBlockSel);

		this._lastPage = pageContainerEls.item(pageContainerEls.elements.length - 1);

		Ajax.request({
			type     : CONST.TYPE_JSON,
			url      : ajaxUrl,
			scope    : this,
			success  : this.ajaxShowMoreSuccessHandler,
			error    : this.ajaxShowMoreErrorHandler,
			failure  : this.ajaxShowMoreErrorHandler,
			method   : CONST.GET,
			synchron : false
		});
	},

	/**
	 * Success handler of the show more ajax event
	 *
	 * @param {Object} response
	 */
	ajaxShowMoreSuccessHandler : function (response) {
		if (this._showMoreHolderEl) {
			this._showMoreHolderEl.remove();
		}

		var newPageBlock = response.json.data.block,
			template = new Ext.Template(newPageBlock);

		if (this.isAppendable) {
			template.append(this._lastPage);
		}
		else {
			template.insertAfter(this._lastPage);
		}

		// re-init riot for new elements
		InitRiot(this.element.dom);

		if (typeof this.successCallback === 'function') {
			this.successCallback.call(this.callbackScope);
		}
	},

	/**
	 * Show more ajax error handler
	 */
	ajaxShowMoreErrorHandler : function () {
		/* develblock:start */
		console.error('Ajax error');
		/* develblock:end */

		var whiteLoaderEl = this._showMoreHolderEl.select('.whiteLoader').item(0);

		if (this._showMoreBtnEl) {
			this._showMoreBtnEl.removeClass(this.hideCls);
		}

		if (whiteLoaderEl) {
			whiteLoaderEl.addClass(this.hideCls);
		}
	},

	/**
	 * Attach initial event handlers.
	 */
	bind : function () {
		ShowMore.superclass.bind.call(this);

		this.element.on('click', this.onShowMoreClick, this, {
			delegate : this.showMoreBtnSel
		});
	},

	/**
	 * Detach initial event handlers.
	 */
	unbind : function () {
		this.autoUnbind();
	}
});
