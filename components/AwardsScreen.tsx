"use client";

import { BADGES } from "@/lib/badges";
import { formatDateKey } from "@/lib/dates";
import { currentStreak, nextMilestone } from "@/lib/streak";
import { MILESTONES } from "@/lib/types";
import { useApp } from "./AppProvider";
import { Badge } from "./Badge";

export function AwardsScreen() {
  const { kid, today } = useApp();
  const streak = currentStreak(kid, today);
  const next = nextMilestone(streak);
  const earned = [...kid.awards].sort((a, b) => b.date.localeCompare(a.date) || b.milestone - a.milestone);
  const earnedMilestones = new Set(kid.awards.map((a) => a.milestone));

  return (
    <>
      <h1 className="pt-2 text-3xl font-black">{kid.name}&apos;s Awards 🏆</h1>

      {next && (
        <p className="mt-3 rounded-2xl bg-accent-soft px-4 py-3 text-lg font-bold text-accent-ink">
          {next - streak} more {next - streak === 1 ? "day" : "days"} to {BADGES[next].emoji} {BADGES[next].title}!
        </p>
      )}

      <section aria-labelledby="collection" className="mt-5 rounded-[1.75rem] bg-white p-4 shadow-chunky">
        <h2 id="collection" className="mb-3 text-xl font-black">
          Badge collection
        </h2>
        <ul className="grid grid-cols-5 gap-2">
          {MILESTONES.map((m) => {
            const has = earnedMilestones.has(m);
            return (
              <li key={m} className="text-center">
                <Badge milestone={m} locked={!has} className="mx-auto w-full max-w-16" />
                <span className="text-xs font-bold text-muted">
                  Day {m}
                  <span className="sr-only">: {has ? `${BADGES[m].title}, earned` : "not earned yet"}</span>
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="earned" className="mt-5">
        <h2 id="earned" className="mb-3 text-xl font-black">
          Badges earned
        </h2>
        {earned.length === 0 ? (
          <p className="rounded-3xl bg-white p-5 text-center text-lg font-bold text-muted shadow-chunky">
            Finish all your jobs today to earn your First Star! ⭐
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {earned.map((a) => (
              <li key={`${a.milestone}-${a.date}`} className="flex items-center gap-4 rounded-3xl bg-white p-3 shadow-chunky">
                <Badge milestone={a.milestone} className="w-16 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xl font-black">{BADGES[a.milestone].title}</p>
                  <p className="font-semibold text-muted">
                    Day {a.milestone} streak ·{" "}
                    <time dateTime={a.date}>
                      {formatDateKey(a.date, { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
                    </time>
                  </p>
                  {a.reward && <p className="mt-1 font-bold text-accent-ink">🎁 {a.reward}</p>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
