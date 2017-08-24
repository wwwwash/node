import Ext from '../../../lib/vendor/ExtCore';
import Chaos from '../../../lib/chaos/Chaos';
import Page from '../../../lib/chaos/Page';
import IsMobile from '../../../lib/chaos/IsMobile';

import PhotoListPreloader from '../../Photo/PhotoListPreloader';
import TouchList from '../../TouchList/TouchList';

export default function MedialistAbstract(el, config) {
	MedialistAbstract.superclass.constructor.call(this, el, config);
}

Chaos.extend(MedialistAbstract, Page, {
	/** @var {String}                           Class that hides an element */
	hideCls              : 'hide',
	/** @var {String}                           Class that shows an element */
	showCls              : 'show',
	/** @var {String}                           Class which prevents pointer events */
	pointerEventsNoneCls : 'pointerEventsNone',
	/** @var {String}                           Class of the wrapper of 'reject-reason-tooltipped' delete button */
	deleteReasonCls      : 'deleteReason',
	/** @var {String}                           Selector of the gallery items which are not 'emptybox'. */
	touchItemSel         : 'ph-col:not(.emptyPictureCol)',

	ui : {
		/** @var {String}                           Selector of the video delete icon */
		deleteButton         : '.imageDelete',
		/** @var {String}                           Selector of the delete cancel button */
		deleteCancelBtn      : '.deleteCancel',
		/** @var {String}                           Selector of the video box */
		imageBox             : '.galleryImage',
		/** @var {String}                           Id of the pageContainer */
		pageContainer        : 'pageContainer',
		/** @var {String}                           Selector of the delete question box */
		questionDelete       : '.questionDelete',
		/** @var {String}                           Selector of the icons on the settingsoverlay*/
		photoIcon            : '.photoIcon',
		/** @var {String}                           Selector of the visibility overlay - actually only the clock icon in Waiting for approval status */
		visibilityOverlay    : '.visibilityOverlay',
		/** @var {String}                           Selector of the status caption (waiting for approval) */
		statusCaption        : '.statusCaption',
		/** @var {String}                            Set as profile picture buttons selector */
		setProfilePicure     : '.imageProfilePicture',
		/** @var {String}                            Set as profile picture buttons selector */
		profileImageBoxInner : '.profileImageBoxInner',
		/** @var {String}                           Selector of the disabled videobuttons */
		disabledBtn          : 'a.disabled',
		/** @var {String}                           Grid row of the gallery */
		galleryRow           : '.galleryRow',
		/** @var {String}                           Container element of the gallery for the TouchListComponent */
		galleryContainer     : '.galleryContainer'
	},

	cmp : {
		photoPreloader : {
			name  : PhotoListPreloader,
			el    : 'ui.pageContainer',
			/* CMP disabled */
			sleep : true,
			/* Selector of the photos we want to preload */
			opts  : { imageBoxSel : '.galleryImage.loading, .profileImageBoxInner' }
		}
	},


	/**
	 * Init
	 *
	 * @param {Element} el      This should be the body tag.
	 * @param {Object} config   Config object of this component
	 */
	init : function(el, config) {
		MedialistAbstract.superclass.init.call(this, el, config);

		new TouchList(this.ui.galleryContainer.el(), {
			rowSel  : this.ui.galleryRow.sel(),
			itemSel : this.touchItemSel
		});
	},

	/**
	 * On delete button click event. Hide icons, show delete question box.
	 *
	 * @var {Object} ev Event Object
	 */
	onDeleteClick : function(ev) {
		ev.preventDefault();

		var target = Ext.get(ev.target),
			imageBoxEl = target.findParent(this.ui.imageBox.sel(), 5, true);

		if (imageBoxEl.select(this.ui.questionDelete.sel()).elements.length > 0) {
			// Show delete confirm overlay
			imageBoxEl.select(this.ui.photoIcon.sel()).addClass(this.hideCls);
			imageBoxEl.select(this.ui.questionDelete.sel()).addClass(this.showCls);
			imageBoxEl.select(this.ui.visibilityOverlay.sel()).addClass(this.hideCls);
			imageBoxEl.select(this.ui.statusCaption.sel()).addClass(this.hideCls);
		}
	},

	/**
	 * On delete cancel button click event. Call onimageBoxOverlayLeave method.
	 *
	 * @var {Object} ev Event Object
	 */
	onDeleteCancelClick : function(ev) {
		ev.preventDefault();
		ev.stopPropagation();

		this.resetimageBoxOverlay(ev);
	},

	/**
	 * On imageBox overlay leave event. Call onimageBoxOverlayLeave method.
	 *
	 * @var {Object} ev Event Object
	 * @var {Object} target Target DOM element
	 */
	onimageBoxOverlayLeave : function(ev, target) {
		// reset overlay
		this.resetimageBoxOverlay(ev);

		var boxEl = Ext.get(target).findParent(this.ui.imageBox.sel(), null, true),
			photoIcons = boxEl.select(this.ui.photoIcon.sel());

		photoIcons.each(function(el) {
			if (IsMobile.any()) {
				el.jq().protipHide();
			}

			el.addClass(this.pointerEventsNoneCls);
		}.bind(this));
	},

	/**
	 * When mouse enters the imagebox element.
	 * Removes pointerEventsNone class, which is a mobile hack.
	 *
	 * @param [Object] ev Event Object
	 * @param {Object} target Target of the event
	 */
	onimageBoxOverlayEnter : function(ev, target) {
		var boxEl = Ext.get(target).findParent(this.ui.imageBox.sel(), null, true),
			photoIcons = boxEl.select(this.ui.photoIcon.sel());

		setTimeout(function() {
			photoIcons.each(function(el) {
				if (IsMobile.any() && el.parent().hasClass(this.deleteReasonCls)) {
					el.jq().protipShow();
				}
				el.removeClass(this.pointerEventsNoneCls);
			}.bind(this));
		}.bind(this), 10);
	},

	/**
	 * Reset the imageBox overlay. Show icons, hide delete question box.
	 *
	 * @var {Object} ev Event Object
	 */
	resetimageBoxOverlay : function(ev) {
		var target = Ext.get(ev.target),
			imageBoxEl = target.findParent(this.ui.imageBox.sel(), null, true);

		if (imageBoxEl.select(this.ui.questionDelete.sel()).elements.length > 0) {
			// Hide confirm dialog
			imageBoxEl.select(this.ui.photoIcon.sel()).removeClass(this.hideCls);
			imageBoxEl.select(this.ui.questionDelete.sel()).removeClass(this.showCls);
			imageBoxEl.select(this.ui.visibilityOverlay.sel()).removeClass(this.hideCls);
			imageBoxEl.select(this.ui.statusCaption.sel()).removeClass(this.hideCls);
		}
	},

	/**
	 * Stop native events on disabled btns
	 *
	 * @param ev Event Object
	 */
	onDisabledClick : function(ev) {
		ev.stopEvent();
		ev.preventDefault();
	},

	/**
	 * Esemenykezelok feliratkozasa
	 */
	bind : function() {
		MedialistAbstract.superclass.bind.call(this);

		this.ui.deleteButton.els().on('click', this.onDeleteClick, this);
		this.ui.deleteCancelBtn.els().on('click', this.onDeleteCancelClick, this);
		this.ui.imageBox.els().on('mouseleave', this.onimageBoxOverlayLeave, this);
		this.ui.imageBox.els().on('mouseenter', this.onimageBoxOverlayEnter, this);
	},

	/**
	 * Esemenykezelok torlese
	 */
	unbind : function() {
		this.autoUnbind();
	}
});
