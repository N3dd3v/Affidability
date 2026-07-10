"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  createAvailabilitySlot,
  deleteAvailabilitySlot,
  getAcceptedFriendAvailability,
  getMyAvailability,
  type FriendAvailability,
  type AvailabilitySlot,
} from "@/lib/availability";
import {
  availabilityKey,
  getDayLabel,
  getTimeBlockLabel,
  TIME_BLOCKS,
} from "@/lib/availability-view";
import { createClient } from "@/lib/supabase/client";

export type AvailabilityToast = {
  id: string;
  kind: "success" | "error";
  message: string;
};

export type AvailabilitySummary = {
  selectedCount: number;
  openDays: number;
  strongestWindow: string;
};

export type FriendAvailabilityHighlight = {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  slotCount: number;
  nextWindow: string;
};

export type UseAvailabilityResult = {
  currentUserId: string | null;
  initializing: boolean;
  selectedKeys: Set<string>;
  summary: AvailabilitySummary;
  friendHighlights: FriendAvailabilityHighlight[];
  pendingByKey: Record<string, boolean>;
  toggleSlot: (dayOfWeek: number, startTime: string, endTime: string) => Promise<void>;
  toasts: AvailabilityToast[];
  dismissToast: (id: string) => void;
};

const TOAST_DURATION_MS = 4000;

function createToastId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return "Something went wrong.";
}

function buildHighlight(entry: FriendAvailability): FriendAvailabilityHighlight {
  const firstSlot = entry.slots[0];

  return {
    id: entry.profile.id,
    username: entry.profile.username,
    displayName: entry.profile.display_name || entry.profile.username,
    avatarUrl: entry.profile.avatar_url,
    slotCount: entry.slots.length,
    nextWindow: firstSlot
      ? `${getDayLabel(firstSlot.day_of_week)} ${getTimeBlockLabel(
          firstSlot.start_time,
          firstSlot.end_time,
        )}`
      : "No shared windows yet",
  };
}

