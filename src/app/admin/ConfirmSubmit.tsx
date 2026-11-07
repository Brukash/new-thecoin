"use client";

import type { ReactNode } from "react";

/**
 * Submit button that asks for confirmation before a destructive action runs.
 * Used by the staff console for deleting articles and projects.
 */
export function ConfirmSubmit({ children }: { children: ReactNode }) {
  return (
    <button
      type="submit"
      className="text-[12px] uppercase tracking-[0.1em] text-red-700 transition-colors hover:text-red-900"
      onClick={(event) => {
        if (!window.confirm("Delete this item permanently? This cannot be undone.")) {
          event.preventDefault();
        }
      }}
    >
      {children}
    </button>
  );
}
