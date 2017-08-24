/* eslint-disable complexity */
/* eslint-disable camelcase */

/**
 * HTML5Uploader
 * Abstract for HTML5 based uploader instances.
 * Contains all the basic variables, elements and methods for the jQuery-file-upload plugin
 *
 * Uses ONLY jQuery
 */

import $ from 'jquery';
import 'blueimp-file-upload';

import Ext from '../../lib/vendor/ExtCore';
import ChaosObject from '../../lib/chaos/Object';
import Config from '../../lib/chaos/Config';
import Util from '../../lib/chaos/Util';

import './Uploader5.scss';

export default function HTML5Uploader(el, config) {
	HTML5Uploader.superclass.constructor.call(this, el, config);
}

HTML5Uploader.ERROR = {
	DEFAULT              : 'default',
	FILE_LIMIT_EXCEEDED  : 'file_limit_exceeded',
	FILENAME_TOO_LONG    : 'filename_too_long',
	FILENAME_TOO_SHORT   : 'filename_too_short',
	FILE_EXISTS          : 'file_exists',
	TOTAL_SIZE_EXCEEDED  : 'total_size_exceeded',
	ALREADY_UPLOADED     : 'already_uploaded',
	FILE_SIZE_TOO_BIG    : 'file_size_too_big',
	FILE_SIZE_TOO_SMALL  : 'file_size_too_small',
	WRONG_FILE_EXTENSION : 'wrong_file_extension',
	IMAGE_MIN_WIDTH      : 'image_min_width',
	IMAGE_MIN_HEIGHT     : 'image_min_height',
	IMAGE_MAX_WIDTH      : 'image_max_width',
	IMAGE_MAX_HEIGHT     : 'image_max_height'
};

HTML5Uploader.EV = {

	// Plugin related
	ADD            : 'add',
	SUBMIT         : 'submit',
	SEND           : 'send',
	DONE           : 'done',
	FAIL           : 'fail',
	ALWAYS         : 'always',
	PROGRESS       : 'progress',
	PROGRESS_ALL   : 'progressall',
	START          : 'start',
	STOP           : 'stop',
	CHANGE         : 'change',
	PASTE          : 'paste',
	DROP           : 'drop',
	DRAG_OVER      : 'dragover',
	DRAG_ENTER     : 'dragenter',
	DRAG_LEAVE     : 'dragleave',
	CHUNK_SEND     : 'chunksend',
	CHUNK_DONE     : 'chunkdone',
	CHUNK_FAIL     : 'chunkfail',
	CHUNK_ALWAYS   : 'chunkalways',
	PROCESS_START  : 'processstart',
	PROCESS        : 'process',
	PROCESS_DONE   : 'processdone',
	PROCESS_FAIL   : 'processfail',
	PROCESS_ALWAYS : 'processalways',
	PROCESS_STOP   : 'processstop',

	// Custom
	PREPARE_OK      : 'prepareok',
	PREPARE_FAIL    : 'preparefail',
	GET_TOKENS_OK   : 'gettokensok',
	GET_TOKENS_FAIL : 'gettokensfail'
};

HTML5Uploader.VALIDATE = {
	SIZE       : 'size',
	RESOLUTION : 'resolution',
	EXTENSION  : 'extensions',
	FILENAME   : 'filename'
};

HTML5Uploader.VALIDATION_BLACKLIST = [
	'tif',
	'tiff'
];

