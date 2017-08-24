import Chaos from '../../lib/chaos/Chaos';

import Abstract from '../Ajax/SimpleModelAbstract';
import Jaws from './JawsFactory';

/**
 * Model representing the thread list.
 */
export default class extends Abstract {

	get activeThread() {
		return this._activeThread;
	}

	set activeThread(id) {
		this._activeThread = id;
	}

	/**
	 * Count threads with unread messages.
	 * @returns {number}
	 */
	get unreadCount() {
		let c = 0;
		this.getThreadsBySection('messages').forEach(thread => c += thread.unread_message_count);
		return c;
	}

	/**
	 * Creates a new thread.
	 * @param {Number} partnerId ID of the partner to create the thread with.
	 * @returns {Promise.<TResult>}
	 */
	create(partnerId) {
		let url = Chaos.getUrl('ThreadCreate/Index', { partnerId });

		return this.fetch(url, {
			method : 'post',
			state  : this.state
		}).then(response => {
			let data = response.data;
			let recommended = this.data.recommender.threads;
			let messages = this.data.messages.threads;
			let index = recommended.findIndex(partner => partner.partner.id === partnerId);
			if (index >= 0) {
				recommended.splice(index, 1);
			}
			messages.unshift(data);
			return data;
		});
	}

	/**
	 * Load thread list.
	 * @param {string|undefined} search If provided, we will search for this string.
	 * @returns {Promise.<*>}
	 */
	read(search = undefined) {
		let config = undefined;
		let url = Chaos.getUrl('ThreadList/Index');

		if (search) {
			config = {
				query : {
					partnerLike : search
				}
			};
		}
		return this.fetch(url, config).then(response => this.data = response.data);
	}

	/**
	 * Deletes a full thread
	 * @param id {number} ID of the partner
	 * @returns {Promise.<T>|*}
	 */
	delete(id) {
		let url = Chaos.getUrl('ThreadDelete/Index', { threadId : id });
		return this.fetch(url, { method : 'post' }).then(() => {
			let index = this.getExistingThread(id, true);
			this.getThreadsBySection('messages').splice(index, 1);
		});
	}

	/**
	 * Gets a section by it's name
	 * @param {string} sectionName
	 * @returns {*}
	 */
	getThreadsBySection(sectionName) {
		let section = this.data[sectionName];

		if (!section) {
			return [];
		}

		return section.threads;
	}

	/**
	 * Returns the message or its index in the thread
	 * @param {number} id The threadId we are looking for
	 * @param [bool] returnIndex Should we return index OR the thread message object
	 * @returns {number|object}
	 */
	getExistingThread(id, returnIndex = false) {
		id = parseInt(id, 10);
		let threads = this.getThreadsBySection('messages');
		let index = threads.findIndex(thread => thread.id === id);
		return returnIndex ? index : threads[index];
	}

	/**
	 * Moves thread to the top of the section
	 * @param thread
	 * @param section
	 */
	moveToTop(thread, section = 'messages') {
		if (!thread) {
			return;
		}

		let threads = this.data[section].threads;
		let index = threads.findIndex(partner => partner.partner.id === thread.partner.id);

		// Move to first place
		threads.splice(index, 1);
		threads.unshift(thread);
	}

	/**
	 * Handles live thread update event, when a message comes from Jaws
	 * @param {object} event Jaws event object
	 * @returns void
	 */
	onJawsMessage(event) {
		let newMessage = event.body;
		let existingThread = this.getExistingThread(newMessage.threadId);

		// Create thread
		if (!existingThread) {
			this.create(newMessage.senderId).then(data => {
				let thread = this.getExistingThread(data.id);
				thread.excerpt = newMessage.message;
				thread.date = Date.parse(newMessage.createdAt) / 1000;
				thread.unread_message_count = 1; // eslint-disable-line
			});
		}
		// Modify thread
		else {
			let isUnread = this.activeThread !== newMessage.threadId;

			// Update thread data
			existingThread.excerpt = newMessage.message;
			existingThread.date = Date.parse(newMessage.createdAt) / 1000;
			if (isUnread) {
				existingThread.unread_message_count++;
			}

			this.moveToTop(existingThread);

			this.state = this.state;
		}
	}

	/**
	 * Binding JAWS events
	 * @returns void
	 */
	bind() {
		Jaws.Instance.on(Jaws.Events.MESSAGE.PERFORMER_TO_MEMBER_LIVE, ::this.onJawsMessage);
		Jaws.Instance.on(Jaws.Events.MESSAGE.PERFORMER_MESSAGE_SENT, ::this.onJawsMessage);
	}
}