function stripRestPath(url: string): string {
  return url.replace(/\/rest\/v1\/?$/, "");
}

export function getSupabaseUrl(): string {
  const rawUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co";

  return stripRestPath(rawUrl);
}

export function getSupabaseAnonKey(): string {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "public-anon-key-placeholder"
  );
}

export function hasSupabaseEnv(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
