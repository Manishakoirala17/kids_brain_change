import { isDateKey } from "./dates";
import { MILESTONES, type AppData, type Award, type DayRecord, type Kid, type Milestone, type Task } from "./types";

export const STORAGE_KEY = "star-streak:v1";

export function uid(): string {
  return Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
}

const task = (icon: string, en: string, ta: string): Task => ({ id: uid(), icon, en, ta });

function makeKid(id: string, name: string, tasks: Task[]): Kid {
  return {
    id,
    name,
    tasks,
    days: {},
    rewards: { 1: "", 7: "Park visit", 14: "", 21: "", 30: "New toy" },
    awards: [],
    lastGreeted: "",
  };
}

export function defaultData(): AppData {
  return {
    version: 1,
    activeKidId: "kid-1",
    settings: { muted: false, voiceURI: "" },
    kids: [
      makeKid("kid-1", "Kaviinbha", [
        task("🪥", "Brush teeth", "பல் துலக்கு"),
        task("🛁", "Take a bath", "குளியல்"),
        task("🍽️", "Eat breakfast", "காலை உணவு"),
        task("🎒", "Pack school bag", "பள்ளிப் பை"),
        task("📚", "Read a book", "புத்தகம் படி"),
      ]),
      makeKid("kid-2", "Thambi", [
        task("🪥", "Brush teeth", "பல் துலக்கு"),
        task("🛁", "Take a bath", "குளியல்"),
        task("🥛", "Drink milk", "பால் குடி"),
        task("🧸", "Put toys away", "பொம்மைகளை அடுக்கு"),
      ]),
    ],
  };
}

// ---- Validation: turn anything (old versions, hand-edited backups, junk) into safe AppData ----

const str = (v: unknown, fallback = "", max = 80): string =>
  typeof v === "string" ? v.slice(0, max) : fallback;

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null;

function normalizeKid(raw: unknown, fallback: Kid): Kid {
  if (!isObj(raw)) return fallback;

  const tasks: Task[] = Array.isArray(raw.tasks)
    ? raw.tasks.filter(isObj).flatMap((t) => {
        const en = str(t.en).trim();
        return en ? [{ id: str(t.id) || uid(), en, ta: str(t.ta).trim(), icon: str(t.icon, "", 16) }] : [];
      })
    : fallback.tasks;

  const days: Record<string, DayRecord> = {};
  if (isObj(raw.days)) {
    for (const [date, rec] of Object.entries(raw.days)) {
      if (!isDateKey(date) || !isObj(rec)) continue;
      const done = Array.isArray(rec.done) ? rec.done.filter((x): x is string => typeof x === "string") : [];
      days[date] = { done, complete: rec.complete === true };
    }
  }

  const rawRewards = isObj(raw.rewards) ? raw.rewards : {};
  const rewards = Object.fromEntries(
    MILESTONES.map((m) => [m, str(rawRewards[m], fallback.rewards[m])]),
  ) as Record<Milestone, string>;

  const awards: Award[] = Array.isArray(raw.awards)
    ? raw.awards.filter(isObj).flatMap((a) =>
        (MILESTONES as readonly unknown[]).includes(a.milestone) && isDateKey(a.date)
          ? [{ milestone: a.milestone as Milestone, date: a.date, reward: str(a.reward) }]
          : [],
      )
    : [];

  return {
    id: fallback.id,
    name: str(raw.name, "", 30).trim() || fallback.name,
    tasks,
    days,
    rewards,
    awards,
    lastGreeted: isDateKey(raw.lastGreeted) ? raw.lastGreeted : "",
  };
}

export function normalizeData(raw: unknown): AppData {
  const base = defaultData();
  if (!isObj(raw) || !Array.isArray(raw.kids)) return base;
  const rawKids: unknown[] = raw.kids;

  // Always exactly two kids with stable ids; missing ones fall back to defaults.
  const kids = base.kids.map((fallback, i) => normalizeKid(rawKids[i], fallback));
  const settings = isObj(raw.settings) ? raw.settings : {};
  const activeKidId = kids.some((k) => k.id === raw.activeKidId) ? (raw.activeKidId as string) : kids[0].id;

  return {
    version: 1,
    activeKidId,
    settings: { muted: settings.muted === true, voiceURI: str(settings.voiceURI, "", 300) },
    kids,
  };
}
