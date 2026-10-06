import { BADGES } from "@/lib/badges";
import type { Milestone } from "@/lib/types";

/** A medal-style badge for a milestone. Purely decorative; pair it with visible text. */
export function Badge({ milestone, locked = false, className = "" }: { milestone: Milestone; locked?: boolean; className?: string }) {
  const b = BADGES[milestone];
  return (
    <svg
      viewBox="0 0 120 140"
      aria-hidden="true"
      focusable="false"
      className={`${locked ? "opacity-40 grayscale" : ""} ${className}`}
    >
      <path d="M38 86 L24 136 L44 125 L55 140 L66 96 Z" fill={b.ribbon} />
      <path d="M82 86 L96 136 L76 125 L65 140 L54 96 Z" fill={b.ribbon} />
      <circle cx="60" cy="56" r="50" fill={b.color} />
      <circle cx="60" cy="56" r="50" fill="none" stroke="#fff" strokeOpacity="0.45" strokeWidth="4" strokeDasharray="4 7" />
      <circle cx="60" cy="56" r="38" fill="#fff" />
      <text x="60" y="59" textAnchor="middle" dominantBaseline="central" fontSize="38">
        {locked ? "🔒" : b.emoji}
      </text>
      <circle cx="97" cy="19" r="17" fill="#2B2A4C" />
      <text x="97" y="20" textAnchor="middle" dominantBaseline="central" fontSize="15" fontWeight="800" fill="#fff">
        {milestone}
      </text>
    </svg>
  );
}
