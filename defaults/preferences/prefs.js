pref("toolkit.defaultChromeURI", "chrome://ssb/content/ssbrowser.xul");

pref("general.useragent.compatMode.firefox", true);
pref("browser.preferences.instantApply", true);

pref("browser.dom.window.dump.enabled", true);
pref("javascript.options.showInConsole", true);
//pref("javascript.options.strict", true);
pref("nglayout.debug.disable_xul_cache", true);
pref("nglayout.debug.disable_xul_fastload", true);

//Enable password manager
pref("signon.rememberSignons", true);
pref("signon.debug", true);
pref("signon.expireMasterPassword", false);
pref("signon.SignonFileName", "signons.txt");

//Enable autocomplete
pref("browser.formfill.enable", true);
