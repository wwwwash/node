import riot from 'riot';
import $ from 'jquery';

import PH from '../../lib/constant/Phrame';

import './Form.scss';

riot.tag('form-mixin-error',
`<i ref="icon" class="icon-alert protip ph-cursor-pointer" data-pt-title="{ opts.text }" data-pt-trigger="click2"></i>`,

function() {
	// Apply mixins
	this.mixin('form');

	// Init variables
	let C = this.CONST;
	let errorBuffer = [];
	let errorBufferTimeout;

	this.on('mount', function() {
		if (this.parent.opts.error) {
			this.parent.getLast().trigger(C.RIOT_ELEMENT_SHOW_ERROR_EVENT, this.parent.opts.error);
		}
	});

	this.hide = function() {
		this.root.classList.add(PH.cls.hide);
		$(this.refs.icon).protipHide();
	};

	this.show = function(msg) {
		clearTimeout(errorBufferTimeout);

		if (typeof msg !== 'string') {
			errorBuffer = errorBuffer.concat(msg);
		}
		else {
			errorBuffer.push(msg);
		}

		errorBufferTimeout = setTimeout(() => {
			this.root.classList.remove(PH.cls.hide);
			let title = this.form.buildErrorMessage($.unique(errorBuffer)) + '<i class="icon-close protip-close"></i>';
			$(this.refs.icon).protipShow({
				title,
				classes : 'ph-form-tooltip-error-list protip-common-close',
				mixin   : 'css-no-transition',
				width   : 300
			});
			errorBuffer.length = 0;
		});
	};

	this.parent.on(C.RIOT_ELEMENT_SHOW_ERROR_EVENT, this.show.bind(this));
	this.parent.on(C.RIOT_ELEMENT_HIDE_ERROR_EVENT, this.hide.bind(this));
});
