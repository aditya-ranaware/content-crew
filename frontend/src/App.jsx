import { useCallback, useRef, useState } from "react";
import { AlertTriangle, Menu, Moon, Plus, RotateCw, Square, Sun } from "lucide-react";
import Sidebar from "./components/Sidebar";
import Welcome from "./components/Welcome";
import CrewProgress from "./components/CrewProgress";
import ArticleView from "./components/ArticleView";
import AuthScreen from "./components/AuthScreen";
import { useTheme } from "./hooks/useTheme";
import { useHistory } from "./hooks/useHistory";
import { useGeneration } from "./hooks/useGeneration";
import { useAuth } from "./hooks/useAuth";
import { getArticle } from "./lib/api";
import { friendlyError } from "./lib/text";
import { LANGUAGES, LENGTHS, TONES } from "./lib/stages";

const DEFAULT_FORM = { topic: "", tone: "casual", audience: "General readers", word_count: 800, language: "en" };

export default function App() {
  const auth = useAuth();
  if (auth.loading) return <div className="flex h-dvh items-center justify-center text-muted"><span className="spinner" aria-label="Loading" /></div>;
  if (!auth.user) return <AuthScreen onSubmit={auth.authenticate} />;
  return <Workspace user={auth.user} onLogout={auth.logout} />;
}

function BriefBar({ form, running, onStop, onNew }) {
  const tone = TONES.find((t) => t.value === form.tone)?.label ?? form.tone;
  const length = LENGTHS.find((l) => l.value === form.word_count)?.hint ?? `${form.word_count} words`;
  const lang = LANGUAGES.find((l) => l.value === (form.language || "en"))?.label ?? "English";
  const tag = "rounded-md bg-sunken px-2 py-0.5 text-xs text-muted";
  return (
    <div className="mx-auto w-full max-w-3xl px-5 pt-6">
      <div className="paper flex items-start justify-between gap-4 p-4 sm:p-5">
        <div className="min-w-0">
          <p className="text-xs text-muted">Your brief</p>
          <p className="mt-0.5 line-clamp-2 font-medium leading-snug">{form.topic}</p>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            <span className={tag}>{lang}</span><span className={tag}>{tone}</span><span className={tag}>{form.audience}</span><span className={tag}>{length}</span>
          </div>
        </div>
        {running ? (
          <button onClick={onStop} className="flex shrink-0 items-center gap-2 rounded-lg border border-line px-3 py-1.5 text-sm transition hover:border-danger hover:text-danger">
            <Square size={13} aria-hidden="true" /> Stop
          </button>
        ) : (
          <button onClick={onNew} className="flex shrink-0 items-center gap-2 rounded-lg border border-line px-3 py-1.5 text-sm transition hover:border-accent/60">
            <Plus size={14} aria-hidden="true" /> New article
          </button>
        )}
      </div>
    </div>
  );
}

function Workspace({ user, onLogout }) {
  const { dark, toggle } = useTheme();
  const history = useHistory(user.id);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [activeId, setActiveId] = useState(null);
  const [menu, setMenu] = useState(false);
  const [toast, setToast] = useState("");
  const timer = useRef();

  const notify = useCallback((msg) => {
    setToast(msg);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(""), 2200);
  }, []);

  const gen = useGeneration({
    onDone: (result, articleId, payload) => {
      history.add({ id: articleId, ...payload, created_at: new Date().toISOString() });
      setActiveId(articleId);
      notify("Article saved to your account");
    },
  });

  const submit = () => {
    setActiveId(null);
    gen.start({ ...form, topic: form.topic.trim(), audience: form.audience.trim() || "General readers" });
  };
  const newArticle = () => { gen.reset(); setForm(DEFAULT_FORM); setActiveId(null); setMenu(false); };
  const select = async (it) => {
    setMenu(false);
    try {
      const full = await getArticle(it.id);
      setForm({ topic: it.topic, tone: it.tone, audience: it.audience, word_count: it.word_count, language: it.language || "en" });
      gen.show(full.content);
      setActiveId(it.id);
    } catch (e) { notify(e.message); }
  };
  const remove = async (id) => {
    try { await history.remove(id); if (id === activeId) newArticle(); }
    catch (e) { notify(e.message); }
  };

  const idle = gen.status === "idle";
  const err = gen.status === "error" ? friendlyError(gen.error) : null;

  return (
    <div className="print-reset flex h-dvh overflow-hidden bg-bg">
      <Sidebar items={history.items} loading={history.loading} activeId={activeId} onSelect={select} onNew={newArticle} onDelete={remove}
        user={user} onLogout={onLogout} open={menu} onClose={() => setMenu(false)} />

      <div className="print-reset flex min-w-0 flex-1 flex-col">
        <header className="no-print flex h-14 shrink-0 items-center gap-3 border-b border-line bg-bg/80 px-4 backdrop-blur">
          <button onClick={() => setMenu(true)} aria-label="Open article history" className="rounded-md p-1.5 hover:bg-sunken lg:hidden"><Menu size={20} aria-hidden="true" /></button>
                    <p className="min-w-0 flex-1 truncate text-sm font-medium">{idle ? "New article" : form.topic}</p>
          {gen.status === "done" && (
            <button onClick={newArticle} className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm transition hover:border-accent/60">
              <Plus size={14} aria-hidden="true" /> New article
            </button>
          )}
          <button onClick={toggle} aria-label={dark ? "Switch to light mode" : "Switch to dark mode"} title={dark ? "Light mode" : "Dark mode"}
            className="rounded-lg border border-line p-2 text-muted transition hover:border-accent/60 hover:text-ink">
            {dark ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}
          </button>
        </header>

        <main className={`print-reset min-h-0 flex-1 overflow-y-auto ${idle ? "hero-glow" : ""}`}>
          {idle && <Welcome form={form} setForm={setForm} onSubmit={submit} />}

          {!idle && gen.status !== "done" && <BriefBar form={form} running={gen.status === "running"} onStop={gen.cancel} onNew={newArticle} />}
          {gen.status === "running" && <CrewProgress completed={gen.completed} startedAt={gen.startedAt} />}

          {err && (
            <div className="mx-auto w-full max-w-3xl px-5 py-6">
              <div role="alert" className="rounded-2xl border border-danger/40 bg-danger-soft p-6">
                <p className="flex items-center gap-2 font-semibold text-danger"><AlertTriangle size={18} aria-hidden="true" />{err.title}</p>
                <p className="mt-2 text-sm leading-relaxed">{err.hint}</p>
                <button onClick={submit} className="mt-4 flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-ink transition hover:bg-accent-hover">
                  <RotateCw size={15} aria-hidden="true" />Try again
                </button>
                <details className="mt-4 text-xs text-muted"><summary className="cursor-pointer">Technical details</summary><p className="mt-2 break-words">{gen.error}</p></details>
              </div>
            </div>
          )}

          {gen.status === "done" && <ArticleView markdown={gen.result} lang={form.language} form={form} onNotify={notify} />}
        </main>
      </div>

      <div role="status" aria-live="polite" className="no-print pointer-events-none fixed bottom-5 left-1/2 z-50 -translate-x-1/2">
        {toast && <div className="rounded-lg bg-ink px-4 py-2 text-sm text-bg shadow-lg">{toast}</div>}
      </div>
    </div>
  );
}
