import riot from 'riot';
import $ from 'jquery';

import IsMobile from '../../lib/chaos/IsMobile';

import './Scrollable.scss';

riot.tag('scrollable',
`<div class="nano" ref="nano">
	<div ref="content" class="nano-content overthrow">
		<yield></yield>
	</div>
</div>`,
function(opts) {
	let nano;
	this.max = opts.max || 1000;
	opts.heightOffset = opts.heightOffset || 0;

	this.on('mount', function () {
		nano = $(this.refs.nano);
		/*
		// In case U need debug
		nano = {
			nanoScroller: function(){}
		}
		*/
		this.setHeight();
		nano.nanoScroller(Object.assign({
			preventPageScrolling : true,
			alwaysVisible        : true,
			iOSNativeScrolling   : IsMobile.any()
		}, opts));
		$(this.root).on('scrollend', () => this.trigger('scrollend'));
		$(this.refs.content).on('scroll', () => this.trigger('scroll'));
		window.addEventListener('resize', this.onResize);
	});

	this.on('unmount', () => {
		nano.nanoScroller({
			destroy : true
		});
		window.removeEventListener('resize', this.onResize);
	});

	this.parent.on('updated', () => nano && this.doUpdate());

	this.doUpdate = (options) => {
		this.setHeight();
		nano.nanoScroller(options);
	};

	this.scroll = (dir = 'bottom') => {
		nano.nanoScroller({ scroll : dir });
	};

	this.scrollTop = (val = 0) => {
		nano.nanoScroller({ scrollTop : val });
	};

	this.setHeight = () => {
		let height;
		if (opts.use === 'parent') {
			var parent = this.root.parentNode || this.parent.root;
			height = parent.offsetHeight + parseInt(opts.heightOffset, 10);
		}
		else {
			height = this.refs.content.firstChild.offsetHeight || this.refs.content.firstChild.nextSibling.offsetHeight;
			height += opts.heightOffset;
		}
		this.root.style.height = (height > parseInt(this.max, 10) ? this.max : height) + 'px';
	};

	this.onResize = () => {
		clearTimeout(this.resizeTimeout);
		this.resizeTimeout = setTimeout(() => this.parent.trigger('updated'), 100);
	};
});
