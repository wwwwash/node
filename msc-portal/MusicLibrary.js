import Ext from '../../../lib/vendor/ExtCore';
import Chaos from '../../../lib/chaos/Chaos';
import Page from '../../../lib/chaos/Page';
import Config from '../../../lib/chaos/Config';
import { Broadcaster } from '../../../lib/chaos/Broadcaster';
import CONST from '../../../lib/constant/Constants';

import Ajax from '../../Ajax/Ajax';

import Form from '../../_Form/Form';
import PositionSticky from '../../PositionSticky/PositionSticky';
import MusicListFilter from '../../ListFilter/Music';
import MusicPlayer from '../../Music/MusicPlayer';

import './MusicLibrary.scss';

/**
 * Standalone Music Library Page
 * ------------------------------
 *
 * @param Object el       the element
 * @param Object config   config object
 */

export default function MusicLibraryIndex(el, config) {
	MusicLibraryIndex.superclass.constructor.call(this, el, config);
}

Chaos.extend(MusicLibraryIndex, Page, {

	/** @var {String} name                      Name of the class */
	name               : 'musiclibraryindex',
	/** @var {String}			 	            Selector of the page buttons */
	pageBtnSel         : '.loadOverlayBtn',
	/** @var {Boolean}			 	            Enable or disable ajax refresh */
	ajaxEnabled        : true,
	/** @var {String}			 	            A login folyamatban szereplo form id-ja */
	_formId            : 'musiclibrary_searchform',
	/** @var {String}				            Backend altal generalt validacios objektum neve */
	_validationObjName : 'validationObj',
	/** @var {String}				            A backend altal generalt hibakodokat es nyelvesitett hibauzeneteket tartalmazo objektum neve */
	_errorObjName      : 'errorObj',

	/**
	 * Standard init function
	 *
	 * @method init
	 * @param {Object} el
	 * @param {Object} config
	 *
	 * @return void
	 */
	init : function(el, config) {
		// Call parent class init
		MusicLibraryIndex.superclass.init.call(this, el, config);

		new PositionSticky(Ext.get('musicListHeaderContainer'), {});

		this.instantiateMusicPlayerComponents();

		this._musicListCtnEl = Ext.get('musicListContainer');

		var _formEl = Ext.get(this._formId);

		if (_formEl) {
			this._form = new Form(
				_formEl,
				{
					validationObj      : Config.get(this._validationObjName),
					errorObj           : Config.get(this._errorObjName) || {},
					needAjaxValidation : false
				}
			);
		}

		if (this._musicListCtnEl) {
			new MusicListFilter(Ext.get('musicListHeaderContainer'), {});
		}
	},

	onPageButtonClick : function(ev, target) {
		var targetEl = Ext.get(target),
			targetUrl;

		if (targetEl.dom.hasAttribute('href') && !targetEl.hasClass('activePageSwitchBox') && this.ajaxEnabled) {
			ev.preventDefault();
			targetUrl = targetEl.dom.getAttribute('href');

			Ajax.request({
				type    	: CONST.TYPE_JSON,
				url    		: targetUrl,
				scope   	: this,
				success 	: this.sendListPageRequestSuccess,
				error   	: this.sendListPageRequestError,
				failure 	: this.sendListPageRequestFailure,
				method  	: CONST.GET,
				synchron : true
			});
		}
	},

	instantiateMusicPlayerComponents : function () {
		// MusicPlayerComponents
		Ext.select('.playdata').each(function() {
			new MusicPlayer(this, {});
		});
	},

	sendListPageRequestSuccess : function (response) {
		var _data = response.json.data,
			dh = Ext.DomHelper;

		if (_data && _data.block) {
			this._listBlockTpl = new Ext.Template(_data.block);
			this._musicListCtnEl.dom.innerHTML = '';
			dh.append(this._musicListCtnEl, this._listBlockTpl);
			this.instantiateMusicPlayerComponents();
		}
	},

	sendListPageRequestError : function (response) {
		/* develblock:start */
		console.log('sendListPageRequestError', response);
		/* develblock:end */
	},

	sendListPageRequestFailure : function (response) {
		/* develblock:start */
		console.log('sendListPageRequestFailure', response);
		/* develblock:end */
	},

	/**
	 * Initial bind method.
	 *
	 * @method bind
	 *
	 * @return void
	 */
	bind : function() {
		MusicLibraryIndex.superclass.bind.call(this);

		Broadcaster.on(MusicListFilter.REINIT_MUSIC_COMPONENTS, this.instantiateMusicPlayerComponents, this);

		this.element.on('click', this.onPageButtonClick, this, {
			scope    : this,
			delegate : this.pageBtnSel
		});
	},

	/**
	 * Initial unbind method.
	 *
	 * @method unbind
	 *
	 * @return void
	 */
	unbind : function() {
		MusicLibraryIndex.superclass.unbind.call(this);

		Broadcaster.un(MusicListFilter.REINIT_MUSIC_COMPONENTS, this.instantiateMusicPlayerComponents, this);

		this.element.un('click', this.onPageButtonClick, this, {
			scope    : this,
			delegate : this.pageBtnSel
		});
	}
});
