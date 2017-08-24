import riot from 'riot';

import './Hamburger.scss';

riot.tag('hamburger',
`<label for="{ opts.for }" onclick="{ click }">
	<span></span>
	<span></span>
	<span></span>
</label>`,

function() {
	this.click = () => this.root.classList.toggle('open');
});
