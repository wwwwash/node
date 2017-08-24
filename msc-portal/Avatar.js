import riot from 'riot';

const COLORS = {};
const colors = [
	'#849200',
	'#3c1c1b',
	'#db7400',
	'#660000',
	'#004372',
	'#583947',
	'#394158',
	'#510005'
];

riot.tag('avatar',
`<img if="{ opts.url }" riot-src="{ opts.url }">
<span if="{ !opts.url }" riot-style="background-color: { colors[opts.letter.toLowerCase()] }">
	<em>{ opts.letter }</em>
</span>`,

function() {
	this.colors = COLORS;

	if (Object.keys(COLORS).length) {return}

	let pointer = 0;
	let letters = '0123456789abcdefghijklmnopqrstuvwxyz';

	letters.split('').forEach(letter => {
		COLORS[letter] = colors[pointer++];
		pointer = pointer === colors.length ? 0 : pointer;
	});
});
