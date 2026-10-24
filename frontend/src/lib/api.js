export const API = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";
const KEY = "cc.token";

export const getToken = () => { try { return localStorage.getItem(KEY); } catch { return null; } };
export const setToken = (t) => {
  try { t ? localStorage.setItem(KEY, t) : localStorage.removeItem(KEY); } catch {}
};

let onUnauthorized = () => {};
export const setUnauthorizedHandler = (fn) => { onUnauthorized = fn; };

async function request(path, { method = "GET", body, fallback = "Something went wrong. Please try again." } = {}) {
  const headers = {};
  if (body) headers["Content-Type"] = "application/json";
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${API}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  } catch {
    throw new Error("Cannot reach the server. Check that the backend is running.");
  }
  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    if (res.status === 401 && token) onUnauthorized();
    throw new Error(typeof data?.detail === "string" ? data.detail : fallback);
  }
  return data;
}

const credentialsHint = "Enter a valid email and a password of at least 8 characters.";
export const register = (email, password) =>
  request("/api/auth/register", { method: "POST", body: { email, password }, fallback: credentialsHint });
export const login = (email, password) =>
  request("/api/auth/login", { method: "POST", body: { email, password }, fallback: credentialsHint });
export const fetchMe = () => request("/api/auth/me");

export const startJob = (payload) =>
  request("/api/generate", { method: "POST", body: payload, fallback: "The server rejected this request. Check the topic and length." });

export const listArticles = () => request("/api/articles");
export const getArticle = (id) => request(`/api/articles/${id}`);
export const deleteArticle = (id) => request(`/api/articles/${id}`, { method: "DELETE" });

export function openStream(jobId, { onStageDone, onDone, onError }) {
  const es = new EventSource(`${API}/api/stream/${jobId}?token=${encodeURIComponent(getToken() || "")}`);
  let finished = false;
  es.onmessage = (m) => {
    const ev = JSON.parse(m.data);
    if (ev.type === "stage_done") onStageDone(ev.index);
    else if (ev.type === "done") { finished = true; es.close(); onDone(ev.result, ev.article_id); }
    else if (ev.type === "error") { finished = true; es.close(); onError(ev.message); }
  };
  es.onerror = () => {
    if (finished) return;
    finished = true;
    es.close();
    onError("Lost connection to the server. Check that the backend is running.");
  };
  return () => { finished = true; es.close(); };
}
