// xhrWithAuth - Helper Util for making authenticated XHRs
module.exports = function(method, url, interactive, callback){
	var retry = true;
	getToken();

	function getToken() {
		console.log("Calling chrome.identity.getAuthToken", interactive);
		if (chrome.identity) {
			chrome.identity.getAuthToken({ interactive: interactive }, function(token) {
				if (chrome.runtime.lastError) {
					callback(chrome.runtime.lastError.message);
					return;
				}
				console.log("chrome.identity.getAuthToken returned a token", token);
				access_token = token;
				requestStart();
			});
		} else {
			callback("Missing 'identity' permission in manifest");
		}
	}

	function requestStart() {
		var xhr = new XMLHttpRequest();
		xhr.open(method, url);
		xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
		xhr.onload = requestComplete;
		xhr.send();
	}

	function requestComplete() {
		if (this.status == 401 && retry) {
			retry = false;
			chrome.identity.removeCachedAuthToken({ token: access_token }, getToken);
		} else {
			callback(null, this.status, this.response);
		}
	}
}