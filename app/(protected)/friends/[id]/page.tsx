import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import {
  getFriendDetail,
  getMyAvailability,
} from "@/lib/availability";
import { createClient } from "@/lib/supabase/server";
import { FriendScheduleGrid } from "@/components/availability/FriendScheduleGrid";

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
        width={72}
        height={72}
        className="h-18 w-18 rounded-full object-cover"
        unoptimized
      />
    );
  }

  return (
    <div className="flex h-18 w-18 items-center justify-center rounded-full bg-neutral-200 text-xl font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
      {username.charAt(0).toUpperCase()}
    </div>
  );
}

export default async function FriendDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [ownSlots, friendDetail] = await Promise.all([
    getMyAvailability(supabase, user.id),
    getFriendDetail(supabase, user.id, id),
  ]);

  if (!friendDetail) {
    return (
      <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
        <section className="rounded-4xl border border-black/10 bg-white/85 p-6 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.45)] backdrop-blur sm:p-8 dark:border-white/10 dark:bg-neutral-950/80">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700 dark:text-emerald-300">
            Friend Schedule
          </p>
          <h1 className="mt-3 font-serif text-4xl text-neutral-950 sm:text-5xl dark:text-neutral-50">
            This schedule is not available.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-600 dark:text-neutral-300">
            The person may not be in your accepted friends list, or they have not
            shared anything you can view right now.
          </p>
          <div className="mt-8">
            <Link
              href="/friends"
              className="inline-flex h-12 items-center justify-center rounded-full border border-black/10 px-6 text-sm font-medium text-neutral-700 transition hover:border-neutral-400 hover:bg-white/70 dark:border-white/10 dark:text-neutral-200 dark:hover:bg-white/5"
            >
              Back to friends
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const displayName =
    friendDetail.profile.display_name || friendDetail.profile.username;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <div className="space-y-8">
        <header className="rounded-4xl border border-black/10 bg-white/85 p-6 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.45)] backdrop-blur sm:p-8 dark:border-white/10 dark:bg-neutral-950/80">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <Avatar
              displayName={displayName}
              username={friendDetail.profile.username}
              avatarUrl={friendDetail.profile.avatar_url}
            />

            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700 dark:text-emerald-300">
                Friend Schedule
              </p>
              <h1 className="mt-3 truncate font-serif text-4xl leading-none text-neutral-950 sm:text-5xl dark:text-neutral-50">
                {displayName}
              </h1>
              <p className="mt-3 text-base text-neutral-500 dark:text-neutral-400">
                @{friendDetail.profile.username}
              </p>
              <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-600 dark:text-neutral-300">
                See how your weekly rhythm lines up with this friend and use the
                overlap cues to make planning easier.
              </p>
            </div>
          </div>
        </header>

        <FriendScheduleGrid
          ownSlots={ownSlots}
          friendSlots={friendDetail.slots}
        />
      </div>
    </main>
  );
}
