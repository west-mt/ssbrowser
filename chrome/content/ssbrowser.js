var browser;
var listener;
var status_msg;
var link_status;
var start_uri = null;
const Cc = Components.classes;
const Ci = Components.interfaces;
const ios =	Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);


//TODO:
// - リンククリック時にアドレスを確認、外部サイトの場合、標準ブラウザで開く
//   - ホスト名チェックだけでなく、特定パターンとの照合を追加
// - コマンドライン引数の読み取り
// - 設定ウインドウの追加
// - 起動の仕組みを作成。ショートカット、スクリプトを生成


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

  if (!start_uri && urlbar.value != null && urlbar.value != ''){
	start_uri = ios.newURI(urlbar.value, null, null);
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

function setting() {
  window.openDialog("chrome://ssb/content/preferences/preferences.xul", "",
					"chrome,centerscreen,modal");

}

function isLinkExternal(href, internal_regexp) {

  var uri = ios.newURI(href, null, null);

  // Links from our host are always internal
  if (/*uri.scheme == start_uri.scheme &&*/ uri.host == start_uri.host)
    return false;

  if (internal_regexp){

  }

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

  extps.loadURI(aURI, null);
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
	dump("external link!!!\n");
	openExternalLink(href);
	e.preventDefault();
    e.stopPropagation();
	return false;
  }

  return true;
  // Don't handle events that: a) aren't trusted, b) have already been
  // handled or c) aren't left-click.
  /*
  if (!e.isTrusted || e.defaultPrevented || e.button)
    return true;

  let href = hRefForClickEvent(e, true);
  if (href) {
    let tab = document.getElementById("tabmail").selectedTab;
    let preUri = tab.browser.currentURI;
    let postUri = makeURI(href);

    if (!this.protoSvc.isExposedProtocol(postUri.scheme) ||
        postUri.schemeIs("http") || postUri.schemeIs("https")) {
      if (!this._isInEngine(tab.currentEngine, preUri, postUri)) {
        e.preventDefault();
        openLinkExternally(href);
      }
    }
  }
  return false;
*/
}

function onload() {
  var urlbar = document.getElementById("urlbar");
  urlbar.value = "http://www.mozilla.org/";
  //urlbar.value = "http://www.yahoo.co.jp/";
  //urlbar.value = 'file:///home/gaku/work/webapps/apps/static/index.html';

  listener = new WebProgressListener();

  browser = $("#browser")[0];
  status_msg = $("#status")[0];
  link_status = $("#link_status");
  browser.addProgressListener(listener,
							  Components.interfaces.nsIWebProgress.NOTIFY_ALL);

  //ブラウザ内クリックを捕捉
  browser.addEventListener("click", click_handler, true);
  browser.addEventListener("DOMActivate", click_handler, true);

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

  go();
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
