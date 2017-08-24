/* eslint-disable complexity */

import riot from 'riot';

riot.tag('form-selectorbox',
`<div onclick="{ click }" ref="label" for="{ id }" class="unstyle">
	<yield></yield>
</div>`,
function() {
	this.mixin('form');
	this.mixin(this.opts);

	// After DOM is ready
	this.on('mount', function () {
		this.input = this.root.querySelector(`[name="${this.opts.name}"]`)._tag;
		this.input.disableValidation();
		if (this.input) {
			this.id = this.input.getID();
			this.parent.on('selectorbox-all', this.change.bind(this));
			setTimeout(() => this.parent.trigger('selectorbox-all'), 0);
		}
		this.update();
	});

	this.click = function() {
		if (this.disabled) {return true}

		this.input.input.click();
		this.parent.trigger('selectorbox-all');
		return true;
	};

	this.change = function() {
		var selected = this.input.getValue();
		this.root.classList[selected ? 'add' : 'remove']('selected');

		// Enables/disable validation for inside tags
		for (let i in this.tags) {
			if (!this.tags.hasOwnProperty(i)) {
				continue;
			}
			let tags = this.tags[i];

			if (!(tags instanceof Array)) {
				tags = [tags];
			}

			for (let tag of tags) {
				// Skip the radio input of this selectbox
				if (tag.opts.name === this.opts.name) {
					continue;
				}

				if (!selected) {
					if (tag.disableValidation) { // eslint-disable-line
						tag.disableValidation();
					}
					tag.trigger(this.CONST.RIOT_ELEMENT_HIDE_ERROR_EVENT);
				}
				else if (tag.enableValidation) {
					tag.enableValidation();
				}
			}
		}
	};
});
