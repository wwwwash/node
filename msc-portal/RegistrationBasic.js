import Ext from '../../lib/vendor/ExtCore';
import Chaos from '../../lib/chaos/Chaos';
import Portal from './PortalLayout';

import '../Page/Authentication/Authentication.scss';

/**
 * Registrationbasic handles all the tasks needed to be done before a page start
 *
 */
export default function RegistrationBasic(el, config) {
	RegistrationBasic.superclass.constructor.call(this, el, config);
}


Chaos.extend(RegistrationBasic, Portal, {

	/** @var {String}      Id of the carousel container. */
	carouselContainerId : 'performerReviewCarousel',

	/** @var {String}      htmlBootingCls  Class on html element , shows that the frontend is still booting. Should be removed when js loaded.*/
	htmlBootingCls : 'booting',

	/**
	 * Init
	 *
	 * @param {Element} el      This should be the body tag.
	 * @param {Object} config   config object of this component
	 */
	init : function(el, config) {
		RegistrationBasic.superclass.init.call(this, el, config);

		this.carouselEl = Ext.get(this.carouselContainerId);

		Ext.select('html').item(0).removeClass(this.htmlBootingCls);
	},
	/**
	 * Bind function, executed on init, binds all event handlers needed on start
	 *
	 * @return undefined
	 */
	bind : function() {
		RegistrationBasic.superclass.bind.call(this);
	},

	/**
	 * Unbind function, executed if corresponding element is beeing destroyed
	 *
	 * @return undefined
	 */
	unbind : function() {
		RegistrationBasic.superclass.unbind.call(this);
	}
});
