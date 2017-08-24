import $ from 'jquery';

const _id = Symbol();
const _el = Symbol();
const _els = Symbol();
const _cls = Symbol();
const _sel = Symbol();
const _parent = Symbol();

export default class Ui {
	get id()  { return this[_id] }
	get el()  { return this[_el] }
	get els() { return this[_els] }
	get cls() { return this[_cls] }
	get sel() { return this[_sel] }
	get jq()  { return $(this.els) }

	constructor(selector, parent = document) {
		this[_sel] = selector;
		this[_parent] = parent;
		this.update();
	}

	update() {
		let sel = this[_sel];

		// Probably it's an ID
		if (
			sel[0] !== '.'
			&& sel[0] !== '#'
		) {
			sel = `#${sel}`;
		}

		this[_els] = Array.from(this[_parent].querySelectorAll(sel)) || null;
		this[_el] = this.els[0] || null;
		this[_id] = this.el ? this.el.id : null;
		this[_cls] = sel.replace('.', '');
	}
}