#!/usr/bin/env python

from flask import Flask, request
import json
from s3build import build
import os

app = Flask(__name__)

@app.route('/poetroid',methods=['POST'])
def gh_hook():
    # check request uri from github
    os.system('echo "%s"' % (deploy_time))
    payload = request.form.get('payload')
    data = json.loads(payload)
    deploy_time = build()
    os.system('echo "%s"' % (deploy_time))

    return "Done"

if __name__ == '__main__':
    app.run()
