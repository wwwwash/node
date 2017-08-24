import Ext from '../../lib/vendor/ExtCore';
import Chaos from '../../lib/chaos/Chaos';
import Config from '../../lib/chaos/Config';
import ChaosObject from '../../lib/chaos/Object';

/**
 * Copy2Clipboard
 * Needs a wrapper for the button. The applet will be inserted there with 100%/100% height and width.
 */
export default function Copy2Clipboard(el, config) {
	Copy2Clipboard.superclass.constructor.call(this, el, config);
}

Copy2Clipboard.instance = undefined;
Copy2Clipboard.EVENT_TEXT_COPIED = 'text-copied';

Chaos.extend(Copy2Clipboard, ChaosObject, {
	/** @var {Object} textSourceEl              The element which we will get the source text from */
	textSourceEl : undefined,

	/** @var {Object} _appletId                 ID of the applet */
	_appletId : 'copy2clipboard',

	/** @var {Object} _appletEl                 Applet element */
	_appletEl : undefined,

	/** @var {String} _appletHTML               HTML template of the flash object */
	_appletHTML : `<object id="copy2clipboard" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=9,0,0,115" width="100%" height="100%">
		<param name="movie" value="{swfURL}" />
		<param name="quality" value="high" />
		<param name="allowscriptaccess" value="always" />
		<param name="allowNetworking" value="all" />
		<param name="allowfullscreen" value="false" />
		<param name="bgcolor" value="#000" />
		<param name="wmode" value="transparent" />
		<param name="flashvars" value="jsObject=Copy2Clipboard.instance" />
		<embed src="{swfURL}" width="100%" height="100%" allowscriptaccess="always" allowfullscreen="false" allownetworking="all" bgcolor="#000" quality="high" wmode="transparent" pluginspage="http://www.macromedia.com/go/getflashplayer" type="application/x-shockwave-flash" flashvars="jsObject=Copy2Clipboard.instance"/>
	</object>`,


	/**
	 * Init
	 *
	 * @param {Element} el      This should be the body tag
	 * @param {Object} config   Config object of this component
	 */
	init : function(el, config) {
		this.addEvents(Copy2Clipboard.EVENT_TEXT_COPIED);

		Copy2Clipboard.instance = this;

		this.prepareAppletTemplate();
		this.appendApplet();

		Copy2Clipboard.superclass.init.call(this, el, config);
	},

	/**
	 * Append the flash object template to the button wrapper
	 */
	appendApplet : function() {
		// We don't need another instance
		if (this._appletEl = Ext.get(this._appletEl)) {
			return;
		}
		this.element.insertHtml('beforeEnd', this._appletHTML);
		this._appletEl = Chaos.getFlashMovieObject(this._appletId);
	},

	/**
	 * Prepare the object template, replace variables
	 */
	prepareAppletTemplate : function() {
		var swf = Config.get('clipboardSwfUrl');
		this._appletHTML = this._appletHTML.replace(/{swfURL}/g, swf);
	},

	/**
	 * Called by applet, retrives the text to be copied to the clipboard
	 */
	getText : function() {
		this.fireEvent(Copy2Clipboard.EVENT_TEXT_COPIED);
		this._appletEl.setText(this.textSourceEl.dom.value);
	},

	/**
	 * Esemenykezelok feliratkozasa
	 */
	bind : function() {
		Copy2Clipboard.superclass.bind.call(this);
	},

	/**
	 * Esemenykezelok torlese
	 */
	unbind : function() {
		Copy2Clipboard.superclass.unbind.call(this);
	}
});