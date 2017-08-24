import './Configure';

import './App.scss';
import '../Header/Header.scss';
import '../Footer/Footer.scss';

// Commonly used TODO: Move to where it's used
import '../Tabs/Tabs.scss';
import '../ProgressBar/ProgressBar.scss';

// Vendors css TODO: Move to where it's used
import '!style-loader!css-loader!slick-carousel/slick/slick.css';
import '!style-loader!css-loader!nanoscroller/bin/css/nanoscroller.css';

// Commons/plugins/vendors  TODO: Move to where it's used
import $ from 'jquery';
import 'protip';
import moment from 'moment';
import riot from 'riot';
//import 'jquery.nicescroll'; Should be, but we can't :(
import '../../lib/vendor/jquery.nicescroll';
import 'nanoscroller';

import Application from '../../lib/chaos/Application';
import Chaos from '../../lib/chaos/Chaos';
import I18n from '../../lib/chaos/I18n';
import Router from '../../lib/chaos/Router';
import Config from '../../lib/chaos/Config';
import PH from '../../lib/constant/Phrame';

import Overlay from '../Overlay/Overlay';
import ProgressIndicator from '../ProgressIndicator/ProgressIndicator';
import GlobalProgressIndicator from '../ProgressIndicator/GlobalProgressIndicator';
import Helptip from '../Helptip/Helptip';
import ConfirmOverlay from '../Overlay/Confirm/Confirm';
import layoutLoader from '../Layout';
import pageLoader from '../Page';

// Common tags  TODO: Move to where it's used
import '../_Form/FormTag';

// BE based footer scripts will use this to store it's stuff
window.riot = riot; // Sry folks!

export default class App {

	i18n = undefined;
	config = undefined;
	static Instance = undefined;

	constructor(config) {
		this.config = config;
		this.enableJs();
		this.setConfig();
		this.setLanguage();
		this.setRiotMixins();
		this.initComponents();
		this.setApplication();
		this.setRouter();
		this.runApplication();
		App.Instance = this;
	}

	enableJs() {
		document.body.classList.remove('no-script');
	}

	setApplication() {
		this.application = Application.getInstance();
	}

	runApplication() {
        // Interval is only needed on dev because of inline CSS.
        /* develblock:start */
		var ival = setInterval(() => {
			if (!window.getComputedStyle(document.body, ':before').getPropertyValue('content')) {
				return;
			}
        /* develblock:end */
			this.initPhrame();
			this.application.run({
				layoutLoader,
				pageLoader
			})
			.then(App.InitRiot)
			.then(() => $.protip({
				defaults : {
					scheme  : 'black',
					size    : 'normal',
					skin    : 'msc',
					gravity : 'right;left;bottom;top;...'
				},
				forceMinWidth : true,
				offset        : 2
			}));
		/* develblock:start */
			clearInterval(ival);
		}, 10);
        /* develblock:end */
	}

	setLanguage() {
		this.i18n = I18n.getInstance();
		this.i18n.setLanguage(this.config.language);
		this.i18n.setTranslationTable(
            this.config.language,
            window.translations[this.config.language] || {}
        );
	}

	setRouter() {
		this.application.setRouter(
            new Router(this.config.routings, this.i18n)
        );
	}

	setConfig(configObj = this.config) {
		for (let k of Object.keys(configObj)) {
			Config.set(k, configObj[k]);
		}
	}

	setRiotMixins() {
        // Else riot would bind to his own context
		moment.bind = function() {return moment};
		Chaos.tr.bind = function() {return Chaos.tr};

		riot.mixin({
			moment,
			_ : Chaos.tr
		});
	}

	initPhrame() {
		PH.screen = PH._getScreenData();
	}

	initComponents() {
		Config.set('helpTipComponent', new Helptip.getInstance(document.body, {}));
		Config.set(
            'globalProgressIndicator',
            new GlobalProgressIndicator(document.querySelector('#ajaxIndicatorContainer'), {})
        );
		Config.set('overlayComponent', new Overlay(document.body, {}));
		Config.set('confirmComponent', new ConfirmOverlay(document.body, {}));
		Config.set('localProgressIndicator', new ProgressIndicator(document.body, {}));
	}

	static InitRiot(root = document) {
		Array.from(root.querySelectorAll('.riot-mount'))
			.forEach(el => {
				try {
					let tag = riot.mount(el);
					if (tag.length) {
						el.classList.remove('riot-mount');
					}
				}
				catch (e) {
					/* develblock:start */
					console.warn(
						`No such riot tag definition:`,
						`${el.dataset.is || el.tagName.toLowerCase()}.`,
						`Maybe it's just some async loading stuff only and no need to worry.`,
					);
					throw e;
					/* develblock:end */
				}
			});
		return Promise.resolve();
	}
}

window.App = App;
let InitRiot = App.InitRiot;

export { InitRiot as InitRiot };
