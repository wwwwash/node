import riot from 'riot';

import Model from './Model';
import './Snss.scss';

riot.tag('snss',
`<yield></yield>
<div if="{ model.state != model.STATE.INITIALIZING }" class="snss-container">
	<div class="snss-label">{ _('Suggestions') }:</div>
	<span if="{ !model.data.length && model.state == model.STATE.LOADED }">
		{ _('No suggestions found!') }
	</span>
	<button each="{ v, k in model.data }" class="button" type="button" size="tiny" scheme="secondary" onmouseup="{ select }">{ v }</button>
	<div class="snss-loaders">
		<button type="button" disabled="{ model.state == model.STATE.LOADING }" class="button protip" size="tiny" scheme="secondary" onclick="{ load }" data-pt-title="{ _('Search again') }" data-pt-gravity="bottom;...">
			<i class="icon-refresh"></i>
		</button>
	</div>
</div>
`,

function() {
	let model = this.model = new Model();

	this.mixin('form');

	this.on('mount', () => {
		this.input = this.form.getInput('screenName');
		this.input.on('screen-name-taken', this.load.bind(this));
		this.input.on('change mount', () => this.screenName = this.input.input.value);
		model.on('update', this.update);
	});

	this.load = () => {
		let categoryId;
		let formData = this.form.getData();

		switch (parseInt(formData.mainCategory, 10)) {
			case 1:
				categoryId = formData.nudeSubCategory;
				break;
			case 2:
				categoryId = formData.hotFlirtSubCategory;
				break;
			case 3:
				categoryId = formData.nonNudeSubCategory;
				break;
			default:
				break;
		}

		model.screenName = this.screenName;
		model.categoryId = categoryId;

		model.read();
	};

	this.select = ev => {
		this.input.setValue(ev.item.v);
		setTimeout(() => {
			this.input.input.focus();
			this.input.input.blur();
		});
	};
});
