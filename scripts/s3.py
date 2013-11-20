#!/usr/bin/env python

"""
  Build and deploy to S3.

  Must have AWS_ACCESS_KEY and AWS_SECRET_KEY set in your sys env.

  run:
    s3.py
        or
    s3.py --config=path_to_config_yml

    TODO: Refactor into Literatte: util.build(), util.deploy_s3()

"""

import boto
import boto.s3
import yaml
from boto.s3.key import Key
import os
import sys
from codecs import open
from datetime import datetime
from dateutil import tz
from tempfile import mkstemp
from shutil import move
from os import remove, close
from glob import glob
import re


def build(config):
    """ deploy tasks"""
    # cleanup git
    os.chdir(config['poetroid'])
    os.system("git pull origin master")
    os.chdir(config['poems'])
    os.system("git pull origin master")

    # run frozen pie
    os.chdir(config['frozen_pie'])
    os.system("python pie.py --config " + config['poetroid_config'])
    os.chdir(config['poetroid'])

    AWS_ACCESS_KEY = os.environ['AWS_ACCESS_KEY']
    AWS_SECRET_KEY = os.environ['AWS_SECRET_KEY']

    # s3
    CONN = boto.connect_s3(AWS_ACCESS_KEY, AWS_SECRET_KEY)
    BUCKET = CONN.create_bucket(config['BUCKET_NAME'], location=boto.s3.connection.Location.DEFAULT)
    deploy(config, BUCKET)

    # update version
    app_version = inc_version(config)
    utc = datetime.utcnow()
    utc = utc.replace(tzinfo=tz.gettz('UTC'))
    la_time = utc.astimezone(tz.gettz('America/Los_Angeles'))
    deploy_time = 'Deployed ' + str(app_version) + ' at ' + str(la_time) + "\n"
    with open(config['log'], "a") as mylog:
        mylog.write(deploy_time)

    return deploy_time


def deploy(config, bucket):
    """ index.html -> S3 AND *.js -> s3 """
    print 'Uploading %s to Amazon S3 bucket %s' % ('index.html', config['BUCKET_NAME'])
    k = Key(bucket)
    k.key = 'index.html'
    k.set_contents_from_filename(config['index_html'])

    for jsfile in glob("js" + os.sep + "*.js"):
        k = Key(bucket)
        filename = "js/" + os.path.basename(jsfile)
        k.key = filename
        k.set_contents_from_filename(jsfile)


def inc_version(config):
    """ increment app's minor version in config.yml """
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

    remove(config['poetroid_config'])
    move(abs_path, config['poetroid_config'])
    return app_version


def load_config():
    """"""
    with open("config.yml", "r", "utf-8") as fin:
        config = yaml.load(fin.read())

    poetroid_config = config['poetroid'] + os.sep + "config.yml"
    js = config['poetroid'] + os.sep + "js"
    log = config['poetroid'] + os.sep + "build.log"
    index_html = config['poetroid'] + os.sep + ".build" + os.sep + "index.html"

    return newdict({'poetroid_config': poetroid_config, 'js': js, 'log': log, 'index_html': index_html }, config)


def newdict(*dicts):
    """Creates a new dictionary out of several dictionaries"""
    _dict = {}
    for d in dicts:
        _dict.update(d)
    return _dict

if __name__ == '__main__':
    config = load_config()
    build(config)
