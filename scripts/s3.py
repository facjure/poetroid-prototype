#!/usr/bin/env python

"""
  S3 deploy and other utils
"""

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


def deploy():
    """ deploy tasks"""
    # cleanup git
    os.chdir(config['poetroid'])
    os.system("git pull origin master")
    os.chdir(config['poems'])
    os.system("git pull origin master")
    os.chdir(config['frozen_pie'])

    # run frozen pie
    os.system("python pie.py --config " + config['poetroid_config'])
    os.chdir(config['poetroid'])

    # init s3
    CONN = boto.connect_s3(config['AWS_ACCESS_KEY_ID'], config['AWS_SECRET_ACCESS_KEY'])
    BUCKET = CONN.create_bucket(config['BUCKET_NAME'], location=boto.s3.connection.Location.DEFAULT)

    deploy_index(config)

    # update version
    app_version = update_version()
    deploy_time = 'Deployed ' + str(app_version) + ' at ' + str(la_time) + "\n"
    with open(LOG, "a") as mylog:
        mylog.write(deploy_time)
    return deploy_time


def deploy_index(config):
    """ index.html -> S3"""
    utc = datetime.utcnow()
    utc = utc.replace(tzinfo=tz.gettz('UTC'))
    la_time = utc.astimezone(tz.gettz('America/Los_Angeles'))

    print 'Uploading %s to Amazon S3 bucket %s' % (index_file, bucket)

    k = Key(BUCKET)
    k.key = 'index.html'
    k.set_contents_from_filename(INDEX_HTML)


def deploy_js(bucket):
    """ *.js -> s3"""
     for jsfile in glob("js" + os.sep + "*.js"):
        k = Key(bucket)
        filename = "js/" + os.path.basename(jsfile)
        k.key = filename
        k.set_contents_from_filename(jsfile)


def update_version():
    os.chdir(config['poetroid'])

    #Create temp file
    fh, abs_path = mkstemp()
    new_file = open(abs_path,'w')
    old_file = open(config['poetroid_config'])
    app_version = -1

    for line in old_file:
        build = re.match(r'build: (\d+)\n$', line)
        if build:
            app_version = build.group(1)
            app_version = str(int(app_version) + 1)
            line = 'build: %s\n' % app_version
        new_file.write(line)

    # close temp file
    new_file.flush()
    os.fsync(new_file.fileno())
    new_file.close()
    old_file.close()

    remove(config['config'])
    move(abs_path, CONFIG)
    return app_version


if __name__ == '__main__':
    # load config
    with open(".config.yml", "r", "utf-8") as fin:
        config = yaml.load(fin.read())

    build()
