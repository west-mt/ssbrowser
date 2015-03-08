var browser;
var listener;
var status_msg;
var link_status;
const Cc = Components.classes;
const Ci = Components.interfaces;
const Cu = Components.utils;

const ios =	Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
const pwmgr = Cc["@mozilla.org/login-manager;1"].getService(Ci.nsILoginManager);

const zoom_list = [0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 1.0, 1.2, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0];
var zoom_index = 7;

Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("chrome://ssb/content/modules/FileIO.jsm");
Cu.import("chrome://ssb/content/modules/SSBrowserInfo.jsm");


function obj_dump(obj){
  var txt = '';
  for (var one in obj){
	txt += "  " + one + ": " + obj[one] + "\n";
  }
  dump(txt);
}

//TODO:


// nsIWebProgressListener implementation to monitor activity in the browser.
function WebProgressListener() {
}

WebProgressListener.prototype = {
  _requestsStarted: 0,
  _requestsFinished: 0,

  // We need to advertize that we support weak references.  This is done simply
  // by saying that we QI to nsISupportsWeakReference.  XPConnect will take
  // care of actually implementing that interface on our behalf.
  QueryInterface: function(iid) {
	if (iid.equals(Ci.nsIWebProgressListener) ||
		iid.equals(Ci.nsISupportsWeakReference) ||
		iid.equals(Ci.nsISupports))
	  return this;

	throw Components.results.NS_ERROR_NO_INTERFACE;
  },

  // This method is called to indicate state changes.
  onStateChange: function(webProgress, request, stateFlags, status) {
	const WPL = Ci.nsIWebProgressListener;

	var progress = $("#progress");

	if (stateFlags & WPL.STATE_IS_REQUEST) {
	  if (stateFlags & WPL.STATE_START) {
		this._requestsStarted++;
	  } else if (stateFlags & WPL.STATE_STOP) {
		this._requestsFinished++;
	  }
	  if (this._requestsStarted > 1) {
		var value = (100 * this._requestsFinished) / this._requestsStarted;
		progress.attr({mode: "determined", value: value+"%"});
	  }
	}

	if (stateFlags & WPL.STATE_IS_NETWORK) {
	  if (stateFlags & WPL.STATE_START) {
		$(".reload_stop").attr({mode: "loading"});
		progress.show();
	  } else if (stateFlags & WPL.STATE_STOP) {
		$(".reload_stop").attr({mode: ""});
		progress.hide();
		this.onStatusChange(webProgress, request, 0, "Done");
		this._requestsStarted = this._requestsFinished = 0;
	  }
	}
  },

  // This method is called to indicate progress changes for the currently
  // loading page.
  onProgressChange: function(webProgress, request, curSelf, maxSelf,
							 curTotal, maxTotal) {
	if (this._requestsStarted == 1) {
	  var progress = $("#progress");
	  if (maxSelf == -1) {
		progress.attr("mode", "undetermined");
	  } else {
		progress.attr({mode: "determined",
					   value: ((100 * curSelf) / maxSelf) + "%"});
	  }
	}
  },

  // This method is called to indicate a change to the current location.
  onLocationChange: function(webProgress, request, location) {
	var urlbar = document.getElementById("urlbar");
	urlbar.value = location.spec;

	$(".back").attr({disabled: !browser.canGoBack});
	$(".forward").attr({disabled: !browser.canGoForward});
  },

  // This method is called to indicate a status changes for the currently
  // loading page.  The message is already formatted for display.
  onStatusChange: function(webProgress, request, status, message) {
	//var status_ = document.getElementById("status");
	//status_.setAttribute("label", message);
  },

  // This method is called when the security state of the browser changes.
  onSecurityChange: function(webProgress, request, state) {
	const WPL = Components.interfaces.nsIWebProgressListener;

	var sec = document.getElementById("security");


	/*
	if (state & WPL.STATE_IS_INSECURE) {
	  sec.setAttribute("style", "display: none");
	} else {
	  var level = "unknown";
	  if (state & WPL.STATE_IS_SECURE) {
		if (state & WPL.STATE_SECURE_HIGH)
		  level = "high";
		else if (state & WPL.STATE_SECURE_MED)
		level = "medium";
		else if (state & WPL.STATE_SECURE_LOW)
		level = "low";
	  } else if (state & WPL_STATE_IS_BROKEN) {
		level = "mixed";
	  }
	  sec.setAttribute("label", "Security: " + level);
	  sec.setAttribute("style", "");
	}
	 */
  }
};

