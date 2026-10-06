import { describe, expect, it } from "vitest";
import { addDays, toDateKey } from "./dates";
import { normalizeData } from "./data";
import {
  bestStreak,
  currentStreak,
  grantAward,
  isDayComplete,
  lastNDays,
  pendingAward,
  streakBroken,
  syncToday,
  toggleTask,
} from "./streak";
import type { Kid } from "./types";

const TODAY = "2026-10-05";

function kidWith(completeDaysAgo: number[], tasks = ["a", "b"]): Kid {
  const days: Kid["days"] = {};
  for (const n of completeDaysAgo) days[addDays(TODAY, -n)] = { done: [...tasks], complete: true };
  return {
    id: "k",
    name: "Kaviinbha",
    tasks: tasks.map((id) => ({ id, en: id, ta: "", icon: "" })),
    days,
    rewards: { 1: "", 7: "Park visit", 14: "", 21: "", 30: "New toy" },
    awards: [],
    lastGreeted: "",
  };
}

describe("dates", () => {
  it("uses local dates and handles month/year boundaries", () => {
    expect(toDateKey(new Date(2026, 0, 1, 0, 5))).toBe("2026-01-01");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
    expect(addDays("2025-12-31", 1)).toBe("2026-01-01");
  });
});

describe("currentStreak", () => {
  it("is 0 with no history", () => {
    expect(currentStreak(kidWith([]), TODAY)).toBe(0);
  });

  it("counts today when today is complete", () => {
    expect(currentStreak(kidWith([0, 1, 2]), TODAY)).toBe(3);
  });

  it("ends at yesterday when today is not complete yet", () => {
    expect(currentStreak(kidWith([1, 2]), TODAY)).toBe(2);
  });

  it("stops at a gap", () => {
    expect(currentStreak(kidWith([0, 1, 3, 4, 5]), TODAY)).toBe(2);
  });

  it("does not count today when a task was added after completing", () => {
    let kid = kidWith([0, 1]);
    kid = syncToday({ ...kid, tasks: [...kid.tasks, { id: "c", en: "c", ta: "", icon: "" }] }, TODAY);
    expect(isDayComplete(kid, TODAY, TODAY)).toBe(false);
    expect(currentStreak(kid, TODAY)).toBe(1);
  });

  it("never counts a day with zero tasks as complete", () => {
    expect(isDayComplete(kidWith([], []), TODAY, TODAY)).toBe(false);
  });
});

describe("bestStreak and streakBroken", () => {
  it("finds the longest run anywhere in history", () => {
    expect(bestStreak(kidWith([0, 1, 5, 6, 7, 8]), TODAY)).toBe(4);
  });

  it("is broken only when there is no streak but past progress exists", () => {
    expect(streakBroken(kidWith([]), TODAY)).toBe(false);
    expect(streakBroken(kidWith([1]), TODAY)).toBe(false);
    expect(streakBroken(kidWith([2, 3]), TODAY)).toBe(true);
  });
});

describe("toggleTask", () => {
  it("completes the day when every task is ticked, and can untick", () => {
    let kid = kidWith([]);
    kid = toggleTask(kid, "a", TODAY);
    expect(isDayComplete(kid, TODAY, TODAY)).toBe(false);
    kid = toggleTask(kid, "b", TODAY);
    expect(kid.days[TODAY].complete).toBe(true);
    kid = toggleTask(kid, "b", TODAY);
    expect(kid.days[TODAY]).toEqual({ done: ["a"], complete: false });
  });

  it("does not mutate the input", () => {
    const kid = kidWith([]);
    toggleTask(kid, "a", TODAY);
    expect(kid.days).toEqual({});
  });
});

describe("awards", () => {
  it("awards day 1 once, even after untick and re-tick", () => {
    let kid = toggleTask(toggleTask(kidWith([]), "a", TODAY), "b", TODAY);
    expect(pendingAward(kid, TODAY)).toBe(1);
    kid = grantAward(kid, 1, TODAY).kid;
    kid = toggleTask(toggleTask(kid, "b", TODAY), "b", TODAY);
    expect(pendingAward(kid, TODAY)).toBeNull();
  });

  it("awards day 7 with the parent's reward", () => {
    const kid = kidWith([0, 1, 2, 3, 4, 5, 6]);
    expect(pendingAward(kid, TODAY)).toBe(7);
    expect(grantAward(kid, 7, TODAY).award).toEqual({ milestone: 7, date: TODAY, reward: "Park visit" });
  });

  it("does not award non-milestone days", () => {
    expect(pendingAward(kidWith([0, 1]), TODAY)).toBeNull();
  });
});

describe("lastNDays", () => {
  it("returns 7 days oldest first ending today", () => {
    const dots = lastNDays(kidWith([0, 2]), TODAY);
    expect(dots).toHaveLength(7);
    expect(dots[6]).toEqual({ date: TODAY, complete: true, isToday: true });
    expect(dots.map((d) => d.complete)).toEqual([false, false, false, false, true, false, true]);
  });
});

describe("normalizeData", () => {
  it("returns defaults for junk", () => {
    expect(normalizeData("nope").kids.map((k) => k.name)).toEqual(["Kaviinbha", "Thambi"]);
    expect(normalizeData({ kids: "x" }).kids).toHaveLength(2);
  });

  it("drops invalid days, tasks and awards but keeps good data", () => {
    const data = normalizeData({
      activeKidId: "kid-2",
      kids: [
        {
          name: "Kavi",
          tasks: [{ id: "t1", en: "Brush" }, { en: "" }, null],
          days: { "2026-10-04": { done: ["t1"], complete: true }, bad: {} },
          awards: [{ milestone: 7, date: "2026-10-04", reward: "Park" }, { milestone: 5, date: "2026-10-04" }],
        },
      ],
    });
    const [kavi, thambi] = data.kids;
    expect(data.activeKidId).toBe("kid-2");
    expect(kavi.name).toBe("Kavi");
    expect(kavi.tasks).toEqual([{ id: "t1", en: "Brush", ta: "", icon: "" }]);
    expect(Object.keys(kavi.days)).toEqual(["2026-10-04"]);
    expect(kavi.awards).toHaveLength(1);
    expect(thambi.name).toBe("Thambi");
  });
});
