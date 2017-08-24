import riot from 'riot';

riot.tag('form-mixin-select', `
	<i name=closed class="form-mixin-select--closed icon-caret-down" onclick="{ open }"></i>
	<i name=opened class="form-mixin-select--open icon-caret-up" onclick="{ close }"></i>
	<yield></yield>
`,

function() {
	this.on('mount', function () {
		this.parent.input.readonly = !this.opts.editable;
	});

	this.close = function () {
		this.parent.input.blur();
	};

	this.open = function () {
		this.parent.input.focus();
	};
});
