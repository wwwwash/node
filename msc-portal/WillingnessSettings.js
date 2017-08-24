import Ext from '../../../lib/vendor/ExtCore';
import Chaos from '../../../lib/chaos/Chaos';
import Config from '../../../lib/chaos/Config';
import Page from '../../../lib/chaos/Page';

import Form from '../../_Form/Form';

import '../Profile/Profile.scss';

export default function WillingnessSettingsIndex(el, config) {
	WillingnessSettingsIndex.superclass.constructor.call(this, el, config);
}

Chaos.extend(WillingnessSettingsIndex, Page, {

	/* UI elements */
	ui : {
		modelNature : 'modelNature'
	},

	/* Components */
	cmp : {
		form : {
			name : Form,
			el   : 'ui.modelNature'
		}
	},

	/**
	 * Init
	 *
	 * @param {Element} el      This should be the body tag.
	 * @param {Object} config   Config object of this component
	 */
	init : function(el, config) {
		//Eltaroljuk a checkbox elemeket
		this._checkBoxElements = this.element.select('input[type=checkbox]');
		this._checkBoxElementsIcons = this.element.select('span[id*=checkbox-]');

		WillingnessSettingsIndex.superclass.init.call(this, el, config);
	},

	/**
	 * On checkbox element click
	 *
	 * @param {Object} ev      event object
	 * @param {Object} target   target element
	 *
	 * @returns void;
	 */
	onCheckBoxElClick : function(ev, target) {
		ev.preventDefault();

		var targetEl = Ext.get(target);
		if (!targetEl) {
			return;
		}
		this.clickedCheckBoxEl = targetEl;

		if (!this.clickedCheckBoxEl.dom.disabled) {
			this._collectCheckboxes();
		}
	},

	/**
	 * On checkbox icon element click
	 *
	 * @param {Object} ev      event object
	 * @param {Object} target   target element
	 *
	 * @returns void;
	 */
	onCheckBoxElIconClick : function(ev, target) {
		ev.preventDefault();

		var targetEl = Ext.get(target);
		if (!targetEl) {
			return;
		}
		this.clickedCheckBoxEl = targetEl.findParent('div', 2, true).select('input').item(0);
		if (!this.clickedCheckBoxEl.dom.disabled) {
			this._collectCheckboxes();
		}
	},

	/**
	 * Collects arrays with restricted ids
	 *
	 * @param {Object} ev      event object
	 * @param {Object} target   target element
	 *
	 * @returns void;
	 */
	_collectCheckboxes : function() {
		var _collectedArr = this._spliceRestrictedArray(
			Ext.decode(Config.get('willingnessRestrictions')),
			this.clickedCheckBoxEl.id
		);
		if (typeof _collectedArr !== 'undefined') {
			this._switchRestrictedCheckBoxElements(_collectedArr);
		}
	},

	/**
	 * Removes the target id from restricted arrays
	 *
	 * @param {Object} ev      event object
	 * @param {Object} target   target element
	 *
	 * @returns {Array|void}     array with restricted id-s or nothing
	 */
	_spliceRestrictedArray : function (arr, _id) {
		var _exit,
			_arr;
		for (var i = 0; i < arr.length; i++) {
			for (var j = 0; j < arr[i].length; j++) {
				if (arr[i][j] === _id) {
					_exit = true;
					arr[i].splice(j, 1);
					_arr = arr[i];
				}
			}
		}
		if (_exit) {
			return _arr;
		}
	},

	/**
	 * Switches the availability of checkboxes
	 *
	 * @param {Array} arr      array with restricted id-s
	 *
	 * @returns void
	 */
	_switchRestrictedCheckBoxElements : function(arr) {
		for (var i = 0; i < arr.length; i++) {
			var _el = Ext.get(arr[i]);
			if (this._checkBoxIsActive(this.clickedCheckBoxEl)) {
				_el.dom.checked = false;
				_el.next('span').dom.className = '';
				_el.dom.disabled = true;
				_el.next('span').addClass('icon disabled checkbox-disabledInactive');
			}
			else if (!this._checkBoxIsActive(_el)) {
				_el.dom.checked = false;
				_el.dom.removeAttribute('disabled');
				_el.next('span').dom.className = '';
				_el.next('span').addClass('icon checkbox-inactive');
			}
			else {
				this.clickedCheckBoxEl.dom.checked = false;
				this.clickedCheckBoxEl.next('span').dom.className = '';
				this.clickedCheckBoxEl.dom.disabled = true;
				this.clickedCheckBoxEl.next('span').addClass('icon disabled checkbox-disabledInactive');
			}
		}
	},

	/**
	 * Checks the active class of checkboxes
	 *
	 * @param {Object} element      checkbox element
	 *
	 * @returns {Boolean}
	 */
	_checkBoxIsActive : function(element) {
		return element.next('span').hasClass('checkbox-active');
	},

	/**
	 * Esemenykezelok feliratkozasa
	 */
	bind : function() {
		WillingnessSettingsIndex.superclass.bind.call(this);
		this._checkBoxElements.on('change', this.onCheckBoxElClick, this);
		this._checkBoxElementsIcons.on('click', this.onCheckBoxElIconClick, this);
	},

	/**
	 * Esemenykezelok torlese
	 */
	unbind : function() {
		this.autoUnbind();
	}
});
