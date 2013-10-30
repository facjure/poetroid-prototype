from flask import Flask, request
import json
import s3build.build as build
import os

app = Flask(__name__)

@app.route('/poetics',methods=['POST'])
def poetics_hook():
    # check request uri from github
    payload = request.form.get('payload')
    data = json.loads(payload)
    deploy_time = build()
    os.system('echo "%s"' % (deploy_time))

    return "Done"

if __name__ == '__main__':
    app.run()
