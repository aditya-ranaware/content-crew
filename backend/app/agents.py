from crewai import Agent


def build_agents(llm):
    """Five specialists. They use no tools: sources are gathered in plain Python (see research.py)."""
    common = dict(llm=llm, verbose=True, allow_delegation=False, max_iter=3, max_retry_limit=0)

    researcher = Agent(
        role="Senior Researcher",
        goal="Extract accurate facts, each with its source URL, from the sources provided",
        backstory="You never use memory. You only use the sources you are given. If something is missing you write 'not found'.",
        **common,
    )
    seo = Agent(
        role="SEO Strategist",
        goal="Find the best keywords, a catchy title and a meta description",
        backstory="You make content rank on Google without keyword stuffing.",
        **common,
    )
    writer = Agent(
        role="Content Writer",
        goal="Write an engaging, well-structured blog post from the research",
        backstory="You turn research into readable stories. You never invent facts.",
        **common,
    )
    fact_checker = Agent(
        role="Fact Checker",
        goal="Verify every claim in the draft against the provided sources",
        backstory="You trust only what is written in the sources. Anything else is UNVERIFIED.",
        **common,
    )
    editor = Agent(
        role="Chief Editor",
        goal="Polish the draft into a final publish-ready article",
        backstory="You fix grammar, flow and tone, and keep only verified facts.",
        **common,
    )
    return researcher, seo, writer, fact_checker, editor
