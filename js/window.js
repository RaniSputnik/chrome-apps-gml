module.exports = {
	// Gets the current window
	getCurrent: function(){
		return chrome.app.window.current().id;
	},

	// Focuses a window with the given id
	focus: function(id){
		return doWinCommand(id, 'focus');
	},

	// Closes a window with the given id
	close: function(id){
		return doWinCommand(id, 'close');
	},

	// Shows a window with the given id
	show: function(id){
		return doWinCommand(id, 'show');
	},

	hide: function(id){
		return doWinCommand(id, 'hide');
	}
};

// Performs a basic function on a window with the given id
// Returns 1 if the function was applied successfully, otherwise
// 0 will be returned if the window does not exist
function doWinCommand(id, command, args){
	var w = chrome.app.window.get(id);
	if (w) {
		w[command].apply(w, args);
		return 1;
	} else {
		return 0;
	}
}