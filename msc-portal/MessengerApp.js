import riot from 'riot';
import route from 'riot-route';

import Chaos from '../../lib/chaos/Chaos';

import './MessengerConversation';
import './MessengerConversationItem';
import './MessengerHeader';
import './MessengerInput';
import './MessengerList';
import './MessengerListItem';
import '../_Avatar/Avatar';
import Push from './Push';

import './Messenger.scss';

riot.tag('messenger-app',
`<ph-row class="ph-full-height">
	<ph-col ph-col-22 ph-col-60-on-mobile class="ph-full-height">
		<messenger-list class="msg-list msg-col msg-col--active" thread="{ thread }" partner="{ partner }"></messenger-list>
	</ph-col>
	<ph-col ph-col-38 ph-col-60-on-mobile class="ph-full-height">
		<div class="msg-col msg-col--full msg-col--conversation { 'msg-col--active': !!thread }">
			<messenger-conversation class="msg-conversation { active: thread }" thread="{ thread }" partner="{ partner }"></messenger-conversation>
		</div>
	</ph-col>
</ph-row>`,

function() {
	// Initialize push notifications
	new Push();

	// Creating base from current location.
	// Removes any domain and hash-tag stuff, trims down last trailing slash.
	let base = Chaos.getUrl('LiveMessenger/Index').replace(/^.*\/\/[^\/]+/, '').split('/');
	base = base.join('/').replace('//', '/');
	route.base(base);

	// Subscribe to every route change.
	// We don't have anything else to listen to.
	route((thread, partner) => this.update({ thread, partner }));

	this.on('mount', () => route.start(true));
});