function go() {
  var urlbar = document.getElementById("urlbar");

  if (!SSBrowserInfo.start_uri && urlbar.value != null && urlbar.value != ''){
	SSBrowserInfo.start_uri = ios.newURI(urlbar.value, null, null);
	//dump(start_uri.host+', '+start_uri.path);
  }
  browser.loadURI(urlbar.value, null, null);
}

function back() {
  browser.stop();
  browser.goBack();
}

function forward() {
  browser.stop();
  browser.goForward();
}

function reload_stop() {
  if($(".reload_stop").attr("mode") == ""){
	browser.reload();
  }else{
	browser.stop();
  }
}

function zoom_up(){
  if (zoom_index < zoom_list.length-1){
	zoom_index += 1;
	browser.markupDocumentViewer.fullZoom = zoom_list[zoom_index];
  }

  if (zoom_index >= zoom_list.length-1){
	$(".zoomup").attr({disabled: true});
	$(".zoomdown").attr({disabled: false});
	zoom_index = zoom_list.length-1;
  }else if (zoom_index <= 0){
	$(".zoomup").attr({disabled: false});
	$(".zoomdown").attr({disabled: true});
	zoom_index = 0;
  }else{
	$(".zoomup").attr({disabled: false});
	$(".zoomdown").attr({disabled: false});
  }
}

function zoom_down(){
  if (zoom_index > 0){
	zoom_index -= 1;
	browser.markupDocumentViewer.fullZoom = zoom_list[zoom_index];
  }

  if (zoom_index >= zoom_list.length-1){
	$(".zoomup").attr({disabled: true});
	$(".zoomdown").attr({disabled: false});
	zoom_index = zoom_list.length-1;
  }else if (zoom_index <= 0){
	$(".zoomup").attr({disabled: false});
	$(".zoomdown").attr({disabled: true});
	zoom_index = 0;
  }else{
	$(".zoomup").attr({disabled: false});
	$(".zoomdown").attr({disabled: false});
  }
}

function setting() {
  window.openDialog("chrome://ssb/content/preferences/preferences.xul", "",
					"chrome,centerscreen,modal,toolbar");

}

function isLinkExternal(href, internal_regexp) {

  //パターンが指定されている場合、除外パターン→該当パターンの順に判定
  if(SSBrowserInfo.exclude_regexp){
	if (SSBrowserInfo.exclude_regexp.test(href)) return true;
  }
  if(SSBrowserInfo.include_regexp){
	if (SSBrowserInfo.include_regexp.test(href)) return false;
  }

  if(SSBrowserInfo.include_regexp || SSBrowserInfo.exclude_regexp) return true;

  //パターンが指定されていない場合、ホスト名で判定
  var uri = ios.newURI(href, null, null);

  // Links from our host are always internal
  if (/*uri.scheme == start_uri.scheme &&*/ uri.host == SSBrowserInfo.start_uri.host)
    return false;

  return true;
}

//クリックされた要素のリンク先を取得
function hRefForClickEvent(aEvent, aDontCheckInputElement){
  var href = null;
  var isKeyCommand = (aEvent.type == "command");
  var target =
    isKeyCommand ? document.commandDispatcher.focusedElement : aEvent.target;

  if (target instanceof HTMLAnchorElement ||
      target instanceof HTMLAreaElement   ||
      target instanceof HTMLLinkElement){
    if (target.hasAttribute("href"))
      href = target.href;
  }else if (!aDontCheckInputElement && target instanceof HTMLInputElement){
    if (target.form && target.form.action)
      href = target.form.action;
  }else{
    // we may be nested inside of a link node
    var linkNode = aEvent.originalTarget;
    while (linkNode && !(linkNode instanceof HTMLAnchorElement))
      linkNode = linkNode.parentNode;

    if (linkNode)
      href = linkNode.href;
  }

  return href;
}