Ext.extend(HTML5Uploader, ChaosObject, {

	/**
	 * Default uploader options.
	 *
	 * @type Object
	 * @see  https://github.com/blueimp/jQuery-File-Upload/wiki/Options
	 */
	defaults : {
		// Core (from plugin)
		url                              : null,
		type                             : 'POST',
		dataType                         : 'text',
		formData                         : {},
		dropZone                         : null,
		pasteZone                        : undefined,
		fileInput                        : undefined,
		replaceFileInput                 : true,
		paramName                        : 'Filedata',
		singleFileUploads                : true,
		limitMultiFileUploads            : undefined,
		limitMultiFileUploadSize         : undefined,
		limitMultiFileUploadSizeOverhead : 512,
		sequentialUploads                : true,
		limitConcurrentUploads           : undefined,
		forceIframeTransport             : false,
		redirect                         : undefined,
		redirectParamName                : undefined,
		postMessage                      : undefined,
		multipart                        : true,
		maxChunkSize                     : undefined,
		uploadedBytes                    : undefined,
		recalculateProgress              : true,
		progressInterval                 : 10,
		bitrateInterval                  : 500,
		autoUpload                       : true,
		processData                      : false,
		contentType                      : false,
		cache                            : false,
		timeout                          : 0,

		// Custom
		tokenUrl        : undefined,
		preview         : undefined,
		validate        : {},
		errorMessages   : undefined,
		continueOnError : false,
		multiLimit      : 50,

		// Events using a built-in handler.
		// Cannot overwrite, use Chaos events on this instance instead.
		add           : undefined,
		submit        : undefined,
		send          : undefined,
		done          : undefined,
		fail          : undefined,
		always        : undefined,
		progress      : undefined,
		progressall   : undefined,
		start         : undefined,
		stop          : undefined,
		change        : undefined,
		paste         : undefined,
		drop          : undefined,
		dragover      : undefined,
		chunksend     : undefined,
		chunkdone     : undefined,
		chunkfail     : undefined,
		chunkalways   : undefined,
		processstart  : undefined,
		process       : undefined,
		processdone   : undefined,
		processfail   : undefined,
		processalways : undefined,
		processstop   : undefined
	},

	/**
	 * The merged options with the defaults.
	 *
	 * @type Object
	 */
	options : undefined,

	/**
	 * List of received tokens
	 *
	 * @type Array
	 * @private
	 */
	_tokens : [],

	/**
	 * List of received mongo ID's
	 *
	 * @type Array
	 * @private
	 */
	_mongos : [],

	/**
	 * List of all errors.
	 *
	 * @type Array
	 * @private
	 */
	_errors : [],

	/**
	 * Data object received from the plugin.
	 *
	 * @type Object
	 */
	pluginData : undefined,

	/**
	 * PluginData will be pushed into this array on `add` events.
	 *
	 * @type Array
	 */
	pluginDatas : [],

	/**
	 * Results from the filereader (base64).
	 *
	 * @type Object
	 */
	readerResults : {},

	/**
	 * Init method.
	 * @param {Object} el     Element of the Plugin. Its a File Input. Ext.Element because the environment is Ext.
	 * @param {Object} config Config object
	 * @return void
	 */
	init : function(el, config) {
		this._el = el.dom ? $(el.dom) : $(el);

		this.options = $.extend({}, this.defaults, config);
		this.options.errorMessages = this.options.errorMessages || Config.get('errorObj').html5_uploader;
		this.options.dropZone = this.options.dropZone || this._el.closest('.uploader5__dropzone') || null;

		this._uploaderFactory();

		HTML5Uploader.instance = this;
		HTML5Uploader.superclass.init.call(this, el, config);
	},

	/**
	 * Manually initialize upload.
	 */
	send : function(index) {
		index = index || 0;
		if (this._tokens.length) {
			this.pluginDatas[index].formData = {
				index : index,
				token : this._tokens[index],
				mongo : this._mongos[index],
				type  : this.options.mediaType
			};
		}
		this._el.fileupload('send', this.pluginDatas[index]);
	},

	/**
	 * Add file manually
	 */
	add : function(base64, name, type) {
		var blob = this._dataURItoBlob(base64, type);
		blob.name = name;
		this.pluginData = {
			files : [blob]
		};
		this.fireEvent('change');
		this._el.fileupload('add', { files : blob });
	},
	/**
	 * Checks if response has redirect url
	 *
	 * @param   {object}  response
	 * @returns {boolean} Is needed to redirect
	 * @private
	 */
	_isNeedToRedirect : function(response) {
		try {
			if (response.data.redirectUrl) {
				window.location.href = response.data.redirectUrl;
				return true;
			}
		}
		catch (e) {
			/* develblock:start */
			console.warn('Cannot read data from the response', response);
			/* develblock:end */
		}

		return false;
	},

	/**
	 * Request backend for tokens.
	 *
	 * @returns {jQuery.Deferred.promise}
	 */
	getTokens : function() {
		var deferred = new $.Deferred();

		if (!this.options.tokenUrl) {
			deferred.resolve();
			this.fireEvent(HTML5Uploader.EV.GET_TOKENS_OK, {
				uploaderInstance : this
			});
			return deferred.promise();
		}

		this.options.formData.quantity = this.pluginDatas.length;

		var extendedUrl = Util.updateQueryString(
			'attributes[isPromoVideo]',
			this.promoVideoEnabled || 0,
			this.options.tokenUrl
		);

		// Getting the token
		$.post(extendedUrl, this.options.formData)
			.always(function(response) {
				response.uploaderInstance = this;

				if (this._isNeedToRedirect(response)) {
					return;
				}
				else if (!this._processTokens(response)) {
					this._addError(HTML5Uploader.ERROR.DEFAULT);
					deferred.reject();
					this.fireEvent(HTML5Uploader.EV.GET_TOKENS_FAIL, response);
				}
				else {
					deferred.resolve();
					this.fireEvent(HTML5Uploader.EV.GET_TOKENS_OK, response);
				}
			}.bind(this));

		return deferred.promise();
	},

	/**
	 * Returns token list
	 *
	 * @returns {Array}
	 */
	getTokenList : function() {
		return this._tokens;
	},

	/**
	 * Returns the already uploaded count.
	 * Implement your custom one in your controller.
	 * Used with multiLimit calculations.
	 *
	 * @returns {number}
	 */
	getUploadedCount : function() {
		return 0;
	},

	/**
	 * Returns that how much file is still allowed to upload.
	 *
	 * @returns {number}
	 */
	getAllowedUploadCount : function() {
		return Math.max(0, this.options.multiLimit - this.getUploadedCount());
	},

	/**
	 * Tells if the multi upload limit gets
	 * exceeded with the current file selection.
	 *
	 * @returns {boolean}
	 * @private
	 */
	isLimitExceeded : function() {
		return this.getAllowedUploadCount() - this.pluginData.files.length < 0;
	},

	/**
	 * Factory method for Jquery-file-upload plugin.
	 *
	 * @private
	 */
	_uploaderFactory : function() {
		this._el.fileupload(this._buildOptions());
	},

	/**
	 * Builds options list:
	 * - Attaches _evenetHandler to all plugin events.
	 *
	 * @returns {Object} Options object.
	 * @private
	 */
	_buildOptions : function() {
		$.each(HTML5Uploader.EV, function(key, value) {
			this.options[value] = this._eventHandler.bind(this);
		}.bind(this));

		this.options.defaultElement = this._el;

		return this.options;
	},

	/**
	 * Global event handler for all plugin events.
	 *
	 * @param ev   {Object} Event object
	 * @param data {Object} Datas passed by the event.
	 * @returns {boolean|void}
	 * @private
	 */
	_eventHandler : function(ev, data) {
		var event = ev.type.replace('fileupload', '');
		data.uploaderInstance = this;
		data.originalEv = ev;
		this.pluginData = data;
		this.fireEvent(event, data);

		switch (event) {
			case HTML5Uploader.EV.SUBMIT:
				return false;
			default: break;
		}
	},

	/**
	 * Processing tokens.
	 *
	 * @param   {object}  response Gettoken request response
	 * @returns {boolean} Is successful?
	 * @private
	 */
	_processTokens : function(response) {
		try {
			this._tokens = [];
			this._mongos = [];
			response.data.documents.forEach(function(value) {
				this._tokens.push(value.token);
				this._mongos.push(value.mongoId);
			}.bind(this));

			return !!this._tokens;
		}
		catch (e) {
			/* develblock:start */
			console.warn('Cannot read token or mongoId from the response', response);
			/* develblock:end */
		}

		return false;
	},

	/**
	 * Aborts every upload process if the method exists.
	 *
	 * @private
	 */
	_abortProcess : function() {
		if (this.pluginData.abort) {
			this.pluginData.abort();
		}
	},

	/**
	 * Reading files with HTML5 FileReader API
	 *
	 * @returns {jQuery.Deferred.promise}
	 * @private
	 */
	_readFile : function() {
		var	deferred = new $.Deferred();
		this.readerResults = {};

		if (
			(this.options.preview
				|| this.options.validate && this.options.validate[HTML5Uploader.VALIDATE.RESOLUTION]
			)
			&& window.FileReader
		) {
			try {
				var filesCount = this.pluginData.files.length,
					loaded = 0;
				// Read in the image file as a data URL
				this.pluginData.files.forEach(function(file) {
					var reader = new FileReader();
					reader.onload = function(e) {
						loaded++;
						this.readerResults[file.name] = e.target.result;

						if (filesCount === loaded) {
							deferred.resolve();
						}
					}.bind(this);
					reader.readAsDataURL(file);
				}.bind(this));
			}
			catch (e) {
				this._addError(HTML5Uploader.ERROR.DEFAULT);
				deferred.reject();
				/* develblock:start */
				console.warn('Error reading file with HTML5 API');
				/* develblock:end */
			}
		}
		// Automatically resolve Promise if FileReader is not available or it is disabled
		else {
			deferred.resolve();
		}

		return deferred.promise();
	},

	/**
	 * Does all the validation jobs based on the given validation object:
	 * - File extension
	 * - File size
	 * - Image resolution
	 *
	 * @returns {jQuery.Deferred.promise}
	 * @private
	 */
	_validate : function() {
		var deferred = new $.Deferred();

		this.pluginDatas.forEach(function(file, index) {
			file = file.files[0];
			$.each(this.options.validate, function (key, value) {
				switch (key) {
					case HTML5Uploader.VALIDATE.EXTENSION:
						this._validateExtension(file, value);
						break;
					case HTML5Uploader.VALIDATE.SIZE:
						this._validateSize(file, value);
						break;
					case HTML5Uploader.VALIDATE.RESOLUTION:
						var files = this.pluginData.originalFiles || new Array(2); // haha
						this._validateResolution(
							file,
							value,
							this.readerResults[file.name],
							deferred,
							files.length - 1 === index
						);
						break;
					case HTML5Uploader.VALIDATE.FILENAME:
						this._validateFilename(file.name, value);
						break;
					default: break;
				}
			}.bind(this));
		}.bind(this));

		if (!this.options.validate[HTML5Uploader.VALIDATE.RESOLUTION]) {
			if (!this._errors.length) {
				deferred.resolve();
			}
			if (this._errors.length) {
				deferred.reject();
			}
		}
		else if (this._errors.length) {
			deferred.reject();
		}

		return deferred.promise();
	},

	/**
	 * Validates a files extension
	 *
	 * @param file       {File}  File object.
	 * @param extensions {Array} Array of valid extensions.
	 * @private
	 */
	_validateExtension : function(file, extensions) {
		var extension = file.name.split('.').pop();
		if (!(extensions.indexOf(extension.toLowerCase()) + 1)) { // "Mindfuck" @saidby nlite - oh yeah @szokasos
			this._addError(file.name, HTML5Uploader.ERROR.WRONG_FILE_EXTENSION);
		}
	},

	/**
	 * Validates file size.
	 *
	 * @param file  {File}  File object.
	 * @param sizes {Array} Valid sizes.
	 * @private
	 */
	_validateSize : function(file, sizes) {
		sizes = Object.assign({ min : 1, max : 0 }, sizes);

		if (file.size > sizes.max) {
			this._addError(file.name, HTML5Uploader.ERROR.FILE_SIZE_TOO_BIG);
		}
		else if (file.size < sizes.min) {
			this._addError(file.name, HTML5Uploader.ERROR.FILE_SIZE_TOO_SMALL);
		}
	},

	/**
	 * Validates filename length.
	 *
	 * @param fileName {string} Name of the file
	 * @param rules    {object} Rules from the validation object.
	 * @private
	 */
	_validateFilename : function(fileName, rules) {
		$.each(rules, function(key, value) {
			switch (key) {
				case 'max':
					if (fileName.length > value) {
						this._addError(fileName, HTML5Uploader.ERROR.FILENAME_TOO_LONG);
					}
					break;
				case 'min':
					if (fileName.length < value) {
						this._addError(fileName, HTML5Uploader.ERROR.FILENAME_TOO_SHORT);
					}
					break;
			}
		}.bind(this));
	},

	/**
	 * Validates an image"s resolution.
	 *
	 * @param file       {File}   File object.
	 * @param resolution {Array}  Array of valid values.
	 * @param dataURI    {String} Base64 version of the image.
	 * @param deferred   {jQuery.Deferred.promise}
	 * @param resolve    {Boolean} Should we resolve deferred after checking?
	 * @private
	 */
	_validateResolution : function(file, resolution, dataURI, deferred, resolve) {
		// No size if it's blacklisted
		if (HTML5Uploader.VALIDATION_BLACKLIST.indexOf(file.name.split('.').pop()) + 1) {
			deferred.resolve();
			return;
		}

		resolution = Object.assign({
			min_width  : 0,
			min_height : 0,
			max_width  : 99999,
			max_height : 99999
		}, resolution);

		// Add error if image is not loaded after 10seconds (for example pdf renamed to jpg)
		var imageNotLoadedTimeOut = setTimeout(function() {
			this._addError(file.name, HTML5Uploader.ERROR.WRONG_FILE_EXTENSION);
			deferred.reject();
		}.bind(this), 5000);

		var img = new Image();
		img.onload = function(ev) {
			clearTimeout(imageNotLoadedTimeOut);
			var photoWidth = ev.target.naturalWidth;
			var photoHeight = ev.target.naturalHeight;
			var isLandscape = photoWidth > photoHeight;
			var rules = {
				IMAGE_MIN_WIDTH : function () {
					var resolutionMinWidth = isLandscape ? resolution.min_width : resolution.min_height;

					return photoWidth < resolutionMinWidth && { minWidth : resolutionMinWidth };
				},

				IMAGE_MIN_HEIGHT : function () {
					var resolutionMinHeight = isLandscape ? resolution.min_height : resolution.min_width;

					return photoHeight < resolutionMinHeight && { minHeight : resolutionMinHeight };
				},

				IMAGE_MAX_WIDTH : function () {
					return photoWidth > resolution.max_width;
				},

				IMAGE_MAX_HEIGHT : function () {
					return photoHeight > resolution.max_height;
				}
			};

			$.each(rules, function (errorName, rule) {
				var errorTemplate = rule();

				if (errorTemplate) {
					this._addError(file.name, HTML5Uploader.ERROR[errorName], errorTemplate);
				}
			}.bind(this));

			if (resolve && this._errors.length) {
				deferred.reject();
			}
			else if (resolve) {
				deferred.resolve();
			}
		}.bind(this);

		// 0 byte file
		if (dataURI === 'data:') {
			deferred.reject();
			delete img.onload;
			return;
		}

		img.src = dataURI;
	},

	/**
	 * Adds a new error to our error list.
	 *
	 * @param {String} key Error key. Becomes error message if `value` is not provided.
	 * @param {String} [value] Error message.
	 * @param {Object} [customTemplate] Object which extend errors template.
	 * @private
	 */
	_addError : function(key, value, customTemplate) {
		var errorTemplates;

		customTemplate = typeof customTemplate === 'object' ? customTemplate : {};

		errorTemplates = $.extend({
			filenameMax : this.validate && this.validate.filename && this.validate.filename.max
				? this.validate.filename.max : '',
			filenameMin : this.validate && this.validate.filename && this.validate.filename.min
				? this.validate.filename.min : '',
			maxSize : this.validate && this.validate.size && this.validate.size.max
				? this.validate.size.max / 1024 / 1024 : '',
			minSize : this.validate && this.validate.size && this.validate.size.min
				? this.validate.size.min / 1024 / 1024 : '',
			totalSize : this.validate && this.validate.size && this.validate.size.total
				? this.validate.size.total / 1024 / 1024 : '',
			extensions : this.validate && this.validate.extensions ? this.validate.extensions.join(', ') : '',
			minWidth   : this.validate && this.validate.resolution && this.validate.resolution.min_width
				? this.validate.resolution.min_width : '',
			maxWidth : this.validate && this.validate.resolution && this.validate.resolution.max_width
				? this.validate.resolution.max_width : '',
			minHeight : this.validate && this.validate.resolution && this.validate.resolution.min_height
				? this.validate.resolution.min_height : '',
			maxHeight : this.validate && this.validate.resolution && this.validate.resolution.max_height
				? this.validate.resolution.max_height : ''
		}, customTemplate);

		if (value) {
			var err = {},
				message = this.options.errorMessages[value] || this.options.errorMessages.default;

			err[key] = message.tpl(errorTemplates);
			this._errors.push(err);
		}
		else {
			this._errors.push((this.options.errorMessages[key] || key).tpl(errorTemplates));
		}
	},

	/**
	 * Does preparation jobs:
	 * - Check MultiLimit
	 * - Read file with FileReader.
	 * - Do validation.
	 *
	 * @private
	 */
	_prepare : function() {
		if (this.isLimitExceeded()) {
			this._addError(HTML5Uploader.ERROR.FILE_LIMIT_EXCEEDED);
			this.fireEvent(HTML5Uploader.EV.PREPARE_FAIL, {
				uploaderInstance : this,
				errors           : this._errors,
				abort            : true
			});
			return;
		}
		$.when(this._readFile())
			.done(function(e) {
				setTimeout(function() { // This async scope will let FileReader to finish pushing
					$.when(this._validate())
						.always(function() {
							if (!this._errors.length) {
								this.fireEvent(HTML5Uploader.EV.PREPARE_OK, {
									ev      : e,
									results : this.readerResults
								});
							}
							else {
								setTimeout(function() {
									this.fireEvent(HTML5Uploader.EV.PREPARE_FAIL, {
										ev               : e,
										uploaderInstance : this,
										errors           : this._errors,
										results          : this.readerResults
									});
								}.bind(this), 250);
							}
						}.bind(this));
				}.bind(this), 250);
			}.bind(this))
			.fail(function() {
				this.fireEvent(HTML5Uploader.EV.PREPARE_FAIL, {
					uploaderInstance : this,
					errors           : this._errors
				});
			}.bind(this));
	},

	/**
	 * Callback when preparation was OK.
	 *
	 * @private
	 */
	_onPrepareok : function() {
		this.getTokens();
	},

	/**
	 * Callback when preparation was FAILED.
	 *
	 * @private
	 */
	_onPreparefail : function(ev) {
		if (ev.abort) {
			return;
		}
		if (this.options.continueOnError) {
			ev.errors.forEach(function(err) {
				this.removeByFileName(Object.keys(err)[0]);
			}, this);

			if (this.pluginDatas.length) {
				this.getTokens();
			}
		}
	},

	/**
	 * Remove a file from pluginDatas stream by fileName.
	 *
	 * @param fileName
	 */
	removeByFileName : function(fileName) {
		this.pluginDatas.forEach(function(data, index) {
			if (data.files[0].name === fileName) {
				this.pluginDatas.splice(index, 1);
				this.fireEvent(HTML5Uploader.EV.DONE, data);
			}
		}, this);
	},

	_dataURItoBlob : function (dataURI, type) {
		// convert base64 to raw binary data held in a string
		// doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
		var byteString = atob(dataURI.split(',')[1]);

		// write the bytes of the string to an ArrayBuffer
		var ab = new ArrayBuffer(byteString.length);
		var ia = new Uint8Array(ab);
		for (var i = 0; i < byteString.length; i++) {
			ia[i] = byteString.charCodeAt(i);
		}

		// write the ArrayBuffer to a blob, and you're done
		return new Blob([ab], {
			type : type
		});
	},

	/**
	 * Callback after we got the tokens.
	 *
	 * @private
	 */
	_onGettokensok : function() {
		this.pluginDatas.forEach((v, index) => {
			this.send(index);
		});
	},

	/**
	 * Callback after the input field is changed.
	 *
	 * @private
	 */
	_onBeforeChange : function() {
		this.readerResults = {};
		this.pluginDatas = [];
		this._errors = [];
		this._tokens = [];
		this._prepare();
	},

	/**
	 * Callback for each individual file adding.
	 *
	 * @param ev
	 * @private
	 */
	_onBeforeAdd : function(ev) {
		ev.originalFiles = ev.originalFiles || ev.files;
		this.pluginDatas.push(ev);
	},

	/**
	 * Callback when the file got submit.
	 *
	 * @private
	 */
	_onBeforeSubmit : function() {
		this._abortProcess();
	},

	/**
	 * Drop callback if Drag&Drop enabled
	 *
	 * @param ev {Object} Event object
	 * @private
	 */
	_onDrop : function(ev) {
		ev.originalEv.preventDefault();
		var files = ev.originalFiles = ev.originalFiles || ev.files;
		if (!this.isVisible()) {
			return false;
		}
		this.fireEvent('change', ev);

		for (var i = 0, l = ev.originalFiles.length; i < l; i++) {
			this.fireEvent('add', {
				originalFiles : [files[i]],
				files         : [files[i]]
			});
		}
	},

	/**
	 * Attaches events.
	 */
	bind : function() {
		$.each(HTML5Uploader.EV, function(key, value) {
			var fnc = value.ucFirst();

			if (this['_onBefore' + fnc]) {
				this.on(value, this['_onBefore' + fnc], this);
			}

			if (this['_on' + fnc]) {
				this.on(value, this['_on' + fnc], this);
			}

			if (this['_onAfter' + fnc]) {
				this.on(value, this['_onAfter' + fnc], this);
			}
		}.bind(this));
	},

	/**
	 * Removes events.
	 */
	unbind : function() {
		$.each(HTML5Uploader.EV, function(key, value) {
			var fnc = value.ucFirst();
			if (this['_onBefore' + fnc]) {
				this.off(value, this['_onBefore' + fnc], this);
			}

			if (this['_on' + fnc]) {
				this.off(value, this['_on' + fnc], this);
			}

			if (this['_onAfter' + fnc]) {
				this.on(value, this['_onAfter' + fnc], this);
			}
		}.bind(this));
	}

});
