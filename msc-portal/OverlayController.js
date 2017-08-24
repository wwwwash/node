/* eslint-disable complexity */

import Ext from '../../lib/vendor/ExtCore';
import Chaos from '../../lib/chaos/Chaos';
import { Broadcaster } from '../../lib/chaos/Broadcaster';
import CONST from '../../lib/constant/Constants';

import Overlay from './Overlay';
import OverlayControllerAbstract from './OverlayControllerAbstract';
import Form from '../_Form/Form';
import ScrollPane from '../Scroll/ScrollPane';
import RangeSlider from '../RangeSlider/RangeSlider';
import ShowMoreInfo from '../ShowMore/ShowMoreInfo';
import SwitchElements from '../SwitchElements/SwitchElements';
import Copy2ClipboardMC from '../Copy2Clipboard/Copy2ClipboardMC';
import MediaManagerView from '../FanClub/MediaManagerView';

import './FirstLogin/FirstLogin.scss';
import './Payout/Payout.scss';

export default function OverlayController(el, config) {
	OverlayController.superclass.constructor.call(this, el, config);
}

OverlayController.PROMO_VIDEO_TYPE_SELECTED = 'promo-video-type-selected';
OverlayController.PROMO_VIDEO_TYPE_NOT_SELECTED = 'promo-video-type-not-selected';

