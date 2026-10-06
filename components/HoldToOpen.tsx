"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * A button that only fires after being held for `ms` (pointer, Space or Enter).
 * A ring fills up while holding; a quick tap just shows a hint.
 */
export function HoldToOpen({
  onComplete,
  label,
  children,
  caption,
  ms = 2000,
  className = "",
}: {
  onComplete: () => void;
  label: string;
  children: ReactNode;
  caption?: ReactNode;
  ms?: number;
  className?: string;
}) {
  const [progress, setProgress] = useState(0);
  const [hint, setHint] = useState(false);
  const raf = useRef(0);
  const startedAt = useRef<number | null>(null);
  const completed = useRef(false);

  const stop = () => {
    cancelAnimationFrame(raf.current);
    const wasHolding = startedAt.current !== null;
    startedAt.current = null;
    setProgress(0);
    if (wasHolding && !completed.current) setHint(true);
  };

  const start = () => {
    if (startedAt.current !== null) return;
    completed.current = false;
    setHint(false);
    startedAt.current = performance.now();
    const tick = (now: number) => {
      if (startedAt.current === null) return;
      const p = Math.min(1, (now - startedAt.current) / ms);
      setProgress(p);
      if (p >= 1) {
        completed.current = true;
        startedAt.current = null;
        onComplete();
        return;
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  };

  useEffect(() => () => cancelAnimationFrame(raf.current), []);
  useEffect(() => {
    if (!hint) return;
    const t = window.setTimeout(() => setHint(false), 2200);
    return () => window.clearTimeout(t);
  }, [hint]);

  const isKey = (key: string) => key === " " || key === "Enter";

  return (
    <button
      type="button"
      aria-label={label}
      className={`relative touch-none select-none [-webkit-touch-callout:none] ${className}`}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture?.(e.pointerId);
        start();
      }}
      onPointerUp={stop}
      onPointerCancel={stop}
      onLostPointerCapture={stop}
      onKeyDown={(e) => {
        if (!isKey(e.key)) return;
        e.preventDefault();
        if (!e.repeat) start();
      }}
      onKeyUp={(e) => isKey(e.key) && stop()}
      onBlur={stop}
      onContextMenu={(e) => e.preventDefault()}
    >
      <span
        aria-hidden="true"
        className="mx-auto grid size-11 place-items-center rounded-full p-[3px]"
        style={{ background: `conic-gradient(var(--accent) ${progress}turn, var(--color-line) 0)` }}
      >
        <span className="grid size-full place-items-center rounded-full bg-white text-xl">{children}</span>
      </span>
      {caption}
      {hint && (
        <span
          role="status"
          className="absolute bottom-full left-1/2 mb-2 w-max -translate-x-1/2 rounded-xl bg-ink px-3 py-2 text-sm font-semibold text-white shadow-lg"
        >
          Hold for 2 seconds 🔒
        </span>
      )}
    </button>
  );
}
