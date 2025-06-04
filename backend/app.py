import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from config import Config
from services.db import get_user_collection
from routes.auth import auth_bp
from routes.gymbro import gymbro_bp
from flask_jwt_extended import (
    JWTManager,
    jwt_required,
    get_jwt_identity,
)
from openai import OpenAI
from datetime import datetime, timedelta
def create_app():

    app = Flask(__name__)
    CORS(app)

    app.config["JWT_SECRET_KEY"] = Config.JWT_SECRET_KEY
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(minutes=Config.JWT_ACCESS_TOKEN_EXPIRES)
    app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(days=Config.JWT_REFRESH_TOKEN_EXPIRES)

    jwt = JWTManager(app)



    app.register_blueprint(gymbro_bp, url_prefix="/gymbro")
    app.register_blueprint(auth_bp, url_prefix="/auth")



    return app