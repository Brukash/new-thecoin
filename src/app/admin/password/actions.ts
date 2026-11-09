"use server";

import { headers } from "next/headers";
import { getStaffUser } from "@/lib/cms/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSessionClient } from "@/lib/supabase/server";
import { site } from "@/content/site";
import { clientKeyFromHeaders, rateLimit } from "@/lib/security";
import { MIN_PASSWORD, type PasswordState } from "./rules";

/**
 * Password management for staff accounts.
 *
 * Three paths, all of them through Supabase Auth so that the password never
 * touches our own database:
 *   * requestPasswordReset — emails a single-use recovery link.
 *   * setPassword (reset)  — used on the page the recovery link lands on.
 *   * setPassword (change) — used by a signed-in member of staff, who must
 *                            confirm the current password first.
 */

function value(form: FormData, key: string): string {
  return String(form.get(key) ?? "");
}

/**
 * The public origin used to build the recovery link.
 *
 * Never derived from the request's Host header: a forged host would make the
 * emailed token point at someone else's domain. The canonical site URL is used
 * instead, with loopback allowed only in development.
 */
async function siteOrigin(): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/+$/, "");

  if (process.env.NODE_ENV !== "production") {
    const requestHeaders = await headers();
    const host = requestHeaders.get("host") ?? "";
    if (/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host)) return `http://${host}`;
  }

  return site.url.replace(/\/+$/, "");
}

export async function requestPasswordReset(
  _previous: PasswordState | null,
  form: FormData,
): Promise<PasswordState> {
  const email = value(form, "email").trim().toLowerCase();

  const requestHeaders = await headers();
  if (!rateLimit(`reset:${clientKeyFromHeaders(requestHeaders)}`, 5, 15 * 60_000)) {
    return { error: "Too many reset requests. Please wait a few minutes and try again." };
  }

  if (!email.includes("@")) {
    return { error: "Enter the email address on your staff account." };
  }

  if (!isSupabaseConfigured()) {
    return {
      error:
        "This environment uses the local staff password, so there is no email reset. Set ADMIN_PASSWORD or enable Supabase.",
    };
  }

  const supabase = await createSessionClient();
  if (!supabase) return { error: "The console is not configured yet." };

  const redirectTo = `${await siteOrigin()}/auth/confirm?next=/admin/reset-password`;
  await supabase.auth.resetPasswordForEmail(email, { redirectTo });

  // Deliberately identical whether or not the address belongs to an account.
  return { sent: true };
}

export async function setPassword(
  _previous: PasswordState | null,
  form: FormData,
): Promise<PasswordState> {
  const password = value(form, "password");
  const confirmation = value(form, "confirm");
  const current = value(form, "current");
  const mode = value(form, "mode") === "change" ? "change" : "reset";

  if (password.length < MIN_PASSWORD) {
    return { error: `Use at least ${MIN_PASSWORD} characters.` };
  }
  if (password !== confirmation) {
    return { error: "The two passwords do not match." };
  }

  const supabase = await createSessionClient();
  if (!supabase) return { error: "The console is not configured yet." };

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Your session has ended. Sign in again or request a new reset link." };
  }

  if (mode === "change") {
    if (!current) return { error: "Enter your current password." };
    const { error } = await supabase.auth.signInWithPassword({
      email: user.email ?? "",
      password: current,
    });
    if (error) return { error: "Your current password was not accepted." };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return { error: "That password was rejected. Choose a longer, less predictable one." };
  }

  const staff = await getStaffUser();
  if (!staff) {
    await supabase.auth.signOut();
    return {
      error: "Your password was changed, but this account is not authorised for the console.",
    };
  }

  return { saved: true };
}
