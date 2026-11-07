"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * First-party page view counting.
 *
 * Sends one anonymous beacon per page per session — no cookie, no identifier,
 * nothing that follows a visitor between sites. It exists so the console can
 * show which pages are read even when Google Analytics has no measurement ID
 * configured. Staff console routes are excluded.
 */
export function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin") || pathname.startsWith("/api")) return;

    const key = `viewed:${pathname}`;
    try {
      if (window.sessionStorage.getItem(key)) return;
      window.sessionStorage.setItem(key, "1");
    } catch {
      // Private mode without storage still counts; duplicates are harmless.
    }

    const body = JSON.stringify({ path: pathname });
    if (navigator.sendBeacon?.("/api/track", new Blob([body], { type: "application/json" }))) return;

    void fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => undefined);
  }, [pathname]);

  return null;
}
