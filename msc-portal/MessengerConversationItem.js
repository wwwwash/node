import riot from 'riot';

riot.tag('messenger-conversation-item',
`<time class="msg-conversation__time" if="{ opts.period }">{ moment.unix(opts.message.date).calendar() }</time>
<div class="ph-relative ph-full-width ph-float-left">
	<div if="{ opts.message.participant_type == 'member' }" class="msg__avatar msg__avatar--smallest">
		<avatar url="{ opts.partner.profileImage }" letter="{ opts.partner.name[0] }"></avatar>
	</div>
	<div class="msg-conversation__bubble { 'msg-conversation__bubble--incoming': opts.message.participant_type == 'member' }" onclick="{ toggle }">
		<raw content="{ opts.message.body }" nl2br="true" entities="true"></raw>
		<div class="msg-conversation__status { 'msg-conversation__status--incoming': opts.message.participant_type == 'member' }">
			<i if="{ opts.message.state == 'error' }" onclick="{ resend }" class="icon-exlamation-circle msg-conversation__status--error"></i>
			<loading if="{ opts.message.state == opts.model.STATE.LOADING }" class="msg-conversation__status--loading" dur="0.8s"></loading>
		</div>
	</div>
	<figure></figure>
</div>
<div class="msg-conversation__details { 'msg-conversation__details--incoming': opts.message.participant_type == 'member'  }">
	<div if="{ opts.message.state == 'error' }" onclick="{ resend }" class="msg-conversation__feedback">
		<span>{ _('Message not sent.') }</span>
		<span if="{ isMobile.any() }">{ _('Tap to here to retry.') }</span>
		<span if="{ !isMobile.any() }">{ _('Click here to retry.') }</span>
	</div>
	<div if="{ showActions }" class="msg-conversation__datetime">
		{ moment.unix(opts.message.date).format(timeFormat) }
	</div>
	<div if="{ showActions && opts.message.state != opts.model.STATE.LOADING }" class="msg-conversation__delete" onclick="{ deleteMessage }">
		<i class="icon-trash"></i> { _('Delete message') }
	</div>
</div>`,

function() {
	// AM/PM only for 'en'
	this.timeFormat = window.lng === 'en' ? 'h:mm a' : 'H:mm';

	/**
	 * Toggles options
	 * @return {void}
	 */
	this.toggle = () => this.update({ showActions : !this.showActions });

	/**
	 * Re-sends a failed message
	 * @return {void}
	 */
	this.resend = () => this.opts.model.create(this.opts.message);

	/**
	 * Prompts and deletes a message
	 * @return {void}
	 */
	this.deleteMessage = () => {
		if (window.confirm(this._('Do you want to delete this message?'))) { // eslint-disable-line
			this.opts.model.delete(this.opts.message);
		}
	};
});
