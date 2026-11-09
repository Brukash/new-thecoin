import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { EmailOtpType } from "@supabase/supabase-js";

/**
 * Landing point for Supabase auth emails.
 *
 * The recovery link verifies the token with Supabase and then redirects here
 * with either a PKCE `code` or a `token_hash` + `type` pair. Both are exchanged
 * for a short-lived session held in HttpOnly cookies, after which the visitor
 * is sent to the page that asks for a new password.
 */

const OTP_TYPES: EmailOtpType[] = ["recovery", "invite", "magiclink", "email", "email_change"];

const FALLBACK = "/admin/reset-password";

/**
 * Only a path under /admin on this exact origin is accepted. Anything that
 * could leave the site — a scheme, a protocol-relative "//host", a backslash
 * (URL parsers treat "\\" as "/", so "/\\host" parses as "//host") or a
 * control character — falls back to the reset page.
 */
function safeNext(candidate: string | null, origin: string): string {
  if (!candidate) return FALLBACK;
  if (!candidate.startsWith("/") || candidate.startsWith("//")) return FALLBACK;
  if (/[\\\u0000-\u001f\u007f]/.test(candidate)) return FALLBACK;

  try {
    const resolved = new URL(candidate, origin);
    if (resolved.origin !== origin) return FALLBACK;
    if (resolved.pathname !== "/admin" && !resolved.pathname.startsWith("/admin/")) {
      return FALLBACK;
    }
    return `${resolved.pathname}${resolved.search}`;
  } catch {
    return FALLBACK;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = safeNext(searchParams.get("next"), origin);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return NextResponse.redirect(new URL("/admin/login?error=config", origin));
  }

  const response = NextResponse.redirect(new URL(next, origin));

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return NextResponse.redirect(new URL("/admin/login?error=link", origin));
    return response;
  }

  if (tokenHash && type && OTP_TYPES.includes(type)) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (error) return NextResponse.redirect(new URL("/admin/login?error=link", origin));
    return response;
  }

  return NextResponse.redirect(new URL("/admin/login?error=link", origin));
}
