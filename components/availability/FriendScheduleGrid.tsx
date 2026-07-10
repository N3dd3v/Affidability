"use client";

import { Fragment, useMemo } from "react";

import { type AvailabilitySlot } from "@/lib/availability";
import { DAYS, TIME_BLOCKS, availabilityKey } from "@/lib/availability-view";

type FriendScheduleGridProps = {
  ownSlots: AvailabilitySlot[];
  friendSlots: AvailabilitySlot[];
};

type CellState = "unavailable" | "own" | "friend" | "overlap";

type LegendItem = {
  label: string;
  state: Exclude<CellState, "unavailable">;
};

const LEGEND_ITEMS: LegendItem[] = [
  { label: "Your free time", state: "own" },
  { label: "Friend free time", state: "friend" },
  { label: "Shared overlap", state: "overlap" },
];

function getCellState(
  ownKeySet: Set<string>,
  friendKeySet: Set<string>,
  key: string,
): CellState {
  const isOwnFree = ownKeySet.has(key);
  const isFriendFree = friendKeySet.has(key);

  if (isOwnFree && isFriendFree) {
    return "overlap";
  }

  if (isFriendFree) {
    return "friend";
  }

  if (isOwnFree) {
    return "own";
  }

  return "unavailable";
}

function getCellClasses(state: CellState): string {
  switch (state) {
    case "overlap":
      return "border-emerald-500 bg-emerald-500/20 text-emerald-900 shadow-sm shadow-emerald-500/10 dark:border-emerald-300 dark:bg-emerald-400/22 dark:text-emerald-100";
    case "friend":
      return "border-emerald-500 bg-emerald-500/12 text-emerald-800 dark:border-emerald-400 dark:bg-emerald-400/12 dark:text-emerald-200";
    case "own":
      return "border-black/15 bg-neutral-100 text-neutral-700 dark:border-white/15 dark:bg-white/8 dark:text-neutral-200";
    default:
      return "border-black/10 bg-neutral-50 text-neutral-400 dark:border-white/10 dark:bg-white/3 dark:text-neutral-500";
  }
}

function getCellLabel(state: CellState): string {
  switch (state) {
    case "overlap":
      return "Both free";
    case "friend":
      return "Friend free";
    case "own":
      return "You free";
    default:
      return "Unavailable";
  }
}

export function FriendScheduleGrid({
  ownSlots,
  friendSlots,
}: FriendScheduleGridProps) {
  const ownKeySet = useMemo(
    () =>
      new Set(
        ownSlots
          .filter((slot) => slot.status === "free")
          .map((slot) =>
            availabilityKey(slot.day_of_week, slot.start_time, slot.end_time),
          ),
      ),
    [ownSlots],
  );
  const friendKeySet = useMemo(
    () =>
      new Set(
        friendSlots
          .filter((slot) => slot.status === "free")
          .map((slot) =>
            availabilityKey(slot.day_of_week, slot.start_time, slot.end_time),
          ),
      ),
    [friendSlots],
  );

  return (
    <section className="rounded-4xl border border-black/10 bg-white/85 p-4 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.45)] backdrop-blur sm:p-6 dark:border-white/10 dark:bg-neutral-950/80">
      <div className="flex flex-col gap-4 border-b border-black/10 pb-5 dark:border-white/10">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700 dark:text-emerald-300">
              Weekly View
            </p>
            <h2 className="mt-2 font-serif text-2xl text-neutral-950 sm:text-3xl dark:text-neutral-50">
              Friend schedule
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-neutral-500 dark:text-neutral-400">
              Compare your week with your friend&apos;s shared rhythm and spot
              easy overlap.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs text-neutral-500 dark:text-neutral-400">
            {LEGEND_ITEMS.map((item) => (
              <span
                key={item.label}
                className={[
                  "inline-flex items-center gap-2 rounded-full border px-3 py-2",
                  getCellClasses(item.state),
                ].join(" ")}
              >
                <span className="h-2.5 w-2.5 rounded-full bg-current opacity-80" />
                {item.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-4 lg:hidden">
        {DAYS.map((day) => (
          <section
            key={day.value}
            className="rounded-3xl border border-black/10 bg-neutral-50/80 p-4 dark:border-white/10 dark:bg-white/4"
          >
            <h3 className="font-serif text-2xl text-neutral-950 dark:text-neutral-50">
              {day.fullLabel}
            </h3>

            <div className="mt-4 grid gap-3">
              {TIME_BLOCKS.map((block) => {
                const key = availabilityKey(day.value, block.start, block.end);
                const state = getCellState(ownKeySet, friendKeySet, key);

                return (
                  <div
                    key={key}
                    data-testid={`friend-schedule-cell-${key}`}
                    data-state={state}
                    aria-label={`${day.fullLabel} ${block.label}: ${getCellLabel(state)}`}
                    className={[
                      "flex min-h-22 flex-col justify-between rounded-2xl border p-4 text-left text-sm transition-all",
                      getCellClasses(state),
                    ].join(" ")}
                  >
                    <div>
                      <p className="font-medium text-neutral-900 dark:text-neutral-100">
                        {block.label}
                      </p>
                      <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                        {block.start} - {block.end}
                      </p>
                    </div>

                    <span className="mt-3 inline-flex items-center text-sm font-medium">
                      {getCellLabel(state)}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
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
              <div className="flex flex-col justify-center rounded-2xl border border-black/10 px-4 py-4 dark:border-white/10">
                <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  {block.label}
                </span>
                <span className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                  {block.start} - {block.end}
                </span>
              </div>

              {DAYS.map((day) => {
                const key = availabilityKey(day.value, block.start, block.end);
                const state = getCellState(ownKeySet, friendKeySet, key);

                return (
                  <div
                    key={key}
                    data-testid={`friend-schedule-cell-${key}`}
                    data-state={state}
                    aria-label={`${day.fullLabel} ${block.label}: ${getCellLabel(state)}`}
                    className={[
                      "flex min-h-20 items-center justify-center rounded-2xl border px-2 text-center text-sm font-medium transition-all",
                      getCellClasses(state),
                    ].join(" ")}
                  >
                    {getCellLabel(state)}
                  </div>
                );
              })}
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
