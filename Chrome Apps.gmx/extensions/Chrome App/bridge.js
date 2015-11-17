!function a(b,c,d){function e(g,h){if(!c[g]){if(!b[g]){var i="function"==typeof require&&require;if(!h&&i)return i(g,!0);if(f)return f(g,!0);var j=new Error("Cannot find module '"+g+"'");throw j.code="MODULE_NOT_FOUND",j}var k=c[g]={exports:{}};b[g][0].call(k.exports,function(a){var c=b[g][1][a];return e(c?c:a)},k,k.exports,a,b,c,d)}return c[g].exports}for(var f="function"==typeof require&&require,g=0;g<d.length;g++)e(d[g]);return e}({1:[function(a,b,c){function d(){for(;h.length>0;){var a=h.pop(),b=f[a];delete f[a];for(var c in b)delete b[c];g.push(b)}i=-1}var e=1,f={},g=[],h=[],i=-1;b.exports={deferResponse:function(){return e++},provideResponse:function(a){var b=g.pop()||{};return f[a]=b,b},hasResult:function(a){return f.hasOwnProperty(a)?(h.push(a),0>i&&(i=setTimeout(d,1)),1):0},getResult:function(a,b){return f[a][b]}}},{}],2:[function(a,b,c){!function(){var a=this,b=function(b,c){var d=b.split("."),e=window||a;d[0]in e||!e.execScript||e.execScript("var "+d[0]);for(var f;d.length&&(f=d.shift());)d.length||void 0===c?e=e[f]?e[f]:e[f]={}:e[f]=c},c=function(a){var b=chrome.runtime.connect("nmmhkkegccagdldgiimedpiccmgmieda",{}),c=!1;b.onMessage.addListener(function(b){c=!0,"response"in b&&!("errorType"in b.response)?a.success&&a.success(b):a.failure&&a.failure(b)}),b.onDisconnect.addListener(function(){!c&&a.failure&&a.failure({request:{},response:{errorType:"INTERNAL_SERVER_ERROR"}})}),b.postMessage(a)};b("google.payments.inapp.buy",function(a){a.method="buy",c(a)}),b("google.payments.inapp.consumePurchase",function(a){a.method="consumePurchase",c(a)}),b("google.payments.inapp.getPurchases",function(a){a.method="getPurchases",c(a)}),b("google.payments.inapp.getSkuDetails",function(a){a.method="getSkuDetails",c(a)})}()},{}],3:[function(a,b,c){var d=a("./async");b.exports={getMessage:function(){return chrome.i18n.getMessage.apply(this,arguments)},getAcceptedLanguages:function(){var a=d.deferResponse();return chrome.i18n.getAcceptLanguages(function(b){var c=d.provideResponse(a);c.result=b.join(",")}),a},getUILanguage:function(){return chrome.i18n.getUILanguage()}}},{"./async":1}],4:[function(a,b,c){a("./buy");var d,e=a("./async"),f=b.exports={getProducts:function(){var a=e.deferResponse();return google.payments.inapp.getSkuDetails({parameters:{env:"prod"},success:function(b){console.log("Got In-App Products",b.response);var c=e.provideResponse(a);c.error="",c.response=JSON.stringify(b.response),d={};for(var f=b.response.details.inAppProducts,g=0,h=f.length;h>g;g++){var i=f[g];d[i.sku]=i}},failure:function(b){console.error("Getting In-App Products failed",response);var c=e.provideResponse(a);c.error="An unknown error occurred, check the console for more information"}}),a},title:function(a){return d&&d.hasOwnProperty(a)?d[a].localeData[0].title:void 0},description:function(a){return d&&d.hasOwnProperty(a)?d[a].localeData[0].description:void 0},price:function(a){return d&&d.hasOwnProperty(a)?d[a].prices[0].valueMicros/1e6:void 0},priceCurrency:function(a){return d&&d.hasOwnProperty(a)?d[a].prices[0].currencyCode:void 0},priceRegion:function(a){return d&&d.hasOwnProperty(a)?d[a].prices[0].currencyCode:void 0},buy:function(a){var b=e.deferResponse();return google.payments.inapp.buy({parameters:{env:"prod"},sku:a,success:function(a){console.log("Purchase success",arguments);var c=e.provideResponse(b);c.error="",c.errorType="",c.jwt=a.jwt,c.cartId=a.request.cartId,c.orderId=a.response.orderId,c.response=JSON.stringify(a.response)},failure:function(a){console.error("Purchase Failed",a);var c=e.provideResponse(b);switch(c.error="Purchase Failed, check the console for more information",c.errorType=a.response.errorType,c.errorType){case"PURCHASE_CANCELED":c.error="Purchase was cancelled by user"}}}),b},getPurchases:function(){var a=e.deferResponse();return google.payments.inapp.getPurchases({parameters:{env:"prod"},success:function(b){console.log("Got purchases",b.response.details);var c=e.provideResponse(a);c.result=1,c.error="";for(var f in d)c[f]=0;for(var g=b.response.details,h=0,i=g.length;i>h;h++){var j=g[h];c.hasOwnProperty(j.sku)||(c[j.sku]=0),"ACTIVE"==j.state&&(c[j.sku]+=1)}c.response=JSON.stringify(b.response)},failure:function(b){console.error("Getting purchases failed",b);var c=e.provideResponse(a);c.result=0,c.error="Getting purchases failed, check the console for more information"}}),a},consume:function(a){var b=e.deferResponse();return google.payments.inapp.consumePurchase({parameters:{env:"prod"},sku:a,success:function(c){console.log("Consumed product",a,c);var d=e.provideResponse(b);d.result=1,d.error=""},failure:function(c){console.error("Failed to consume product",a,c);var d=e.provideResponse(b);d.result=0,d.error="Failed to consume product, check the console for more information"}}),b}};f.getProducts()},{"./async":1,"./buy":2}],5:[function(a,b,c){var d={async:a("./async"),util:a("./utils"),runtime:a("./runtime"),storage:a("./storage"),i18n:a("./i18n"),license:a("./license"),inapp:a("./inapp")},e=window;e.ChromeIsApp=d.util.isApp,e.ChromeHasResult=d.async.hasResult,e.ChromeGetResult=d.async.getResult,e.ChromeRuntimeGetManifest=d.runtime.getManifest,e.ChromeRuntimeRequestUpdateCheck=d.runtime.requestUpdateCheck,e.ChromeRuntimeReload=d.runtime.reload,e.ChromeStorageGet=d.storage.get,e.ChromeStorageBegin=d.storage.begin,e.ChromeStorageSet=d.storage.set,e.ChromeStorageSave=d.storage.save,e.ChromeStorageRemove=d.storage.remove,e.ChromeStorageClear=d.storage.clear,e.ChromeI18nGetMessage=d.i18n.getMessage,e.ChromeI18nGetAcceptedLanguages=d.i18n.getAcceptedLanguages,e.ChromeI18nGetUILanguage=d.i18n.getUILanguage,e.ChromeLicenseLoad=d.license.load,e.ChromeInAppGetProducts=d.inapp.getProducts,e.ChromeInAppTitle=d.inapp.title,e.ChromeInAppDescription=d.inapp.description,e.ChromeInAppPrice=d.inapp.price,e.ChromeInAppPriceCurrency=d.inapp.priceCurrency,e.ChromeInAppPriceRegion=d.inapp.priceRegion,e.ChromeInAppBuy=d.inapp.buy,e.ChromeInAppGetPurchases=d.inapp.getPurchases,e.ChromeInAppConsume=d.inapp.consume},{"./async":1,"./i18n":3,"./inapp":4,"./license":6,"./runtime":7,"./storage":8,"./utils":9}],6:[function(a,b,c){var d=a("./async"),e=a("./xhrWithAuth"),f="https://www.googleapis.com/chromewebstore/v1.1/userlicenses/";b.exports={load:function(a){var b=d.deferResponse();return e("GET",f+chrome.runtime.id,!!a,function(a,c,e){var f=d.provideResponse(b);if(f.result=!1,f.error="",f.createdTime=0,f.accessLevel="NONE",null!=a)f.error=a;else if(200===c){console.log("Received response from license server",a,c,e);try{e=JSON.parse(e)}catch(g){return f.error="Invalid response from license server"}f.result=e.result?1:0,e.createdTime&&(f.createdTime=e.createdTime),e.accessLevel&&(f.accessLevel=e.accessLevel)}else f.error="License request got a "+c+" response"}),b}}},{"./async":1,"./xhrWithAuth":10}],7:[function(a,b,c){var d=a("./async");b.exports={getManifest:function(){return JSON.stringify(chrome.runtime.getManifest(),null,"	")},reload:function(){return chrome.runtime.reload()},requestUpdateCheck:function(){var a=d.deferResponse();return chrome.runtime.requestUpdateCheck(function(b,c){var e=d.provideResponse(a);e.status=b,e.version=c&&c.version?c.version:""}),a}}},{"./async":1}],8:[function(a,b,c){function d(a){if(!chrome.storage){var b=e.provideResponse(a);return b.error="Missing 'storage' permission, no storage areas available",b.result=0,!1}return!0}var e=a("./async"),f="sync",g="local",h={},i="",j=[];b.exports={get:function(){var a=e.deferResponse();if(d(a)){var b=arguments[0];j.length=0;for(var c=1,f=arguments.length;f>c;c++)j.push(String(arguments[c]));chrome.storage[b].get(j,function(b){var c=e.provideResponse(a);if(chrome.runtime.lastError)c.error=chrome.runtime.lastError.message,c.result=0;else{c.error="",c.result=1;for(var d in b)c[d]=b[d]}})}return a},begin:function(a){if(chrome.storage&&(a==f||a==g)){i=a;for(var b in h)delete h[b];return 1}return 0},set:function(a,b){h[a]=b},save:function(){var a=e.deferResponse();return d(a)&&chrome.storage[i].set(h,function(){var b=e.provideResponse(a);chrome.runtime.lastError?(b.error=chrome.runtime.lastError.message,b.result=0):(b.error="",b.result=1)}),i="",a},remove:function(){return 0},clear:function(a){var b=e.deferResponse();return d(b)&&chrome.storage[a].clear(function(){var a=e.provideResponse(b);chrome.runtime.lastError?(a.error=chrome.runtime.lastError.message,a.result=0):(a.error="",a.result=1)}),b}}},{"./async":1}],9:[function(a,b,c){b.exports={isApp:function(){return chrome&&chrome.app&&chrome.app.window?1:0}}},{}],10:[function(a,b,c){b.exports=function(a,b,c,d){function e(){console.log("Calling chrome.identity.getAuthToken",c),chrome.identity?chrome.identity.getAuthToken({interactive:c},function(a){return chrome.runtime.lastError?void d(chrome.runtime.lastError.message):(console.log("chrome.identity.getAuthToken returned a token",a),i=a,void f())}):d("Missing 'identity' permission in manifest")}function f(){var c=new XMLHttpRequest;c.open(a,b),c.setRequestHeader("Authorization","Bearer "+i),c.onload=g,c.send()}function g(){401==this.status&&h?(h=!1,chrome.identity.removeCachedAuthToken({token:i},e)):d(null,this.status,this.response)}var h=!0,i=null;e()}},{}]},{},[5]);