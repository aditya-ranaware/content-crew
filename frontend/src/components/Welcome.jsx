import Composer from "./Composer";

const STEPS = [
  ["Describe your topic", "Write what the article should cover."],
  ["Pick language, tone and length", "English, Hindi or Marathi."],
  ["Generate and save", "Check the sources, then copy it or save it as a PDF."],
];

export default function Welcome({ form, setForm, onSubmit }) {
  return (
    <div className="mx-auto flex min-h-[calc(100dvh-3.5rem)] w-full max-w-4xl flex-col justify-center px-5 py-12">
      <div className="text-center">
        <h1 className="font-serif text-4xl font-semibold leading-[1.1] tracking-tight text-balance sm:text-5xl">What should the crew write today?</h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted">
          AI agents research the web, write, fact-check and edit your article, with sources you can verify.
        </p>
      </div>

      <div className="mt-9"><Composer form={form} setForm={setForm} onSubmit={onSubmit} autoFocus /></div>

      <ol className="mt-12 grid gap-6 sm:grid-cols-3" aria-label="How to use">
        {STEPS.map(([title, text], i) => (
          <li key={title} className="flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent">{i + 1}</span>
            <div>
              <p className="text-sm font-semibold">{title}</p>
              <p className="mt-0.5 text-sm leading-snug text-muted">{text}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}