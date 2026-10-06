import { formatDateKey } from "@/lib/dates";
import type { DayDot } from "@/lib/streak";

function StarDot({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-8">
      <path
        d="M12 2.6l2.85 5.96 6.55.83-4.8 4.55 1.22 6.5L12 17.27l-5.82 3.17 1.22-6.5-4.8-4.55 6.55-.83z"
        strokeWidth="1.8"
        strokeLinejoin="round"
        className={filled ? "fill-gold stroke-gold-deep" : "fill-none stroke-line"}
      />
    </svg>
  );
}

export function StreakCard({ streak, best, week }: { streak: number; best: number; week: DayDot[] }) {
  return (
    <section aria-label="Streak" className="rounded-[1.75rem] bg-white p-5 text-center shadow-chunky">
      <p className="flex items-baseline justify-center gap-2">
        <span key={streak} className="animate-pop text-7xl font-black leading-none text-accent tabular-nums">
          {streak}
        </span>
        <span className="text-xl font-extrabold text-muted">{streak === 1 ? "day streak" : "day streak"}</span>
      </p>
      <p className="mt-1 text-base font-bold text-muted">
        🏆 Best: <span className="text-ink">{best}</span> {best === 1 ? "day" : "days"}
      </p>

      <ol className="mt-4 grid grid-cols-7 gap-1" aria-label="Last 7 days">
        {week.map((d) => (
          <li
            key={d.date}
            aria-label={`${formatDateKey(d.date, { weekday: "long" })}${d.isToday ? " (today)" : ""}: ${
              d.complete ? "all done" : "not yet"
            }`}
            className={`flex flex-col items-center gap-0.5 rounded-xl py-1 ${d.isToday ? "bg-accent-soft" : ""}`}
          >
            <StarDot filled={d.complete} />
            <span aria-hidden="true" className={`text-xs font-bold ${d.isToday ? "text-accent-ink" : "text-muted"}`}>
              {d.isToday ? "Today" : formatDateKey(d.date, { weekday: "short" })}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
