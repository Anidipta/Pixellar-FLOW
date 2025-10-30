Pixellar-FLOW Backend

This is a minimal FastAPI backend for the Pixellar-FLOW frontend. It uses SQLite (data.db) and SQLModel to store users and artworks.

Quick start (Windows PowerShell):

# Create a venv, install dependencies
python -m venv .venv; .\.venv\Scripts\Activate.ps1; pip install -r requirements.txt

# Start the server
uvicorn main:app --reload --host 127.0.0.1 --port 8001

# Basic endpoints
overview:
GET /users/
POST /users/  (JSON body e.g. {"username": "alice", "email": "a@a.com"})
GET /users/{id}
DELETE /users/{id}

GET /artworks/
POST /artworks/  (JSON body e.g. {"title": "Sunset", "owner_id": 1})
GET /artworks/{id}
PATCH /artworks/{id}
DELETE /artworks/{id}
