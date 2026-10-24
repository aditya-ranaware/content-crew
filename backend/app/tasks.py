from datetime import date
from crewai import Task
from .languages import lang_name, sources_heading, writing_rules


def build_tasks(agents, topic, tone, audience, word_count, sources, language="en"):
    researcher, seo, writer, fact_checker, editor = agents
    today = date.today()
    name = lang_name(language)
    rules = writing_rules(language)
    non_en = language != "en"

    research_task = Task(
        description=(
            f"Today is {today}. Topic: '{topic}'.\n"
            "Below are the sources found for this topic. Extract up to 10 important facts "
            "(names, dates, numbers, rankings, results). Fewer is fine.\n\n"
            "Rules:\n"
            "- Use ONLY the sources below. Never use memory.\n"
            "- Every fact must include its source URL.\n"
            "- Keep each fact in the language of its source. Do not translate.\n"
            "- Copy names and numbers exactly as they appear.\n"
            "- If the sources do not cover something important, add it under 'not found'.\n\n"
            f"SOURCES:\n{sources}"
        ),
        expected_output="A bullet list of facts, each with its source URL, plus a list of anything 'not found'.",
        agent=researcher,
    )

    seo_task = Task(
        description=(
            f"For the topic '{topic}', suggest 1 primary keyword, 5 secondary keywords, "
            "1 SEO title (under 60 characters) and 1 meta description (under 160 characters). "
            "Do not put unverified numbers or statistics in them."
            + (f"\nWrite all of them in {name} (Devanagari script), the way people in that language search on Google." if non_en else "")
        ),
        expected_output="Primary keyword, secondary keywords, SEO title, meta description.",
        agent=seo,
        context=[research_task],
    )

    write_task = Task(
        description=(
            f"Write a blog post on '{topic}' for {audience}. Tone: {tone}. "
            f"Length: about {word_count} words{' in ' + name if non_en else ''}.\n"
            "Rules:\n"
            "- Use ONLY facts from the research. Do not add any name, number, date or place that is not in it.\n"
            "- If the research has few facts, write a shorter post instead of inventing details.\n"
            "- Match the tense to today's date. Never call a finished event 'upcoming'.\n"
            "- Use headings, a short intro and a conclusion.\n"
            "- Include the SEO keywords naturally.\n"
            + (f"\n{rules}" if rules else "")
        ),
        expected_output=f"A complete blog post draft in Markdown{', written in ' + name if non_en else ''}.",
        agent=writer,
        context=[research_task, seo_task],
    )

    factcheck_task = Task(
        description=(
            "Check the draft line by line against the sources below. For every name, number, "
            "date and place, mark it VERIFIED, WRONG or UNVERIFIED. For each WRONG or UNVERIFIED "
            "claim give the corrected text or say 'remove'.\n"
            + (f"The draft is written in {name} while the sources may be in English. Compare names, numbers, dates and places regardless of language. Also flag any wrong spelling of a name. Write your report in English, but write corrected text in {name}.\n" if non_en else "")
            + f"\nSOURCES:\n{sources}"
        ),
        expected_output="A list of claims with status and the fix for each problem claim.",
        agent=fact_checker,
        context=[write_task],
    )

    edit_task = Task(
        description=(
            "Apply every fix from the fact-checker. Remove all WRONG and UNVERIFIED claims. "
            "Polish grammar, flow and tone. Put these two lines at the very top: "
            "'**SEO Title:** ...' and '**Meta Description:** ...'. "
            f"End with a '{sources_heading(language)}' list containing only URLs from the research. "
            "Do not add new facts. Output only the article, with no notes or comments."
            + (f"\n\nAlso proofread the {name} text like a careful editor: fix grammar, spelling and unnatural phrasing, and remove any words from another language.\n{rules}" if rules else "")
        ),
        expected_output=f"The final blog post in Markdown{', in ' + name if non_en else ''}, ready to publish.",
        agent=editor,
        context=[write_task, factcheck_task, seo_task, research_task],
    )

    return [research_task, seo_task, write_task, factcheck_task, edit_task]