Chaos.extend(OverlayController, OverlayControllerAbstract, {

	/** @var {Object} _controller   Controller instance if exists */
	_controller : undefined,

	/**
	 * Id alapjan peldanyositjuk a megfelelo js osztalyokat
	 *
	 * @param pageId
	 */
	pageController : function(pageId, clickedButton, response, overlayCmp, closeBtn) {
		switch (pageId) {
			case 'goOnlineNotification':
				overlayCmp.getOverlayContentElement().select('.button').on('click', function() {
					overlayCmp.closePopupEventHandler();
				}, this, { single : true });

				break;
			case 'resetModelPassword':
				this._form = new Form(
					Ext.get('resetModelPassword'),
					{}
				);
				break;
			case 'newModelContent':
				// Box click trigger inside button click
				overlayCmp.getOverlayContentElement().select('.missingData').on('click', function() {
					var url = Ext.get(this).child('a').dom.href;
					overlayCmp.openOverlay(url);
				}, null, { single : true });

				if (Ext.get('slideContent')) {
					this._scroll = new ScrollPane(Ext.get('slideContent'),
						{
							containerId    : 'slideContainer',
							contentId      : 'slideText',
							tpl            : '<div class="scroll-pane"><div class="scrollbar"></div></div>',
							scrollBarClass : 'scrollbar'
						}
					);
				}
				break;
			case 'statisticContent':
				if (Ext.get('periodSlider')) {
					this._rangeSlider = new RangeSlider(Ext.get('periodSlider'), {
						isOverlayRefreshEnabled : true,
						enableIntegratedSave    : false,
						sliderTrackWidth        : 600,
						periodMinWidth          : 30,
						saveUrl                 : Ext.get('periodSelectorContainer').dom.getAttribute('data-url')
					});
				}

				//Stat info ajaxos komponenst
				var container = Ext.get('statisticContent');
				var list = container ? container.select('.tableSummarizeContentCell') : null;

				if (list && list.getCount() > 0) {
					this.displayEl = new ShowMoreInfo(container, {
						list                : list,
						listItemClass       : '.tableSummarizeContentCell',
						requestMethod       : CONST.POST,
						responseType        : CONST.TYPE_JSON,
						iconClassName       : 'icon-angle-down',
						iconToggleClassName : 'icon-angle-up'
					});
				}

				var changeEventHandler = function() {
					var modal = overlayCmp.element.dom;
					var year = modal.querySelector('input[name=periodYear]').value,
						period = modal.querySelector('input[name=period]').value,
						fullPeriod = year + '-' + period,
						newUrl = modal.querySelector('#periodSelectorContainer').getAttribute('data-url').split('?');

					overlayCmp.getOverlay(newUrl[0] + '?period=' + fullPeriod);
				};

				delete Broadcaster.events['statistics-period-change'];
				Broadcaster.on('statistics-period-change', changeEventHandler);
				break;

			case 'personCardsOverlay':
				for (var i = 0; i < Ext.get('personCardsOverlay').select('.addSwitch').elements.length; i++) {
					this.switchEl = new SwitchElements(Ext.get('personCardsOverlay').select('.addSwitch').item(i), {
						switchElementClass : '.switchBtn'
					});
				}
				break;

			case 'sendNewMessage':

				break;

			case 'galleryOverlay':
				this._form = new Form(
					Ext.get('galleryOverlay'),
					{
						_boxSelectorName : 'pictureFrame',
						_boxSelector     : '.pictureFrame'
					}
				);
				break;
			case 'photoTypeSettings':
				this._form = new Form(
					Ext.get('photoTypeSettings'),
					{
						_boxSelectorName : 'photoTypeSelectBox',
						_boxSelector     : '.photoTypeSelectBox'
					}
				);
				break;
			case 'profilePhotoTypeSettings':
				this._form = new Form(
					Ext.get('profilePhotoTypeSettings'),
					{
						_boxSelectorName : 'photoTypeSelectBox',
						_boxSelector     : '.photoTypeSelectBox'
					}
				);
				break;
			case 'profileSelectGallery':
				this._form = new Form(
					Ext.get('profileSelectGallery'), {}
				);
				break;
			case 'visibilitySettings':
				this._form = new Form(
					Ext.get('visibilitySettings'), {}
				);
				break;
			case 'videoSettings':
				this._form = new Form(
					Ext.get('videoSettings'),
					{}
				);
				break;
			case 'deactivateSnapshots':
				this._form = new Form(
					Ext.get('deactivateSnapshots'),
					{}
				);
				break;
			case 'closeModel':
				this._form = new Form(
					Ext.get('closeModel'),
					{}
				);
				break;

			case 'savePayoutPayPalContent':
				this._form = new Form(
					Ext.get('savePayoutPayPalContent'),
					{}
				);
				break;

			case 'savePayoutPaxumContent':
				this._form = new Form(
					Ext.get('savePayoutPaxumContent'),
					{}
				);
				break;

			case 'savePayoutEpayserviceContent':
				this._form = new Form(
					Ext.get('savePayoutEpayserviceContent'),
					{}
				);
				break;

			case 'savePayoutPayoneerContent':
				this._form = new Form(
					Ext.get('savePayoutPayoneerContent'),
					{}
				);
				break;

			case 'savePayoutChexxContent':
				this._form = new Form(
					Ext.get('savePayoutChexxContent'),
					{}
				);

				var initValue = this._form.advancedSelectComponents['country-component'].getActualValue();
				// In the Payout options, in the Wire Transfer option
				this._form.updateChexxFormFieldsVisibility(initValue);

				break;
			case 'savePayoutChexxBankContent':
				this._form = new Form(
					Ext.get('savePayoutChexxBankContent'),
					{}
				);
				break;
			case 'savePayoutChexxPaperContent':
				this._form = new Form(
					Ext.get('savePayoutChexxPaperContent'),
					{}
				);
				break;

			case 'newStudioContent':
				new Copy2ClipboardMC(Ext.get('copy_button_wrapper'), {
					textSourceEl : Ext.get('registrationLinkUrl')
				});
				break;

			case 'payoutOptionChange':
				this._form = new Form(
					Ext.get('payoutOptionChange'),
					{}
				);
				break;
			case 'channelDeleteConfirmOverlay':
				// Clicked button is now the media element in the channel, which we clicked.
				// I create an event handler for the overlay OK button to call delete for this media item.
				if (clickedButton) {
					Ext.fly('channelDeleteOverlayOkBtn').on('click', function(ev) {
						ev.preventDefault();
						Broadcaster.fireEvent(
							MediaManagerView.EVENT_MEDIA_DELETE_OVERLAY_CONFIRMED,
							{ target : clickedButton }
						);
					}, this);
				}
				/* develblock:start */
				else {
					console.error('Error with the clickedButton variable');
				}
				/* develblock:end */
				break;
			case 'channelSubscriberListOverlay':
				new ScrollPane(Ext.get('channelSubscriberListScroll'),
					{
						containerId      : 'channelSubscriberListScroll',
						contentId        : 'channelSubscriberListScrollContent',
						tpl       			    : '<div class="scroll-pane"><div class="scrollbar"></div></div>',
						scrollBarClass   : 'scrollbar',
						minContentHeight : 600
					}
				);
				break;
			case 'promoVideoDetailsOverlay':
				overlayCmp.on(Overlay.CLOSE_OVERLAY, function() {
					var url = Chaos.getUrl('PromoVideo/MarkAsPromoOverlay');
					overlayCmp.openOverlay(url, { targetEl : '' });
				}, this, { single : true });
				break;
			case 'markAsPromoVideo':
				closeBtn.on('click', function() {
					Broadcaster.fireEvent(OverlayController.PROMO_VIDEO_TYPE_NOT_SELECTED);
					overlayCmp.closePopupEventHandler();
				});
				overlayCmp.getOverlayContentElement().select('.js_promoted').on('click', function() {
					Broadcaster.fireEvent(OverlayController.PROMO_VIDEO_TYPE_SELECTED);
					overlayCmp.closePopupEventHandler();
				});
				overlayCmp.getOverlayContentElement().select('.js_premium').on('click', function() {
					Broadcaster.fireEvent(OverlayController.PROMO_VIDEO_TYPE_NOT_SELECTED);
					overlayCmp.closePopupEventHandler();
				});
				break;
			default:
				/* develblock:start */
				console.log('No Simple OverlayController found for: ' + pageId);
				/* develblock:end */
				break;
		}

		OverlayController.superclass.pageController.call(this, pageId, clickedButton, response, overlayCmp, closeBtn);
		return Promise.resolve();
	}

});
