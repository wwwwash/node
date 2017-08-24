import Config from '../../lib/chaos/Config';
import Client from 'jaws-client';

const CONFIG = {
	// Url of the socket
	//socketUrl : '10.128.130.9:25555/notifications'
	socketUrl : 'jaws.dditscdn.com/notifications'
};

/**
 * Factory class for the JAWS client
 */
export default class Jaws {

	/**
	 * Getter for the JawsClient instance
	 * @returns {Object} Jaws instance
	 */
	static get Instance() {
		CONFIG.authKey = Config.get('jawsAuthenticationToken');

		if (!Jaws._instance) {
			Jaws._instance = new Client(CONFIG);
			Jaws.bindErrorHandlers();
		}

		return Jaws._instance;
	}

	/**
	 * Returns the event constants
	 * @returns {Object} Object of the available events
	 */
	static get Events() {
		return Client.EVENT;
	}

	/**
	 * Binding jaws error event handlers
	 */
	static bindErrorHandlers() {
		/* develblock:start */
		Jaws.Instance.on(Jaws.Events.MESSAGE.PERFORMER_TO_MEMBER_LIVE, () => console.log('Jaws: MESSAGE - PTOM'));
		Jaws.Instance.on(Jaws.Events.COMMON.AUTH_OK, () => console.log('Jaws: AUTH OK'));
		Jaws.Instance.on(Jaws.Events.COMMON.CONNECT, () => console.log('Jaws: CONNECT'));
		Jaws.Instance.on(Jaws.Events.COMMON.AUTH_FAIL, () => console.log('Jaws: AUTH_FAIL'));
		Jaws.Instance.on(Jaws.Events.COMMON.DISCONNECT, () => console.log('Jaws: DISCONNECT'));
		/* develblock:end */
	}
}