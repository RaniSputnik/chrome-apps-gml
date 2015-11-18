var async = require('./async');

module.exports = {
	// Returns whether or not the game is currently being run as a chrome app
	isApp: function(){
		return (chrome && chrome.app && chrome.app.window)? 1 : 0;
	},

	// Loads a file from the app package
	packageLoad: function(file){
		var ev = async.deferResponse();
		chrome.runtime.getPackageDirectoryEntry(function onGotDirectoryEntry(dirEntry){
			console.log("Got package directory entry", dirEntry);
			var path = file.split('/');
			findFile(dirEntry, path);
		});

		function findFile(dirEntry, path){
			console.log("Find file",dirEntry,path);
			if (path.length > 1) {
				var dirName = path.shift();
				console.log("Entering directory named",dirName);
				dirEntry.getDirectory(dirName, { create: false }, function onGetDir(nextDirEntry){
					findFile(nextDirEntry,path);
				}, genericFailure);
			} else {
				dirEntry.getFile(path[0], { create: false }, function onGetFile(fileEntry){
					console.log("Got file entry", fileEntry);
					fileEntry.file(function(file) {
						console.log("Got file",file);
					    var reader = new FileReader();
					    reader.onerror = genericFailure;
					    reader.onload = function(e) {
					    	console.log("Loaded bundled file successfully",e);
					    	var res = async.provideResponse(ev);
					    	res.result = e.target.result;
					    	res.error = "";
					    };
					    reader.readAsText(file);
					});
				}, genericFailure);
			}
		}

		function genericFailure(error){
			console.error("Getting included file failed", error);
			var res = async.provideResponse(ev);
			res.result = "";
			res.error = e.message;
		}
		return ev;
	},

	// Converts a GameMaker datetime to timestamp
	datetimeToTimestamp: function(datetime){
		return (datetime - 25569) * 864000;
	},

	// Converts a Unix timestamp to a GameMaker datetime
	timestampToDatetime: function(timestamp){
		return 25569 + timestamp * 0.000011574070;
	}
}
