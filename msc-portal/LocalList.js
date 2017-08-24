import Chaos from '../../lib/chaos/Chaos';
import Connection from '../../lib/chaos/Connection';
import ChaosStorage from '../../lib/chaos/Storage';

import AbstractSuggestionList from './AbstractList';

export default function LocalSuggestionList(el, config) {
	LocalSuggestionList.superclass.constructor.call(this, el, config);
}

Chaos.extend(LocalSuggestionList, AbstractSuggestionList, {

    /** @property {string}    Storage id in the SessionStorage for the tags*/
	tagsStorageId       : 'videoContestTags',
    /** @property {string}    Service routing for suggestion list ajax request */
	tagSuggestAjaxRoute : 'MusicLibrary/GetAllMusic',

	_prepareList : function(keyword, done) {
		var data = this._getStorage();

		if (data && data.length) {
			setTimeout(done, 0, null, this._filter(keyword, data));

			return;
		}

		this._loadAllTags(function (error, tagData) {
			if (error) {
				done(error);

				return;
			}

			this._setStorage(tagData);

			done(null, this._filter(keyword, tagData));
		}.bind(this));
	},

	_getStorage : function() {
		return ChaosStorage(true).get(this.tagsStorageId);
	},

	_setStorage : function(data) {
		ChaosStorage(true).set(this.tagsStorageId, data);
	},

	_filter : function (keyword, suggestionList) {
		var results = [],
			resultsLen,
			pattern = new RegExp('(' + keyword + ')', 'i'),
			startKey = (this.currentPage - 1) * this.suggestionPerPage;

		for (var key = startKey, keyLen = suggestionList.length; key < keyLen; key++) {
			var suggestionObj = suggestionList[key];

			if (pattern.test(suggestionObj.label)) {
				resultsLen = results.push(suggestionObj);

				if (resultsLen >= this.suggestionPerPage * this.currentPage) {
					break;
				}
			}
		}

		return results;
	},

    /**
     * Loads all tags from remote source
     * @param {function} done
     * @private
     */
	_loadAllTags : function(done) {
		Connection.Ajax.request({
			url     : Chaos.getUrl(this.tagSuggestAjaxRoute, this.config.routeParams || {}),
			scope   : this,
			success : function(response) {
				done(null, response.json.data);
			},
			error : done
		});
	}
});
