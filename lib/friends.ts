import { type SupabaseClient } from "@supabase/supabase-js";

export type Profile = {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
};

export type FriendshipStatus = "pending" | "accepted";

export type Friendship = {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: FriendshipStatus;
  created_at: string;
};

export type IncomingRequest = Friendship & {
  sender: Profile;
};

export type RelationshipState =
  | { type: "none" }
  | { type: "outgoing_pending"; friendshipId: string }
  | { type: "incoming_pending"; friendshipId: string }
  | { type: "friends"; friendshipId: string };

type SupabaseErrorLike = {
  message: string;
};

type QueryResult<T> = {
  data: T | null;
  error: SupabaseErrorLike | null;
};

type QueryBuilder<T> = PromiseLike<QueryResult<T>>;
type SupabaseClientLike = Pick<SupabaseClient, "from">;

type RawIncomingRequest = Friendship & {
  sender: Profile | Profile[] | null;
};

const PROFILE_COLUMNS = "id, username, display_name, avatar_url";
const FRIENDSHIP_COLUMNS = "id, sender_id, receiver_id, status, created_at";
const NONE_RELATIONSHIP: RelationshipState = { type: "none" };

async function execute<T>(query: QueryBuilder<T>): Promise<T> {
  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data as T;
}

function normalizeSenderProfile(sender: RawIncomingRequest["sender"]): Profile {
  if (Array.isArray(sender)) {
    const [firstSender] = sender;

    if (!firstSender) {
      throw new Error("Incoming request is missing sender profile data.");
    }

    return firstSender;
  }

  if (!sender) {
    throw new Error("Incoming request is missing sender profile data.");
  }

  return sender;
}

export async function searchProfiles(
  supabase: SupabaseClientLike,
  currentUserId: string,
  query: string,
  limit = 10,
): Promise<Profile[]> {
  const normalizedQuery = query.trim().replace(/^@+/, "");

  if (!normalizedQuery) {
    return [];
  }

  return execute<Profile[]>(
    supabase
      .from("profiles")
      .select(PROFILE_COLUMNS)
      .neq("id", currentUserId)
      .ilike("username", `%${normalizedQuery}%`)
      .order("username", { ascending: true })
      .limit(limit) as QueryBuilder<Profile[]>,
  );
}

export async function getMyFriendships(
  supabase: SupabaseClientLike,
  currentUserId: string,
): Promise<Friendship[]> {
  return execute<Friendship[]>(
    supabase
      .from("friendships")
      .select(FRIENDSHIP_COLUMNS)
      .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
      .order("created_at", { ascending: false }) as QueryBuilder<Friendship[]>,
  );
}

export async function getIncomingRequests(
  supabase: SupabaseClientLike,
  currentUserId: string,
): Promise<IncomingRequest[]> {
  const rows = await execute<RawIncomingRequest[]>(
    supabase
      .from("friendships")
      .select(
        `${FRIENDSHIP_COLUMNS}, sender:profiles!friendships_sender_id_fkey(${PROFILE_COLUMNS})`,
      )
      .eq("receiver_id", currentUserId)
      .eq("status", "pending")
      .order("created_at", { ascending: false }) as QueryBuilder<RawIncomingRequest[]>,
  );

  return rows.map((row) => ({
    id: row.id,
    sender_id: row.sender_id,
    receiver_id: row.receiver_id,
    status: row.status,
    created_at: row.created_at,
    sender: normalizeSenderProfile(row.sender),
  }));
}

export async function sendFriendRequest(
  supabase: SupabaseClientLike,
  senderId: string,
  receiverId: string,
): Promise<Friendship> {
  return execute<Friendship>(
    supabase
      .from("friendships")
      .insert({
        sender_id: senderId,
        receiver_id: receiverId,
        status: "pending",
      })
      .select(FRIENDSHIP_COLUMNS)
      .single() as QueryBuilder<Friendship>,
  );
}

export async function acceptFriendRequest(
  supabase: SupabaseClientLike,
  friendshipId: string,
  currentUserId: string,
): Promise<Friendship> {
  return execute<Friendship>(
    supabase
      .from("friendships")
      .update({ status: "accepted" })
      .eq("id", friendshipId)
      .eq("receiver_id", currentUserId)
      .select(FRIENDSHIP_COLUMNS)
      .single() as QueryBuilder<Friendship>,
  );
}

export async function declineFriendRequest(
  supabase: SupabaseClientLike,
  friendshipId: string,
  currentUserId: string,
): Promise<void> {
  await execute<null>(
    supabase
      .from("friendships")
      .delete()
      .eq("id", friendshipId)
      .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`) as QueryBuilder<null>,
  );
}

export function buildRelationshipMap(
  friendships: Friendship[],
  currentUserId: string,
): Map<string, RelationshipState> {
  const relationshipMap = new Map<string, RelationshipState>();

  for (const friendship of friendships) {
    const isSender = friendship.sender_id === currentUserId;
    const isReceiver = friendship.receiver_id === currentUserId;

    if (!isSender && !isReceiver) {
      continue;
    }

    const otherUserId = isSender ? friendship.receiver_id : friendship.sender_id;

    if (friendship.status === "accepted") {
      relationshipMap.set(otherUserId, {
        type: "friends",
        friendshipId: friendship.id,
      });
      continue;
    }

    relationshipMap.set(otherUserId, {
      type: isSender ? "outgoing_pending" : "incoming_pending",
      friendshipId: friendship.id,
    });
  }

  return relationshipMap;
}

export function getRelationship(
  relationshipMap: Map<string, RelationshipState>,
  otherUserId: string,
): RelationshipState {
  return relationshipMap.get(otherUserId) ?? NONE_RELATIONSHIP;
}
