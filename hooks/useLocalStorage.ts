"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Persist a value in localStorage under one key.
 *
 * - The first render always uses `fallback()` so server and client markup match;
 *   `hydrated` flips to true once the stored value has been read on the client.
 * - Every read goes through `normalize`, so corrupt or outdated data becomes safe defaults.
 * - Reads and writes are wrapped in try/catch (private mode, quota, disabled storage).
 * - Changes made in another tab are picked up via the `storage` event.
 */
export function useLocalStorage<T>(
  key: string,
  fallback: () => T,
  normalize: (raw: unknown) => T,
): { value: T; setValue: (update: T | ((prev: T) => T)) => void; hydrated: boolean; saveFailed: boolean } {
  const [value, setState] = useState<T>(fallback);
  const [hydrated, setHydrated] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const normalizeRef = useRef(normalize);
  normalizeRef.current = normalize;

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(key);
      if (stored !== null) setState(normalizeRef.current(JSON.parse(stored)));
    } catch {
      // Unreadable or corrupt: keep the defaults.
    }
    setHydrated(true);

    const onStorage = (e: StorageEvent) => {
      if (e.key !== key || e.newValue === null) return;
      try {
        setState(normalizeRef.current(JSON.parse(e.newValue)));
      } catch {
        // Ignore bad writes from elsewhere.
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      setSaveFailed(false);
    } catch {
      setSaveFailed(true);
    }
  }, [key, value, hydrated]);

  const setValue = useCallback((update: T | ((prev: T) => T)) => {
    setState((prev) => (typeof update === "function" ? (update as (p: T) => T)(prev) : update));
  }, []);

  return { value, setValue, hydrated, saveFailed };
}
