"use client";

import confetti from "canvas-confetti";
import { useEffect, useRef } from "react";
import { BADGES } from "@/lib/badges";
import type { Award } from "@/lib/types";
import { Badge } from "./Badge";

const COLORS = ["#FFC93C", "#FF6B8B", "#6C5CE7", "#18A874", "#3A86FF", "#FF8A3D"];

export function celebrate(big: boolean) {
  const base = { colors: COLORS, disableForReducedMotion: true, zIndex: 60 };
  confetti({ ...base, particleCount: big ? 180 : 90, spread: big ? 100 : 70, origin: { y: 0.55 } });
  if (big) {
    window.setTimeout(() => confetti({ ...base, particleCount: 80, angle: 60, spread: 60, origin: { x: 0, y: 0.7 } }), 250);
    window.setTimeout(() => confetti({ ...base, particleCount: 80, angle: 120, spread: 60, origin: { x: 1, y: 0.7 } }), 400);
  }
}

/** Badge screen for Day 1, and a bigger one with sun rays for Day 7+. */
export function AwardModal({ award, kidName, onClose }: { award: Award; kidName: string; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const big = award.milestone >= 7;
  const info = BADGES[award.milestone];

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    celebrate(big);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previous?.focus?.();
    };
  }, [big, onClose]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/55 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="award-title"
        aria-describedby="award-desc"
        onClick={(e) => e.stopPropagation()}
        className={`animate-award-in relative w-full overflow-hidden rounded-[2rem] bg-white px-6 pb-6 pt-8 text-center shadow-2xl ${
          big ? "max-w-md" : "max-w-sm"
        }`}
      >
        {big && (
          <div
            aria-hidden="true"
            className="animate-rays pointer-events-none absolute -inset-1/2 opacity-30"
            style={{
              background: `repeating-conic-gradient(${info.color} 0deg 10deg, transparent 10deg 20deg)`,
            }}
          />
        )}
        <div className="relative">
          <p className="text-sm font-extrabold uppercase tracking-widest text-accent-ink">
            {award.milestone === 1 ? "Your streak has started!" : `${award.milestone} days in a row!`}
          </p>
          <Badge milestone={award.milestone} className={`mx-auto my-4 drop-shadow-lg ${big ? "w-48" : "w-36"}`} />
          <h2 id="award-title" className={`font-black ${big ? "text-4xl" : "text-3xl"}`}>
            {info.title}
          </h2>
          <p id="award-desc" className="mt-2 text-lg font-semibold text-muted">
            Well done, {kidName}! 🎉
          </p>
          {award.reward && (
            <p className="mt-4 rounded-2xl bg-gold/30 px-4 py-3 text-xl font-extrabold">🎁 Your reward: {award.reward}</p>
          )}
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="mt-6 min-h-14 w-full rounded-2xl bg-accent text-xl font-black text-white shadow-chunky active:translate-y-0.5"
          >
            Yay! 🎉
          </button>
        </div>
      </div>
    </div>
  );
}
