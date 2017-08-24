import Ext from '../../../lib/vendor/ExtCore';
import Chaos from '../../../lib/chaos/Chaos';
import Config from '../../../lib/chaos/Config';

import EditorPageAbstract from './EditorPageAbstract';

/**
 * Channel Editor's index page
 *
 * @class Index
 * @constructor
 * @extends Chaos.Page
 */
export default function FreeEditorPageIndex(el, config) {
	FreeEditorPageIndex.superclass.constructor.call(this, el, config);
}

Chaos.extend(FreeEditorPageIndex, EditorPageAbstract, {

	/** @var {String} pageContainerId    ID of the page container div */
	pageContainerId : 'pageContainer',

	/** @var {String} channelEditorCls   class if a pagecontainer is channel editor */
	channelEditorCls : 'channelEditor',

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

		Config.set('channelType', EditorPageAbstract.CHANNEL_TYPE_FREE);

		if (pageContainerEl.hasClass(this.channelEditorCls)) {
			FreeEditorPageIndex.superclass.init.call(this, el, config);
		}
	},

	/**
	 * Initial bind method.
	 *
	 * @method bind
	 *
	 * @return void
	 */
	bind : function() {
		FreeEditorPageIndex.superclass.bind.call(this);
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