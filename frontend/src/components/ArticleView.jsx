import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Check, Copy, Download, ExternalLink, Printer } from "lucide-react";
import { hostname, parseArticle, readingMinutes, slugify, wordCount } from "../lib/text";

const TABS = [["article", "Article"], ["markdown", "Markdown"], ["sources", "Sources"]];

export default function ArticleView({ markdown, lang = "en", onNotify }) {
  const [tab, setTab] = useState("article");
  const [copied, setCopied] = useState(false);
  const a = useMemo(() => parseArticle(markdown), [markdown]);
  const words = wordCount(a.body);
  useEffect(() => setTab("article"), [markdown]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      onNotify("Copied to clipboard");
      setTimeout(() => setCopied(false), 1500);
    } catch { onNotify("Couldn't copy. Select the text and copy it manually."); }
  }

  function download() {
    const name = slugify(a.body.match(/^#\s+(.+)/m)?.[1] || a.title);
    const url = URL.createObjectURL(new Blob([markdown], { type: "text/markdown" }));
    const link = Object.assign(document.createElement("a"), { href: url, download: `${name}.md` });
    link.click();
    URL.revokeObjectURL(url);
    onNotify("Downloaded");
  }

  const btn = "flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-sm transition hover:border-accent/60";
  const label = "hidden sm:inline";

  return (
    <div className="mx-auto w-full max-w-3xl px-5 pb-20">
      <div className="no-print sticky top-0 z-10 -mx-5 mb-5 flex flex-wrap items-center justify-between gap-3 bg-bg/90 px-5 py-3 backdrop-blur">
        <div role="tablist" aria-label="Output format" className="flex gap-1 rounded-xl bg-sunken p-1">
          {TABS.map(([id, name]) => (
            <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)}
              className={`rounded-lg px-3.5 py-1.5 text-sm transition ${tab === id ? "bg-surface font-medium shadow-sm" : "text-muted hover:text-ink"}`}>
              {name}{id === "sources" && a.sources.length > 0 ? ` (${a.sources.length})` : ""}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={copy} className={btn}>{copied ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}<span className={label}>{copied ? "Copied" : "Copy"}</span></button>
          <button onClick={download} className={btn}><Download size={15} aria-hidden="true" /><span className={label}>Download</span></button>
          <button onClick={() => window.print()} className={btn}><Printer size={15} aria-hidden="true" /><span className={label}>Print or PDF</span></button>
        </div>
      </div>

      {tab === "article" && (
        <>
          <p className="no-print mb-3 flex flex-wrap gap-x-4 text-sm text-muted">
            <span>{words.toLocaleString()} words</span><span>{readingMinutes(words)} min read</span>
            {a.sources.length > 0 && <span>{a.sources.length} sources</span>}
          </p>
          <div className="paper px-6 py-9 sm:px-14 sm:py-14">
            <article className="article mx-auto" lang={lang}><ReactMarkdown remarkPlugins={[remarkGfm]} components={{ table: ({ node, ...p }) => <div className="my-6 overflow-x-auto"><table {...p} /></div> }}>{a.body}</ReactMarkdown></article>
          </div>
          {(a.title || a.desc) && (
            <section aria-label="Search result preview" className="no-print paper mt-5 p-5">
              <h2 className="text-sm font-semibold">How this appears in search</h2>
              <p className="mt-3 text-lg leading-snug text-[#1a0dab] dark:text-[#8ab4f8]">{a.title || "No SEO title"}</p>
              <p className="mt-1 text-sm text-muted">{a.desc || "No meta description"}</p>
              <p className="mt-3 flex gap-4 text-xs text-muted">
                <span className={a.title.length > 60 ? "text-danger" : ""}>Title {a.title.length}/60</span>
                <span className={a.desc.length > 160 ? "text-danger" : ""}>Description {a.desc.length}/160</span>
              </p>
            </section>
          )}
        </>
      )}

      {tab === "markdown" && (
        <pre className="paper overflow-x-auto whitespace-pre-wrap break-words p-5 text-sm leading-relaxed">{markdown}</pre>
      )}

      {tab === "sources" && (
        <div className="paper p-6">
          <h2 className="text-lg font-semibold">Sources the crew used</h2>
          <p className="mt-1 text-sm text-muted">Open these to verify the facts before you publish.</p>
          {a.sources.length === 0 ? (
            <p className="mt-5 rounded-xl bg-sunken p-4 text-sm text-muted">No source links were found in this article. Treat its facts as unverified.</p>
          ) : (
            <ul className="mt-4 divide-y divide-line rounded-xl border border-line">
              {a.sources.map((u) => (
                <li key={u}>
                  <a href={u} target="_blank" rel="noreferrer noopener" className="flex items-center justify-between gap-3 px-4 py-3 text-sm transition hover:bg-sunken">
                    <span className="min-w-0"><span className="block font-medium">{hostname(u)}</span><span className="block truncate text-xs text-muted">{u}</span></span>
                    <ExternalLink size={15} className="shrink-0 text-muted" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
