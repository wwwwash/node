import Ext from '../../../lib/vendor/ExtCore';
import Chaos from '../../../lib/chaos/Chaos';
import Config from '../../../lib/chaos/Config';

import EditorPageAbstract from './EditorPageAbstract';
import ChannelTubePromotion from '../../FanClub/ChannelTubePromotion';

/**
 * Channel Editor's index page
 *
 * @class Index
 * @constructor
 * @extends Chaos.Page
 */
export default function PremiumEditorPageIndex (el, config) {
	PremiumEditorPageIndex.superclass.constructor.call(this, el, config);
}

Chaos.extend(PremiumEditorPageIndex, EditorPageAbstract, {

	/** @var {String} name          Name of the class */
	name : 'premiumEditorPage',

	/** @var {String} pageContainerId    ID of the page container div */
	pageContainerId : 'pageContainer',

	/** @var {String} channelEditorCls   class if a pagecontainer is channel editor */
	channelEditorCls : 'channelEditor',

	_channelTubePromotionComponent : null,

	/**
	 * Init
	 *
	 * @method init
	 * @param {Element} el      Element
	 * @param {Object} config   Configurables
	 *
	 * @return void
	 */
	init : function (el, config) {
		var pageContainerEl = Ext.get(this.pageContainerId);

		Config.set('channelType', EditorPageAbstract.CHANNEL_TYPE_PAYING);

		if (pageContainerEl.hasClass(this.channelEditorCls)) {
			PremiumEditorPageIndex.superclass.init.call(this, el, config);
		}

		this.initTubePromotion();
	},

	initTubePromotion : function() {
		this._channelTubePromotionComponent = new ChannelTubePromotion(this.pageContainerId, {});
	},

	/**
	 * Initial bind method.
	 *
	 * @method bind
	 *
	 * @return void
	 */
	bind : function() {
		PremiumEditorPageIndex.superclass.bind.call(this);
	},

	/**
	 * Initial unbind method.
	 *
	 * @method unbind
	 *
	 * @return void
	 */
	unbind : function() {
		this.autoUnbind();
	}
});