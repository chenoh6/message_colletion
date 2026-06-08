"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "crypto_saved_ids";

export function useSavedEntries() {
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  // 初始化从 localStorage 读取
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setSavedIds(new Set(JSON.parse(raw)));
      }
    } catch { /* ignore */ }
  }, []);

  const toggleSave = useCallback((id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      return next;
    });
  }, []);

  const isSaved = useCallback((id: string) => savedIds.has(id), [savedIds]);

  return { savedIds, toggleSave, isSaved };
}
