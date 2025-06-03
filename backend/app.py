from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route("/pong", methods = ['GET'])
def pong():
    return { "pong": True }

if __name__ == "__main__":
    app.run(debug=True)