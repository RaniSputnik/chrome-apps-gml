// ===========================================
// chrome.runtime functions
// ===========================================

var async = require('./async');

module.exports = {

	// Returns a string of JSON read from the manifest file
	getManifest: function(){
		return JSON.stringify(chrome.runtime.getManifest(), null, '\t');
	},

	// Reloads the game
	reload: function(){
		return chrome.runtime.reload();
	},

	// Checks if there is an upate to the game available
	// on the Chrome web store
	requestUpdateCheck: function(){
		var ev = async.deferResponse();
		chrome.runtime.requestUpdateCheck(function(status, details){
			var res = async.provideResponse(ev);
			res.status = status;
			res.version = (details && details.version)? details.version : "";
		});
		return ev;
	}
};