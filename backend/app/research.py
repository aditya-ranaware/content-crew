import os
import time

import requests
from bs4 import BeautifulSoup

HEADERS = {"User-Agent": "Mozilla/5.0"}
TAVILY_URL = "https://api.tavily.com/search"
SKIP = ("youtube.com", "facebook.com", "instagram.com", "twitter.com",
        "x.com", "linkedin.com", "pinterest.com", "reddit.com")


def _log(msg: str) -> None:
    print(f"[search] {msg}", flush=True)  # shows up in the Render logs


def _tavily(query: str, depth: str = "basic", n: int = 6) -> list[dict]:
    """Main search. Works from cloud servers, unlike DuckDuckGo."""
    key = os.getenv("TAVILY_API_KEY")
    headers = {"Content-Type": "application/json"}
    headers.update({"Authorization": f"Bearer {key}"} if key else {"X-Tavily-Access-Mode": "keyless"})
    body = {"query": query[:380], "search_depth": depth, "max_results": n}
    if depth == "advanced":
        body["chunks_per_source"] = 3
    try:
        r = requests.post(TAVILY_URL, json=body, headers=headers, timeout=30)
        if r.status_code != 200:
            _log(f"tavily returned {r.status_code}: {r.text[:200]}")
            return []
        return [{"title": x.get("title"), "url": x.get("url"), "content": x.get("content") or ""}
                for x in r.json().get("results", [])]
    except Exception as e:
        _log(f"tavily failed: {e}")
        return []


def _ddg(query: str, n: int = 6) -> list[dict]:
    """Backup search. Often blocked on cloud servers, fine on your own computer."""
    try:
        from ddgs import DDGS
        rows = DDGS().text(query, max_results=n) or DDGS().news(query, max_results=n) or []
        return [{"title": r.get("title"), "url": r.get("href") or r.get("url"), "content": r.get("body") or ""}
                for r in rows]
    except Exception as e:
        _log(f"duckduckgo failed: {e}")
        return []


def _read(url: str, limit: int = 2000) -> str:
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
    main = english or topic
    seen, hits = set(), []

    def add(rows):
        for r in rows:
            url = r.get("url")
            if not url or url in seen or any(d in url for d in SKIP):
                continue
            seen.add(url)
            hits.append(r)

    add(_tavily(main, "advanced", 6))
    if main != topic:
        add(_tavily(topic, "basic", 4))  # also search in the original language
    if len(hits) < 3:
        add(_ddg(main))
        if main != topic:
            add(_ddg(topic))
    _log(f"{len(hits)} sources found for: {main[:80]}")

    if not hits:
        return "NO SOURCES FOUND."

    blocks = []
    for i, r in enumerate(hits[:6]):
        text = (r["content"] or "")[:1500]
        if i < pages:
            page = _read(r["url"])
            if len(page) > len(text):
                text = page
        blocks.append(f"SOURCE {i + 1}\nURL: {r['url']}\nTITLE: {r['title']}\nCONTENT: {text}")
    return "\n\n".join(blocks)