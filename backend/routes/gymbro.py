import os
import json
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

    print(classification)
    
    try:
        if classification == "nutrition":
            response = handle_nutrition(user, user_message)
        elif classification == "workout":
            response = handle_workout(user, user_message)
        elif classification == "log meal/workout":
            response = handle_logging_request(user, user_message)
        else:
            response = general(user, user_message)

        
        users.update_one(
            {"username": username},
            {"$set": {
                "last_message_id": response.id
            }}
        )

        reply = response.output_text

        return jsonify({ "reply": reply })

    except RuntimeError as err:
        return jsonify({ "error": str(err) }), 500
    


def classify_message(user, message):

    last_message_id = user.get("last_message_id", "")

    classification_tool = [{
        "type": "function",
        "name": "user_message_classification",
        "description": "Classifies a user message into one of the categories: workout, nutrition, log meal/workout, or other.",
        "parameters": {
            "type": "object",
            "properties": {
                "user_message": {
                    "type": "string",
                    "description": "The message input from the user that needs to be classified."
                },
                "classification": {
                    "type": "string",
                    "description": "The classification of the user message.",
                    "enum": ["workout", "nutrition", "log meal/workout", "other"]
                }
            },
            "required": ["user_message", "classification"],
            "additionalProperties": False
        },
        "strict": True
    }]

    

    try:
        classification_prompt = f"""
        Classify the following message into one of the categories: "nutrition", "workout", "log gym/workout" or "other".

        Respond with only the category name.
        """.strip()

        if last_message_id == "":
            response = client.responses.create(
                model="gpt-4o-mini",
                input=message,
                instructions=classification_prompt,
                store=True,
                tools=classification_tool,
                tool_choice={"type": "function", "name": "user_message_classification"}
            )

        else:
            response = client.responses.create(
                model="gpt-4o-mini",
                input=message,
                instructions=classification_prompt,
                previous_response_id=last_message_id,
                store=True,
                tools=classification_tool,
                tool_choice={"type": "function", "name": "user_message_classification"}
            )


        tool_call =  response.output[0]
        args = json.loads(tool_call.arguments)

        classification = args["classification"]

        return classification

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

def handle_logging_request(user, message):
    pending_log = user.get("pending_log")

    if pending_log:
        if message.lower() in ["yes", "confirm", "log it", "submit"]:
            log_type = pending_log.get("type")
            log_data = pending_log.get("data")

            if log_type == "meal":
                return log_meal_from_pending(user, log_data)
            elif log_type == "workout":
                return log_workout_from_pending(user, log_data)
        else:
            return regenerate_proposal(user, message)

    return handle_new_logging_message(user, message)

