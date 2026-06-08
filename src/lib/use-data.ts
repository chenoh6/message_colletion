import { useState, useEffect, useCallback } from "react";
import type { Entry } from "@/lib/types";

interface UseEntriesOptions {
  source?: string;
  category?: string;
  limit?: number;
  autoFetch?: boolean;
  pollInterval?: number; // ms, 0 = no polling
}

interface UseEntriesResult {
  entries: Entry[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  total: number;
}

export function useEntries(options: UseEntriesOptions = {}): UseEntriesResult {
  const { source, category, limit = 50, autoFetch = true, pollInterval = 30000 } = options;
  const [entries, setEntries] = useState<Entry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (source) params.set("source", source);
      if (category) params.set("category", category);
      if (limit) params.set("limit", String(limit));
      const res = await fetch(`/api/entries?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setEntries(data.entries || []);
      setTotal(data.total || 0);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [source, category, limit]);

  useEffect(() => {
    if (autoFetch) refresh();
  }, [autoFetch, refresh]);

  // Auto-polling
  useEffect(() => {
    if (!pollInterval || pollInterval <= 0) return;
    const h = setInterval(refresh, pollInterval);
    return () => clearInterval(h);
  }, [pollInterval, refresh]);

  return { entries, loading, error, refresh, total };
}

export function useEntry(id: string | null) {
  const [entry, setEntry] = useState<Entry | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/entries?id=${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setEntry(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  return { entry, loading, error };
}

interface FetchStatus {
  id: string;
  name: string;
  tier: number;
  interval: number;
  lastFetched: string | null;
}

export function useFetchStatus() {
  const [statuses, setStatuses] = useState<FetchStatus[]>([]);
  const [totalEntries, setTotalEntries] = useState(0);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/fetch");
      const data = await res.json();
      setStatuses(data.sources || []);
      setTotalEntries(data.totalEntries || 0);
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { statuses, totalEntries, loading, refresh };
}

export function useFetchAction() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const fetchSource = useCallback(async (sourceId: string, force = false) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/fetch?source=${sourceId}&force=${force}`);
      const data = await res.json();
      setResult(data);
      return data;
    } catch (err: any) {
      setResult({ error: err.message });
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/fetch", { method: "POST" });
      const data = await res.json();
      setResult(data);
      return data;
    } catch (err: any) {
      setResult({ error: err.message });
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { fetchSource, fetchAll, loading, result };
}
