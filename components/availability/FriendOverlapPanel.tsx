"use client";

import Image from "next/image";
import Link from "next/link";
import { Users } from "lucide-react";

import { type FriendAvailabilityHighlight } from "@/hooks/useAvailability";

type FriendOverlapPanelProps = {
  items: FriendAvailabilityHighlight[];
};

function Avatar({
  displayName,
  username,
  avatarUrl,
}: {
  displayName: string;
  username: string;
  avatarUrl: string | null;
}) {
  if (avatarUrl) {
    return (
      <Image
        src={avatarUrl}
        alt={`${displayName} avatar`}
        width={44}
        height={44}
        className="h-11 w-11 rounded-full object-cover"
        unoptimized
      />
    );
  }

  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-200 text-sm font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
      {username.charAt(0).toUpperCase()}
    </div>
  );
}

export function FriendOverlapPanel({ items }: FriendOverlapPanelProps) {
  return (
    <section className="rounded-4xl border border-black/10 bg-white/85 p-6 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.45)] backdrop-blur dark:border-white/10 dark:bg-neutral-950/80">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700 dark:text-emerald-300">
            Friends
          </p>
          <h2 className="mt-2 font-serif text-2xl text-neutral-950 dark:text-neutral-50">
            Shared momentum
          </h2>
        </div>
        <span className="rounded-full bg-neutral-100 p-2 dark:bg-white/5">
          <Users className="h-4 w-4 text-neutral-700 dark:text-neutral-200" />
        </span>
      </div>

      {items.length === 0 ? (
        <p className="mt-5 text-sm text-neutral-500 dark:text-neutral-400">
          Add friends and share your week to see overlap highlights here.
        </p>
      ) : (
        <div className="mt-5 space-y-3">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/friends/${item.id}`}
              className="block rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <article className="rounded-3xl border border-black/10 bg-neutral-50/80 p-4 transition hover:border-neutral-400 hover:bg-white/90 dark:border-white/10 dark:bg-white/4 dark:hover:border-white/20 dark:hover:bg-white/6">
                <div className="flex items-center gap-3">
                  <Avatar
                    displayName={item.displayName}
                    username={item.username}
                    avatarUrl={item.avatarUrl}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {item.displayName}
                    </p>
                    <p className="truncate text-sm text-neutral-500 dark:text-neutral-400">
                      @{item.username}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3 text-sm">
                  <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-emerald-800 dark:text-emerald-200">
                    {item.slotCount} open windows
                  </span>
                  <span className="text-right text-neutral-500 dark:text-neutral-400">
                    {item.nextWindow}
                  </span>
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
