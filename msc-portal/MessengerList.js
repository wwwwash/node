import riot from 'riot';
import route from 'riot-route';

import PH from '../../lib/constant/Phrame';

import ThreadModel from './ThreadModel';

riot.tag('messenger-list',
`<div class="msg-input msg-list__header">
	<i class="icon-magnifier"></i>
	<input type="text" ref="search" class="ph-form-input msg-input-field" placeholder="{ _('Search member') }" onkeyup="{ keyup }">
	<i if="{ refs.search.value }" class="icon-gallery-close-x" onclick="{ clearSearch }"></i>
</div>
<div class="msg-list__container">
	<loading if="{ model.state == model.STATE.LOADING }" class="msg-list__loading"></loading>
	<scrollable class="msg-scroll">
		<div class="msg-list__empty ph-align-center" if="{ parent.model.data.recommender && !parent.model.data.recommender.threads.length && !parent.model.data.messages.threads.length && parent.refs.search.value }">
			<i class="icon-ban"></i>
			<p>{ _('No results.') }</p>
		</div>

		<section each="{ section, name in parent.model.data }">
			<div class="msg-list__title" if="{ section.threads && section.threads.length }">
				<div class="ph-float-left">
					{ section.title || parent.parent.model.unreadCount } { section.title ? '' : _('unread') }<span>
				</div>
				<div if="{ !section.title }" class="ph-float-right">{ section.all_thread_count } { _('threads') }</div>
				<ph-clear></ph-clear>
			</div>
			<ul>
				<li each="{ data in section.threads }" class="msg-list__item { active: parent.parent.parent.opts.thread == data.id }">
					<messenger-list-item thread-data="{ data }" deletable="{ !parent.section.title }" thread-model="{ parent.parent.parent.model }"></messenger-list-item>
				</li>
			</ul>
		</section>
	</scrollable>
</div>
`,

function(opts) {
	this.model = new ThreadModel();
	let conversationTag;

	// Set new excerpt with new message is added
	// This will need a refact later with proper model methods
	this.on('mount', () => {
		this.tags.scrollable.on('scroll', () => this.trigger('scroll'));
		conversationTag = this.parent.tags['messenger-conversation'];

		conversationTag.on('send', () => {
			let existingThread = this.model.getExistingThread(opts.thread);
			this.model.moveToTop(existingThread);
			conversationTag.trigger('loaded');
		});
		conversationTag.on('loaded', ::this.onConversationUpdated);
	});

	this.onConversationUpdated = () => {
		let existingThread = this.model.getExistingThread(opts.thread);
		if (
			existingThread
			&& conversationTag.model.data.messages
			&& conversationTag.model.data.messages.length
		) {
			let lastMsg = conversationTag.model.data.messages.slice(-1).pop();
			existingThread.date = lastMsg.date;
			existingThread.excerpt = lastMsg.body;
			this.update();
		}
	};

	this.on('updated', () => {
		this.changeNavigationCounter();
	});

	this.changeNavigationCounter = () => {
		document.querySelectorAll('.activeSub .notificationCounter').forEach((el) => {
			el.innerHTML = this.model.unreadCount || '';
		});
	};

	this.model.read().then(() => {
		let threads = this.model.getThreadsBySection('messages');
		if (!this.opts.thread && !PH.onScreen('mobile') && threads.length) {
			this.select(threads[0]);
		}
	});

	this.model.on('update', this.update);

	/**
	 * Clear search field and load back the original thread list
	 * @return {void}
	 */
	this.clearSearch = () => {
		this.refs.search.value = '';
		this.model.read();
	};

	/**
	 * Selects an item and routes us to the correct location.
	 * @param {Object} data Thread data object
	 * @return {void}
	 */
	this.select = data => {
		if (data) {
			data.unread_message_count = 0; // eslint-disable-line
			this.model.activeThread = data.id;
			route(`//${data.id}/${data.partner.id}`);
		}
	};

	/**
	 * Keyup event handler of the search input.
	 * @param {Object} ev Event Object
	 * @return {void}
	 */
	this.keyup = ev => {
		clearTimeout(this.searchTimeout);
		this.searchTimeout = setTimeout(() => this.model.read(ev.target.value), 500);
	};

	/**
	 * Makes the search input focused
	 * @return {void}
	 */
	this.focus = () => this.search.focus();

	this.on('thread-delete', () => {
		let threads = this.model.getThreadsBySection('messages');

		if (!PH.onScreen('mobile') && threads && threads.length) {
			this.select(threads[0]);
		}
	});
});
