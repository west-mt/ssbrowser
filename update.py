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

def chunk_report(bytes_so_far, chunk_size, total_size):
    if total_size > 0:
        percent = float(bytes_so_far) / total_size * 100
        sys.stdout.write('Downloaded %d / %d bytes (%0.2f%%)\r' % 
                         (bytes_so_far, total_size, percent))
    else:
        sys.stdout.write('Downloaded %d bytes\r' % bytes_so_far)


def chunk_read(response, chunk_size=8192, report_hook=None):
    try:
        total_size = int(response.info().getheader('Content-Length').strip())
    except:
        total_size = 0

    bytes_so_far = 0
    data = ''

    while True:
        chunk = response.read(chunk_size)
        bytes_so_far += len(chunk)

        if not chunk:
            break

        data += chunk
        if report_hook:
            report_hook(bytes_so_far, chunk_size, total_size)

    sys.stdout.write('\n\n')
    return data


if os.path.exists('.git'):
    print 'This directory is git repository!'
    print 'Try to use "git pull".'
    prompt('===\nPress any key...')
    sys.exit(3)

info_fname = 'update_info.json'
binary_fname = 'update.exe'
old_binary_fname = 'update.exe.OLD'


if os.path.exists(old_binary_fname):
    os.remove(old_binary_fname)

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
    #data = response.read()
    data = chunk_read(response, report_hook=chunk_report)
except urllib2.URLError, e:
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
                    r = 'n'
                    if not overwrite:
                        r = prompt('Update modified file "'+fname+'"? (y/N/all)')
                        if r == 'all':
                            overwrite = True
                    if r == 'y' or overwrite:
                        if fname == binary_fname:
                            print '** %s updated. **' % binary_fname
                            os.rename(binary_fname, old_binary_fname)

                            print '  %s has been renamed to \"%s\".' % (binary_fname, old_binary_fname)
                            print '  You can remove %s manually, or it will be automatically removed in the next time.' % old_binary_fname

                        data = zipf.read(info)
                        open(fname, 'wb').write(data)
                        print 'Update: ' + fname
    
zipf.close()
tempf.close()

prompt('===\nUpdate complete. Press any key...')


