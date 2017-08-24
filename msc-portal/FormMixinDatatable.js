import riot from 'riot';
import $ from 'jquery';

import Util from '../../lib/chaos/Util';
import PH from '../../lib/constant/Phrame';
import isMobile from '../../lib/chaos/IsMobile';

riot.tag('form-mixin-datatable',
`<input type="hidden" ref="input" />
<virtual if="{ parent.input }">
	<select name="fake-{ parent.input.name }-select" onchange="{ selectChange }">
		<option selected hidden></option>
		<option each="{ item, i in data }" value="{ item.value }" data-index="{ i }" selected="{ selected: item.selected }">
			{ formattedOptionTitle(item.title) }
		</option>
	</select>
</virtual>
<div onmousemove="{ prevent }" onmouseleave="{ unprevent }">
	<div ref="json" class="{ PH.cls.hide }"><yield></yield></div>
	<ul>
		<li each="{ item, i in data }" scope="{ this }" class="{ hover: item.selected }">
			<span onmousedown="{ parent.select }" data-value="{ item.value }" data-index="{ i }">{ Util.decodeEntities(item.title) }</span>
		</li>
	</ul>
</div>`,

function() {
	// Apply mixin
	this.mixin('form');

	// Init variables
	this.data = [];
	var IsPrevented = false;
	var JumpCache = '';
	var JumpChacheTimer;

	// Construct
	this.on('mount', function() {
		var value = this.parent.getValue();
		this.data = this.refs.json.innerHTML.replace(new RegExp('\\(\\(\\(', 'g'), '{');
		this.data = this.data.replace(new RegExp('\\)\\)\\)', 'g'), '}');
		this.data = JSON.parse(this.data);
		this.refs.json.parentNode.removeChild(this.refs.json);
		this.parent.root.classList.add('ready');
		this.parent.opts.readonly = true;
		this.root.removeAttribute('tabindex'); // To set default behavior for tabbing through input fields
		this.refs.input.name = this.parent.input.name;
		this.parent.root.removeAttribute('disabled'); // IE of course...
		this.parent.input.name = 'fake-' + this.parent.input.name;
		this.parent.getValue = ::this.getValue;
		if (value) {
			var index = this.getIndexByValue(value);
			if (index + 1) {
				this.setValue(this.getIndexByValue(value));
			}
			else {
				this.parent.input.value = '';
				this.parent.setValue('');
			}
		}
		else if (typeof this.parent.opts.disabled !== 'undefined' || typeof this.parent.opts.hidden !== 'undefined') {
			this.setValue(0);
		}
		this.update();
		this.refs.input.blur();
		this.parent.on('focus', this.open.bind(this));
		this.parent.on('blur', this.close.bind(this));
		this.parent.on('keydown', this.keydown.bind(this));
	});

	/**
	 * Formats a string to a needed Select Option text format.
	 * @param {string} str Option Title
	 * @returns {String} formatted option title
	 */
	this.formattedOptionTitle = function(str) {
		str = Util.decodeEntities(str);
		return str.charAt(0).toUpperCase() + str.slice(1);
	};

	/**
	 * Returns an item index from the this.data object by it's value.
	 * @param {String} value The value of the item.
	 * @returns {Number} Index By Value
	 */
	this.getIndexByValue = function(value) {
		return this.data.findIndex(function(item) {
			// Only 2 = (==) !important
			return item.value == value; // eslint-disable-line
		});
	};

	/**
	 * Returns an item index from the this.data object by it's value.
	 * @param {String} value The value of the item.
	 * @returns {Number} Index of selected
	 */
	this.getIndexBySelected = function() {
		return this.data.findIndex(function(item) {
			return item.selected === true;
		});
	};

	/**
	 * Returns an item from the this.data object by it's value.
	 * @param {String} value The value of the item.
	 * @returns {array} this.data item
	 */
	this.getItemByValue = function(value) {
		return this.data.filter(function(item) {
			return item.value === value;
		}).pop();
	};

	/**
	 * Returns an item from the this.data object by it's index.
	 * @param {Number} index Index of the item.
	 * @returns {*} this.data item
	 */
	this.getItemByIndex = function(index) {
		return this.data[index];
	};

	/**
	 * Return an item's title from the data object by it's value.
	 * @param {String} value The value of the item.
	 * @returns {String} Title of item
	 */
	this.getTitleByValue = function(value) {
		return this.getItemByValue(value || this.parent.getValue()).title;
	};

	/**
	 * Sets the value of the input.
	 * @param {index} index Item's index in the this.data object.
	 * @return {void}
	 */
	this.setValue = function(index) {
		var item = this.getItemByIndex(index);
		this.parent.input.value = item.title;
		this.refs.input.value = item.value;
		this.setSelected(index);
	};

	this.reload = function(data) {
		this.data = data;
		this.update();
		this.setValue(0);
	};

	this.getValue = function() {
		return this.refs.input.value;
	};

	this.setSelected = function(index) {
		var selectedIndex = this.getIndexBySelected();
		if (selectedIndex + 1) {
			this.data[selectedIndex].selected = false;
		}
		this.data[index].selected = true;
	};

	/**
	 * Select event callback.
	 * @param {object} ev Event Object
	 * @return {void}
	 */
	this.select = (ev) => {
		var index = ev.target.getAttribute('data-index');
		this.unprevent();
		this.setValue(index);
		this.parent.input.blur();
	};

	this.selectChange = function(ev) {
		let index = this.getIndexByValue(ev.target.value);
		this.setValue(index);
		this.parent.trigger('change');
		this.parent.input.blur();
	};

	/**
	 * Goes to the index'th item.
	 * @param {Number} index Index of the item.
	 * @return {void}
	 */
	this.jumpTo = function(index) {
		this.setSelected(index);
		this.getListElements(index).scrollIntoViewIfNeeded();
	};

	/**
	 * Return the list elements (or one element).
	 * @param {Number} index Index of the element you need. Don't specify if you need all.
	 * @returns {*|NodeList} Node or NodeList
	 */
	this.getListElements = function(index) {
		var listElements = this.root.querySelectorAll('li');
		return typeof index !== 'undefined' ? listElements[index] : listElements;
	};

	this.open = function() {
		if (IsPrevented) {return}
		this.root.classList.remove(PH.cls.hide);
		if (!isMobile.any() && !this.scroll) {
			// !isMobile.any() added by Zsolt Arvai, Hotline fix #MSC-352.
			this.scroll = $(this.root).niceScroll(this.CONST.NICESCROLL_CONFIG);
		}
	};

	this.close = function() {
		if (!IsPrevented) {
			this.root.classList.add(PH.cls.hide);
		}
		else {
			this.parent.input.focus();
		}
		if (this.scroll) {
			$(this.root).getNiceScroll().remove();
			delete this.scroll;
		}
	};

	this.prevent = function() {
		IsPrevented = true;
	};

	this.unprevent = function() {
		IsPrevented = false;
	};

	this.escapeRegex = function(value) {
		return value.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');
	};

	this.keydown = function(ev) {
		// Handle Tab press
		if (ev.keyCode === 9) {
			this.unprevent();
			this.close();
			return;
		}

		ev.preventDefault();
		var selectedIndex = this.getIndexBySelected() || 0;

		// Handle Enter press
		if (ev.keyCode === 13) {
			this.handleEnterPress(selectedIndex);
		}
		// Handler Down-Up press
		else if (ev.keyCode === 40 || ev.keyCode === 38) {
			this.handleUpDownPress(ev, selectedIndex);
		}
		else {
			this.handleLetterPress(ev);
		}
	};

	this.handleEnterPress = function(selectedIndex) {
		this.setValue(selectedIndex);
		this.unprevent();
		this.close();
	};

	this.handleUpDownPress = function(ev, selectedIndex) {
		var newIndex = selectedIndex + (ev.keyCode === 40 ? 1 : -1);

		this.prevent();
		this.close();

		if (newIndex <= -1) {
			newIndex = 0;
		}
		else if (newIndex === this.data.length) {
			newIndex = this.data.length - 1;
		}
		else {
			newIndex = newIndex;
		}

		this.jumpTo(newIndex);
	};

	this.handleLetterPress = function(ev) {
		clearTimeout(JumpChacheTimer);
		JumpChacheTimer = setTimeout(function() {
			JumpCache = '';
		}, 1500);
		JumpCache += String.fromCharCode(ev.keyCode);

		var pattern = '^' + this.escapeRegex(JumpCache);
		var regExp = new RegExp(pattern, 'i');
		var index = -1;

		this.data.some(function(item, i) {
			index = i;
			return regExp.test(item.title);
		});

		if (index + 1) {
			this.jumpTo(index);
		}
	};
});
