import CONST from '../../lib/constant/Constants';

import Ext from '../../lib/vendor/ExtCore';
import Chaos from '../../lib/chaos/Chaos';
import Connection from '../../lib/chaos/Connection';
import Util from '../../lib/chaos/Util';
import { Broadcaster } from '../../lib/chaos/Broadcaster';

import AdvancedSelect from '../_Form/AdvancedSelect';
import Notification from '../Notification/Notification';

import ChannelProgressBar from './ChannelProgressBar';
import PlaylistEditor from './PlaylistEditor';


export default function ChannelPriceSettings(el, config) {
	AdvancedSelect.superclass.constructor.call(this, el, config);
}

Chaos.extend(ChannelPriceSettings, AdvancedSelect, {

	/** @var {String}            Id of the price settings container */
	priceSettingsCtnId     : 'channelPriceSettings',
	/** @var {String}            Url of the update method */
	priceSettingsUpdateUrl : 'ChannelPriceSettings/Get',
	/** @var {String}            Url of the save method */
	priceSettingsSaveUrl   : 'ChannelPriceSettings/Edit',
	/** @var {String}            Type of the channel */
	channelType            : 'paying',
	/** @var {Boolean}           True if the request came from mwl */
	isMwl                  : false,
	/** @var {Boolean}           Since the prices are constant, we dont need to update the price list and send a new value.
	 *                           If somebody changes his/her mind, you enable it.  */
	isPriceConstant        : true,

	// PRIVATES

	/** @var {String}            Price Settings element */
	_priceSettingsCtnEl : undefined,
	/** @var {String}            Tpl of the whiteloader */
	_whiteLoaderTpl     : `<span class="whiteLoader small protip" data-pt-position="top" data-pt-title="Pending"></span>`,
	/** @var {String}           Type of the notification */
	_notificationType   : '',

	/**
	 * Init
	 *
	 * @param {Element} el      This should be the body tag.
	 * @param {Object} config   Config object of this component
	 */
	init : function(el, config) {
		// Init futtatasa
		ChannelPriceSettings.superclass.init.call(this, el, config);

		this._priceSettingsCtnEl = Ext.get(this.priceSettingsCtnId);
		this._notificationType = this._priceSettingsCtnEl.select('i').item(0).dom.getAttribute('data-notification');

		if (this._notificationType === 'price-saving') {
			Notification.getInstance().showNotification({
				text            : Chaos.translate('You have successfully changed your price.'),
				icon            : 'check-0',
				direction       : 'bottom',
				autoHideEnabled : true,
				closingEnabled  : false,
				hideTimeOut     : 10000
			});
		}
	},

	/**
	 * A parameterben kapott DOM elem (<select>) elemeit felolvassa es egy rendezett listat keszit beloluk
	 * @param   {Ext.Element}  field  A hidden <select> elem referenciaja
	 *
	 * @returns {Array}        Options tomb
	 */
	extractOptions : function(field) {
		this._optionElements = Ext.get(field).select('option');
		var options = [],
			numberOfOptions = this._optionElements.getCount();

		// iterate over the items
		for (var i = 0; i < numberOfOptions; i++) {
			var elem = Ext.get(this._optionElements.elements[i]),
				option = {
					realValue : elem.getValue(),
					cls       : elem.dom.className,
					label     : Util.getText(elem)
				};

			// save selected option
			if (elem.dom.selected) {
				this._selectedOption = elem;
			}

			// if there is no value, don't add it to the list
			if (option.realValue !== '') {
				// prepare the 'matches' string which must be filtered on later
				option.matches = option.label;

				var alternativeSpellings = elem.getAttribute(this.alternativeSpellingsAttr);

				if (alternativeSpellings) {
					option.matches += ' ' + alternativeSpellings;
				}

				// add option to combined array
				options.push(option);
			}
		}

		// return the set of options, each with the following attributes: realValue, label, matches, weight (optional)
		return options;
	},

	/**
	 * Elkesziti a legordulo lista tartalmat es hozzaadja a DOM-hoz
	 * @param elementList
	 */
	constructListElement : function(elementList) {
		//Eltaroljuk a domhelper referenciat
		var dh = Ext.DomHelper,
			listElements = [];

		//Toroljuk a lista tartalmat
		//this._listElement.dom.innerHTML = '';
		this._listElement.update('');
		//Vegigmegyunk a listaelemeket tartalmazo tombbon, es felepitjuk beloluk a megjelenitendo dom elemeket
		//Elkeszitjuk a <li> elemeket az _options objektum tartalma alapjan

		for (var i = 0; i < elementList.length; i++) {
			var classes = elementList[i].cls,
				status = elementList[i].disabled && (elementList[i].disabled === 'disabled' || elementList[i].disabled === true) ? ' disabled' : ' enabled'; // eslint-disable-line

			this._initialDisabledOptions.push(elementList[i].realValue);

			listElements.push(
				{
					tag          : 'li',
					'data-value' : elementList[i].realValue,
					id           : this._listElement.getAttribute('id') + '-element-' + i,
					html         : elementList[i].label
						? elementList[i].label.toString().trim()
						: elementList[i].toString().trim(),
					tabindex : 0,
					count    : i,
					cls      : classes + status
				}
			);
		}
		//Hozza adjuk a DOM-hoz az elemeket
		dh.append(this._listElement, listElements);

		// Lementjuk a placeholder szoveget (pl. Please Choose).
		// Csak elso alkalommal, mikor kap erteket, mert utana eltunik a hideableEmptyOption
		var placeholderTextEl = this._selectElement.select(this.hidableEmptyOptionSel).item(0);
		if (placeholderTextEl) {
			this.placeholderText = Util.getText(placeholderTextEl);
		}

		//Elhelyezzuk az esemenykezeloket a lista elemeken
		this._listElement.select('li')
			.on('keydown', this.onListKeyDownHandler, this)
			.on('click', this.onListItemClickHandler, this);
	},

	/**
	 * Event handler for the select component init or reinit
	 *
	 * @method _onUpdatePrice
	 * @param {Boolean} valueChanged
	 * @private
	 *
	 * @return void;
	 */
	_onUpdatePrice : function(valueChanged) {
		Notification.getInstance()._hideSlide(Notification.getInstance(), 'setBottom');
		if (this._priceSettingsCtnEl) {
			this.enableMask();

			var dh = Ext.DomHelper, _url, paramObj, _method;
			_url = Chaos.getUrl(this.priceSettingsUpdateUrl, {}, {});
			_method = CONST.GET;

			dh.append(this._priceSettingsCtnEl, this._whiteLoaderTpl);

			if (valueChanged) {
				paramObj = {
					price       : this._selectElement.getValue(),
					channelType : this.channelType
				};
				if (this.isMwl) {
					paramObj.isMwl = this.isMwl;
				}
				_url = Chaos.getUrl(this.priceSettingsSaveUrl, {}, paramObj);
				_method = CONST.POST;
			}

			Connection.Ajax.request({
				url     : _url,
				type    : Connection.TYPE_JSON,
				success : this._reinitPriceSettings,
				error   : this._onAjaxError,
				failure : this._onAjaxError,
				scope   : this,
				method  : _method
			});
		}
	},

	/**
	 * Reinit Price Settings component
	 *
	 * @method _reinitPriceSettings
	 * @param {Object} response       Ajax response
	 * @private
	 *
	 * @return void;
	 */
	_reinitPriceSettings : function(response) {
		var _data = response.json.data;

		if (this._priceSettingsCtnEl && _data && _data.content) {
			this._priceSettingsCtnEl.dom.innerHTML = '';

			var newComponent = response.json.data.content,
				template = new Ext.Template(newComponent),
				dh = Ext.DomHelper;

			// Unbinding the event listeners.
			this.unbind();
			delete this._ChannelPriceSettings;

			dh.append(this._priceSettingsCtnEl, template);

			var channelPriceComponentEl = Ext.get('channelPrice-component');

			if (channelPriceComponentEl) {
				this._ChannelPriceSettings = new ChannelPriceSettings(
					channelPriceComponentEl,
					{
						isMwl : this.isMwl
					}
				);
			}
		}
	},

	/**
	 * Ajax Error
	 *
	 * @method _onAjaxError
	 * @param {Object} response       Ajax response
	 * @private
	 *
	 * @return void;
	 */
	_onAjaxError : function(response) {
		this.disableMask();
		if (this._priceSettingsCtnEl.select('.whiteLoader').item(0)) {
			this._priceSettingsCtnEl.select('.whiteLoader').item(0).remove();
		}

		Notification.getInstance().showNotification({
			text            : Chaos.translate('Unexpected error occurred, please try again later.'),
			icon            : 'close',
			direction       : 'bottom',
			autoHideEnabled : true,
			closingEnabled  : false,
			hideTimeOut     : 10000
		});

		this._reinitPriceSettings(response);
	},

	/**
	 * Event handler for the select component when the value was changed
	 *
	 * @method _onValueChanged
	 * @param {Object} ev       event object
	 * @private
	 *
	 * @return void;
	 */
	_onValueChanged : function(ev) {
		if (ev.valueChanged) {
			this._onUpdatePrice(ev.valueChanged);
		}
	},

	/**
	 * Esemenykezelok feliratkozasa
	 */
	bind : function() {
		if (!this.isPriceConstant) {
			Broadcaster.on(ChannelProgressBar.GLOBALEVENT_UPDATE_PROGRESSBAR, this._onUpdatePrice, this);
			Broadcaster.on(PlaylistEditor.EVENT.ON_SAVE_END, this._onUpdatePrice, this);
		}
		this.on('change', this._onValueChanged, this);
		ChannelPriceSettings.superclass.bind.call(this);
	},

	/**
	 * Esemenykezelok torlese
	 */
	unbind : function() {
		if (!this.isPriceConstant) {
			Broadcaster.un(ChannelProgressBar.GLOBALEVENT_UPDATE_PROGRESSBAR, this._onUpdatePrice, this);
			Broadcaster.un(PlaylistEditor.EVENT.ON_SAVE_END, this._onUpdatePrice, this);
		}
		this.un('change', this._onValueChanged, this);
		ChannelPriceSettings.superclass.bind.call(this);
	}
});

