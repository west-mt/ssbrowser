const Cc = Components.classes;
const Ci = Components.interfaces;
const Cu = Components.utils;

const ios =	Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);

Cu.import("chrome://ssb/content/modules/CreateShortcut.jsm");


var include_patt;
var start_url;


function onAccept(){
  return false;
}

function onCancel(){
  return true;  //ダイアログを閉じる
}

function onChangeStartURL(){
  //パターンが指定されていない場合、ホスト名を自動入力
  if (include_patt.value == ''){
	try{
	  var uri = ios.newURI(start_url.value, null, null);
	  var patt = '^' + uri.scheme + '://' + uri.host + '/';

	  include_patt.value = patt;
	}catch(e){
	  //Do nothing
	}
  }

}

function onLoad() {
  include_patt = $('#include_patt')[0];
  start_url = $('#start_url')[0];
}

addEventListener("load", onLoad, false);
