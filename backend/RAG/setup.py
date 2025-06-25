import os
import fitz
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from uuid import uuid4
from dotenv import load_dotenv
from tqdm import tqdm
from pinecone import Pinecone

load_dotenv()

def load_pdf(path):
    doc = fitz.open(path)
    text = ""
    for page in doc:
        text += page.get_text()
    return text

# Always resolve the full documents path
DOCUMENTS_DIR = os.path.join(os.path.dirname(__file__), "documents")
print("Reading from:", DOCUMENTS_DIR)

# Use os.path.join to build file paths properly
pdf_paths = [
    (os.path.join(DOCUMENTS_DIR, "nscas-guide-to-program-designs.pdf"), "NSCA Guide to Program Design", "training"),
    (os.path.join(DOCUMENTS_DIR, "renaissance_diet_2.0.pdf"), "Renaissance Diet 2.0", "nutrition"),
    (os.path.join(DOCUMENTS_DIR, "Science-and-development-of-muscle-hypertrophy.pdf"), "Science and Development of Muscle Hypertrophy", "muscle_building"),
    (os.path.join(DOCUMENTS_DIR, "usda_dietary_guidelines.pdf"), "USDA Dietary Guidelines", "nutrition"),
    (os.path.join(DOCUMENTS_DIR, "williams_nutrition.pdf"), "Williams Nutrition for Health and Sport", "nutrition")
]

# Load PDFs
documents = []
print("Loading Documents...")
for path, source, category in pdf_paths:
    full_text = load_pdf(path)
    documents.append({
        "text": full_text,
        "source": source,
        "category": category
    })
print("Loaded Documents")

splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)

chunks = []
print("Loading Chunks..")
for doc in documents:
    text_chunks = splitter.split_text(doc["text"])
    for chunk in text_chunks:
        chunks.append({
            "text": chunk,
            "source": doc["source"],
            "category": doc["category"]
        })

print("Loaded Chunks, Total Chunks:", len(chunks))

embedder = OpenAIEmbeddings(model="text-embedding-3-small")  # or your preferred model

BATCH_SIZE = 32

print("Batch embedding chunks...")
embeddings = []

for i in tqdm(range(0, len(chunks), BATCH_SIZE), desc="Embedding"):
    batch_texts = [chunk["text"] for chunk in chunks[i:i + BATCH_SIZE]]
    batch_embeddings = embedder.embed_documents(batch_texts)
    embeddings.extend(batch_embeddings)

# Combine the embeddings back with their metadata to create Pinecone vectors
vectors = []
for chunk, embedding in zip(chunks, embeddings):
    vectors.append({
        "id": str(uuid4()),
        "values": embedding,
        "metadata": {
            "text": chunk["text"],
            "source": chunk["source"],
            "category": chunk["category"]
        }
    })

print("Embedding complete. Total vectors:", len(vectors))

pinecone_api_key = os.getenv("PINECONE_API_KEY")
pinecone_index = os.getenv("PINECONE_INDEX")
namespace = "gymbro-data"

# Initialize Pinecone client
pc = Pinecone(api_key=pinecone_api_key)
index = pc.Index(host=pinecone_index)

# Upload vectors in batches
BATCH_SIZE = 100
print("Uploading vectors to Pinecone...")

for i in tqdm(range(0, len(vectors), BATCH_SIZE), desc="Uploading"):
    batch = vectors[i:i + BATCH_SIZE]
    index.upsert(vectors=batch, namespace=namespace)

print(f"Upload complete: {len(vectors)} vectors upserted to namespace '{namespace}' in index gymbro-rag")