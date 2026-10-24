import os
from dotenv import load_dotenv
from crewai import LLM

load_dotenv()


def model_chain(language: str = "en") -> list[str]:
    raw = os.getenv("GEMINI_MODELS", "gemini-3.5-flash")
    models = [m.strip() for m in raw.split(",") if m.strip()]
    if language != "en":
        # Hindi and Marathi need the stronger models, so the lite ones go last
        models.sort(key=lambda m: "lite" in m)
    return models


def get_llm(model: str) -> LLM:
    return LLM(
        model=f"gemini/{model}",
        api_key=os.getenv("GEMINI_API_KEY"),
        temperature=0.2,
    )
