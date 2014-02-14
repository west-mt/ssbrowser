
const Cc = Components.classes;
const Ci = Components.interfaces;
const Cu = Components.utils;

EXPORTED_SYMBOLS = ["CreateShortcut", "SHORTCUT_ALREADY_EXISTS"];

const PR_WRONLY = 0x02;
const PR_CREATE_FILE = 0x08;
const PR_TRUNCATE = 0x20;

const PR_PERMS_FILE = 0644;
const PR_PERMS_DIRECTORY = 0755;

const PR_UINT32_MAX = 4294967295;


const SHORTCUT_ALREADY_EXISTS = -2;


var CreateShortcut = function(target, name, args, icon, dst_dir, overwrite){
  var OS = Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULRuntime).OS;

  if(OS == 'Linux'){
	Cu.import("chrome://ssb/content/modules/FileIO.jsm");

    var file = dst_dir.append(name + ".desktop");
    if (file.exists()){
	  if(!overwrite) return SHORTCUT_ALREADY_EXISTS;

      file.remove(false);
	}
	
    file.create(Ci.nsIFile.NORMAL_FILE_TYPE, PR_PERMS_FILE);

    var cmd = "[Desktop Entry]\n";
    cmd += "Name=" + name + "\n";
    cmd += "Type=Application\n";
    cmd += "Comment=Web Application\n";
    cmd += "Exec=\"" + target.path + "\" " + args + "\n";
    cmd += "Icon=" + icon.path + "\n";

    FileIO.stringToFile(cmd, file);

    return file;


  }else if(OS == 'WINNT'){
	Cu.import ("resource://gre/modules/ctypes.jsm");


  }else if(OS == 'Darwin'){
	//NOT IMPLEMENTED!!
  }

};
