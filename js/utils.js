module.exports = {
	// Returns whether or not the game is currently being run as a chrome app
	isApp: function(){
		return (chrome && chrome.app && chrome.app.window)? 1 : 0;
	}
}