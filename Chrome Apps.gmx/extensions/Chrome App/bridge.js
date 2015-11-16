// ===========================================
// buy.js - https://github.com/GoogleChrome/chrome-app-samples/blob/master/samples/managed-in-app-payments/scripts/buy.js
(function() { var f=this,g=function(a,d){var c=a.split("."),b=window||f;c[0]in b||!b.execScript||b.execScript("var "+c[0]);for(var e;c.length&&(e=c.shift());)c.length||void 0===d?b=b[e]?b[e]:b[e]={}:b[e]=d};var h=function(a){var d=chrome.runtime.connect("nmmhkkegccagdldgiimedpiccmgmieda",{}),c=!1;d.onMessage.addListener(function(b){c=!0;"response"in b&&!("errorType"in b.response)?a.success&&a.success(b):a.failure&&a.failure(b)});d.onDisconnect.addListener(function(){!c&&a.failure&&a.failure({request:{},response:{errorType:"INTERNAL_SERVER_ERROR"}})});d.postMessage(a)};g("google.payments.inapp.buy",function(a){a.method="buy";h(a)});
g("google.payments.inapp.consumePurchase",function(a){a.method="consumePurchase";h(a)});g("google.payments.inapp.getPurchases",function(a){a.method="getPurchases";h(a)});g("google.payments.inapp.getSkuDetails",function(a){a.method="getSkuDetails";h(a)}); })();
// ===========================================
// xhrWithAuth - Helper Util for making authenticated XHRs
function xhrWithAuth(method, url, interactive, callback) {
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
// ===========================================

// ===========================================
// Bridge functions - Used to test whether or 
// not the game is being run as a packaged app 
// + includes event logic that replaces the    
// callbacks that the Chrome platform APIs    
// expect
// ===========================================

// Returns whether or not the game is currently being run as a chrome app
function ChromeIsApp()
{
	return (chrome && chrome.app && chrome.app.window)? 1 : 0;
}

// The next event id that will be used when deferring a response
var NEXT_EVENT_ID = 1;
// The results of resolved events
var EVENT_RESULTS = {};
// The errors of resolved events
var EVENT_POOL = [];
// Events that should have been handled and can now be returned to the event pool
var USED_EVENTS = [];
// The timeout that is used to defer the cleanup of events (to ensure
// users have enough time to retrieve the properties they want from
// their events)
var USED_EVENTS_TIMEOUT = -1;

// If a function uses a callback, then we give it an event id
// that can be used to retrieve the response once the process
// is finished.
function ChromeDeferResponse()
{
	return NEXT_EVENT_ID++;
}

// Create a response for the given deferred event
function ChromeProvideResponse(ev)
{
	var e = (EVENT_POOL.length > 0)? EVENT_POOL.pop() : {};
	EVENT_RESULTS[ev] = e;
	return e;
}

// Whether or not a given response has been resolved
function ChromeHasResult(ev)
{
	if (EVENT_RESULTS.hasOwnProperty(ev)) {
		USED_EVENTS.push(ev);
		// Clean up the used event in the next js turn
		if (USED_EVENTS_TIMEOUT < 0) {
			USED_EVENTS_TIMEOUT = setTimeout(ChromeFreeOldEvents,1);
		}
		return 1;
	}
	return 0;
}

// Frees up all the events that have been used
function ChromeFreeOldEvents()
{
	while (USED_EVENTS.length > 0) {
		var ev  = USED_EVENTS.pop();
		var e = EVENT_RESULTS[ev];
		delete EVENT_RESULTS[ev];
		for (var key in e) {
			delete e[key];
		}
		EVENT_POOL.push(e);
	}
	USED_EVENTS_TIMEOUT = -1;
}

// Gets the response property for a given event
function ChromeGetResult(ev, field)
{
	return EVENT_RESULTS[ev][field];
}

// ===========================================
// chrome.runtime functions
// ===========================================

// Returns a string of JSON read from the manifest file
function ChromeRuntimeGetManifest()
{
	return JSON.stringify(chrome.runtime.getManifest(), null, '\t');
}

// Reloads the game
function ChromeRuntimeReload()
{
	return chrome.runtime.reload();
}

// Checks if there is an upate to the game available
// on the Chrome web store
function ChromeRuntimeRequestUpdateCheck()
{
	var ev = ChromeDeferResponse();
	chrome.runtime.requestUpdateCheck(function(status, details){
		var res = ChromeProvideResponse(ev);
		res.status = status;
		res.version = (details && details.version)? details.version : "";
	});
	return ev;
}

// ===========================================
// chrome.i18n - Internationalization
// ===========================================

// Get a message from the _locales directory in the users language
function ChromeI18nGetMessage()
{
	return chrome.i18n.getMessage.apply(this, arguments);
}

// Gets the users preferred languages
function ChromeI18nGetAcceptedLanguages()
{
	var ev = ChromeDeferResponse();
	chrome.i18n.getAcceptLanguages(function gotAcceptedLanguages(langs){
		var res = ChromeProvideResponse(ev);
		res.result = langs.join(",");
	});
	return ev;
}

// Gets the locale of the Chrome browser
function ChromeI18nGetUILanguage()
{
	return chrome.i18n.getUILanguage();
}

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

var LICENSE_API_URL = 'https://www.googleapis.com/chromewebstore/v1.1/userlicenses/';

// Start loading the Chrome license
function ChromeLicenseLoad(interactive) {

	// TODO cache the response so that we don't need to check everytime
	// use the maxAgeSecs property in the response to help sync the value
	// https://developer.chrome.com/webstore/one_time_payments#cache-response

	var ev = ChromeDeferResponse();
	xhrWithAuth('GET', LICENSE_API_URL + chrome.runtime.id, !!interactive, 
	function onLicenseFetched(error, status, response){
		// Default response properties
		var res = ChromeProvideResponse(ev);
		res.result = false;
		res.error = "";
		res.createdTime = 0;
		res.accessLevel = "NONE";

		if (error != null) {
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

// ===========================================
// In-App Payments API
// https://developer.chrome.com/webstore/payments-iap
// ===========================================

// Purchases an in-app product with the give SKU
function GooglePaymentsInAppBuy(sku){
	var ev = ChromeDeferResponse();
	google.payments.inapp.buy({
		'parameters': {'env': 'prod'},
		'sku': sku,
		'success': function onPurchase(reponse){
			console.log("Purchase success",arguments);
			var res = ChromeProvideResponse(ev);
			res.error = "";
			res.errorType = "";
			res.jwt = reponse.jwt;
			res.cartId = reponse.request.cartId;
			res.orderId = reponse.response.orderId;
		},
		'failure': function onPurchaseFail(reponse){
			console.error("Purchase Failed",reponse);
			var res = ChromeProvideResponse(ev);
			res.error = "An unknown error occurred, check the console for more information";
			res.errorType = response.response.errorType;
			// Try to make the error message more meaningful
			switch (res.errorType) {
				case "PURCHASE_CANCELED": res.error = "Purchase was cancelled by user"; break;
			}
		}
	});
	return ev;
}