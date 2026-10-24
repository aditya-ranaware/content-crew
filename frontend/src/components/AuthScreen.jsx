import { useState } from "react";
import { PenLine, Search, ShieldCheck, TrendingUp } from "lucide-react";

const POINTS = [
  [Search, "Researches the live web", "Every article starts from real sources, not guesswork."],
  [ShieldCheck, "Fact-checks before it writes", "Names, numbers and dates are checked against the sources."],
  [TrendingUp, "Ready for search", "Comes with an SEO title, a meta description and a source list."],
];
const field = "w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm focus:border-accent";

export default function AuthScreen({ onSubmit }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const register = mode === "register";

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try { await onSubmit(mode, email, password); }
    catch (err) { setError(err.message); setBusy(false); }
  }

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <aside className="hidden flex-col justify-between bg-side-bg p-12 text-side-ink lg:flex" style={{ backgroundImage: "radial-gradient(40rem 24rem at 20% 0%, color-mix(in srgb, var(--accent) 22%, transparent), transparent 70%)" }}>
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-ink"><PenLine size={18} aria-hidden="true" /></span>
          <span className="text-lg font-semibold tracking-tight">Content Crew</span>
        </div>
        <div>
          <h1 className="max-w-lg font-serif text-5xl font-semibold leading-[1.1] tracking-tight text-balance">A newsroom of AI specialists, working on your next article.</h1>
          <ul className="mt-10 max-w-md space-y-5">
            {POINTS.map(([Icon, title, text]) => (
              <li key={title} className="flex gap-3">
                <Icon size={20} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
                <p className="text-sm leading-relaxed"><span className="font-semibold">{title}.</span> <span className="text-side-muted">{text}</span></p>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-sm text-side-muted">Your articles are saved to your account.</p>
      </aside>

      <main className="flex items-center justify-center bg-bg p-6">
        <form onSubmit={submit} className="paper w-full max-w-sm space-y-5 p-8">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">{register ? "Create your account" : "Welcome back"}</h2>
            <p className="mt-1 text-sm text-muted">{register ? "Start writing researched, fact-checked articles." : "Sign in to see your articles."}</p>
          </div>

          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium">Email</label>
            <input id="email" type="email" required autoComplete="email" className={field} value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium">Password</label>
            <input id="password" type="password" required minLength={8} autoComplete={register ? "new-password" : "current-password"} className={field} value={password} onChange={(e) => setPassword(e.target.value)} />
            {register && <p className="mt-1 text-xs text-muted">At least 8 characters.</p>}
          </div>

          {error && <p role="alert" className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">{error}</p>}

          <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent py-2.5 text-sm font-semibold text-accent-ink transition hover:brightness-110 disabled:opacity-60">
            {busy && <span className="spinner" aria-hidden="true" />}
            {register ? "Create account" : "Sign in"}
          </button>

          <p className="text-center text-sm text-muted">
            {register ? "Already have an account?" : "New here?"}{" "}
            <button type="button" onClick={() => { setMode(register ? "login" : "register"); setError(""); }} className="font-medium text-accent underline-offset-2 hover:underline">
              {register ? "Sign in" : "Create an account"}
            </button>
          </p>
        </form>
      </main>
    </div>
  );
}
