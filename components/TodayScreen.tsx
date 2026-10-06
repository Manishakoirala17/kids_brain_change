"use client";

import { useCallback, useEffect, useState } from "react";
import { awardSpeech } from "@/lib/badges";
import {
  bestStreak,
  currentStreak,
  grantAward,
  isDayComplete,
  lastNDays,
  pendingAward,
  streakBroken,
  todayRecord,
  toggleTask,
} from "@/lib/streak";
import type { Award } from "@/lib/types";
import { useApp } from "./AppProvider";
import { AwardModal, celebrate } from "./AwardModal";
import { MASCOT_NAME, Mascot } from "./Mascot";
import { StreakCard } from "./StreakCard";
import { TaskList } from "./TaskList";

const CHEERS = ["Super!", "Super! Well done!", "Super! Keep going!"];

function partOfDay(): string {
  const h = new Date().getHours();
  return h < 12 ? "morning" : h < 17 ? "afternoon" : "evening";
}

function greeting(name: string, broken: boolean): string {
  const hello = `Hello ${name}, happy ${partOfDay()}!`;
  return broken ? `${hello} Paravaalla! Let's start again today.` : hello;
}

export function TodayScreen() {
  const { kid, today, updateKid, speech } = useApp();
  const [needsTap, setNeedsTap] = useState(false);
  const [award, setAward] = useState<Award | null>(null);

  const record = todayRecord(kid, today);
  const streak = currentStreak(kid, today);
  const best = bestStreak(kid, today);
  const broken = streakBroken(kid, today);

  const markGreeted = useCallback(() => {
    setNeedsTap(false);
    updateKid(kid.id, (k) => ({ ...k, lastGreeted: today }));
  }, [kid.id, today, updateKid]);

  // Say hello once per day per kid. Browsers may block speech before the first tap,
  // in which case we show a "Tap to say hello" button instead.
  useEffect(() => {
    if (kid.lastGreeted === today) {
      setNeedsTap(false);
      return;
    }
    speech.say(greeting(kid.name, broken), { onStart: markGreeted, onBlocked: () => setNeedsTap(true) });
    // Only re-run when the kid or the day changes, not on every tick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kid.id, today]);

  const sayHello = () => {
    markGreeted();
    speech.say(greeting(kid.name, broken));
  };

  const onMascotTap = () => {
    if (needsTap) return sayHello();
    const left = kid.tasks.length - record.done.length;
    if (kid.tasks.length === 0) speech.say("Ask a grown-up to add your jobs!");
    else if (record.complete) speech.say(`You did it, ${kid.name}! See you tomorrow!`);
    else speech.say(`${left} more to go! You can do it!`);
  };

  const onToggle = (taskId: string) => {
    const unticking = record.done.includes(taskId);
    let next = toggleTask(kid, taskId, today);

    if (unticking || !isDayComplete(next, today, today)) {
      updateKid(kid.id, () => next);
      if (!unticking) speech.say(CHEERS[Math.floor(Math.random() * CHEERS.length)]);
      return;
    }

    // The day just became complete.
    const newStreak = currentStreak(next, today);
    const milestone = pendingAward(next, today);
    let earned: Award | null = null;
    if (milestone) ({ kid: next, award: earned } = grantAward(next, milestone, today));
    updateKid(kid.id, () => next);

    speech.say(
      newStreak > 1
        ? `Yay! All done for today, ${kid.name}! That's ${newStreak} days in a row!`
        : `Yay! All done for today, ${kid.name}!`,
    );
    if (earned) {
      setAward(earned);
      speech.say(awardSpeech(earned.milestone, kid.name, earned.reward), { interrupt: false });
    } else {
      celebrate(false);
    }
  };

  const closeAward = useCallback(() => setAward(null), []);

  let note: string;
  if (kid.tasks.length === 0) note = "Ask a grown-up to add jobs in the Parent corner.";
  else if (record.complete) note = "All stars collected today! 🌟";
  else if (broken) note = "Paravaalla! Let's start again today. 💛";
  else if (streak > 0) note = `Finish today's jobs to make it ${streak + 1}! 💪`;
  else note = "Tick all your jobs to start your streak! ⭐";

  return (
    <>
      <h1 className="sr-only">{kid.name}&apos;s day</h1>

      <section aria-label={`${MASCOT_NAME} the star`} className="flex items-center gap-3 py-2">
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={onMascotTap}
            aria-label={`${MASCOT_NAME} the star. Tap to hear ${MASCOT_NAME}.`}
            className="block size-32 rounded-full"
          >
            <Mascot talking={speech.talking} className="size-full" />
          </button>
        </div>
        <div className="min-w-0 flex-1">
          <div
            aria-live="polite"
            className="relative rounded-3xl bg-white px-4 py-3 text-lg font-bold leading-snug shadow-chunky before:absolute before:-left-2 before:top-6 before:size-4 before:rotate-45 before:bg-white"
          >
            <span className="relative">{speech.bubble || `Hi ${kid.name}! I'm ${MASCOT_NAME}.`}</span>
          </div>
          {needsTap && (
            <button
              type="button"
              onClick={sayHello}
              className="mt-2 min-h-12 w-full rounded-2xl bg-accent px-4 text-lg font-black text-white shadow-chunky active:translate-y-0.5"
            >
              🔊 Tap to say hello
            </button>
          )}
        </div>
      </section>

      <StreakCard streak={streak} best={best} week={lastNDays(kid, today)} />

      <p className="mt-4 rounded-2xl bg-accent-soft px-4 py-3 text-center text-lg font-bold text-accent-ink">{note}</p>

      <TaskList tasks={kid.tasks} done={record.done} onToggle={onToggle} />

      {award && <AwardModal award={award} kidName={kid.name} onClose={closeAward} />}
    </>
  );
}
