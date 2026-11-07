"use client";

import { useState } from "react";
import { CheckCircle2, Search } from "lucide-react";

type Tracked = {
  reference: string;
  subject: string;
  submittedAt: string;
  department: string;
  status: string;
  dueAt: string | null;
  firstResponseAt: string | null;
  resolvedAt: string | null;
  sla: "met" | "breached" | "due" | "closed" | null;
  acknowledged: boolean;
  replies: { at: string; body: string }[];
  feedback: { rating: number; comment: string; at: string } | null;
};

const STATUS_LABEL: Record<string, string> = {
  new: "Received",
  assigned: "Assigned to an officer",
  "in-progress": "Being worked on",
  "awaiting-customer": "Waiting for your reply",
  resolved: "Resolved",
  closed: "Closed",
};

const dateTime = (value: string) =>
  new Date(value).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });

export function EnquiryTracker() {
  const [reference, setReference] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Tracked | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);

  async function lookup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/enquiry/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference, email }),
      });
      const data = (await response.json()) as { ok?: boolean; enquiry?: Tracked; message?: string };
      if (!response.ok || !data.ok || !data.enquiry) {
        setError(data.message ?? "That enquiry could not be found.");
        return;
      }
      setResult(data.enquiry);
      setFeedbackSent(Boolean(data.enquiry.feedback));
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function sendFeedback(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!result) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/enquiry/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference: result.reference, email, rating, comment }),
      });
      const data = (await response.json()) as { ok?: boolean; message?: string };
      if (!response.ok || !data.ok) {
        setError(data.message ?? "Feedback could not be recorded.");
        return;
      }
      setFeedbackSent(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const resolved = result && ["resolved", "closed"].includes(result.status);

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
      <form onSubmit={lookup} className="card h-fit p-6 md:p-8" noValidate>
        <h2 className="font-serif text-xl text-navy">Track your enquiry</h2>
        <p className="mt-1 text-sm leading-relaxed text-slate">
          Use the reference from your acknowledgement email and the address you wrote from.
        </p>

        <div className="mt-5 space-y-4">
          <div>
            <label htmlFor="reference" className="field-label">
              Reference
            </label>
            <input
              id="reference"
              value={reference}
              onChange={(event) => setReference(event.target.value.toUpperCase())}
              placeholder="ENQ-1A2B3C"
              required
              className="field mt-2 font-sans"
            />
          </div>
          <div>
            <label htmlFor="track-email" className="field-label">
              Email used
            </label>
            <input
              id="track-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
              className="field mt-2"
            />
          </div>
        </div>

        <button type="submit" disabled={busy} className="btn btn-primary mt-5 w-full disabled:opacity-60">
          <Search className="size-4" aria-hidden />
          {busy ? "Checking…" : "Find my enquiry"}
        </button>

        {error ? (
          <p role="alert" className="mt-3 border-l-2 border-red-500 bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </p>
        ) : null}

        <p className="mt-4 text-[12px] leading-relaxed text-slate">
          References are checked against the email that sent them, so a guessed reference shows nothing.
        </p>
      </form>

      <div>
        {!result ? (
          <div className="border border-line bg-bone p-6">
            <p className="font-serif text-lg text-navy">What you will see</p>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-slate">
              <li>The department handling your enquiry and who is assigned to it.</li>
              <li>Its status and the date a reply is due.</li>
              <li>Replies the Secretariat has sent you, with dates.</li>
              <li>A feedback form once the enquiry is resolved.</li>
            </ul>
          </div>
        ) : (
          <div className="border border-line bg-white p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gold-600">
              {result.reference}
            </p>
            <h2 className="mt-2 font-serif text-xl text-navy">{result.subject}</h2>
            <p className="mt-1 text-xs text-slate">
              Sent {dateTime(result.submittedAt)} · handled by {result.department}
            </p>

            <dl className="mt-5 space-y-2 border-y border-line py-4 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-slate">Status</dt>
                <dd className="text-navy">{STATUS_LABEL[result.status] ?? result.status}</dd>
              </div>
              {result.dueAt ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-slate">Reply due</dt>
                  <dd className="text-navy">{dateTime(result.dueAt)}</dd>
                </div>
              ) : null}
              <div className="flex justify-between gap-4">
                <dt className="text-slate">Acknowledgement</dt>
                <dd className="text-navy">{result.acknowledged ? "Sent by email" : "Recorded"}</dd>
              </div>
            </dl>

            <div className="mt-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate">Replies</p>
              {result.replies.length === 0 ? (
                <p className="mt-2 text-sm text-slate">No reply has been sent yet.</p>
              ) : (
                <ul className="mt-2 space-y-3">
                  {result.replies.map((reply) => (
                    <li key={reply.at} className="border-l-2 border-gold bg-bone px-3 py-2">
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-navy">{reply.body}</p>
                      <p className="mt-1 text-[11px] text-slate">{dateTime(reply.at)}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {resolved ? (
              <div className="mt-6 border-t border-line pt-5">
                {result.feedback || feedbackSent ? (
                  <p className="flex items-center gap-2 text-sm text-emerald-700">
                    <CheckCircle2 className="size-4" aria-hidden /> Thank you for your feedback.
                  </p>
                ) : (
                  <form onSubmit={sendFeedback}>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate">
                      How did we do?
                    </p>
                    <div className="mt-2 flex gap-1">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setRating(value)}
                          aria-label={`${value} out of 5`}
                          aria-pressed={rating === value}
                          className={`size-9 border text-sm ${rating >= value ? "border-gold bg-gold/20 text-navy" : "border-line text-slate"}`}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                    <label htmlFor="feedback-comment" className="sr-only">
                      Comments
                    </label>
                    <textarea
                      id="feedback-comment"
                      value={comment}
                      onChange={(event) => setComment(event.target.value)}
                      rows={3}
                      placeholder="Anything you would like to add (optional)"
                      className="field mt-3"
                    />
                    <button type="submit" disabled={busy} className="btn btn-outline mt-3 h-10 px-5 text-[12px]">
                      Send feedback
                    </button>
                  </form>
                )}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
