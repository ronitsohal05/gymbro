import os
from flask import Flask
from flask_cors import CORS
from config import Config
from routes.auth import auth_bp
from routes.gymbro import gymbro_bp
from routes.profile import profile_bp
from routes.logging import logging_bp
from routes.agent import agent_bp
from routes.pinecone import pinecone_bp
from flask_jwt_extended import JWTManager

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
    app.register_blueprint(profile_bp, url_prefix="/profile")
    app.register_blueprint(logging_bp, url_prefix="/log")
    app.register_blueprint(agent_bp, url_prefix="/agent")
    app.register_blueprint(pinecone_bp, url_prefix="/pinecone")



    return app