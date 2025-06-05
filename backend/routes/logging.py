from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.db import get_meal_collection, get_workout_collection
from datetime import datetime

logging_bp = Blueprint("logging", __name__)
meals = get_meal_collection()
workouts = get_workout_collection()

def convertISOtoDateTimeObject(iso_string):
    return datetime.fromisoformat(iso_string.replace("Z", "+00:00"))

def to_date_string(date):
    return date.strftime("%Y-%m-%d")

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

    workouts.insert_one({ "username": username, "workout_date": date, "workout_type": type, "workout_activities": activities, "notes": notes })
    return jsonify({ "msg": "Workout logged successfully" }), 201

@logging_bp.route("/by-date/<date>", methods=["GET"])
@jwt_required()
def logs_by_date(date):
    username = get_jwt_identity()
    date_str = date

    if date_str:
        # Specific date: return meals and workouts
        try:
            start = datetime.fromisoformat(date_str)
            end = start.replace(hour=23, minute=59, second=59)
        except:
            return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400
        
        print(start, end)

        meals_logged = list(meals.find({
            "username": username,
            "meal_date": {"$gte": start, "$lte": end}
        }, {"_id": 0}))

        workouts_logged = list(workouts.find({
            "username": username,
            "workout_date": {"$gte": start, "$lte": end}
        }, {"_id": 0}))

        print(meals_logged)
        # Flatten for frontend
        formatted_meals = [
            { "category": m.get("meal_type"), "items": m.get("meal_items", []) }
            for m in meals_logged
        ]
        formatted_workouts = [
            ex for w in workouts_logged for ex in w.get("workout_activities", [])
        ]

        return jsonify({ "meals": formatted_meals, "workouts": formatted_workouts })

    else:
        # No date: return highlights for calendar
        all_meals = meals.find({"username": username}, {"date": 1})
        all_workouts = workouts.find({"username": username}, {"date": 1})

        highlights = {}

        for m in all_meals:
            key = to_date_string(m["date"])
            if key not in highlights:
                highlights[key] = {}
            highlights[key]["meals"] = True

        for w in all_workouts:
            key = to_date_string(w["date"])
            if key not in highlights:
                highlights[key] = {}
            highlights[key]["workouts"] = True

        return jsonify(highlights)