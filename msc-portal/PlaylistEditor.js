/* eslint-disable complexity */

import $ from 'jquery';
import '../../lib/vendor/jquery.dragable';

import Ext from '../../lib/vendor/ExtCore';
import Chaos from '../../lib/chaos/Chaos';
import Config from '../../lib/chaos/Config';
import ChaosObject from '../../lib/chaos/Object';
import Connection from '../../lib/chaos/Connection';
import Util from '../../lib/chaos/Util';
import { Broadcaster } from '../../lib/chaos/Broadcaster';
import '../../lib/chaos/AjaxGet';

import ConfirmOverlay from '../Overlay/Confirm/Confirm';
import HorizontalScroll from '../Scroll/HorizontalScroll';

import TabSwitcherView from './TabSwitcherView';
import ChannelEditor from './ChannelEditor';

/**
 * Component for Playlist Editor functions
 */
export default function PlaylistEditorComponent(el, config) {
	PlaylistEditorComponent.superclass.constructor.call(this, el, config);
}

PlaylistEditorComponent.EVENT = {
	ON_SAVE_END : 'on-save-end'
};

PlaylistEditorComponent.ACTION = {
	REMOVE : 'remove',
	TOGGLE : 'toggle',
	SAVE   : 'save'
};

PlaylistEditorComponent.DATA = {
	ACTION        : 'playlistAction',
	ID            : 'id',
	DURATION      : 'duration',
	MEDIA_TYPE    : 'mediaType',
	PLAYLIST_TYPE : 'playlistType',
	TYPE          : 'type'
};

