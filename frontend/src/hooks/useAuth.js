import { useCallback, useEffect, useState } from "react";
import { fetchMe, getToken, login, register, setToken, setUnauthorizedHandler } from "../lib/api";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => Boolean(getToken()));

  const logout = useCallback(() => { setToken(null); setUser(null); }, []);
  useEffect(() => { setUnauthorizedHandler(logout); }, [logout]);

  useEffect(() => {
    if (!getToken()) return;
    let alive = true;
    fetchMe()
      .then((u) => alive && setUser(u))
      .catch(() => {})
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, []);

  const authenticate = useCallback(async (mode, email, password) => {
    const fn = mode === "register" ? register : login;
    const { token, user } = await fn(email.trim(), password);
    setToken(token);
    setUser(user);
  }, []);

  return { user, loading, authenticate, logout };
}
