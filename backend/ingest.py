import os
import chromadb
from chromadb.utils.embedding_functions import SentenceTransformerEmbeddingFunction

# === CONFIGURATION ===
DATA_PATH = "./data/nutrition_data.txt" 
CHROMA_PATH = "./chroma_db"
COLLECTION_NAME = "nutrition_data"

# === SETUP ===
# UPGRADE: Using a smarter model (768 dimensions vs 384)
embedding_fn = SentenceTransformerEmbeddingFunction(model_name="all-mpnet-base-v2")
client = chromadb.PersistentClient(path=CHROMA_PATH)

def ingest_data():
    print(f"--- Starting Ingestion ---")
    
    if not os.path.exists(DATA_PATH):
        print(f"❌ ERROR: File not found at {DATA_PATH}")
        return

    print(f"📂 Loading data from {DATA_PATH}...")
    
    with open(DATA_PATH, 'r', encoding='utf-8') as f:
        raw_text = f.read()

    food_items = [item.strip() for item in raw_text.split('\n\n') if item.strip()]
    
    print(f"   Found {len(food_items)} food descriptions.")

    # Reset Collection
    try:
        client.delete_collection(COLLECTION_NAME)
        print(f"🗑️  Deleted old collection '{COLLECTION_NAME}'")
    except:
        pass
    
    collection = client.create_collection(
        name=COLLECTION_NAME, 
        embedding_function=embedding_fn
    )

    documents = []
    ids = []
    metadatas = []

    print("⚙️  Processing items...")
    for index, item_text in enumerate(food_items):
        title = item_text.split(' is ')[0] if ' is ' in item_text else f"Food Item {index}"
        
        documents.append(item_text)
        ids.append(f"food_{index}")
        metadatas.append({"title": title})

    if documents:
        collection.add(documents=documents, ids=ids, metadatas=metadatas)
        print(f"\n✅ SUCCESS! Ingested {len(documents)} items using 'all-mpnet-base-v2'.")
    else:
        print("\n⚠️  WARNING: No data found.")

if __name__ == "__main__":
    ingest_data()