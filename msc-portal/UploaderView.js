import Ext from '../../lib/vendor/ExtCore';
import Chaos from '../../lib/chaos/Chaos';
import ChaosObject from '../../lib/chaos/Object';

/**
 * UploaderView
 *
 */
export default function UploaderView(el, config) {
	UploaderView.superclass.constructor.call(this, el, config);
}

UploaderView.EVENT_FLASH_UPLOADER_EMBED_READY = 'flash-uploader-embed-ready';
UploaderView.EVENT_MEDIA_TEMPLATE_READY = 'media-template-ready';

Chaos.extend(UploaderView, ChaosObject, {

	/** @var {String}     CSS selector of the progressbar */
	progressBarSel      : '#progress_bar span',
	/** @var {String}     uploaderButtonId */
	uploaderButtonId    : 'add_photos_button',
	/** @var {String}     Uploading class */
	uploadingCls        : 'uploading',
	/** @var {Number}     Duration of animations */
	animateDuration     : 0.15,
	/** @var {Object}     Main container element of the media boxes [Ext.Element] */
	mediaBoxContainerEl : undefined,
	/** @var {Object}     Template object for a loading media box [Ext.Template] */
	loadingMediaBoxTpl  : undefined,
	/** @var {Object}     Template object for a failed media box [Ext.Template] */
	failedMediaBoxTpl   : undefined,
	/** @var {Object}     Template object for an media box that already loaded [Ext.Template] */
	mediaBoxTpl         : undefined,
	/** @var {Object}     Template object for an uploader box [Ext.Template] */
	uploaderBoxTpl      : undefined,
	/** @var {SWF Object} The uploader flash object */
	uploaderObject      : undefined,
	/** @var {String} The id of the uploader flash object */
	uploaderObjectId    : 'multiUpload',
	/**
	 * Standard init function
	 *
	 * @param {Object} el
	 * @param {Object} config
	 *
	 * @return void
	 */
	init                : function(el, config) {
		UploaderView.superclass.init.call(this, el, config);
		this.addEvents(
			UploaderView.EVENT_FLASH_UPLOADER_EMBED_READY,
			UploaderView.EVENT_MEDIA_TEMPLATE_READY
		);
	},

	/**
	 * Reset to the default progress bar
	 *
	 * @method resetProgressBar
	 * @public
	 *
	 * @return {Object}   scope to chain
	 */
	resetProgressBar : function() {
		this.setProgressBarEl().setWidth(0);
		return this;
	},

	/**
	 * Appends a html fragment to a given element
	 *
	 * @method appendContent
	 *
	 * @return {Object} scope
	 */
	insertContentAfter : function(parentElement, htmlFragment) {
		Ext.DomHelper.insertAfter(parentElement, htmlFragment);
		return this;
	},

	/**
	 * Adds and removes uploading class,
	 * while there is an uploading item in the folder
	 *
	 * @method setUploadingClass
	 * @param {Object} parentElement    [Ext.element]
	 * @param {String} action           remove/add
	 *
	 * @return void;
	 */
	setUploadingClass : function(parentElement, action) {
		switch (action) {
			case 'remove':
				parentElement.removeClass(this.uploadingCls);
				break;
			case 'add':
				parentElement.addClass(this.uploadingCls);
				break;
			default:
		}
	},

	/**
	 * Gets and returns a progress bar element [Ext.Element]
	 *
	 * @method getProgressBarEl
	 * @public
	 *
	 * @return {Object}
	 */
	getProgressBarEl : function() {
		if (!(this._progressBarEl instanceof Ext.Element)) {
			this._progressBarEl = this.element.select(this.progressBarSel).item(0);
		}
		return this._progressBarEl;
	},

	/**
	 * Sets the progress bar element [Ext.Element]
	 *
	 * @method getProgressBarEl
	 * @public
	 *
	 * @return {Object}
	 */
	setProgressBarEl : function() {
		this._progressBarEl = this.element.select(this.progressBarSel).item(0);
		return this._progressBarEl;
	},

	/**
	 * Refreshes the progress bar according to the given param value.
	 *
	 * @method _refreshProgressBar
	 * @public
	 *
	 * @param {Number} percent   StaterefreshProgressBar of the upload process in percent.
	 *
	 * @return {Object}   scope to chain
	 */
	refreshProgressBar : function(percent) {
		if (percent <= 100) {
			this.getProgressBarEl().setWidth(percent + '%');
		}
		return this;
	},

	/**
	 * Refreshes file index number while multiupload process is in progress.
	 *
	 * @method refreshFileIndex
	 * @public
	 *
	 * @param {Number} allFilesCount      All uploading files number
	 * @param {Number} currentFileIndex   Current uploading file's index
	 *
	 * @return void;
	 */
	refreshFileIndex : function(allFilesCount, currentFileIndex) {
		Ext.select('.uploader_file_counter').item(0).html(allFilesCount + '/' + currentFileIndex); //@todo: debug only
	},

	/**
	 * Creates a block from a template that will show a loading media box
	 *
	 * @method createLoadingMediaBo
	 * @public
	 *
	 * @return {Object} this scope to chain
	 */
	createLoadingMediaBox : function(tplConfig) {
		if (this.loadingMediaBoxTpl) {
			var mediaTemplate = this.loadingMediaBoxTpl.applyTemplate(tplConfig);
			this.fireEvent(
				UploaderView.EVENT_MEDIA_TEMPLATE_READY, {
					mediaTemplate : mediaTemplate, fileIndex     : tplConfig.fileIndex
				}
			);
		}
		return this;
	},

	/**
	 *
	 * Creates a block from a template that will show a loading media box
	 *
	 * @method createLoadingMediaBox
	 * @public
	 *
	 * @return {Object} html Fragment
	 */
	getLoadingMediaBox : function(tplConfig) {
		if (this.loadingMediaBoxTpl) {
			return this.loadingMediaBoxTpl.applyTemplate(tplConfig);
		}
	},

	/**
	 * Returns an uploading bock
	 *
	 * @method createLoadingMediaBox
	 * @public
	 *
	 * @return {Object} this scope to chain
	 */
	createUploadingMediaBox : function(tplConfig) {
		if (this.uploadingMediaBoxTpl) {
			this.fireEvent(UploaderView.EVENT_MEDIA_TEMPLATE_READY, {
				mediaTemplate : this.uploadingMediaBoxTpl.applyTemplate(tplConfig),
				fileIndex     : tplConfig.fileIndex,
				fileName      : tplConfig.fileName
			});
		}
		return this;
	},

	/**
	 * Creates a box that show a failed image upload box
	 *
	 * @method createFailedMediaBox
	 * @public
	 *
	 * @param {Object} loadingBoxEl   Loading box element that will be replaced with an uploaded media box
	 * @param {Object} tplConfig      Template config
	 *
	 * @return {Object}
	 */
	createFailedMediaBox : function(loadingBoxEl, tplConfig) {
		var insertedEl;
		if (this.failedMediaBoxTpl) {
			if (!loadingBoxEl) {
				return Ext.DomHelper.insertAfter(
					this.element.select('.actionBlock').item(0),
					this.failedMediaBoxTpl.applyTemplate(tplConfig)
				);
			}
			insertedEl = Ext.DomHelper.insertAfter(
				loadingBoxEl,
				this.failedMediaBoxTpl.applyTemplate(tplConfig)
			);
			loadingBoxEl.remove();

			return insertedEl;
		}
	},

	/**
	 * Insert a failed media box after the uploader element
	 *
	 * @method insertFailedMediaBox
	 * @param {Object}    beforeElement    [Ext.element]
	 * @param {Object}    insertedElement [Ext.element]
	 * @param {Object}    tplConfig        Template config
	 *
	 * @return void;
	 */
	insertFailedMediaBox : function(beforeElement, insertedElement, tplConfig) {
		Ext.DomHelper.insertAfter(beforeElement, this.failedMediaBoxTpl.applyTemplate(tplConfig));
	}
});
