import riot from 'riot';
import $ from 'jquery';

import Chaos from '../../lib/chaos/Chaos';
import PH from '../../lib/constant/Phrame';

riot.tag('form-mixin-captcha',
`<div class="captcha">
	<img alt="Captcha Image" ref="image">
	<a href="#" onclick="{ click }">
		<i class="icon-refresh protip" data-pt-title="{ _('Request new') }"></i>
	</a>
</div>`,

function(opts) {
	// Apply mixin
	this.mixin('form');

	// Construct
	this.on('mount', function () {
		this.refs.image.src = opts.captcha;
		this.captchaIdEl = this.parent.root.querySelector('.captcha-id');
		this.captchaActionEl = this.parent.root.querySelector('.captcha-action');
		this.parent.refs.yieldArea.classList.remove(PH.cls.display.inlineBlock);
		this.parent.refs.yieldArea.classList.add(PH.cls.hide);
	});

	/**
	 * Refresh click handler
	 * @param {Object} e Event object.
	 * @return {void}
	 */
	this.click = function(e) {
		e.preventDefault();

		var url = Chaos.getUrl('Captcha/Get', {
			action    : this.captchaActionEl.value,
			captchaId : this.captchaIdEl.value
		}, {}, '');

		$.get(url, function (data) {
			if (data.isCaptchaNeeded) {
				this.captchaIdEl.value = data.captchaId;
				this.refs.image.src = data.captchaUrl;
				this.parent.setValue(data.captchaText);
				this.parent.update();
			}
			else {
				window.location.reload();
			}
		}.bind(this));
	};
});
