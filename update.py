#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import sys
import urllib2
import tempfile
import zipfile
import hashlib
try:
    import simplejson as json
except:
    import json      


def prompt(msg):
    print msg,
    r = raw_input()
    return r


if os.path.exists('.git'):
    print 'This directory is git repository!'
    print 'Try to use "git pull".'
    prompt('===\nPress any key...')
    sys.exit(3)

info_fname = 'update_info.json'
binary_fname = 'update.exe'

url = json.load(open(info_fname))

#print url
if not isinstance(url, list):
    print "Cannot get update information."
    prompt('===\nPress any key...')
    sys.exit(1)

tempf = tempfile.NamedTemporaryFile(delete=True)
#print tempf.name

print 'Downloading zip file from Github...'
try:
    response = urllib2.urlopen(url[0])
    data = response.read()
except URLError, e:
    print "Download error occurred:"
    print "    " + e.reason
    prompt('===\nPress any key...')
    sys.exit(2)

tempf.write(data)
tempf.seek(0)
zipf = zipfile.ZipFile(tempf)

top_dir_len = -1
overwrite = False

print 'Finding modified files...'
for info in zipf.infolist():
    if top_dir_len < 0:
        top_dir_len = len(info.filename)
    else:
        fname = info.filename[top_dir_len:]
        if fname[-1] == '/':
            if not os.path.exists(fname):
                
                r = 'n'
                if not overwrite:
                    r = prompt('Create new directory "'+fname+'"? (y/N/all)')
                    if r == 'all':
                        overwrite = True
                if r == 'y' or overwrite:
                    os.mkdir(fname)
                    print 'Create: ' + fname
        else:
            if not os.path.exists(fname):

                r = 'n'
                if not overwrite:
                    r = prompt('Create new file "'+fname+'"? (y/N/all)')
                    if r == 'all':
                        overwrite = True
                if r == 'y' or overwrite:
                    data = zipf.read(info)
                    open(fname, 'wb').write(data)
                    print 'Create: ' + fname
            else:
                zip_md5 = hashlib.md5(zipf.read(info)).hexdigest()
                orig_md5 = hashlib.md5(open(fname, 'rb').read()).hexdigest()

                if zip_md5 != orig_md5:
                    if fname == binary_fname:
                        print '** %s updated. **' % binary_fname
                        print '  Please download from Github.'
                        continue

                    r = 'n'
                    if not overwrite:
                        r = prompt('Update modified file "'+fname+'"? (y/N/all)')
                        if r == 'all':
                            overwrite = True
                    if r == 'y' or overwrite:
                        data = zipf.read(info)
                        open(fname, 'wb').write(data)
                        print 'Update: ' + fname
    
zipf.close()
tempf.close()

prompt('===\nUpdate complete. Press any key...')


