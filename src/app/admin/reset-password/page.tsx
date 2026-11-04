import type { Metadata } from "next";
import Link from "next/link";
import { getStaffUser } from "@/lib/cms/auth";
import { PasswordForm } from "../password/PasswordForm";

export const metadata: Metadata = {
  title: "Set a new password",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function ResetPasswordPage() {
  const staff = await getStaffUser();

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="font-serif text-3xl text-navy">Set a new password</h1>

      {staff ? (
        <>
          <p className="mt-2 text-sm leading-relaxed text-slate">
            Signed in as <span className="text-navy">{staff.email}</span>. Choose a new password for
            this account.
          </p>
          <PasswordForm mode="reset" />
        </>
      ) : (
        <>
          <p className="mt-2 text-sm leading-relaxed text-slate">
            This reset link has expired, has already been used, or was opened in a different
            browser. Request a fresh one and open it in the same browser you sign in with.
          </p>
          <p className="mt-5 text-sm">
            <Link href="/admin/forgot-password" className="text-navy underline underline-offset-4">
              Request a new reset link
            </Link>
          </p>
        </>
      )}
    </div>
  );
}
