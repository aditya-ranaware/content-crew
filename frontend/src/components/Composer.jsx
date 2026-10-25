import { Gauge, Languages, Mic2, Sparkles, Users } from "lucide-react";
import { LANGUAGES, LENGTHS, TONES } from "../lib/stages";

const PLACEHOLDERS = {
  en: "Describe your topic. Be specific for better research.",
  hi: "अपना विषय लिखें। जितना स्पष्ट लिखेंगे, रिसर्च उतनी बेहतर होगी।",
  mr: "तुमचा विषय लिहा. जितका स्पष्ट असेल, तितके संशोधन चांगले.",
};

const chip = "flex items-center gap-1.5 rounded-lg border border-line bg-bg px-2.5 py-1.5 text-sm transition focus-within:border-accent hover:border-muted/50";

export default function Composer({ form, setForm, onSubmit, autoFocus }) {
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));
  const valid = form.topic.trim().length >= 3;
  const submit = () => { if (valid) onSubmit(); };

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); submit(); }}
      onKeyDown={(e) => { if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); submit(); } }}
      className="rounded-2xl border border-line bg-surface shadow-card transition focus-within:border-accent/70 focus-within:ring-4 focus-within:ring-accent/10"
    >
      <label htmlFor="topic" className="sr-only">Topic</label>
      <textarea
        id="topic" rows={3} maxLength={200} autoFocus={autoFocus}
        className="block w-full resize-none rounded-t-2xl focus-visible:outline-none bg-transparent px-5 pt-5 text-[17px] leading-relaxed outline-none placeholder:text-muted/70"
        placeholder={PLACEHOLDERS[form.language] ?? PLACEHOLDERS.en}
        value={form.topic}
        onChange={(e) => set("topic")(e.target.value)}
      />
      <div className="flex flex-wrap items-center gap-2 px-3 pb-3 pt-1">
        <label className={chip}>
          <Languages size={14} className="text-muted" aria-hidden="true" />
          <select aria-label="Article language" className="bg-transparent outline-none" value={form.language} onChange={(e) => set("language")(e.target.value)}>
            {LANGUAGES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
        </label>
        <label className={chip}>
          <Mic2 size={14} className="text-muted" aria-hidden="true" />
          <span className="sr-only">Tone</span>
          <select aria-label="Tone" className="bg-transparent outline-none" value={form.tone} onChange={(e) => set("tone")(e.target.value)}>
            {TONES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </label>
        <label className={chip}>
          <Users size={14} className="text-muted" aria-hidden="true" />
          <input aria-label="Audience" maxLength={80} className="w-28 bg-transparent outline-none placeholder:text-muted/70" placeholder="Audience" value={form.audience} onChange={(e) => set("audience")(e.target.value)} />
        </label>
        <label className={chip}>
          <Gauge size={14} className="text-muted" aria-hidden="true" />
          <select aria-label="Length" className="bg-transparent outline-none" value={form.word_count} onChange={(e) => set("word_count")(Number(e.target.value))}>
            {LENGTHS.map((l) => <option key={l.value} value={l.value}>{l.label} ({l.value})</option>)}
          </select>
        </label>
        <div className="ml-auto flex items-center gap-3">
          {form.topic.length > 150 && <span className="text-xs tabular-nums text-muted">{form.topic.length}/200</span>}
          <button type="submit" disabled={!valid} className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-accent-ink shadow-sm transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40">
            <Sparkles size={15} aria-hidden="true" /> Generate
          </button>
        </div>
      </div>
    </form>
  );
}
