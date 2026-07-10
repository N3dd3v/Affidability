"use client";

import { Fragment } from "react";

import { Check, Clock3 } from "lucide-react";

import {
  availabilityKey,
  DAYS,
  TIME_BLOCKS,
} from "@/lib/availability-view";

type AvailabilityGridProps = {
  selectedKeys: Set<string>;
  busyFor: (key: string) => boolean;
  onToggle: (dayOfWeek: number, startTime: string, endTime: string) => void;
};

function CellSpinner() {
  return (
    <span
      aria-hidden="true"
      className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
    />
  );
}

function getCellClasses(isSelected: boolean, isBusy: boolean): string {
  return [
    "rounded-2xl border text-sm transition-all",
    isSelected
      ? "border-emerald-500 bg-emerald-500/12 text-emerald-800 shadow-sm shadow-emerald-500/10 dark:border-emerald-400 dark:bg-emerald-400/12 dark:text-emerald-200"
      : "border-black/10 bg-neutral-50 text-neutral-400 hover:border-neutral-400 hover:bg-white dark:border-white/10 dark:bg-white/3 dark:text-neutral-500 dark:hover:border-white/20 dark:hover:bg-white/6",
    isBusy ? "cursor-wait opacity-75" : "cursor-pointer",
  ].join(" ");
}

export function AvailabilityGrid({
  selectedKeys,
  busyFor,
  onToggle,
}: AvailabilityGridProps) {
  return (
    <section className="rounded-4xl border border-black/10 bg-white/85 p-4 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.45)] backdrop-blur sm:p-6 dark:border-white/10 dark:bg-neutral-950/80">
      <div className="flex flex-col gap-2 border-b border-black/10 pb-5 dark:border-white/10">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700 dark:text-emerald-300">
          Weekly Canvas
        </p>
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="font-serif text-2xl text-neutral-950 sm:text-3xl dark:text-neutral-50">
              Mark when you are open
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-neutral-500 dark:text-neutral-400">
              Toggle the windows that usually work for meetups. Keep it lightweight
              and update it as your week changes.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 self-start rounded-full border border-black/10 px-3 py-2 text-xs text-neutral-500 dark:border-white/10 dark:text-neutral-400">
            <Clock3 className="h-3.5 w-3.5" />
            Tap any slot to add or remove it
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-4 lg:hidden">
        {DAYS.map((day) => {
          const daySelections = TIME_BLOCKS.reduce((count, block) => {
            const key = availabilityKey(day.value, block.start, block.end);
            return count + (selectedKeys.has(key) ? 1 : 0);
          }, 0);

          return (
            <section
              key={day.value}
              className="rounded-3xl border border-black/10 bg-neutral-50/80 p-4 dark:border-white/10 dark:bg-white/4"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-serif text-2xl text-neutral-950 dark:text-neutral-50">
                    {day.fullLabel}
                  </h3>
                  <p className="text-xs uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
                    {daySelections} open windows
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-3">
                {TIME_BLOCKS.map((block) => {
                  const key = availabilityKey(day.value, block.start, block.end);
                  const isSelected = selectedKeys.has(key);
                  const isBusy = busyFor(key);

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => onToggle(day.value, block.start, block.end)}
                      disabled={isBusy}
                      className={[
                        "flex min-h-22 flex-col items-start justify-between p-4 text-left",
                        getCellClasses(isSelected, isBusy),
                      ].join(" ")}
                      aria-pressed={isSelected}
                    >
                      <div>
                        <p className="font-medium text-neutral-900 dark:text-neutral-100">
                          {block.label}
                        </p>
                        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                          {block.start} - {block.end}
                        </p>
                      </div>

                      {isBusy ? (
                        <CellSpinner />
                      ) : isSelected ? (
                        <span className="inline-flex items-center gap-1.5">
                          <Check className="h-4 w-4" />
                          Free
                        </span>
                      ) : (
                        <span>Set free</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      <div className="mt-6 hidden overflow-x-auto lg:block">
        <div className="grid grid-cols-[140px_repeat(7,minmax(84px,1fr))] gap-3">
          <div />
          {DAYS.map((day) => (
            <div
              key={day.value}
              className="rounded-2xl bg-neutral-100 px-3 py-3 text-center text-sm font-medium text-neutral-600 dark:bg-white/5 dark:text-neutral-300"
            >
              {day.label}
            </div>
          ))}

          {TIME_BLOCKS.map((block) => (
            <Fragment key={block.label}>
              <div
                className="flex flex-col justify-center rounded-2xl border border-black/10 px-4 py-4 dark:border-white/10"
              >
                <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  {block.label}
                </span>
                <span className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                  {block.start} - {block.end}
                </span>
              </div>

              {DAYS.map((day) => {
                const key = availabilityKey(day.value, block.start, block.end);
                const isSelected = selectedKeys.has(key);
                const isBusy = busyFor(key);

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => onToggle(day.value, block.start, block.end)}
                    disabled={isBusy}
                    className={[
                      "flex min-h-20 items-center justify-center px-2",
                      getCellClasses(isSelected, isBusy),
                    ].join(" ")}
                    aria-pressed={isSelected}
                  >
                    {isBusy ? (
                      <CellSpinner />
                    ) : isSelected ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Check className="h-4 w-4" />
                        Free
                      </span>
                    ) : (
                      <span>Set free</span>
                    )}
                  </button>
                );
              })}
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
