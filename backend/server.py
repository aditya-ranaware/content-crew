from dotenv import load_dotenv
from pathlib import Path
from fastapi.staticfiles import StaticFiles
load_dotenv()

import json
import os
import queue
import threading
import time
import uuid
import warnings

warnings.filterwarnings("ignore", message="function callbacks cannot be serialized")

from fastapi import Depends, FastAPI, Header, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.crew import run_content_crew
from app.db import Article, Base, SessionLocal, User, engine, ensure_columns
from app.security import create_token, decode_token, hash_password, verify_password

Base.metadata.create_all(engine)
ensure_columns()

app = FastAPI(title="Content Crew API")
origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_methods=["*"], allow_headers=["*"])

JOBS: dict = {}  # live jobs only; finished articles live in the database
EMAIL_PATTERN = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"


# ---------- helpers ----------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def _user_from_token(raw: str | None, db: Session) -> User:
    uid = decode_token(raw) if raw else None
    user = db.get(User, uid) if uid else None
    if not user:
        raise HTTPException(401, "Please sign in again.")
    return user


def current_user(authorization: str | None = Header(None), db: Session = Depends(get_db)) -> User:
    raw = authorization[7:] if authorization and authorization.lower().startswith("bearer ") else None
    return _user_from_token(raw, db)


def stream_user(token: str | None = Query(None), db: Session = Depends(get_db)) -> User:
    # EventSource in browsers cannot send headers, so the stream takes the token in the URL
    return _user_from_token(token, db)


def prune_jobs():
    cutoff = time.time() - 3600
    for jid in [j for j, v in JOBS.items() if v["created"] < cutoff and v["status"] != "running"]:
        JOBS.pop(jid, None)


# ---------- schemas ----------
class Credentials(BaseModel):
    email: str = Field(pattern=EMAIL_PATTERN, max_length=255)
    password: str = Field(min_length=8, max_length=128)


class GenerateRequest(BaseModel):
    topic: str = Field(min_length=3, max_length=200)
    tone: str = Field("professional", max_length=40)
    audience: str = Field("general readers", max_length=120)
    word_count: int = Field(800, ge=300, le=2000)
    language: str = Field("en", pattern="^(en|hi|mr)$")


def article_summary(a: Article) -> dict:
    return {"id": a.id, "topic": a.topic, "tone": a.tone, "audience": a.audience,
            "word_count": a.word_count, "language": a.language, "created_at": a.created_at.isoformat()}


# ---------- auth ----------
@app.post("/api/auth/register", status_code=201)
def register(body: Credentials, db: Session = Depends(get_db)):
    email = body.email.strip().lower()
    if db.scalar(select(User).where(User.email == email)):
        raise HTTPException(409, "An account with this email already exists.")
    user = User(email=email, password_hash=hash_password(body.password))
    db.add(user)
    db.commit()
    return {"token": create_token(user.id), "user": {"id": user.id, "email": user.email}}


@app.post("/api/auth/login")
def login(body: Credentials, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.email == body.email.strip().lower()))
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(401, "Wrong email or password.")
    return {"token": create_token(user.id), "user": {"id": user.id, "email": user.email}}


@app.get("/api/auth/me")
def me(user: User = Depends(current_user)):
    return {"id": user.id, "email": user.email}


# ---------- generation ----------
def worker(job_id: str, req: GenerateRequest):
    job = JOBS[job_id]
    q = job["queue"]
    try:
        result = run_content_crew(req.topic, req.tone, req.audience, req.word_count, req.language, on_event=q.put)
        with SessionLocal() as db:
            art = Article(user_id=job["user_id"], topic=req.topic, tone=req.tone,
                          audience=req.audience, word_count=req.word_count, language=req.language, content=result)
            db.add(art)
            db.commit()
            article_id = art.id
        job["status"] = "done"
        q.put({"type": "done", "result": result, "article_id": article_id})
    except Exception as e:
        job["status"], job["error"] = "error", str(e)
        q.put({"type": "error", "message": str(e)[:300]})


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/api/generate")
def generate(req: GenerateRequest, user: User = Depends(current_user)):
    prune_jobs()
    if any(j["user_id"] == user.id and j["status"] == "running" for j in JOBS.values()):
        raise HTTPException(429, "You already have an article in progress. Wait for it to finish.")
    job_id = uuid.uuid4().hex[:12]
    JOBS[job_id] = {"status": "running", "queue": queue.Queue(), "error": None,
                    "user_id": user.id, "created": time.time()}
    threading.Thread(target=worker, args=(job_id, req), daemon=True).start()
    return {"job_id": job_id}


@app.get("/api/stream/{job_id}")
def stream(job_id: str, user: User = Depends(stream_user)):
    job = JOBS.get(job_id)
    if not job or job["user_id"] != user.id:
        raise HTTPException(404, "Job not found")

    def events():
        while True:
            try:
                event = job["queue"].get(timeout=15)
            except queue.Empty:
                yield ": keepalive\n\n"
                continue
            yield f"data: {json.dumps(event)}\n\n"
            if event["type"] in ("done", "error"):
                break

    return StreamingResponse(events(), media_type="text/event-stream")


# ---------- saved articles ----------
@app.get("/api/articles")
def list_articles(user: User = Depends(current_user), db: Session = Depends(get_db)):
    rows = db.scalars(select(Article).where(Article.user_id == user.id)
                      .order_by(Article.created_at.desc()).limit(100)).all()
    return [article_summary(a) for a in rows]


def _own_article(article_id: int, user: User, db: Session) -> Article:
    art = db.get(Article, article_id)
    if not art or art.user_id != user.id:
        raise HTTPException(404, "Article not found")
    return art


@app.get("/api/articles/{article_id}")
def get_article(article_id: int, user: User = Depends(current_user), db: Session = Depends(get_db)):
    art = _own_article(article_id, user, db)
    return {**article_summary(art), "content": art.content}


@app.delete("/api/articles/{article_id}", status_code=204)
def delete_article(article_id: int, user: User = Depends(current_user), db: Session = Depends(get_db)):
    db.delete(_own_article(article_id, user, db))
    db.commit()

# ---------- serve the built React app (only present inside the Docker image) ----------
STATIC_DIR = Path(__file__).parent / "static"
if STATIC_DIR.is_dir():
    app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="web")