Ext.extend(PlaylistEditorComponent, ChaosObject, {
	/** @var {String}       triggerClass                          Action trigger class. */
	triggerClass : 'playlist-action',

	/** @var {String}       itemClass                             Class of a media item. */
	itemClass : 'item',

	/** @var {String}       activePlaylistCls                     Class added to body when the playlist editor is active. */
	activePlaylistCls : 'activePlaylist',

	/** @var {String}       disableMediaCls                       Class added to the body when media control elements should be disabled. */
	disableMediaCls : 'disableMedia',

	/** @var {String}       getPlayListRoute                      Route key of the playlist getter. */
	getPlayListRoute : 'ChannelPlaylist/Get',

	/** @var {String}       checkPriceRoute                       Check channel price ajax route */
	checkPriceRoute : 'ChannelPlaylist/CheckChannelPrice',

	/** @var {String}       saveListRoute                         Save the playlist route */
	saveListRoute : 'ChannelPlaylist/Save',

	/** @var {String}       playlistCheckboxSel                   Checkbox selector in the mediaBox element. */
	playlistCheckboxSel : '.playlist-editor-checkbox',

	/** @var {String}       disableMediaBarCls                    Class added to mediaBar when we navigate to a disabled type page. */
	disableMediaBarCls : 'disableMediaBar',

	/** @var {String}       removedCls                            Class to show that the playlist item is removed and should be hidden */
	removedCls : 'removed',

	/** @var {String}       showCls                               Class to make thing visible */
	showCls : 'show',

	/** @var {String}       hideCls                               Class to make thing invisible */
	hideCls : 'hide',

	/** @var {String}       fakeItemsSel                          Fake item container selector */
	fakeItemsSel : '.fake-items',

	/** @var {String}       innerBoxImageSel                      Single image in the box selector */
	innerBoxImageSel : '.boxInner img',

	/** @var {String}       innerBoxFourImgSel                    Four image in the box selector */
	innerBoxFourImgSel : '.boxInner .fourImg',

	/** @var {String}       imageInsideBoxEls                     Actually it is the wrapper of the single and four images in the box */
	imageInsideBoxEls : '.boxInner .fourImg .imgWrap',

	/** @var {String}       addedToPlaylistSel                    Added to playlist notification element selector */
	addedToPlaylistSel : '.addedToPlaylist',

	/** @var {String}       removedFromPlaylistSel                Removed from playlist notification element selector */
	removedFromPlaylistSel : '.removedFromPlaylist',

	/** @var {String}       loadingCls                            Loading indicator class */
	loadingCls : 'loading',

	/** @var {String}       mediaBoxSel                           Channel folder media box Selector  */
	mediaBoxSel : '.mediaBox',

	/** @var {String}       channelType                           free vs premium */
	channelType : undefined,

	/** @var {String}       whiteLoaderCls                        Class for white loader */
	whiteLoaderCls : 'whiteLoader',

	/** @var {Bool}       _isVisible                              Tells us if the mediaBar is currently visible or not. */
	_isVisible : false,

	/** @var {String}       _ajaxReady                            Tells us if ajax requests are done yet. */
	_ajaxReady : true,

	/** @var {String}       _playlistEmptyItemTpl                 ID of the template script tag */
	_playlistEmptyItemTpl : 'mediabar-item-tpl',

	_listOnLoad : [],

	/**
	 * Initializer.
	 *
	 * @param {Object}  el      Context element
	 * @param {Object} config   Config
	 *
	 * @return  void
	 */
	init : function(el, config) {
		this._mediaBarEl = Ext.get('media_bar');
		this._itemsEl = this._mediaBarEl.select('.items').item(0);
		this._scrollPlaceholderEl = this._mediaBarEl.select('.scroller').item(0);
		this._scrollTriggerLeftEl = this._mediaBarEl.select('.pager-left').item(0);
		this._scrollTriggerRightEl = this._mediaBarEl.select('.pager-right').item(0);
		this._fullTimeEl = this._mediaBarEl.select('.fulltime').item(0);
		this._totalCountEl = this._fullTimeEl.select('em').item(0);
		this._totalTimeEl = this._fullTimeEl.select('em').item(1);
		this._playlistEmptyItemTpl = Ext.get(this._playlistEmptyItemTpl).html();
		this._overlayedMessageEl = this._mediaBarEl.select('.disableText').item(0);
		this._saveBtnEl = this._mediaBarEl.select('.saveBtn').item(0);
		this._closeBtnEl = this._mediaBarEl.select('.close-playlist').item(0);

		PlaylistEditorComponent.superclass.init.call(this, el, config);

		this._horizontalScrollbarFactory();
		this._initMutationObserver();

		// Init draggable plugin
		$(this._itemsEl.dom).draggable({
			item          : '.item',
			clone         : true,
			positionFixed : true,
			animateDrop   : 250
		});
	},

	/**
	 * Returns with the active channel tab's content type
	 * @private
	 * @return {String} Content type
	 */
	_getActiveTabContentType : function() {
		var activeTab = this._getActiveChannelTab();

		return activeTab.id.split('_')[0];
	},

	/**
	 * Returns with the active channel tab element
	 * @private
	 * @returns {Ext.Element}
	 */
	_getActiveChannelTab : function() {
		return this.element.select('.commonTabsContent.active').item(0);
	},

	/**
	 * Method to show the mediaBar.
	 * @return void
	 */
	show : function() {
		this._isVisible = !this._isVisible;
		this._mediaBarEl.addClass(this.showCls);
		this._handleBeforeunload(true);
	},

	/**
	 * Method to hide the mediaBar.
	 * @return void
	 */
	hide : function() {
		this._isVisible = !this._isVisible;
		this._mediaBarEl.removeClass(this.showCls);
		this._handleBeforeunload(false);
	},

	/**
	 * Method to toggle the mediaBar.
	 * @return void
	 */
	toggle : function () {
		if (this._isVisible) {
			this.hide();
		}
		else {
			this.show();
			// Shows or hides the Overlay-with-message over the mediaBar
			this._handleDisabledState(false);
		}
	},

	/**
	 * Updates scrollbars, counters, etc.
	 * @param {Boolean} scrollToEnd It is needed to scroll to the end of the list ?
	 * @return void
	 */
	update : function(scrollToEnd = false) {
		let hs = this._horizontalScroll;

		this._updateTimes();
		hs.updateControls();
		if (scrollToEnd) {
			// Scroll to the end
			hs._containerEl.dom.scrollLeft = hs.getContentWidth() - this._horizontalScroll.rightValue + 700;
		}
	},

	/**
	 * Method to add item to the playlist.
	 * @param el {Ext.Element} The element which should be added.
	 * @return void
	 */
	addItem : function(el) {
		this._fakeItemCtnEl = this._mediaBarEl.select(this.fakeItemsSel).item(0);

		var id = el.data(PlaylistEditorComponent.DATA.ID),
			duration = el.data(PlaylistEditorComponent.DATA.DURATION),
			isVideo = el.data(PlaylistEditorComponent.DATA.MEDIA_TYPE) === 'video',
			iconCls = isVideo ? '' : this.hideCls,
			// Photo elements inside a box (four or single)
			contentEls = isVideo ? el.select(this.innerBoxImageSel) : el.select(this.innerBoxFourImgSel),
			// Wrapper of the photo elements
			photoWrapperEls = el.select(this.imageInsideBoxEls),
			// HTML of a four- or single images and its container
			contentHTML = '',
			//
			tempPhotoEls = '',
			playlistType = el.data(PlaylistEditorComponent.DATA.PLAYLIST_TYPE),
			existingEl = this.element.select('.item[data-id="' + id + '"]');

		if (existingEl.elements.length) {
			existingEl.item(0).removeClass(this.removedCls);
			this.update(true);
			return;
		}

		if (isVideo) {
			contentEls.each(function() {
				contentHTML += this.html(true);
			});
		}
		else { //TODO: fix this later - from backend side also
			photoWrapperEls.each(function() {
				tempPhotoEls += this.html(true);
			});
			contentHTML = `<div class="row ph-overflow-hidden ph-full-all ph-relative fourImg">
								${tempPhotoEls}
							</div>`;
		}

		new Ext.Template(this._playlistEmptyItemTpl).insertBefore(this._fakeItemCtnEl, {
			itemId                 : id,
			content                : contentHTML,
			itemIconCls            : iconCls,
			duration               : duration,
			playlistType           : playlistType,
			formattedDuration      : Util.secToTime(duration),
			formattedTotalDuration : '0:00'
		});

		this.update(true);
	},

	/**
	 * Method to remove an item from the playlist.
	 * @param id {String} ID of the media item.
	 * @return void
	 */
	removeItem : function(id) {
		var playlistItemEl = this.element.select('.item[data-id="' + id + '"]');

		if (!playlistItemEl) {
			/* develblock:start */
			console.error('element item-' + id + ' cannot be found!');
			/* develblock:start */
			return;
		}

		playlistItemEl.addClass(this.removedCls);

		this.update();

		var mediaBoxEl = this._mediaBarEl.select('.mediaBox[data-id="' + id + '"]').item(0);

		if (mediaBoxEl) {
			mediaBoxEl.select(this.addedToPlaylistSel).item(0).setOpacity(0);
			mediaBoxEl.select(this.removedFromPlaylistSel).item(0).setOpacity(0.7);
			setTimeout(function() {
				mediaBoxEl.select(this.removedFromPlaylistSel).item(0).setOpacity(0);
			}.bind(this), 2000);
		}

		// Browser hack to force re-layout
		this._mediaBarEl.dom.style.display = 'none';
		this._mediaBarEl.dom.offsetHeight; // eslint-disable-line
		this._mediaBarEl.dom.style.display = '';
	},

	/**
	 * Enables the disabled overlay message.
	 * @return void
	 */
	enableOverlay : function() {
		var mediaType = this._getActiveTabContentType();
		this._overlayedMessageEl.select('.' + mediaType + 'Msg').radioClass(this.showCls);
		this._overlayedMessageEl.show();
	},

	/**
	 * Disables the disabled overlay message.
	 * @return void
	 */
	disableOverlay : function() {
		this._overlayedMessageEl.hide();
	},

	/**
	 * Initializes a new MutationObserver on the mediaBar to detect changes in it.
	 * @private
	 * @return void
	 */
	_initMutationObserver : function () {
		// Create an observer instance
		this._observer = new MutationObserver(this._observerCallback.bind(this));

		// Pass in the target node, as well as the observer options
		this._observer.observe(this._itemsEl.dom, {
			attributes    : false,
			childList     : true,
			characterData : false,
			subtree       : true
		});
	},

	/**
	 * Callback of the MutationObserver Instance when something changes in DOM.
	 * @param mutations {MutationObserver} Contains the changes detected by the MutationObserver
	 * @private
	 * @return void
	 */
	_observerCallback : function(mutations) {
		if (!mutations) {
			return;
		}

		for (var i in mutations) {
			if (mutations.hasOwnProperty(i) &&
				(mutations[i].addedNodes.length > 0 || mutations[i].removedNodes.length > 0)) {
				this.update();
			}
		}
	},

	/**
	 * Resets the content of the mediaBar from a remote source.
	 * @private
	 * @return void
	 */
	_resetContent : function() {
		this._showOverlayMsg();
		this._ajaxReady = false;
		Chaos.GetData(this.getPlayListRoute, { channelType : this.channelType }, this._resetContentSuccess, this);
	},

	/**
	 * Runs when the AJAX call from reset content was successful.
	 * @param {Object} response
	 * @private
	 * @return void
	 */
	_resetContentSuccess : function(response) {
		this._hideLoading();
		this._hideOverlayMsg();
		this._addPlaylistBodyCls();
		this._ajaxReady = true;

		if (response.json.status === 'ERROR') {
			var errorMsg = Chaos.translate('An error occured. Please try again!');

			this._showOverlayMsg(errorMsg, 'icon-alert', true);
			this._closeBtnEl.show();
		}
		else {
			this._itemsEl.dom.innerHTML = response.json.data.block;
			//  Store the list state on load, we can compare later to the save state
			this._listOnLoad = this._collectList().orderList;
			var activeTabContentEl = this._getActiveChannelTab();

			this._checkExistingItems({
				context : activeTabContentEl
			});
		}
	},

	/**
	 * Updates the timeline and total time.
	 * @private
	 * @return void
	 */
	_updateTimes : function() {
		var media = this._collectList(true).orderList,
			mediaCount = media.length,
			secSum = 0;
		this._observer.disconnect();

		media.forEach(function(item) {
			if (item.el) {
				item.el.child('.time').dom.innerHTML = Util.secToTime(secSum);
				secSum += parseInt(item.el.data(PlaylistEditorComponent.DATA.DURATION), 10);
			}
		});

		this._initMutationObserver();

		this._totalCountEl.dom.innerHTML = mediaCount;
		this._totalTimeEl.dom.innerHTML = Util.secToTime(secSum);

		if (secSum) {
			this._fullTimeEl.removeClass(this.hideCls);
		}
		else {
			this._fullTimeEl.addClass(this.hideCls);
		}
	},

	/**
	 * Performs an ajax request to save the playlist.
	 * @private
	 */
	_saveRequest : function() {
		var list = this._collectList(),
			orderListJson = JSON.stringify(list.orderList),
			deletedList = JSON.stringify(list.deletedList),
			params = {
				orderList   : orderListJson,
				deletedList : deletedList
			};

		this._ajaxReady = false;
		this._saveBtnEl.addClass(this.loadingCls);
		Connection.Ajax.request({
			type    : 'json',
			method  : 'post',
			url     : Chaos.getUrl(this.saveListRoute),
			params  : params,
			scope   : this,
			success : this._onSaveSuccess,
			error   : this._onConfirmedSaveError,
			failure : this._onConfirmedSaveError
		});
	},

	/**
	 * Success event handler of the _saveRequest method.
	 * @param {Object} response  Ajax response object
	 * @private
	 */
	_onSaveSuccess : function(response) {
		this._ajaxReady = true;
		delete this._saveListCache;
		this._saveBtnEl.removeClass(this.loadingCls);
		var responseObj = response.json.data;

		if (!responseObj.success) {
			this._openConfirmDialog(responseObj.dialogId);
		}
		else {
			this.hideSavedPlaylist();
		}
	},

	/**
	 * Callback for faulty confirmed save ajax request
	 * @private
	 * @return void
	 */
	_onConfirmedSaveError : function() {
		this._ajaxReady = true;
		this._saveBtnEl.removeClass(this.loadingCls);
		delete this._saveListCache;
	},

	/**
	 * Hides the playlist with a Saved message after X seconds.
	 * @private
	 * @return void
	 */
	hideSavedPlaylist : function() {
		var savedText = Chaos.translate('Saved');
		this._showOverlayMsg(savedText, 'icon-ok');
		setTimeout(function() {
			this.toggle();
			this._removePlayListBodyCls();
			this._removeDisableMediaBodyCls();
			Broadcaster.fireEvent(PlaylistEditorComponent.EVENT.ON_SAVE_END, this);
			this._ajaxReady = true;
		}.bind(this), 3000);
	},

	/**
	 * Switches the mediaBar's contents to an icon and a caption.
	 * Default is a whiteLoader without text.
	 * @param {String} caption Caption text
	 * @param {String} icon Icon class
	 * @param {Boolean} okBtn Is OK Btn needed?
	 * @private
	 * @return void
	 */
	_showOverlayMsg : function(caption, icon, okBtn) {
		var captionCls = caption ? 'msgCaption shw' : 'msgCaption',
			iconCls = icon || this.whiteLoaderCls,
			captionText = caption || '';

		this._saveBtnEl.hide();
		this._closeBtnEl.hide();

		// Remove previous overlay
		this._hideOverlayMsg();

		var okBtnObj = {},
			btnCls = '';

		if (okBtn) {
			btnCls = 'buttoned';
			okBtnObj = {
				tag  : 'a',
				cls  : 'button loadErrorOk',
				size : 'tiny',
				html : 'OK'
			};
		}

		// Create and append to DOM
		this._overlayEl = Ext.DomHelper.append(this._mediaBarEl, {
			tag      : 'div',
			cls      : 'mediaBarOverlay',
			children : [{
				tag      : 'span',
				cls      : 'overlayMsgWrap ' + btnCls,
				children : [
					{
						tag : 'i',
						cls : iconCls
					},
					{
						tag  : 'span',
						cls  : captionCls,
						html : captionText
					},
					{
						tag : 'br'
					},
					okBtnObj
				]
			}]
		}, true);
	},

	/**
	 * Hides the message overlay
	 * @private
	 */
	_hideOverlayMsg : function() {
		if (this._overlayEl) {
			this._overlayEl.remove();
		}
	},

	/**
	 * Hides the loading animation.
	 * @private
	 * @return void
	 */
	_hideLoading : function() {
		this._saveBtnEl.show();
		this._closeBtnEl.show();
	},

	/**
	 * Creates on instance of the HorizontalScrollbar component
	 * @private
	 * @return void
	 */
	_horizontalScrollbarFactory : function() {
		this._horizontalScroll = new HorizontalScroll(this._mediaBarEl, {
			containerId          : 'timeline_wrapper',
			contentId            : 'timeline_wrapper',
			tpl                  : '<div class="scroll-pane-horizontal"><div class="scrollbar"></div></div>',
			scrollBarClass       : 'scrollbar',
			foreignContainerEl   : this._scrollPlaceholderEl,
			scrollTriggerLeftEl  : this._scrollTriggerLeftEl,
			scrollTriggerRightEl : this._scrollTriggerRightEl,
			useWheelScroll       : true,
			autoHide             : true
		});
	},

	/**
	 * Getter method to get the media ID from a DOM item.
	 * @param el {Ext.Element} The Element to return the ID from.
	 * @returns {String}       ID of the media.
	 * @private
	 */
	_getMediaId : function(el) {
		return el.data(PlaylistEditorComponent.DATA.ID);
	},

	/**
	 * Collects a list of current MediaBar elements.
	 * @param {Boolean} detailedReturn Store Ext.Element and other data in return object
	 * @returns {Object} ordered and deleted list
	 * @private
	 */
	_collectList : function(detailedReturn) {
		var id,
			el,
			type,
			itemObj = {},
			deletedList = [],
			orderList = [],
			pushTo,
			items = this._mediaBarEl.select('.item:not(.draggable-dragging)');

		for (var i = 0; i < items.elements.length; i++) {
			itemObj = {};
			el = Ext.get(items.elements[i]);
			type = el.data(PlaylistEditorComponent.DATA.TYPE);
			id = this._getMediaId(el);
			if (!detailedReturn) {
				itemObj[id] = type;
			}
			else {
				itemObj = { id : id, type : type, el : el };
			}
			// Push to order- or deleted list
			pushTo = el.dom.classList.contains(this.removedCls) ? deletedList : orderList;
			pushTo.push(itemObj);
		}

		return {
			orderList,
			deletedList
		};
	},

	/**
	 * Adds a class to the body when mediaBar is active.
	 * @private
	 * @return void
	 */
	_addPlaylistBodyCls : function() {
		this.element.addClass(this.activePlaylistCls);
	},

	/**
	 * Removes the class from the body when mediaBar gets inactive.
	 * @private
	 * @return void
	 */
	_removePlayListBodyCls : function() {
		this.element.removeClass(this.activePlaylistCls);
	},

	/**
	 * Adds the disabled media class to the body element when needed.
	 * @private
	 * @return void
	 */
	_addDisableMediaBodyCls : function() {
		this.element.addClass(this.disableMediaCls);
	},

	/**
	 * Removes the disabled media class from the body element when needed.
	 * @private
	 * @return void
	 */
	_removeDisableMediaBodyCls : function() {
		this.element.removeClass(this.disableMediaCls);
	},

	/**
	 * Checks if disabled message overlay is needed or not based on the passed context.
	 * @param {Boolean} isTabClick
	 * @private
	 * @return void
	 */
	_handleDisabledState : function(isTabClick) {
		var tabEl = Ext.select('.commonTab.active').item(0),
			folderEl = Ext.select('.commonTabsContent.active').item(0);
		if (
			isTabClick && tabEl.hasClass(this.disableMediaBarCls)
			|| !isTabClick && folderEl.select(this.disableMediaBarCls.dot()).elements.length > 0
			) {
			this.enableOverlay();
		}
		else {
			this.disableOverlay();
		}
	},

	/**
	 * Checks if the newly loaded content has playlist items to synchronize checkboxes.
	 * @param {Object} ev Event Object
	 * @private
	 * @return void
	 */
	_checkExistingItems : function(ev) {
		Ext.get(ev.context || ev.ev.context || ev.contentId)
			.select(this.mediaBoxSel)
			.each(function(item) {
				var id = item.data(PlaylistEditorComponent.DATA.ID),
					checkbox = item.select(this.playlistCheckboxSel).item(0),
					playlistClone = Ext.get('item-' + id);

				if (playlistClone && !playlistClone.hasClass(this.removedCls) && checkbox) {
					checkbox.dom.checked = true;
				}
				else if (checkbox) {
					checkbox.dom.checked = false;
				}
			}.bind(this));
	},

	/**
	 * Callback when the a trigger-action element is clicked. Redirects the action to the proper functions.
	 * @param {Object} ev Event Object
	 * @returns {boolean}
	 * @private
	 */
	_onTriggerClick : function(ev) {
		ev.preventDefault();

		var el = Ext.get(ev.target).findParent(this.triggerClass.dot(), 5, true),
			action = el.data(PlaylistEditorComponent.DATA.ACTION),
			checkBoxEl,
			elId;

		switch (action) {
			case PlaylistEditorComponent.ACTION.TOGGLE:
				if (!this._ajaxReady) {
					break;
				}
				// On playlist hide
				else if (this._isVisible && this.hasUnsavedItems()) {
					if (this._mediaBarEl.hasClass(this.showCls)) {
						Config.set('isOverlayOpened', true);
						this._openConfirmDialog('channel-save-playlist', function() {
							this.hide();
							this._removePlayListBodyCls();
							this._removeDisableMediaBodyCls();
						});
						break;
					}
				}
				// On playlist show
				else if (!this._isVisible) {
					this._resetContent();
					this._addDisableMediaBodyCls();
				}
				else {
					this._removePlayListBodyCls();
					this._removeDisableMediaBodyCls();
				}
				this.toggle();
				break;

			case PlaylistEditorComponent.ACTION.REMOVE:
				elId = el.data(PlaylistEditorComponent.DATA.ID);
				checkBoxEl = Ext.get('checkbox-' + elId);
				if (checkBoxEl) {
					checkBoxEl.dom.checked = false;
				}
				this.removeItem(elId);
				break;

			case PlaylistEditorComponent.ACTION.SAVE:
				this._saveRequest();
				break;
			default: break;
		}

		return false;
	},

	/**
	 * Check if there are unsaved modifications in the playlist since the last playlist load
	 * @returns {boolean} has or not
	 */
	hasUnsavedItems : function() {
		if (!this._listOnLoad) {
			return;
		}

		// Get actual list of items in the playlist
		var actualList = this._collectList().orderList,
			// Create id array from _collectList's return array of objects
			actualIdArray = actualList.map(function(obj) {return Object.keys(obj)[0]}),
			listOnLoadIdArray = this._listOnLoad.map(function(obj) {return Object.keys(obj)[0]}),
			// Check if the actual- and the load-time items are exactly the same, regarding to the order
			isEqual = actualIdArray.length === listOnLoadIdArray.length
				&& actualIdArray.every(function(element, index) { return element === listOnLoadIdArray[index] });

		return !isEqual;
	},

	/**
	 * Callback when the checkbox changed.
	 * @param {Object} ev EVentOBject
	 * @private
	 * @return void
	 */
	_onCheckboxChange : function(ev) {
		var targetEl = Ext.get(ev.target).findParent(this.mediaBoxSel, 5, true);
		if (ev.target.checked) {
			this.addItem(targetEl);
			targetEl.select(this.addedToPlaylistSel).item(0).setOpacity(0.7);
			targetEl.select(this.removedFromPlaylistSel).item(0).setOpacity(0);
			setTimeout(function() {
				targetEl.select(this.addedToPlaylistSel).item(0).setOpacity(0);
			}.bind(this), 2000);
		}
		else {
			this.removeItem(targetEl.data(PlaylistEditorComponent.DATA.ID));
			targetEl.select(this.addedToPlaylistSel).item(0).setOpacity(0);
			targetEl.select(this.removedFromPlaylistSel).item(0).setOpacity(0.7);
			setTimeout(function() {
				targetEl.select(this.removedFromPlaylistSel).item(0).setOpacity(0);
			}.bind(this), 2000);
		}
	},

	/**
	 * Event callback fired when folder navigation happened in the channel browser.
	 * @param {Object} ev Event Object
	 * @private
	 * @return void
	 */
	_onFolderContentDisplayed : function(ev) {
		var event = ev || ev.ev;
		this._handleDisabledState(false);
		this._checkExistingItems(event);
	},

	/**
	 * Event callback fired when show more is loaded successfully.
	 * @param {Object} ev
	 * @private
	 * @return void
	 */
	_onShowMoreSuccess : function(ev) {
		this._checkExistingItems(ev);
	},

	/**
	 * Event callback fired when tab navigation happened in the channel browser.
	 * Only used when we navigate to notes, at photos/videos we use the ajax response instead.
	 * @param ev {Object} Event
	 * @private
	 * @return void
	 */
	_onTabClick : function(ev) {
		this._handleDisabledState(true);
		if (ev.contentId === 'videos_folder') {
			this._checkExistingItems(ev);
		}
	},

	/**
	 * Handling the onBeforeUnload event on toggling the playlist
	 * @param {Boolean} attach Attach it? if false == detach
	 * @private
	 * @return void
	 */
	_handleBeforeunload : function(attach = false) {
		let w = Ext.fly(window);
		if (attach) {
			w.on('beforeunload', this._onBeforeUnload, this);
		}
		else {
			w.un('beforeunload', this._onBeforeUnload, this);
		}
	},

	/**
	 * Returns with a message that should be popped up, when the user have unsaved changes
	 * @param {Object} ev Event object
	 * @private
	 */
	_onBeforeUnload : function(ev) {
		var msg = Chaos.translate('You have unsaved changes to your playlist. Do you wish to leave without saving?');

		if (this.hasUnsavedItems()) {
			if (ev) {
				ev.browserEvent.returnValue = msg;
			}
			return msg;
		}
	},

	/**
	 * Handles a click event on playlist editor load error overlay
	 * @param {Object} ev Event Object
	 * @private
	 */
	_onLoadErrorOkClick : function(ev) {
		ev.preventDefault();
		this._hideOverlayMsg();
		this._resetContent();
	},

	/**
	 * Opens a confirm dialog with the given ID, and sets an 'OK click' callback for it.
	 * @param {String} dialogId Calls the confirmoverlay with this scenario id
	 * @param {Function} callback Callback method for OK button click
	 * @private
	 */
	_openConfirmDialog : function(dialogId, callback) {
		callback = callback || function() {};

		Config.get('confirmComponent').openConfirmDialog(dialogId);

		Broadcaster.on(
			ConfirmOverlay.EVENT_OK_CLICK,
			callback.bind(this),
			this,
			{ single : true }
		);
	},

	/**
	 * Attach initial event handlers.
	 */
	bind : function() {
		PlaylistEditorComponent.superclass.bind.call(this);

		Broadcaster.on(ChannelEditor.GLOBALEVENT_FOLDER_LIST_DISPLAYED, this._onFolderContentDisplayed, this);
		Broadcaster.on(ChannelEditor.GLOBALEVENT_FOLDER_CONTENT_DISPLAYED, this._onFolderContentDisplayed, this);
		Broadcaster.on(TabSwitcherView.EVENT.ON_TAB_CLICK, this._onTabClick, this);
		Broadcaster.on(ChannelEditor.GLOBALEVENT_SHOWMORE_SUCCESS, this._onShowMoreSuccess, this);

		this.element.on('click', this._onTriggerClick, this, {
			delegate : this.triggerClass.dot()
		});

		this.element.on('change', this._onCheckboxChange, this, {
			delegate : this.playlistCheckboxSel
		});

		this.element.on('click', this._onLoadErrorOkClick, this, {
			delegate : '.loadErrorOk'
		});
	},

	/**
	 * Detach initial event handlers.
	 */
	unbind : function() {
		this.autoUnbind();
	}
});
