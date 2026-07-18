import { useEffect, useState, useCallback } from "react";
import { intelligenceApi } from "../services/api";
import type { StatusData } from "../types/api";

type RefreshState = "idle" | "starting" | "polling" | "done" | "error";

interface UseRefreshOpts {
  onComplete?: () => void;
  pollMs?: number;
}

/**
 * Manages the "Get Latest Updates" workflow: triggers the backend pipeline,
 * polls /status until refreshing flips false, then calls onComplete.
 * Never runs automatically — only on explicit user action.
 */
export function useRefreshPipeline({ onComplete, pollMs = 3000 }: UseRefreshOpts = {}) {
  const [status, setStatus] = useState<StatusData | null>(null);
  const [state, setState] = useState<RefreshState>("idle");
  const [error, setError] = useState<string | null>(null);

  // Fetch status ONCE on mount so header shows "Last Updated" without triggering pipeline.
  useEffect(() => {
    intelligenceApi.getStatus().then(setStatus).catch(() => {});
  }, []);

  const trigger = useCallback(async () => {
    if (state === "starting" || state === "polling") return;
    setError(null);
    setState("starting");
    try {
      await intelligenceApi.refresh();
      setState("polling");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Refresh failed");
      setState("error");
    }
  }, [state]);

  // Poll status while a refresh is in flight
  useEffect(() => {
    if (state !== "polling") return;
    let cancelled = false;
    const tick = async () => {
      try {
        const s = await intelligenceApi.getStatus();
        if (cancelled) return;
        setStatus(s);
        if (!s.refreshing) {
          setState("done");
          onComplete?.();
        }
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Status check failed");
        setState("error");
      }
    };
    tick();
    const id = setInterval(tick, pollMs);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [state, pollMs, onComplete]);

  const refreshing = state === "starting" || state === "polling" || !!status?.refreshing;

  return { status, refreshing, trigger, error, state };
}
