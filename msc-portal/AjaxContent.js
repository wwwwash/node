import riot from 'riot';
import route from 'riot-route';
import $ from 'jquery';

import Config from '../../lib/chaos/Config';

/* @TODO what is we have more than 2 tabs? */
riot.tag('ajax-content',
	`<div ref="alertHolder" class="{empty : isAlertHolderEmpty()}">
		<yield from="alerts"></yield>
	</div>
	<div class="tabContainer" if="{opts.tabs}">
		<ph-row class="commonTabs">
			<ph-col each={opts.tabs} ph-col-30 ph-col-60-on-mobile-portrait class="tab {active: checkInURL(url)} {disabled: disabled}">
                <a to="{url}" onclick="{onTabClick}">
                    {title}
                    <i if={icon} class="icon-{icon}">&nbsp;</i>
                </a>
            </ph-col>
		</ph-row>
		<ph-clear></ph-clear>
	</div>
	<yield from="tabs"></yield>
	<div ref="content"><yield from="content"/></div>`,
	function (opts) {
		this.on('mount', () => {
			this.saveDefaultOptions();
			this.startRouting();
			this.lastNavigation = Date.now();
			this.isTabClickable = true;
			this._pageId = document.body.id;

			this.pageIds = opts.tabs.reduce((state, tab)=> {
				state[tab.url] = tab.pageId;
				return state;
			}, {});
			this.update();
		});

		/**
		 * @return {boolean} Is alert holder empty
		 */
		this.isAlertHolderEmpty = () => !this.refs.alertHolder.innerHTML.trim().length;

		/**
		 * Check if string is in the URL or not.
		 * @param {string} val Partial of url
		 * @return {boolean} if url contains the given partial
		 */
		this.checkInURL = val => {
			return location.href.indexOf(val) > 0;
		};

		/**
		 * Set the desired property of the tabs
		 * @param {string} pageId PageId property of the given tab object
		 * @param {string} prop Property to change
		 * @param {string} value Tab value
         * @return {Object} this
		 */
		this.setTabProperty = (pageId, prop, value) => {
			opts.tabs.forEach((tab, index, tabs) => {
				if (tab.pageId === pageId) {
					tabs[index][prop] = value;
				}
			});

			this.update();

			return this;
		};

		/**
		 * Save default options
		 * @return {array} state
		 */
		this.saveDefaultOptions = () => {
			this.defaultOpts = opts.tabs.reduce((state, tab) => {
				state.push(Object.assign({}, tab));
				return state;
			}, []);
		};

		/**
		 *
		 * @param {string} url Page url
		 * @return {boolean} Will ID change or not
		 */
		this.willPageChangeId = url => {
			let newPageID = this.pageIds[url];
			if (newPageID && this._pageId !== newPageID) {
				document.body.id = this._pageId = newPageID;
				return true;
			}
		};

		/**
		 * Inserts and renders the given content if needed.
		 * Checks if the page is chenging or not
		 * @param {string} content Content of the page
		 * @param {string} url Route of the content
		 * @return {void}
		 */
		this.renderPage = (content, url) => {
			if (!content || !this.willPageChangeId(url)) {
				return;
			}

			this.refs.content.innerHTML = content;
			riot.mount('*[data-is="form-tag"]');
			window.App.application._initPage();
		};

		/**
		 * Fills out the validation obj config.
		 * @param {object} obj ValidationObj content
		 * @return {void}
		 */
		this.setValidationObj = (obj) => {
			let validationObj = obj && obj.validationObj;

			if (!validationObj) {
				Config.remove('validationObj');
				return;
			}

			Config.set('validationObj', validationObj);
		};

		/**
		 * Gets content from the given URL.
		 * @param {string} url Route to the given content
		 * @return {void}
		 */
		this.getContent = (url) => {
			let base = opts.baseurl || '';
			this.isTabClickable = false;
			$.get(base + url)
				.always(() => this.isTabClickable = true)
				.done((response) => {
					let data = response.data;
					if (data) {
						this.setAlertContent(data.alertBoxBlock);
						this.setValidationObj(data.jsObject);
						this.renderPage(data.block, url);
					}
				})
				.fail((err) => console.log('error', err));
		};

		/**
		 * Sets the content of the alert container.
		 * @param {string} content HTLML content
		 * @return {void}
		 */
		this.setAlertContent = content => {
			if (!content) {
				content = '';
			}

			if (content.trim() === '') {
				this.refs.alertHolder.classList.add('empty');
				// A little bit more than the anim put duration
				setTimeout(()=> this.refs.alertHolder.innerHTML = '', 1200);
			}
			else {
				this.refs.alertHolder.classList.remove('empty');
				this.refs.alertHolder.innerHTML = content;
			}
		};

		/**
		 * Kicks off the riot router
		 * @return {void}
		 */
		this.startRouting = () => {
			let baseURI = location.origin + '/';

			if (!baseURI) {
				return;
			}

			route.base(baseURI);
			route.start();
		};

		/**
		 * Tab Click Event
		 * @param {Object} event Event Object
		 * @return {void}
		 */
		this.onTabClick = event => {
			if (this.lastNavigation && this.lastNavigation > Date.now() - 1500) {
				return;
			}

			let url = event.currentTarget.attributes.to.value;

			opts.tabs.forEach((tab, index, tabs) => {
				tabs[index] = Object.assign({}, this.defaultOpts[index]);
			});

			this.navigateTo(url);
		};


		/**
		 * Refreshes the current loaded page
		 * @return {void}
		 */
		this.refreshPage = () => {
			this.navigateTo(this.currentRoute);
		};

		/**
		 * Navigates to the desired route
		 * @param {string} url Url to navigate
		 * @return {void}
		 */
		this.navigateTo = url => {
			if (!url || !this.isTabClickable) {
				return;
			}

			this.lastNavigation = Date.now();
			this.currentRoute = url;
			route(url);
			this.getContent(url);
			this.update();
		};
	});
