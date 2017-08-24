import Chaos from '../../lib/chaos/Chaos';
import Cookie from '../../lib/chaos/Cookie';
import ChaosObject from '../../lib/chaos/Object';

export default function CommonWidgetController(el, config) {
	CommonWidgetController.superclass.constructor.call(this, el, config);
}

Chaos.extend(CommonWidgetController, ChaosObject, {

	init : function() {
		this.targetContentEl = this.element.select('.widget-content').item(0);
		this.bind();
	},

	onWidgetClose : function(ev) {
		ev.preventDefault();
		this.element.toggleClass('collapsed', true);
		if (this.targetContentEl.data('cookie') !== '') {
			Cookie.set(this.targetContentEl.data('cookie'), 1, 10000000, '/');
		}
	},

	onWidgetOpen : function(ev) {
		ev.preventDefault();
		this.element.toggleClass('collapsed', false);
		if (this.targetContentEl.data('cookie') !== '') {
			Cookie.set(this.targetContentEl.data('cookie'), 0, 10000000, '/');
		}
	},

	bind : function() {
		this.element.on('click', this.onWidgetClose, this, {
			delegate : '.widget-closer'
		});
		this.element.on('click', this.onWidgetOpen, this, {
			delegate : '.widget-opener'
		});
	},

	unbind : function() {
		this.autoUnbind();
	}
});