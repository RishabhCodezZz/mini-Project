from flask import Flask, request, jsonify
from flask_cors import CORS
import chromadb
from chromadb.utils.embedding_functions import SentenceTransformerEmbeddingFunction
from sentence_transformers import CrossEncoder
import google.generativeai as genai
import torch
import os

# ==============================
# CONFIGURATION
# ==============================
GEMINI_API_KEY = "API KEY"  # 🔴 Don't forget your key!

CHROMA_PATH = "./chroma_db"
COLLECTION_NAME = "nutrition_data"
GEMINI_MODEL_VERSION = 'gemini-2.5-flash' 

# ==============================
# SETUP
# ==============================
print("⏳ Connecting to Gemini & Database...")

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel(GEMINI_MODEL_VERSION)

embedding_fn = SentenceTransformerEmbeddingFunction(model_name="all-mpnet-base-v2")
client = chromadb.PersistentClient(path=CHROMA_PATH)
collection = client.get_collection(name=COLLECTION_NAME, embedding_function=embedding_fn)

_device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
reranker = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2", device=str(_device))

CHAT_HISTORY = {"default_user": []}

print(f"✅ System Ready using {GEMINI_MODEL_VERSION}!")

# ==============================
# HELPER: GENERATE RESPONSE
# ==============================
def get_gemini_response(query, context_text):
    history = CHAT_HISTORY["default_user"]
    history_text = "\n".join(history[-6:]) 
    
    # 🔴 THIS PROMPT IMPLEMENTS YOUR MINI PROJECT REQUIREMENTS 🔴
    prompt = f"""
    SYSTEM INSTRUCTION:
    You are 'NutriBot', a RAG-Based Personalized Diet Assistant.
    
    YOUR PROJECT MANDATES:
    1. **Personalization**: Always consider the user's Age, Weight, and Goal if provided.
    2. **Explain "Why"**: You MUST explain WHY a specific food was chosen (e.g., "I chose Oats because they are high in fiber...").
    3. **Portion Sizes**: Suggest specific portion sizes (e.g., "1 cup" or "100g").
    4. **Context Aware**: 
       - If Breakfast: Suggest lighter, high-fiber/energy options.
       - If Lunch/Dinner: Suggest protein-dense, filling options.
    5. **Source-Based**: Use ONLY the "Available Food Items" below. Do not halllucinate foods not in the list.

    AVAILABLE FOOD ITEMS:
    {context_text}

    CONVERSATION HISTORY:
    {history_text}

    USER QUERY:
    {query}

    YOUR ANSWER:
    """
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Gemini Error: {str(e)}"

# ==============================
# API
# ==============================
app = Flask(__name__)
CORS(app)

@app.route('/api/search', methods=['POST'])
def search():
    try:
        data = request.get_json()
        query = data.get('query', '')
        
        if query == "RESET_CHAT":
            CHAT_HISTORY["default_user"] = []
            return jsonify({'success': True, 'answer': "Chat history cleared."})

        print(f"\n📩 Received: {query}")

        # 1. Retrieve
        results = collection.query(query_texts=[query], n_results=10)
        docs = results['documents'][0]
        metadatas = results['metadatas'][0]
        
        if not docs:
            return jsonify({'answer': "I couldn't find any matching food items in my database."})

        # 2. Rerank
        pairs = [[query, doc] for doc in docs]
        scores = reranker.predict(pairs)
        scored_results = sorted(zip(docs, metadatas, scores), key=lambda x: x[2], reverse=True)
        top_results = scored_results[:6] 
        
        # 3. Generate
        context_text = "\n".join([f"- {doc}" for doc, meta, score in top_results])
        answer = get_gemini_response(query, context_text)
        
        # 4. History
        CHAT_HISTORY["default_user"].append(f"User: {query}")
        CHAT_HISTORY["default_user"].append(f"AI: {answer}")
        
        return jsonify({
            'success': True,
            'answer': answer,
            'sources': [{'title': meta.get('title', 'Food')} for doc, meta, score in top_results]
        })

    except Exception as e:
        print(f"❌ Error: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # use_reloader=False prevents the WinError 10038 crash
    app.run(debug=True, use_reloader=False, host='0.0.0.0', port=5000)