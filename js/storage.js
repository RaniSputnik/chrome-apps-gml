// Handles all of the chrome.storage apis
// as localStorage is unavailable in packaged apps

var async = require('./async');

// The synced storage area
var AREA_SYNC = 'sync';
// The local storage area
var AREA_LOCAL = 'local';
// The managed storage area
var AREA_MANAGED = 'managed';

// The current edits that have been made
var EDITS = {};
// The current area we are editing
var AREA = '';

// An array we share to avoid creating extra garbage
var SHARED_ARRAY = [];

// TODO stub window.localStorage to prevent error messages

// TODO add an event for storage.onChanged

module.exports = {

	// Gets values from the given storage area, you can specify as many
	// keys as you like by using get(area, key,key,key...)
	get: function(){
		var ev = async.deferResponse();
		if (checkStoragePermissions(ev)) {
			var area = arguments[0];
			SHARED_ARRAY.length = 0;
			for (var i = 1, n = arguments.length; i < n; i++) {
				SHARED_ARRAY.push(String(arguments[i]))
			}
			chrome.storage[area].get(SHARED_ARRAY, function gotValues(values){
				var res = async.provideResponse(ev);
				if (chrome.runtime.lastError) {
					// If an error occurred, add that to the result
					res.error = chrome.runtime.lastError.message;
					res.result = 0;
				} else {
					// Copy the results into the response
					res.error = "";
					res.result = 1;
					for (var key in values) {
						res[key] = values[key];
					}
				}
			});
		}
		return ev;
	},

	// Start making changes to the given area
	// must be called before using set
	// Returns true if the given area exists
	begin: function(area){
		if (chrome.storage && (area == AREA_SYNC || area == AREA_LOCAL)) {
			AREA = area;
			for (var key in EDITS) {
				delete EDITS[key];
			}
			return 1;
		}
		return 0;
	},

	// Sets the given key to the given value
	set: function(key, value){
		EDITS[key] = value;
	},

	// Commits changes made to the storage area
	save: function(){
		var ev = async.deferResponse();
		if (checkStoragePermissions(ev)) {
			chrome.storage[AREA].set(EDITS, function saveComplete(){
				var res = async.provideResponse(ev);
				if (chrome.runtime.lastError) {
					res.error = chrome.runtime.lastError.message;
					res.result = 0;
				} else {
					res.error = "";
					res.result = 1;
				}
			});
		}
		AREA = '';
		return ev;
	},

	// Removes values from the given storage area, you can specify as many
	// keys as you like by using remove(area, key,key,key...)
	remove: function(){
		var ev = async.deferResponse();
		if (checkStoragePermissions(ev)) {
			var area = arguments[0];
			SHARED_ARRAY.length = 0;
			for (var i = 1, n = arguments.length; i < n; i++) {
				SHARED_ARRAY.push(String(arguments[i]))
			}
			chrome.storage[area].remove(SHARED_ARRAY, function removedValues(values){
				var res = async.provideResponse(ev);
				if (chrome.runtime.lastError) {
					// If an error occurred, add that to the result
					res.error = chrome.runtime.lastError.message;
					res.result = 0;
				} else {
					// Copy the results into the response
					res.error = "";
					res.result = 1;
				}
			});
		}
		return ev;
	},

	// Clears an entire storage area
	clear: function(area){
		var ev = async.deferResponse();
		if (checkStoragePermissions(ev)) {
			chrome.storage[area].clear(function onCleared(){
				var res = async.provideResponse(ev);
				if (chrome.runtime.lastError) {
					res.error = chrome.runtime.lastError.message;
					res.result = 0;
				} else {
					res.error = "";
					res.result = 1;
				}
			});
		}
		return ev;
	}
};

// Checks for the chrome.storage object and provides an error response
// for the given event if it is not found
function checkStoragePermissions(ev){
	if (!chrome.storage) {
		var res = async.provideResponse(ev);
		res.error = "Missing 'storage' permission, no storage areas available";
		res.result = 0;
		return false;
	}
	return true;
}