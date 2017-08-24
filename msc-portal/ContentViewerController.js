import $ from 'jquery';

import Ext from '../../lib/vendor/ExtCore';
import Chaos from '../../lib/chaos/Chaos';
import Controller from '../../lib/chaos/Controller';

import VideoPlayer from '../Video/VideoPlayer';

/**
 * ContentViewerController
 *
 * Loads new content to the overlay according which
 * arrow you click (prev||next)
 *
 * @How it works
 *
 *  The navigation button is an <a> tag
 *  ContentViewer is calling the url located in the clicked <a> element's 'href' attribute for next photo
 *  Arrow or navigation Button must have this class: 'content_viewer_navigation'
 *
 */

export default function ContentViewerController(el, config) {
	ContentViewerController.superclass.constructor.call(this, el, config);
}

Ext.apply(ContentViewerController, {
	EVENT_PHOTO_BLOCK_REPLACED      : 'photo-block-replaced',
	EVENT_GET_PHOTO_BLOCK           : 'get-photo-block',
	EVENT_TURN_ON_COMMENTS          : 'turn-on-comments',
	EVENT_JOIN_CHANNEL_BUTTON_CLICK : 'join-channel-button-click',
	EVENT_IS_EXCLUSIVE_CONTENT      : 'is-exclusive-content',
	EVENT_COMMENT_BOX_RESIZE        : 'comment-box-resize'
}, {});

