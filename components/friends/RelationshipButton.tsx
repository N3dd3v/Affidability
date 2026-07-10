"use client";

import { Check, LoaderCircle } from "lucide-react";

import { type RelationshipState } from "@/lib/friends";

type RelationshipButtonProps = {
  state: RelationshipState;
  busy: boolean;
  onAdd: () => void;
  onAccept: (friendshipId: string) => void;
  onDecline: (friendshipId: string) => void;
};

function Spinner() {
  return (
    <LoaderCircle aria-hidden="true" className="h-3.5 w-3.5 animate-spin" />
  );
}

function baseButtonClasses(disabled: boolean) {
  return [
    "inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
    disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer",
  ].join(" ");
}

function assertNever(value: never): never {
  throw new Error(`Unhandled relationship state: ${JSON.stringify(value)}`);
}

export function RelationshipButton({
  state,
  busy,
  onAdd,
  onAccept,
  onDecline,
}: RelationshipButtonProps) {
  switch (state.type) {
    case "none":
      return (
        <button
          type="button"
          onClick={onAdd}
          disabled={busy}
          className={`${baseButtonClasses(busy)} w-full bg-neutral-900 text-white hover:bg-neutral-700 sm:w-auto disabled:hover:bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300`}
        >
          {busy ? <Spinner /> : null}
          <span>Add friend</span>
        </button>
      );

    case "outgoing_pending":
      return (
        <button
          type="button"
          disabled
          className={`${baseButtonClasses(true)} w-full border border-neutral-300 bg-white text-neutral-600 sm:w-auto dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300`}
        >
          {busy ? <Spinner /> : null}
          <span>Requested</span>
        </button>
      );

    case "incoming_pending":
      return (
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          <button
            type="button"
            onClick={() => onAccept(state.friendshipId)}
            disabled={busy}
            className={`${baseButtonClasses(busy)} flex-1 bg-neutral-900 text-white hover:bg-neutral-700 sm:flex-none disabled:hover:bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300`}
          >
            {busy ? <Spinner /> : null}
            <span>Accept</span>
          </button>
          <button
            type="button"
            onClick={() => onDecline(state.friendshipId)}
            disabled={busy}
            className={`${baseButtonClasses(busy)} flex-1 border border-neutral-300 bg-transparent text-neutral-700 hover:bg-neutral-100 sm:flex-none disabled:hover:bg-transparent dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800`}
          >
            {busy ? <Spinner /> : null}
            <span>Decline</span>
          </button>
        </div>
      );

    case "friends":
      return (
        <span className="inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 sm:w-auto dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
          <Check className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Friends</span>
        </span>
      );

    default:
      return assertNever(state);
  }
}
