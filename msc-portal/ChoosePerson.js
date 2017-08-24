import Ext from '../../../lib/vendor/ExtCore';
import Chaos from '../../../lib/chaos/Chaos';
import Page from '../../../lib/chaos/Page';

import './ChoosePerson.scss';

export default function MigrationChoosePerson(el, config) {
	MigrationChoosePerson.superclass.constructor.call(this, el, config);
}

Chaos.extend(MigrationChoosePerson, Page, {

	/** @var {String}           Selector of the person selector links */
	personLinkSel : '.choosePerson a',

	/** @var {String}           ID of the input element which will contain the selected user id */
	userIdInputId : 'userId',

	/** @var {String}           ID of the hidden form */
	formId : 'choosePerson_form',

	/** @var {String}           Class of the active/selected person box */
	selectedBoxCls : 'selected',

	/** @var {Object}           Collection of the person selector links */
	_personLinkEls : undefined,

	/** @var {Object}           Element of the input element which will contain the selected user id */
	_userIdInputEl : undefined,

	/** @var {Object}           Element of the hidden form */
	_formEl : undefined,

	/**
	 * Init
	 *
	 * @param {Element} el      This should be the body tag.
	 * @param {Object} config   Config object of this component
	 */
	init : function(el, config) {
		this._personLinkEls = this.element.select(this.personLinkSel);
		this._userIdInputEl = Ext.get(this.userIdInputId);
		this._formEl = Ext.get(this.formId);

		MigrationChoosePerson.superclass.init.call(this, el, config);
	},

	/**
	 * Click on person card. Sets _userIdInputEl and submits the form.
	 * @param {EventObject} ev
	 * @param {DomElement} target
	 * @private
	 */
	_onPersonLinkClick : function(ev, target) {
		ev.preventDefault();

		var el = Ext.get(target).findParent('a', null, 3);

		el.parent('li').radioClass(this.selectedBoxCls);

		this._userIdInputEl.dom.value = el.data('userId');

		this._formEl.dom.submit();

		Ext.fly('pageContainer').setStyle('cursor', 'wait');
	},

	/**
	 * Bind event Handlers
	 */
	bind : function() {
		MigrationChoosePerson.superclass.bind.call(this);

		this._personLinkEls.on('click', this._onPersonLinkClick, this);
	},

	/**
	 * Unbind event handlers
	 */
	unbind : function() {
		this.autoUnbind();
	}
});
