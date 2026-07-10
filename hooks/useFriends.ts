"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  acceptFriendRequest,
  buildRelationshipMap,
  declineFriendRequest,
  getIncomingRequests,
  getMyFriendships,
  getRelationship,
  searchProfiles,
  sendFriendRequest,
  type Friendship,
  type IncomingRequest,
  type Profile,
  type RelationshipState,
} from "@/lib/friends";
import { createClient } from "@/lib/supabase/client";

export type Toast = {
  id: string;
  kind: "success" | "error";
  message: string;
};

export type UseFriendsResult = {
  currentUserId: string | null;
  initializing: boolean;
  friendships: Friendship[];
  incomingRequests: IncomingRequest[];
  query: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
  results: Profile[];
  searching: boolean;
  pendingByTarget: Record<string, boolean>;
  relationshipFor: (profileId: string) => RelationshipState;
  addFriend: (profileId: string) => Promise<void>;
  accept: (friendshipId: string) => Promise<void>;
  decline: (friendshipId: string) => Promise<void>;
  toasts: Toast[];
  dismissToast: (id: string) => void;
};

const SEARCH_DEBOUNCE_MS = 300;
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

export function useFriends(): UseFriendsResult {
  const supabase = useMemo(() => createClient(), []);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [friendships, setFriendships] = useState<Friendship[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<IncomingRequest[]>([]);
  const [query, setQueryValue] = useState("");
  const [results, setResults] = useState<Profile[]>([]);
  const [searching, setSearching] = useState(false);
  const [pendingByTarget, setPendingByTarget] = useState<Record<string, boolean>>(
    {},
  );
  const [toasts, setToasts] = useState<Toast[]>([]);
  const searchRequestIdRef = useRef(0);
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
    (kind: Toast["kind"], message: string) => {
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

  const setQuery = useCallback<React.Dispatch<React.SetStateAction<string>>>(
    (value) => {
      setQueryValue((currentValue) => {
        const nextValue = typeof value === "function" ? value(currentValue) : value;

        if (!nextValue.trim()) {
          searchRequestIdRef.current += 1;
          setResults([]);
          setSearching(false);
        }

        return nextValue;
      });
    },
    [],
  );

  const setPending = useCallback((targetId: string, pending: boolean) => {
    setPendingByTarget((currentPending) => {
      if (pending) {
        return { ...currentPending, [targetId]: true };
      }

      const nextPending = { ...currentPending };
      delete nextPending[targetId];
      return nextPending;
    });
  }, []);

  const refreshData = useCallback(
    async (userId: string) => {
      const [nextFriendships, nextIncomingRequests] = await Promise.all([
        getMyFriendships(supabase, userId),
        getIncomingRequests(supabase, userId),
      ]);

      setFriendships(nextFriendships);
      setIncomingRequests(nextIncomingRequests);
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
        setFriendships([]);
        setIncomingRequests([]);
        pushToast("error", getErrorMessage(error));
        setInitializing(false);
        return;
      }

      const userId = data.user?.id ?? null;

      setCurrentUserId(userId);

      if (!userId) {
        setFriendships([]);
        setIncomingRequests([]);
        setInitializing(false);
        return;
      }

      try {
        const [nextFriendships, nextIncomingRequests] = await Promise.all([
          getMyFriendships(supabase, userId),
          getIncomingRequests(supabase, userId),
        ]);

        if (cancelled) {
          return;
        }

        setFriendships(nextFriendships);
        setIncomingRequests(nextIncomingRequests);
      } catch (error) {
        if (cancelled) {
          return;
        }

        setFriendships([]);
        setIncomingRequests([]);
        pushToast("error", getErrorMessage(error));
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
  }, [pushToast, supabase]);

  useEffect(() => {
    const timeoutMap = toastTimeoutsRef.current;

    return () => {
      for (const timeoutId of timeoutMap.values()) {
        window.clearTimeout(timeoutId);
      }

      timeoutMap.clear();
    };
  }, []);

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (!currentUserId || !trimmedQuery) {
      return;
    }

    const requestId = searchRequestIdRef.current + 1;
    searchRequestIdRef.current = requestId;

    const timeoutId = window.setTimeout(() => {
      setSearching(true);

      void (async () => {
        try {
          const nextResults = await searchProfiles(
            supabase,
            currentUserId,
            trimmedQuery,
          );

          if (searchRequestIdRef.current !== requestId) {
            return;
          }

          setResults(nextResults);
        } catch (error) {
          if (searchRequestIdRef.current !== requestId) {
            return;
          }

          setResults([]);
          pushToast("error", getErrorMessage(error));
        } finally {
          if (searchRequestIdRef.current === requestId) {
            setSearching(false);
          }
        }
      })();
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [currentUserId, pushToast, query, supabase]);

  const relationshipMap = useMemo(() => {
    if (!currentUserId) {
      return new Map<string, RelationshipState>();
    }

    return buildRelationshipMap(friendships, currentUserId);
  }, [currentUserId, friendships]);

  const relationshipFor = useCallback(
    (profileId: string) => getRelationship(relationshipMap, profileId),
    [relationshipMap],
  );

  const addFriend = useCallback(
    async (profileId: string) => {
      if (!currentUserId) {
        pushToast("error", "You must be signed in to send a friend request.");
        return;
      }

      setPending(profileId, true);

      try {
        await sendFriendRequest(supabase, currentUserId, profileId);
        await refreshData(currentUserId);
        pushToast("success", "Friend request sent.");
      } catch (error) {
        pushToast("error", getErrorMessage(error));
      } finally {
        setPending(profileId, false);
      }
    },
    [currentUserId, pushToast, refreshData, setPending, supabase],
  );

  const accept = useCallback(
    async (friendshipId: string) => {
      if (!currentUserId) {
        pushToast("error", "You must be signed in to accept a friend request.");
        return;
      }

      setPending(friendshipId, true);

      try {
        await acceptFriendRequest(supabase, friendshipId, currentUserId);
        await refreshData(currentUserId);
        pushToast("success", "Friend request accepted.");
      } catch (error) {
        pushToast("error", getErrorMessage(error));
      } finally {
        setPending(friendshipId, false);
      }
    },
    [currentUserId, pushToast, refreshData, setPending, supabase],
  );

  const decline = useCallback(
    async (friendshipId: string) => {
      if (!currentUserId) {
        pushToast("error", "You must be signed in to decline a friend request.");
        return;
      }

      setPending(friendshipId, true);

      try {
        await declineFriendRequest(supabase, friendshipId, currentUserId);
        await refreshData(currentUserId);
        pushToast("success", "Friend request declined.");
      } catch (error) {
        pushToast("error", getErrorMessage(error));
      } finally {
        setPending(friendshipId, false);
      }
    },
    [currentUserId, pushToast, refreshData, setPending, supabase],
  );

  return {
    currentUserId,
    initializing,
    friendships,
    incomingRequests,
    query,
    setQuery,
    results,
    searching,
    pendingByTarget,
    relationshipFor,
    addFriend,
    accept,
    decline,
    toasts,
    dismissToast,
  };
}
