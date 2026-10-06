"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { KeyboardEvent, ReactNode } from "react";
import { useApp } from "./AppProvider";
import { HoldToOpen } from "./HoldToOpen";

function KidTabs() {
  const { data, kid, setActiveKid } = useApp();

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    const i = data.kids.findIndex((k) => k.id === kid.id);
    const next = data.kids[(i + (e.key === "ArrowRight" ? 1 : data.kids.length - 1)) % data.kids.length];
    setActiveKid(next.id);
    document.getElementById(`kid-tab-${next.id}`)?.focus();
  };

  return (
    <div role="tablist" aria-label="Choose who is playing" className="grid grid-cols-2 gap-2" onKeyDown={onKeyDown}>
      {data.kids.map((k, i) => {
        const selected = k.id === kid.id;
        return (
          <button
            key={k.id}
            id={`kid-tab-${k.id}`}
            role="tab"
            type="button"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            data-kid={i}
            onClick={() => setActiveKid(k.id)}
            className={`min-h-13 truncate rounded-2xl px-3 text-lg font-extrabold transition-colors ${
              selected ? "bg-accent text-white shadow-chunky" : "bg-white text-muted ring-2 ring-line"
            }`}
          >
            {k.name}
          </button>
        );
      })}
    </div>
  );
}

function NavItem({ href, icon, label, current }: { href: string; icon: string; label: string; current: boolean }) {
  return (
    <Link
      href={href}
      aria-current={current ? "page" : undefined}
      className={`flex min-h-16 flex-col items-center justify-center gap-0.5 rounded-2xl text-sm font-bold ${
        current ? "bg-accent-soft text-accent-ink" : "text-muted"
      }`}
    >
      <span aria-hidden="true" className="text-2xl leading-none">
        {icon}
      </span>
      {label}
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { kidIndex, saveFailed, setParentUnlocked } = useApp();
  const pathname = usePathname();
  const router = useRouter();
  const at = (p: string) => (pathname.replace(/\/$/, "") || "/") === p;

  return (
    <div data-kid={kidIndex} className="mx-auto flex min-h-dvh max-w-xl flex-col">
      <header className="sticky top-0 z-20 bg-cream/90 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur">
        <p className="mb-2 text-center text-sm font-extrabold tracking-wide text-accent-ink">⭐ Star Streak</p>
        <KidTabs />
      </header>

      {saveFailed && (
        <p role="alert" className="mx-4 mb-2 rounded-xl bg-amber-100 px-3 py-2 text-sm font-semibold text-amber-900">
          Couldn&apos;t save on this device (storage full or blocked). Use Export on the Parent page to keep a copy.
        </p>
      )}

      <main className="flex-1 px-4 pb-32">{children}</main>

      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-20 border-t-2 border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
      >
        <div className="mx-auto grid max-w-xl grid-cols-3 gap-2 px-4 py-2">
          <NavItem href="/" icon="🏠" label="Today" current={at("/")} />
          <NavItem href="/awards" icon="🏆" label="My Awards" current={at("/awards")} />
          {at("/parent") ? (
            <NavItem href="/parent" icon="🔓" label="Parent" current />
          ) : (
            <HoldToOpen
              label="Parent corner. Press and hold for 2 seconds to open."
              className="flex min-h-16 flex-col items-center justify-center rounded-2xl text-sm font-bold text-muted"
              onComplete={() => {
                setParentUnlocked(true);
                router.push("/parent");
              }}
              caption={<span className="mt-0.5 leading-none">Parent · hold</span>}
            >
              🔒
            </HoldToOpen>
          )}
        </div>
      </nav>
    </div>
  );
}
