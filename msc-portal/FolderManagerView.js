import Ext from '../../lib/vendor/ExtCore';
import Chaos from '../../lib/chaos/Chaos';
import ChaosObject from '../../lib/chaos/Object';

/**
 *
 */
export default function FolderManagerView(el, config) {
	FolderManagerView.superclass.constructor.call(this, el, config);
}

Ext.apply(FolderManagerView, {
	ACTION_CREATE_ALBUM            : 'create_album',
	EVENT_FOLDER_CLICK             : 'folder-click',
	EVENT_SHOWMORE_CLICK           : 'showmore-click',
	EVENT_FOLDER_CONTENT_DISPLAYED : 'folder-content-displayed',
	EVENT_FOLDER_LIST_DISPLAYED    : 'folder-list-displayed',
	EVENT_BACK_TO_FOLDERS_CLICK    : 'back-to-folders-click'
}, {});

Chaos.extend(FolderManagerView, ChaosObject, {

	/** @var {String} name                           Name of the class */
	name                           : 'MediaManagerController',
	/** @var {String} activeFolderCls                Class name that indicates the currently active folder */
	activeFolderCls                : 'active_folder',
	/** @var {String} mainFolderCls                  Class name of the top container of all folders */
	mainFolderCls                  : 'folderBox',
	/** @var {String} folderCls                      Class name of all folders */
	folderCls                      : 'albumClickBox',
	/** @var {String} folderIdAttr                   Attribute that contains the id of the folders */
	folderIdAttr                   : 'id',
	/** @var {String} mediaTypeAttr                  Attribute that contains the type of the media we want to show */
	mediaTypeAttr                  : 'type',
    /** @var {String} AlbumCls                       Album cls */
	albumCls                       : 'album',
	/** @var {String} mediaGetContentUrlAttr         Attribute that contains the url for getting media */
	mediaGetContentUrlAttr         : 'content-url',
	/** @var {String} folderListBlockCls             Class name of a block containing the list of the folders */
	folderListBlockCls             : 'folder_list',
	/** @var {String} folderContentBlockCls          Class name of a block containing the inner content of a folder */
	folderContentBlockCls          : 'channelFolderBrowser',
	/** @var {String} backToFoldersButtonCls         Class name of a button that leads back to the folder list */
	backToFoldersButtonCls         : 'back_to_folders',
	/** @var {String} actionBlockCls                 Class name of an element that has a data-action attr */
	actionBlockCls                 : 'actionBlock',
	/** @var {String} tooltipTriggerCls              Class name of the box element tooltip trigger child. */
	tooltipTriggerCls              : 'tooltipTrigger',
	/** @var {String} justCreatedCls                 This class will be added to folders which are just created JS.
	 *                                               It shall disappear after refresh. */
	justCreatedCls                 : 'justCreated',
	/** @var {String} lessThanMinItemCls             Class name of the commonTabsContent when uploaded photos count are
	 *                                               less than the minimum */
	lessThanMinItemCls             : 'lessThanMinItem',
	/** @var {String}                                Class of uploading state on the tab content element */
	tabUploadingCls                : 'uploading',
	/** @var {String}                                Class of loading showmore button */
	loadingCls                     : 'loading',
	/** @var {String} hiddenBlockClass               Class name of a block that is currently hidden */
	hiddenBlockClass               : 'hidden',
	/** @var {String}                                Active cls */
	activeCls                      : 'active',
	/** @var {String} hiddenBlockClass               Class name of a button that creates a new folder */
	createNewFolderButtonCls       : 'create_new_folder',
	/** @var {String} newFolderBlockTemplateId       Id of a template block to render folder content */
	newFolderBlockTemplateId       : 'new_folder_template',
	/** @var {String} folderTitleContentItemCountCls Block cls that stores the number of content items on folder cover*/
	folderTitleContentItemCountCls : 'contentItemCount',
	/** @var {String} contentItemCountCls            block class that stores the number of content items in a folder */
	contentItemCountCls            : 'contentCount span',
	/** @var {String} currentCountCls                block class that stores the number of current count in a folder */
	currentCountCls                : 'contentCount',
	/** @var {String}                                Active folder selector */
	activeFolderSel                : '.commonTabsContent .active',
	/** @var {String}                                Active tab selector */
	activeTabSel                   : '.commonTabsContent.active',
	/** @var {String}                                Requirements block class */
	requirementsBlockCls           : 'album_requirements',
	/** @var {Object} _currentFolderEl               The folder element we are currently in */
	_currentFolderEl               : undefined,
	/** @var {String} mediaInputCls          Class name of title input */
	mediaInputCls                  : 'title_input',
	/** @var {String} addMediaItemIconCls            Class name of add media icon */
	addMediaItemIconCls            : 'add_media_item_icon',
	/** @var {String} addMediaItemTitleCls           Class name of add media title */
	addMediaItemTitleCls           : 'add_media_item_title',
	/** @var {String} mediaFolderFullIconCls         Class name of full folder icon */
	mediaFolderFullIconCls         : 'icon-folder-full',
    /** @var {String} disableMediaBarCls             Class name of disable media bar */
	disableMediaBarCls             : 'disableMediaBar',
	/** @var {String} mediaFolderFullInfoIconSel     Selector for the info icon in the corner of the uploader box*/
	mediaFolderInfoIconSel         : '.firstCreate .icon-info-circle',
	/** @var {String} showMoreBtnCls                 Show more button class */
	showMoreBtnCls                 : 'showMore',
	/** @var {String} showMoreWrapperCls             Show more button wrapper class */
	showMoreWrapperCls             : 'showMoreWrapper',
	/** @var {String} fullAlbumCls                   Class on actionBlock if the album is full */
	fullAlbumCls                   : 'fullAlbum',
	/** @var {Object} ui                             UI Selectors */
	ui                             : {
		mediaBox          : 'mediaBox',
		rejected          : 'rejected',
		// Folder has a rejected item
		hasRejected       : 'hasRejected',
		commonTabsContent : 'commonTabsContent',
		hide              : 'hide'
	},

	/**
	 * Initialize view.
	 *
	 * @param {Element} el      Context element
	 * @param {Object} config   Config object of this controller
	 */
	init : function(el, config) {
		this._collectElements();
		this._currentContentEl = this._folderListBlockEl;

		FolderManagerView.superclass.init.call(this, el, config);
		this.addEvents(
			FolderManagerView.EVENT_FOLDER_CLICK,
			FolderManagerView.EVENT_FOLDER_CONTENT_DISPLAYED,
			FolderManagerView.EVENT_FOLDER_LIST_DISPLAYED,
			FolderManagerView.EVENT_BACK_TO_FOLDERS_CLICK
		);
	},

	/**
	 * Collects the required elements to bind them
	 */
	_collectElements : function() {
		let maxLimit = this.element.getAttribute('data-album-max-limit');
		this._folderListBlockEl = this.element.select('.' + this.folderListBlockCls).item(0);
		this._folderContentBlockEl = this.element.select('.' + this.folderContentBlockCls).item(0);
		if (maxLimit) {
			this._minAlbumLimitNumber = parseInt(maxLimit, 10);
			this._maxAlbumLimitNumber = parseInt(this.element.getAttribute('data-album-max-limit'), 10);
		}
	},

	/**
	 * Resets the given input field.
	 *
	 * @method resetNewFolderButton
	 * @param {Object} boxEl   Creator Box Element to reset [Ext.Element]
	 *
	 * @return void;
	 */
	resetNewFolderButton : function(boxEl) {
		var inputEl = boxEl.select(this.mediaInputCls.dot()).item(0);

		if (inputEl) {
			inputEl.dom.value = '';
			inputEl.dom.blur();
		}
		if (boxEl) {
			boxEl.removeClass('hover');
		}
	},

	/**
	 * Handles a click event on a block that contains an action.
	 *
	 * @param {Object} ev   Click event object
	 */
	onActionBlockClick : function(ev) {
		var target = Ext.fly(ev.target).parent(this.actionBlockCls.dot()) || Ext.get(ev.target),
			action = target.data('action');
		switch (action) {
			case FolderManagerView.ACTION_CREATE_ALBUM:
				this._startFolderCreate(target);
				break;
			default:
				break;
		}
	},

	/**
	 * Handles a click event on the show more button
	 *
	 * @param {Object} ev Click event object
	 */
	onShowMoreClick : function(ev) {
		ev.preventDefault();

		var btnEl = Ext.get(ev.target),
			btnParentEl = btnEl.findParent('.showMoreWrapper', 2, true),
			mediaType = ev.target.getAttribute('data-media-type');

		if (!btnEl || btnEl.hasClass(this.loadingCls)) {
			return;
		}
		btnEl.addClass('hide');
		Ext.DomHelper.append(btnParentEl, this.getLoader());

		Chaos.fireEvent(FolderManagerView.EVENT_SHOWMORE_CLICK, {
			scope     : this,
			mediaType : mediaType,
			target    : ev.target
		});
	},

	/**
	 * Returns a white loader's html
	 *
	 * @param {String} extraCls Extra classes for the element
	 *
	 * @returns {String} HTML
	 */
	getLoader : function(extraCls = '') {
		return Ext.DomHelper.markup({
			tag : 'span',
			cls : `whiteLoader ${extraCls}`
		});
	},

	/**
	 * Starts to create a new folder
	 *
	 * @method _startFolderCreate
	 * @private
	 * @param {Object} target   Folder block
	 */
	_startFolderCreate : function(target) {
		if (!Ext.getBody().hasClass('activePlaylist')) {
			target.select('input').focus();
		}
	},

	/**
	 * Handles a click event on a folder.
	 *
	 * @param {Object} ev   Event object
	 */
	onFolderClick : function(ev) {
		ev.preventDefault();
		var target = Ext.fly(ev.target).parent('.' + this.mainFolderCls) || Ext.get(ev.target),
			folderId = target.data(this.folderIdAttr),
			mediaType = target.data(this.mediaTypeAttr),
			ajaxUrl = target.data(this.mediaGetContentUrlAttr);

		this.fireEvent(FolderManagerView.EVENT_FOLDER_CLICK, {
			scope     : this,
			folderEl  : target,
			folderId  : folderId,
			mediaType : mediaType,
			ajaxUrl   : ajaxUrl
		});

		this._currentFolderEl = target;
	},

	/**
	 * Hides/shows requirements list block, necessary
	 * when you create your first album, or
	 * you delete all of your album.
	 *
	 * @method toggleRequirementsBlock
	 *
	 * @return void;
	 */
	toggleRequirementsBlock : function() {
		var requirementsList = this.element.select('.' + this.requirementsBlockCls).item(0);
		if (!requirementsList) {
			return;
		}
		var totalAlbumCount = this.getFolderCount();

		if (totalAlbumCount > 0) {
			requirementsList.removeClass(this.activeCls);
		}
		else {
			requirementsList.addClass(this.activeCls);
		}
	},

	/**
	 * Get the number of albums in the current folder
	 *
	 * @method getFolderCount
	 * @return {Number} Number of albums
	 */
	getFolderCount : function() {
		return this.element.select('.' + this.albumCls).elements.length;
	},

	/**
	 * Renders and displays a folder's inner content, while it hides the folder list.
	 *
	 * @param {String}  folderId          Id of the folder
     * @param {Boolean} disableMediaBar   Disable media bar or not
	 * @param {String}  [html]            Content to render
	 *
	 * @return {Object} scope to chain;
	 */
	renderFolderContent : function(folderId, disableMediaBar, html) {
		this._currentContentEl.addClass(this.hiddenBlockClass);
		var disableMediaBarClass = parseInt(disableMediaBar, 10) === 1 ? this.disableMediaBarCls : '';

		this._currentContentEl =
			Ext.DomHelper.overwrite(
				this._folderContentBlockEl,
				`<div id="content_${folderId}" class="${disableMediaBarClass}">${html}</div>`,
				true
			).addClass(this.activeFolderCls);

		this._updateFolderContentItemCount();
		this.fireEvent(FolderManagerView.EVENT_FOLDER_CONTENT_DISPLAYED, {
			scope              : this,
			context            : this._currentContentEl,
			isNewAppendedBlock : true,
			inputFields        : this._currentContentEl.select(this.mediaInputCls.dot())
		});
		return this;
	},

	/**
	 * Clearing folder list.
	 */
	clearFolderList : function() {
		var loader = this.getLoader('blockCenter');
		this._folderContentBlockEl.html(loader);
	},

	/**
	 * Renders and displays the folder list, while it hides the previously displayed folder content.
	 *
	 * @method showFolderList
	 *
	 * @return void
	 */
	showFolderList : function(response) {
		this._collectElements();

		this.element.removeClass(this.tabUploadingCls);
		var tpl = response.response.json.content;

		this._folderContentBlockEl.html(tpl);

		var contextEl = Ext.get(this._folderContentBlockEl.dom);

		this.fireEvent(FolderManagerView.EVENT_FOLDER_LIST_DISPLAYED, {
			scope   : this,
			context : contextEl
		});
	},

	/**
	 * Renders and appends the folder list after the existing folder list
	 *
	 * @method appendShowMoreContent
	 *
	 * @return void
	 */
	appendShowMoreContent : function(response) {
		var existingShowMoreEl = this._folderContentBlockEl.select(this.showMoreBtnCls.dot()).item(0),
			showMoreWrapperEl = existingShowMoreEl.parent(this.showMoreWrapperCls.dot()),
			folderListBlockEl = this._folderContentBlockEl.select(this.folderListBlockCls.dot()).item(0),
			tpl = response.response.json.content;

		// Delete the show more btn, or it has a wrapper, delete that.
		if (showMoreWrapperEl) {
			showMoreWrapperEl.remove();
		}
		else if (existingShowMoreEl) {
			existingShowMoreEl.remove();
		}

		Ext.DomHelper.append(folderListBlockEl, tpl);
	},

	/**
	 * Renders a new folder block to the end of the folder list.
	 *
	 * @method renderNewFolderBlock
	 * @param {String} HTMLContent   HTML content of the new folder block
	 *
	 * @return {Object} new inserted element
	 */
	renderNewFolderBlock : function(HTMLContent) {
		var el = Ext.DomHelper.insertAfter(this.element.select(this.actionBlockCls.dot()).item(0), HTMLContent, true);
		el.addClass(this.justCreatedCls);
		return el;
	},

	/**
	 * Removes 'just created' folder blocks.
	 * If I click on the showmore, I will get this block back again, so I have to remove the JS-created one.
	 *
	 * @return void
	 */
	removeJustCreatedBlocks : function() {
		var els = this.element.select(this.justCreatedCls.dot());
		els.each(function(el) {
			el.remove();
		});
	},

	/**
	 * Returns a block that containc the number of the items of a folder in the inside view.
	 *
	 * @method _getFolderContentItemCountEl
	 * @private
	 *
	 * @return {Object}
	 */
	_getFolderContentItemCountEl : function() {
		return this._currentContentEl.select(this.contentItemCountCls.dot()).item(0);
	},

	/**
	 * Description
	 *
	 * @method getFolderContentItemCount
	 *
	 * @return {Number}
	 */
	getFolderContentItemCount : function() {
		if (!this._folderContentItemCount) {
			this._updateFolderContentItemCount();
		}
		return this._folderContentItemCount;
	},

	/**
	 * Refreshes the stored value of the items' number.
	 *
	 * @method _updateFolderContentItemCount
	 * @private
	 */
	_updateFolderContentItemCount : function() {
		if (this._getFolderContentItemCountEl() !== null) {
			this._folderContentItemCount =
				parseInt(this._getFolderContentItemCountEl().dom.innerHTML, 10);
		}
	},

	/**
	 * Increases the items counter.
	 *
	 * @method increaseFolderContentItemCount
	 * @param {Number} [count]   Amount to increase counters
	 * @return {Object}
	 */
	increaseFolderContentItemCount : function(count) {
		if (!this._folderContentItemCount) {
			this._updateFolderContentItemCount();
		}
		if (count) {
			this._folderContentItemCount += count;
		}
		else {
			this._folderContentItemCount++;
		}
		this._updateFolderContentItemCounters();
		this.checkMinLimitReached();
		this.checkMaxLimitReached();
		return this;
	},

	/**
	 * Decreases the items counter.
	 * @TODO ugyanaz mint az elozo
	 * @method decreaseFolderContentItemCount
	 * @param {Number} [count]   Amount to decrease counters
	 * @return {Object}
	 */
	decreaseFolderContentItemCount : function(count) {
		if (!this._folderContentItemCount) {
			this._updateFolderContentItemCount();
		}
		if (count) {
			this._folderContentItemCount -= count;
		}
		else {
			this._folderContentItemCount--;
		}
		this._updateFolderContentItemCounters();
		this.checkMinLimitReached();
		this.checkMaxLimitReached();
		return this;
	},

	/**
	 * Hides all the tooltips in the content element.
	 * @method hideTooltipsInContent
	 */
	hideTooltipsInContent : function () {
		var activeContentEl = Ext.getBody().select(this.activeTabSel).item(0);
		activeContentEl.jq().protipHideInside();
	},

	/**
	 * Check if the album's minimum item count is reached or not, and shows a tooltip if needed.
	 * @param uploadingCnt
	 * @param limits
	 */
	checkMinLimitReached : function() {
		let selector = `${this.actionBlockCls.dot()} ${this.tooltipTriggerCls.dot()}`;
		let limitTooltipTriggerEl = this.element.select(selector).item(0);

		if (this._folderContentItemCount < this._minAlbumLimitNumber) {
			var xMoreNeeded = this._minAlbumLimitNumber - this._folderContentItemCount;

			this.element.addClass(this.lessThanMinItemCls);

			if (limitTooltipTriggerEl) {
				limitTooltipTriggerEl.jq().protipShow({
					title : Chaos.translate(
						'Upload {x} more items to publish this album on Channel',
						{ x : xMoreNeeded }
					),
					position : 'bottom',
					classes  : 'upload_more_tooltip',
					width    : '145!'
				});
			}
		}
		else {
			this.element.removeClass(this.lessThanMinItemCls);
			if (limitTooltipTriggerEl) {
				limitTooltipTriggerEl.jq().protipHide();
			}
		}
	},

	/**
	 * Check the maximum uploaded media in one folder
	 *
	 * @method checkMaxLimitReached
	 * @public
	 *
	 * @return void
	 */
	checkMaxLimitReached : function() {
		var _icon,
			_infoIcon,
			_title,
			_actionBlock;

		_icon = this.element.select(this.addMediaItemIconCls.dot()).item(0);
		_infoIcon = this.element.select(this.mediaFolderInfoIconSel).item(0);
		_title = this.element.select(this.addMediaItemTitleCls.dot()).item(0);
		_actionBlock = this.element.select(this.actionBlockCls.dot()).item(0);

		if (this._folderContentItemCount >= this._maxAlbumLimitNumber) {
			if (_icon.hasClass(this.addMediaItemCls)) {
				_icon.removeClass(this.addMediaItemCls);
			}
			_icon.addClass(this.mediaFolderFullIconCls);
			_title.dom.innerHTML = Chaos.translate('Album is full');
			_actionBlock.addClass(this.fullAlbumCls);
			if (_infoIcon) {
				_infoIcon.hide();
			}
		}
		else if (_icon.hasClass(this.mediaFolderFullIconCls)) {
			_icon.removeClass(this.mediaFolderFullIconCls);
			_actionBlock.removeClass(this.fullAlbumCls);
			_icon.addClass(this.addMediaItemCls);
			_title.dom.innerHTML = this.getAddMediaItemTitle();

			if (_infoIcon) {
				_infoIcon.show();
			}
		}
	},

	/**
	 * Get MediaItemTitle
	 *
	 * @method getAddMediaItemTitle
	 * @public
	 *
	 * @return {String} Media item title
	 */
	getAddMediaItemTitle : function() {
		return Chaos.translate('Add media');
	},

	/**
	 * Updates all item counters in the DOM.
	 *
	 * @method _updateFolderContentItemCounters
	 */
	_updateFolderContentItemCounters : function() {
		if (this._getFolderContentItemCountEl() !== null) {
			this._getFolderContentItemCountEl().dom.innerHTML = this._folderContentItemCount;
			if (this._currentFolderEl.select(this.folderTitleContentItemCountCls.dot()).item(0) !== null) {
				this._currentFolderEl.select(this.folderTitleContentItemCountCls.dot()).item(0).dom.innerHTML =
					this.getFolderItemCountTitle(this._folderContentItemCount);
			}
		}
	},

	/**
	 * Returns a translated text that should contain the folder item count.
	 * You must override it with a valid translation method to get a configurable translator method.
	 *
	 * @method getFolderItemCountTitle
	 *
	 * @return {String}
	 */
	getFolderItemCountTitle : function() {
		throw 'You must override this method with a valid translator method.';
	},

	/**
	 * Gets input fields
	 *
	 * @method getInputFields
	 * @public
	 *
	 * @return {Object} Input fields
	 */
	getInputFields : function() {
		return this.element.select(this.mediaInputCls.dot());
	},

	/**
	 * Checks for alerts if icons needs to be enabled/disabled.
	 *
	 * @return void;
	 */
	checkAlertStatuses : function() {
		var activeTabEl = Ext.select(this.activeTabSel).item(0),
			icon = Ext.select('a[href="#' + activeTabEl.id + '"] span'),
			rejectedSelector = this.ui.mediaBox.dot() + this.ui.rejected.dot() + ', ' +
			this.ui.mediaBox.dot() + this.ui.hasRejected.dot();

		if (activeTabEl.select(rejectedSelector).getCount()
		) {
			icon.removeClass(this.ui.hide);
		}
		else {
			icon.addClass(this.ui.hide);
		}
	},

	/**
	 * Shows an error on a given folder element
	 *
	 * @param {String} message Message for the tooltip
	 * @param {Object} el Element to be show on
	 *
	 * @return void;
	 */
	showErrorTooltip : function(message, el) {
		if (el) {
			var innerEl = el.select('.title').item(0);
			innerEl.jq().protipShow({
				title    : message,
				icon     : 'alert',
				position : 'bottom'
			});

			// Self-removing body click event for the tooltip removal
			Ext.getBody().on('click', function() {
				innerEl.jq().protipHide();
			}, this, { single : true });
		}
	},

	/**
	 * Hides an error on a given folder element
	 *
	 * @return void;
	 */
	hideErrorTooltip : function() {},

	/**
	 * Binds events
	 */
	bind : function() {
		FolderManagerView.superclass.bind.call(this);
		this.element.on('click', this.onFolderClick, this, {
			delegate : '.' + this.folderCls
		});
		this.element.on('click', this.onActionBlockClick, this, {
			delegate : '.' + this.actionBlockCls
		});
		this.element.on('click', this.onShowMoreClick, this, {
			delegate : '.' + this.showMoreBtnCls
		});
	},

	/**
	 * Unbind events
	 */
	unbind : function() {
		this.autoUnbind();
	}
});
