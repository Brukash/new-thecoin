import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getStaffUser } from "@/lib/cms/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { LoginForm } from "../LoginForm";

export const metadata: Metadata = { title: "Staff sign in", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await getStaffUser()) redirect("/admin");
  const { error } = await searchParams;

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="font-serif text-3xl text-navy">Staff sign in</h1>
      <p className="mt-2 text-sm leading-relaxed text-slate">
        Sign in with your Society staff account to manage website content.
      </p>

      {isSupabaseConfigured() ? null : (
        <p className="mt-5 border-l-2 border-gold bg-white px-4 py-3 text-xs leading-relaxed text-slate">
          Supabase is not configured in this environment, so the console is using the local staff
          password. Add the Supabase keys to <code>.env.local</code> to enable staff accounts.
        </p>
      )}

      <LoginForm emailMode={isSupabaseConfigured()} />

      {error ? (
        <p className="mt-5 border-l-2 border-red-500 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error === "link"
            ? "That reset link has expired or has already been used. Request a new one."
            : "The console is not configured yet."}
        </p>
      ) : null}

      {isSupabaseConfigured() ? (
        <p className="mt-6 text-xs">
          <Link
            href="/admin/forgot-password"
            className="underline underline-offset-4 hover:text-navy"
          >
            Forgot your password?
          </Link>
        </p>
      ) : null}
    </div>
  );
}
