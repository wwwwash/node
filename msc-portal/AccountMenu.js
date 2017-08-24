import riot from 'riot';

import { Broadcaster } from '../../lib/chaos/Broadcaster';

import './AccountMenuList';
import './AccountMenu.scss';
import ModelCenterBasicLayout from '../Layout/ModelCenterBasic';

riot.tag('account-menu',

	`<div class="account-menu__button" onmouseenter="{ enter }" onmouseleave="{ leave }">

		<span onclick="{ buttonClick }" ontouchstart="{ buttonClick }" >
			<i class="icon-user account-menu__icon account-menu__icon--left"></i>
			<span class="account-menu__text ph-hide-on-small-and-down">
				{ text }
			</span>
			<span class="account-menu__user ph-hide-on-small-and-down">
				{ user }
			</span>
			<i class="icon-caret-down account-menu__icon account-menu__icon--right"></i>
		</span>

		<div class="{'ph-invisible-overflow': !isOpen} account-menu__dropdown-wrapper">
			<div class="account-menu__dropdown">
				<span class="account-menu__arrow"></span>
				<ul class="account-menu__options">
					<yield></yield>
					<li if="{ hasSelector !== 'false' }">
						<account-menu-list class="account-menu-list"></account-menu-list>
					</li>
				</ul>
			</div>
		</div>

	</div>`,

	function(opts) {
		let timeoutTask;
		let isFirstOpen = true;

		this.isOpen = false;
		this.mixin(opts);

		this.on('mount', function() {
			// safari doesn't want to repaint element after riotjs applies its changes to innerHtml,
			// so we need to force repaint
			this.repaint();
		});

		this.buttonClick = function () {
			if (this.isOpen) {
				this.leave();
				this.repaint(0);
			}
			else {
				this.enter();
			}
		};

		this.enter = function () {
			// This Event handler shall run after the buttonClick
			setTimeout(function () {
				this.trigger('open', isFirstOpen);
				isFirstOpen = false;
				this.isOpen = true;
				clearTimeout(timeoutTask);
				this.update();
				Broadcaster.fireEvent(ModelCenterBasicLayout.EVENT_LOGGEDIN_MENU_OVER, {
					targetId : this.root
				});
				return true;
			}.bind(this), 0);
		};

		this.leave = function () {
			this.isOpen = false;
			this.update();
			this.repaint();

			Broadcaster.fireEvent(ModelCenterBasicLayout.EVENT_LOGGEDIN_MENU_OUT, {
				targetId : this.root
			});
		};

		this.repaint = function(timeout = 300) {
			clearTimeout(timeoutTask);
			timeoutTask = setTimeout(() => {
				this.isOpen = false;
				this.update();
				this.root.style.height = this.root.style.height;

				// Repaint
				var disp = this.root.style.display;
				this.root.style.display = 'none';
				this.root.offsetHeight; // eslint-disable-line
				this.root.style.display = disp;
			}, timeout);
		};
	}
);
