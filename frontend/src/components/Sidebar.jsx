import { LogOut, PenLine, Plus, Trash2 } from "lucide-react";

const when = (t) =>
  new Date(t).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

export default function Sidebar({ items, loading, activeId, onSelect, onNew, onDelete, user, onLogout, open, onClose }) {
  return (
    <>
      {open && <div className="no-print fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={onClose} aria-hidden="true" />}
      <aside
        aria-label="Article history"
        className={`no-print fixed inset-y-0 left-0 z-40 flex w-[272px] flex-col bg-side-bg text-side-ink transition-transform lg:static lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center gap-3 px-5 pb-4 pt-5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-accent-ink shadow-lg shadow-accent/30"><PenLine size={18} aria-hidden="true" /></span>
          <div>
            <p className="font-semibold leading-tight tracking-tight">Content Crew</p>
            <p className="text-xs text-side-muted">AI newsroom</p>
          </div>
        </div>

        <div className="px-4">
          <button onClick={onNew} className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-3 py-2.5 text-sm font-semibold text-accent-ink transition hover:bg-accent-hover">
            <Plus size={16} aria-hidden="true" /> New article
          </button>
        </div>

        <h2 className="mt-7 px-5 text-xs font-medium text-side-muted">Your articles</h2>
        <nav className="mt-2 flex-1 overflow-y-auto px-3 pb-3">
          {loading ? (
            <p className="px-2 py-3 text-sm text-side-muted">Loading your articles...</p>
          ) : items.length === 0 ? (
            <p className="px-2 py-3 text-sm leading-relaxed text-side-muted">Articles you generate are saved to your account and show up here.</p>
          ) : (
            <ul className="space-y-0.5">
              {items.map((it) => (
                <li key={it.id} className="group relative">
                  <button onClick={() => onSelect(it)} aria-current={it.id === activeId ? "true" : undefined}
                    className={`w-full rounded-lg px-3 py-2.5 pr-9 text-left transition ${it.id === activeId ? "bg-side-active" : "hover:bg-side-hover"}`}>
                    <span className="line-clamp-2 text-sm font-medium leading-snug">{it.topic}</span>
                    <span className="mt-0.5 block text-xs text-side-muted">{when(it.created_at)}</span>
                  </button>
                  <button onClick={() => onDelete(it.id)} aria-label={`Delete article: ${it.topic}`}
                    className="absolute right-1.5 top-2.5 rounded-md p-1.5 text-side-muted opacity-0 transition hover:text-danger focus-visible:opacity-100 group-hover:opacity-100">
                    <Trash2 size={14} aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </nav>

        <div className="flex items-center gap-3 border-t border-side-line p-4">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-side-active text-sm font-semibold uppercase">{user.email[0]}</span>
          <p className="min-w-0 flex-1 truncate text-sm text-side-muted" title={user.email}>{user.email}</p>
          <button onClick={onLogout} aria-label="Sign out" title="Sign out" className="rounded-md p-1.5 text-side-muted transition hover:bg-side-hover hover:text-side-ink">
            <LogOut size={16} aria-hidden="true" />
          </button>
        </div>
      </aside>
    </>
  );
}
