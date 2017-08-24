import Chaos from './Chaos';
import ChaosObject from './Object';
import Page from './Page';
import Application from './Application';

/**
 * Layout handles all the tasks needed to be done before a page could start
 */
export default function Layout(el, config) {
	Layout.superclass.constructor.call(this, el, config);
}

Layout.EVENT_PAGECHANGE = 'pagechange';
Layout.EVENT_BEFORE_PAGELOAD = 'pagechange';

Chaos.extend(Layout, ChaosObject, {
	/** element should be the body tag of the document (document.body) in every case */
	element   : undefined,
	/** @var {String} name      name of the component */
	name      : 'layout',
	/** @var {String} pageCtId page container div ID */
	pageCtId  : 'main_content',
	/** @var {Element} pageCt  Page container div */
	pageCt    : undefined,
	/** @var {Function} pageClass  Page Class */
	pageClass : Page,

	/**
	 * Init
	 *
	 * @param {Element} el      This should be the body tag.
	 * @param {Object} config   config object of this component
	 */
	init : function(el, config) {
		this.addEvents({
			pagechange     : true,
			beforepageload : true
		});

		Application.getInstance().setLayout(this);
		Layout.superclass.init.call(this, el, config);
	},

	/**
	 * Bind function, executed on init, binds all event handlers needed on start
	 *
	 * @return undefined
	 */
	bind : function() {
		Layout.superclass.bind.call(this);
	},

	/**
	 * Unbind function, executed if corresponding element is beeing destroyed
	 *
	 * @return undefined
	 */
	unbind : function() {
		Layout.superclass.unbind.call(this);
	},

	getPage : function() {
		return this.page;
	},

	/**
	 *
	 */
	setPage : function(page) {
		var id = this.element.getAttribute('id');

		if (page instanceof this.pageClass && id != this.id) {
			this.fireEvent(Layout.EVENT_PAGECHANGE, { layout : this, oldPage : this.page, newPage : page });
			this.page = page;
			//ezt debugolni: this.element.set('id', page.id);
			this.page.layout = this;
			this.loadPage();
		}
	},

	/**
	 *
	 */
	loadPage : function() {
		if (this.page instanceof this.pageClass) {
			this.fireEvent(Layout.EVENT_BEFORE_PAGELOAD, { layout : this, oldPage : this.page });
			if (this.page.load instanceof Function) {
				this.page.load();
			}
		}
	}
});
