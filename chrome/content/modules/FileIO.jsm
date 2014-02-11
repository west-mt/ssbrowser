/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is WebRunner.
 *
 * The Initial Developer of the Original Code is Mozilla Corporation.
 * Portions created by the Initial Developer are Copyright (C) 2007
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Mark Finkle <mark.finkle@gmail.com>, <mfinkle@mozilla.com>
 *   Cesar Oliveira <a.sacred.line@gmail.com>
 *   Matthew Gertner <matthew@allpeers.com>
 *
 * ***** END LICENSE BLOCK ***** */

const Cc = Components.classes;
const Ci = Components.interfaces;

EXPORTED_SYMBOLS = ["FileIO"];

const PR_WRONLY = 0x02;
const PR_CREATE_FILE = 0x08;
const PR_TRUNCATE = 0x20;

const PR_PERMS_FILE = 0644;
const PR_PERMS_DIRECTORY = 0755;

const PR_UINT32_MAX = 4294967295;


var FileIO = {

  // Returns the text content of a given nsIFile
  fileToString : function(file) {
    // Get a nsIFileInputStream for the file
    var fis = Cc["@mozilla.org/network/file-input-stream;1"].createInstance(Ci.nsIFileInputStream);
    fis.init(file, -1, 0, 0);

    // Get an intl-aware nsIConverterInputStream for the file
    var is = Cc["@mozilla.org/intl/converter-input-stream;1"].createInstance(Ci.nsIConverterInputStream);
    is.init(fis, "UTF-8", 1024, Ci.nsIConverterInputStream.DEFAULT_REPLACEMENT_CHARACTER);

    // Read the file into string via buffer
    var data = "";
    var buffer = {};
    while (is.readString(4096, buffer) != 0) {
      data += buffer.value;
    }

    // Clean up
    is.close();
    fis.close();

    return data;
  },

  // Saves the given text string to the given nsIFile
  stringToFile : function(data, file, encoding) {
    encoding = encoding || "UTF-8";
        
    // Get a nsIFileOutputStream for the file
    var fos = Cc["@mozilla.org/network/file-output-stream;1"].createInstance(Ci.nsIFileOutputStream);
    fos.init(file, PR_WRONLY | PR_CREATE_FILE | PR_TRUNCATE, (arguments.length == 3 ? arguments[2] : PR_PERMS_FILE), 0);

    // Get an intl-aware nsIConverterOutputStream for the file
    var os = Cc["@mozilla.org/intl/converter-output-stream;1"].createInstance(Ci.nsIConverterOutputStream);
    os.init(fos, encoding, 0, 0x0000);

    // Write data to the file
    os.writeString(data);

    // Clean up
    os.close();
    fos.close();
  }
};
