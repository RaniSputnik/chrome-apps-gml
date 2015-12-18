# Chrome Apps for GameMaker
A GameMaker extension that provides extended functionality for HTML5 games packaged as [Chrome Apps](https://developer.chrome.com/apps/about_apps). Allows for more advanced integration with the Chrome Web Store by exposing APIs for licensing, synced storage, in-app purchases, i18n and more.

### Editing

If you just want to play with the example project, then that will just work out of the box. Download the repo and simply open the project in GameMaker to get started.

If you want to make changes to the extension bridge file, then you will need [Node.js](https://nodejs.org/en/) and [Grunt](http://gruntjs.com/). Running grunt will compile all the files required by js/index.js into the single bridge.js file used by GameMaker.

### Unsupported Functions

There are a number of GameMaker functions that do not work correctly in the Chrome Packaged App environment, they are listed below;

- **show_message()** fails as window.alert is not allowed in a Chrome App, use show_message_async instead.
- **game_end()** fails silently in the HTML5 module, instead use chrome_window_close to close the current window.

