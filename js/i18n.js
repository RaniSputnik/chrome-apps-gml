// ===========================================
// chrome.i18n - Internationalization
// ===========================================

var async = require('./async');

module.exports = {

	// Get a message from the _locales directory in the users language
	getMessage: function(){
		return chrome.i18n.getMessage.apply(this, arguments);
	},

	// Gets the users preferred languages
	getAcceptedLanguages: function(){
		var ev = async.deferResponse();
		chrome.i18n.getAcceptLanguages(function gotAcceptedLanguages(langs){
			var res = async.provideResponse(ev);
			res.result = langs.join(",");
		});
		return ev;
	},

	// Gets the locale of the Chrome browser
	getUILanguage: function(){
		return chrome.i18n.getUILanguage();
	}
};