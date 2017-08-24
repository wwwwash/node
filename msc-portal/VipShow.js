import riot from 'riot';

import styles from './VipShow.scss';
import logo from './vipshow.png';

riot.tag('vipshow-page', false,
	function() {
		this.styles = styles;
		this.logo = logo;
	}
);
