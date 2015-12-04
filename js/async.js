// TODO allow requests to be cancelled to ensure that
// when you change rooms you can cleanup outstanding requests

// The next event id that will be used when deferring a response
var NEXT_EVENT_ID = 1;
// The results of resolved events
var EVENT_RESULTS = {};
// The errors of resolved events
var EVENT_POOL = [];
// Events that should have been handled and can now be returned to the event pool
var USED_EVENTS = [];
// A record of all events in flight
var IN_FLIGHT = {};
// The timeout that is used to defer the cleanup of events (to ensure
// users have enough time to retrieve the properties they want from
// their events)
var USED_EVENTS_TIMEOUT = -1;
// A response that is returned when a response is provided but
// the request has already been cancelled.
var DUMMY_RESPONSE = {};

var async = {
	// If a function uses a callback, then we give it an event id
	// that can be used to retrieve the response once the process
	// is finished.
	deferResponse: function(){
		var ev = NEXT_EVENT_ID++;
		IN_FLIGHT[ev] = true;
		return ev;
	},

	// Create a response for the given deferred event
	// If remainInFlight is true then subsequent
	// responses may be provided for this single 
	provideResponse: function(ev, remainInFlight){
		if (!IN_FLIGHT[ev]) return DUMMY_RESPONSE;
		var e = EVENT_POOL.pop() || {};
		EVENT_RESULTS[ev] = e;
		if (!remainInFlight) {
			delete IN_FLIGHT[ev];
		}
		return e;
	},

	// Whether or not a given response has been resolved
	hasResult: function(ev){
		if (EVENT_RESULTS.hasOwnProperty(ev)) {
			USED_EVENTS.push(ev);
			// Clean up the used event in the next js turn
			if (USED_EVENTS_TIMEOUT < 0) {
				USED_EVENTS_TIMEOUT = setTimeout(freeOldEvents,1);
			}
			return 1;
		}
		return 0;
	},

	// Gets the response property for a given event
	getResult: function(ev, field){
		return EVENT_RESULTS[ev][field];
	},

	// Cancels the given event
	cancel: function(ev){
		if (ev < 0) return 0;
		// Trigger clean-up if the result has already been recorded
		async.hasResult(ev); 
		// The request is no longer in flight
		var wasInFlight = IN_FLIGHT[ev];
		delete IN_FLIGHT[ev];
		return (wasInFlight)? 1 : 0;
	}
};

// Frees up all the events that have been used
function freeOldEvents(){
	while (USED_EVENTS.length > 0) {
		var ev  = USED_EVENTS.pop();
		var e = EVENT_RESULTS[ev];
		delete EVENT_RESULTS[ev];
		if (e) {
			for (var key in e) {
				delete e[key];
			}
			EVENT_POOL.push(e);
		}
	}
	USED_EVENTS_TIMEOUT = -1;
}

// Export the module
module.exports = async;