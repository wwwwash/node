import riot from 'riot';

import Chaos from '../../lib/chaos/Chaos';
import Config from '../../lib/chaos/Config';
import { Broadcaster } from '../../lib/chaos/Broadcaster';

import SupportChatModel from './SupportChatModel';
import FeatureChecker from './FeatureChecker';

import './SupportChat.scss';

const maxInputLength = 200;
const defaultMessage = {
	message : Chaos.translate('Welcome to the Online Help Center!'),
	type    : 'system'
};

riot.tag('support-chat',
	`<form onsubmit="{ sendMessage }" class="content">
		<div id="support-chat-content" 
			onmouseenter="{ showZooming }"
			onmouseleave="{ hideZooming }">
			<div id="zoom-text" 
				if="{ isZoomVisible }">
				<span onclick="{ ZoomText(true) }">+</span>
				<span onclick="{ ZoomText(false) }">-</span>
			</div>
			<scrollable use="parent" max="320" name="scrollable">
				<ul style="font-size: { parent.font.size }px;">
					<li each="{ parent.messages }" class="{ type }">
					<span>
						<span if="{ nick }">{nick} :</span>
						<raw content="{ message }" entities="{ true }" linkify="{ true }"></raw>	
					</span>
					</li>
				</ul>
			</scrollable>
		</div>
		<div id="support-chat-control">
			<input id="message"
				ref="message"
				type="text" 
				maxlength="${maxInputLength}"
				placeholder="{ _('Start chatting here...') }" 
				autocomplete="off"
				onkeyup="{onKeyUp}"
				onblur="{onBlur}"
				onfocus="{onFocus}"
				autofocus/>
			<button id="send-message" 
				disabled="{buttonDisabled}"
				class="button" 
				>
				 { _('Send') }
			</button>
		</div>
	</form>`,

	'class="ph-form"',

	function () {
		/* Options */
		this.font = {
			size : 10,
			min  : 6,
			max  : 16,
			step : 1
		};

		this.isZoomVisible = false;

		this.messages = [defaultMessage];

		this.on('mount', () => {
			let flashObject = this.root.parentNode.querySelector('object');

			if (!flashObject) {
				this.root.style.display = 'block';
				this.init();
			}
			else {
				let featureChecker = new FeatureChecker();

				featureChecker.getFlashPluginStatus((status) => {
					// If we don't have flash init connection.
					if (status !== FeatureChecker.CONST.Flash.PLUGIN_ENABLED) {
						this.root.style.display = 'block';
						this.init();
					}
					// If we have flash, destroy me and show flash and init flash
					else {
						flashObject.style.display = 'block';
					}
				});
			}
		});

		this.init = () => {
			this.size = '18px';
			this.model = new SupportChatModel();
			// Socket will be initiated by a chaos event comes from the feature checker
			this.initSocket();

			this.model.on('received', data => this.appendMessage(data));
		};

		this.initSocket = () => {
			if (Config.get('support_chat')) {
				this.model.config = Object.assign({}, Config.get('support_chat'), this.model.config);
			}
			this.model.on('received', this.startRatingTimeout);

			this.model.connectToSocket();
		};

		this.startRatingTimeout = (data) => {
			if (data.type === 'support') {
				Broadcaster.fireEvent('support-chat-connected');
				this.model.off('received', this.startRatingTimeout);
			}
		};

		this.on('updated', () => {
			this.tags.scrollable.doUpdate({ scroll : 'bottom' });
		});


		this.onKeyUp = e => {
			this.messageText = e.target.value;

			if (this.messageText) {
				this.buttonDisabled = false;
			}
		};

		this.onFocus = () => {
			this.buttonDisabled = false;
		};

		this.onBlur = () => {
			if (!this.messageText) {
				this.buttonDisabled = true;
			}
		};

		this.appendMessage = data => {
			this.messages.push(data);
			this.update();
		};

		this.sendMessage = e => {
			e.preventDefault();

			if (this.messageText) {
				this.model.send(this.messageText);
				this.messageText = this.refs.message.value = '';
				this.update();
			}
		};

		/* Zooming text messages */
		this.ZoomText = direction => () => {
			let newsize = this.font.size + this.font.step * (direction ? 1 : -1);

			if (newsize >= this.font.min && newsize <= this.font.max) {
				this.font.size = newsize;
			}
		};

		this.showZooming = () => {
			this.isZoomVisible = true;
		};

		this.hideZooming = () => {
			this.isZoomVisible = false;
		};
	});
