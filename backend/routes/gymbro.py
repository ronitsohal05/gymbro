import os
from flask import Blueprint, request, jsonify
from openai import OpenAI
from dotenv import load_dotenv
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.db import get_user_collection, get_meal_collection, get_workout_collection
from datetime import datetime, timedelta

gymbro_bp = Blueprint("gymbro", __name__)

load_dotenv()
API_KEY = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=API_KEY)

users = get_user_collection()
meals = get_meal_collection()
workouts = get_workout_collection()


@gymbro_bp.route("/chat", methods=["POST"])
@jwt_required()
def chat():
    """
    Expects a JSON: {"message": "<user's text>" }
    Returns a JSON: {"reply": "assistant's respone>" }
    """
    data = request.get_json() or {}
    user_message = data.get("message", "").strip()
    if not user_message:
        return jsonify({"error": "No Message Provided"}), 400

    username = get_jwt_identity()
    user = users.find_one({"username": username})



    if not user:
        return jsonify({"error": "User not found"}), 404
    
    classification = classify_message(user_message)
    
    if classification == "nutrition":
        reply = handle_nutrition(user, user_message)
    elif classification == "workout":
        reply = handle_workout(user, user_message)
    else:
        reply = general(user_message)

    return jsonify({ "reply": reply })
    


def classify_message(message):
    try:
        classification_prompt = f"""
        Classify the following message into one of the categories: "nutrition", "workout", or "other".

        Respond with only the category name.
        """.strip()

        response = client.responses.create(
            model="gpt-4o-mini",
            input=message,
            instructions=classification_prompt,
            store=True
        )

        return response.output_text

    except Exception as e:
        return jsonify({"error": "OpenAI Classification request failed"}), 500
    
def handle_nutrition(user):

    username = user.get("username", "")
    name = user.get("name", "")
    age = user.get("age", "")
    weight = user.get("weight", "")
    height = user.get("height", "")
    goal = user.get("goal", "")

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

def handle_workout(user, message):

    username = user.get("username", "")
    name = user.get("name", "")
    age = user.get("age", "")
    weight = user.get("weight", "")
    height = user.get("height", "")
    goal = user.get("goal", "")

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

def general(message):
    system_instructions = f"""
    You are GymBro, an AI personal trainer and nutritionist.
    """.strip()

    try:
        response = client.responses.create(
            model="gpt-4o-mini",
            input=message,
            instructions=system_instructions,
            store=True
        )


        output = response.output_text

        return output
    

    except Exception as e:
        return jsonify({"error": "OpenAI request failed"}), 50

