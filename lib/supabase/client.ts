import { createBrowserClient } from "@supabase/ssr";
import { type SupabaseClient } from "@supabase/supabase-js";

import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/config";

let browserClient: SupabaseClient | null = null;

export function createClient(): SupabaseClient {
  if (browserClient) {
    return browserClient;
  }

  const url = getSupabaseUrl();
  const anonKey = getSupabaseAnonKey();

  browserClient = createBrowserClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  return browserClient;
}
