from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.db import get_meal_collection, get_workout_collection
from datetime import datetime

logging_bp = Blueprint("logging", __name__)
meals = get_meal_collection()
workouts = get_workout_collection()

def convertISOtoDateTimeObject(iso_string):
    return datetime.fromisoformat(iso_string.replace("Z", "+00:00"))

@logging_bp.route("/meal", methods=["POST"])
@jwt_required()
def log_meal():
    data = request.get_json()
    username = get_jwt_identity()
    date = convertISOtoDateTimeObject(data.get("date"))
    type = data.get("type")
    items = data.get("items", [])
    if not date or not items:
        return jsonify({"error": "Date and items are required"}), 400

    meals.insert_one({ "username": username, "meal_date": date, "meal_type": type, "meal_items": items })
    return jsonify({ "msg": "Meal logged successfully" }), 201

@logging_bp.route("/workout", methods=["POST"])
@jwt_required()
def log_workout():
    data = request.get_json()
    username = get_jwt_identity()
    print(data)
    date = convertISOtoDateTimeObject(data.get("date"))
    type = data.get("type")
    activities = data.get("activities")
    notes = data.get("notes")

    if not date or not activities:
        return jsonify({"error": "Date and activities are required"}), 400

    workouts.insert_one({ "username": username, "date": date, "type": type, "activities": activities, "notes": notes })
    return jsonify({ "msg": "Workout logged successfully" }), 201
