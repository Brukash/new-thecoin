import type { Metadata } from "next";
import Link from "next/link";
import { requireStaff } from "@/lib/cms/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { PasswordForm } from "../password/PasswordForm";
import { signOut } from "../actions";

export const metadata: Metadata = { title: "Your account", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const staff = await requireStaff();

  return (
    <div className="mx-auto max-w-sm">
      <Link href="/admin" className="text-[11px] uppercase tracking-[0.12em] text-slate hover:text-navy">
        ← Back to console
      </Link>
      <h1 className="mt-4 font-serif text-2xl text-navy">Your account</h1>
      <p className="mt-1 text-xs text-slate">
        {staff.email} · {staff.role}
      </p>

      {isSupabaseConfigured() ? (
        <PasswordForm mode="change" />
      ) : (
        <p className="mt-8 border-l-2 border-gold bg-white px-4 py-3 text-xs leading-relaxed text-slate">
          This environment uses the shared local staff password, which is set in the environment
          rather than per person. Enable Supabase to give each member of staff their own account.
        </p>
      )}

      <form action={signOut} className="mt-8 border-t border-line pt-5">
        <button type="submit" className="text-[11px] uppercase tracking-[0.1em] text-slate hover:text-navy">
          Sign out
        </button>
      </form>
    </div>
  );
}
