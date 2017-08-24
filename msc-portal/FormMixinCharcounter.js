import riot from 'riot';

import Util from '../../lib/chaos/Util';

riot.tag('form-mixin-charcounter', `
	<span class="charCounter">
		{ _('[span][/span] characters left') }
	</span>
`,

	function() {
		// Apply mixin
		this.mixin('form');

		// Construct
		this.on('mount', function () {
			Util.characterCounter(this.parent.input, '.charCounter', 'globalDataObj');
			this.parent.on('focus', this.onFocus.bind(this));
			this.parent.on('blur', this.onBlur.bind(this));
			this.parent.input.classList.add('need-bottom-space');
		});

		// On parent input focus
		this.onFocus = function() {
			this.root.classList.add('show');
		};

		// On parent input blur
		this.onBlur = function() {
			this.root.classList.remove('show');
		};
	});
