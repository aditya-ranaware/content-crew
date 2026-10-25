export const wordCount = (s) => (s.trim() ? s.trim().split(/\s+/).length : 0);
export const readingMinutes = (words) => Math.max(1, Math.round(words / 220));

export function hostname(url) {
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return url; }
}

export function parseArticle(md) {
  const title = md.match(/\*\*SEO Title:\*\*\s*(.+)/i)?.[1]?.trim() ?? "";
  const desc = md.match(/\*\*Meta Description:\*\*\s*(.+)/i)?.[1]?.trim() ?? "";
  const body = md
    .replace(/\*\*SEO Title:\*\*.*\n?/i, "")
    .replace(/\*\*Meta Description:\*\*.*\n?/i, "")
    .trim();

  // The sources list is the last section. Its heading may be in any language.
  const heads = [...body.matchAll(/^#{1,3}\s+.+$/gm)];
  const last = heads[heads.length - 1];
  const block = last ? body.slice(last.index) : "";
  const sources = [...new Set((block.match(/https?:\/\/[^\s)>\]]+/g) || []).map((u) => u.replace(/[.,;]+$/, "")))];
  const hasSources = sources.length > 0;

  return {
    title,
    desc,
    body,
    sources,
    articleBody: hasSources ? body.slice(0, last.index).trim() : body,
    sourcesTitle: hasSources ? last[0].replace(/^#+\s+/, "").trim() : "Sources",
  };
}

export function friendlyError(message = "") {
  if (/no sources found/i.test(message))
    return { title: "No sources found for this topic", hint: "Try a more specific topic, for example add the year or the full names. If this keeps happening, the search service may be down." };
  if (/already have an article in progress/i.test(message))
    return { title: "An article is already being written", hint: "Wait for it to finish, then try again. Only one article can be written at a time." };
  if (/all models are busy/i.test(message))
    return { title: "The AI service is busy right now", hint: "This is temporary. Wait a few minutes and try again." };
  if (/rate.?limit|429|413|tokens per minute/i.test(message))
    return { title: "The AI provider's usage limit was reached", hint: "Wait a minute and try again, or set a model with a higher limit in the backend .env file." };
  if (/reach the server|lost connection/i.test(message))
    return { title: "Can't reach the server", hint: "Check that the backend is running, then try again." };
  return { title: "The crew couldn't finish this article", hint: "Try again. If it keeps happening, shorten the topic or check the backend logs for details." };
}

export const slugify = (s) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "article";