def handle_new_logging_message(user, message):

    current_date = datetime.now()
    tools = [{
        "type": "function",
        "name": "log_user_meal",
        "description": "Logs the user's meal based on what they report eating.",
        "parameters": {
            "type": "object",
            "properties": {
                "meal_date": {
                    "type": "string",
                    "description": f"The date the meal was eaten, in ISO format (e.g. 2025-06-05T08:00:00Z). The date rigt now is{current_date}."
                },
                "meal_type": {
                    "type": "string",
                    "description": "Type of meal (e.g., breakfast, lunch, dinner, snack)."
                },
                "meal_items": {
                    "type": "array",
                    "description": "List of foods eaten in the meal.",
                    "items": {
                        "type": "string"
                    }
                }
            },
            "required": ["meal_date", "meal_type", "meal_items"],
            "additionalProperties": False
        }
    },{
        "type": "function",
        "name": "log_user_workout",
        "description": "Logs a workout session to the user's account based on what exercises they did.",
        "parameters": {
            "type": "object",
            "properties": {
                "workout_date": {
                    "type": "string",
                    "description": "The date and time the workout happened, in ISO 8601 format (e.g. 2025-06-05T17:00:00Z). The date rigt now is{current_date}."
                },
                "workout_type": {
                    "type": "string",
                    "description": "A short description of the workout (e.g., push day, leg day, cardio)."
                },
                "workout_activities": {
                    "type": "array",
                    "description": "List of exercises performed with details.",
                    "items": {
                        "type": "object",
                        "properties": {
                            "name": {
                                "type": "string",
                                "description": "Name of the exercise, e.g., push-ups"
                            },
                            "mode": {
                                "type": "string",
                                "description": "Tracking method used for the exercise.",
                                "enum": ["reps", "time"]
                            },
                            "sets": {
                                "type": "integer",
                                "description": "Number of sets (if mode is 'reps')"
                            },
                            "reps": {
                                "type": "integer",
                                "description": "Number of reps per set (if mode is 'reps')"
                            },
                            "duration": {
                                "type": "number",
                                "description": "Duration in minutes (if mode is 'time')"
                            }
                        },
                        "required": ["name", "mode"],
                        "additionalProperties": False
                    }
                },
                "notes": {
                    "type": "string",
                    "description": "Optional notes about the workout"
                }
            },
            "required": ["workout_date", "workout_activities", "workout_type"],
            "additionalProperties": False
        }
    }]

    system_instructions = """
        You are GymBro, an AI fitness assistant. 
        Parse the user's message and generate a structured log proposal using one of the available functions, but DO NOT actually log it. 
        Instead, present a summary and ask for confirmation.
    """

    response = client.responses.create(
        model="gpt-4o-mini",
        input=message,
        tools=tools,
        tool_choice="required",
        instructions=system_instructions
    )


    tool_call = response.output[0]
    args = json.loads(tool_call.arguments)
    function_name = tool_call.name
    log_type = "meal" if function_name == "log_user_meal" else "workout"

    users.update_one({"username": user["username"]}, {
        "$set": {
            "pending_log": {
                "type": log_type,
                "data": args
            }
        }
    })

    system_instructions = """
        You are GymBro, an AI fitness assistant. A user has just sent a message that likely describes either a meal they ate or a workout they completed.

        Your task is to:
        1. Parse their message.
        2. Use ONE of the available tools to generate a structured **log proposal** — either for a meal or a workout.
        3. DO NOT confirm that anything has been logged yet.

        Instead:
        - Summarize the proposed log to the user in natural language.
        - Ask them to confirm it (e.g., “Does this look right? Type 'yes' to confirm or send changes.”).
        - Wait for their confirmation before proceeding.

        DO NOT say that anything has been saved or logged at this point
    """

    summary = summarize_log_proposal(log_type, args)

    input_messages = []
    input_messages.append(tool_call)
    input_messages.append({
        "type": "function_call_output",
        "call_id": tool_call.call_id,
        "output": summary
    })

    confirmation_response = client.responses.create(
        model="gpt-4o-mini",
        input=input_messages,
        tools=tools,
        instructions=system_instructions
    )
    

    return confirmation_response

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
    
def regenerate_proposal(user, new_message):
    return handle_new_logging_message(user, new_message)

def convertISOtoDateTimeObject(iso_string):
    return datetime.fromisoformat(iso_string.replace("Z", "+00:00"))

def summarize_log_proposal(log_type, args):
    if log_type == "meal":
        return f"You had {', '.join(args['meal_items'])} for {args['meal_type']} on {args['meal_date']}"
    else:
        exercises = ", ".join(a['name'] for a in args['workout_activities'])
        return f"You did {args['workout_type']} on {args['workout_date']} with: {exercises}"
    
def log_meal_from_pending(user, data):
    username = user["username"]
    last_message_id = user["last_message_id"]
    date = convertISOtoDateTimeObject(data["meal_date"])
    meals.insert_one({
        "username": username,
        "meal_date": date,
        "meal_type": data["meal_type"],
        "meal_items": data["meal_items"]
    })
    users.update_one({"username": username}, {"$unset": {"pending_log": ""}})


    system_instructions = """
    You are GymBro, an AI personal trainer and nutritionist.
    You have just logged a workout for the user
    """

    response = client.responses.create(
        input="yes",
        model="gpt-4o-mini",
        instructions=system_instructions,
        previous_response_id=last_message_id,
        store=True
    )

    return response

def log_workout_from_pending(user, data):
    username = user["username"]
    last_message_id = user["last_message_id"]
    date = convertISOtoDateTimeObject(data["workout_date"])
    workouts.insert_one({
        "username": username,
        "workout_date": date,
        "workout_type": data["workout_type"],
        "workout_activities": data["workout_activities"],
        "notes": data.get("notes")
    })

    users.update_one({"username": username}, {"$unset": {"pending_log": ""}})

    system_instructions = """
    You are GymBro, an AI personal trainer and nutritionist.
    You have just logged a workout for the user
    """

    response = client.responses.create(
        input="yes",
        model="gpt-4o-mini",
        instructions=system_instructions,
        previous_response_id=last_message_id,
        store=True
    )


    return response




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

