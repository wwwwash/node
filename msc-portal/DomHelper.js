import Ext from '../vendor/ExtCore';

/**
 * ChaosDomHelper is an other reference to Ext.DomHelper. In this file Ext.DomHelper is being exended
 * with some useful methods.
 */
export default ChaosDomHelper = Ext.DomHelper;

Ext.apply(Ext.DomHelper, {
	/**
	 * Disables any selection on this element. No text can be selected
	 *
	 * @
	 */
	disableSelect : function(target) {
		if (typeof target.onselectstart !== 'undefined') {//IE route
			target.onselectstart = function() {
				return false;
			};
		}
		else if (typeof target.style.MozUserSelect !== 'undefined') {
			target.style.MozUserSelect = 'none';
		}
		else {//All other route (ie: Opera)
			target.onmousedown = function() {return false};
			target.style.MozUserSelect = 'none';
		}

		target.style.cursor = 'default';
	},

	enableSelect : function(target) {
		if (typeof target.onselectstart !== 'undefined') {//IE route
			target.onselectstart = null;
		}
		else if (typeof target.style.MozUserSelect !== 'undefined') {
			target.style.MozUserSelect = 'text';
		}
		else {//All other route (ie: Opera)
			target.onmousedown = null;
			target.style.MozUserSelect = 'text';
		}
	}
});