"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import {
  type RealtimeChannel,
  type RealtimePostgresChangesPayload,
} from "@supabase/supabase-js";

import { normalizeSlot, type AvailabilitySlot } from "@/lib/availability";
import { createClient } from "@/lib/supabase/client";

export type UseRealtimeAvailabilityOptions = {
  currentUserId: string | null;
  acceptedFriendIds: string[];
  initialAvailability: AvailabilitySlot[];
};

export type UseRealtimeAvailabilityResult = {
  availability: AvailabilitySlot[];
  setAvailability: Dispatch<SetStateAction<AvailabilitySlot[]>>;
};

function sortAvailability(
  availability: AvailabilitySlot[],
): AvailabilitySlot[] {
  return [...availability].sort((left, right) => {
    if (left.user_id !== right.user_id) {
      return left.user_id.localeCompare(right.user_id);
    }

    if (left.day_of_week !== right.day_of_week) {
      return left.day_of_week - right.day_of_week;
    }

    if (left.start_time !== right.start_time) {
      return left.start_time.localeCompare(right.start_time);
    }

    return left.end_time.localeCompare(right.end_time);
  });
}

function filterToAcceptedFriends(
  availability: AvailabilitySlot[],
  acceptedFriendIds: Set<string>,
): AvailabilitySlot[] {
  return sortAvailability(
    availability.filter((slot) => acceptedFriendIds.has(slot.user_id)),
  );
}

function upsertAvailabilitySlot(
  currentAvailability: AvailabilitySlot[],
  nextSlot: AvailabilitySlot,
): AvailabilitySlot[] {
  const withoutExisting = currentAvailability.filter(
    (slot) => slot.id !== nextSlot.id,
  );

  return sortAvailability([...withoutExisting, nextSlot]);
}

function handleAvailabilityChange(
  payload: RealtimePostgresChangesPayload<AvailabilitySlot>,
  acceptedFriendIds: Set<string>,
  setAvailability: Dispatch<SetStateAction<AvailabilitySlot[]>>,
): void {
  switch (payload.eventType) {
    case "INSERT": {
      const nextSlot = normalizeSlot(payload.new);

      if (!acceptedFriendIds.has(nextSlot.user_id)) {
        return;
      }

      setAvailability((currentAvailability) =>
        upsertAvailabilitySlot(currentAvailability, nextSlot),
      );
      return;
    }

    case "UPDATE": {
      const nextSlot = normalizeSlot(payload.new);

      if (!acceptedFriendIds.has(nextSlot.user_id)) {
        return;
      }

      setAvailability((currentAvailability) =>
        upsertAvailabilitySlot(currentAvailability, nextSlot),
      );
      return;
    }

    default:
      return;
  }
}

export function useRealtimeAvailability({
  currentUserId,
  acceptedFriendIds,
  initialAvailability,
}: UseRealtimeAvailabilityOptions): UseRealtimeAvailabilityResult {
  const supabase = useMemo(() => createClient(), []);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const acceptedFriendIdsKey = useMemo(
    () => [...new Set(acceptedFriendIds)].sort().join(","),
    [acceptedFriendIds],
  );
  const acceptedFriendIdSet = useMemo(
    () => new Set(acceptedFriendIds),
    [acceptedFriendIdsKey],
  );
  const [availability, setAvailability] = useState<AvailabilitySlot[]>(() =>
    filterToAcceptedFriends(initialAvailability, acceptedFriendIdSet),
  );

  useEffect(() => {
    setAvailability(
      filterToAcceptedFriends(initialAvailability, acceptedFriendIdSet),
    );
  }, [acceptedFriendIdSet, initialAvailability]);

  useEffect(() => {
    if (channelRef.current) {
      void supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    if (!currentUserId || acceptedFriendIdSet.size === 0) {
      return;
    }

    const channel = supabase
      .channel(`realtime-friend-availability:${currentUserId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "availabilities",
        },
        (payload: RealtimePostgresChangesPayload<AvailabilitySlot>) => {
          handleAvailabilityChange(
            payload,
            acceptedFriendIdSet,
            setAvailability,
          );
        },
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        void supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [acceptedFriendIdSet, currentUserId, supabase]);

  return {
    availability,
    setAvailability,
  };
}
