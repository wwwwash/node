import Abstract from '../Ajax/SimpleModelAbstract';
const SITE_ID = '2';

export default class Push extends Abstract {
	bind() {
		let w = window;

		if ('StreamyAPI' in w) {
			w.StreamyAPI.subscribeForNotifications(SITE_ID);

			w.addEventListener('onstreamynotificationssubscribeerror', function() {
				// Wut?!
			});

			w.addEventListener('onstreamynotificationssubscribesuccess', e => {
				if (e.detail.alreadySubscribed == 'false' 		// eslint-disable-line
					|| e.detail.alreadySubscribed == false) {	// eslint-disable-line
					let token = e.detail.message;
					let url = Chaos.getUrl('StreamyPushNotification/Subscription', {
						endpointId : token
					});
					this.fetch(url, { method : 'post' });
				}
			});
		}
	}
}