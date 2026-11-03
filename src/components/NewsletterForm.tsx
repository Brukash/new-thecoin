"use client";

import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("loading");
    setMessage("");

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await response.json()) as { ok?: boolean; message?: string };

      if (!response.ok || !data.ok) {
        setState("error");
        setMessage(data.message ?? "We could not record that address. Please try again.");
        return;
      }

      setState("done");
      setMessage(data.message ?? "You're on the list.");
      setEmail("");
    } catch {
      setState("error");
      setMessage("Network error. Please try again.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="w-full" noValidate>
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id="newsletter-email"
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Your email address"
          className="h-12 flex-1 border border-white/20 bg-white/5 px-4 text-sm text-white placeholder:text-white/40 focus:border-gold focus:outline-none"
        />
        <button
          type="submit"
          disabled={state === "loading"}
          className="btn btn-primary h-12 shrink-0 disabled:opacity-60"
        >
          {state === "done" ? (
            <>
              <Check className="size-4" /> Subscribed
            </>
          ) : state === "loading" ? (
            "Submitting…"
          ) : (
            <>
              Subscribe <ArrowRight className="size-4" />
            </>
          )}
        </button>
      </div>
      <p
        aria-live="polite"
        className={`mt-2 min-h-5 text-xs ${state === "error" ? "text-red-300" : "text-white/50"}`}
      >
        {message}
      </p>
    </form>
  );
}
