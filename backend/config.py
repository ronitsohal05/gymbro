import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # MongoDB connection URI 
    MONGODB_URI = os.getenv("MONGODB_URI", "")

    # JWT settings
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "change_me_to_a_random_string")
    JWT_ACCESS_TOKEN_EXPIRES = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES", 15))   # in minutes
    JWT_REFRESH_TOKEN_EXPIRES = int(os.getenv("JWT_REFRESH_TOKEN_EXPIRES", 30)) # in days

    # OpenAI 
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
    ALLINONE_ASSISTANT_ID = os.getenv("ALLINONE_ASSISTANT_ID", "")

    # ElevenLavbs
    EL_API_KEY = os.getenv("ELEVENLABS_API_KEY", "")