import riot from 'riot';

import ConversationModel from './ConversationModel';
import '../_Loading/Loading';

// Showing the date line in the conversation after this time of inactivity
const ShowPeriodDateAfter = 60 * 60 * 24;

riot.tag('messenger-conversation', `
	<messenger-header if="{ model }" class="msg-header" partner="{ model.data.partner_info }"></messenger-header>
	<scrollable class="msg-scroll" use="parent" scroll="bottom">
		<div if="{ parent.messages && !parent.messages.length }" class="msg-conversation__empty">
			<i class="icon-menu-messages"></i>
			<p>{ _('No messages in this thread yet!') }</p>
		</div>
		<ul class="msg-conversation__list">
			<li class="msg-conversation__row">
				<loading dur="0.8s" class="msg-conversation__loader { parent.model && parent.model.state == parent.model.STATE.LOADING ? 'ph-visible' : 'ph-invisible' }"></loading>
			</li>
			<virtual if="{ parent.messages }">
				<li each="{ message, index in parent.messages }" if="{ message.state != 'deleted' }" class="msg-conversation__row { message.participant_type == 'member' ? 'in' : 'out' }" no-reorder>
					<messenger-conversation-item message="{ message }" partner="{ parent.parent.model.data.partner_info }" model="{ parent.parent.model }" period="{ parent.parent.isPeriodDateNeeded(index) }"></messenger-conversation-item>
				</li>
			</virtual>
		</ul>
	</scrollable>
	<virtual if="{model}">
		<messenger-input if="{ model.state == model.STATE.LOADED || messages }" class="msg-input msg-input--message"></messenger-input>
	</virtual>
`,

function(opts) {
	// With number, it will scroll to that position on update.
	// With false, it will scroll to bottom.
	let lastScrollHeight = false;

	// When host updates (by route) we update the conversation.
	this.parent.on('updated', () => opts.thread && this.load());

	// Update scroll after updated
	let preventScroll = false;
	this.on('updated', () => {
		if (!preventScroll) {
			this.tags.scrollable.refs.content.scrollTop = !lastScrollHeight
					? this.tags.scrollable.refs.content.scrollHeight
					: this.tags.scrollable.refs.content.scrollHeight - lastScrollHeight;
		}
		preventScroll = false;
	});

	/**
	 * Loads model data
	 * @param {boolean} showMore Indicates if this load should be a showMore request
	 * @return {void}
	 */
	this.load = (showMore = false) => {
		if (showMore) {
			lastScrollHeight = this.tags.scrollable.refs.content.scrollHeight;
		}
		else {
			lastScrollHeight = false;
			if (this.model) {
				this.model.off('*');
			}
			this.model = new ConversationModel(opts.thread, opts.partner);
			this.model.on('update', () => this.update({ messages : this.model.data.messages }));
			this.model.on('delete-start', () => preventScroll = true);
			this.model.on('delete-end', () => preventScroll = true);
			this.model.on('incoming', () => lastScrollHeight = false);
		}

		this.model.read(showMore).then(data => {
			if (data.is_last_page) {
				this.unbindInfinite();
			}
			this.trigger('loaded');
		});

		this.unbindInfinite();
		this.bindInfinite();
	};

	/**
	 * Check whether the previous message sent enough time ago to show the 'period date' line
	 * @param {Number} index Index of the conversation list element to be checked
	 * @return {void}
	 */
	this.isPeriodDateNeeded = index => {
		if (!index) {return true}
		let date = this.messages[index].date;
		let prevDate = this.messages[index - 1].date;
		return date - prevDate > ShowPeriodDateAfter;
	};

	/**
	 * On scroll callback
	 * @param {Object} e Event object
	 * @return {void}
	 */
	this.infinite = e => this.model.state !== this.model.STATE.LOADING && e.target.scrollTop < 20 && this.load(true);

	// Bind some events
	this.on('input', () => {
		lastScrollHeight = false;
		this.update();
	});
	this.on('send', msg => {
		lastScrollHeight = false;
		this.model.create(msg);
	});
	this.bindInfinite = () => this.tags.scrollable.refs.content.addEventListener('scroll', this.infinite);
	this.unbindInfinite = () => this.tags.scrollable.refs.content.removeEventListener('scroll', this.infinite);
	window.addEventListener('resize', this.update);
});
