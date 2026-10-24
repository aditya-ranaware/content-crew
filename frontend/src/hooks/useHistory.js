import { useCallback, useEffect, useState } from "react";
import { deleteArticle, listArticles } from "../lib/api";

export function useHistory(userId) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    listArticles()
      .then((rows) => alive && setItems(rows))
      .catch(() => {})
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [userId]);

  const add = useCallback((entry) => setItems((p) => [entry, ...p.filter((i) => i.id !== entry.id)]), []);
  const remove = useCallback(async (id) => {
    await deleteArticle(id);
    setItems((p) => p.filter((i) => i.id !== id));
  }, []);

  return { items, loading, add, remove };
}
