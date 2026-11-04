import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getStaffUser } from "@/lib/cms/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { ForgotPasswordForm } from "../password/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Reset your password",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function ForgotPasswordPage() {
  if (await getStaffUser()) redirect("/admin/account");

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="font-serif text-3xl text-navy">Reset your password</h1>
      <p className="mt-2 text-sm leading-relaxed text-slate">
        Enter the email address on your staff account and we will send a link to choose a new
        password.
      </p>

      {isSupabaseConfigured() ? null : (
        <p className="mt-5 border-l-2 border-gold bg-white px-4 py-3 text-xs leading-relaxed text-slate">
          Supabase is not configured in this environment, so email resets are unavailable. The
          console uses the local staff password instead.
        </p>
      )}

      <ForgotPasswordForm />
    </div>
  );
}
