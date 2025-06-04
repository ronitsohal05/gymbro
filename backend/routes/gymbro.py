import os
from flask import Blueprint, request, jsonify
from openai import OpenAI
from dotenv import load_dotenv
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.db import get_user_collection

gymbro_bp = Blueprint("gymbro", __name__)

load_dotenv()
API_KEY = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=API_KEY)

users = get_user_collection()


@gymbro_bp.route("/chat", methods=["POST"])
@jwt_required()
def chat():
    """
    Expects a JSON: {"message": "<user's text>", "thread": "previous}
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
    
    name = user.get("name", "")
    age = user.get("age", "")
    weight = user.get("weight", "")
    height = user.get("height", "")
    goal = user.get("goal", "")

    system_instructions = f"""
    You are GymBro, an AI personal trainer. 
    Your user is {name}, {age} years old, {weight} lbs, {height} inches tall, and their goal is: {goal}. 
    Based on those stats and goal, give personalized advice.
    """.strip()
    
    try:
        response = client.responses.create(
            model="gpt-4o-mini",
            input=user_message,
            instructions=system_instructions
        )
        print("Response created")

        output = response.output_text

        print("Output extracted")

        return jsonify({ "reply" : output})
    

    except Exception as e:
        return jsonify({"error": "OpenAI request failed"}), 500
