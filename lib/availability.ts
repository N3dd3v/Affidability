import { type SupabaseClient } from "@supabase/supabase-js";

import { type Profile } from "@/lib/friends";

export type AvailabilityStatus = "free" | "busy";

export type AvailabilitySlot = {
  id: string;
  user_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  status: AvailabilityStatus;
};

export type FriendAvailability = {
  profile: Profile;
  slots: AvailabilitySlot[];
};

type SupabaseErrorLike = {
  message: string;
};

type QueryResult<T> = {
  data: T | null;
  error: SupabaseErrorLike | null;
};

type QueryBuilder<T> = PromiseLike<QueryResult<T>>;
type SupabaseClientLike = Pick<SupabaseClient, "from">;

const AVAILABILITY_COLUMNS =
  "id, user_id, day_of_week, start_time, end_time, status";
const PROFILE_COLUMNS = "id, username, display_name, avatar_url";

export function normalizeTime(time: string): string {
  return time.slice(0, 5);
}

export function normalizeSlot(slot: AvailabilitySlot): AvailabilitySlot {
  return {
    ...slot,
    start_time: normalizeTime(slot.start_time),
    end_time: normalizeTime(slot.end_time),
  };
}

async function execute<T>(query: QueryBuilder<T>): Promise<T> {
  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data as T;
}

export async function getMyAvailability(
  supabase: SupabaseClientLike,
  currentUserId: string,
): Promise<AvailabilitySlot[]> {
  return (await execute<AvailabilitySlot[]>(
    supabase
      .from("availabilities")
      .select(AVAILABILITY_COLUMNS)
      .eq("user_id", currentUserId)
      .order("day_of_week", { ascending: true })
      .order("start_time", { ascending: true }) as QueryBuilder<AvailabilitySlot[]>,
  )).map(normalizeSlot);
}

export async function createAvailabilitySlot(
  supabase: SupabaseClientLike,
  currentUserId: string,
  slot: Omit<AvailabilitySlot, "id" | "user_id">,
): Promise<AvailabilitySlot> {
  return normalizeSlot(
    await execute<AvailabilitySlot>(
    supabase
      .from("availabilities")
      .insert({
        user_id: currentUserId,
        day_of_week: slot.day_of_week,
        start_time: slot.start_time,
        end_time: slot.end_time,
        status: slot.status,
      })
      .select(AVAILABILITY_COLUMNS)
      .single() as QueryBuilder<AvailabilitySlot>,
    ),
  );
}

export async function deleteAvailabilitySlot(
  supabase: SupabaseClientLike,
  slotId: string,
  currentUserId: string,
): Promise<void> {
  await execute<null>(
    supabase
      .from("availabilities")
      .delete()
      .eq("id", slotId)
      .eq("user_id", currentUserId) as QueryBuilder<null>,
  );
}

export async function getAcceptedFriendAvailability(
  supabase: SupabaseClientLike,
  currentUserId: string,
): Promise<FriendAvailability[]> {
  const friendships = await execute<
    Array<{ sender_id: string; receiver_id: string; status: "accepted" | "pending" }>
  >(
    supabase
      .from("friendships")
      .select("sender_id, receiver_id, status")
      .eq("status", "accepted")
      .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`) as QueryBuilder<
      Array<{ sender_id: string; receiver_id: string; status: "accepted" | "pending" }>
    >,
  );

  const friendIds = friendships.map((friendship) =>
    friendship.sender_id === currentUserId
      ? friendship.receiver_id
      : friendship.sender_id,
  );

  if (friendIds.length === 0) {
    return [];
  }

  const [profiles, slots] = await Promise.all([
    execute<Profile[]>(
      supabase
        .from("profiles")
        .select(PROFILE_COLUMNS)
        .in("id", friendIds) as QueryBuilder<Profile[]>,
    ),
    execute<AvailabilitySlot[]>(
      supabase
        .from("availabilities")
        .select(AVAILABILITY_COLUMNS)
        .in("user_id", friendIds)
        .order("day_of_week", { ascending: true })
        .order("start_time", { ascending: true }) as QueryBuilder<AvailabilitySlot[]>,
    ).then((result) => result.map(normalizeSlot)),
  ]);

  return profiles.map((profile) => ({
    profile,
    slots: slots.filter((slot) => slot.user_id === profile.id),
  }));
}

export async function getFriendDetail(
  supabase: SupabaseClientLike,
  currentUserId: string,
  friendId: string,
): Promise<FriendAvailability | null> {
  const friendship = await execute<{ id: string } | null>(
    supabase
      .from("friendships")
      .select("id")
      .eq("status", "accepted")
      .or(
        `and(sender_id.eq.${currentUserId},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${currentUserId})`,
      )
      .maybeSingle() as QueryBuilder<{ id: string } | null>,
  );

  if (!friendship) {
    return null;
  }

  const [profile, slots] = await Promise.all([
    execute<Profile | null>(
      supabase
        .from("profiles")
        .select(PROFILE_COLUMNS)
        .eq("id", friendId)
        .maybeSingle() as QueryBuilder<Profile | null>,
    ),
    execute<AvailabilitySlot[]>(
      supabase
        .from("availabilities")
        .select(AVAILABILITY_COLUMNS)
        .eq("user_id", friendId)
        .order("day_of_week", { ascending: true })
        .order("start_time", { ascending: true }) as QueryBuilder<AvailabilitySlot[]>,
    ).then((result) => result.map(normalizeSlot)),
  ]);

  if (!profile) {
    return null;
  }

  return {
    profile,
    slots,
  };
}
