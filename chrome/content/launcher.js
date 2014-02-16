const Cc = Components.classes;
const Ci = Components.interfaces;
const Cu = Components.utils;

const ios =	Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);

Cu.import("chrome://ssb/content/modules/CreateShortcut.jsm");


var include_patt;
var start_url;
var gProfileManagerBundle;
var gBrandBundle;
var gProfileService;


function onAccept(){
  return false;
}

//ウインドウを閉じる
function onCancel(){
  gProfileService.flush();  //プロファイルリストを更新
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

Components.utils.import("resource://gre/modules/Services.jsm");


function profile_startup(){

  try {

    gProfileService = Cc[ToolkitProfileService].getService(Ci.nsIToolkitProfileService);

    gProfileManagerBundle = document.getElementById("bundle_profileManager");
    gBrandBundle = document.getElementById("bundle_brand");

    document.documentElement.centerWindowOnScreen();

    var profilesElement = document.getElementById("profiles");

    var profileList = gProfileService.profiles;
    while (profileList.hasMoreElements()) {
      var profile = profileList.getNext().QueryInterface(Ci.nsIToolkitProfile);

      var listitem = profilesElement.appendItem(profile.name, "");

      var tooltiptext =
        gProfileManagerBundle.getFormattedString("profileTooltip", [profile.name, profile.rootDir.path]);
      listitem.setAttribute("tooltiptext", tooltiptext);
      listitem.setAttribute("class", "listitem-iconic");
      listitem.profile = profile;
    }
	try{
	  profilesElement.selectedIndex = 0;
	}catch(e) {}
    profilesElement.focus();
  }
  catch(e) {
    window.close();
    throw (e);
  }

}

function onLoad() {
  include_patt = $('#include_patt')[0];
  start_url = $('#start_url')[0];

  profile_startup();
}

addEventListener("load", onLoad, false);
