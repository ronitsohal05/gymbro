from flask import Flask
from flask_cors import CORS

def create_app():

    app = Flask(__name__)
    CORS(app)

    @app.route("/pong", methods = ['GET'])
    def pong():
        return { "pong": True }

    return app