import { useCallback, useEffect, useRef, useState } from "react";
import { openStream, startJob } from "../lib/api";
import { STAGES } from "../lib/stages";

const IDLE = { status: "idle", completed: 0, result: "", error: "", startedAt: null };

export function useGeneration({ onDone } = {}) {
  const [state, setState] = useState(IDLE);
  const closeRef = useRef(null);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  const stop = () => { closeRef.current?.(); closeRef.current = null; };
  useEffect(() => stop, []);

  const start = useCallback(async (payload) => {
    stop();
    setState({ ...IDLE, status: "running", startedAt: Date.now() });
    try {
      const { job_id } = await startJob(payload);
      closeRef.current = openStream(job_id, {
        onStageDone: (i) => setState((s) => ({ ...s, completed: i })),
        onDone: (result, articleId) => {
          setState((s) => ({ ...s, status: "done", result, completed: STAGES.length }));
          doneRef.current?.(result, articleId, payload);
        },
        onError: (error) => setState((s) => ({ ...s, status: "error", error })),
      });
    } catch (e) {
      setState((s) => ({ ...s, status: "error", error: e.message }));
    }
  }, []);

  const reset = useCallback(() => { stop(); setState(IDLE); }, []);
  const show = useCallback((result) => {
    stop();
    setState({ ...IDLE, status: "done", result, completed: STAGES.length });
  }, []);

  return { ...state, start, cancel: reset, reset, show };
}
