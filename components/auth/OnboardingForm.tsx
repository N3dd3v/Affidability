"use client";

import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEventHandler } from "react";

import {
  getErrorMessage,
  isUsernameTakenError,
  MISSING_SUPABASE_ENV_MESSAGE,
  normalizeUsername,
  validateUsername,
} from "@/lib/auth";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";

type OnboardingFormProps = {
  userId: string;
  initialDisplayName: string;
};

export function OnboardingForm({
  userId,
  initialDisplayName,
}: OnboardingFormProps) {
  const supabaseEnabled = hasSupabaseEnv();
  const supabase = useMemo(
    () => (supabaseEnabled ? createClient() : null),
    [supabaseEnabled],
  );
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(
    supabaseEnabled ? null : MISSING_SUPABASE_ENV_MESSAGE,
  );

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    if (!supabase) {
      setMessage(MISSING_SUPABASE_ENV_MESSAGE);
      return;
    }

    setSubmitting(true);
    setMessage(null);

    const normalizedUsername = normalizeUsername(username);
    const usernameError = validateUsername(normalizedUsername);

    if (usernameError) {
      setMessage(usernameError);
      setSubmitting(false);
      return;
    }

    const { error } = await supabase.from("profiles").insert({
      id: userId,
      username: normalizedUsername,
      display_name: initialDisplayName || normalizedUsername,
    });

    if (error) {
      setMessage(
        isUsernameTakenError(error)
          ? "Username taken"
          : getErrorMessage(error, "Unable to finish onboarding."),
      );
      setSubmitting(false);
      return;
    }

    router.replace("/friends");
    router.refresh();
  };

  return (
    <main className="mx-auto flex min-h-[calc(100vh-10rem)] w-full max-w-4xl items-center px-4 py-10 sm:px-6">
      <section className="w-full rounded-4xl border border-black/10 bg-white/88 p-5 shadow-[0_40px_120px_-60px_rgba(15,23,42,0.8)] backdrop-blur sm:p-8 dark:border-white/10 dark:bg-neutral-950/82">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700 dark:text-emerald-300">
          Onboarding
        </p>
        <h1 className="mt-4 font-serif text-4xl leading-none tracking-tight text-neutral-950 sm:text-5xl dark:text-neutral-50">
          Claim your username.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-neutral-600 dark:text-neutral-300">
          Your account exists, but your profile row is missing. Pick a username to
          restore your app access.
        </p>

        <form className="mt-8 max-w-xl space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label
              htmlFor="onboarding-username"
              className="text-sm font-medium text-neutral-800 dark:text-neutral-200"
            >
              @username
            </label>
            <input
              id="onboarding-username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="w-full rounded-2xl border border-black/10 bg-neutral-50 px-4 py-3 text-sm outline-none transition focus:border-neutral-400 focus:bg-white dark:border-white/10 dark:bg-white/3 dark:focus:border-white/20 dark:focus:bg-white/5"
            />
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Use 3-20 lowercase letters, numbers, or underscores.
            </p>
          </div>

          {message ? (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
              {message}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-neutral-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-wait disabled:opacity-70 sm:w-auto dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-white"
          >
            {submitting ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : null}
            Save username
          </button>
        </form>
      </section>
    </main>
  );
}
