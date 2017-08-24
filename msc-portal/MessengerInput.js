/* eslint-disable complexity */

import riot from 'riot';

riot.tag('messenger-input',
`<form class="ph-full-all" onsubmit="{ submit }">
	<ph-row class="ph-vertical-middle unfixed ph-full-height">
		<ph-col class="ph-relative msg-input-field--wrapper">
			<pre class="ph-form-input msg-input-field msg-input-field--autogrow" ref="message" contenteditable="true" onkeypress="{ keypress }" onpaste="{ paste }" onblur="{ blur }"></pre>
			<div class="placeholder" onclick="{ placeholderClick }" placeholder="{ _('Type message here') }"></div>
		</ph-col>
		<ph-col class="msg-input-wrap ph-px-width ph-full-height">
			<button>
				<span>{ _('Send') }</span>
			</button>
		</ph-col>
	</ph-row>
</form>`,

function() {
	// Max length of the messages
	const MAX_LENGTH = 4000;

	// Trigger send event on parent when clicking submit
	this.submit = ev => {
		ev.preventDefault();

		// Tap on btn would lose input focus
		this.refs.message.focus();

		let text = this.getValue().trim();

		if (text) {
			this.parent.trigger('send', text, this.refs.message);
		}
	};

	// Update scrollbar after blur
	this.blur = () => setTimeout(() => this.parent.tags.scrollable.doUpdate(), 400);

	/**
	 * Return the value of the input
	 * @returns {string} Value of input
	 */
	this.getValue = () => this.refs.message.innerText || this.refs.message.textContent;

	/**
	 * Do not let type more chars than MAX_LENGTH
	 * @returns {boolean} valid if length more than MAX_LENGTH
	 */
	this.keypress = () => {
		this.parent.trigger('input');
		return this.getValue().length < MAX_LENGTH;
	};

	/**
	 * Returns the available character count left
	 * @returns {number} Characters left in the field
	 */
	this.getCharsLeft = () => MAX_LENGTH - this.getValue().length;

	/**
	 * Override opsystem's paste function to eliminate formatted text pasting
	 * into the contenteditable. Sounds weird but works with no hassle.
	 * @param {Object} ev Event Object
	 * @return {void}
	 */
	this.paste = ev => {
		ev.preventDefault();

		let text, sel, range, selectPastedContent;

		if (ev.clipboardData) {
			text = (ev.originalEvent || ev).clipboardData.getData('text/plain');
		}
		else if (window.clipboardData) {
			text = window.clipboardData.getData('Text');
		}

		// Maxlength on paste
		text = text.substring(0, this.getCharsLeft());
		text = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

		if (window.getSelection) {
			// IE9 and non-IE
			sel = window.getSelection();
			if (sel.getRangeAt && sel.rangeCount) {
				range = sel.getRangeAt(0);
				range.deleteContents();

				let el = document.createElement('div');
				el.innerHTML = text;
				let frag = document.createDocumentFragment(), node, lastNode;
				while (node = el.firstChild) {
					lastNode = frag.appendChild(node);
				}
				let firstNode = frag.firstChild;
				range.insertNode(frag);

				// Preserve the selection
				if (lastNode) {
					range = range.cloneRange();
					range.setStartAfter(lastNode);
					if (selectPastedContent) {
						range.setStartBefore(firstNode);
					}
					else {
						range.collapse(true);
					}
					sel.removeAllRanges();
					sel.addRange(range);
				}
			}
		}
	};

	this.placeholderClick = () => this.refs.message.focus();

	// When host notifies that the send request took place
	this.parent.on('send', (ev, messageEl) => messageEl.innerHTML = '');
});
