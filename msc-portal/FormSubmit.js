import riot from 'riot';

riot.tag('form-submit',
`<div>
	<button type="submit" ref="button" class="button" onclick="{ click }" size="{ opts.size || 'normal' }" scheme="{ scheme }">
		<yield></yield>
	</button>
	<i if="{ info }" class="icon-info-circle icon-info-circle--common protip" data-pt-title="{ info }"></i>
	<input if="{ opts.name !== undefined && clicked }" type="hidden" name="{ opts.name }" value="{ opts.value }">
</div>`,

function() {
	this.mixin('form');
	var C = this.CONST;

	this.on('mount', function() {
		if (typeof this.opts.disabled !== 'undefined') {
			this.disable();
		}
		this.button = this.refs.button;
	});

	// Event handlers
	this.click = function(ev) {
		ev.preventDefault();
		this.clicked = true;
		this.update();
		this.form.trigger('submit');
		this.disable();
	};

	this.enable = function() {
		this.clicked = false;
		this.button.removeAttribute('disabled');
	};

	this.disable = function() {
		this.button.setAttribute('disabled', '');
	};

	this.form.on(C.FORM_SUBMIT_ENABLE_EVENT, this.enable.bind(this));
	this.form.on(C.FORM_SUBMIT_DISABLE_EVENT, this.disable.bind(this));
});
