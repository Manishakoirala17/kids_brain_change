/**
 * Pure streak logic. Every function takes `today` explicitly so it can be
 * tested without mocking the clock, and none of them mutate their inputs.
 */
import { addDays } from "./dates";
import { MILESTONES, type Award, type DateKey, type DayRecord, type Kid, type Milestone, type Task } from "./types";

export function allTicked(tasks: Task[], done: string[]): boolean {
  if (tasks.length === 0) return false;
  const ticked = new Set(done);
  return tasks.every((t) => ticked.has(t.id));
}

/** Today's record with ticks for deleted tasks dropped and `complete` recomputed. */
export function todayRecord(kid: Kid, today: DateKey): DayRecord {
  const ids = new Set(kid.tasks.map((t) => t.id));
  const done = (kid.days[today]?.done ?? []).filter((id) => ids.has(id));
  return { done, complete: allTicked(kid.tasks, done) };
}

/** Re-sync today's stored record after the task list changes. */
export function syncToday(kid: Kid, today: DateKey): Kid {
  if (!kid.days[today]) return kid;
  return { ...kid, days: { ...kid.days, [today]: todayRecord(kid, today) } };
}

/** Today is judged live against the current task list; past days use the stored flag. */
export function isDayComplete(kid: Kid, date: DateKey, today: DateKey): boolean {
  if (date === today) return todayRecord(kid, today).complete;
  return kid.days[date]?.complete === true;
}

/** Consecutive complete days ending today if today is complete, otherwise ending yesterday. */
export function currentStreak(kid: Kid, today: DateKey): number {
  let day = isDayComplete(kid, today, today) ? today : addDays(today, -1);
  let count = 0;
  while (isDayComplete(kid, day, today)) {
    count++;
    day = addDays(day, -1);
  }
  return count;
}

/** Longest run of consecutive complete days in the whole history. */
export function bestStreak(kid: Kid, today: DateKey): number {
  const completeDays = new Set(Object.keys(kid.days).filter((d) => isDayComplete(kid, d, today)));
  let best = 0;
  for (const day of completeDays) {
    if (completeDays.has(addDays(day, -1))) continue; // not the start of a run
    let len = 0;
    let cursor = day;
    while (completeDays.has(cursor)) {
      len++;
      cursor = addDays(cursor, 1);
    }
    best = Math.max(best, len);
  }
  return best;
}

/** True when there is no current streak but the kid has completed days before. */
export function streakBroken(kid: Kid, today: DateKey): boolean {
  if (currentStreak(kid, today) > 0) return false;
  return Object.keys(kid.days).some((d) => d < today && kid.days[d].complete);
}

export interface DayDot {
  date: DateKey;
  complete: boolean;
  isToday: boolean;
}

/** The last `n` days, oldest first, ending with today. */
export function lastNDays(kid: Kid, today: DateKey, n = 7): DayDot[] {
  return Array.from({ length: n }, (_, i) => {
    const date = addDays(today, i - (n - 1));
    return { date, complete: isDayComplete(kid, date, today), isToday: date === today };
  });
}

/** Tick or untick a task for today. */
export function toggleTask(kid: Kid, taskId: string, today: DateKey): Kid {
  const current = todayRecord(kid, today);
  const done = current.done.includes(taskId)
    ? current.done.filter((id) => id !== taskId)
    : [...current.done, taskId];
  const record: DayRecord = { done, complete: allTicked(kid.tasks, done) };
  return { ...kid, days: { ...kid.days, [today]: record } };
}

export function isMilestone(n: number): n is Milestone {
  return (MILESTONES as readonly number[]).includes(n);
}

export function nextMilestone(streak: number): Milestone | null {
  return MILESTONES.find((m) => m > streak) ?? null;
}

/**
 * The milestone reached by today's streak, if it hasn't already been awarded today.
 * Unticking and re-ticking the last task therefore never awards twice.
 */
export function pendingAward(kid: Kid, today: DateKey): Milestone | null {
  if (!isDayComplete(kid, today, today)) return null;
  const streak = currentStreak(kid, today);
  if (!isMilestone(streak)) return null;
  const already = kid.awards.some((a) => a.milestone === streak && a.date === today);
  return already ? null : streak;
}

export function grantAward(kid: Kid, milestone: Milestone, today: DateKey): { kid: Kid; award: Award } {
  const award: Award = { milestone, date: today, reward: kid.rewards[milestone].trim() };
  return { kid: { ...kid, awards: [...kid.awards, award] }, award };
}
