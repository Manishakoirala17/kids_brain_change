/** Local calendar date, formatted YYYY-MM-DD (never UTC). */
export type DateKey = string;

export const MILESTONES = [1, 7, 14, 21, 30] as const;
export type Milestone = (typeof MILESTONES)[number];

export interface Task {
  id: string;
  en: string;
  /** Optional Tamil label. Empty string when not set. */
  ta: string;
  /** Optional emoji icon. Empty string when not set. */
  icon: string;
}

export interface DayRecord {
  /** Ids of tasks ticked on this day. */
  done: string[];
  /** True when every task was ticked. Frozen once the day is in the past. */
  complete: boolean;
}

export interface Award {
  milestone: Milestone;
  date: DateKey;
  /** The parent's reward text at the time it was earned. */
  reward: string;
}

export interface Kid {
  id: string;
  name: string;
  tasks: Task[];
  days: Record<DateKey, DayRecord>;
  rewards: Record<Milestone, string>;
  awards: Award[];
  /** The last day the mascot said hello to this kid. */
  lastGreeted: DateKey;
}

export interface Settings {
  muted: boolean;
  /** Preferred speechSynthesis voice; empty means automatic. */
  voiceURI: string;
}

export interface AppData {
  version: 1;
  activeKidId: string;
  settings: Settings;
  kids: Kid[];
}
