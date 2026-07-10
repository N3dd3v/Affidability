"use client";

import { useCallback } from "react";

import { AvailabilityGrid } from "@/components/availability/AvailabilityGrid";
import { FriendOverlapPanel } from "@/components/availability/FriendOverlapPanel";
import { AvailabilitySummary } from "@/components/availability/AvailabilitySummary";
import { ToastStack } from "@/components/ui/ToastStack";
import { useAvailability } from "@/hooks/useAvailability";

function CenteredSpinner() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <span
        aria-label="Loading"
        className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-700 dark:border-neutral-700 dark:border-t-neutral-200"
      />
    </div>
  );
}

export default function AvailabilityPage() {
  const availability = useAvailability();

  const busyFor = useCallback(
    (key: string) => Boolean(availability.pendingByKey[key]),
    [availability.pendingByKey],
  );

  if (availability.initializing) {
    return <CenteredSpinner />;
  }

  if (!availability.currentUserId) {
    return null;
  }

  return (
    <>
      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <div className="space-y-8">
          <header className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700 dark:text-emerald-300">
              Availability
            </p>
            <h1 className="mt-3 font-serif text-4xl leading-none text-neutral-950 sm:text-5xl dark:text-neutral-50">
              Turn a messy week into a clear social rhythm.
            </h1>
            <p className="mt-4 text-base leading-7 text-neutral-600 dark:text-neutral-300">
              Build your weekly pattern, then use it as a soft signal for friends.
              The goal is not perfect scheduling. It is faster, calmer planning.
            </p>
          </header>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.65fr)_minmax(18rem,0.95fr)]">
            <AvailabilityGrid
              selectedKeys={availability.selectedKeys}
              busyFor={busyFor}
              onToggle={(dayOfWeek, startTime, endTime) => {
                void availability.toggleSlot(dayOfWeek, startTime, endTime);
              }}
            />

            <div className="space-y-6">
              <AvailabilitySummary summary={availability.summary} />
              <FriendOverlapPanel items={availability.friendHighlights} />
            </div>
          </div>
        </div>
      </main>

      <ToastStack
        toasts={availability.toasts}
        onDismiss={availability.dismissToast}
      />
    </>
  );
}
