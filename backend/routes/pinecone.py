from flask import Blueprint, request, jsonify
from pinecone import Pinecone
import os
from dotenv import load_dotenv
from langchain_openai import OpenAIEmbeddings
from flask_jwt_extended import jwt_required

load_dotenv()

pinecone_bp = Blueprint("pinecone", __name__)

# Initialize Pinecone and LangChain embeddings
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
index = pc.Index(host=os.getenv("PINECONE_INDEX"))
namespace = "gymbro-data"
embedder = OpenAIEmbeddings(model="text-embedding-3-small")

def get_embedding(text: str):
    return embedder.embed_query(text)

@pinecone_bp.route("/query", methods=["POST"])
@jwt_required() 
def query_pinecone():
    try:
        data = request.get_json()

        query = data.get("query", "")
        if not query:
            return jsonify({"error": "Missing 'query' in request body"}), 400

        query_embedding = get_embedding(query)

        response = index.query(
            namespace=namespace,
            vector=query_embedding,
            top_k=3,
            include_metadata=True,
            include_values=False
        )

        matches = response.get("matches", [])
        print("Matches returned:", matches)

        results = [
            {
                "id": match["id"],
                "score": match["score"],
                "metadata": match.get("metadata", {})
            }
            for match in matches
        ]

        return jsonify({"results": results})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

