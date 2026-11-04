import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import {
  isSupabaseConfigured,
  supabaseAnonKey,
  supabaseServiceKey,
  supabaseUrl,
} from "./config";

/**
 * Request-scoped client for reading the signed-in staff member.
 * Uses the anon key and the auth cookies, so row level security applies.
 */
export async function createSessionClient(): Promise<SupabaseClient | null> {
  if (!isSupabaseConfigured()) return null;

  const jar = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return jar.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            jar.set(name, value, options);
          }
        } catch {
          // Called from a Server Component render: cookies are read-only.
          // The middleware refreshes the session in that case.
        }
      },
    },
  });
}

/**
 * Privileged client. Never import this into a Client Component.
 * Returns null when the service role key is missing so callers can fall back.
 */
export function createServiceClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseServiceKey) return null;

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { "X-Client-Info": "cbn-coop-cms" } },
  });
}
