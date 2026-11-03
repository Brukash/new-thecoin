"use client";

import { useActionState } from "react";
import { login } from "./actions";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, null);

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <div>
        <label htmlFor="password" className="field-label">
          Staff password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="field mt-2"
          placeholder="••••••••"
        />
      </div>

      {state?.error ? (
        <p role="alert" className="border-l-2 border-red-500 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}

      <button type="submit" className="btn btn-primary w-full" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </button>

      <p className="text-xs leading-relaxed text-slate">
        Authorised staff only. Sessions last eight hours and are limited to this browser.
      </p>
    </form>
  );
}
