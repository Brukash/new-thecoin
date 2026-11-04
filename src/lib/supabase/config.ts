import "server-only";

/**
 * Supabase environment.
 *
 * The public URL and anon key are safe to expose and are used by the browser
 * client for sign-in. The service role key bypasses row level security and is
 * therefore only ever read on the server, inside `createServiceClient`.
 *
 * When these values are absent the site keeps serving the verified content
 * bundled in `content/`, and the console falls back to the local staff
 * password. That keeps local development and preview builds working before a
 * project has been provisioned; production must set all three values.
 */

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

export function hasServiceRole(): boolean {
  return Boolean(supabaseUrl && supabaseServiceKey);
}

export const CMS_BUCKET = "media";
