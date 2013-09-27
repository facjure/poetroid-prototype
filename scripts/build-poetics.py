from flask import Flask, request
import json

app = Flask(__name__)

@app.route('/',methods=['POST'])
def poetics_hook():
    # got commit
    data = json.loads(request.data)
    print data

if __name__ == '__main__':
   app.run()
