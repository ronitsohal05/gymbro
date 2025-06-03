from flask import Flask
from flask_cors import CORS
from routes.gymbro import gymbro_bp

def create_app():

    app = Flask(__name__)
    CORS(app)


    app.register_blueprint(gymbro_bp, url_prefix="/gymbro")


    return app