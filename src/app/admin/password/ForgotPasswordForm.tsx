"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestPasswordReset } from "./actions";

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, null);

  if (state?.sent) {
    return (
      <div className="mt-8 border-l-2 border-gold bg-white px-4 py-3 text-sm leading-relaxed text-navy">
        <p className="font-medium">Check your inbox.</p>
        <p className="mt-2 text-slate">
          If that address belongs to a staff account, a reset link is on its way. The link can be
          used once and expires shortly, so open it in this browser.
        </p>
        <p className="mt-3 text-slate">
          <Link href="/admin/login" className="text-navy underline underline-offset-4">
            Back to sign in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <div>
        <label htmlFor="email" className="field-label">
          Work email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          className="field mt-2"
          placeholder="name@cbncoopng.com"
        />
      </div>

      {state?.error ? (
        <p role="alert" className="border-l-2 border-red-500 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}

      <button type="submit" className="btn btn-primary w-full" disabled={pending}>
        {pending ? "Sending…" : "Send reset link"}
      </button>

      <p className="text-xs leading-relaxed text-slate">
        <Link href="/admin/login" className="underline underline-offset-4 hover:text-navy">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
