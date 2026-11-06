"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { registerForEvent, type FormState } from "@/app/admin/events/actions";

const initial: FormState = { status: "idle" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary h-11 px-6" disabled={pending}>
      {pending ? "Sending…" : "Register for this event"}
    </button>
  );
}

/**
 * Internal registration form. Only rendered when the event collects
 * registrations on this website; the server action re-checks that and the
 * event's publication state before writing anything.
 */
export function EventRegistrationForm({
  slug,
  deadline,
  enquiryEmail,
}: {
  slug: string;
  deadline: string | null;
  enquiryEmail: string;
}) {
  const [state, formAction] = useActionState(registerForEvent, initial);

  if (state.status === "success") {
    return (
      <div className="border border-gold/50 bg-gold-50/60 p-6">
        <p className="font-serif text-lg text-navy">Registration received</p>
        <p className="mt-2 text-sm leading-relaxed text-slate">{state.message}</p>
        <p className="mt-3 text-xs leading-relaxed text-slate">
          Keep this confirmation. If your plans change, contact the Secretariat
          {enquiryEmail ? (
            <>
              {" "}
              at{" "}
              <a href={`mailto:${enquiryEmail}`} className="text-gold-600 underline">
                {enquiryEmail}
              </a>
            </>
          ) : null}
          .
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="slug" value={slug} />

      {/* Honeypot: hidden from members and assistive technology. */}
      <div className="hidden" aria-hidden>
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {state.status === "error" ? (
        <p className="border-l-2 border-red-500 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.message}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="fullName" className="field-label">
            Full name
          </label>
          <input id="fullName" name="fullName" className="field mt-1.5" required autoComplete="name" />
        </div>
        <div>
          <label htmlFor="email" className="field-label">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="field mt-1.5"
            required
            autoComplete="email"
          />
        </div>
        <div>
          <label htmlFor="phone" className="field-label">
            Telephone
          </label>
          <input id="phone" name="phone" className="field mt-1.5" autoComplete="tel" />
        </div>
        <div>
          <label htmlFor="organisation" className="field-label">
            Organisation <span className="normal-case tracking-normal text-slate">(optional)</span>
          </label>
          <input
            id="organisation"
            name="organisation"
            className="field mt-1.5"
            autoComplete="organization"
          />
        </div>
        <div>
          <label htmlFor="attendeeCount" className="field-label">
            Number of attendees
          </label>
          <input
            id="attendeeCount"
            name="attendeeCount"
            type="number"
            min={1}
            max={50}
            defaultValue={1}
            className="field mt-1.5"
            required
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="additionalInformation" className="field-label">
            Anything we should know?{" "}
            <span className="normal-case tracking-normal text-slate">(optional)</span>
          </label>
          <textarea
            id="additionalInformation"
            name="additionalInformation"
            rows={3}
            maxLength={1000}
            className="field mt-1.5"
          />
        </div>
      </div>

      <label className="flex items-start gap-3 border-t border-line pt-4 text-xs leading-relaxed text-slate">
        <input type="checkbox" name="consent" value="yes" required className="mt-0.5 size-4" />
        <span>
          I consent to the Society storing these details to administer this event and to contact me
          about it. The information is not published and is not used for unrelated marketing.
          {deadline ? ` Registration closes ${deadline}.` : ""}
        </span>
      </label>

      <div className="flex items-center gap-4">
        <SubmitButton />
        <p className="text-[11px] leading-relaxed text-slate">
          Registration records are private to the organising team.
        </p>
      </div>
    </form>
  );
}
