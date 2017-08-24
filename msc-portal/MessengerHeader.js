import riot from 'riot';
import route from 'riot-route';

riot.tag('messenger-header',
`<ph-row class="ph-vertical-middle unfixed ph-full-height" if="{ opts.partner }">
	<ph-col class="ph-px-width" if="{ opts.partner !== 'undefined' }">
		<div class="msg__avatar msg__avatar--small">
			<avatar url="{ opts.partner.profileImage }" letter="{ opts.partner.name[0] }"></avatar>
		</div>
	</ph-col>
	<ph-col class="ph-relative">
		<div class="msg-header__detail msg-header__detail--name">{ opts.partner.name }</div>
		<ul class="msg-header__detail msg-header__detail--data" if="{ opts.partner }">
			<li if="{ opts.partner.age }">
				{ opts.partner.age }
			</li>
			<li if="{ opts.partner.gender }">
				{ opts.partner.gender }
			</li>
			<li if="{ opts.partner.location }">
				{ opts.partner.location }
			</li>
			<li if="{ opts.partner.lastaction }" class="ph-hide-on-mobile-portrait">
				{ opts.partner.lastaction }
			</li>
		</ul>
		<a href="#" onclick="{ close }" class="msg-header__close ph-hide ph-show-on-mobile">
			<i class="icon-x"></i>
		</a>
	</ph-col>
</ph-row>`,

function() {
	// Route back on close icon click
	this.close = () => route('');
});
