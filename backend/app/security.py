import base64
import datetime as dt
import hashlib
import hmac
import os
import secrets

import jwt
from dotenv import load_dotenv

load_dotenv()

SECRET = os.getenv("JWT_SECRET") or secrets.token_hex(32)  # random fallback: logins reset on restart
ALGORITHM = "HS256"
EXPIRE_DAYS = 7
ITERATIONS = 200_000


def hash_password(password: str) -> str:
    salt = os.urandom(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, ITERATIONS)
    return base64.b64encode(salt + digest).decode()


def verify_password(password: str, stored: str) -> bool:
    raw = base64.b64decode(stored)
    salt, digest = raw[:16], raw[16:]
    check = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, ITERATIONS)
    return hmac.compare_digest(check, digest)


def create_token(user_id: int) -> str:
    exp = dt.datetime.now(dt.timezone.utc) + dt.timedelta(days=EXPIRE_DAYS)
    return jwt.encode({"sub": str(user_id), "exp": exp}, SECRET, algorithm=ALGORITHM)


def decode_token(token: str) -> int | None:
    try:
        return int(jwt.decode(token, SECRET, algorithms=[ALGORITHM])["sub"])
    except (jwt.PyJWTError, KeyError, ValueError):
        return None
