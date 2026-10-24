"""Shows which Gemini models in GEMINI_MODELS still have quota:  python check_models.py"""
import os
import requests
from dotenv import load_dotenv

load_dotenv()
key = os.getenv("GEMINI_API_KEY")
for m in [x.strip() for x in os.getenv("GEMINI_MODELS", "").split(",") if x.strip()]:
    r = requests.post(
        f"https://generativelanguage.googleapis.com/v1beta/models/{m}:generateContent",
        params={"key": key}, json={"contents": [{"parts": [{"text": "Say OK"}]}]}, timeout=30,
    )
    status = "WORKS" if r.status_code == 200 else f"{r.status_code} {r.json().get('error', {}).get('status', '')}"
    print(f"{m:32} {status}")
