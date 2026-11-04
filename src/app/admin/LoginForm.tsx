"use client";

import { useActionState } from "react";
import { signIn } from "./actions";

export function LoginForm({ emailMode = false }: { emailMode?: boolean }) {
  const [state, formAction, pending] = useActionState(signIn, null);

  return (
    <form action={formAction} className="mt-8 space-y-5">
      {emailMode ? (
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
            placeholder="name@cbn.gov.ng"
          />
        </div>
      ) : null}

      <div>
        <label htmlFor="password" className="field-label">
          {emailMode ? "Password" : "Staff password"}
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
        Authorised staff only. Sessions are held in secure, HttpOnly cookies and end when you sign
        out or the session expires.
      </p>
    </form>
  );
}
