import Ext from '../../lib/vendor/ExtCore';
import Chaos from '../../lib/chaos/Chaos';
import ChaosObject from '../../lib/chaos/Object';

/**
 * ContentViewerView
 *
 * Service for ContentViewerController
 *
 * Gives back the details of the new block
 * to the overlay
 *
 */

export default function ContentViewerView(el, config) {
	ContentViewerView.superclass.constructor.call(this, el, config);
}

ContentViewerView.EVENT_GOT_NEW_PHOTO_ID = 'got-new-photo-id';

Chaos.extend(ContentViewerView, ChaosObject, {

	/** @var {String}           Each of the comment elements are inside the block with this cls */
	commentBlockCls            : 'comment_block',
	/** @var {String}           Gallery Index container cls */
	folderInfoCls              : 'folder_info',
	/** @var {String}           Photo Title container cls */
	titleCls                   : 'title',
	/** @var {String}           Timestamp cls */
	timestampCls               : 'time_container span',
	/** @var {String}           Photo Cls */
	photoCls                   : 'photo',
	/** @var {String}           It shows the photo position */
	photoPositionCls           : 'photo_position',
	/** @var {String}           Data comment id attribute selector */
	commentIdCtnAttribute      : 'data-comment-id',
	/** @var {String}           Wrapper class of exclusive content*/
	exclusiveContentWrapperCls : 'exclusive_content_wrapper',
	/** @var {String}           Select comment elemets */
	commentElmentsSel          : '.title h3, .comment_wrapper, .replay_form_container',
	/** @var {String}           Select comment loader element */
	commentLoaderSel           : '.loader_container',
	/** @var {String}           Select likes element */
	likeSel                    : '#total_like_number span',

	/** @var {String}           New id arrive with the new content */
	_newPhotoId : undefined,

	/**
	 * Standard init function
	 *
	 * @param {Object} el
	 * @param {Object} config
	 *
	 * @return void
	 */
	init : function(el, config) {
		ContentViewerView.superclass.init.call(this, el, config);
	},

	/**
	 * Refresh photo and its details
	 *
	 * @method refreshContentBlock
	 * @param {Object}  containerEl     Container [Ext.element]
	 * @param {Object}  detailsObj      Details for new content
	 *
	 * @return void;
	 */
	refreshContentBlock : function(containerEl, detailsObj) {
		if (!containerEl) {
			return;
		}

		var titleEl = containerEl.select('.' + this.titleCls).item(0);

		if (detailsObj && detailsObj.caption) {
			titleEl.dom.innerHTML = '<h2>' + detailsObj.caption + '</h2>';
		}
		else if (titleEl) {
			titleEl.dom.innerHTML = '';
		}

		var timeStampEl = containerEl.select('.' + this.timestampCls),
			photoPositionEl = containerEl.select('.' + this.photoPositionCls);
		if (timeStampEl.getCount()) {
			timeStampEl.item(0).dom.innerHTML = detailsObj.created;
		}
		if (photoPositionEl.getCount()) {
			photoPositionEl.item(0).dom.innerHTML = detailsObj.folder_index + 1;
		}
		this.fireEvent(ContentViewerView.EVENT_GOT_NEW_PHOTO_ID, detailsObj.id);
	},

	/**
	 * Changes image src attribute
	 *
	 *  @method changeImageSrcAttribute
	 *  @param {Object} imageElement    [Ext.element] of image
	 *  @param {String} sourceUrl       Url of new image
	 *
	 *  @return this    scope to chain;
	 */
	changeImageSrcAttribute : function(imageElement, sourceUrl) {
		if (imageElement) {
			var newImageObj = Ext.get(sourceUrl);
			newImageObj.insertBefore(imageElement);
			newImageObj.addClass('photo');
			imageElement.remove();
		}
		return this;
	},

	/**
	 * Updates comment id
	 *
	 * @method updateCommentId
	 * @param {String}	commentId	comment id
	 *
	 * @return void;
	 */
	updateCommentId : function(_commentIdEl, commentId) {
		if (_commentIdEl) {
			_commentIdEl.dom.setAttribute(this.commentIdCtnAttribute, commentId);
		}
	},

	/**
	 * Updates the like count caption
	 *
	 * @param {Object} containerEl   Container [Ext.element]
	 * @param {Number} count         Like count
	 *
	 * @return void;
	 */
	updateLikes : function(containerEl, count) {
		if (containerEl) {
			containerEl.select(this.likeSel).item(0).dom.innerHTML = this.translateLikeCount(count);
		}
	},

	/**
	 * Translate like count
	 *
	 * @method translateLikeCount
	 *
	 * @param number
	 * @returns {string} The correct translated like text
	 */
	translateLikeCount : function(number) {
		switch (parseInt(number, 10)) {
			case 0:
				return Chaos.translate('No likes');
			case 1:
				return Chaos.translate('1 like');
			default:
				return Chaos.translate('{likes} likes', { likes : number });
		}
	},

	/**
	 * Show comments loader
	 *
	 * @method showCommentsLoader
	 *
	 * @return void
	 */
	showCommentsLoader : function() {
		Ext.select(this.commentElmentsSel).setStyle('display', 'none');
		Ext.select(this.commentLoaderSel).setStyle('display', 'block');
	},


	/**
	 * Updates the note content text size data attribute on the note DOM element
	 *
	 * @method updateNoteTextSizeAttr
	 *
	 * @return {string}
	 */
	updateNoteTextSizeAttr : function(containerEl) {
		var contentLength = containerEl.dom.textContent.trim().length;
		// Stepping interval between sizes.
		// Example: if size 3 means that the content length is between 50 and 80 chars, then the stepping is 30.
		var stepping = 20;
		// The biggest size.
		var maxSize = 6;
		var contentSize = Math.min(Math.round(contentLength / stepping) + 1, maxSize);

		containerEl.data('fontSize', contentSize);

		return contentSize;
	},

	/**
	 * Binds the initial event handlers
	 */
	bind : function() {
		ContentViewerView.superclass.bind.call(this);
	},

	/**
	 * Unbinds all event handlers
	 */
	unbind : function() {
		ContentViewerView.superclass.unbind.call(this);
	}
});
