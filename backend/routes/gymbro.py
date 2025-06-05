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
    
    classification = classify_message(user, user_message)
    
    try:
        if classification == "nutrition":
            response = handle_nutrition(user, user_message)
        elif classification == "workout":
            response = handle_workout(user, user_message)
        else:
            response = general(user, user_message)

        reply = response.output_text

        # Update last message id
        users.update_one(
            {"username": username},
            {"$set": {
                "last_message_id": response.id
            }}
        )

        return jsonify({ "reply": reply })

    except RuntimeError as err:
        return jsonify({ "error": str(err) }), 500
    


def classify_message(user, message):

    last_message_id = user.get("last_message_id", "")

    try:
        classification_prompt = f"""
        Classify the following message into one of the categories: "nutrition", "workout", or "other".

        Respond with only the category name.
        """.strip()

        if last_message_id == "":
            response = client.responses.create(
                model="gpt-4o-mini",
                input=message,
                instructions=classification_prompt,
                store=True
            )

        else:
            response = client.responses.create(
                model="gpt-4o-mini",
                input=message,
                instructions=classification_prompt,
                previous_response_id=last_message_id,
                store=True
            )

        return response.output_text

    except Exception as e:
        raise RuntimeError("OpenAI request failed") from e
    
def handle_nutrition(user, message):

    username = user.get("username", "")
    name = user.get("name", "")
    age = user.get("age", "")
    weight = user.get("weight", "")
    height = user.get("height", "")
    goal = user.get("goal", "")
    last_message_id = user.get("last_message_id", "")

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


    system_instructions = f"""
    You are GymBro, a personal nutrition coach for fitness-oriented users.

    The user is:
    - Name: {name}
    - Age: {age}
    - Weight: {weight} lbs
    - Height: {height} inches
    - Goal: {goal}

    Meal logs from the past 7 days:
    {meal_logs}

    Based on what the user has recently eaten, provide personalized nutrition advice.
    Recommend a meal that supports their goal, avoiding repetition and ensuring nutritional variety.
    """.strip()

    try:
        if last_message_id == "":
            response = client.responses.create(
                model="gpt-4o-mini",
                input=message,
                instructions=system_instructions,
                store=True
            )

        else:
            response = client.responses.create(
                model="gpt-4o-mini",
                input=message,
                instructions=system_instructions,
                previous_response_id=last_message_id,
                store=True
            )

        return response
    

    except Exception as e:
        raise RuntimeError("OpenAI request failed") from e

def handle_workout(user, message):

    username = user.get("username", "")
    name = user.get("name", "")
    age = user.get("age", "")
    weight = user.get("weight", "")
    height = user.get("height", "")
    goal = user.get("goal", "")
    last_message_id = user.get("last_message_id", "")

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

        

    system_instructions = f"""
    You are GymBro, a personal fitness coach and workout planner.

    The user is:
    - Name: {name}
    - Age: {age}
    - Weight: {weight} lbs
    - Height: {height} inches
    - Goal: {goal}

    Here is their workout history from the past 7 days:
    {workout_logs}

    Your responsibilities:
    - If the user is seeking advice, highlight ways they can improve their training—this could include frequency, variety, form, or balancing different muscle groups.
    - If they are asking for a new workout:
        - Suggest a well-structured session tailored to their goal.
        - Avoid overloading muscle groups they’ve trained in the past 1–2 days.
        - Promote a balanced routine (e.g., push/pull, upper/lower body, cardio/strength).
        - Be specific with exercises, sets, reps, or duration.
    """.strip()

    try:
        if last_message_id == "":
            response = client.responses.create(
                model="gpt-4o-mini",
                input=message,
                instructions=system_instructions,
                store=True
            )

        else:
            response = client.responses.create(
                model="gpt-4o-mini",
                input=message,
                instructions=system_instructions,
                previous_response_id=last_message_id,
                store=True
            )

        return response
    

    except Exception as e:
        raise RuntimeError("OpenAI request failed") from e

def general(user, message):

    last_message_id = user.get("last_message_id", "")


    system_instructions = f"""
    You are GymBro, an AI personal trainer and nutritionist.
    """.strip()

    try:
        if last_message_id == "":
            response = client.responses.create(
                model="gpt-4o-mini",
                input=message,
                instructions=system_instructions,
                store=True
            )

        else:
            response = client.responses.create(
                model="gpt-4o-mini",
                input=message,
                instructions=system_instructions,
                previous_response_id=last_message_id,
                store=True
            )

        return response
    

    except Exception as e:
        raise RuntimeError("OpenAI request failed") from e



@gymbro_bp.route("/reset", methods=["POST"])
@jwt_required()
def reset_gymbro():
    username = get_jwt_identity()
    users.update_one(
        {"username": username},
        {"$unset": {
            "last_message_id": ""
        }}
    )
    return jsonify({"message": "Conversation reset."})