function openExternalLink(href){
  var extps = Cc["@mozilla.org/uriloader/external-protocol-service;1"].getService(Ci.nsIExternalProtocolService);
  var uri = ios.newURI(href, null, null);
  var env = Components.classes["@mozilla.org/process/environment;1"].getService(Components.interfaces.nsIEnvironment);

  var moz_no_remote;

  if (env.exists('MOZ_NO_REMOTE'))
	moz_no_remote = env.get('MOZ_NO_REMOTE');
  else
	moz_no_remote = '';

  //-no-remote オプションを付けて起動するとブラウザ起動中に外部リンクを開けないため、環境変数を一時的に修正
  env.set('MOZ_NO_REMOTE', '');
  //dump('MOZ_NO_REMOTE = ' + env.get('MOZ_NO_REMOTE') + '\n');
  extps.loadURI(uri, null);

  env.set('MOZ_NO_REMOTE', moz_no_remote);

}

//ブラウザ内クリックのハンドラ
function click_handler(e){

  var href = hRefForClickEvent(e, true);

  /*
  dump("click_handler\n");
  e.preventDefault();
  e.stopPropagation();
  return false;
   */

  if (href && isLinkExternal(href)) {
	//dump("external link!!!\n");

	//外部リンクは標準ブラウザで処理する。
	openExternalLink(href);
	e.preventDefault();
    e.stopPropagation();
	return false;
  }

  return true;
}


function save_settings() {

  var settings = {};
  settings.version = "1";

  // Pull out the window state
  settings.window = {};

  // save current fullscreen state and unfullscreen it for proper store of
  // our window unfullscreen'ed
  settings.window.fullscreen = window.fullScreen;
  window.fullScreen = false;

  settings.window.state = window.windowState;

  if (window.windowState == window.STATE_NORMAL) {
    settings.window.screenX = window.screenX;
    settings.window.screenY = window.screenY;
    settings.window.width = window.outerWidth;
    settings.window.height = window.outerHeight;
  }


  // Save using JSON format
  var nativeJSON = Cc["@mozilla.org/dom/json;1"].createInstance(Ci.nsIJSON);
  var json = nativeJSON.encode(settings);
  var dirSvc = Cc["@mozilla.org/file/directory_service;1"].getService(Ci.nsIProperties);
  var file = dirSvc.get("ProfD", Ci.nsIFile);

  file.append("localstore.json");
  FileIO.stringToFile(json, file);
}

function load_settings() {

  // Load using JSON format
  var settings;
  var dirSvc = Cc["@mozilla.org/file/directory_service;1"].getService(Ci.nsIProperties);
  var file = dirSvc.get("ProfD", Ci.nsIFile);

  file.append("localstore.json");
  if (file.exists()) {
    var json = FileIO.fileToString(file);
    var nativeJSON = Cc["@mozilla.org/dom/json;1"].createInstance(Ci.nsIJSON);

    settings = nativeJSON.decode(json);

    if (settings.window) {
      switch (settings.window.state) {
      case window.STATE_MAXIMIZED:
        window.maximize();
        break;
      case window.STATE_MINIMIZED:
        // Do nothing if window was closed minimized
        break;
      case window.STATE_NORMAL:
        window.moveTo(settings.window.screenX, settings.window.screenY);
        window.resizeTo(settings.window.width, settings.window.height);
        break;
      }
      // if webapp was closed in fullscreen mode, it should relaunch as such.
      window.fullScreen = settings.window.fullscreen;
    }
  }
}

