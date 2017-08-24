/**
 * Class for handling NewWindow elements to be positioned right
 */

export default class NewWindow {

	/* @var  number             NewWindowWidth        Width of the NewWindow element */
	_newWindowWidth = 1200;

	/* @var  number             NewWindowHeight       Height of the NewWindow element */
	_newWindowHeight = 768;

	/* @var  string             _newWindowClass       Class of the NewWindow element */
	_newWindowClass = 'newWindow';

	constructor() {
		for (let link of document.querySelectorAll('a')) {
			if (link.target === '_blank' && !link.classList.contains('noPopup')) {
				link.classList.add(this._newWindowClass);
			}
		}
		this.bind();
	}

	/**
	 * Controlling the event on mouseclick
	 *
	 * @param ev		event object
	 * @param target	target element
	 */
	onClick(ev) {
		if (ev.target && ev.target.classList.contains(this._newWindowClass)) {
			ev.preventDefault();
			ev.stopPropagation();
			window.open(
				ev.target.href,
				'_blank',
				`width=${this._newWindowWidth} 
				height=${this._newWindowHeight},
				scrollbars=1,
				resizable=1,
				status=1,
				titlebar=1,
				menubar=1`
			);
		}
	}

	bind() {
		document.addEventListener('click', ::this.onClick);
	}
}
