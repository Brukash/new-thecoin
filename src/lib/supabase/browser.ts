"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser client used only for staff sign-in and sign-out. Content is written
 * through server actions so that validation, audit logging and revalidation
 * cannot be bypassed.
 */
export function createBrowserSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  return createBrowserClient(url, key);
}
