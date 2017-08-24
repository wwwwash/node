import riot from 'riot';

import styles from './ToggleOnOff.scss';

const DEBOUNCE_TIMEOUT = 500;
let uniqueId = 0;

riot.tag('toggle-on-off', `
<div class="${ styles.wrapper }">
	<input ref="input" id="toggle-on-off-{ uniqueId }" type="checkbox" class="${ styles.input }" onchange="{ onChange }" name="{ opts.name }" checked="{ opts.checked }" disabled="{ opts.disabled }">
	<label class="toggle-on-off ${ styles.switch }" for="toggle-on-off-{ uniqueId }">
		<span class="${ styles.title } ${ styles.on }">{ _(opts.textOn) }</span>
		<span class="${ styles.title } ${ styles.off }">{ _(opts.textOff) }</span>
	</label>
</div>
`, function() {
	let onceTimer = -1;
	this.debounceTimeout = DEBOUNCE_TIMEOUT;

	this.styles = styles;
	this.uniqueId = uniqueId++;

	this.on('mount', function() {
		this.lastState = this.refs.input.checked;
	});

	this.onChange = function() {
		let isOn = this.refs.input.checked;

		if (!isOn) {
			this.trigger('off', isOn, this);
		}
		else {
			this.trigger('on', isOn, this);
		}
		this.trigger('change', isOn, this);
		clearTimeout(onceTimer);
		onceTimer = setTimeout(() => {
			if (!this.lastState === isOn) {
				this.lastState = isOn;
				this.trigger('change-once', isOn, this);
			}
		}, this.debounceTimeout);
		return true;
	};

	this.toggle = (isSilent = false) => {
		this.refs.input.checked = this.lastState = !this.refs.input.checked;
		if (!isSilent) {
			this.onChange();
		}
	};
});