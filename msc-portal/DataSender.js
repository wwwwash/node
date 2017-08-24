/* eslint-disable complexity */
/* eslint-disable max-depth */

import Ext from '../../lib/vendor/ExtCore';
import Chaos from '../../lib/chaos/Chaos';
import ChaosObject from '../../lib/chaos/Object';
import { Broadcaster } from '../../lib/chaos/Broadcaster';
import CONST from '../../lib/constant/Constants';

import OverlayComponent from '../Overlay/Overlay';
import ProgressIndicator from '../ProgressIndicator/ProgressIndicator';
import GlobalProgressIndicator from '../ProgressIndicator/GlobalProgressIndicator';
import Ajax from '../Ajax/Ajax';

/**
 *
 * DataSender : used to transfer data on overlays
 *
 */
export default function DataSender(el, config) {
	DataSender.superclass.constructor.call(this, el, config);
}

Chaos.extend(DataSender, ChaosObject, {

	submitBtnEl : undefined,

	loadParams	: undefined,

	params : undefined,

	postUrl	: undefined,

	evalValue	: undefined,

	callbackFn	: undefined,

	errorCallbackFn : undefined,

	callbackScope : undefined,

	overlayComponent	: undefined,

	preventHideOverlay : true,

	synchron : true,

	/** @var {Object}     If a loaderContainerEl, we dont use global progress indicator while the ajax request, but local in it. */
	loaderContainerEl : undefined,

	/**
	 * Init
	 *
	 * @param {Element} el      This should be the body tag.
	 * @param {Object} config   Config object of this component
	 */
	init : function(el, config) {
		this._inputElements = this.element.select('input[type=text], input[type=password]');

		DataSender.superclass.init.call(this, el, config);
	},

	/**
	 * A Form.js-bol jovo form submit globalis esemenyre akaszkodo esemenykezelo
	 *
	 * @param {Object} options event es scope
	 */
	onFormSubmit : function (options) {
		var ev = options.ev,
			target = ev ? ev.target : undefined,
			scope = options.scope,
			delay = scope && scope.setDelay;

		if (ev) {
			ev.preventDefault();
			ev.stopPropagation();
		}

		if (this.overlayComponent) {
			this.overlayComponent._clickedElement = target;
		}

		if (delay) {
			this.sync = true;
			this.showPreloader();

			setTimeout(this.dataSender.bind(this), delay, ev, target);
		}
		else {
			this.dataSender(ev, target);
		}
	},

	/**
	 * collect values from enabled form elements
	 *
	 * @returns Object
	 */
	collectFormData : function() {
		var findElementsToSend = this.element.select('input, select, textarea'),
			dataObj = {};


		for (var i = 0; i < findElementsToSend.getCount(); i++) {
			if (findElementsToSend.item(i).hasClass('disabled')) {
				continue;
			}

			switch (findElementsToSend.item(i).dom.nodeName) {
				case 'SELECT':
					if (findElementsToSend.item(i).select('option[selected]').item(0) !== null) {
						dataObj[findElementsToSend.item(i).dom.name] = findElementsToSend.item(i).select('option[selected]').item(0).dom.value; // eslint-disable-line
					}
					break;

				case 'INPUT':
					switch (findElementsToSend.item(i).dom.type) {
						case 'radio':
						case 'checkbox':
							if (findElementsToSend.item(i).dom.checked) {
								dataObj[findElementsToSend.item(i).dom.name] = findElementsToSend.item(i).dom.value;
							}
							break;
						default:
							dataObj[findElementsToSend.item(i).dom.name] = findElementsToSend.item(i).dom.value;
							break;
					}
					break;

				case 'TEXTAREA':
					dataObj[findElementsToSend.item(i).dom.name] = findElementsToSend.item(i).dom.value;
					break;

				default:
					/* develblock:start */
					console.error('This node type doesn´t used: ', findElementsToSend.item(i).dom.nodeName);
					/* develblock:end */
					break;
			}
		}

		return dataObj;
	},

	/**
	 * popupok altalanos kezeleset teszi lehetove
	 *
	 * @return void
	 */
	dataSender : function(ev) {
		//Ha a submit gomb le van titva, akkor ne kuldje el a hivast
		var el = ev ? Ext.get(ev.target.id) : undefined;
		if (el && el.hasClass('disabled')) {
			return;
		}

		this.save(this.params || this.collectFormData());
	},

	showPreloader : function() {
		var isSync = this.loaderContainerEl ? false : this.sync;

		// If we dont use synchron request, so we want to use a local progress indicator instead of global.
		if (!isSync && this.loaderContainerEl) {
			// Show local preloader
			Broadcaster.fireEvent(ProgressIndicator.GLOBALEVENT_ADD_LOCAL_INDICATOR, {
				element : this.loaderContainerEl
			});
		}
		else if (this.sync) {
			// Show global preloader
			Chaos.fireEvent(GlobalProgressIndicator.GLOBALEVENT_SHOW_INDICATOR);
		}
	},

	/**
	 *
	 * @param params
	 */
	save : function(params) {
		this.showPreloader();

		Ajax.request({
			type             	: CONST.TYPE_JSON,
			url             		: this.postUrl,
			params           	: params,
			scope            	: this,
			success          	: this.ajaxSuccessHandler,
			error            	: this.ajaxErrorHandler,
			failure          	: this.ajaxErrorHandler,
			method           	: CONST.POST,
			preventLoaderHide : this.preventHideOverlay
		});
	},

	ajaxSuccessHandler : function(response) {
		// Remove local progress indicator if we have !
		if (this.loaderContainerEl) {
			Broadcaster.fireEvent(ProgressIndicator.GLOBALEVENT_REMOVE_LOCAL_INDICATOR, {
				element : this.loaderContainerEl
			});
		}
		// If CallbackFn set, we call it.
		if (this.callbackFn) {
			if (!this.callbackScope) {
				/* develblock:start */
				console.error('callbackScope required!');
				/* develblock:end */
			}
			this.callbackFn.call(this.callbackScope, response);
		}

		// Stop if overlayCmp not set
		if (!this.overlayComponent) {
			return;
		}

		// Default success handler for overlays
		response = JSON.parse(response.responseText).data;

		if (response.done) {
			window.location.href = response.redirectUrl;
		}
		else if (response.overlay) {
			/*
			 Ha a valaszban rogton jon az oveerlay tartalom, akkor nem kerdezunk le megegyszer
			 hanem egybol atadjuk a tartalmat megjelenitesre
			 */
			this.overlayComponent.createPopup(response);
		}
		else if (response.length !== 0) {
			// Fire an event about closing the overlay
			this.overlayComponent.fireEvent(OverlayComponent.CLOSE_OVERLAY, this);
			this.overlayComponent.getOverlay(response.forwardUrl);
		}
	},

	ajaxErrorHandler : function(response) {
		/* develblock:start */
		console.log('ajaxErrorHandler', response);
		/* develblock:end */
		// Remove local progress indicator if we have !
		if (this.loaderContainerEl) {
			Broadcaster.fireEvent(ProgressIndicator.GLOBALEVENT_REMOVE_LOCAL_INDICATOR, {
				element : this.loaderContainerEl
			});
		}

		if (this.errorCallbackFn) {
			if (!this.callbackScope) {
				/* develblock:start */
				console.error('callbackScope required!');
				/* develblock:end */
			}
			this.errorCallbackFn.call(this.callbackScope, response);
		}
	},

	/**
	 * 	Toroljuk a globalis esemenyek kozul a form-submit-eket.
	 * 	.un-al ez valami megmagyarazhatatlan okbol nem mukodik.
	 */
	detachFormSubmitEvent : function() {
		var formSubmitEvents = Broadcaster.events['form-submit'];
		if (formSubmitEvents) {
			for (let i in formSubmitEvents.listeners) {
				if (formSubmitEvents.listeners[i].fn === this.onFormSubmit) {
					formSubmitEvents.listeners.splice(i, 1);
				}
			}
		}
	},

	/**
	 * On input keydown, in ie8 we trigger a form send
	 * @param {EventObject} ev
	 */
	onInputKeydown : function (ev) {
		if (ev.keyCode === 13 && Ext.isIE8) {
			ev.preventDefault();
			this.dataSender();
		}
	},

	bind : function() {
		// Globalitas miatt elobb toroljuk az esemenyt.
		this.detachFormSubmitEvent();
		Broadcaster.on('form-submit', this.onFormSubmit, this);

		this._inputElements.on('keydown', this.onInputKeydown, this);

		DataSender.superclass.bind.call(this);
	},

	unbind : function() {
		this.detachFormSubmitEvent();
		Broadcaster.un('form-submit', this.onFormSubmit, this);

		this._inputElements.un('keydown', this.onInputKeydown, this);

		DataSender.superclass.unbind.call(this);
	}
});
