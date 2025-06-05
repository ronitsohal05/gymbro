from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.db import get_user_collection, get_meal_collection, get_workout_collection
from datetime import datetime, timedelta

profile_bp = Blueprint("profile", __name__)
users = get_user_collection()
meals = get_meal_collection()
workouts = get_workout_collection()

@profile_bp.route("/goal", methods=["POST"])
@jwt_required()
def set_goal():
    data = request.get_json() or {}
    goal_text = data.get("goal", "").strip()
    if not goal_text:
        return jsonify({ "error": "goal is required" }), 400

    username = get_jwt_identity()
    users.update_one(
        { "username": username },
        { "$set": { "goal": goal_text } }
    )
    return jsonify({ "msg": "Goal updated" }), 200

@profile_bp.route("/", methods=["GET"])
@jwt_required()
def get_profile():
    username = get_jwt_identity()
    user = users.find_one({ "username": username }, { "_id": 0, "password_hash": 0 })
    if not user:
        return jsonify({ "error": "User not found" }), 404
    return jsonify(user), 200

@profile_bp.route("/stats", methods=["GET"])
@jwt_required()
def get_user_stats():
    username = get_jwt_identity()
    user = users.find_one({"username": username}, {"_id": 0})

    if not user:
        return jsonify({"error": "User not found"}), 404

    thirty_days_ago = datetime.now() - timedelta(days=30)

    meal_count = meals.count_documents({
        "username": username,
        "meal_date": {"$gte": thirty_days_ago}
    })

    workout_count = workouts.count_documents({
        "username": username,
        "workout_date": {"$gte": thirty_days_ago}
    })

    return jsonify({
        **{k: user.get(k) for k in ["name", "age", "height", "weight", "goal"]},
        "past30Meals": meal_count,
        "past30Workouts": workout_count
    })