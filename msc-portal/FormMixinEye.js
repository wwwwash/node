import riot from 'riot';

import PH from '../../lib/constant/Phrame';

riot.tag('form-mixin-eye', `
	<i class="icon-eye" onmouseover="{mouseover}" onmouseout="{mouseout}" ontouchstart="{touchstart}" ontouchend="{touchend}"></i>
`,

function(opts) {
	this.parent.on('focus', () => this.root.classList.remove(PH.cls.hide));

	this.parent.on('blur', () => this.root.classList.add(PH.cls.hide));

	this.mouseover = () => {
		this.parent.input.type = 'text';
		this.reveal();
	};

	this.mouseout = () => this.conceal();

	this.touchstart = () => this.reveal();

	this.touchend = () => this.conceal();

	this.reveal = () => this.parent.input.type = 'text';

	this.conceal = () => this.parent.input.type = opts.type;
});
