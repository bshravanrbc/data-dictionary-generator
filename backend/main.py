import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv(dotenv_path="../.env.local")

app = FastAPI()

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class GenerateRequest(BaseModel):
    data: str

class ChatRequest(BaseModel):
    dictionary: dict
    message: str
    history: list

@app.post("/generate")
async def generate_dictionary(request: GenerateRequest):
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="API Key not configured")

    client = genai.Client(api_key=api_key)
    
    prompt = f"""Analyze the following database table data sample and generate a comprehensive data dictionary.
    
    Data Sample:
    {request.data}
    
    Provide the output as a valid JSON object matching the requested schema."""

    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash-exp", # Using a known updated model, or fallback to the one in original code if preferred
            contents=prompt,
            config={
                "response_mime_type": "application/json",
                "response_schema": {
                    "type": types.Type.OBJECT,
                    "properties": {
                        "table_name": {"type": types.Type.STRING, "description": "Suggested table name based on context"},
                        "summary": {"type": types.Type.STRING, "description": "A high-level summary of what this table represents"},
                        "columns": {
                            "type": types.Type.ARRAY,
                            "items": {
                                "type": types.Type.OBJECT,
                                "properties": {
                                    "name": {"type": types.Type.STRING},
                                    "inferred_type": {"type": types.Type.STRING, "description": "Technical data type (e.g., UUID, VARCHAR(255), INTEGER, TIMESTAMP)"},
                                    "description": {"type": types.Type.STRING, "description": "Human-readable description of the column's purpose"},
                                    "constraints": {
                                        "type": types.Type.ARRAY,
                                        "items": {"type": types.Type.STRING},
                                        "description": "Possible constraints like PRIMARY KEY, NOT NULL, UNIQUE, FOREIGN KEY"
                                    },
                                    "example_values": {
                                        "type": types.Type.ARRAY,
                                        "items": {"type": types.Type.STRING},
                                        "description": "Representative samples from the data"
                                    },
                                    "business_logic": {"type": types.Type.STRING, "description": "Any inferred business rules or logic"}
                                },
                                "required": ["name", "inferred_type", "description", "constraints", "example_values"]
                            }
                        }
                    },
                    "required": ["table_name", "summary", "columns"]
                },
                "system_instruction": "You are a professional Data Architect and Database Engineer. Your task is to analyze raw data (CSV, JSON, or Text) and produce a standard data dictionary that developers and business analysts can use to understand a database schema. Be precise about types and constraints."
            }
        )
        
        # The new SDK parses JSON automatically when response_mime_type is json?? 
        # Actually checking the docs or original code: 
        # original used ai.models.generateContent... response.text -> JSON.parse
        # Python SDK should be similar or return parsed object if using new SDK features.
        # For safety with generic SDK usage, we'll parse text.
        
        if not response.text:
             raise HTTPException(status_code=500, detail="No response from AI")
             
        import json
        return json.loads(response.text)

    except Exception as e:
        print(f"Error generating content: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat")
async def chat_with_dictionary(request: ChatRequest):
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="API Key not configured")
        
    client = genai.Client(api_key=api_key)

    system_instruction = f"""You are an AI assistant helping a user understand a specific database table.
      Here is the Data Dictionary for the table you are discussing:
      {request.dictionary}
      
      Answer questions about the schema, suggest SQL queries, identify potential security concerns (PII), or explain business logic based on this dictionary."""

    # Reconstruct history for the chat session if needed, or just single turn it since the context is in system instruction
    # The original code passed 'history' to the chat but primarily used it for UI state. 
    # Here we can create a chat session.
    
    # We'll just doing a single turn generation with history included in context or using chat mode if we traverse history.
    # For simplicity and robustness, let's treat it as a new message with history context if complex, 
    # but the simplest port is a straight generate_content or chat.send_message.
    
    # Let's try to map the history.
    # History items have { role: 'user' | 'model', content: string }
    # Python SDK expects specific format.
    
    # Simple approach: one-shot generation with context
    # or chat session with history loading.
    
    chat_history = []
    for msg in request.history:
        role = "user" if msg['role'] == 'user' else "model"
        chat_history.append(types.Content(role=role, parts=[types.Part.from_text(text=msg['content'])]))

    chat = client.chats.create(
        model='gemini-2.0-flash-exp',
        config=types.GenerateContentConfig(
            system_instruction=system_instruction
        ),
        history=chat_history
    )
    
    response = chat.send_message(request.message)
    return {"response": response.text}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
