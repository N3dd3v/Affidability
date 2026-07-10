"use client";

import { useCallback } from "react";

import { IncomingRequests } from "@/components/friends/IncomingRequests";
import { UserSearch } from "@/components/friends/UserSearch";
import { ToastStack } from "@/components/ui/ToastStack";
import { useFriends } from "@/hooks/useFriends";

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

export default function FriendsPage() {
  const friends = useFriends();

  const handleQueryChange = useCallback(
    (value: string) => {
      friends.setQuery(value);
    },
    [friends],
  );

  const busyFor = useCallback(
    (targetId: string) => Boolean(friends.pendingByTarget[targetId]),
    [friends.pendingByTarget],
  );

  if (friends.initializing) {
    return <CenteredSpinner />;
  }

  if (!friends.currentUserId) {
    return null;
  }

  return (
    <>
      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <div className="space-y-8">
          <header className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700 dark:text-emerald-300">
              Friends
            </p>
            <h1 className="mt-3 font-serif text-5xl leading-none tracking-tight text-neutral-900 dark:text-neutral-100">
              Friends
            </h1>
            <p className="mt-4 text-base leading-7 text-neutral-600 dark:text-neutral-300">
              Discover people, keep requests tidy, and grow the social graph that
              makes availability useful.
            </p>
          </header>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-[minmax(0,1.7fr)_minmax(18rem,1fr)]">
            <div>
              <UserSearch
                query={friends.query}
                onQueryChange={handleQueryChange}
                results={friends.results}
                searching={friends.searching}
                relationshipFor={friends.relationshipFor}
                busyFor={busyFor}
                onAdd={(profileId) => {
                  void friends.addFriend(profileId);
                }}
                onAccept={(friendshipId) => {
                  void friends.accept(friendshipId);
                }}
                onDecline={(friendshipId) => {
                  void friends.decline(friendshipId);
                }}
              />
            </div>

            <div>
              <IncomingRequests
                requests={friends.incomingRequests}
                busyFor={busyFor}
                onAccept={(friendshipId) => {
                  void friends.accept(friendshipId);
                }}
                onDecline={(friendshipId) => {
                  void friends.decline(friendshipId);
                }}
              />
            </div>
          </div>
        </div>
      </main>

      <ToastStack toasts={friends.toasts} onDismiss={friends.dismissToast} />
    </>
  );
}
