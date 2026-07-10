"use client";

import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type FormEventHandler } from "react";

import { AuthCard } from "@/components/auth/AuthCard";
import { getErrorMessage, MISSING_SUPABASE_ENV_MESSAGE } from "@/lib/auth";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const supabaseEnabled = hasSupabaseEnv();
  const supabase = useMemo(
    () => (supabaseEnabled ? createClient() : null),
    [supabaseEnabled],
  );
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(
    supabaseEnabled ? null : MISSING_SUPABASE_ENV_MESSAGE,
  );

  useEffect(() => {
    if (!supabase) {
      return;
    }

    // On first render, probe the current session. If a user is already present,
    // the algorithm short-circuits the page and redirects straight to `/friends`
    // instead of showing a login form that is no longer needed.
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
      setMessage(MISSING_SUPABASE_ENV_MESSAGE);
      return;
    }

    setSubmitting(true);
    setMessage(null);

    // Submit algorithm:
    // 1. stop the native form post,
    // 2. mark the UI busy and clear any old error,
    // 3. ask Supabase to authenticate with the current credentials,
    // 4. show a readable error if auth fails,
    // 5. otherwise redirect into the protected app area.
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setMessage(getErrorMessage(error, "Unable to log in."));
      setSubmitting(false);
      return;
    }

    router.replace("/friends");
    router.refresh();
  };

  return (
    <AuthCard
      eyebrow="Welcome back"
      title="Log in and pick the week back up."
      description="Use your email and password to continue managing friends and availability."
      alternateLabel="Need an account?"
      alternateHref="/signup"
      alternateText="Create one"
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label
            htmlFor="login-email"
            className="text-sm font-medium text-neutral-800 dark:text-neutral-200"
          >
            Email
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-2xl border border-black/10 bg-neutral-50 px-4 py-3 text-sm outline-none transition focus:border-neutral-400 focus:bg-white dark:border-white/10 dark:bg-white/3 dark:focus:border-white/20"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="login-password"
            className="text-sm font-medium text-neutral-800 dark:text-neutral-200"
          >
            Password
          </label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-2xl border border-black/10 bg-neutral-50 px-4 py-3 text-sm outline-none transition focus:border-neutral-400 focus:bg-white dark:border-white/10 dark:bg-white/3 dark:focus:border-white/20"
          />
        </div>

        {message ? (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
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
          Log in
        </button>
      </form>
    </AuthCard>
  );
}
