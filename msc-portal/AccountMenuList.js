import riot from 'riot';
import $ from 'jquery';

import Chaos from '../../lib/chaos/Chaos';

import '../_Raw/Raw';
import '../_Scrollable/Scrollable';

riot.tag('account-menu-list',
	`<div class="account-menu-list__search">
		<i class="icon-magnifier account-menu-list__icon"></i>
		<input class="account-menu-list__input" type="text" maxlength="16" ref="search" onkeyup="{ keyup }" />
	</div>
	<scrollable max="350" onmousemove="{ onMouseMove }">
		<ul>
			<li each="{ parent.data }">
				<a href="{ profileUrl }" class="account-menu-list__link" data-status="{ statusId }">
					<img alt="{ name }'s profile image" class="account-menu-list__image" riot-src="{ pictureUrl }">
					<raw content="{ this.parent.parent.highlight(name) }"></raw>
				</a>
			</li>
		</ul>
	</scrollable>`,

	function() {
		this.value = '';
		this.data = [];
		this.hasMore = false;
		this.isLoading = false;

		this.on('mount', function () {
			this.parent.on('open', ::this.onOpen);

			this.tags.scrollable.on('scrollend', () => this.load(true));
		});

		this.keyup = function() {
			let { search } = this.refs;
			if (this.value === search.value.trim()) {
				return;
			}
			clearTimeout(this.searchTimeout);
			this.data = [];
			this.value = search.value.trim();
			this.searchTimeout = setTimeout(::this.load, 300);
		};

		this.highlight = function (name) {
			if (this.value) {
				name.replace(new RegExp(this.value, 'i'), function () {
					name = arguments[2].substr(0, arguments[1]) + '<strong>' + arguments[0] + '</strong>'
							+ arguments[2].substr(arguments[1] + arguments[0].length, arguments[2].length);
				});
			}
			return name;
		};

		this.load = function (isOnScrollEnd) {
			if (isOnScrollEnd && !this.hasMore || this.isLoading) {
				return;
			}
			var params = {};
			var last = this.data[this.data.length - 1];

			if (this.value) {
				params.screenNameLike = this.value;
			}
			params.lastScreenName = last ? last.name : '';
			params.lastStatusId = last ? last.statusId : 0;
			this.isLoading = true;

			setTimeout(function() { // Wait for Chaos -.-
				$.ajax({
					url  : Chaos.getUrl('AccountTooltip/ShowMoreProfile', {}, {}),
					data : params
				}).done(function(data) {
					data = data.data;
					if (isOnScrollEnd) {
						this.data = this.data.concat(data.list);
					}
					else {
						this.data = data.list;
					}
					this.hasMore = data.hasMore;
					this.isLoading = false;
					this.update();
				}.bind(this));
			}.bind(this));
		};

		this.onMouseMove = function(ev) {
			ev.preventUpdate = true;
			this.tags.scrollable.root.focus();
		};

		this.onOpen = function(isFirst) {
			if (isFirst) {
				this.load();
			}
		};
	}
);
