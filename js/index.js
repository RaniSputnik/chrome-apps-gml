// This file is used to export all of the functions for the 
// extension. Unfortunately all functions must be exported to
// the window because . in function names in the GameMaker
// extension cause issues.

// First we require all the components we need to build the
// extension package. We match packages as best we can with
// the chrome app packages eg. e.runtime = chrome.runtime
var e = {
	async: require('./async'),
	utils: require('./utils'),
	runtime: require('./runtime'),
	storage: require('./storage'),
	i18n: require('./i18n'),
	license: require('./license'),
	inapp: require('./inapp'),
	win: require('./window')
};

// Whether or not we are currently running as a Chrome App.
var IS_APP = e.utils.isApp();

// Used to export a function to the window. Exports
// empty functions if we aren't running as a Chrome App.
function ext(name, func){
	if (!IS_APP) {
		func = emptyFunc;
	}
	window[name] = func;
}

// A blank function that will simply return 0
// Used when we are not running in a Chrome App.
function emptyFunc(){
	return 0;
}

// Then we export each of the public functions from each
// package to the window for GameMaker to use.
ext('ChromeIsApp', e.utils.isApp);
ext('ChromePackageLoad', e.utils.packageLoad);
ext('ChromeHasResult', e.async.hasResult);
ext('ChromeGetResult', e.async.getResult);
ext('ChromeCancel', e.async.cancel);
ext('ChromeRuntimeGetManifest', e.runtime.getManifest);
ext('ChromeRuntimeRequestUpdateCheck', e.runtime.requestUpdateCheck);
ext('ChromeRuntimeReload', e.runtime.reload);
ext('ChromeStorageBegin', e.storage.begin);
ext('ChromeStorageGet', e.storage.get);
ext('ChromeStorageSet', e.storage.set);
ext('ChromeStorageRemove', e.storage.remove);
ext('ChromeStorageEnd', e.storage.end);
ext('ChromeStorageGetAll', e.storage.getAll);
ext('ChromeStorageClear', e.storage.clear);
ext('ChromeStorageOnChanged', e.storage.onChanged);
ext('ChromeI18nGetMessage', e.i18n.getMessage);
ext('ChromeI18nGetAcceptedLanguages', e.i18n.getAcceptedLanguages);
ext('ChromeI18nGetUILanguage', e.i18n.getUILanguage);
ext('ChromeLicenseLoad', e.license.load);
ext('ChromeInAppGetProducts', e.inapp.getProducts);
ext('ChromeInAppTitle', e.inapp.title);
ext('ChromeInAppDescription', e.inapp.description);
ext('ChromeInAppPrice', e.inapp.price);
ext('ChromeInAppPriceCurrency', e.inapp.priceCurrency);
ext('ChromeInAppPriceRegion', e.inapp.priceRegion);
ext('ChromeInAppBuy', e.inapp.buy);
ext('ChromeInAppGetPurchases', e.inapp.getPurchases);
ext('ChromeInAppConsume', e.inapp.consume);
ext('ChromeWindowGetCurrent', e.win.getCurrent);
ext('ChromeWindowFullscreen', e.win.fullscreen);
ext('ChromeWindowIsFullscreen', e.win.isFullscreen);
ext('ChromeWindowRestore', e.win.restore);
ext('ChromeWindowFocus', e.win.focus);
ext('ChromeWindowClose', e.win.close);
ext('ChromeWindowShow', e.win.show);
ext('ChromeWindowHide', e.win.hide);
ext('ChromeWindowSetPos', e.win.setPos);
ext('ChromeWindowSetSize', e.win.setSize);