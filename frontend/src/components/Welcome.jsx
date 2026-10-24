import Composer from "./Composer";
import { EXAMPLE_CARDS, STAGES } from "../lib/stages";

export default function Welcome({ form, setForm, onSubmit }) {
  return (
    <div className="mx-auto w-full max-w-4xl px-5 pb-20 pt-12 sm:pt-20">
      <div className="text-center">
        <h1 className="font-serif text-4xl font-semibold leading-[1.1] tracking-tight text-balance sm:text-5xl">What should the crew write today?</h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted">
          Give it a topic. Five AI specialists research the web, write, fact-check and edit a publish-ready article, with sources.
        </p>
      </div>

      <div className="mt-9"><Composer form={form} setForm={setForm} onSubmit={onSubmit} autoFocus /></div>
      <p className="mt-2 text-center text-xs text-muted">Press Ctrl + Enter to generate</p>

      <h2 className="mt-14 text-sm font-medium text-muted">Or start from an example</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        {EXAMPLE_CARDS.map(({ icon: Icon, title, text, topics }) => (
          <button key={title} type="button" onClick={() => setForm((f) => ({ ...f, topic: topics[f.language] ?? topics.en }))}
            className="group rounded-xl border border-line bg-surface p-4 text-left transition hover:-translate-y-0.5 hover:border-accent/60 hover:shadow-card">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-soft text-accent"><Icon size={16} aria-hidden="true" /></span>
            <p className="mt-3 text-sm font-semibold">{title}</p>
            <p className="mt-0.5 text-sm leading-snug text-muted">{text}</p>
          </button>
        ))}
      </div>

      <h2 className="mt-14 text-sm font-medium text-muted">How the crew works</h2>
      <ol className="mt-3 grid gap-3 sm:grid-cols-5">
        {STAGES.map((s) => (
          <li key={s.key} className="rounded-xl border border-line bg-surface p-3.5">
            <s.icon size={18} className="text-accent" aria-hidden="true" />
            <p className="mt-2.5 text-sm font-semibold">{s.key}</p>
            <p className="mt-0.5 text-xs leading-snug text-muted">{s.job}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
