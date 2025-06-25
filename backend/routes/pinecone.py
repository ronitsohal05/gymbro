from flask import Blueprint, request, jsonify
from pinecone import Pinecone
import os
from dotenv import load_dotenv

load_dotenv()

pinecone_bp = Blueprint("pinecone", __name__)

