import riot from 'riot';

import Config from '../../lib/chaos/Config';
import PH from '../../lib/constant/Phrame';

import controllers from './';

riot.tag('uploader5', '<yield></yield>', function() {
	this.on('mount', function () {
		let config = {
			el       : this.root,
			url      : this.root.getAttribute('data-url'),
			validate : Config.get(this.root.getAttribute('data-validate'))
		};
		let controller = this.root.getAttribute('data-controller');

		if (controller in controllers) {
			new controllers[controller](
                config.el.querySelector(PH.cls.uploader5.main.dot()) || config.el,
                config
            );
		}
		else {
			console.warn(`Uploader controller '${controller}' was not found. Available options: ${Object.keys(controllers).join(', ')}`);
		}
	});
});
