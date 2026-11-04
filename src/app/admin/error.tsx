"use client";

import { useEffect } from "react";

/**
 * Console error boundary.
 *
 * A failed save, an expired session or a dropped connection should leave staff
 * on a readable page with a retry, not the default Next.js error screen.
 */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin console error", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg border border-line bg-white p-6">
      <h1 className="font-serif text-2xl text-navy">That action did not complete</h1>
      <p className="mt-2 text-sm leading-relaxed text-slate">
        The change may not have been saved. Try again, and if it keeps failing sign out and back in
        or call the website administrator.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" onClick={reset} className="btn btn-primary text-[11px]">
          Try again
        </button>
        <a href="/admin" className="btn btn-outline text-[11px]">
          Back to the console
        </a>
      </div>
    </div>
  );
}
