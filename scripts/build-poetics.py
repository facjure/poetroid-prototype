from flask import Flask, request
import json
from datetime import datetime
from dateutil import tz
import os

app = Flask(__name__)

# configure on server
poems_path = "/home/priyatam/github/poems"
frozen_pie_path = "/home/priyatam/github/frozen-pie"
poetics_path = "/home/priyatam/github/poetics"
github_url = "git@github.com:Facjure/poetics.git"
log_file = "/home/priyatam/github/poetics/scripts/build.log"

@app.route('/poetics',methods=['POST'])
def poetics_hook():
    # got commit. need to do security check
    payload = request.form.get('payload')
    data = json.loads(payload)

    utc = datetime.utcnow()
    from_zone = tz.gettz('UTC')
    to_zone = tz.gettz('America/New_York')
    utc = utc.replace(tzinfo=from_zone)
    boston_time = utc.astimezone(to_zone)

    os.chdir(poems_path)
    os.system("git pull origin master")
    os.chdir(frozen_pie_path)
    os.system("./env/bin/python bake.py --config " + poetics_path + os.sep + "config.yml")
    os.chdir(poetics_path)
    os.system("mkdir deploy")
    os.system("mv .build/index.html deploy/")
    os.system("rm -rf .build")
    os.system("git clone -b gh-pages " + github_url + " .build")
    os.system("cp deploy/index.html .build/")
    deploy_time = 'new deploy ' + str(boston_time) + "\n"
    with open(log_file, "a") as mylog:
        mylog.write(deploy_time)
    os.system("cd .build; git add index.html; git commit -m 'new deploy " + str(boston_time) + "'; git push --force origin gh-pages")
    return deploy_time

if __name__ == '__main__':
   app.run()