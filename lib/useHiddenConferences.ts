"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "hidden-conferences";

function readHidden(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function useHiddenConferences() {
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);

  // Hydrate from localStorage after mount
  useEffect(() => {
    setHiddenIds(readHidden());
  }, []);

  const isHidden = useCallback(
    (id: string) => hiddenIds.includes(id),
    [hiddenIds]
  );

  const toggleHidden = useCallback((id: string) => {
    setHiddenIds((prev) => {
      const next = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { hiddenIds, isHidden, toggleHidden };
}
