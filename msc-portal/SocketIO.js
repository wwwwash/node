import socket09 from './socket.io.min.0.9.17';
import riot from 'riot';

export default class {
	constructor() {
		riot.observable(this);
	}

	connect(options = {}) {
		this.socket = socket09.connect(this.socketUrl, options);
		for (let eventName in this.events) {
			if (this.events.hasOwnProperty(eventName)) {
				this.socket.on(eventName, this[this.events[eventName]].bind(this));
			}
		}
	}
}
