// File not used anymore, keeping it just in case...

import Chaos from '../../lib/chaos/Chaos';
import ChaosCookie from '../../lib/chaos/Cookie';
import Connection from '../../lib/chaos/Connection';

import CommonWidgetController from './CommonWidgetController';

export default function SocialAccountsController(el, config) {
	SocialAccountsController.superclass.constructor.call(this, el, config);
}

Chaos.extend(SocialAccountsController, CommonWidgetController, {

	init : function(el, config) {
		SocialAccountsController.superclass.init.call(this, el, config);
	},

	_onTwitterButtonClick : function(ev, target) {
		ev.preventDefault();

		ChaosCookie.remove('twitterAccessTokenSet', '/');

		if (!Ext.fly(target)) {
			return;
		}

		this._openWindow(Ext.fly(target));
		this._checkTwitterAccessToken();
	},

	_onTumblrButtonClick : function(ev, target) {
		ev.preventDefault();

		ChaosCookie.remove('tumblrAccessTokenSet', '/');

		if (!Ext.fly(target)) {
			return;
		}
		this._openWindow(Ext.fly(target));
		this._checkTumblrAccessToken();
	},

	_openWindow : function(element) {
		window.open(
			element.dom.href,
			'targetWindow',
			'width=800,height=400,top=200,left=200'
		);
	},

	_checkTwitterAccessToken : function() {
		this.twitterCheckSetInterval = setInterval(function() {
			if (ChaosCookie.get('twitterAccessTokenSet')) {
				clearInterval(this.twitterCheckSetInterval);
				this._requestSocialWidgetBlock();
			}
		}.bind(this), 1000);
	},

	_checkTumblrAccessToken : function() {
		this.tumblrCheckSetInterval = setInterval(function() {
			if (ChaosCookie.get('tumblrAccessTokenSet')) {
				clearInterval(this.tumblrCheckSetInterval);
				this._requestSocialWidgetBlock();
			}
		}.bind(this), 1000);
	},

	_requestSocialWidgetBlock : function() {
		Connection.Ajax.request({
			url     : Chaos.getUrl('SocialWidget/Refresh'),
			type    : Chaos.Connection.TYPE_JSON,
			success : this._socialWidgetBlockRequestSuccessful,
			error   : this._socialWidgetBlockRequestError,
			failure : this._socialWidgetBlockRequestError,
			scope   : this,
			method  : COM.constant.GET
		});
	},

	_socialWidgetBlockRequestSuccessful : function(response) {
		var _data = response.json.data;
		if (_data && _data.block !== '') {
			var _newWidgetBlock = _data.block;
			Ext.select('.social-account-widget').remove();
			Ext.DomHelper.insertAfter(Ext.select('.widget-daily-tip').item(0), _newWidgetBlock);
			Chaos.Broadcaster.fireEvent('socialWidgetRefreshed');
		}
	},

	_socialWidgetBlockRequestError : function(response) {
		/* DEBUG */
		console.log(response);
		/* ENDDEBUG */
	},

	_onTwitterDeauthorizeButtonClick : function() {
		this._socialDeauthorizeRequest(Chaos.getUrl('TwitterAuthentication/Deauthorize'));
	},

	_onTumblrDeauthorizeButtonClick : function() {
		this._socialDeauthorizeRequest(Chaos.getUrl('TumblrAuthentication/Deauthorize'));
	},

	_socialDeauthorizeRequest : function(_url) {
		Connection.Ajax.request({
			url     : _url,
			type    : Chaos.Connection.TYPE_JSON,
			success : this._sociaDeauthorizeSuccessful,
			error   : this._sociaDeauthorizeError,
			failure : this._sociaDeauthorizeError,
			scope   : this,
			method  : COM.constant.POST
		});
	},

	_sociaDeauthorizeSuccessful : function() {
		this._requestSocialWidgetBlock();
	},

	_sociaDeauthorizeError : function(response) {
		/* DEBUG */
		console.log(response);
		/* ENDDEBUG */
	},

	bind : function() {
		SocialAccountsController.superclass.bind.call(this);

		this.element.on('click', this._onTwitterButtonClick, this, {
			delegate : '.js-twitter-button'
		});

		this.element.on('click', this._onTumblrButtonClick, this, {
			delegate : '.js-tumblr-button'
		});

		this.element.on('click', this._onTwitterDeauthorizeButtonClick, this, {
			delegate : '.js-twitter-deauthorize'
		});

		this.element.on('click', this._onTumblrDeauthorizeButtonClick, this, {
			delegate : '.js-tumblr-deauthorize'
		});
	},

	unbind : function() {
		this.autoUnbind();
	}
});
