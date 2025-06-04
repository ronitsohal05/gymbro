from pymongo import MongoClient
from config import Config

# Initialize a single MongoClient instance (thread‐safe)
mongo_client = MongoClient(Config.MONGODB_URI)

# By default, using the database name from the URI’s path.
db = mongo_client.get_default_database()

def get_user_collection():
    return db["users"]

def get_meals_collection():
    return db["users"]

def get_workouts_collection():
    return db["users"]