export function useAvailability(): UseAvailabilityResult {
  const supabase = useMemo(() => createClient(), []);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [friendHighlights, setFriendHighlights] = useState<
    FriendAvailabilityHighlight[]
  >([]);
  const [pendingByKey, setPendingByKey] = useState<Record<string, boolean>>({});
  const [toasts, setToasts] = useState<AvailabilityToast[]>([]);
  const toastTimeoutsRef = useRef(new Map<string, number>());

  const dismissToast = useCallback((id: string) => {
    const timeoutId = toastTimeoutsRef.current.get(id);

    if (timeoutId !== undefined) {
      window.clearTimeout(timeoutId);
      toastTimeoutsRef.current.delete(id);
    }

    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback(
    (kind: AvailabilityToast["kind"], message: string) => {
      const id = createToastId();

      setToasts((currentToasts) => [...currentToasts, { id, kind, message }]);

      const timeoutId = window.setTimeout(() => {
        toastTimeoutsRef.current.delete(id);
        setToasts((currentToasts) =>
          currentToasts.filter((toast) => toast.id !== id),
        );
      }, TOAST_DURATION_MS);

      toastTimeoutsRef.current.set(id, timeoutId);
    },
    [],
  );

  const refreshAvailability = useCallback(
    async (userId: string) => {
      const [nextSlots, nextFriendAvailability] = await Promise.all([
        getMyAvailability(supabase, userId),
        getAcceptedFriendAvailability(supabase, userId),
      ]);

      setSlots(nextSlots);
      setFriendHighlights(
        nextFriendAvailability
          .filter((entry) => entry.slots.length > 0)
          .slice(0, 5)
          .map(buildHighlight),
      );
    },
    [supabase],
  );

  useEffect(() => {
    let cancelled = false;

    async function initialize() {
      setInitializing(true);

      const { data, error } = await supabase.auth.getUser();

      if (cancelled) {
        return;
      }

      if (error) {
        setCurrentUserId(null);
        setSlots([]);
        setFriendHighlights([]);
        pushToast("error", getErrorMessage(error));
        setInitializing(false);
        return;
      }

      const userId = data.user?.id ?? null;
      setCurrentUserId(userId);

      if (!userId) {
        setSlots([]);
        setFriendHighlights([]);
        setInitializing(false);
        return;
      }

      try {
        await refreshAvailability(userId);
      } catch (error) {
        if (!cancelled) {
          setSlots([]);
          setFriendHighlights([]);
          pushToast("error", getErrorMessage(error));
        }
      } finally {
        if (!cancelled) {
          setInitializing(false);
        }
      }
    }

    void initialize();

    return () => {
      cancelled = true;
    };
  }, [pushToast, refreshAvailability, supabase]);

  useEffect(() => {
    const timeoutMap = toastTimeoutsRef.current;

    return () => {
      for (const timeoutId of timeoutMap.values()) {
        window.clearTimeout(timeoutId);
      }

      timeoutMap.clear();
    };
  }, []);

  const selectedKeys = useMemo(
    () =>
      new Set(
        slots.map((slot) =>
          availabilityKey(slot.day_of_week, slot.start_time, slot.end_time),
        ),
      ),
    [slots],
  );

  const summary = useMemo<AvailabilitySummary>(() => {
    const days = new Set(slots.map((slot) => slot.day_of_week));
    const countsByWindow = TIME_BLOCKS.map((block) => ({
      label: block.label,
      count: slots.filter(
        (slot) =>
          slot.start_time === block.start &&
          slot.end_time === block.end &&
          slot.status === "free",
      ).length,
    }));
    const strongestWindow =
      countsByWindow.sort((left, right) => right.count - left.count)[0]?.label ??
      "No pattern yet";

    return {
      selectedCount: slots.length,
      openDays: days.size,
      strongestWindow,
    };
  }, [slots]);

  const setPending = useCallback((key: string, pending: boolean) => {
    setPendingByKey((currentPending) => {
      if (pending) {
        return { ...currentPending, [key]: true };
      }

      const nextPending = { ...currentPending };
      delete nextPending[key];
      return nextPending;
    });
  }, []);

  const toggleSlot = useCallback(
    async (dayOfWeek: number, startTime: string, endTime: string) => {
      if (!currentUserId) {
        pushToast("error", "You must be signed in to update availability.");
        return;
      }

      const key = availabilityKey(dayOfWeek, startTime, endTime);
      const existingSlot = slots.find(
        (slot) =>
          slot.day_of_week === dayOfWeek &&
          slot.start_time === startTime &&
          slot.end_time === endTime,
      );

      setPending(key, true);

      try {
        if (existingSlot) {
          await deleteAvailabilitySlot(supabase, existingSlot.id, currentUserId);
          setSlots((currentSlots) =>
            currentSlots.filter((slot) => slot.id !== existingSlot.id),
          );
        } else {
          const nextSlot = await createAvailabilitySlot(supabase, currentUserId, {
            day_of_week: dayOfWeek,
            start_time: startTime,
            end_time: endTime,
            status: "free",
          });
          setSlots((currentSlots) =>
            [...currentSlots, nextSlot].sort((left, right) => {
              if (left.day_of_week !== right.day_of_week) {
                return left.day_of_week - right.day_of_week;
              }

              return left.start_time.localeCompare(right.start_time);
            }),
          );
        }

        pushToast("success", "Availability updated.");
      } catch (error) {
        pushToast("error", getErrorMessage(error));
      } finally {
        setPending(key, false);
      }
    },
    [currentUserId, pushToast, setPending, slots, supabase],
  );

  return {
    currentUserId,
    initializing,
    selectedKeys,
    summary,
    friendHighlights,
    pendingByKey,
    toggleSlot,
    toasts,
    dismissToast,
  };
}
