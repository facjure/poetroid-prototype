#!/usr/bin/env python

import boto
import boto.s3
from boto.s3.key import Key
import os
import sys
from datetime import datetime
from dateutil import tz
from tempfile import mkstemp
from shutil import move
from os import remove, close
from glob import glob
import re


AWS_ACCESS_KEY_ID = 'AKIAIQW6ONNHX63YD6IQ'
AWS_SECRET_ACCESS_KEY = '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'
BUCKET_NAME = 'poetroid.com'
CONN = boto.connect_s3(AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)
BUCKET = CONN.create_bucket(BUCKET_NAME, location=boto.s3.connection.Location.DEFAULT)

# poetroid paths
POEMS_PATH = "/Users/priyatam/Dev/github/facjure/poetroid-poems"
FROZEN_PIE_PATH = "/Users/priyatam/Dev/github/priyatam/frozen-pie/pie"
POETROID_PATH = "/Users/priyatam/Dev/github/facjure/poetroid"
CONFIG = "client" + os.sep + "config.build.yml"
LOG_FILE = "/Users/priyatam/Dev/github/facjure/poetroid/scripts/build.log"
INDEX_HTML = "client" + os.sep + ".build" + os.sep + "index.html"
JS_DIR = "client" + os.sep + "js"


def build():
    utc = datetime.utcnow()
    from_zone = tz.gettz('UTC')
    to_zone = tz.gettz('America/Los_Angeles')
    utc = utc.replace(tzinfo=from_zone)
    la_time = utc.astimezone(to_zone)

    os.chdir(POETROID_PATH)
    os.system("git pull origin master")
    os.chdir(POEMS_PATH)
    os.system("git pull origin master")
    os.chdir(FROZEN_PIE_PATH)
    os.system("python pie.py --config " + POETROID_PATH + os.sep + CONFIG)
    os.chdir(POETROID_PATH)

    print 'Uploading %s to Amazon S3 bucket %s' % (INDEX_HTML, BUCKET_NAME)

    k = Key(BUCKET)
    k.key = 'index.html'
    k.set_contents_from_filename(INDEX_HTML)

    for jsfile in glob(JS_DIR + os.sep + "*.js"):
        k = Key(BUCKET)
        filename = "js/" + os.path.basename(jsfile)
        k.key = filename
        k.set_contents_from_filename(jsfile)

    no = update_yaml()

    deploy_time = 'Deployed ' + str(no) + ' at ' + str(la_time) + "\n"
    with open(LOG_FILE, "a") as mylog:
        mylog.write(deploy_time)

    return deploy_time


def update_yaml():
    os.chdir(POETROID_PATH)

    #Create temp file
    fh, abs_path = mkstemp()
    new_file = open(abs_path,'w')
    old_file = open(CONFIG)
    no = -1

    for line in old_file:
        build = re.match(r'build: (\d+)\n$', line)
        if build:
            no = build.group(1)
            no= str(int(no) + 1)
            line = 'build: %s\n' % no
        new_file.write(line)

    # close temp file
    new_file.flush()
    os.fsync(new_file.fileno())
    new_file.close()
    old_file.close()

    remove(CONFIG)
    move(abs_path, CONFIG)
    return no


if __name__ == '__main__':
   build()
