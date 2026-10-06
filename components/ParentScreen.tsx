"use client";

import Link from "next/link";
import { useRef, useState, type ReactNode } from "react";
import { BADGES } from "@/lib/badges";
import { normalizeData, uid } from "@/lib/data";
import { syncToday } from "@/lib/streak";
import { MILESTONES, type Kid, type Task } from "@/lib/types";
import { useApp } from "./AppProvider";
import { HoldToOpen } from "./HoldToOpen";
import { MASCOT_NAME } from "./Mascot";

const ICON_CHOICES = ["🪥", "🛁", "🚿", "👕", "🍽️", "🥛", "🎒", "📚", "✏️", "🧸", "🧹", "🙏", "🏃", "💧", "🛏️", "🎹", "🌱", "🦷"];

const input =
  "min-h-12 w-full rounded-xl border-2 border-line bg-white px-3 text-base font-semibold focus:border-accent focus:outline-none";
const smallBtn =
  "grid size-11 shrink-0 place-items-center rounded-xl border-2 border-line bg-white text-lg font-bold disabled:opacity-30";
const bigBtn = "min-h-12 rounded-2xl px-4 text-base font-extrabold";

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-5 rounded-[1.75rem] bg-white p-4 shadow-chunky">
      <h2 className="mb-3 text-xl font-black">{title}</h2>
      {children}
    </section>
  );
}

function TaskRow({
  task,
  index,
  count,
  onChange,
  onMove,
  onDelete,
}: {
  task: Task;
  index: number;
  count: number;
  onChange: (patch: Partial<Task>) => void;
  onMove: (dir: -1 | 1) => void;
  onDelete: () => void;
}) {
  const n = index + 1;
  return (
    <li className="rounded-2xl border-2 border-line p-3">
      <div className="flex gap-2">
        <input
          aria-label={`Task ${n} icon`}
          value={task.icon}
          maxLength={8}
          onChange={(e) => onChange({ icon: e.target.value })}
          className={`${input} w-14 shrink-0 px-0 text-center text-2xl`}
        />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <input
            aria-label={`Task ${n} English label`}
            value={task.en}
            onChange={(e) => onChange({ en: e.target.value })}
            onBlur={(e) => onChange({ en: e.target.value.trim() || "New task" })}
            className={input}
          />
          <input
            aria-label={`Task ${n} Tamil label (optional)`}
            lang="ta"
            placeholder="Tamil (optional)"
            value={task.ta}
            onChange={(e) => onChange({ ta: e.target.value })}
            className={input}
          />
        </div>
      </div>
      <div className="mt-2 flex justify-end gap-2">
        <button type="button" className={smallBtn} disabled={index === 0} onClick={() => onMove(-1)} aria-label={`Move ${task.en} up`}>
          ↑
        </button>
        <button type="button" className={smallBtn} disabled={index === count - 1} onClick={() => onMove(1)} aria-label={`Move ${task.en} down`}>
          ↓
        </button>
        <button type="button" className={`${smallBtn} text-red-600`} onClick={onDelete} aria-label={`Delete ${task.en}`}>
          🗑
        </button>
      </div>
    </li>
  );
}

