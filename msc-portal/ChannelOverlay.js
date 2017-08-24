import Ext from '../../lib/vendor/ExtCore';
import Chaos from '../../lib/chaos/Chaos';
import ChaosObject from '../../lib/chaos/Object';
import Config from '../../lib/chaos/Config';
import { Broadcaster } from '../../lib/chaos/Broadcaster';

import ChannelOverlayController from './ChannelOverlayController';
import ChannelOverlayModel from './ChannelOverlayModel';
import ContentViewerController from './ContentViewerController';
import ContentViewerView from './ContentViewerView';
import ContentViewerModel from './ContentViewerModel';
import CommentManagerController from './CommentManagerController';
import CommentManagerModel from './CommentManagerModel';
import CommentManagerView from './CommentManagerView';
import MVCOverlay from './MVCOverlay';
import ChannelOverlayView from './ChannelOverlayView';

import './FanClubCommentsOverlay.scss';
import './FanClubSubscriberListOverlay.scss';


/**
 * Overlays of Channel handler component
 */


export default function ChannelOverlay(el, config) {
	ChannelOverlay.superclass.constructor.call(this, el, config);
}

Ext.extend(ChannelOverlay, ChaosObject, {

	/** @var {String}    Routing to get overlay content */
	getOverlayRoute         : 'ChannelCarouselPostDetails/Index',
	/** @var {String}    Routing for video overlay content */
	videoOverlayRoute       : 'ChannelPostDetails/Index',
	/** @var {String}    Class of media box item */
	mediaBoxCls             : 'mediaBox',
	/** @var {String}    Name of document id data attribute */
	documentIdDataAttribute : 'data-id',
	/** @var {String}    Data media type attribute */
	dataMediaTypeAttribute  : 'data-media-type',

	/**
	 * Initializer.
	 * @param {Object}  el       Context element
	 * @param {Object} config   Configurables
	 *
	 * @return  void
	 */
	init : function(el, config) {
		this.getChannelOverlayController();
		ChannelOverlay.superclass.init.call(this, el, config);
	},

	/**
	 * Get the current Comment manager Controller instance
	 *
	 * @method getCommentManagerController
	 * @public
	 *
	 * @return {Object} Controller instance
	 */
	getChannelOverlayController : function() {
		return this._setChannelOverlayController();
	},

	/**
	 * Get the current Comment manager Controller instance
	 *
	 * @method getCommentManagerController
	 * @public
	 *
	 * @return {Object} Controller instance
	 */
	getCommentManagerController : function() {
		return this._setCommentManagerController();
	},

	/**
	 * Get the current content viewer Controller instance
	 *
	 * @method getContentViewerController
	 * @public
	 *
	 * @return {Object} Controller instance
	 */
	getContentViewerController : function() {
		return this._setContentViewerController();
	},

	/**
	 * Sets an instance of a ChannelOverlayController.
	 *
	 * @return {Object} ChannelOverlayController
	 */
	_setChannelOverlayController : function() {
		if (!(this._channelOverlayController instanceof ChannelOverlayController)) {
			this._channelOverlayController = new ChannelOverlayController({
				el    : this.element,
				items : {
					ChannelOverlayModel : {
						component : this._setChannelOverlayModel(),
						listeners : {}
					},
					ChannelOverlayView : {
						component : this._setChannelOverlayView(),
						listeners : {
							'media-item-click' : 'onMediaItemClick'
						}
					}
				}
			});
			this._channelOverlayController.on(
				ChannelOverlayController.EVENT_MEDIA_ITEM_CLICK,
				this.onMediaItemClick,
				this
			);
		}
		return this._channelOverlayController;
	},

	/**
	 * Instantiate the View of Content viewer
	 *
	 * @method _setChannelOverlayView
	 * @private
	 *
	 * @return {Object} view instance
	 */
	_setChannelOverlayView : function() {
		if (!(this._channelOverlayView instanceof ChannelOverlayView)) {
			this._channelOverlayView = new ChannelOverlayView(this.element, {});
		}
		return this._channelOverlayView;
	},

	/**
	 * Instantiate the {Model} of Content viewer Controller
	 *
	 * @method _setChannelOverlayModel
	 * @private
	 *
	 * @return {Object} model instance;
	 */
	_setChannelOverlayModel : function() {
		if (!(this._channelOverlayModel instanceof ChannelOverlayModel)) {
			this._channelOverlayModel = new ChannelOverlayModel(this.element, {});
		}
		return this._channelOverlayModel;
	},

	/**
	 * Instantiate the Controller of content viewer
	 *
	 * @method _setContentViewerController
	 * @private
	 *
	 * @return {Object} controller instance
	 */
	_setContentViewerController : function() {
		if (!(this._contentViewerController instanceof ContentViewerController)) {
			this._contentViewerController = new ContentViewerController({
				items : {
					ContentViewerView : {
						component : this._setContentViewerView(),
						listeners : {
							'got-new-photo-id' : 'refreshPhotoId'
						}
					},
					ContentViewerModel : {
						component : this._setContentViewerModel(),
						listeners : {
							'new-content-details-ready' : 'refreshContent',
							'image-resolve-ready'       : 'preloadImages',
							'turn-on-comments'          : 'onTurnOnComments'
						}
					}
				}
			});
			this._contentViewerController.on({
				'photo-block-replaced' : this.onPhotoBlockReplaced,
				'turn-on-comments'     : this.onTurnOnComments,
				'comment-box-resize'   : this.onCommentBoxResize,
				scope                  : this
			});
		}
		return this._contentViewerController;
	},

	/**
	 * Activate comment block in comment manager controller on comment-box-resize event
	 *
	 * @method onCommentBoxResize
	 */
	onCommentBoxResize : function() {
		this.getCommentManagerController().activateCommentBlock();
	},

	/**
	 * When photo block replaced, and it has some comments
	 * it binds the events on them by CommentManagerController
	 *
	 * @method onPhotoBlockReplaced
	 * @param {Object}  detailsObj  Json data for new content
	 *
	 * @returns void;
	 */
	onPhotoBlockReplaced : function(detailsObj) {
		this.getContentViewerController().standByUntilPictureArrive(detailsObj);
	},

	/**
	 * Instantiate the View of Content viewer
	 *
	 * @method _setContentViewerView
	 * @private
	 *
	 * @return {Object} view instance
	 */
	_setContentViewerView : function() {
		if (!(this._contentViewerView instanceof ContentViewerView)) {
			this._contentViewerView = new ContentViewerView(this.element, {});
		}
		return this._contentViewerView;
	},

	/**
	 * Instantiate the {Model} of Content viewer Controller
	 *
	 * @method _setContentViewerModel
	 * @private
	 *
	 * @return {Object} model instance;
	 */
	_setContentViewerModel : function() {
		if (!(this._contentViewerModel instanceof ContentViewerModel)) {
			this._contentViewerModel = new ContentViewerModel(this.element, {});
		}
		return this._contentViewerModel;
	},

	/**
	 * Instantiate the Controller of Comment Manager
	 *
	 * @method _setCommentManagerView
	 * @private
	 *
	 * @return {Object} controller instance
	 */
	_setCommentManagerController : function() {
		if (!(this._commentManagerController instanceof CommentManagerController)) {
			this._commentManagerController = new CommentManagerController({
				items : {
					CommentManagerView : {
						component : this._setCommentManagerView(),
						listeners : {
							'on-append-content-done'             : 'refreshComments',
							'on-comment-refresh-done'            : 'activateCommentBlock',
							'on-replace-comments-done'           : 'activateCommentPostButtons',
							'on-comment-collapse-animation-done' : 'onCommentAnimationDone',
							'on-comment-remove-slide-left-done'  : 'closeContent',
							'comments-fully-replaced'            : 'activateCommentBlock',
							'on-failed-comment-skin-ready'       : 'bindEventsToFailedComment'
						}
					},
					CommentManagerModel : {
						component : this._setCommentManagerModel(),
						listeners : {
							'comment-remove-done'    : 'animateRemoval',
							'refresh-comment-count'  : 'updateCommentNumbers',
							'on-comments-refresh'    : 'onCommentsRefresh',
							'on-comment-post-failed' : 'onCommentFailed',
							'on-comment-post-ready'  : 'onCommentReady'
						}
					}
				}
			});
			this._commentManagerController.on({
				'on-overlay-content-ready' : this.onOverlayContentReady,
				'input-focus'              : this.onCommentInputFocus,
				'input-blur'               : this.onCommentInputBlur,
				'spam-filter'              : this.onCommentSpamFilter,
				scope                      : this
			});
		}
		return this._commentManagerController;
	},

	/**
	 * Input of comment focused event handler
	 * If the input focused, then disable the navigation arrows
	 *
	 * @method onCommentInputFocus
	 * @public
	 *
	 * @return void
	 */
	onCommentInputFocus : function() {
		this.getContentViewerController().blockNavigationByKeyboard();
	},

	/**
	 * Input of comment blurred event handler
	 * If the input blurred, then enable the navigation arrows
	 *
	 * @method onCommentInputBlur
	 * @public
	 *
	 * @return void
	 */
	onCommentInputBlur : function() {
		this.getContentViewerController().enableNavigationByKeyboard();
	},


	/**
	 * On comment filtered out by spam filter
	 */
	onCommentSpamFilter : function(response) {
		this.getCommentManagerView().showInputTooltip(response.message);
	},

	/**
	 * Returns the View of Comment Manager
	 *
	 * @method getCommentManagerView
	 *
	 * @return {Object} view instance
	 */
	getCommentManagerView : function() {
		return this._setCommentManagerView();
	},

	/**
	 * Instantiate the View of Comment Manager
	 *
	 * @method _setCommentManagerView
	 * @private
	 *
	 * @return {Object} view instance
	 */
	_setCommentManagerView : function() {
		if (!(this._commentManagerView instanceof CommentManagerView)) {
			this._commentManagerView = new CommentManagerView(this.element, {});
		}
		return this._commentManagerView;
	},

	/**
	 * Instantiate the {Model} of Comment Manager Controller
	 *
	 * @method _setCommentManagerModel
	 * @private
	 *
	 * @return {Object} model instance;
	 */
	_setCommentManagerModel : function() {
		if (!(this._commentManagerModel instanceof CommentManagerModel)) {
			this._commentManagerModel = new CommentManagerModel(this.element, {});
		}
		return this._commentManagerModel;
	},

	/**
	 * Overlay content ready
	 *
	 * @method onOverlayContentReady
	 * @param {Object}  paramObj    Image object
	 * @public
	 *
	 * @return void;
	 */
	onOverlayContentReady : function(paramObj) {
		this.getContentViewerController().standByUntilPictureArrive(paramObj);
	},

	/**
	 * Event handler for a ChannelEditorComponent's event when a media item has been clicked.
	 *
	 * @param {Object} ev   ChannelEditorComponent's event object
	 *
	 * @return void;
	 */
	onMediaItemClick : function(ev) {
		var parentMediaBox = ev.ev.itemEl.parent('.' + this.mediaBoxCls).dom;
		var mediaType = parentMediaBox.getAttribute(this.dataMediaTypeAttribute);
		var documentId = parentMediaBox.getAttribute(this.documentIdDataAttribute);
		var overlayRoute = mediaType === 'video' ? this.videoOverlayRoute : this.getOverlayRoute;

		Chaos.fireEvent(MVCOverlay.GLOBALEVENT_OVERLAY_SHOW, {
			url : Chaos.getUrl(
				overlayRoute,
				{ currentDocumentId : documentId },
				{ channelType : Config.get('channelType') }),
			allowOverwrite : true,
			onShowScope    : this,
			onShow         : function(param) {
				this._onChannelOverlayShow(param);
			}
		});
		Config.set('isOverlayOpened', true);
	},

	/**
	 * Overlay onShow callback
	 *
	 * @method _onChannelOverlayShow
	 * @private
	 * @param {Object} param
	 *
	 * @return {Object}
	 */
	_onChannelOverlayShow : function(param) {
		this.getCommentManagerController().commentBlockShowCallback(param);
		this.getCommentManagerController().getDetailsForComments(param);
		this.getContentViewerController().setupCarousel(param);
	},

	/**
	 * When block has comments, it activates events on them
	 *
	 * @method onTurnOnComments
	 * @param {object}  commentsObj     Object with comment details
	 *
	 * @return void;
	 */
	onTurnOnComments : function(commentsObj) {
		this.getCommentManagerController().onCommentSwap(commentsObj);
	},

	/**
	 * Overlay hide Done
	 *
	 * @method onGlobalOverlayHideDone
	 * @public
	 *
	 * @return void;
	 */
	onGlobalOverlayHideDone : function() {
		Config.set('isOverlayOpened', false);
		this.deleteContentViewerController();
		this.deleteContentViewerModel();
		this.deleteContentViewerView();
		this.deleteCommentManagerController();
		this.deleteCommentManagerModel();
		this.deleteCommentManagerView();
	},

	/**
	 * Unbind and deletes the comment manager controller.
	 *
	 * @method deleteCommentManagerController
	 *
	 * @return void
	 */
	deleteCommentManagerController : function() {
		if (this._commentManagerController) {
			this._commentManagerController.unbind();
			delete this._commentManagerController;
		}
	},

	/**
	 * Unbind and deletes the comment manager model.
	 *
	 * @method deleteCommentManagerModel
	 *
	 * @return void
	 */
	deleteCommentManagerModel : function() {
		if (this._commentManagerModel) {
			this._commentManagerModel.unbind();
			delete this._commentManagerModel;
		}
	},

	/**
	 * Unbind and deletes the comment manager view.
	 *
	 * @method deleteCommentManagerView
	 *
	 * @return void
	 */
	deleteCommentManagerView : function() {
		if (this._commentManagerView) {
			this._commentManagerView.hideInputTooltip();
			this._commentManagerView.unbind();
			delete this._commentManagerView;
		}
	},

	/**
	 * Unbind and deletes the content viewer controller.
	 *
	 * @method deleteContentViewerController
	 *
	 * @return void
	 */
	deleteContentViewerController : function() {
		if (this._contentViewerController) {
			this._contentViewerController.unbind();
			delete this._contentViewerController;
		}
	},

	/**
	 * Unbind and deletes the content viewer model.
	 *
	 * @method deleteContentViewerModel
	 *
	 * @return void
	 */
	deleteContentViewerModel : function() {
		if (this._contentViewerModel) {
			this._contentViewerModel.unbind();
			delete this._contentViewerModel;
		}
	},

	/**
	 * Unbind and deletes the content viewer view.
	 *
	 * @method deleteContentViewerView
	 *
	 * @return void
	 */
	deleteContentViewerView : function() {
		if (this._contentViewerView) {
			this._contentViewerView.unbind();
			delete this._contentViewerView;
		}
	},

	/**
	 * Attach initial event handlers.
	 */
	bind : function() {
		ChannelOverlay.superclass.bind.call(this);

		Broadcaster.on(MVCOverlay.GLOBALEVENT_OVERLAY_HIDE_DONE,
			this.onGlobalOverlayHideDone, this);
	},

	/**
	 * Detach initial event handlers.
	 */
	unbind : function() {
		ChannelOverlay.superclass.unbind.call(this);
	}
});