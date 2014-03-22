
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
const SHORTCUT_ERROR = -1;


var CreateShortcut = function(target, name, args, icon, dst_dir, overwrite){
  var OS = Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULRuntime).OS;


  if(!target || !name || !args || !icon || !dst_dir) return SHORTCUT_ERROR;
  if(target=='' || name=='' || args=='' || icon=='' || dst_dir=='') return SHORTCUT_ERROR;

  //dump('target: '+target+'\n');
  //dump('name:   '+name+'\n');
  //dump('args:   '+args+'\n');
  //dump('ICON:   '+icon.path+'\n');
  //dump('DST:    '+dst_dir.path+'\n');
  if(OS == 'Linux'){
	Cu.import("chrome://ssb/content/modules/FileIO.jsm");

    var file = dst_dir.clone();

	file.append(name + ".desktop");
    //var file = dst_dir.append(name);
	//dump(file.path+'\n');

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
	Cu.import("chrome://ssb/content/modules/WindowsShortcutService.jsm");

    var file = dst_dir.clone();

	file.append(name + ".lnk");
    if (file.exists()){
	  if(!overwrite) return SHORTCUT_ALREADY_EXISTS;

      file.remove(false);
	}
	setShortcut(file, target, null, args, null, icon);

  }else if(OS == 'Darwin'){
	//NOT IMPLEMENTED!!
  }

};
