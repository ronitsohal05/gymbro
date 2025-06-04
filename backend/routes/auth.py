# routes/auth.py

import bcrypt
from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,          # single decorator for both access & refresh
    get_jwt_identity
)
from services.db import get_user_collection

# Blueprint without nested prefix—app.py will mount under /api/auth
auth_bp = Blueprint("auth", __name__)

users = get_user_collection()


@auth_bp.route("/signup", methods=["POST"])
def signup():
    """
    Expects JSON: {"username": "<str>", "password": "<str>"}
    Creates a new user with a bcrypt-hashed password.
    """
    data = request.get_json() or {}
    username = data.get("username", "").strip().lower()
    password = data.get("password", "")
    name = data.get("name", "").strip().lower()
    gender = data.get("gender", " ").strip().lower()
    height = data.get("height", "").strip()
    age = data.get("age", "").strip()
    weight = data.get("weight", "").strip()
    goal = data.get("goal", "").strip().lower()

    if not username or not password:
        return jsonify({"error": "username and password required"}), 400

    # Check for existing user
    if users.find_one({"username": username}):
        return jsonify({"error": "username already taken"}), 409

    # Hash and store
    pw_hash = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
    users.insert_one({
        "username": username,
        "password_hash": pw_hash,
        "name": name,
        "gender": gender,
        "age": age,
        "weight": weight,
        "height": height,
        "goal": goal,
        "message_threads" : []
    })

    return jsonify({"msg": "User created"}), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    """
    Expects JSON: {"username": "<str>", "password": "<str>"}
    Verifies the bcrypt hash, then issues access and refresh tokens.
    """
    data = request.get_json() or {}
    username = data.get("username", "").strip().lower()
    password = data.get("password", "")

    if not username or not password:
        return jsonify({"error": "username and password required"}), 400

    user = users.find_one({"username": username})
    if not user or not bcrypt.checkpw(password.encode("utf-8"), user["password_hash"]):
        return jsonify({"error": "Invalid credentials"}), 401

    access_token = create_access_token(identity=username)
    refresh_token = create_refresh_token(identity=username)
    return jsonify({
        "access_token": access_token,
        "refresh_token": refresh_token
    }), 200


@auth_bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    """
    Expects the refresh token in Authorization header: Bearer <refresh_token>.
    Returns a brand-new access token.
    """
    current_user = get_jwt_identity()
    new_access = create_access_token(identity=current_user)
    return jsonify({"access_token": new_access}), 200
