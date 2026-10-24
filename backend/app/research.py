import time
import requests
from bs4 import BeautifulSoup
from ddgs import DDGS

HEADERS = {"User-Agent": "Mozilla/5.0"}
SKIP = ("youtube.com", "facebook.com", "instagram.com", "twitter.com",
        "x.com", "linkedin.com", "pinterest.com", "reddit.com")


def _search(query: str, n: int = 6) -> list:
    for _ in range(3):
        try:
            results = DDGS().text(query, max_results=n) or []
            if not results:
                results = DDGS().news(query, max_results=n) or []
            if results:
                return results
        except Exception:
            pass
        time.sleep(2)
    return []


def _read(url: str, limit: int = 2500) -> str:
    try:
        r = requests.get(url, timeout=10, headers=HEADERS)
        soup = BeautifulSoup(r.text, "html.parser")
        for t in soup(["script", "style", "nav", "footer", "header", "aside"]):
            t.decompose()
        return " ".join(soup.get_text(" ").split())[:limit]
    except Exception:
        return ""


def gather_sources(topic: str, today: str, english: str | None = None, pages: int = 3) -> str:
    """Search and read pages in plain Python. Costs zero LLM calls.
    `english` is an English version of the topic (used when the topic is in Hindi or Marathi)."""
    year = today[:4]
    main = english or topic
    queries = [main]
    if main != topic:
        queries.append(topic)  # also search in the original language for local sources
    queries.append(f"{main} {year}")

    seen, hits = set(), []
    for q in queries:
        for r in _search(q):
            url = r.get("href") or r.get("url")
            if not url or url in seen or any(d in url for d in SKIP):
                continue
            seen.add(url)
            hits.append(r)

    if not hits:
        return "NO SOURCES FOUND."

    blocks = []
    for i, r in enumerate(hits[:6]):
        url = r.get("href") or r.get("url")
        snippet = (r.get("body") or "")[:300]
        content = _read(url) if i < pages else ""
        blocks.append(
            f"SOURCE {i + 1}\nURL: {url}\nTITLE: {r.get('title')}\n"
            f"CONTENT: {content or snippet}"
        )
    return "\n\n".join(blocks)
