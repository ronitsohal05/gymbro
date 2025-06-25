
from flask import Blueprint, request, jsonify
from elevenlabs.client import ElevenLabs
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.db import get_user_collection, get_meal_collection, get_workout_collection
from datetime import datetime, timedelta


agent_bp = Blueprint("agent", __name__)

users = get_user_collection()
meals = get_meal_collection()
workouts = get_workout_collection()

def convertISOtoDateTimeObject(iso_string):
    return datetime.fromisoformat(iso_string.replace("Z", "+00:00"))

@agent_bp.route("/nutrition_advice", methods=["GET"])
@jwt_required()
def nutrition_advice():
    """
    Retrieve and format a user's nutrition logs from the past 7 days.

    This function accesses the user's logged meals over the last week,
    processes the data, and returns it in a structured and human-readable format.
    The output can be used to provide insights into the user's dietary patterns.

    Returns:
        str: A formatted string representing the user's nutrition logs from the past 7 days.
    """

    username = get_jwt_identity()

    seven_days_ago = datetime.now() - timedelta(days=7)

    past_seven_days_meals = list(meals.find({ 
        "username": username, 
        "meal_date": {"$gte" : seven_days_ago}
    }))

    meal_logs = ""
    if past_seven_days_meals:
        for meal in past_seven_days_meals:
            meal_type = meal.get("meal_type", "Meal")
            meal_date = meal.get("meal_date")
            meal_items = meal.get("meal_items", [])
            date_str = meal_date.strftime('%Y-%m-%d') if isinstance(meal_date, datetime) else str(meal_date)

            meal_logs += f"- {meal_type} on {date_str}:\n"
            for item in meal_items:
                meal_logs += f"  -{item} \n"
    else:
        meal_logs = "- No meals logged.\n"

    print(meal_logs)

    return jsonify({"log": meal_logs.strip()})

@agent_bp.route("/workout_advice", methods=["GET"])
@jwt_required()
def workout_advice():
    """
    Retrieve and format a user's workout logs from the past 7 days.

    This function accesses the user's logged workouts over the last week,
    processes the data, and returns it in a structured and human-readable format.
    The output can be used to provide insights into the user's workout patterns.

    Returns:
        str: A formatted string representing the user's workout logs from the past 7 days.
    """

    username = get_jwt_identity()

    seven_days_ago = datetime.now() - timedelta(days=7)

    past_seven_days_workouts = list(workouts.find({ 
        "username": username, 
        "workout_date": {"$gte" : seven_days_ago}
    }))

    workout_logs = ""
    if past_seven_days_workouts:
        for workout in past_seven_days_workouts:
            workout_type = workout.get("workout_type", "Workout")
            workout_date = workout.get("workout_date")
            activities = workout.get("workout_activities", [])
            date_str = workout_date.strftime('%Y-%m-%d') if isinstance(workout_date, datetime) else str(workout_date)

            workout_logs += f"- {workout_type} on {date_str}:\n"
            for ex in activities:
                name = ex.get("name", "Exercise")
                mode = ex.get("mode", "")
                if mode == "reps":
                    sets = ex.get("sets", "?")
                    reps = ex.get("reps", "?")
                    workout_logs += f"  -{name}: {sets} sets of {reps} reps\n"
                else:
                    duration = ex.get("duration", "?")
                    workout_logs += f"  -{name}: {duration} minutes\n"
    else:
        workout_logs = "- No workouts logged.\n"

    

    return jsonify({"log": workout_logs.strip()})

@agent_bp.route("/log_meal", methods=["POST"])
@jwt_required()
def agent_log_meal():
    data = request.get_json()
    print(data)
    username = get_jwt_identity()
    date = convertISOtoDateTimeObject(data.get("date"))
    type = data.get("type")
    items = data.get("items", [])
    if not date or not items:
        return jsonify({"error": "Date and items are required"}), 400

    meals.insert_one({ "username": username, "meal_date": date, "meal_type": type, "meal_items": items })
    return jsonify({ "msg": "Meal logged successfully" }), 200

@agent_bp.route("/log_workout", methods=["POST"])
@jwt_required()
def agent_log_workout():
    data = request.get_json()
    print(data)
    username = get_jwt_identity()
    date = convertISOtoDateTimeObject(data.get("date"))
    type = data.get("type")
    activities = data.get("activities")
    notes = data.get("notes")

    if not date or not activities:
        return jsonify({"error": "Date and activities are required"}), 400

    workouts.insert_one({ "username": username, "workout_date": date, "workout_type": type, "workout_activities": activities, "notes": notes })
    return jsonify({ "msg": "Workout logged successfully" }), 200