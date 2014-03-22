ssbrowser
=========

Site specific browser based on Firefox/XULRunner.  
You can view specific web site as an independent application.

Usage
-----

You can simply call "launcher.bat" or "launcher.sh" to make shortcut icon
for web application.

Or, directly call:

_(path-to-firefox)_/firefox -app _(path-to-ssbrowser)_/application.ini [-no-remote] -url (URL) _[-include (include-regexp)]_ _[-exclude (exclude-regexp)]_ _[-P (profile-name)]_ _[-title (window-title)]_

OR:

_(path-to-xulrunner)_/xulrunner _(path-to-ssbrowser)_/application.ini [-no-remote] -url (URL) _[-include (include-regexp)]_ _[-exclude (exclude-regexp)]_ _[-P (profile-name)]_ _[-title (window-title)]_

If you will use multiple ssbrowser instance, add "-no-remote" option (and use different profiles).