Chaos.extend(ContentViewerController, Controller, {

	/** @var {String}           Photo Viewer Navigation cls */
	navigationCls                 : 'content_viewer_navigation',
	/** @var {String}           Overlay Comment container cls */
	overlayContainerId            : 'mvc_overlay_container',
	/** @var {String}           Id of overlay photo viewer next button */
	overlayContentViewerNextBtnId : 'channel_next_media',
	/** @var {String}           Id of overlay photo viewer next button */
	overlayContentViewerPrevBtnId : 'channel_prev_media',
	/** @var {String}           Data-comment-id selector */
	dataCommentIdSel              : '[data-comment-id]',
	/** @var String                 Flash player id for videos on overlay  */
	videoContainerId              : 'channel_video_container',
	/** @var {String}           Data-comment-folder name selector */
	dataFolderNameSel             : '[data-folder-name]',
	/** @var {String}           Comment content cls */
	commentContentCls             : 'scrollContent',
	/** @var {String}           Frame of any content that should be responsive */
	frameCls                      : 'frame',
	/** @var {String}           Content container cls */
	contentContainerCls           : 'content_container',
	/** @var {String}           Comment content cls */
	commentWrapperCls             : 'comment_wrapper',
	/** @var {String}           Comment content cls */
	commentInnerCls               : 'comment_inner',
	/** @var {String}           Overlay comment container cls */
	overlayCommentCtnCls          : 'overlay_comment_container',
	/** @var {String}           If comments should appear in full screen the overlayCommentCtn should have it */
	fitScreenCls                  : 'fitscreen',
	/** @var {String}           Selector for picture overlay. */
	pictureCls                    : 'picture_comment_container',
	/** @var {String}           Selector for note overlay. */
	noteCls                       : 'note_comment_container',
	/** @var {String}           Selector for note content item. */
	noteSel                       : '.note_content',
	/** @var {Number}           Height of the comment title element. */
	commentTitleHeight            : 45,
	/** @var {Number}           Height of the comment input element. */
	commentInputHeight            : 60,
	/** @var {Number}           If the comments appear in full screen, it gives the padding from the window */
	overlayTopPadding             : 20,
	/** @var {Number}           Overlay side padding */
	overlaySidePadding            : 10,
	/** @var {String}           For tracking resize progress */
	isResizing                    : false,
	/** @var {String}           If key navigation is enabled */
	isKeyNavigationEnabled        : true,
	/** @var {String}           Content loading progress */
	isLoading                     : false,
	/** @var {String}           Join channel button css class */
	joinChannelButtonClass        : 'join_channel',
	/** @var {String}           Data Attribute name of the Exclusive content */
	exclusiveContentDataAttribute : 'data-exclusive',
	/** @var {Number}           Limit for image preloading (number of images) */
	preloadLimit                  : 1,
	/** @var {String}           Url for heash resolve */
	hashResolveUrl                : 'ChannelGalleryUrlHashResolver/Get',
	/** @var {String}           Url for get comment details */
	getCommentDetailsUrl          : 'ChannelComment/Update',
	/** @var {Object}           Delayed task for comments loading */
	getCommentTask                : null,
	/** @var {Object}           Fit screen element */
	fitScreenEl                   : '',
	/** @var {Object}           Comment inner element */
	commentInnerEl                : '',
	/** @var {Object}           Content container element */
	contentContainerEl            : '',
	/** @var {Object}           Comment wrapper element */
	commentWrapperElement         : '',

	/** Ajax routes **/

	/** @var {String}           Url for get overlay content */
	photoBlockUrl    : 'ChannelPostDetails/Index',
	/** @var {String}           route for next content */
	nextContentRoute : 'ChannelNextPostDetails/Get',
	/** @var {String}           route for prev content */
	prevContentRoute : 'ChannelPreviousPostDetails/Get',

	/** @var {String}           Current comment id */
	_currentPhotoId           : undefined,
	/** @var {String}           Current photo album name */
	_currentPhotoAlbumName    : undefined,
	/** @var {String}           Url for next content */
	_nextContentUrl           : undefined,
	/** @var {String}           Url for prev content */
	_prevContentUrl           : undefined,
	/** @var {Array}            Array of images to preload */
	_preloadedImageArray      : [],
	/** @var {Number}           Counter for array of images to prleoad */
	_currentContentIndex      : 0,
	/** @var {Object}           Details object of currently opened album */
	_albumDetails             : {},
	/** @var {Object}           Urls of resolved images */
	_resolvedImagesArray      : {},
	/** @var {Number}           Index of last preloaded image object */
	_lastPreloadedImageIndex  : 0,
	/** @var {Number}           Index of first preloaded image object */
	_firstPreloadedImageIndex : 0,
	/** @var {Bool}             True if all images has been preloaded */
	_allImagesLoaded          : false,

	/**
	 * Standard init function
	 *
	 * @param {Object} el
	 * @param {Object} config
	 *
	 * @return void
	 */
	init : function(el, config) {
		Chaos.addEvents(
			ContentViewerController.EVENT_PHOTO_BLOCK_REPLACED,
			ContentViewerController.EVENT_GET_PHOTO_BLOCK,
			ContentViewerController.EVENT_TURN_ON_COMMENTS,
			ContentViewerController.EVENT_JOIN_CHANNEL_BUTTON_CLICK,
			ContentViewerController.EVENT_IS_EXCLUSIVE_CONTENT,
			ContentViewerController.EVENT_COMMENT_BOX_RESIZE
		);

		this.bodyEl = Ext.getBody();
		this.overlayContainerEl = Ext.get(this.overlayContainerId);

		ContentViewerController.superclass.init.call(this, el, config);
	},

	/**
	 * When the first overlay arrived
	 * it sets the url-s and binds events for
	 * navigation arrows
	 *
	 * @method bindSliderEvents
	 *
	 * @return void;
	 */
	setNavigation : function() {
		this.overlayContentViewerNextBtnEl = Ext.get(this.overlayContentViewerNextBtnId);
		this.overlayContentViewerPrevBtnEl = Ext.get(this.overlayContentViewerPrevBtnId);
		this.navigationItems = this.element.select('.' + this.navigationCls);
		if (!this.navigationItems.item(0)) {
			return;
		}
		this.bindNavigation();
	},

	/**
	 * Binds navigation events
	 *
	 * @method bindNavigation
	 *
	 * @return void;
	 */
	bindNavigation : function() {
		this.navigationItems.on('click', this.onNavigationClick, this);
		if (this.isKeyNavigationEnabled) {
			this.bodyEl.un('keydown', this.onKeyPress, this);
			this.bodyEl.on('keydown', this.onKeyPress, this);
		}
	},

	/**
	 * Blocks navigation with keyboard
	 *
	 * @method blockNavigationByKeyboard
	 *
	 * @return void;
	 */
	blockNavigationByKeyboard : function() {
		this.isKeyNavigationEnabled = false;
	},

	/**
	 * Enable navigation with keyboard
	 *
	 * @method enableNavigationByKeyboard
	 *
	 * @return void;
	 */
	enableNavigationByKeyboard : function() {
		this.isKeyNavigationEnabled = true;
	},

	/**
	 * Turn on comments if comment block ready
	 *
	 * @method onTurnOnComments
	 *
	 * @return void;
	 */
	onTurnOnComments : function(commentDetails) {
		this.fireEvent(ContentViewerController.EVENT_TURN_ON_COMMENTS, commentDetails);
	},

	/**
	 * Handle navigation with keyboard
	 *
	 * @method onKeyPress
	 * @param {Object} ev   Event object
	 *
	 * @return void;
	 */
	onKeyPress : function(ev) {
		if (this.isKeyNavigationEnabled) {
			switch (ev.keyCode) {
				case 39:
					this.showNext();
					break;
				case 37:
					this.showPrev();
					break;
				default:
					return;
			}
		}
	},

	/**
	 * Show next gallery item.
	 *
	 * @method showNext
	 *
	 * @return void;
	 */
	showNext : function() {
		if (this.overlayContentViewerNextBtnEl) {
			this.overlayContentViewerNextBtnEl.dom.click();
		}
	},

	/**
	 * Show previous gallery item.
	 *
	 * @method showPrev
	 *
	 * @return void;
	 */
	showPrev : function() {
		if (this.overlayContentViewerPrevBtnEl) {
			this.overlayContentViewerPrevBtnEl.dom.click();
		}
	},

	/**
	 * Returns whether the content is a picture, or not.
	 *
	 * @return {Boolean}
	 */
	isPicture : function () {
		if (!this.overlayCommentCtnEls) {
			return false;
		}
		return this.overlayCommentCtnEls.item(0).hasClass(this.pictureCls);
	},

	/**
	 * Returns whether the content is a note or not.
	 *
	 * @return {Boolean}
	 */
	isNote : function () {
		if (!this.overlayCommentCtnEls) {
			return false;
		}

		return this.overlayCommentCtnEls.item(0).hasClass(this.noteCls);
	},

	/**
	 * Returns whether the content is a video or not.
	 * @return {Boolean}
	 */
	isVideo : function () {
		return !!Ext.fly(this.videoContainerId);
	},

	/**
	 * Collect every elements belong to
	 * photo viewer
	 *
	 * @method getContentViewerElements
	 *
	 * @return void;
	 */
	getContentViewerElements : function() {
		this.commentContentEl = this.overlayContainerEl.select('.' + this.commentContentCls);
		this.overlayCommentCtnEls = this.overlayContainerEl.select('.' + this.overlayCommentCtnCls);
		this.frameEl = this.overlayContainerEl.select('.' + this.frameCls);
		this.fitScreenEl = this.element.select('.' + this.fitScreenCls).item(0);
		this.commentInnerEl = this.element.select('.' + this.commentInnerCls).item(0);
		this.contentContainerEl = this.element.select('.' + this.contentContainerCls).item(0);
		this.commentWrapperElement = this.element.select('.' + this.commentWrapperCls).item(0);

		if (this.frameEl.item(0) && this.isPicture()) {
			this.photoEl = this.frameEl.item(0).select('img').item(0);
			this.photoEl.un('load', this.setFrameSize, this);
			this.photoEl.on('load', this.setFrameSize, this);
		}
		else if (this.isNote()) {
			this._noteEl = this.frameEl.item(0).select(this.noteSel).item(0);
		}
		else if (this.isVideo()) {
			this._videoPlayer = new VideoPlayer().init({
				element : $('#' + this.videoContainerId)
			});
		}
	},

	/**
	 * Set every necessary things for the carousel
	 * when you open it first time.
	 *
	 * - elements, waiting for image pre-load,
	 * - navigation bindings, frame and comment box
	 *
	 * @method setupCarousel
	 * @param {Object} param    Json object
	 *
	 * @return void;
	 */
	setupCarousel : function(param) {
		this.getContentViewerElements();
		this.fillContentArrays(param);
		this.updateLikes();
		this.setNavigation();
		this.startFrameResize();
		this.startCommentBoxResize();
		this.isNote() && this.ContentViewerView.updateNoteTextSizeAttr(this._noteEl);
	},

	/**
	 * Get the current content index when overlay opens.
	 *
	 * @method getCurrentContentIndex
	 * @param contentArray
	 *
	 * @return {Number}
	 */
	getCurrentContentIndex : function(contentArray) {
		var currentContentIndex,
			currentDocumentId = this.overlayCommentCtnEls.item(0).dom.getAttribute('data-comment-id');

		for (let doc of contentArray.containedDocuments || []) {
			if (doc.id === currentDocumentId) {
				currentContentIndex = doc.folder_index;
				return currentContentIndex;
			}
		}

		return -1;
	},

	/**
	 * Symmetrically sorting images
	 * @Thank you for this comment, now I understand what does this do.
	 * @method symmetricalSorting
	 * @param resolvedImages   Resolved image uris
	 *
	 * @return Array() sortedImages
	 */
	symmetricalSorting : function(resolvedImages) {
		var evenCounter,
			oddCounter,
			sortedImages = [],
			objectLength = resolvedImages.length,
			i = 0,
			preloadLimit = 25;

		evenCounter = oddCounter = this._currentContentIndex;
		preloadLimit = preloadLimit * 2 + 1 > objectLength ? objectLength : preloadLimit * 2 + 1;
		for (i; i < preloadLimit; i++) {
			if (i % 2 === 0) {
				if (evenCounter > objectLength - 1) {
					evenCounter = 0;
				}
				sortedImages[i] = resolvedImages[evenCounter];
				this._lastPreloadedImageIndex = evenCounter;
				evenCounter++;
			}
			else {
				oddCounter--;
				if (oddCounter < 0) {
					oddCounter = objectLength - 1;
				}
				sortedImages[i] = resolvedImages[oddCounter];
				this._firstPreloadedImageIndex = oddCounter;
			}
		}
		return sortedImages;
	},

	/**
	 * Preload images
	 *
	 * @method preloadImages
	 * @param resolvedImages   Resolved image uris
	 *
	 * @return void;
	 */
	preloadImages : function(resolvedImages) {
		if (typeof resolvedImages === 'object' && resolvedImages.length) {
			var index;
			for (let resolved of Object.keys(resolvedImages)) {
				index = this._contentArray.indexOf(resolvedImages[resolved].hash);
				if (index !== -1) {
					this._contentArray[index] = resolvedImages[resolved].url;
				}
			}
		}

		var sortedImages = this.symmetricalSorting(this._contentArray),
			imageSrc = [], i = 0,
			tempArray = [],
			tempImageObj = null;

		for (i; i < sortedImages.length; i++) {
			imageSrc[i] = sortedImages[i];
			tempImageObj = new window.Image();
			tempImageObj.src = imageSrc[i];
			tempArray[i] = tempImageObj;
			tempImageObj = null;
		}

		//Restore original order of array
		this.restoreOrderAfterPreload(this._contentArray, tempArray);
	},

	/**
	 * Restore original order of array after symmetrical sorting and preload.
	 *
	 * @method restoreOrderAfterPreload
	 *
	 * @param originalArray   Original array
	 * @param sortedArray     Sorted array
	 */
	restoreOrderAfterPreload : function(originalArray, sortedArray) {
		var j = 0, k = 0;

		this._preloadedImageArray = [];
		for (j; j < originalArray.length; j++) {
			for (k; k < sortedArray.length; k++) {
				if (originalArray[j] === sortedArray[k].src) {
					this._preloadedImageArray[j] = sortedArray[k];
				}
			}
			k = 0;
		}
	},

	/**
	 * Update likes number in the DOM
	 */
	updateLikes : function () {
		this._currentContentIndex = this.getCurrentContentIndex(this._albumDetails);

		// If there is no index, the likes number is directly in the param object, not in the containedDocuments (videos)
		var firstContentLikes = this._currentContentIndex >= 0 ?
			this._albumDetails.containedDocuments[this._currentContentIndex].likes :
			this._albumDetails.likes || 0;

		if (this.frameEl.item(0)) {
			this.ContentViewerView.updateLikes(this.frameEl.item(0), firstContentLikes);
		}
	},
	/* eslint-disable complexity */
	/**
	 * Fills content array for the carousel.
	 */
	fillContentArrays : function(param) {
		if (!param) {
			return;
		}

		var hashes = [], url;

		//Reset global elements
		this._preloadedImageArray = [];
		this._albumDetails = {};
		this._currentContentIndex = 0;
		this._lastPreloadedImageIndex = 0;
		this._firstPreloadedImageIndex = 0;
		this._allImagesLoaded = false;
		this._resolvedImagesArray = [];
		this._currentPhotoId = undefined;
		this._contentArray = [];
		this._albumDetails = param;
		this._currentContentIndex = this.getCurrentContentIndex(param);

		if (!param.containedDocuments) {
			return;
		}

		for (var i = 0; i < param.containedDocuments.length; i++) {
			var containedDoc = param.containedDocuments[i];

			if ('hash' in containedDoc) {
				hashes.push(containedDoc.hash);
			}

			var content = containedDoc.hash || containedDoc.contentUrl || containedDoc.content;
			this._contentArray.push(content);
		}

		if (hashes.length) {
			url = Chaos.getUrl(
				this.hashResolveUrl,
				{ performerNick : Chaos.getMeta('performerName') },
				{ hashes : hashes }
			);
			this.ContentViewerModel.getResolvedImageUris(url);
		}
		else if (this.isPicture()) {
			this.preloadImages([]);
		}
	},
	/* eslint-enable complexity */

	/**
	 * standByUntilPictureArrive
	 *
	 * @method standByUntilPictureArrive
	 * @param {Object}  detailsObj  Json data for new content
	 * @return void;
	 */
	standByUntilPictureArrive : function() {
		if (this.overlayCommentCtnEls.item(0).hasClass(this.fitScreenCls)) {
			this.startFrameResize();
		}
	},

	/**
	 * Binds resize event for comment box
	 *
	 * @method startCommentBoxResize
	 *
	 * @return void;
	 */
	startCommentBoxResize : function() {
		this.setCommentBoxSize();
		this.fireEvent(ContentViewerController.EVENT_COMMENT_BOX_RESIZE);
		Ext.fly(window).un('resize', this.setCommentBoxSize, this);
		Ext.fly(window).on('resize', this.setCommentBoxSize, this);
	},

	/**
	 * Calculates the correct comment box size
	 *
	 * @method setCommentBoxSize
	 *
	 * @return void;
	 */
	setCommentBoxSize : function() {
		var innerWrapperElement = this.commentInnerEl,
			commentWrapperElement = this.commentWrapperElement,
			height;

		if (innerWrapperElement && commentWrapperElement) {
			height = innerWrapperElement.getHeight() - (this.commentTitleHeight + this.commentInputHeight);
			commentWrapperElement.setHeight(height);
		}
	},

	/**
	 * Binds resize event for photo frame
	 *
	 * @method startFrameResize
	 *
	 * @return void;
	 */
	startFrameResize : function() {
		Ext.fly(window).on('resize', this.setFrameSize, this);
	},

	/**
	 * Calculates the correct frame size
	 *
	 * @method setFrameSize
	 *
	 * @return void;
	 */
	setFrameSize : function() {
		var fitScreenEl = this.fitScreenEl,
			commentInnerEl = this.commentInnerEl,
			contentContainerEl = this.contentContainerEl,
			embedObject;

		if (fitScreenEl) {
			embedObject = fitScreenEl.select('object, embed');
			embedObject.setStyle({
				width  : window.innerWidth * 0.95 - commentInnerEl.getWidth() + 'px',
				height : window.innerHeight * 0.9 + 'px'
			});
		}

		if (fitScreenEl && fitScreenEl.hasClass(this.pictureCls) && this.photoEl) {
			var photoMaxHeight = window.innerHeight * 0.9,
				photoMaxWidth = window.innerWidth * 0.95 - commentInnerEl.getWidth(),
				width = Math.min(fitScreenEl.getWidth() / window.innerWidth * 100, 95),
				height = Math.min(fitScreenEl.getHeight() / window.innerHeight * 100, 90),
				horizontalDistance = (100 - width) / 2 + '%',
				verticalDistance = (100 - height) / 2 + '%',
				contentMinHeight = Math.floor(window.innerHeight * (height / 100));
			fitScreenEl.setStyle({
				minWidth        : width + '%',
				minHeight       : height + '%',
				left            : horizontalDistance,
				right           : horizontalDistance,
				top             : verticalDistance,
				transform       : 'none',
				webkitTransform : 'none'
			});

			this.photoEl.setStyle({
				maxWidth  : photoMaxWidth + 'px',
				maxHeight : photoMaxHeight + 'px'
			});
			// we need to set it separately because the above setStyle might change its height
			this.photoEl.setStyle({
				top : Math.max((contentMinHeight - this.photoEl.getHeight()) / 2, 0) + 'px'
			});

			contentContainerEl.setStyle({
				minHeight : contentMinHeight + 'px'
			});

			// resize commentbox after image is loaded
			this.startCommentBoxResize();
		}
	},

	/**
	 * Gets navigation url-s for prev and next content
	 *
	 * @method setNavigationUrls
	 *
	 * @return void;
	 */
	getNavigationUrls : function() {
		var paramObj = {
			currentDocumentId : this._currentPhotoId,
			folder            : this._currentPhotoAlbumName
		};
		this._nextContentUrl = Chaos.getUrl(this.nextContentRoute, paramObj);
		this._prevContentUrl = Chaos.getUrl(this.prevContentRoute, paramObj);
	},

	/**
	 * onNavigationClick
	 *
	 * @method onNavigationClick
	 * @param {Object} ev   Event object
	 *
	 * return void;
	 */
	onNavigationClick : function(ev) {
		ev.preventDefault();
		var target = Ext.get(ev.target),
			direction = target.dom.tagName.toLocaleLowerCase() === 'a' ? target.dom.getAttribute('data-direction') :
				target.findParent('a').getAttribute('data-direction');

		if (direction === 'next') {
			this.isPicture() && this.preloadNextImage();
			this._currentContentIndex++;
			if (this._currentContentIndex === this._contentArray.length) {
				this._currentContentIndex = 0;
			}
		}
		else {
			this.isPicture() && this.preloadPrevImage();
			this._currentContentIndex--;
			if (this._currentContentIndex < 0) {
				this._currentContentIndex = this._contentArray.length - 1;
			}
		}

		this.refreshContent();
	},

	/**
	 * Preloads next image.
	 *
	 * @method preloadNextImage
	 *
	 * @return void
	 */
	preloadNextImage : function() {
		if (!this._allImagesLoaded) {
			if (this._lastPreloadedImageIndex !== this._firstPreloadedImageIndex) {
				this._lastPreloadedImageIndex++;
				this._lastPreloadedImageIndex =
					this._lastPreloadedImageIndex > this._contentArray.length - 1 ? 0 :
						this._lastPreloadedImageIndex;
				this._preloadedImageArray[this._lastPreloadedImageIndex] = new Image();
				this._preloadedImageArray[this._lastPreloadedImageIndex].src =
					this._contentArray[this._lastPreloadedImageIndex];
			}
			else {
				this._allImagesLoaded = true;
			}
		}
	},

	/**
	 * Preloads prev image.
	 *
	 * @method preloadPrevImage
	 *
	 * @return void
	 */
	preloadPrevImage : function() {
		if (!this._allImagesLoaded) {
			if (this._lastPreloadedImageIndex !== this._firstPreloadedImageIndex) {
				this._firstPreloadedImageIndex--;
				this._firstPreloadedImageIndex =
					this._firstPreloadedImageIndex < 0 ? this._contentArray.length - 1 :
						this._firstPreloadedImageIndex;
				this._preloadedImageArray[this._firstPreloadedImageIndex] = new Image();
				this._preloadedImageArray[this._firstPreloadedImageIndex].src =
						this._contentArray[this._firstPreloadedImageIndex];
			}
			else {
				this._allImagesLoaded = true;
			}
		}
	},

	/**
	 * Details for next content passed by ContentViewerModel
	 *
	 * @method refreshContent
	 * @param {Object}  detailsObj  Json data for new content
	 *
	 * @return void;
	 */
	refreshContent : function() {
		var currentDocumentObj = this._albumDetails.containedDocuments[this._currentContentIndex];

		if (this.frameEl.item(0)) {
			this.ContentViewerView.updateLikes(this.frameEl.item(0), currentDocumentObj.likes);
			this.ContentViewerView.refreshContentBlock(this.frameEl.item(0), currentDocumentObj);
			this.isPicture() && this.refreshImage();
			this.isNote() && this.refreshNote();
			this.setFrameSize();
		}
		if (this.commentContentEl.item(0)) {
			if (!(this.getCommentTask instanceof Ext.util.DelayedTask)) {
				this.getCommentTask = new Ext.util.DelayedTask(function() {
					this.delayedGetCommentDetails();
				}, this);
			}
			this.getCommentTask.delay(200);
		}
		if (this.isNote()) {
			this.ContentViewerView.updateNoteTextSizeAttr(this._noteEl);
		}

		this.ContentViewerView.showCommentsLoader();
		this.ContentViewerView.updateCommentId(this.overlayCommentCtnEls.item(0), currentDocumentObj.id);
	},

	/**
	 * Refreshes the image in the content if this is a picture viewer
	 */
	refreshImage : function() {
		this.ContentViewerView.changeImageSrcAttribute(
			this.photoEl,
			this._preloadedImageArray[this._currentContentIndex]
		);
		this.photoEl = this.frameEl.item(0).select('img').item(0);
	},

	/**
	 * Refreshes the note text if this is a note viewer
	 */
	refreshNote : function() {
		this._noteEl.select('span').item(0).dom.innerHTML = this._contentArray[this._currentContentIndex];
	},

	/**
	 * Delayed get comment details from model
	 *
	 * @method delayedGetCommentDetails
	 *
	 * @return void;
	 */
	delayedGetCommentDetails : function() {
		var currentDocumentObj = this._albumDetails.containedDocuments[this._currentContentIndex],
			url = Chaos.getUrl(this.getCommentDetailsUrl, { parentId : currentDocumentObj.id, lastItemTimeStamp : 0 });
		this.ContentViewerModel.getCommentDetails(url);
	},

	/**
	 *
	 */
	refreshPhotoId : function(id) {
		this._currentPhotoId = id;
		this.getNavigationUrls();
	},

	/**
	 * Binds the initial event handlers
	 */
	bind : function() {
		ContentViewerController.superclass.bind.call(this);
		this.overlayContainerEl.on('click', this.onJoinButtonClick, this, {
			delegate : '.' + this.joinChannelButtonClass
		});
	},

	/**
	 * Unbinds all event handlers
	 */
	unbind : function() {
		if (this._videoPlayer) {
			this._videoPlayer.remove();
			delete this._videoPlayer;
		}
		ContentViewerController.superclass.unbind.call(this);
		if (this.navigationItems) {
			this.navigationItems.un('click', this.onNavigationClick, this);
		}
		this.bodyEl.un('keydown', this.onKeyPress, this);
	}
});
