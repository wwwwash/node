import riot from 'riot';

riot.tag('form-mixin-ok', '<i class="icon-ok"></i>', function() {
	this.parent.on('mount', function () {
		if (!this.parent.opts.error && this.parent.form.hasValidationObject()) {
			if (this.parent.opts.type !== 'checkbox' && this.parent.opts.type !== 'radio' && this.parent.opts.value) {
				this.show();
			}
			else if (this.parent.checked) {
				this.show();
			}
		}
	}.bind(this));

	this.show = function () {
		this.root.classList.remove('ph-hide');
	};

	this.hide = function () {
		this.root.classList.add('ph-hide');
	};

	this.parent.on('mixin-show-ok', this.show.bind(this));
	this.parent.on('hide-highlite', this.show.bind(this));
	this.parent.on('mixin-hide-ok', this.hide.bind(this));
	this.parent.on('show-highlite', this.hide.bind(this));
});
