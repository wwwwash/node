import SocketIOModel from './SocketIO';
import Cookies from 'js-cookie';

import Config from '../../lib/chaos/Config';

export default class extends SocketIOModel {
	constructor() {
		super();
		this.events = {
			error          : 'connectError',
			connect_failed : 'connectError', // eslint-disable-line
			connect        : 'onConnect',
			readd          : 'onFMSDisconnect',
			registered     : 'onRegistered',
			duplicate      : 'onDuplicate',
			kick           : 'onKick',
			system         : 'triggerSystemMessage',
			user           : 'triggerUserMessage',
			fms            : 'triggerFMSMessage',
			disconnect     : 'onDisconnect'
		};

		this.config = {
			reconnectCount   : 5,
			reconnectTimeout : 3000,
			isReconnecting   : false,
			isKicked         : false,
			ioConfig         : {
				'connect timeout'      : 5000,
				reconnect              : false,
				'force new connection' : true
			}
		};

		this.currentUser = null;

		this.conversationId = '';
	}

	send(message) {
		let data = {
			message        : message,
			conversationId : this.conversationId
		};

		this.socket.emit('sendLine', data);

		if (typeof Cookies.get('sccId') === undefined) {
			Cookies.set('sccId', this.conversationId, { path : '/', expires : 120 });
		}
	}

	connectToSocket() {
		try {
			if (this.config.reconnectCount > 0) {
				this.config.reconnectCount--;
				this.socketUrl = Config.get('support_chat.socket_io_url');
				this.connect(this.config.ioConfig);
			}
			else {
				this.config.isReconnecting = false;
				this.connectError();
			}
		}
		catch (e) {
			this.connectError();
		}
	}

	connectError() {
		if (this.config.isReconnecting) {
			setTimeout(this.connectToSocket.bind(this), this.config.reconnectTimeout);
		}
		else {
			this.resetTimer();
			this.triggerSystemMessage(Chaos.translate('Support chat connection failed. Please try again later!'));
		}
	}

	onConnect() {
		this.resetTimer();
		this.socket.emit('register', Config.get('support_chat.supportChatConfiguration'));
	}

	onFMSDisconnect() {
		this.conversationId = null;
	}

	onRegistered(conversationId) {
		this.conversationId = conversationId;

        // only members are allowed to continue an already started conversation
		if (typeof Config.get('support_chat.accountType') !== 'undefined') {
			Cookies.set('sccid', this.conversationId, { path : '/', expires : 120 });
		}
	}

	onDuplicate() {
		this.setUserKicked();

		this.triggerSystemMessage(Chaos.translate('It seems that you are already connected to support chat.'));
		this.triggerSystemMessage(Chaos.translate('Connection closed.'));
	}

	onKick() {
		this.setUserKicked();

		window.history.back();
	}

	setUserKicked() {
		this.config.isKicked = true;
		this.config.isReconnecting = false;
		this.socket.disconnect();
	}


	triggerSystemMessage(message) {
        // Manually remove this line as requested, because the backend is used by another app as well
		if (message === 'Connected to the server.') {
			return;
		}

		let data = {
			type    : 'system',
			message : message
		};
		this.trigger('received', data);
	}

	triggerUserMessage(message) {
		let data = {
			type    : 'self',
			nick    : 'You',
			message : message
		};
		this.trigger('received', data);
	}

	triggerFMSMessage(response) {
		window.supportChat.nick = response.nick;

		let data = {
			type    : 'support',
			nick    : response.nick,
			message : response.message
		};
		this.trigger('received', data);
	}

	onDisconnect() {
		if (!this.config.isKicked) {
			this.config.isReconnecting = true;
			setTimeout(::this.connectToSocket(), this.config.reconnectTimeout);
		}
	}

	resetTimer() {
		this.config.reconnectCount = 5;
	}
}