export function ParentScreen() {
  const { data, kid, today, updateKid, updateSettings, replaceData, speech, parentUnlocked, setParentUnlocked } = useApp();
  const [draft, setDraft] = useState({ icon: "⭐", en: "", ta: "" });
  const [status, setStatus] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const newTaskRef = useRef<HTMLInputElement>(null);

  if (!parentUnlocked) {
    return (
      <div className="flex flex-col items-center pt-16 text-center">
        <h1 className="text-3xl font-black">Parent corner 🔒</h1>
        <p className="mt-2 text-lg font-semibold text-muted">Grown-ups: press and hold for 2 seconds.</p>
        <HoldToOpen
          label="Press and hold for 2 seconds to open the parent corner"
          onComplete={() => setParentUnlocked(true)}
          className="mt-6 flex min-h-24 min-w-24 flex-col items-center justify-center rounded-3xl bg-white p-4 shadow-chunky"
          caption={<span className="mt-1 font-bold text-muted">Hold</span>}
        >
          🔒
        </HoldToOpen>
      </div>
    );
  }

  const editTasks = (fn: (tasks: Task[]) => Task[]) =>
    updateKid(kid.id, (k: Kid) => syncToday({ ...k, tasks: fn(k.tasks) }, today));

  const addTask = () => {
    const en = draft.en.trim();
    if (!en) return newTaskRef.current?.focus();
    editTasks((tasks) => [...tasks, { id: uid(), en, ta: draft.ta.trim(), icon: draft.icon }]);
    setDraft({ icon: "⭐", en: "", ta: "" });
    newTaskRef.current?.focus();
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `star-streak-backup-${today}.json`;
    document.body.append(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStatus("Backup downloaded ✅");
  };

  const importData = async (file: File) => {
    try {
      const parsed: unknown = JSON.parse(await file.text());
      if (typeof parsed !== "object" || parsed === null || !Array.isArray((parsed as { kids?: unknown }).kids)) {
        throw new Error("not a backup");
      }
      if (!window.confirm("Replace ALL current data (both kids) with this backup?")) return;
      replaceData(normalizeData(parsed));
      setStatus("Backup restored ✅");
    } catch {
      setStatus("That file isn't a Star Streak backup.");
    }
  };

  const voices = speech.voices.filter((v) => /^en/i.test(v.lang));

  return (
    <>
      <div className="flex items-center justify-between gap-3 pt-2">
        <h1 className="text-3xl font-black">Parent corner</h1>
        <Link href="/" className={`${bigBtn} grid place-items-center bg-accent text-white shadow-chunky`}>
          Done
        </Link>
      </div>
      <p className="mt-1 font-semibold text-muted">
        Editing <b className="text-accent-ink">{kid.name}</b>. Switch child with the tabs above.
      </p>

      <Card title="Name">
        <input
          aria-label="Child's name"
          value={kid.name}
          maxLength={30}
          onChange={(e) => updateKid(kid.id, (k) => ({ ...k, name: e.target.value }))}
          onBlur={(e) => {
            const name = e.target.value.trim() || (kid.id === data.kids[0].id ? "Kaviinbha" : "Thambi");
            updateKid(kid.id, (k) => ({ ...k, name }));
          }}
          className={input}
        />
      </Card>

      <Card title={`${kid.name}'s jobs`}>
        {kid.tasks.length === 0 ? (
          <p className="mb-3 font-semibold text-muted">No jobs yet. Add one below.</p>
        ) : (
          <ol className="flex flex-col gap-3">
            {kid.tasks.map((t, i) => (
              <TaskRow
                key={t.id}
                task={t}
                index={i}
                count={kid.tasks.length}
                onChange={(patch) => editTasks((tasks) => tasks.map((x) => (x.id === t.id ? { ...x, ...patch } : x)))}
                onMove={(dir) =>
                  editTasks((tasks) => {
                    const next = [...tasks];
                    const j = i + dir;
                    [next[i], next[j]] = [next[j], next[i]];
                    return next;
                  })
                }
                onDelete={() => window.confirm(`Delete "${t.en}"?`) && editTasks((tasks) => tasks.filter((x) => x.id !== t.id))}
              />
            ))}
          </ol>
        )}

        <form
          className="mt-4 rounded-2xl bg-accent-soft p-3"
          onSubmit={(e) => {
            e.preventDefault();
            addTask();
          }}
        >
          <h3 className="mb-2 font-black">Add a job</h3>
          <div role="group" aria-label="Pick an icon" className="mb-2 flex flex-wrap gap-1.5">
            {ICON_CHOICES.map((icon) => (
              <button
                key={icon}
                type="button"
                aria-pressed={draft.icon === icon}
                aria-label={`Icon ${icon}`}
                onClick={() => setDraft((d) => ({ ...d, icon }))}
                className={`grid size-11 place-items-center rounded-xl text-2xl ${
                  draft.icon === icon ? "bg-accent ring-2 ring-accent" : "bg-white"
                }`}
              >
                {icon}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            <input
              ref={newTaskRef}
              aria-label="New job, English label"
              placeholder="e.g. Brush teeth"
              value={draft.en}
              onChange={(e) => setDraft((d) => ({ ...d, en: e.target.value }))}
              className={input}
            />
            <input
              aria-label="New job, Tamil label (optional)"
              lang="ta"
              placeholder="Tamil (optional), e.g. பல் துலக்கு"
              value={draft.ta}
              onChange={(e) => setDraft((d) => ({ ...d, ta: e.target.value }))}
              className={input}
            />
            <button type="submit" className={`${bigBtn} bg-accent text-white shadow-chunky`}>
              ＋ Add job
            </button>
          </div>
        </form>
        <p className="mt-2 text-sm font-semibold text-muted">Changes apply from today; past days keep their stars.</p>
      </Card>

      <Card title={`${kid.name}'s rewards`}>
        <ul className="flex flex-col gap-3">
          {MILESTONES.map((m) => (
            <li key={m}>
              <label className="flex flex-col gap-1">
                <span className="font-bold">
                  {BADGES[m].emoji} Day {m} · {BADGES[m].title}
                </span>
                <input
                  value={kid.rewards[m]}
                  maxLength={80}
                  placeholder={m === 7 ? "e.g. Park visit" : m === 30 ? "e.g. New toy" : "e.g. Ice cream treat"}
                  onChange={(e) => updateKid(kid.id, (k) => ({ ...k, rewards: { ...k.rewards, [m]: e.target.value } }))}
                  className={input}
                />
              </label>
            </li>
          ))}
        </ul>
      </Card>

      <Card title="Voice">
        <div className="flex items-center justify-between gap-3">
          <span id="mute-label" className="font-bold">
            Mute {MASCOT_NAME}&apos;s voice
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={data.settings.muted}
            aria-labelledby="mute-label"
            onClick={() => updateSettings({ muted: !data.settings.muted })}
            className={`relative h-9 w-16 shrink-0 rounded-full transition-colors ${data.settings.muted ? "bg-accent" : "bg-line"}`}
          >
            <span
              className={`absolute top-1 size-7 rounded-full bg-white shadow transition-[left] ${
                data.settings.muted ? "left-8" : "left-1"
              }`}
            />
          </button>
        </div>
        {!speech.supported && (
          <p className="mt-2 text-sm font-semibold text-muted">This browser can&apos;t speak, so {MASCOT_NAME} will show speech bubbles only.</p>
        )}
        {voices.length > 0 && (
          <label className="mt-4 flex flex-col gap-1">
            <span className="font-bold">Voice</span>
            <select
              value={data.settings.voiceURI}
              onChange={(e) => updateSettings({ voiceURI: e.target.value })}
              className={input}
            >
              <option value="">Automatic</option>
              {voices.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </label>
        )}
        <button
          type="button"
          onClick={() => speech.say(`Hello ${kid.name}! I'm ${MASCOT_NAME}.`)}
          className={`${bigBtn} mt-3 w-full border-2 border-line bg-white`}
        >
          🔊 Test voice
        </button>
      </Card>

      <Card title="Backup">
        <p className="mb-3 font-semibold text-muted">
          Everything is stored only on this device. Export a backup before clearing browser data or changing phones.
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={exportData} className={`${bigBtn} bg-accent text-white shadow-chunky`}>
            ⬇️ Export data
          </button>
          <button type="button" onClick={() => fileRef.current?.click()} className={`${bigBtn} border-2 border-line bg-white`}>
            ⬆️ Import data
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void importData(file);
            e.target.value = "";
          }}
        />
        <p role="status" className="mt-2 min-h-6 font-bold text-accent-ink">
          {status}
        </p>
        <button
          type="button"
          onClick={() => {
            if (!window.confirm(`Clear all of ${kid.name}'s stars, streaks and awards? Jobs and rewards stay.`)) return;
            updateKid(kid.id, (k) => ({ ...k, days: {}, awards: [], lastGreeted: "" }));
            setStatus(`${kid.name}'s history cleared.`);
          }}
          className={`${bigBtn} mt-2 w-full border-2 border-red-200 bg-white text-red-700`}
        >
          Clear {kid.name}&apos;s history
        </button>
      </Card>
    </>
  );
}
