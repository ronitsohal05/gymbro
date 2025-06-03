import os
from flask import Blueprint, request, jsonify
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("OPENAI_API_KEY")

client = OpenAI(api_key=API_KEY)

gymbro_bp = Blueprint("gymbro", __name__)

@gymbro_bp.route("/chat", methods=["POST"])
def chat():
    """
    Expects a JSON: {"message": "<user's text>"}
    Returns a JSON: {"reply": "assistant's respone>" }
    """
    data = request.get_json() or {}

    user_message = data.get("message", "").strip()
    if not user_message:
        return jsonify({"error": "No Message Provided"}), 400
    
    try:
        completion = client.chat.completions.create(
            model="gpt-4.1-mini",
            store=True,
            messages=[
                    {"role": "system", "content": "You are a personal trainer for the user."},
                    {"role": "user", "content": user_message}
            ]
        )
        response_message = completion.choices[0].message.content
        return jsonify({"reply": response_message})
    except Exception as e:
        return jsonify({"error": "OpenAI request failed"}), 500
