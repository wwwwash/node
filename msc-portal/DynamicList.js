import Chaos from '../../lib/chaos/Chaos';

import Connection from '../../lib/chaos/Connection';
import AbstractSuggestionList from './AbstractList';

export default function DynamicSuggestionList(el, config) {
	DynamicSuggestionList.superclass.constructor.call(this, el, config);
}

Chaos.extend(DynamicSuggestionList, AbstractSuggestionList, {

    /** @property {string}    Service routing for suggestion list ajax request */
	tagSuggestAjaxRoute : 'MusicLibrary/Search',

    /**
     * Loads all tags from remote source according to keyword
     * @param {string} keyword
     * @param {function} done
     * @private
     */
	_prepareList : function(keyword, done) {
		Connection.Ajax.request({
			url : Chaos.getUrl(this.tagSuggestAjaxRoute, this.config && this.config.routeParams || {}, {
				searchText : keyword,
				page       : this.currentPage
			}),
			scope   : this,
			success : function(response) {
				var data = response.json.data;
				done(null, data.songs);
			},
			error : done
		});
	}
});
