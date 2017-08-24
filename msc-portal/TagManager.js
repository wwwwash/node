import Ext from '../../lib/vendor/ExtCore';
import Chaos from '../../lib/chaos/Chaos';
import ChaosObject from '../../lib/chaos/Object';
import Connection from '../../lib/chaos/Connection';
import { Broadcaster } from '../../lib/chaos/Broadcaster';

import ScrollPane from '../Scroll/ScrollPane';
import DynamicSuggestionList from './DynamicList';

/**
 * TagManagerComponent
 */
export default function TagManager(el, config) {
	TagManager.superclass.constructor.call(this, el, config);
}

TagManager.GLOBALEVENT_CONTEST_TAG_ADDED = 'tagmanager-tag-added';
TagManager.GLOBALEVENT_CONTEST_TAG_REMOVED = 'tagmanager-tag-removed';

Chaos.extend(TagManager, ChaosObject, {
	// suggestionList: LocalSuggestionList,
	suggestionList : DynamicSuggestionList,

	/** @property {string}    Classname of each added tags. */
	tagCls                         : 'added_tag',
	/** @property {string}    Id of the tag suggest dropdown container */
	tagSuggestContainerId          : 'tag_suggest_list_container',
	/** @property {string}    Template string for a list item of the tag suggest panel */
	tagSuggestListItemTpl          : '<li data-id="{mongoTag}" data-tag-name="{nameTag}"><a href="#"><span></span>{tag}</a></li>', // eslint-disable-line
	/** @property {string}    ID of the tag suggestion list UL (next tpl) */
	tagSuggestListId               : 'tag_suggest_list',
	/** @property {string}    Template string for the container of the list items */
	tagSuggestListItemContainerTpl : '<ul id="tag_suggest_list">{htmlContent}</ul>',
	/** @property {number}    Delay for the tag suggest task start */
	tagSuggestTaskDelay            : 100,
	/** @property {string}    Node name of the tag suggest list items */
	tagSuggestListItemNode         : 'li',
	/** @property {string}    Attribute of the tag suggest list item that will be queried for its content */
	tagNameDataAttr                : 'tagName',
	/** @property {string}    Attribute of the tag suggest list item that will be queried for its content */
	mongoDataAttr                  : 'id',
	/** @property {string}    Attribute of the tag suggest list item that will be queried for its content */
	tagSuggestWrapperId            : 'tag_suggest_wrapper',
	/** @property {string}    Id of the tag editor wrapper */
	tagEditorWrapperId             : 'tag_editor_wrapper',
	/** @property {string}    Container ID that contains all the currently added tags */
	addedTagContainerId            : 'tag_container',
	/** @property {Array}    We'll save the selected tags to this array, and we'll sync this to inputs */
	selectedTagsArray              : [],
	/** @property {string}    Id of a template string for the added tags */
	addedTagTemplateId             : 'added_tag_template',
	/** @property {string}    Class of the disabled state of the field */
	fieldDisabledCls               : 'disabled',
	/** @property {string}    Selector of the dropdownArrow in the editor container */
	selectArrowSel                 : 'a',
	/** @property {string}    This element selector wraps the tag name string */
	tagNameWrapperSel              : 'strong',
	/** @property {string}    Fake placeholder element selector */
	placeholderSel                 : '.fakePlaceholder',
	/** @property {string}    Class name of the scrollbar */
	scrollbarCls                   : 'scrollbar',
	/** @property {string}    Simple hide class */
	hideCls                        : 'hide',
	/** @property {string}    The main container id of the component */
	tagEditorContainerId           : 'tag_editor_container',
	/** @property {string}    Template of the white loader element */
	whiteLoaderTpl                 : '<span class="whiteLoader small"></span>',
	/** @property {string}    Template of the ajax failure */
	ajaxFailureTpl                 : '<span class="error">ERROR - Please refresh page</p>',
	/** @property {string}    Storage id in the SessionStorage for the tags*/
	tagsStorageId                  : 'videoContestTags',
	/** @property {number}    Number of max items can be listen in the suggestion dropdown */
	suggestionMaxResults           : 100,
	/** @property {string}    Service routing for suggestion list ajax request */
	tagSuggestAjaxRoute            : 'MusicLibrary/GetAllMusic',
	/** @property {string}    Service routing for tag save ajax request */
	tagSaveAjaxRoute               : 'VideoContest/AddMusicTag',
	/** @property {string}    Service routing for tag delete ajax request */
	tagDeleteAjaxRoute             : 'VideoContest/DeleteMusicTag',
	/** @property {boolean}   Variable which can prevent to remove the last tag in the field */
	preventLastTagDelete           : true,

	/* PRIVATES */

	/** @property {boolean}    If body click tracking is active, we don't bind it again */
	_isBodyClickActive : false,

	/** @property {Object}     Loader element in the right side of the field */
	_loader : undefined,

	/** @property {Object}     Sending custom data with save request  */
	_saveCustomData : {},


	/**
	 * Standard initializer
	 *
	 * @param {Object|string} el
	 * @param {Object} config
	 */
	init : function(el, config) {
		this.config = config;
		this._collectElements();
		this._setTextareaPadding();
		this._handlePlaceholder();

		this._readPredefinedTags();

		this.suggestionList = new this.suggestionList(this.element, {});

		Broadcaster.addEvents(
			TagManager.GLOBALEVENT_CONTEST_TAG_ADDED
		);

		TagManager.superclass.init.call(this, el, config);
	},

	/**
	 * Shows the tagmanager.
	 * @public
	 * @return void
	 */
	show : function() {
		this._tagEditorContainerEl.removeClass(this.hideCls);
	},

	/**
	 * Hides the tagmanager.
	 * @public
	 * @return void
	 */
	hide : function() {
		this._tagEditorContainerEl.addClass(this.hideCls);
	},

	/**
	 * Deletes the given tag element from DOM.
	 * @public
	 * @param {Object} tagEl   Element to delete
	 * @return void
	 */
	deleteAddedTag : function(tagEl) {
		if (tagEl && this.getAllAddedTags().getCount() > 1) {
			this.hideSuggestList();
			this._deleteTagRequest(tagEl);
		}
	},

	/**
	 * Adds the new selected tag to DOM
	 * @public
	 * @param {Object} containerEl      Container element
	 * @param {Object|Array} params           Content to append
	 *
	 * @return {Object|undefined}
	 */
	addNewSelectedTag : function(containerEl, params) {
		var addedTagTemplate = new Ext.Template(Ext.get(this.addedTagTemplateId).dom.innerHTML);

		return this._addToDOM({
			containerEl : containerEl,
			html        : addedTagTemplate.applyTemplate(params).trim(),
			method      : 'append'
		});
	},

	/**
	 * Starts to remove the last added tag from DOM
	 * @private
	 * @return void;
	 */
	_removeLastAddedTag : function() {
		var lastIndex = this.getAllAddedTags().getCount() - 1,
			lastTagEl = this.getAddedTag(lastIndex);

		if (lastTagEl && !lastTagEl.hasClass(this.fieldDisabledCls)) {
			this.deleteAddedTag(lastTagEl);
			this._setTagInputFocus();
		}
	},

	/**
	 * Collects all elements that will be handled by the manager
	 * @private
	 * @return void
	 */
	_collectElements : function() {
		this._bodyEl = Ext.getBody();
		this._addedTagContainerEl = Ext.get(this.addedTagContainerId);
		this._tagSuggestWrapperEl = Ext.get(this.tagSuggestWrapperId);
		this._tagSuggestContainerEl = Ext.get(this.tagSuggestContainerId);
		this._tagEditorContainerEl = Ext.get(this.tagEditorContainerId);
		this._textareaEl = this.element.select('textarea').item(0);
		this._tagWrapperEl = Ext.get(this.tagEditorWrapperId);
		this._selectArrowEl = this._tagWrapperEl.select(this.selectArrowSel);
		this._placeholderEl = this._tagWrapperEl.select(this.placeholderSel).item(0);
	},

	/**
	 * Reads the tags which are predefined (saved previously, and loaded back to the dom now)
	 * @private
	 */
	_readPredefinedTags : function () {
		var self = this;
		this.selectedTagsArray = [];

		this.getAllAddedTags().each(function() {
			var tagName = this.child(self.tagNameWrapperSel).dom.innerHTML;
			self.selectedTagsArray.push(tagName);
		});
	},

	/**
	 * Sets the padding of the textarea
	 * @private
	 * @return void;
	 */
	_setTextareaPadding : function() {
		var tagEls = this.getAllAddedTags(),
			cnt = tagEls.getCount(),
			marginLeft = null,
			marginTop = null;

		if (cnt > 0) {
			// Counts the last item's right position. getRight() doesn't work :(
			var lastItem = tagEls.item(cnt - 1),
				lastItemTopLeftCoord = lastItem.getOffsetsTo(this._addedTagContainerEl),
				lastItemWidth = lastItem.getWidth();

			marginLeft = lastItemTopLeftCoord[0] + lastItemWidth + 4 + 'px';
			marginTop = lastItemTopLeftCoord[1] + 'px';
		}

		this._textareaEl.setStyle({
			'margin-left' : marginLeft,
			'margin-top'  : marginTop
		});
	},

	/**
	 * Creates and handles the scrollbar component
	 * @private
	 * @return void
	 */
	_scrollbarFactory : function() {
		if (!this._scrollPane) {
			this._scrollPane = new ScrollPane(this._tagSuggestWrapperEl, {
				containerId     : this.tagSuggestContainerId,
				contentId       : this.tagSuggestListId,
				tpl       			   : '<div class="scroll-pane"><div class="scrollbar"></div></div>',
				scrollBarClass  : this.scrollbarCls,
				useNativeScroll : false
			});

			this._scrollPane.on(ScrollPane.EVENT_SCROLL_BEFORE_BOTTOM, this._scrollEventHandler, this);
		}
		else {
			this._scrollPane.updateContainerStyle();
		}

		if (this._tagSuggestContainerEl.getHeight() >= this._tagSuggestListEl.getHeight()) {
			this._scrollPane.getScrollBar().hide();
		}
		else {
			this._scrollPane.getScrollBar().show();
			this._scrollPane.setScrollBarHeight();
		}
	},

	_scrollEventHandler : function () {
		if (!this._scrollPane.getScrollBar().isVisible()) {
			return;
		}

		var keyword = this._getSearchKeyWord();
		this.suggestionList.nextPage(keyword, function (error, data) {
			if (error) {
				this._tagWrapperEl.dom.innerHTML = this.ajaxFailureTpl;
				return;
			}

			this.showSuggestList(data, true);
		}.bind(this));
	},

	/**
	 * Handling placeholder of the textarea. Makes it empty if the input has tags.
	 * @private
	 * @return void
	 */
	_handlePlaceholder : function() {
		var cnt = this.getAllAddedTags().getCount();

		if (cnt === 0) {
			this._placeholderEl.setDisplayed(true);
		}
		else {
			this._placeholderEl.setDisplayed(false);
		}
	},

	/**
	 * Creates a delayedTask to prevent requesting multiple ajaxes when typing.
	 *
	 * @method _startTagSuggestTimeout
	 * @private
	 *
	 * @return void;
	 */
	_startTagSuggestTimeout : function() {
		if (!(this._delayedTagSuggestTask instanceof Ext.util.DelayedTask)) {
			this._delayedTagSuggestTask = new Ext.util.DelayedTask(this._requestTagSuggest, this);
		}
		this._delayedTagSuggestTask.cancel();
		this._delayedTagSuggestTask.delay(this.tagSuggestTaskDelay);
	},

	/**
	 * Returns the currently added tag elements
	 * @public
	 * @return {Object} Composite Element
	 */
	getAllAddedTags : function() {
		return this.element.select(this.tagCls.dot());
	},

	/**
	 * Enabling the input field.
	 * @public
	 * @return void
	 */
	enableField : function() {
		this._tagWrapperEl.removeClass(this.fieldDisabledCls);
	},

	/**
	 * Enabling the input field.
	 * @public
	 * @return void
	 */
	disableField : function () {
		this._tagWrapperEl.addClass(this.fieldDisabledCls);
	},

	/**
	 * Adds the given content to DOM.
	 * @private
	 * @param {Object} params   Params for DomHelper
	 * @return {Object|undefined}
	 */
	_addToDOM : function(params) {
		if (params.containerEl && params.html) {
			return Ext.DomHelper[params.method](params.containerEl, params.html, true);
		}
		return undefined;
	},

	/**
	 * Appends the given html fragment.
	 * @public
	 * @param {Object} containerEl   Container element to append [Ext.Element]
	 * @param {string} html          HTML to append
	 * @param method
	 * @return {Object|undefined}
	 */
	appendTagSuggest : function(containerEl, html, method = 'overwrite') {
		return this._addToDOM({
			containerEl : containerEl,
			html        : html,
			method      : method
		});
	},

	/**
	 * Get first suggestion element in the suggestion list.
	 * Or returns false if there is no suggestion list.
	 * @public
	 * @returns {boolean|Ext.Element}
	 */
	getFirstSuggestion : function() {
		if (this._tagSuggestListEl && this.isVisible(this._tagSuggestListEl)) {
			return this._tagSuggestListEl.select('li').item(0);
		}

		return false;
	},

	/**
	 * Resets a given field
	 * @public
	 * @return void
	 */
	resetInputField : function() {
		if (this.getAllAddedTags().elements.length === 0) {
			this._placeholderEl.setDisplayed(true);
		}
		this._textareaEl.dom.value = '';
	},

	/**
	 * Tries to focus the given element.
	 * @private
	 * @return void;
	 */
	_setTagInputFocus : function() {
		this._textareaEl.focus();
	},

	/**
	 * Returns an added tag regarding its number.
	 * @public
	 * @param {number} index   Number of the element to search
	 * @return {Object}
	 */
	getAddedTag : function(index) {
		return this.getAllAddedTags().item(index);
	},

	/**
	 * Send a request to delete specific tag.
	 * @private
	 * @param {Object} tagEl Tag Ext.Element to delete
	 * @return void
	 */
	_deleteTagRequest : function(tagEl) {
		tagEl.addClass(this.fieldDisabledCls);

		var mongoId = tagEl.data(this.mongoDataAttr),
			tagName = tagEl.child(this.tagNameWrapperSel).dom.innerHTML,
			paramObj = {
				element : tagEl,
				musicId : mongoId,
				tagName : tagName
			};

		// Extending paramObj with custom data
		if (typeof this._saveCustomData === 'object') {
			Ext.apply(paramObj, this._saveCustomData);
		}

		Connection.Ajax.request({
			url     : Chaos.getUrl(this.tagDeleteAjaxRoute, this.config.routeParams || {}),
			method  : 'post',
			params  : paramObj,
			scope   : this,
			success : this._tagDeleteRequestSuccess,
			error   : this._tagDeleteRequestError,
			failure : this._tagDeleteRequestError
		});
	},

	/**
	 * Success callback for _deleteTagRequest
	 * @private
	 * @param {Object} response Response object
	 * @param {Object} request Request object
	 * @return void
	 */
	_tagDeleteRequestSuccess : function(response, request) {
		if (response.json.status === 'ERROR') {
			this._tagDeleteRequestError(response, request);
			return;
		}

		var reqElement = request.params.element;
		var tagCount = this.getAllAddedTags().elements.length;

		if (reqElement && reqElement instanceof Ext.Element) {
			var tagName = reqElement.child(this.tagNameWrapperSel).dom.innerHTML,
				index = this.selectedTagsArray.indexOf(tagName);
			this.selectedTagsArray.splice(index, 1);

			reqElement.remove();
			this._setTextareaPadding();
			this._handlePlaceholder();
			this.hideSuggestList();
		}

		Broadcaster.fireEvent(TagManager.GLOBALEVENT_CONTEST_TAG_REMOVED, { tagCount : tagCount });
	},

	/**
	 * Failed callback for _deleteTagRequest
	 * @private
	 * @param {Object} response Response object
	 * @param {Object} request Request object
	 * @return void
	 */
	_tagDeleteRequestError : function(response, request) {
		var reqElement = request.params.element;
		if (reqElement && reqElement instanceof Ext.Element) {
			reqElement.removeClass(this.fieldDisabledCls);
		}
	},

	/**
	 * Send a tag save request to a remote host
	 * @private
	 * @param {Object} el Ext.Element of the tag to save
	 * @return void
	 */
	_saveTagRequest : function(el) {
		// Disable tag element until request is done
		el.addClass(this.fieldDisabledCls);

		var mongoId = el.data(this.mongoDataAttr),
			tagName = el.child(this.tagNameWrapperSel).dom.innerHTML;

		this.selectedTagsArray.push(tagName);

		var paramObj = {
			element : el,
			musicId : mongoId,
			tagName : tagName
		};

		// Extending paramObj with custom data
		if (typeof this._saveCustomData === 'object') {
			Ext.apply(paramObj, this._saveCustomData);
		}

		Connection.Ajax.request({
			url     : Chaos.getUrl(this.tagSaveAjaxRoute, this.config.routeParams || {}),
			method  : 'post',
			params  : paramObj,
			scope   : this,
			success : this._saveTagRequestSuccess,
			error   : this._saveTagRequestError,
			failure : this._saveTagRequestError
		});
	},

	/**
	 * Success callback for _saveTagRequest
	 * @private
	 * @param {Object} response Response object
	 * @param {Object} request Request object
	 * @return void
	 */
	_saveTagRequestSuccess : function (response, request) {
		if (response.json.status === 'ERROR') {
			this._saveTagRequestError(response, request);
			return;
		}

		var reqElement = request.params.element;
		var tagCount = this.getAllAddedTags().elements.length;

		if (reqElement && reqElement instanceof Ext.Element) {
			reqElement.removeClass(this.fieldDisabledCls);
		}

		Broadcaster.fireEvent(TagManager.GLOBALEVENT_CONTEST_TAG_ADDED, { tagCount : tagCount });
	},

	/**
	 * Success callback for _saveTagRequest
	 * @private
	 * @param {Object} response Response object
	 * @param {Object} request Request object
	 * @return void
	 */
	_saveTagRequestError : function(response, request) {
		var reqElement = request.params.element,
			tagName = reqElement.child(this.tagNameWrapperSel).dom.innerHTML,
			index = this.selectedTagsArray.indexOf(tagName);

		this.selectedTagsArray.splice(index, 1);

		if (reqElement && reqElement instanceof Ext.Element) {
			reqElement.remove();
			this._setTextareaPadding();
			this._handlePlaceholder();
		}
	},

	/**
	 * Handles a click event on an already added tag item in the tag list.
	 * @param {Object} ev       Event object
	 * @param {Object} target   Clicked element
	 * @return void;
	 */
	_onAddedTagClick : function(ev, target) {
		ev.preventDefault();

		var clickedTarget = Ext.get(target),
			elem = clickedTarget.findParent(this.tagCls.dot(), 3, true);

		this.deleteAddedTag(elem);
		this._setTagInputFocus();
	},

	/**
	 * Handles a keydown event on a tagsearch field.
	 * @private
	 * @return void;
	 */
	_onTextareaKeyup : function() {
		if (this._getSearchKeyWord().length > 1) {
			this._startTagSuggestTimeout();
		}
		else {
			this.hideSuggestList();
		}
	},

	/**
	 * Handling the textarea keydown event. Adds or Removes a tag.
	 * @private
	 * @param {Object} ev Event Object
	 * @return void
	 */
	_onTextareaKeydown : function(ev) {
		var charCode = ev.getCharCode();

		this._placeholderEl.setDisplayed(false);

		if (charCode === 13) {
			ev.preventDefault();

			// If enter, add first suggestion as a tag
			var firstSuggestion = this.getFirstSuggestion();
			if (firstSuggestion) {
				var tagName = firstSuggestion.data(this.tagNameDataAttr),
					mongoId = firstSuggestion.data(this.mongoDataAttr);
				this.addTag(tagName, mongoId);
			}
		}

		// If backspace pressed, remove last tag
		if (charCode === 8 && this._getSearchKeyWord().length === 0) {
			this._removeLastAddedTag();
		}
	},

	/**
	 * Returns the current keyword for requesting tagsearch.
	 *
	 * @method _getSearchKeyWord
	 *
	 * @return {string} current value of the input field
	 */
	_getSearchKeyWord : function() {
		return this._textareaEl.getValue();
	},

	/**
	 * Starts to get a suggestion
	 * @private
	 * @return void;
	 */
	_requestTagSuggest : function() {
		var keyword = this._getSearchKeyWord();
		if (keyword.length > 0) {
			this.getTagSuggest(keyword);
		}
		else {
			this.hideSuggestList();
		}
	},

	/**
	 * Starts to get suggestion by the given keyword via ajax.
	 * @public
	 * @param {string} keyword   Keyword for the suggestion
	 * @return void
	 */
	getTagSuggest : function(keyword = '') {
		this.disableField();
		if (!this._loader) {
			this._loader = Ext.get(
				Ext.DomHelper.append(this._tagWrapperEl, this.whiteLoaderTpl)
			);
		}

		this.suggestionList.getList(keyword, function(error, data) {
			if (error) {
				this._tagWrapperEl.dom.innerHTML = this.ajaxFailureTpl;
				return;
			}

			this.enableField();
			if (this._loader) {
				this._loader.remove();
				delete this._loader;
			}

			this.showSuggestList(data);
		}.bind(this));
	},

	/**
	 * Setting custom data for save request
	 * @param {string} data Data object
	 * @public
	 * @return {boolean}
	 */
	setSaveCustomData : function(data) {
		if (typeof data === 'object') {
			this._saveCustomData = data;

			return true;
		}

		return false;
	},

	/**
	 * Filters and shows the suggestion list.
	 *
	 * @method showSuggestList
	 *
	 * @return void;
	 */
	showSuggestList : function(suggests, append) {
		// Pop out already selected tags from the suggest list
		var	updatedSuggestionList = this._checkTagException(suggests),
		// Highlight typed-in keyword in the results
			highlightedTagArray = this._highlightStingMatch(updatedSuggestionList),
		// Creates HTML string
			tagSuggestListItems = this._setTagSuggestListItems(highlightedTagArray, updatedSuggestionList);

		var tagSuggestBlockHTML = new Ext.Template(this.tagSuggestListItemContainerTpl)
			.applyTemplate({
				htmlContent : tagSuggestListItems
			});

		this._tagSuggestListEl = this.appendTagSuggest(
			this._tagSuggestContainerEl,
			tagSuggestBlockHTML,
			append ? 'append' : 'overwrite'
		);
		this._tagSuggestWrapperEl.show();

		this._setSuggestListTop();
		this._scrollbarFactory();

		this._tagSuggestListEl.select(this.tagSuggestListItemNode).on('click', this.onTagSuggestListItemClick, this, {
			preventDefault : true,
			single         : true
		});
	},

	/**
	 * Hides suggestion list.
	 * @public
	 * @return void
	 */
	hideSuggestList : function() {
		if (this._scrollPane) {
			this._scrollPane.getScrollBar().hide();
		}
		this._tagSuggestWrapperEl.hide();
		delete this._tagSuggestListEl;
	},

	/**
	 * Sets the top position of the suggestion list.
	 * @private
	 * @return void
	 */
	_setSuggestListTop : function () {
		var top = this._tagWrapperEl.getHeight(),
			width = this._tagWrapperEl.getWidth();

		this._tagSuggestWrapperEl.setTop(top + 10 + 'px');
		this._tagSuggestWrapperEl.setWidth(width + 'px');
		this._scrollbarFactory(); // Update scrollpane
	},

	/**
	 * Modify the array to be able to show highlighted content
	 * @private
	 * @param {Array} suggestionList   Suggestion list array
	 * @return {Array}
	 */
	_highlightStingMatch : function (suggestionList) {
		var	searchedValue = this._textareaEl.getValue(),
			modifiedList = [];

		for (var i = 0; i < suggestionList.length; i++) {
			if (suggestionList[i].label) {
				modifiedList[i] = {
					id    : suggestionList[i].id,
					label : suggestionList[i].label
				};
				modifiedList[i].label = modifiedList[i].label.replace(
					new RegExp('(' + searchedValue + ')', 'i'), '<b>$1</b>'
				);
			}
		}

		return modifiedList;
	},

	/**
	 * Compares the ajax suggests tags with the hidden input
	 * And put out from the list to prevent duplication of tags
	 * @private
	 * @param {Array} incomingTags   Event object
	 * @return {Array};
	 */
	_checkTagException : function (incomingTags) {
		return incomingTags.filter(function(obj) {
			return !obj.label.inArray(this.selectedTagsArray);
		}.bind(this));
	},

	/**
	 * Sets an HTML fragment from the given taglist.
	 * @private
	 * @param {Array} highlightedList     Array containing a taglist
	 * @param {Array} originalList      Tags for data-tag-name attribute
	 * @return {string}  list items as an HTML string
	 */
	_setTagSuggestListItems : function(highlightedList, originalList) {
		var tagSuggestListItemTpl = new Ext.Template(this.tagSuggestListItemTpl),
			tagSuggestListItems = '';

		for (var i = 0; i < originalList.length; i++) {
			tagSuggestListItems += tagSuggestListItemTpl.applyTemplate({
				tag      : highlightedList[i].label,
				mongoTag : originalList[i].id,
				nameTag  : originalList[i].label
			});
		}

		return tagSuggestListItems;
	},

	/**
	 * Handles a click event on a tag suggest list's items
	 * @param {Object} ev      Event object
	 * @return void;
	 */
	onTagSuggestListItemClick : function(ev) {
		var target = Ext.fly(ev.target).parent(this.tagSuggestListItemNode) || Ext.get(ev.target),
			tagName = target.data(this.tagNameDataAttr),
			mongoId = target.data(this.mongoDataAttr);

		this.addTag(tagName, mongoId);
	},

	/**
	 * Removes all tags from the field
	 * @public
	 * @return void
	 */
	resetAllTags : function () {
		var	allTags = this.getAllAddedTags();

		allTags.each(function() {
			this.remove();
		});

		this.selectedTagsArray = [];
		this._setTextareaPadding();
		this._handlePlaceholder();
	},

	/**
	 * Adds a new tag to the container
	 * @public
	 * @param {string} tagName Name of the tag
	 * @param {string} mongoId MongoId of the tag
	 * @return void
	 */
	addTag : function(tagName, mongoId) {
		var addedTagEl = this.appendNewTag(tagName, mongoId);

		this._setTextareaPadding();
		this.resetInputField();
		this._setTagInputFocus();
		this.hideSuggestList();
		this._handlePlaceholder();

		this._saveTagRequest(addedTagEl);
	},

	/**
	 * Handles a click event on a tag suggest list's items
	 *
	 * @method appendNewTag
	 * @param {string} tagName      Tag to append
	 * @param {string} mongoId
	 *
	 * @return {Object|undefined}
	 */
	appendNewTag : function (tagName, mongoId) {
		return this.addNewSelectedTag(this._addedTagContainerEl, {
			tagName : tagName,
			id      : mongoId
		});
	},

	/**
	 * Check if element is displayed or not
	 *
	 * @param el Ext.Element to check
	 * @public
	 *
	 * @returns {boolean}
	 */
	isVisible : function(el) {
		return !!el && el.getStyle('display') !== 'none';
	},

	/**
	 * Binds body for click event to to be able to close the
	 * dropdowns when user click elsewhere
	 * return void;
	 */
	bindBody : function () {
		if (!this._isBodyClickActive) {
			this._bodyEl.on('mousedown', this.onBodyClick, this);
			this._isBodyClickActive = true;
		}
	},

	/**
	 * Unbinds body because when we don't have dropdowns opened,
	 * we do not need to track clicking
	 * return void;
	 */
	unBindBody : function () {
		this._bodyEl.un('mousedown', this.onBodyClick, this);
		this._isBodyClickActive = false;
	},

	/**
	 * When there was a click on the album selector in Folder Manager Controller,
	 * We need to catch it to close all other dropdowns in the same block
	 * @return void;
	 */
	onBodyClick : function (ev) {
		var insideEditor = this.element.contains(ev.target);

		if (!insideEditor) {
			this.hideSuggestList();
		}
	},

	/**
	 * Toggles suggestion list on arrow click.
	 * @private
	 * @param {Object} ev Event Object
	 * @return void
	 */
	_onSelectArrowClick : function (ev) {
		ev.preventDefault();

		if (this.isVisible(this._tagSuggestListEl)) {
			this.hideSuggestList();

			return;
		}

		this.getTagSuggest(this._getSearchKeyWord());
	},

	/**
	 * On textarea focus event
	 * @private
	 */
	_onTextareaFocus : function() {
		this._placeholderEl.setDisplayed(false);
	},

	/**
	 * Initial bind method
	 *
	 * @return void
	 */
	bind : function() {
		TagManager.superclass.bind.call(this);

		this.element.on('click', this._onAddedTagClick, this, { delegate : '.' + this.tagCls });

		if (this._selectArrowEl) {
			this._selectArrowEl.on('click', this._onSelectArrowClick, this);
		}

		this._tagWrapperEl.on('click', this._setTagInputFocus, this);

		this._textareaEl.on({
			blur    : this.resetInputField,
			focus   : this._onTextareaFocus,
			keydown : this._onTextareaKeydown,
			keyup   : this._onTextareaKeyup,
			scope   : this
		});

		this.bindBody();
	},

	/**
	 * Initial unbind method
	 *
	 * @return void
	 */
	unbind : function() {
		TagManager.superclass.unbind.call(this);

		this.element.un('click', this._onAddedTagClick, this, { delegate : '.' + this.tagCls });

		if (this._selectArrowEl) {
			this._selectArrowEl.un('click', this._onSelectArrowClick, this);
		}

		this._tagWrapperEl.un('click', this._setTagInputFocus, this);

		this._textareaEl.un({
			blur    : this.resetInputField,
			focus   : this._onTextareaFocus,
			keydown : this._onTextareaKeydown,
			keyup   : this._onTextareaKeyup,
			scope   : this
		});

		if (this._scrollPane) {
			this._scrollPane.un(ScrollPane.EVENT_SCROLL_BEFORE_BOTTOM, this._scrollEventHandler, this);
		}

		this.unBindBody();
	}
});
