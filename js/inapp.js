// ===========================================
// In-App Payments API
// https://developer.chrome.com/webstore/payments-iap
// ===========================================

require('./buy');
var async = require('./async');

var INAPP_PRODUCTS;

var ext = module.exports = {

	// Gets all of the available products
	getProducts: function(){
		var ev = async.deferResponse();
		google.payments.inapp.getSkuDetails({
			'parameters': {'env': 'prod'},
			'success': function onSkuDetails(response){
				console.log("Got In-App Products", response.response);
				var res = async.provideResponse(ev);
				res.error = "";
				res.response = JSON.stringify(response.response);
				INAPP_PRODUCTS = {};
				var list = response.response.details.inAppProducts
				for (var i = 0, n = list.length; i < n; i++) {
					var product = list[i];
					INAPP_PRODUCTS[product.sku] = product;
				}
			},
			'failure': function onSkuDetailsFail(repsonse){
				console.error("Getting In-App Products failed", response);
				var res = async.provideResponse(ev);
				res.error = "An unknown error occurred, check the console for more information";
			}
		});
		return ev;
	},

	// Gets the title of a product with the given SKU
	title: function(sku){
		if (INAPP_PRODUCTS && INAPP_PRODUCTS.hasOwnProperty(sku)) {
			return INAPP_PRODUCTS[sku].localeData[0].title;
		}
	},

	// Gets the description of a product with the given SKU
	description: function(sku){
		if (INAPP_PRODUCTS && INAPP_PRODUCTS.hasOwnProperty(sku)) {
			return INAPP_PRODUCTS[sku].localeData[0].description;
		}
	},

	// Gets the price of a product with the given SKU
	price: function(sku){
		if (INAPP_PRODUCTS && INAPP_PRODUCTS.hasOwnProperty(sku)) {
			return INAPP_PRODUCTS[sku].prices[0].valueMicros / 1000000;
		}
	},

	// Returns the currency code of a given in-app product
	priceCurrency: function(sku){
		if (INAPP_PRODUCTS && INAPP_PRODUCTS.hasOwnProperty(sku)) {
			return INAPP_PRODUCTS[sku].prices[0].currencyCode;
		}
	},

	// Gets the region code for the price of a given in-app product
	priceRegion: function(sku){
		if (INAPP_PRODUCTS && INAPP_PRODUCTS.hasOwnProperty(sku)) {
			return INAPP_PRODUCTS[sku].prices[0].currencyCode;
		}
	},

	// Purchases an in-app product with the give SKU
	// Note! If the sku is incorrect you will simply see
	// a blank window appear - no item will be shown
	// Note! If you get "In-App Payments is Currently Unavailable"
	// it's likely you are trying to re-purchase an already
	// purchased product - make sure to consume any products
	// that should be re-purchased
	buy: function(sku){
		var ev = async.deferResponse();
		google.payments.inapp.buy({
			'parameters': {'env': 'prod'},
			'sku': sku,
			'success': function onPurchase(response){
				console.log("Purchase success",arguments);
				var res = async.provideResponse(ev);
				res.error = "";
				res.errorType = "";
				res.jwt = response.jwt;
				res.cartId = response.request.cartId;
				res.orderId = response.response.orderId;
				res.response = JSON.stringify(response.response);
			},
			'failure': function onPurchaseFail(response){
				console.error("Purchase Failed",response);
				var res = async.provideResponse(ev);
				res.error = "Purchase Failed, check the console for more information";
				res.errorType = response.response.errorType;
				// Try to make the error message more meaningful
				switch (res.errorType) {
					case "PURCHASE_CANCELED": res.error = "Purchase was cancelled by user"; break;
				}
			}
		});
		return ev;
	},

	// Gets all of the current users previous purchases
	getPurchases: function(){
		var ev = async.deferResponse();
		google.payments.inapp.getPurchases({
			'parameters': {'env': 'prod'},
		  	'success': function onGetPurchases(response){
		  		console.log("Got purchases",response.response.details);
		  		var res = async.provideResponse(ev);
		  		res.result = 1;
		  		res.error = "";
		  		// Set all the initial counts for each SKU to 0
		  		for (var sku in INAPP_PRODUCTS) {
		  			res[sku] = 0;
		  		}
		  		var purchases = response.response.details;
		  		for (var i = 0, n = purchases.length; i < n; i++) {
		  			var purchase = purchases[i];
		  			if (!res.hasOwnProperty(purchase.sku)) {
		  				res[purchase.sku] = 0;
		  			}
		  			if (purchase.state == "ACTIVE") {
		  				res[purchase.sku] += 1;
		  			}
		  		}
		  		res.response = JSON.stringify(response.response);
		  	},
		 	'failure': function onGetPurchasesFail(response){
		 		console.error("Getting purchases failed",response);
		 		var res = async.provideResponse(ev);
		 		res.result = 0;
		 		res.error = "Getting purchases failed, check the console for more information";
		 	}
		});
		return ev;
	},

	// Consumes a product with the given SKU
	consume: function(sku){
		var ev = async.deferResponse();
		google.payments.inapp.consumePurchase({
			'parameters': {'env': 'prod'},
			'sku': sku,
			'success': function onConsume(response){
				console.log("Consumed product",sku,response);
				var res = async.provideResponse(ev);
				res.result = 1;
				res.error = "";
			},
			'failure': function onConsumeFail(response){
				console.error("Failed to consume product",sku,response);
				var res = async.provideResponse(ev);
				res.result = 0;
				res.error = "Failed to consume product, check the console for more information";
			}
		});
		return ev;
	}
};

// Preload products
ext.getProducts();