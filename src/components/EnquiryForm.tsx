"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";

type EnquiryType = "membership" | "property" | "general" | "advisory";

const options: { value: EnquiryType; label: string }[] = [
  { value: "membership", label: "Membership" },
  { value: "property", label: "Property / project subscription" },
  { value: "advisory", label: "Savings, credit or investment" },
  { value: "general", label: "General enquiry" },
];

/**
 * Enquiry form. Posts to /api/enquiry which validates server-side, applies
 * rate limiting and a honeypot, then stores the enquiry. No third-party
 * provider is contacted until one is approved by the Society.
 */
export function EnquiryForm({ defaultType = "general" }: { defaultType?: EnquiryType }) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");
  const [reference, setReference] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    setState("loading");
    setMessage("");

    try {
      const response = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = (await response.json()) as {
        ok?: boolean;
        message?: string;
        reference?: string;
        errors?: Record<string, string>;
      };

      if (!response.ok || !result.ok) {
        setState("error");
        setMessage(
          result.errors
            ? Object.values(result.errors)[0]
            : (result.message ?? "Something went wrong. Please try again."),
        );
        return;
      }

      setState("done");
      setReference(result.reference ?? "");
      form.reset();
    } catch {
      setState("error");
      setMessage("Network error. Please check your connection and try again.");
    }
  }

  if (state === "done") {
    return (
      <div className="card p-8 text-center" role="status">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-gold-50 text-gold-600">
          <Check className="size-6" aria-hidden />
        </span>
        <h3 className="mt-4 font-serif text-xl text-navy">Enquiry received</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate">
          Thank you. A member of the Secretariat will respond during office hours. Please quote
          reference <strong className="text-navy">{reference}</strong> if you follow up.
        </p>
        <button
          type="button"
          onClick={() => setState("idle")}
          className="btn btn-outline mt-6"
        >
          Send another enquiry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card p-6 md:p-8" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-1">
          <label htmlFor="name" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-navy">
            Full name <span className="text-gold-600">*</span>
          </label>
          <input
            id="name"
            name="name"
            required
            autoComplete="name"
            className="h-11 w-full border border-line bg-white px-3 text-sm text-charcoal focus:border-gold-600 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="email" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-navy">
            Email <span className="text-gold-600">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="h-11 w-full border border-line bg-white px-3 text-sm text-charcoal focus:border-gold-600 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="phone" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-navy">
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            className="h-11 w-full border border-line bg-white px-3 text-sm text-charcoal focus:border-gold-600 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="staffId" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-navy">
            Staff / member ID
          </label>
          <input
            id="staffId"
            name="staffId"
            className="h-11 w-full border border-line bg-white px-3 text-sm text-charcoal focus:border-gold-600 focus:outline-none"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="type" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-navy">
            What is this about?
          </label>
          <select
            id="type"
            name="type"
            defaultValue={defaultType}
            className="h-11 w-full border border-line bg-white px-3 text-sm text-charcoal focus:border-gold-600 focus:outline-none"
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="message" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-navy">
            Your message <span className="text-gold-600">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            required
            rows={5}
            className="w-full border border-line bg-white px-3 py-2.5 text-sm text-charcoal focus:border-gold-600 focus:outline-none"
          />
        </div>

        {/* Honeypot — hidden from humans and assistive technology */}
        <div className="hidden" aria-hidden>
          <label htmlFor="company">Company</label>
          <input id="company" name="company" tabIndex={-1} autoComplete="off" />
        </div>

        <div className="sm:col-span-2">
          <p className="text-xs leading-relaxed text-slate">
            By submitting this form you consent to the Society contacting you about your enquiry. We
            do not share your details with third parties.
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button type="submit" disabled={state === "loading"} className="btn btn-ink disabled:opacity-60">
          {state === "loading" ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden /> Sending
            </>
          ) : (
            "Send enquiry"
          )}
        </button>
        <p aria-live="polite" className="min-h-5 text-xs text-red-600">
          {state === "error" ? message : ""}
        </p>
      </div>
    </form>
  );
}
