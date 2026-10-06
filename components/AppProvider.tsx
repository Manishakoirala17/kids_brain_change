"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useSpeech } from "@/hooks/useSpeech";
import { useToday } from "@/hooks/useToday";
import { STORAGE_KEY, defaultData, normalizeData } from "@/lib/data";
import type { AppData, Kid, Settings } from "@/lib/types";

interface AppContextValue {
  data: AppData;
  today: string;
  kid: Kid;
  kidIndex: number;
  saveFailed: boolean;
  setActiveKid: (id: string) => void;
  updateKid: (id: string, update: (kid: Kid) => Kid) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  replaceData: (data: AppData) => void;
  speech: ReturnType<typeof useSpeech>;
  parentUnlocked: boolean;
  setParentUnlocked: (v: boolean) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const { value: data, setValue: setData, hydrated, saveFailed } = useLocalStorage(
    STORAGE_KEY,
    defaultData,
    normalizeData,
  );
  const today = useToday();
  const speech = useSpeech(data.settings);
  // In memory only: reloading /parent asks for the hold again.
  const [parentUnlocked, setParentUnlocked] = useState(false);

  const setActiveKid = useCallback((id: string) => setData((d) => ({ ...d, activeKidId: id })), [setData]);
  const updateKid = useCallback(
    (id: string, update: (kid: Kid) => Kid) =>
      setData((d) => ({ ...d, kids: d.kids.map((k) => (k.id === id ? update(k) : k)) })),
    [setData],
  );
  const updateSettings = useCallback(
    (patch: Partial<Settings>) => setData((d) => ({ ...d, settings: { ...d.settings, ...patch } })),
    [setData],
  );

  const kidIndex = Math.max(0, data.kids.findIndex((k) => k.id === data.activeKidId));

  const value = useMemo<AppContextValue>(
    () => ({
      data,
      today,
      kid: data.kids[kidIndex],
      kidIndex,
      saveFailed,
      setActiveKid,
      updateKid,
      updateSettings,
      replaceData: setData,
      speech,
      parentUnlocked,
      setParentUnlocked,
    }),
    [data, today, kidIndex, saveFailed, setActiveKid, updateKid, updateSettings, setData, speech, parentUnlocked],
  );

  // localStorage only exists in the browser: show a splash until it has been read,
  // so the static HTML and the first client render always match.
  if (!hydrated) {
    return (
      <div className="grid min-h-dvh place-items-center" role="status" aria-label="Loading Star Streak">
        <div className="animate-pulse text-6xl motion-reduce:animate-none" aria-hidden="true">
          ⭐
        </div>
      </div>
    );
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
