"use client";

import { CalendarRange, Clock4, Sparkles } from "lucide-react";

import { type AvailabilitySummary as AvailabilitySummaryType } from "@/hooks/useAvailability";

type AvailabilitySummaryProps = {
  summary: AvailabilitySummaryType;
};

const cards = [
  {
    key: "selectedCount",
    label: "Open windows",
    icon: CalendarRange,
  },
  {
    key: "openDays",
    label: "Days covered",
    icon: Sparkles,
  },
  {
    key: "strongestWindow",
    label: "Best rhythm",
    icon: Clock4,
  },
] as const;

export function AvailabilitySummary({ summary }: AvailabilitySummaryProps) {
  return (
    <section className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700 dark:text-emerald-300">
          Snapshot
        </p>
        <h2 className="mt-2 font-serif text-2xl text-neutral-950 dark:text-neutral-50">
          Your week at a glance
        </h2>
      </div>

      <div className="space-y-3">
        {cards.map((card) => {
          const Icon = card.icon;
          const value =
            card.key === "strongestWindow"
              ? summary.strongestWindow
              : summary[card.key].toString();

          return (
            <article
              key={card.key}
              className="rounded-[1.75rem] border border-black/10 bg-white/85 p-5 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.6)] backdrop-blur dark:border-white/10 dark:bg-neutral-950/80"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  {card.label}
                </p>
                <span className="rounded-full bg-neutral-100 p-2 dark:bg-white/5">
                  <Icon className="h-4 w-4 text-neutral-700 dark:text-neutral-200" />
                </span>
              </div>
              <p className="mt-4 font-serif text-3xl text-neutral-950 dark:text-neutral-50">
                {value}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
