"use client";

import Link from "next/link";
import { useActionState } from "react";
import { setPassword } from "./actions";
import { MIN_PASSWORD } from "./rules";

/**
 * New-password form.
 *
 * `mode="change"` requires the current password, for someone already signed in
 * who wants to replace it. `mode="reset"` is used straight after a recovery
 * link, where the session itself proves ownership of the mailbox.
 */
export function PasswordForm({ mode }: { mode: "reset" | "change" }) {
  const [state, formAction, pending] = useActionState(setPassword, null);

  if (state?.saved) {
    return (
      <div className="mt-8 border-l-2 border-gold bg-white px-4 py-3 text-sm leading-relaxed text-navy">
        <p className="font-medium">Your password has been changed.</p>
        <p className="mt-2 text-slate">
          Use it the next time you sign in.{" "}
          <Link href="/admin" className="text-navy underline underline-offset-4">
            Go to the console
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <input type="hidden" name="mode" value={mode} />

      {mode === "change" ? (
        <div>
          <label htmlFor="current" className="field-label">
            Current password
          </label>
          <input
            id="current"
            name="current"
            type="password"
            autoComplete="current-password"
            required
            className="field mt-2"
          />
        </div>
      ) : null}

      <div>
        <label htmlFor="password" className="field-label">
          New password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={MIN_PASSWORD}
          required
          className="field mt-2"
          placeholder="••••••••••"
        />
        <p className="mt-2 text-xs text-slate">At least {MIN_PASSWORD} characters.</p>
      </div>

      <div>
        <label htmlFor="confirm" className="field-label">
          Confirm new password
        </label>
        <input
          id="confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          minLength={MIN_PASSWORD}
          required
          className="field mt-2"
          placeholder="••••••••••"
        />
      </div>

      {state?.error ? (
        <p role="alert" className="border-l-2 border-red-500 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}

      <button type="submit" className="btn btn-primary w-full" disabled={pending}>
        {pending ? "Saving…" : mode === "change" ? "Change password" : "Set new password"}
      </button>
    </form>
  );
}
