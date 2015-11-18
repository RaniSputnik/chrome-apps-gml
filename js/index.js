// This file is used to export all of the functions for the 
// extension. Unfortunately all functions must be exported to
// the window because . in function names in the GameMaker
// extension cause issues.

// First we require all the components we need to build the
// extension package. We match packages as best we can with
// the chrome app packages eg. e.runtime = chrome.runtime
var e = {
	async: require('./async'),
	util: require('./utils'),
	runtime: require('./runtime'),
	storage: require('./storage'),
	i18n: require('./i18n'),
	license: require('./license'),
	inapp: require('./inapp')
};

// Then we export each of the public functions from each
// package to the window for GameMaker to use.
var w = window;
w.ChromeIsApp = e.util.isApp;
w.ChromePackageLoad = e.util.packageLoad;
w.ChromeHasResult = e.async.hasResult;
w.ChromeGetResult = e.async.getResult;
w.ChromeRuntimeGetManifest = e.runtime.getManifest;
w.ChromeRuntimeRequestUpdateCheck = e.runtime.requestUpdateCheck;
w.ChromeRuntimeReload = e.runtime.reload;
w.ChromeStorageGet = e.storage.get;
w.ChromeStorageBegin = e.storage.begin;
w.ChromeStorageSet = e.storage.set;
w.ChromeStorageSave = e.storage.save;
w.ChromeStorageRemove = e.storage.remove;
w.ChromeStorageClear = e.storage.clear;
w.ChromeStorageOnChanged = e.storage.onChanged;
w.ChromeI18nGetMessage = e.i18n.getMessage;
w.ChromeI18nGetAcceptedLanguages = e.i18n.getAcceptedLanguages;
w.ChromeI18nGetUILanguage = e.i18n.getUILanguage;
w.ChromeLicenseLoad = e.license.load;
w.ChromeInAppGetProducts = e.inapp.getProducts;
w.ChromeInAppTitle = e.inapp.title;
w.ChromeInAppDescription = e.inapp.description;
w.ChromeInAppPrice = e.inapp.price;
w.ChromeInAppPriceCurrency = e.inapp.priceCurrency;
w.ChromeInAppPriceRegion = e.inapp.priceRegion;
w.ChromeInAppBuy = e.inapp.buy;
w.ChromeInAppGetPurchases = e.inapp.getPurchases;
w.ChromeInAppConsume = e.inapp.consume;