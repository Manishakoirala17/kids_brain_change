"use client";

import { useEffect, useState } from "react";
import { toDateKey } from "@/lib/dates";

/** Today's local date key; rolls over at midnight and when the app comes back to the foreground. */
export function useToday(): string {
  const [today, setToday] = useState(() => toDateKey());

  useEffect(() => {
    const check = () => setToday(toDateKey());
    const timer = window.setInterval(check, 30_000);
    const onVisible = () => document.visibilityState === "visible" && check();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return today;
}
