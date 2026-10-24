import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { STAGES } from "../lib/stages";

const clock = (ms) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

export default function CrewProgress({ completed, startedAt }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const pct = Math.round((completed / STAGES.length) * 100);
  const current = STAGES[Math.min(completed, STAGES.length - 1)];

  return (
    <div className="mx-auto w-full max-w-3xl px-5 pb-16 pt-5">
      <section className="paper p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl font-semibold tracking-tight">The crew is writing your article</h2>
            <p className="mt-1 text-sm text-muted">This can take a few minutes. You can leave this tab open.</p>
          </div>
          <span className="rounded-lg bg-sunken px-2.5 py-1 text-sm tabular-nums" aria-label="Elapsed time">{clock(now - startedAt)}</span>
        </div>

        <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-sunken" role="progressbar" aria-label="Progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
          <div className="h-full rounded-full bg-accent transition-all duration-700" style={{ width: `${Math.max(pct, 6)}%` }} />
        </div>
        <p className="sr-only" role="status" aria-live="polite">{current.key} is working</p>

        <ol className="mt-5 space-y-1.5">
          {STAGES.map((s, i) => {
            const done = i < completed;
            const active = i === completed;
            const Icon = s.icon;
            return (
              <li key={s.key} className={`flex items-center gap-4 rounded-xl px-4 py-3 transition ${active ? "bg-accent-soft" : ""}`}>
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${done ? "bg-success/15 text-success" : active ? "pulse-ring bg-accent text-accent-ink" : "bg-sunken text-muted"}`}>
                  {done ? <Check size={17} aria-hidden="true" /> : <Icon size={16} aria-hidden="true" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-semibold ${!done && !active ? "text-muted" : ""}`}>{s.key}</p>
                  <p className="text-sm text-muted">{s.job}</p>
                </div>
                <span className={`shrink-0 text-xs font-medium ${done ? "text-success" : active ? "text-accent" : "text-muted"}`}>
                  {done ? "Done" : active ? "Working" : "Waiting"}
                </span>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
