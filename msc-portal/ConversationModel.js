import Abstract from '../Ajax/SimpleModelAbstract';
import Jaws from './JawsFactory';

/**
 * Model of thread conversation.
 * Controls messages.
 */
export default class extends Abstract {

	constructor(thread, partner) {
		super();
		this.thread = thread;
		this.partner = partner;
	}

	/**
	 * Load messages in thread.
	 * @param [Bool] from Is this a showMore request
	 * @returns {Promise.<TResult>}
	 */
	read(showMore = false) {
		let url = Chaos.getUrl('MessageList/Index', {
			threadId  : this.thread,
			partnerId : this.partner
		});
		let config = {};
		if (showMore) {
			config.query = {
				isOlderThan : true,
				date        : this.data.messages[0].date
			};
		}
		return this.fetch(url, config).then(response => {
			response = response.data;

			// append only if this is a show-more request
			if (showMore) {
				this.data.messages = response.messages.concat(this.data.messages);
			}
			else {
				this.data = response;
			}
			this.data.is_last_page = response.is_last_page; // eslint-disable-line
			return this.data;
		});
	}

	/**
	 * Delete a single message
	 * @param {object} message The message object of the message we would like to delete.
	 * @returns {Promise.<string>}
	 */
	delete(message) {
		this.trigger('delete-start');

		// This was a failed message already
		if (!message.id) {
			message.state = 'deleted';
			return Promise.resolve(message);
		}

		let url = Chaos.getUrl('MessageDelete/Index', {
			threadId  : this.thread,
			messageId : message.id
		});
		message.state = this.STATE.LOADING;
		return this.fetch(url, {
			method : 'post',
			state  : this.state
		})
		// Only set it's state. Else it would confuse the each loop in the view.
		.then(() => {
			message.state = 'deleted';
			this.trigger('delete-end');
		})
		.catch(() => message.state = this.STATE.LOADED);
	}

	/**
	 * Create a new message
	 * @param {object|string} msg The text of the message
	 * @returns {Promise.<boolean>}
	 */
	create(message) {
		if (typeof message !== 'object') {
			// Create initial message object
			message = this.getMessageObj(
				message,
				new Date(),
				this.STATE.LOADING,
				'performer'
			);

			// Add to messages
			this.data.messages.push(message);
		}
		else {
			message.state = this.STATE.LOADING;
		}

		let url = Chaos.getUrl('MessageSend/Index', {
			threadId  : this.thread,
			partnerId : this.partner
		});

		return this.fetch(url, {
			state  : this.state,
			method : 'post',
			body   : {
				body : message.body
			}
		})
		// Remove loading state when done
		.then(response => {
			let data = response.data;
			delete message.state;
			Object.assign(message, data);
		})
		.catch(() => {
			clearTimeout(this.generalErrorTimeout);
			message.state = 'error';
		});
	}

	/**
	 * Handles live conversation update event, when a message comes from Jaws
	 * @param {object} event Jaws event object
	 * @returns void
	 */
	onJawsMessage(event) {
		let newMessage = event.body;

		// If the message does not belong to this thread, throw it.
		if (!newMessage || newMessage.threadId != this.thread) { return } // eslint-disable-line

		// If the message already exists in the model, throw it.
		let existingMessage = this.data.messages.findIndex(message => message.id == newMessage.mailId);  // eslint-disable-line
		if (existingMessage >= 0) { return }

		// Setting the message type regarding who is the sender
		let senderType = newMessage.senderId == this.partner ? 'member' : 'performer'; // eslint-disable-line

		// Create initial message object
		let message = this.getMessageObj(
			newMessage.message,
			newMessage.createdAt,
			this.STATE.LOADED,
			senderType
		);

		// Add to messages
		this.data.messages.push(message);

		this.trigger('incoming');

		this.state = this.state;
	}

	/**
	 * Returns a standard message object, created out of the parameters
	 * @param {string} message Text of the message
	 * @param {string} createdAt Timestamp of the message in createdAt format
	 * @param {string} state State of the message
	 * @param {string} type Participant Type of the message. Member or Performer
	 * @returns {{body: *, date: number, state: *, participant_type: *}}
	 */
	getMessageObj(message, createdAt, state, type) {
		return {
			body             : message,
			date             : Date.parse(createdAt) / 1000,
			state            : state,
			participant_type : type // eslint-disable-line
		};
	}

	/**
	 * Binding JAWS events
	 * @returns void
	 */
	bind() {
		Jaws.Instance.removeListener(Jaws.Events.MESSAGE.PERFORMER_TO_MEMBER_LIVE, ::this.onJawsMessage);
		Jaws.Instance.on(Jaws.Events.MESSAGE.PERFORMER_TO_MEMBER_LIVE, ::this.onJawsMessage);

		Jaws.Instance.removeListener(Jaws.Events.MESSAGE.PERFORMER_MESSAGE_SENT, ::this.onJawsMessage);
		Jaws.Instance.on(Jaws.Events.MESSAGE.PERFORMER_MESSAGE_SENT, ::this.onJawsMessage);
	}
}