function onload() {
  //dump('window.arguments: ' + window.arguments + '\n');
  //dump('window.opener: ' + window.opener + '\n');
  //dump('browser: ' + browser + '\n');
  var urlbar = document.getElementById("urlbar");

  //urlbar.value = "http://www.mozilla.org/";
  //urlbar.value = "http://www.yahoo.co.jp/";
  //urlbar.value = 'file:///home/gaku/work/webapps/apps/static/index.html';

  if(window.arguments){
	var cmdLine = window.arguments[0];

	cmdLine = cmdLine.QueryInterface(Components.interfaces.nsICommandLine);

	var launcher = cmdLine.handleFlag("launcher", true);
	if(launcher){
	  var x, y;

	  window.resizeTo(540, 600);

	  x = (window.screen.width-window.outerWidth)/2;
	  y = (window.screen.height-window.outerHeight)/2;
	  window.moveTo(x, y);

	  window.location = "chrome://ssb/content/launcher.xul";

	  return;
	}

	var url = cmdLine.handleFlagWithParam("url", true);

	if(url){
	  urlbar.value = url;
	}else{
	  urlbar.value = 'chrome://ssb/content/usage.html';
	}

	var title = cmdLine.handleFlagWithParam("title", true);


	if(title){
	  SSBrowserInfo.title = title;
	  document.title = title;
	}

	var patt = cmdLine.handleFlagWithParam("include", true);

	if(patt){
	  SSBrowserInfo.include_regexp = new RegExp(patt);
	}

	var expatt = cmdLine.handleFlagWithParam("exclude", true);
	if(expatt){
	  SSBrowserInfo.exclude_regexp = new RegExp(expatt);
	}
  }

  listener = new WebProgressListener();

  browser = $("#browser")[0];
  //dump('++ browser: ' + browser + '\n');
  status_msg = $("#status")[0];
  link_status = $("#link_status");
  browser.addProgressListener(listener,
							  Components.interfaces.nsIWebProgress.NOTIFY_ALL);

  //ブラウザ内クリックを捕捉
  browser.addEventListener('click', click_handler, true);
  browser.addEventListener('DOMActivate', click_handler, true);

  browser.addEventListener('mouseover',
						   function(e){
							 var href = hRefForClickEvent(e);
							 if(href){
							   if(isLinkExternal(href)) link_status.show();
							   else link_status.hide();

							   status_msg.value = href;
							 }else{
							   link_status.hide();
							   status_msg.value = "";
							 }
						   }, true);


  XPCOMUtils.defineLazyModuleGetter(browser,
									"LoginManagerContent",
									"chrome://ssb/content/modules/LoginManagerContent.jsm");


  browser.addEventListener('DOMContentLoaded',
						   function(event) {
							 //dump('   '+event.type+'\n');
							 browser.LoginManagerContent.onContentLoaded(event);

							 //Remove target attribute of links
							 var doc = event.originalTarget;
							 $.each(doc.getElementsByTagName('base'),
									function(){
									  if(this.target && this.target != ''){
										this.removeAttribute('target');
									  }
									});

							 $.each(doc.getElementsByTagName('a'),
									function(){
									  if(this.target){
										this.removeAttribute('target');
																			  }
									});
						   });
  browser.addEventListener('DOMAutoComplete',
						   function(event) {
							 //dump('   '+event.type+'\n');
							 browser.LoginManagerContent.onUsernameInput(event);
						   });
  browser.addEventListener('blur',
						   function(event) {
							 //dump('   '+event.type+'\n');
							 browser.LoginManagerContent.onUsernameInput(event);
						   }, true);
  window.addEventListener('close',
						  function(event) {
							save_settings();
						  }, false);

  go();
  if(window.arguments){
	setTimeout(function() { load_settings(); }, 0);
  }

}

addEventListener("load", onload, false);

/*
function ls(){
  let Cu = Components.utils;

  Cu.import ("resource://gre/modules/ctypes.jsm");

  let lib_c = ctypes.open ("/lib/i386-linux-gnu/libc.so.6");
  let system
	= lib_c.declare ("system",
					 ctypes.default_abi,
					 ctypes.int,
					 ctypes.char.ptr);
  system("ls -l");
  lib_c.close();
}
*/
