"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { sendEventEnquiry, type FormState } from "@/app/admin/events/actions";

const initial: FormState = { status: "idle" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-outline h-10 px-5" disabled={pending}>
      {pending ? "Sending…" : "Send enquiry"}
    </button>
  );
}

/** Enquiry form for an event, shown alongside the registration options. */
export function EventEnquiryForm({ slug }: { slug: string }) {
  const [state, formAction] = useActionState(sendEventEnquiry, initial);

  if (state.status === "success") {
    return (
      <p className="border border-gold/50 bg-gold-50/60 px-5 py-4 text-sm leading-relaxed text-navy">
        {state.message}
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="slug" value={slug} />
      <div className="hidden" aria-hidden>
        <label htmlFor="enquiry-website">Website</label>
        <input id="enquiry-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {state.status === "error" ? (
        <p className="border-l-2 border-red-500 bg-red-50 px-3 py-2 text-xs text-red-700">
          {state.message}
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label htmlFor="name" className="field-label">
            Name
          </label>
          <input id="name" name="name" className="field mt-1" required autoComplete="name" />
        </div>
        <div>
          <label htmlFor="enquiry-email" className="field-label">
            Email
          </label>
          <input
            id="enquiry-email"
            name="email"
            type="email"
            className="field mt-1"
            required
            autoComplete="email"
          />
        </div>
        <div>
          <label htmlFor="enquiry-phone" className="field-label">
            Telephone
          </label>
          <input id="enquiry-phone" name="phone" className="field mt-1" autoComplete="tel" />
        </div>
      </div>

      <div>
        <label htmlFor="message" className="field-label">
          Your question
        </label>
        <textarea id="message" name="message" rows={3} className="field mt-1" required maxLength={2000} />
      </div>

      <SubmitButton />
    </form>
  );
}
