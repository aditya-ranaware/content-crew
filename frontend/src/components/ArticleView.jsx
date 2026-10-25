import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Check, Copy, Download, ExternalLink, FileDown } from "lucide-react";
import { LANGUAGES, TONES } from "../lib/stages";
import { hostname, parseArticle, readingMinutes, slugify, wordCount } from "../lib/text";

const TABS = [["article", "Article"], ["markdown", "Markdown"]];
const MD = {
  remarkPlugins: [remarkGfm],
  components: { table: ({ node, ...p }) => <div className="my-6 overflow-x-auto"><table {...p} /></div> },
};

function Card({ title, children }) {
  return (
    <section className="paper p-4">
      <h2 className="text-sm font-semibold">{title}</h2>
      <div className="mt-2">{children}</div>
    </section>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5 text-sm">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}

export default function ArticleView({ markdown, lang = "en", form, onNotify }) {
  const [tab, setTab] = useState("article");
  const [copied, setCopied] = useState(false);
  const a = useMemo(() => parseArticle(markdown), [markdown]);
  const words = wordCount(a.articleBody);
  useEffect(() => setTab("article"), [markdown]);

  const language = LANGUAGES.find((l) => l.value === lang)?.label ?? "English";
  const tone = TONES.find((t) => t.value === form?.tone)?.label ?? form?.tone;

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
    <>
      <div className="no-print mx-auto w-full max-w-[1240px] px-4 pb-16 sm:px-8">
        <div className="sticky top-0 z-10 -mx-4 mb-5 flex flex-wrap items-center justify-between gap-3 bg-bg/90 px-4 py-3 backdrop-blur sm:-mx-8 sm:px-8">
          <div role="tablist" aria-label="Output format" className="flex gap-1 rounded-xl bg-sunken p-1">
            {TABS.map(([id, name]) => (
              <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)}
                className={`rounded-lg px-3.5 py-1.5 text-sm transition ${tab === id ? "bg-surface font-medium shadow-sm" : "text-muted hover:text-ink"}`}>
                {name}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={copy} className={btn}>{copied ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}<span className={label}>{copied ? "Copied" : "Copy"}</span></button>
            <button onClick={download} className={btn}><Download size={15} aria-hidden="true" /><span className={label}>Markdown file</span></button>
            <button onClick={() => window.print()} title="In the print window, choose Save as PDF" className="flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-1.5 text-sm font-semibold text-accent-ink transition hover:bg-accent-hover">
              <FileDown size={15} aria-hidden="true" /><span className={label}>Save as PDF</span>
            </button>
          </div>
        </div>

        <div className="grid gap-6 min-[1320px]:grid-cols-[minmax(0,1fr)_330px]">
          <div className="min-w-0">
            {tab === "article" ? (
              <div className="paper px-6 py-8 sm:px-10 sm:py-10">
                <article className="article" lang={lang}><ReactMarkdown {...MD}>{a.articleBody}</ReactMarkdown></article>
              </div>
            ) : (
              <pre className="paper overflow-x-auto whitespace-pre-wrap break-words p-5 text-sm leading-relaxed">{markdown}</pre>
            )}
          </div>

          <aside className="space-y-4 min-[1320px]:sticky min-[1320px]:top-[76px] min-[1320px]:self-start">
            <Card title="Details">
              <dl className="divide-y divide-line">
                <Row label="Language" value={language} />
                {tone && <Row label="Tone" value={tone} />}
                {form?.audience && <Row label="Audience" value={form.audience} />}
                <Row label="Length" value={`${words.toLocaleString()} words`} />
                <Row label="Reading time" value={`${readingMinutes(words)} min`} />
              </dl>
            </Card>

            <Card title={`Sources (${a.sources.length})`}>
              {a.sources.length === 0 ? (
                <p className="text-sm text-muted">No source links were found. Treat the facts in this article as unverified.</p>
              ) : (
                <ul className="-mx-2 space-y-0.5">
                  {a.sources.map((u) => (
                    <li key={u}>
                      <a href={u} target="_blank" rel="noreferrer noopener" className="flex items-center justify-between gap-3 rounded-lg px-2 py-2 text-sm transition hover:bg-sunken">
                        <span className="min-w-0"><span className="block font-medium">{hostname(u)}</span><span className="block truncate text-xs text-muted">{u}</span></span>
                        <ExternalLink size={14} className="shrink-0 text-muted" aria-hidden="true" />
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            {(a.title || a.desc) && (
              <Card title="How it looks in Google">
                <p className="text-base leading-snug text-[#1a0dab] dark:text-[#8ab4f8]">{a.title || "No SEO title"}</p>
                <p className="mt-1 text-sm text-muted">{a.desc || "No meta description"}</p>
                <p className="mt-3 flex gap-4 text-xs text-muted">
                  <span className={a.title.length > 60 ? "text-danger" : ""}>Title {a.title.length}/60</span>
                  <span className={a.desc.length > 160 ? "text-danger" : ""}>Description {a.desc.length}/160</span>
                </p>
              </Card>
            )}
          </aside>
        </div>
      </div>

      {/* Printed page (PDF). Hidden on screen. */}
      <div className="print-only" aria-hidden="true">
        <div className="print-frame" />
        <table className="print-table">
          <thead><tr><td><div className="print-gap" /></td></tr></thead>
          <tfoot><tr><td><div className="print-gap" /></td></tr></tfoot>
          <tbody>
            <tr>
              <td className="print-body">
                <div className="print-head"><span>Content Crew</span><span>{new Date().toLocaleDateString([], { day: "numeric", month: "long", year: "numeric" })}</span></div>
                <article className="article print-article" lang={lang}><ReactMarkdown {...MD}>{a.articleBody}</ReactMarkdown></article>
                {a.sources.length > 0 && (
                  <section className="print-sources">
                    <h2>{a.sourcesTitle}</h2>
                    <ol>{a.sources.map((u) => <li key={u}>{u}</li>)}</ol>
                  </section>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}