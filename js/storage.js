// Handles all of the chrome.storage apis
// as localStorage is unavailable in packaged apps

var async = require('./async');

// The synced storage area
var AREA_SYNC = 'sync';
// The local storage area
var AREA_LOCAL = 'local';
// The managed storage area
var AREA_MANAGED = 'managed';

// The current area we are editing
var AREA = '';

// Objects we share to avoid creating extra garbage
var SHARED_OBJECT = {};
var SHARED_ARRAY = [];

// The event id for the onChanged event
var ON_CHANGED_EVENT = 0;

var EDIT_MODE_NONE = 0;
var EDIT_MODE_GETTING = 1;
var EDIT_MODE_SETTING = 2;
var EDIT_MODE_REMOVING = 3;
var EDIT_MODE = EDIT_MODE_NONE;

module.exports = {

	// Start making changes to the given area
	// must be called before using set
	// Returns true if the given area exists
	begin: function(area){
		if (chrome.storage && (area == AREA_SYNC || area == AREA_LOCAL)) {
			clearEdits();
			AREA = area;
			return 1;
		}
		return 0;
	},

	// Gets the given key from the current storage area
	// Must be called between a begin/end block
	get: function(key){
		if (checkEditMode(EDIT_MODE_GETTING)) {
			SHARED_ARRAY.push(key);
			return 1;
		}
		return 0;
	},

	// Sets the given key to the given value
	// Must be called between a begin/end block
	set: function(key, value){
		if (checkEditMode(EDIT_MODE_SETTING)) {
			SHARED_OBJECT[key] = value;
			return 1;
		}
		return 0;
	},

	// Removes values from the given storage area
	// Must be called between a begin/end block
	remove: function(key){
		if (checkEditMode(EDIT_MODE_REMOVING)) {
			SHARED_ARRAY.push(key);
			return 1;
		}
		return 0;
	},

	// Commits / Fetches changes made to the storage area
	end: function(){
		var ev = async.deferResponse();
		if (checkStoragePermissions(ev) && AREA != '') {
			switch (EDIT_MODE) {

				// If we are getting values, then load those keys
				case EDIT_MODE_GETTING:
					chrome.storage[AREA].get(SHARED_ARRAY, getKeysResponseFactory(ev));
					break;

				// If we were setting values, then save those edits
				case EDIT_MODE_SETTING:
					chrome.storage[AREA].set(SHARED_OBJECT, function saveComplete(){
						var res = async.provideResponse(ev);
						if (chrome.runtime.lastError) {
							res.error = chrome.runtime.lastError.message;
							res.result = 0;
						} else {
							res.error = "";
							res.result = 1;
						}
					});
					break;

				// If we are removing values, then remove the keys
				case EDIT_MODE_REMOVING:
					chrome.storage[AREA].remove(SHARED_ARRAY, function removedValues(values){
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
					break;

				case EDIT_MODE_NONE:
					console.warn('Chrome storage cannot commit changes, no changes were made');
					break;
			}
		}
		clearEdits();
		return ev;
	},

	// Gets all keys for a given storage area
	getAll: function(area){
		var ev = async.deferResponse();
		if (checkStoragePermissions(ev)) {
			chrome.storage[area].get(null, getKeysResponseFactory(ev));
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
	},

	// Returns a handle for the on-changed event
	onChanged: function(){
		console.log("On Changed");
		if (ON_CHANGED_EVENT == 0 && chrome.storage) {
			console.log("Adding storage onchanged listener");
			ON_CHANGED_EVENT = async.deferResponse();
			chrome.storage.onChanged.addListener(function onChanged(changes, area){
				console.log("Storage changed",changes,area);
				var res = async.provideResponse(ON_CHANGED_EVENT);
				res.area = area;
				for (var key in changes) {
					res[key] = changes[key].newValue;
				}
			});
		}
		return ON_CHANGED_EVENT;
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

// Checks that the current edit mode matches the requested edit mode
// or is set to 'none'
function checkEditMode(editMode){
	if (EDIT_MODE == EDIT_MODE_NONE){
		EDIT_MODE = editMode;
		return true;
	} else if (EDIT_MODE == editMode) {
		return 1;
	} else {
		console.error('Chrome storage ignoring command, you must not mix get/set/remove statements within a single begin/end block.');
		return 0;
	}
}

// Clears the shared objects for reuse
function clearEdits(){
	for (var key in SHARED_OBJECT) {
		delete SHARED_OBJECT[key];
	}
	SHARED_ARRAY.length = 0;
	EDIT_MODE = EDIT_MODE_NONE;
	AREA = '';
}

// Returns a function that responds to a 'get' request
// to chrome.storage. Used to create identical response
// behaviour between get and getAll
function getKeysResponseFactory(ev){
	return function gotValues(values){
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
	}
}