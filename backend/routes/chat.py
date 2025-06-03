import os
from flask import Blueprint
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("OPENAI_API_KEY")

client = OpenAI(api_key=API_KEY)

chat_bp = Blueprint("chat", __name__)

@chat_bp.route("/generate-workout")
def generate_workout():
    completion = client.chat.completions.create(
        model="gpt-4.1-mini",
        store=True,
        messages=[
            {
                "role": "system",
                "content": "You are a personal trainer for the user."
            },
            {
                "role": "user",
                "content": "Genereate a workout split"
            }
        ]
    )

    return completion.choices[0].message.content