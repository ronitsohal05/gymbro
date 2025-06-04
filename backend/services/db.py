from pymongo import MongoClient
from config import Config

# Initialize a single MongoClient instance (thread‐safe)
mongo_client = MongoClient(Config.MONGODB_URI)
db = mongo_client["gymbro"]

# By default, using the database name from the URI’s path.
db = mongo_client.get_default_database()

users = db["users"]
meals = db["meals"]
workouts = db["workouts"]

def get_user_collection():
    return users

def get_meal_collection():
    return meals

def get_workout_collection():
    return workouts