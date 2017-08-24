import riot from 'riot';

import './ToggleOnOff';

describe('Toggle On/Off Component', () => {
	describe('should render and', () => {
		let host;
		let tag;
		let label;
		let defaultOpts = {};

		beforeEach(() => {
			host = document.createElement('toggle-on-off');
			sandbox.appendChild(host);
			tag = riot.mount(host, defaultOpts)[0];
			tag.debounceTimeout = 10;
			label = tag.root.querySelector('label');
		});

		afterEach(() => tag.unmount());

		it('should be off', () => {
			assert.isFalse(tag.refs.input.checked, 'is on');
		});

		it('should be on after click', () => {
			label.click();
			assert.isTrue(tag.refs.input.checked, 'is off');
		});

		it('should trigger `change` event', (done) => {
			tag.on('change', () => done());
			label.click();
		});

		it('should trigger `change-once` event only once', (done) => {
			tag.on('change-once', () => done());
			label.click();
			label.click();
			label.click();
		});

		it('should trigger `on` event', (done) => {
			tag.on('on', () => done());
			label.click();
		});

		it('should trigger `off` event', (done) => {
			tag.on('off', () => done());
			label.click();
			label.click();

			// Update opts for next test
			defaultOpts.checked = true;
		});

		it('should be `on` by default', () => {
			assert.isTrue(tag.refs.input.checked, 'is off');
		});

		it('should store last state, which should be different after simple click', () => {
			label.click();
			assert.notEqual(tag.input.checked, tag.lastState);
		});

		it('should store last state, after forcing value original state should be preserved', (done) => {
			label.click();
			tag.on('change-once', () => {
				tag.toggle(true);
				assert.isTrue(tag.lastState);
				done();
			});
		});
	});
});