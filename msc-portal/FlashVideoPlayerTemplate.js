import Ext from '../../lib/vendor/ExtCore';
import Template from '../../lib/chaos/Template';

/**
 * FlashVideoPlayerTemplate
 * -----------------------
 *
 * Store FlashVideoPlayerTemplate Template
 * Set template config params
 *
 */
export default function FlashVideoPlayerTemplate (config) {
	FlashVideoPlayerTemplate.superclass.constructor.call(this, config);
}

Ext.extend(FlashVideoPlayerTemplate, Template, {

	/** @var {string}   html string */
	tpl : '<object id="{id}" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=7,0,19,0" width="100%" height="100%">' +
	'<param name="movie" value="{playerSrc}" />' +
	'<param name="allowScriptAccess" value="always" />' +
	'<param name="scale" value="noscale" />' +
	'<param name="FlashVars" value="videourl={videoUrl}&appletskin={contolSrc}&volumevisible={volumeVisible}&autostart=1&controlvisible=1&pauseenable=1&rendermode=' + (Ext.isChrome ? 'classic' : 'stagevideo') + '" />' + //eslint-disable-line
	'<param name="quality" value="high" />' +
	'<param name="wmode" value="transparent" />' +
	'<param name="bgcolor" value="#000000" />' +
	'<embed src="{playerSrc}" quality="high" bgcolor="#000000" wmode="transparent" pluginspage="http://www.macromedia.com/go/getflashplayer" type="application/x-shockwave-flash" id="{id}_embed" name="{id}" allowScriptAccess="always" scale="noscale" flashvars="videourl={videoUrl}&appletskin={contolSrc}&volumevisible={volumeVisible}&autostart=1&controlvisible=1&pauseenable=1&rendermode=' + (Ext.isChrome ? 'classic' : 'stagevideo') + '" width="100%" height="100%"></embed>' +
	'</object>',

	/**
	 * Initializer
	 *
	 * @return void;
	 */
	init : function() {
		FlashVideoPlayerTemplate.superclass.init.call(this);
	},

	/**
	 * Sets params for template to render.
	 *
	 * @param {Object} data   Apply template params
	 *
	 * @return object;
	 */
	_setTemplateParams : function(data) {
		return data;
	}
});


