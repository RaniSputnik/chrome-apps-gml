// ===========================================
// Chrome Web Store Licensing API
// https://developer.chrome.com/webstore/one_time_payments
// Must add "identity" permission to manifest
// Must generate OAuth client id for application
// ===========================================
// Common problems
// Missing 'identity' permission in manifest - Add permission: ["identity"] to manifest
// OAuth2 not granted or revoked - Failed silently, you will need to use interactive=true
// Invalid OAuth2 Client ID - client_id in oauth section of manifest is missing or invalid

var async = require('./async');
var xhrWithAuth = require('./xhrWithAuth');

// The base URL for loading user licenses
var LICENSE_API_URL = 'https://www.googleapis.com/chromewebstore/v1.1/userlicenses/';

module.exports = {
	// Start loading the Chrome license
	load: function(interactive) {

		// TODO cache the response so that we don't need to check everytime
		// use the maxAgeSecs property in the response to help sync the value
		// https://developer.chrome.com/webstore/one_time_payments#cache-response

		var ev = async.deferResponse();
		xhrWithAuth('GET', LICENSE_API_URL + chrome.runtime.id, !!interactive, 
		function onLicenseFetched(error, status, response){
			// Default response properties
			var res = async.provideResponse(ev);
			res.result = false;
			res.error = "";
			res.createdTime = 0;
			res.accessLevel = "NONE";

			if (error != null) {
				console.error('License check failed',error);
				res.error = error;
			}
			else {
				if (status === 200) {
					console.log('Received response from license server', error, status, response);
					try {
						response = JSON.parse(response);
					} catch(e) {
						return res.error = "Invalid response from license server";
					}
					res.result = response.result? 1 : 0;
					if (response.createdTime) {
						res.createdTime = response.createdTime;
					}
					if (response.accessLevel) {
						res.accessLevel = response.accessLevel;
					}
				} else {
					res.error = "License request got a " + status + " response";
				}
			}
		});
		return ev;
	}
};