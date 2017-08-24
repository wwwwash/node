import Ext from '../vendor/ExtCore';
import ChaosCookie from './Cookie';

/**
 * ChaosStorage [Singleton]
 *
 * For storing data using browser's localStorage if it is supported by the current browser.
 *
 * If localStorage is not supported, data will stored in cookies, using Chaos.Cookie.
 *
 * It allows you to:
 *		* store any data [even valid objects as a value]
 *		* remove entries by their names
 *		* create groups for classify your data
 *		* select entries via groups [searching in groups]
 *		* delete groups [and its all contents]
 *		* delete all entries from localStorage [be careful :)]
 *
 */
export default ChaosStorage = function(isSessionStorage) {
	// Private members

	// Checks if localStorage is defined
	var checkLocalStorage = function() {
		try {
			return typeof window.localStorage !== 'undefined';
		}
		catch (exception) {
			return false;
		}
	};

	var storageObj = isSessionStorage ? window.sessionStorage : window.localStorage;

	return {

		// Public members

		/**
		 * Retrieves with TRUE, if local storage feature is supported by the current browser
		 *
		 * @return {Boolean}   TRUE, if local storage feature is supported by the current browser
		 */
		hasLocalStorage : function() {
			return checkLocalStorage();
		},

		/**
		 * Is SessionStorage is used or not
		 * @returns {boolean}
		 */
		isSessionStorage : function () {
			return storageObj === window.sessionStorage;
		},

		/**
		 * Tries to set a new entry in local storage. If the given value is an object, it encodes to a JSON string that
		 * can be stored our object as a string, preserving our data.
		 * Fallback option: if localStorage is not supported by the current browser it stores the given value in
		 * a new cookie with a name that given amongst the arguments.
		 *
		 * @param {String} name      Name (or key) of a new entry
		 * @param {String} value     Value of a new entry
		 * @param {String} groupId   ID of a group [optional] - If it is given a new group will be created and passed
		 *                           the content, or if this group is alredy exists value will be stored in this existing group
		 *                           If groupId is set you must pass it when you try to get this entry!
		 *
		 * @return {Boolean}   True, if storing was successfull
		 */
		set : function(name, value, groupId) {
			var _value = value, _success = false, _entries;
			// If localStorage is available
			if (this.hasLocalStorage()) {
				// If we need to store in a group
				if (groupId) {
					// If given group is not exist yet
					if (!this.getGroup(groupId)) {
						this.setGroup(groupId);
					}
					_entries = Ext.util.JSON.decode(storageObj[groupId]);
					_entries[name] = value;
					_value = Ext.util.JSON.encode(_entries);
					storageObj[groupId] = _value;
					_success = true;
				}
				else {
					// Encode to json if value is an object
					_value = typeof value === 'object' ? Ext.util.JSON.encode(value) : value;
					storageObj[name] = _value;
					_success = true;
				}
				/* develblock:start */
				if (this.get(name)) {
					console.warn('@Warning: "', name, '" property is already exists in localStorage. It is replaced by the new value.');
				}
				/* develblock:end */
			}
			return _success;
		},

		/**
		 * Sets a group to help organizing stored data.
		 * If the group is already exists it will NOT rewrite it!
		 *
		 * @param {String} groupId   ID of a group
		 *
		 * @return {Mixed}   Group content
		 */
		setGroup : function(groupId) {
			// If localStorage is available
			if (this.hasLocalStorage()) {
				if (!this.getGroup(groupId)) {
					storageObj[groupId] = Ext.util.JSON.encode({});
				}
				/* develblock:start */
				else {
					console.warn('@JS-warning: The given group is already exists in the local storage: ', groupId);
				}
				/* develblock:end */
			}
		},

		/**
		 * Gets a group and returns its content
		 *
		 * @return {Mixed}   group content if it is exists, or undefined
		 */
		getGroup : function(groupId) {
			// If localStorage is available
			if (this.hasLocalStorage()) {
				var _group = undefined;
				if (typeof storageObj[groupId] !== 'undefined') {
					try {
						_group = Ext.util.JSON.decode(storageObj[groupId]);
					}
					catch (exception) {
						_group = storageObj[groupId];
					}
				}
				return _group;
			}
			return false;
		},

		/**
		 * Removes a whole group from the stored entries.
		 *
		 * @param {String} groupId   Id of deletable group
		 *
		 * @return {Boolean}   TRUE, if removing was successfull
		 */
		removeGroup : function(groupId) {
			var _success = false;
			// If localStorage is available
			if (this.hasLocalStorage()) {
				/* develblock:start */
				if (!groupId) {
					console.error('@JS-ERROR: invalid groupId: ', groupId);
				}
				/* develblock:end */
				try {
					delete storageObj[groupId];
					_success = true;
				}
				catch (exception) {
					/* develblock:start */
					console.error('@JS-ERROR: ', exception);
					/* develblock:end */
				}
			}
			return _success;
		},

		/**
		 * Gets an entry of localStorage by its name. If it is exists, it tries to parse its value expecting to get a
		 * valid object.
		 * If localStorage is not supported by the current browser it tries to get a cookie with the given name.
		 *
		 * @param {String} name        Name of an entry
		 * @param {String} deletable   If TRUE, after accessing the entry will be deleted
		 * @param {String} groupId     ID of group we want to search the given entry [optional]
		 *
		 * @return {String|Object}     Stored value or undefined
		 */
		get : function(name, deletable, groupId) {
			var result = undefined,
				entry = undefined;

			if (this.hasLocalStorage()) {
				if (groupId) {
					try {
						entry = Ext.util.JSON.decode(storageObj[groupId])[name];
					}
					catch (exception) {
						if (this.getGroup(groupId)) {
							entry = storageObj[groupId][name];
						}
						/* develblock:start */
						else {
							console.error('@JS-ERROR: there is no registered group like this: ', groupId);
						}
						/* develblock:end */
					}
				}
				else {
					entry = storageObj[name];
				}
				if (entry) {
					// Tries to parse a json to return with a valid object
					try {
						result = Ext.util.JSON.decode(entry);
					}
					catch (exception) {
						// If parsing failed returns with the single value
						// Do not throw exception, because result must not be an encoded json string
						result = entry;
					}
					// If entry must be deleted after accessing
					if (deletable) {
						delete storageObj[name];
					}
				}
			}
			// Fallback option: tries to get stored data from cookie
			else {
				result = ChaosCookie.get(name);
				if (deletable) {
					ChaosCookie.remove(name);
				}
			}
			return result;
		},

		/**
		 * Removes an entry.
		 *
		 * @param {String} name      Name of an entry
		 * @param {String} groupId   If it is set, given entry will be searched in this group [optional]
		 *
		 * @return {Boolean}   TRUE, if removing was successfull
		 */
		remove : function(name, groupId) {
			var _success = false, _entry;
			if (this.hasLocalStorage()) {
				if (groupId && this.getGroup(groupId)) {
					try {
						_entry = Ext.util.JSON.decode(storageObj[groupId]);
						delete _entry[name];
						storageObj[groupId] = Ext.util.JSON.encode(_entry);
						_success = true;
					}
					catch (exception) {
						/* develblock:start */
						console.warn(exception);
						/* develblock:end */
					}
				}
				else {
					try {
						delete storageObj[name];
						_success = true;
					}
					catch (exception) {
						/* develblock:start */
						console.warn(exception);
						/* develblock:end */
					}
				}
			}
			return _success;
		},

		/**
		 * Removes all entries from localStorage [use responsibly]
		 *
		 * @return void
		 */
		removeAll : function() {
			// If localStorage is available
			if (this.hasLocalStorage()) {
				for (var entry in storageObj) {
					delete storageObj[entry];
				}
			}
		}
	};
};
