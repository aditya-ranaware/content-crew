import datetime as dt
import os

from dotenv import load_dotenv
from sqlalchemy import DateTime, ForeignKey, String, Text, create_engine, inspect, text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, sessionmaker

load_dotenv()

def normalize_url(url: str) -> str:
    """Render gives postgres:// or postgresql://. SQLAlchemy needs the psycopg driver name."""
    for old in ("postgres://", "postgresql://"):
        if url.startswith(old):
            return "postgresql+psycopg://" + url[len(old):]
    return url


DATABASE_URL = normalize_url(os.getenv("DATABASE_URL", "sqlite:///./content_crew.db"))
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {},
)
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


def utcnow() -> dt.datetime:
    return dt.datetime.now(dt.timezone.utc)


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[dt.datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class Article(Base):
    __tablename__ = "articles"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    topic: Mapped[str] = mapped_column(String(200))
    tone: Mapped[str] = mapped_column(String(40))
    audience: Mapped[str] = mapped_column(String(120))
    word_count: Mapped[int]
    language: Mapped[str] = mapped_column(String(8), default="en", server_default="en")
    content: Mapped[str] = mapped_column(Text)
    created_at: Mapped[dt.datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


def ensure_columns() -> None:
    """Tiny migration: add the language column to an existing articles table."""
    cols = [c["name"] for c in inspect(engine).get_columns("articles")]
    if "language" not in cols:
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE articles ADD COLUMN language VARCHAR(8) NOT NULL DEFAULT 'en'"))
