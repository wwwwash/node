const P = {
	_cls : {
		hide              : 'ph-hide',
		show              : 'ph-show',
		invisibleOverflow : 'ph-invisible-overflow',
		protip            : 'protip',
		protipCommonClose : 'protip-common-close',
		input             : {
			state : {
				error : 'ph-input-state-error'
			},
			required : 'ph-input-required'
		},
		form : {
			row : 'ph-form-row'
		},
		display : {
			inlineBlock : 'ph-inline-block',
			flex        : 'ph-flex'
		},
		uploader5 : {
			main : 'uploader5'
		}
	},
	cls : function() {
		return this._cls;
	},
	screen         : undefined,
	_getScreenData : function() {
		var screenData = JSON.parse(
            removeQuotes(
                window.getComputedStyle(document.body, ':before').getPropertyValue('content')
            )
        ).size;
		return function(screen) {
			return screenData[screen];
		};
	},
	onOrientation : function(orientation) {
		if (!orientation) {
			throw 'Orientation must be set.';
		}
		if (!window.matchMedia) {
			throw 'Browser is not matchMedia compatible.';
		}

		return window.matchMedia('(orientation: ' + orientation + ')').matches;
	},
	onScreen : function(screen, direction) {
		if (!P.screen || typeof P.screen(screen) === 'undefined') {
			/* develblock:start */
			console.log(P.screen);
			console.error('Screen size does not exists: ', screen);
			/* develblock:end */
			return false;
		}

		let iw = window.innerWidth;
		let to = P.screen(screen).to;
		let from = P.screen(screen).from;

		switch (direction) {
			case P.screenDirection.up:
				return iw <= from;
			case P.screenDirection.down:
				return iw <= from;
			default:
				return iw >= from && iw <= to;
		}
	},
	_icon : {
		ok    : 'icon-ok',
		alert : 'icon-alert',
		info  : 'icon-info-circle'
	},
	icon : function() {
		return this._icon;
	},
	tag : {
		row : 'ph-row',
		col : 'ph-col'
	},
	screenDirection : {
		up   : 'up',
		down : 'down',
		only : 'only'
	}
};

export default P;

/**
 * Utility for normalize JSON
 */
var removeQuotes = function(string) {
	if (typeof string === 'string' || string instanceof String) {
		string = string.replace(/^['"]+|\s+|\\|(;\s?})+|['"]$/g, '');
	}
	return string;
};

var join = function() {
	var ret = [],
		val;
	for (var i in this) {
		val = this[i];
		if (!this.hasOwnProperty(i)) {continue}
		if (typeof val === 'string') {
			ret.push(val);
		}
	}
	return ret.join(arguments[0]);
};

P.cls.prototype = P.cls();
P.cls.prototype.join = join.bind(P._cls);
P.cls = new P.cls();

P.icon.prototype = P.icon();
P.icon.prototype.join = join.bind(P._icon);
P.icon = new P.icon();