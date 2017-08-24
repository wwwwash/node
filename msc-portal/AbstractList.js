import Chaos from '../../lib/chaos/Chaos';
import ChaosObject from '../../lib/chaos/Object';

export default function AbstractSuggestionList(el, config) {
	AbstractSuggestionList.superclass.constructor.call(this, el, config);
}

Chaos.extend(AbstractSuggestionList, ChaosObject, {

	suggestionPerPage : 15,

	currentPage : 1,

    /**
     * Filter full suggest list by the typed-in keyword
     * @returns {Array} Filtered suggestion list
     */
	getList : function(keyword, done) {
		this.currentPage = 1;
		this._prepareList(keyword, done);
	},

	nextPage : function(keyword, done) {
		this.currentPage++;
		this._prepareList(keyword, done);
	},

    /**
     * @param {string} keyword
     * @param {function} done
     * @protected
     */
	_prepareList : function (keyword, done) {
		setTimeout(done, 0, null, []);
	}
});
