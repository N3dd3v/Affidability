"use client";

import Image from "next/image";

import { RelationshipButton } from "@/components/friends/RelationshipButton";
import { type IncomingRequest } from "@/lib/friends";

type IncomingRequestsProps = {
  requests: IncomingRequest[];
  busyFor: (friendshipId: string) => boolean;
  onAccept: (friendshipId: string) => void;
  onDecline: (friendshipId: string) => void;
};

function formatRelativeTime(value: string): string {
  const timestamp = new Date(value).getTime();

  if (Number.isNaN(timestamp)) {
    return "";
  }

  const diffMs = Date.now() - timestamp;
  const diffSeconds = Math.max(0, Math.floor(diffMs / 1000));

  if (diffSeconds < 60) {
    return "just now";
  }

  const minutes = Math.floor(diffSeconds / 60);

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);

  if (days < 7) {
    return `${days}d ago`;
  }

  const weeks = Math.floor(days / 7);

  if (weeks < 5) {
    return `${weeks}w ago`;
  }

  const months = Math.floor(days / 30);

  if (months < 12) {
    return `${months}mo ago`;
  }

  const years = Math.floor(days / 365);
  return `${years}y ago`;
}

function Avatar({
  username,
  avatarUrl,
}: {
  username: string;
  avatarUrl: string | null;
}) {
  if (avatarUrl) {
    return (
      <Image
        src={avatarUrl}
        alt={`${username} avatar`}
        width={40}
        height={40}
        className="h-10 w-10 rounded-full object-cover"
        unoptimized
      />
    );
  }

  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-200 text-sm font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
      {username.charAt(0).toUpperCase()}
    </div>
  );
}

export function IncomingRequests({
  requests,
  busyFor,
  onAccept,
  onDecline,
}: IncomingRequestsProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          Friend requests
        </h2>
        {requests.length > 0 ? (
          <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
            {requests.length}
          </span>
        ) : null}
      </div>

      {requests.length === 0 ? (
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          No pending requests.
        </p>
      ) : (
        <div className="space-y-3">
          {requests.map((request) => (
            <article
              key={request.id}
              className="flex items-center justify-between gap-4 rounded-2xl border border-neutral-200 bg-white px-4 py-3 shadow-sm shadow-neutral-950/5 dark:border-neutral-800 dark:bg-neutral-950"
            >
              <div className="flex min-w-0 items-center gap-3">
                <Avatar
                  username={request.sender.username}
                  avatarUrl={request.sender.avatar_url}
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {request.sender.display_name || request.sender.username}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
                    <span className="truncate">@{request.sender.username}</span>
                    <span aria-hidden="true">•</span>
                    <span>{formatRelativeTime(request.created_at)}</span>
                  </div>
                </div>
              </div>

              <div className="shrink-0">
                <RelationshipButton
                  state={{ type: "incoming_pending", friendshipId: request.id }}
                  busy={busyFor(request.id)}
                  onAdd={() => {}}
                  onAccept={onAccept}
                  onDecline={onDecline}
                />
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
