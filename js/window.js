module.exports = {
	// Gets the current window
	getCurrent: function(){
		return chrome.app.window.current().id;
	},

	// Fullscreens the window with the given id
	fullscreen: function(id){
		doWinCommand(id, 'fullscreen');
	},

	// Returns whether or not the window with the given id is currently fullscreen
	isFullscreen: function(id){
		return doWinCommand(id, 'isFullscreen');
	},

	// Restores the window back to a non-fullscreen, non-minimised/maximised state
	restore: function(id){
		doWinCommand(id, 'restore');
	},

	// Focuses a window with the given id
	focus: function(id){
		doWinCommand(id, 'focus');
	},

	// Closes a window with the given id
	close: function(id){
		doWinCommand(id, 'close');
	},

	// Shows a window with the given id
	show: function(id){
		doWinCommand(id, 'show');
	},

	hide: function(id){
		doWinCommand(id, 'hide');
	},

	// Sets the position of the window
	setPos: function(id){
		var w = chrome.app.window.get(id);
		if (w) {
			w.outerBounds.left = w;
			w.outerBounds.top = h;
		} else {
			errorNoWindowWithId(id, 'setSize');
		}
	},

	// Sets the size of the window with the given id
	setSize: function(id, w, h){
		var w = chrome.app.window.get(id);
		if (w) {
			w.innerBounds.width = w;
			w.innerBounds.height = h;
		} else {
			errorNoWindowWithId(id, 'setSize');
		}
	}
};

// Performs a basic function on a window with the given id
// Returns 1 if the function was applied successfully, otherwise
// 0 will be returned if the window does not exist
function doWinCommand(id, command, args){
	var w = chrome.app.window.get(id);
	if (w) {
		return w[command].apply(w, args);
	} else {
		errorNoWindowWithId(id, command);
	}
}

// Reports that there was no 
function errorNoWindowWithId(id, command){
	console.error(command+" failed, no window with the id '"+id+"' was found.");
}