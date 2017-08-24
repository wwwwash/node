/* eslint-disable no-use-before-define */

import riot from 'riot';

riot.tag('messenger-list-item',
`<div if="{ data }" class="msg-list__item-layer msg-list__item-layer--top ph-vertical-middle" ref="topLayer" onclick="{ click }" ontouchstart="{ !deletable ? undefined : touchStart }" ontouchmove="{ !deletable ? undefined : touchMove }" ontouchend="{ !deletable ? undefined : touchEnd }" ontouchleave="{ !deletable ? undefined : touchEnd }" ontouchcancel="{ !deletable ? undefined : touchEnd }">
	<div class="msg__avatar">
		<avatar url="{ data.partner.profileImage }" letter="{ data.partner.name[0] }"></avatar>
		<figcaption if="{ data.unread_message_count }" class="msg-list__unread-count">{ data.unread_message_count }</figcaption>
	</div>
	<div class="msg-list__details">
		<div class="msg-list__name { 'msg-list__name--unread': data.unread_message_count }">
			{ data.partner.name }
		</div>
		<div if="{ data.date }" class="msg-list__timeago">
			{ moment.unix(data.date).fromNow() }
		</div>
		<div if="{ data.excerpt }" class="msg-list__excerpt { 'msg-list__excerpt--unread': data.unread_message_count }">
			{ data.excerpt }
		</div>
		<button if="{ deletable }" class="msg-list__delete" onclick="{ deleteThread }">
			<i class="icon-trash"></i>
		</button>
	</div>
</div>
<div ref="bottomLayer" class="msg-list__item-layer msg-list__item-layer--bottom">
	<i ref="trashIcon" class="icon-trash"></i>
</div>`,

function(opts) {
	let threadModel = opts.threadModel;
	let parent = this.parent.parent;
	this.deletable = opts.deletable;
	this.data = opts.threadData;

	/**
	 * Item click handler
	 * @param {Object} ev Event Object
	 * @return {void}
	 */
	this.click = ev => {
		let item = ev.item.data;

		// Is Message
		if (item.id) {
			parent.select(item);
		}
		// Is Recommended
		else {
			threadModel.create(item.partner.id).then(thread => parent.select(thread));
		}
	};

	/**
	 * Touch Start event handler
	 * @param {Object} ev Event object
	 * @returns {boolean} True
	 */
	this.touchStart = ev => {
		ev.preventUpdate = true;
		clearTimeout(this.touchTimeout);
		this.isInvalidated = false;
		this.touchesStart = prepareTouches(ev.touches[0]);
		this.touchValidated = false;
		// Long tap disabled on Streamy in iOS
		if (Ext.isStreamy && Ext.isMac) {
			// Not needed
		}
		else {
			this.touchTimeout = setTimeout(() => this.deleteThread(ev), 500);
		}
		return true;
	};

	/**
	 * Touch Move event handler
	 * @param {Object} ev Event object
	 * @returns {boolean} True
	 */
	this.touchMove = ev => {
		ev.preventUpdate = true;
		clearTimeout(this.touchTimeout);

		if (this.isInvalidated) {
			return true;
		}
		else if (!this.touchValidated) {
			this.touchesMove = prepareTouches(ev.touches[0]);
			if (validateSwipeLeft(this.touchesStart, this.touchesMove)) {
				this.touchValidated = true;
			}
		}
		else if (this.touchValidated) {
			let translate = this.touchesStart.clientX - ev.touches[0].clientX;
			translate = elastic(translate, 90);
			this.refs.topLayer.style.transform = `translateX(-${translate}px)`;
			if (translate > 60) {
				this.triggerDelete = true;
				this.refs.trashIcon.style.transform = 'scale(1)';
				this.refs.bottomLayer.style.opacity = 1;
			}
			else {
				this.triggerDelete = false;
				this.refs.trashIcon.style.transform = `scale(${translate / 100 / 1.2})`;
				this.refs.bottomLayer.style.opacity = translate / 100 / 1.2;
			}
		}
		return true;
	};

	/**
	 * Touch End event handler
	 * @param {Object} ev Event object
	 * @returns {boolean} Is it in progress ?
	 */
	this.touchEnd = ev => {
		ev.preventUpdate = true;
		clearTimeout(this.touchTimeout);

		let returnValue = true;

		if (this.triggerDelete) {
			this.deleteThread();
			returnValue = false;
		}

		this.refs.topLayer.style.transform = 'translateX(0px)';
		this.refs.trashIcon.style.transform = 'scale(0)';
		this.refs.bottomLayer.style.opacity = 0;
		this.triggerDelete = false;

		return returnValue;
	};

	/**
	 * Confirms deletion and executes delete on parent
	 * @param {Object} ev Event Object
	 * @returns {boolean} True if delete triggered
	 */
	this.deleteThread = ev => {
		if (ev) {
			ev.stopPropagation();
			ev.preventDefault();
		}
		if (window.confirm(this._('Do you want to delete this thread and ALL messages in it?'))) { // eslint-disable-line
			threadModel.delete(this.data.id).then(() => parent.trigger('thread-delete'));
			return true;
		}
		return false;
	};

	parent.on('scroll', () => this.isInvalidated = true);
});

/**
 * We only need clientX/Y as an Int
 * @param {Object} touches Touch coordinates
 * @returns {{clientX: Number, clientY: Number}} Prepared coordinates
 */
var prepareTouches = function(touches) {
	return {
		clientX : parseInt(touches.clientX, 10),
		clientY : parseInt(touches.clientY, 10)
	};
};

/**
 * Is this a valid left swipe?
 * @param {Object} touchesStart Touch start pos
 * @param {Object} touchesEnd Touch end pos
 * @returns {boolean} valid or not
 */
var validateSwipeLeft = function(touchesStart, touchesEnd) {
	let threshold = 20;

	return (
		touchesStart.clientX > touchesEnd.clientX &&
		(
			touchesStart.clientY - threshold < touchesEnd.clientY &&
			touchesStart.clientY + threshold > touchesEnd.clientY
		)
	);
};

/**
 * Elastic rubber algorithm.
 * @param {Number} delta Delta
 * @param {Number} maxRubberExtension Max extesnion
 * @returns {number} Elastic alg.
 */
var elastic = function(delta, maxRubberExtension) {
	return Math.atan(delta / maxRubberExtension) / (Math.PI / 2) * maxRubberExtension;
};
