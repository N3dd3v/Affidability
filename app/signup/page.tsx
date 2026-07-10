"use client";

import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type FormEventHandler } from "react";

import { AuthCard } from "@/components/auth/AuthCard";
import {
  getErrorMessage,
  isUsernameTakenError,
  MISSING_SUPABASE_ENV_MESSAGE,
  normalizeUsername,
  validateUsername,
} from "@/lib/auth";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const supabaseEnabled = hasSupabaseEnv();
  const supabase = useMemo(
    () => (supabaseEnabled ? createClient() : null),
    [supabaseEnabled],
  );
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(
    supabaseEnabled ? null : MISSING_SUPABASE_ENV_MESSAGE,
  );
  const [messageKind, setMessageKind] = useState<"success" | "error">("error");

  useEffect(() => {
    if (!supabase) {
      return;
    }

    void supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        router.replace("/friends");
        router.refresh();
      }
    });
  }, [router, supabase]);

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    if (!supabase) {
      setMessageKind("error");
      setMessage(MISSING_SUPABASE_ENV_MESSAGE);
      return;
    }

    setSubmitting(true);
    setMessage(null);
    setMessageKind("error");

    const normalizedUsername = normalizeUsername(username);
    const usernameError = validateUsername(normalizedUsername);

    if (usernameError) {
      setMessage(usernameError);
      setSubmitting(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          username: normalizedUsername,
          display_name: displayName.trim(),
        },
      },
    });

    if (error) {
      setMessage(getErrorMessage(error, "Unable to create your account."));
      setSubmitting(false);
      return;
    }

    if (!data.user) {
      setMessage("Unable to create your account.");
      setSubmitting(false);
      return;
    }

    if (!data.session) {
      setMessageKind("success");
      setMessage("Check your email to confirm your account.");
      setSubmitting(false);
      return;
    }

    const { error: profileError } = await supabase.from("profiles").insert({
      id: data.user.id,
      username: normalizedUsername,
      display_name: displayName.trim() || normalizedUsername,
    });

    if (profileError) {
      await supabase.auth.signOut();
      setMessage(
        isUsernameTakenError(profileError)
          ? "Username taken"
          : getErrorMessage(profileError, "Unable to finish creating your profile."),
      );
      setSubmitting(false);
      return;
    }

    router.replace("/friends");
    router.refresh();
  };

  return (
    <AuthCard
      eyebrow="Create account"
      title="Set up your social planning home."
      description="Create your account, choose a clean @username, and step straight into the app."
      alternateLabel="Already have an account?"
      alternateHref="/login"
      alternateText="Log in"
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label
            htmlFor="signup-email"
            className="text-sm font-medium text-neutral-800 dark:text-neutral-200"
          >
            Email
          </label>
          <input
            id="signup-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-2xl border border-black/10 bg-neutral-50 px-4 py-3 text-sm outline-none transition focus:border-neutral-400 focus:bg-white dark:border-white/10 dark:bg-white/3 dark:focus:border-white/20 dark:focus:bg-white/5"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="signup-password"
            className="text-sm font-medium text-neutral-800 dark:text-neutral-200"
          >
            Password
          </label>
          <input
            id="signup-password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-2xl border border-black/10 bg-neutral-50 px-4 py-3 text-sm outline-none transition focus:border-neutral-400 focus:bg-white dark:border-white/10 dark:bg-white/3 dark:focus:border-white/20 dark:focus:bg-white/5"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="signup-username"
            className="text-sm font-medium text-neutral-800 dark:text-neutral-200"
          >
            @username
          </label>
          <input
            id="signup-username"
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

        <div className="space-y-2">
          <label
            htmlFor="signup-display-name"
            className="text-sm font-medium text-neutral-800 dark:text-neutral-200"
          >
            Display name
          </label>
          <input
            id="signup-display-name"
            type="text"
            autoComplete="nickname"
            required
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            className="w-full rounded-2xl border border-black/10 bg-neutral-50 px-4 py-3 text-sm outline-none transition focus:border-neutral-400 focus:bg-white dark:border-white/10 dark:bg-white/3 dark:focus:border-white/20 dark:focus:bg-white/5"
          />
        </div>

        {message ? (
          <p
            className={`rounded-2xl border px-4 py-3 text-sm ${
              messageKind === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200"
                : "border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200"
            }`}
          >
            {message}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-neutral-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-wait disabled:opacity-70 dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-white"
        >
          {submitting ? (
            <LoaderCircle className="h-4 w-4 animate-spin" />
          ) : null}
          Create account
        </button>
      </form>
    </AuthCard>
  );
}
