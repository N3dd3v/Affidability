"use client";

import Image from "next/image";
import { LoaderCircle, Search } from "lucide-react";

import { RelationshipButton } from "@/components/friends/RelationshipButton";
import { type Profile, type RelationshipState } from "@/lib/friends";

type UserSearchProps = {
  query: string;
  onQueryChange: (value: string) => void;
  results: Profile[];
  searching: boolean;
  relationshipFor: (profileId: string) => RelationshipState;
  busyFor: (profileId: string) => boolean;
  onAdd: (profileId: string) => void;
  onAccept: (friendshipId: string) => void;
  onDecline: (friendshipId: string) => void;
};

function LoadingSpinner() {
  return (
    <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin text-neutral-500" />
  );
}

function Avatar({ profile }: { profile: Profile }) {
  if (profile.avatar_url) {
    return (
      <Image
        src={profile.avatar_url}
        alt={`${profile.username} avatar`}
        width={40}
        height={40}
        className="h-10 w-10 rounded-full object-cover"
        unoptimized
      />
    );
  }

  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-200 text-sm font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
      {profile.username.charAt(0).toUpperCase()}
    </div>
  );
}

function SearchHint() {
  return (
    <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 px-4 py-5 text-sm text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900/60 dark:text-neutral-400">
      Search by username to send a friend request.
    </div>
  );
}

function SearchingState() {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white px-4 py-5 dark:border-neutral-800 dark:bg-neutral-950">
      <div className="flex items-center gap-3 text-sm text-neutral-500 dark:text-neutral-400">
        <LoadingSpinner />
        <span>Searching users…</span>
      </div>
    </div>
  );
}

function NoResults({ query }: { query: string }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white px-4 py-5 text-sm text-neutral-500 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400">
      No users found for &apos;{query}&apos;
    </div>
  );
}

export function UserSearch({
  query,
  onQueryChange,
  results,
  searching,
  relationshipFor,
  busyFor,
  onAdd,
  onAccept,
  onDecline,
}: UserSearchProps) {
  const trimmedQuery = query.trim();

  return (
    <section className="space-y-4">
      <label className="block">
        <span className="sr-only">Search by username</span>
        <div className="flex items-center gap-3 rounded-full border border-neutral-200 bg-white px-4 py-3 shadow-sm shadow-neutral-950/5 transition-colors focus-within:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-950 dark:focus-within:border-neutral-700">
          <Search className="h-4 w-4 text-neutral-400" />
          <input
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search by @username"
            className="w-full bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-400 dark:text-neutral-100 dark:placeholder:text-neutral-500"
          />
        </div>
      </label>

      {!trimmedQuery ? <SearchHint /> : null}
      {trimmedQuery && searching ? <SearchingState /> : null}
      {trimmedQuery && !searching && results.length === 0 ? (
        <NoResults query={trimmedQuery} />
      ) : null}

      {trimmedQuery && !searching && results.length > 0 ? (
        <div className="space-y-3">
          {results.map((profile) => {
            const relationship = relationshipFor(profile.id);

            return (
              <article
                key={profile.id}
                className="flex items-center justify-between gap-4 rounded-2xl border border-neutral-200 bg-white px-4 py-3 shadow-sm shadow-neutral-950/5 dark:border-neutral-800 dark:bg-neutral-950"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar profile={profile} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {profile.display_name || profile.username}
                    </p>
                    <p className="truncate text-sm text-neutral-500 dark:text-neutral-400">
                      @{profile.username}
                    </p>
                  </div>
                </div>

                <div className="shrink-0">
                  <RelationshipButton
                    state={relationship}
                    busy={busyFor(profile.id)}
                    onAdd={() => onAdd(profile.id)}
                    onAccept={onAccept}
                    onDecline={onDecline}
                  />
                </div>
              </article>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
