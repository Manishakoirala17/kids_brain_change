import type { Task } from "@/lib/types";

export function TaskList({
  tasks,
  done,
  onToggle,
}: {
  tasks: Task[];
  done: string[];
  onToggle: (taskId: string) => void;
}) {
  const ticked = new Set(done);
  const count = tasks.filter((t) => ticked.has(t.id)).length;
  const pct = tasks.length ? Math.round((count / tasks.length) * 100) : 0;

  return (
    <section aria-labelledby="tasks-heading" className="mt-5">
      <div className="mb-2 flex items-end justify-between">
        <h2 id="tasks-heading" className="text-xl font-black">
          Today&apos;s jobs
        </h2>
        <p className="text-base font-bold text-muted" aria-live="polite">
          {count} of {tasks.length} done
        </p>
      </div>
      <div
        className="mb-3 h-3 overflow-hidden rounded-full bg-line"
        role="progressbar"
        aria-label="Today's progress"
        aria-valuemin={0}
        aria-valuemax={tasks.length}
        aria-valuenow={count}
      >
        <div className="h-full rounded-full bg-good transition-[width] duration-500" style={{ width: `${pct}%` }} />
      </div>

      <ul className="flex flex-col gap-3">
        {tasks.map((t) => {
          const isDone = ticked.has(t.id);
          return (
            <li key={t.id}>
              <button
                type="button"
                aria-pressed={isDone}
                onClick={() => onToggle(t.id)}
                className={`flex min-h-20 w-full items-center gap-3 rounded-3xl border-[3px] p-3 text-left transition-colors active:scale-[0.98] ${
                  isDone ? "animate-pop border-good bg-good/10" : "border-transparent bg-white shadow-chunky"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`grid size-14 shrink-0 place-items-center rounded-2xl text-3xl ${isDone ? "bg-white" : "bg-accent-soft"}`}
                >
                  {t.icon || "⭐"}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xl font-extrabold leading-tight">{t.en}</span>
                  {t.ta && (
                    <span lang="ta" className="mt-0.5 block text-base font-semibold text-muted">
                      {t.ta}
                    </span>
                  )}
                </span>
                <span
                  aria-hidden="true"
                  className={`grid size-11 shrink-0 place-items-center rounded-full border-[3px] text-2xl font-black ${
                    isDone ? "border-good bg-good text-white" : "border-line text-transparent"
                  }`}
                >
                  ✓
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
