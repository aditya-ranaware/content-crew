LANGS = {"en": "English", "hi": "Hindi", "mr": "Marathi"}

_COMMON = """LANGUAGE RULES (very important):
- Write the whole article in {name}, using the Devanagari script.
- Write the way a native {name} journalist writes. Never translate word for word from English. Sentences must sound natural to a native reader.
- Names of people, teams, places, companies and brands must be accurate. Write them in Devanagari and, on first mention only, add the original English spelling in brackets, for example: श्रेयस अय्यर (Shreyas Iyer).
- Use standard digits 0-9 for scores, dates, prices and statistics, and copy them exactly from the sources.
- Do not mix other languages into the text. Common abbreviations such as T20, IPL, AI and SEO may stay in English.
- Keep the labels '**SEO Title:**' and '**Meta Description:**' exactly in English. Write their values in {name}."""

_HINDI = """- Use standard modern Hindi, the way Dainik Bhaskar or Navbharat Times write. Prefer everyday words over heavy Sanskrit words."""

_MARATHI = """- Use standard Marathi, the way Loksatta or Maharashtra Times write.
- Do NOT use Hindi words or Hindi grammar. Use Marathi forms: 'आणि' (not 'और'), 'मध्ये' (not 'में'), 'आहे/आहेत' (not 'है/हैं'), 'झाला/झाली' (not 'हुआ/हुई'), 'विरुद्ध' (not 'बनाम'), 'तर' / 'पण' (not 'लेकिन').
- Check every sentence for Hindi words before you finish."""


def lang_name(code: str) -> str:
    return LANGS.get(code, "English")


def writing_rules(code: str) -> str:
    if code not in ("hi", "mr"):
        return ""
    extra = _HINDI if code == "hi" else _MARATHI
    return _COMMON.format(name=lang_name(code)) + "\n" + extra


def sources_heading(code: str) -> str:
    return "## स्रोत" if code in ("hi", "mr") else "## Sources"
