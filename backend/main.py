"""Run one article from the terminal (no server needed):  python main.py"""
from app.crew import run_content_crew

if __name__ == "__main__":
    topic = input("Topic: ")
    language = input("Language (en / hi / mr) [en]: ").strip() or "en"
    tone = input("Tone (professional / casual / funny) [professional]: ").strip() or "professional"
    text = run_content_crew(topic, tone, "general readers", 800, language)
    with open("output.md", "w", encoding="utf-8") as f:
        f.write(text)
    print("\nDone. Saved to output.md")
