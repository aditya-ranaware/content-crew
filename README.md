# Content Crew

AI newsroom: five agents research the web, write, fact-check and edit an article (English, Hindi or Marathi) with sources.

## Folder layout
```
content-crew/
  backend/    FastAPI + CrewAI + SQLite
  frontend/   React + Vite + Tailwind
```

## 1. Backend (Windows)
```
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```
Open `.env` and set `GEMINI_API_KEY` and `JWT_SECRET`. Then:
```
uvicorn server:app --port 8000 --reload
```
Check it: http://127.0.0.1:8000/docs

Optional: `python check_models.py` shows which models still have free quota.

## 2. Frontend (needs Node 20.19 or newer)
```
cd frontend
npm install
npm run dev
```
Open http://localhost:5173, create an account and generate an article.

## Notes
- Each article uses about 5 to 6 AI calls. Models are tried in order from `GEMINI_MODELS`.
- Hindi and Marathi prefer the stronger models, so lite models are used last.
- Data is stored in `backend/content_crew.db`. Delete the file to reset everything.
