import time
from datetime import date
from crewai import Crew, Process
from .agents import build_agents
from .config import get_llm, model_chain
from .research import gather_sources
from .tasks import build_tasks

STAGES = ["Researcher", "SEO Strategist", "Writer", "Fact-Checker", "Editor"]
COOLDOWN: dict[str, float] = {}  # model -> time until we skip it

QUOTA_WORDS = ("429", "quota", "resource_exhausted", "rate limit", "rate_limit")
BUSY_WORDS = ("503", "502", "504", "unavailable", "overloaded", "high demand", "timed out", "timeout")


def _kind(e: Exception):
    text = str(e).lower()
    if any(w in text for w in QUOTA_WORDS):
        return "quota"
    if any(w in text for w in BUSY_WORDS):
        return "busy"
    return None


def english_query(topic: str, language: str) -> str:
    """Turn a Hindi or Marathi topic into an English search query (1 small LLM call)."""
    if topic.isascii():
        return topic
    for model in model_chain(language):
        if COOLDOWN.get(model, 0) > time.time():
            continue
        try:
            out = get_llm(model).call(
                "Translate this topic into a short English web search query. "
                f"Reply with only the query, nothing else.\n\n{topic}"
            )
            out = str(out).strip().strip('"').strip()
            if out:
                return out[:150]
        except Exception:
            continue
    return topic


def _run(model, topic, tone, audience, word_count, sources, language, emit):
    llm = get_llm(model)
    agents = build_agents(llm)
    tasks = build_tasks(agents, topic, tone, audience, word_count, sources, language)
    done = {"n": 0}

    def task_done(_output):
        done["n"] += 1
        emit({"type": "stage_done", "stage": STAGES[done["n"] - 1], "index": done["n"]})
        if done["n"] < len(STAGES):
            emit({"type": "stage_start", "stage": STAGES[done["n"]], "index": done["n"] + 1})

    crew = Crew(
        agents=list(agents), tasks=tasks, process=Process.sequential,
        verbose=True, task_callback=task_done, max_rpm=4,
    )
    return crew.kickoff().raw


def run_content_crew(topic, tone="professional", audience="general readers",
                     word_count=800, language="en", on_event=None) -> str:
    emit = on_event or (lambda e: None)
    emit({"type": "stage_start", "stage": STAGES[0], "index": 1})

    english = english_query(topic, language)
    sources = gather_sources(topic, str(date.today()), english)
    if sources.startswith("NO SOURCES FOUND"):
        raise RuntimeError("No sources found for this topic. Try a more specific topic.")
    last_error = None

    for round_no in range(2):
        for model in model_chain(language):
            if COOLDOWN.get(model, 0) > time.time():
                continue
            try:
                return _run(model, topic, tone, audience, word_count, sources, language, emit)
            except Exception as e:
                last_error = e
                kind = _kind(e)
                if kind is None:
                    raise  # a real bug, show it
                COOLDOWN[model] = time.time() + (3600 if kind == "quota" else 30)
                emit({"type": "waiting", "message": f"{model} is unavailable. Switching model."})
        if round_no == 0:
            time.sleep(35)

    raise RuntimeError(
        f"All models are busy or at their limits. Try again in a few minutes. Last error: {last_error}"
    )
