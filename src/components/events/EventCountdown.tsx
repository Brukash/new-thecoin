"use client";

import { useEffect, useState } from "react";

/**
 * Live countdown to an event's start, in West Africa Time.
 *
 * Times are passed as ISO instants, so the countdown is correct for a reader in
 * any time zone. It stops at the start and switches to the live state; past and
 * cancelled events never render it (the pages decide that).
 */
export function EventCountdown({
  startsAt,
  endsAt,
  variant = "default",
}: {
  startsAt: string;
  endsAt?: string | null;
  variant?: "default" | "invert";
}) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const start = new Date(startsAt).getTime();
  const end = endsAt ? new Date(endsAt).getTime() : start;

  if (now === null) {
    return (
      <div className="grid max-w-md grid-cols-4 gap-2" aria-hidden>
        {["Days", "Hours", "Minutes", "Seconds"].map((label) => (
          <div
            key={label}
            className={`border px-2 py-3 text-center ${
              variant === "invert" ? "border-white/15" : "border-line"
            }`}
          >
            <p className={`font-serif text-2xl ${variant === "invert" ? "text-white/40" : "text-navy/30"}`}>
              --
            </p>
            <p
              className={`mt-1 text-[9px] uppercase tracking-[0.14em] ${
                variant === "invert" ? "text-white/50" : "text-slate"
              }`}
            >
              {label}
            </p>
          </div>
        ))}
      </div>
    );
  }

  if (now >= start) {
    const live = now <= end;
    return (
      <p
        className={`inline-flex items-center gap-2 border px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] ${
          variant === "invert"
            ? "border-gold/40 bg-gold/10 text-gold-200"
            : "border-gold/40 bg-gold-50 text-gold-600"
        }`}
      >
        <span className="size-1.5 animate-pulse rounded-full bg-gold" aria-hidden />
        {live ? "Event in progress" : "Event has taken place"}
      </p>
    );
  }

  const remaining = start - now;
  const days = Math.floor(remaining / 86_400_000);
  const hours = Math.floor((remaining % 86_400_000) / 3_600_000);
  const minutes = Math.floor((remaining % 3_600_000) / 60_000);
  const seconds = Math.floor((remaining % 60_000) / 1000);

  const parts = [
    { label: "Days", value: days },
    { label: "Hours", value: hours },
    { label: "Minutes", value: minutes },
    { label: "Seconds", value: seconds },
  ];

  return (
    <div
      className="grid max-w-md grid-cols-4 gap-2"
      role="timer"
      aria-live="off"
      aria-label="Time until the event begins"
    >
      {parts.map((part) => (
        <div
          key={part.label}
          className={`border px-2 py-3 text-center ${
            variant === "invert" ? "border-white/15 bg-white/[0.03]" : "border-line bg-white"
          }`}
        >
          <p
            className={`font-serif text-2xl tabular-nums ${
              variant === "invert" ? "text-white" : "text-navy"
            }`}
          >
            {String(part.value).padStart(2, "0")}
          </p>
          <p
            className={`mt-1 text-[9px] uppercase tracking-[0.14em] ${
              variant === "invert" ? "text-white/50" : "text-slate"
            }`}
          >
            {part.label}
          </p>
        </div>
      ))}
    </div>
  );
}
