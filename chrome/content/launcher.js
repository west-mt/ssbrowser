
const Cc = Components.classes;
const Ci = Components.interfaces;
const Cu = Components.utils;


Cu.import("chrome://ssb/content/modules/CreateShortcut.jsm");

function onAccept(){
  return false;
}

function onCancel(){
  return true;  //ダイアログを閉じる
}

function onload() {
}

addEventListener("load", onload, false);
