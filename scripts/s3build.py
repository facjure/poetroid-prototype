import boto
import boto.s3
from boto.s3.key import Key
import os
import sys
from datetime import datetime
from dateutil import tz

AWS_ACCESS_KEY_ID = 'AKIAIRPHIRQAJFSVSLUA'
AWS_SECRET_ACCESS_KEY = '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'
BUCKET_NAME = 'p.com'
CONN = boto.connect_s3(AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)
BUCKET = CONN.create_bucket(BUCKET_NAME, location=boto.s3.connection.Location.DEFAULT)

POEMS_PATH = "/home/priyatam/github/poems"
FROZEN_PIE_PATH = "/home/priyatam/github/frozen-pie/pie"
POETROID_PATH = "/home/priyatam/github/poetroid"
CONFIG = "client" + os.sep + "CONFIG.yml"
LOG_FILE = "/home/priyatam/github/poetics/scripts/build.log"
INDEX_HTML = "client" + os.sep + ".build" + os.sep + "index.html"

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
    os.system("../env/bin/python pie.py --config " + POETROID_PATH + os.sep + CONFIG)
    os.chdir(POETROID_PATH)

    print 'Uploading %s to Amazon S3 bucket %s' % (INDEX_HTML, BUCKET_NAME)

    k = Key(BUCKET)
    k.key = 'index.html'
    k.set_contents_from_filename(INDEX_HTML)

    deploy_time = 'Deployed at ' + str(la_time) + "\n"
    with open(LOG_FILE, "a") as mylog:
        mylog.write(deploy_time)

    return deploy_time

if __name__ == '__main__':
    build()
