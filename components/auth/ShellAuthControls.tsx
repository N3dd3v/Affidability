"use client";

import Link from "next/link";
import { LoaderCircle, LogOut } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

type AuthUser = {
  email?: string;
};

export function ShellAuthControls() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let active = true;

    void supabase.auth.getUser().then(({ data }) => {
      if (!active) {
        return;
      }

      setUser(data.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
      router.refresh();
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [router, supabase.auth]);

  const handleLogout = useCallback(async () => {
    setLoggingOut(true);

    await supabase.auth.signOut();
    setUser(null);
    router.replace("/");
    router.refresh();

    setLoggingOut(false);
  }, [router, supabase.auth]);

  if (loading) {
    return (
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 text-neutral-500 dark:border-white/10 dark:text-neutral-300">
        <LoaderCircle className="h-4 w-4 animate-spin" />
      </div>
    );
  }

  if (user) {
    return (
      <button
        type="button"
        onClick={() => {
          void handleLogout();
        }}
        disabled={loggingOut}
        className="inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-black/5 disabled:cursor-wait disabled:opacity-70 dark:border-white/10 dark:text-neutral-200 dark:hover:bg-white/5"
      >
        {loggingOut ? (
          <LoaderCircle className="h-4 w-4 animate-spin" />
        ) : (
          <LogOut className="h-4 w-4" />
        )}
        Logout
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/login"
        className={`rounded-full px-3 py-2 text-sm transition hover:bg-black/5 dark:hover:bg-white/5 ${
          pathname === "/login" ? "text-neutral-950 dark:text-neutral-50" : ""
        }`}
      >
        Log in
      </Link>
      <Link
        href="/signup"
        className="rounded-full bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-white"
      >
        Sign up
      </Link>
    </div>
  );
}
