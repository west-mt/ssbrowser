const Cc = Components.classes;
const Ci = Components.interfaces;
const Cu = Components.utils;

const ios =	Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
const prompts = Cc["@mozilla.org/embedcomp/prompt-service;1"].getService(Ci.nsIPromptService);
const OS = Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULRuntime).OS;

Cu.import("chrome://ssb/content/modules/CreateShortcut.jsm");

var include_patt;
var exclude_patt;
var start_url;
var gProfileManagerBundle;
var gBrandBundle;
var gProfileService;
var other_dir = null;

//ショートカットを作成
function onAccept(){
  var target = '';
  var title = '';
  var url = '';
  var ipatt = '';
  var epatt = '';
  var profile = '';
  var dst = null;
  var icon = null;
  var app_path = null;
  var args = '';
  const dirSvc = Cc["@mozilla.org/file/directory_service;1"].getService(Ci.nsIProperties);


  //値のチェック
  if ($('#name')[0].value.length == 0){
	alert("You must specify title.");
	return false;
  }else{
	title = $('#name')[0].value;
  }

  if (start_url.value.length == 0){
	alert("You must specify start url.");
	return false;
  }else{
	try{
	  var uri = ios.newURI(start_url.value, null, null);
	  url = start_url.value;
	}catch(e){
	  alert("You must specify CORRECT url.");
	  return false;
	}

  }
  if (include_patt.value.length == 0){
	//alert("Host name check will be used.");
  }else{
	ipatt = include_patt.value;
  }

  if (exclude_patt.value.length > 0){
	epatt = exclude_patt.value;
  }

  try{
	profile = $('#profiles')[0].selectedItem.label;
  }catch(e){
	alert("You must specify profile.");
	return false;
  }


  if ($('#other_dir')[0].selected == true && !other_dir){
	alert("You must specify destination directory.");
	return false;
  }

  if($('#other_dir')[0].selected == true){
	dst = other_dir;
  }else{
	dst = dirSvc.get("Desk", Ci.nsIFile);
  }
  //alert("DST: " + dst.path + "\n");

  icon = dirSvc.get("AChrom", Ci.nsIFile).clone();
  icon.append('icons');
  icon.append('default');

  if(OS == 'Linux'){
	icon.append('ssbrowser.png');
  }else if(OS == 'WINNT'){
	icon.append('ssbrowser.ico');
  }else if(OS == 'Darwin'){
	alert("Sorry, we have not support your OS yet...");
	return false;
  }else{
	alert("Sorry, we have not support your OS yet...");
	return false;
  }

  //オプション組み立て

  var appDir = dirSvc.get("GreD", Components.interfaces.nsILocalFile).clone();
  if(OS == 'Linux'){
	appDir.append("firefox");
  }else if(OS == 'WINNT'){
	appDir.append("firefox.exe");
  }else if(OS == 'Darwin'){
	appDir.append("firefox.exe");
  }
  target = appDir;

  app_path = dirSvc.get("AChrom", Ci.nsIFile).parent.clone();
  app_path.append('application.ini');

  args = ' -app '+app_path.path+' -no-remote -url '+url+' -P '+profile+' -title \"'+title+'\"';
  if(ipatt != '') args += ' -inculde \"' + ipatt + '\"';
  if(epatt != '') args += ' -exculde \"' + epatt + '\"';

  //dump(dst.path + '\n\n');
  var rv = CreateShortcut(target, title, args, icon, dst, false);

  if(rv == SHORTCUT_ALREADY_EXISTS){
	var result = prompts.confirm(null, "Shortcut already exists", "Shortcut already exists. Overwrite?");

	if(result == true) CreateShortcut(target, title, args, icon, dst, true);
  }
  //dump(args + '\n\n');

  return false;  //ダイアログは閉じない
}

//ウインドウを閉じる
function onCancel(){
  return true;   //ダイアログを閉じる
}

function onChangeStartURL(){
  //パターンが指定されていない場合、ホスト名を自動入力
  /*
  if (include_patt.value == ''){
	try{
	  var uri = ios.newURI(start_url.value, null, null);
	  var patt = '^' + uri.scheme + '://' + uri.host + '/';

	  include_patt.value = patt;
	}catch(e){
	  //Do nothing
	}
  }
   */

}


function chooseDirButton(){
  const nsIFilePicker = Ci.nsIFilePicker;

  var fp = Cc["@mozilla.org/filepicker;1"]
	.createInstance(nsIFilePicker);

  fp.init(window, "Choose directory", nsIFilePicker.modeGetFolder);
  //fp.appendFilters(nsIFilePicker.filterAll | nsIFilePicker.filterText);

  var rv = fp.show();
  if (rv == nsIFilePicker.returnOK) {
	var file = fp.file;
	var path = fp.file.path;

	//dump(path);
	$('#dir_name')[0].value = path;
	other_dir = file;
	$('#dst_dir')[0].selectedItem = $('#other_dir')[0];
  }
}


function createProf(){
  CreateProfileWizard();
  gProfileService.flush();  //プロファイルリストを更新
}

function deleteProf(){
  ConfirmDelete();
  gProfileService.flush();  //プロファイルリストを更新
}

function renameProf(){
  RenameProfile();
  gProfileService.flush();  //プロファイルリストを更新
}


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
  start_url = $('#start_url')[0];
  include_patt = $('#include_patt')[0];
  exclude_patt = $('#exclude_patt')[0];

  profile_startup();
}

addEventListener("load", onLoad, false);
