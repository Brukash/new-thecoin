import Link from "next/link";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/cms/auth";
import { readRecords } from "@/lib/security";

export const dynamic = "force-dynamic";

type Subscriber = { email: string; subscribedAt?: string };

async function sendBroadcast(formData: FormData) {
  "use server";

  await requireStaff();

  const subject = String(formData.get("subject") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!subject || !message) redirect("/admin/newsletter?error=missing");

  const key = process.env.KNOCK_API_KEY;
  if (!key) redirect("/admin/newsletter?error=not-configured");

  const subscribers = await readRecords<Subscriber>("newsletter");
  if (subscribers.length === 0) redirect("/admin/newsletter?error=empty");

  const workflow = process.env.KNOCK_NEWSLETTER_WORKFLOW ?? "newsletter-broadcast";

  // Knock triggers the workflow once per recipient; the email step and sender
  // address live in the Knock dashboard, not in this repository.
  const response = await fetch(
    `https://api.knock.app/v1/workflows/${encodeURIComponent(workflow)}/trigger`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        recipients: subscribers.slice(0, 200).map((subscriber) => ({
          id: subscriber.email,
          email: subscriber.email,
        })),
        data: { subject, message },
      }),
    },
  );

  if (!response.ok) redirect("/admin/newsletter?error=send");

  redirect("/admin/newsletter?sent=1");
}

const errors: Record<string, string> = {
  missing: "Add a subject and a message before sending.",
  "not-configured": "Email delivery is not connected. Add the Knock API key and workflow, then try again.",
  empty: "There are no confirmed subscribers yet.",
  send: "The email provider rejected the broadcast. Check the Knock workflow and sender settings.",
};

export default async function NewsletterPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  await requireStaff();
  const query = await searchParams;

  const subscribers = await readRecords<Subscriber>("newsletter");
  const configured = Boolean(process.env.KNOCK_API_KEY);
  const recent = [...subscribers].reverse().slice(0, 50);

  return (
    <div>
      <Link href="/admin" className="text-[12px] uppercase tracking-[0.12em] text-slate hover:text-navy">
        ← Console
      </Link>
      <h1 className="mt-4 font-serif text-2xl text-navy">Newsletter</h1>
      <p className="mt-1 text-xs text-slate">
        {subscribers.length} {subscribers.length === 1 ? "subscriber" : "subscribers"} ·{" "}
        {configured ? "delivery connected" : "delivery not connected"}
      </p>

      {query.sent ? (
        <p className="mt-5 border-l-2 border-gold bg-white px-4 py-3 text-sm text-navy">
          Broadcast handed to the email provider.
        </p>
      ) : null}
      {query.error ? (
        <p className="mt-5 border-l-2 border-red-500 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errors[query.error] ?? "That could not be completed."}
        </p>
      ) : null}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_1fr]">
        <form action={sendBroadcast} className="space-y-5 border border-line bg-white p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate">
            Send an update
          </p>

          <div>
            <label htmlFor="subject" className="field-label">
              Subject
            </label>
            <input id="subject" name="subject" required maxLength={140} className="field mt-2" />
          </div>

          <div>
            <label htmlFor="message" className="field-label">
              Message
            </label>
            <textarea id="message" name="message" required rows={10} className="field mt-2" />
            <p className="mt-1 text-[12px] text-slate">
              Separate paragraphs with a blank line. Every subscriber receives the same message.
            </p>
          </div>

          <div className="flex items-center gap-3 border-t border-line pt-4">
            <button type="submit" className="btn btn-primary h-10 px-5">
              Send to {subscribers.length} subscribers
            </button>
            {configured ? null : (
              <span className="text-[12px] text-slate">Requires KNOCK_API_KEY</span>
            )}
          </div>

          {configured ? null : (
            <p className="border-l-2 border-gold bg-bone px-3 py-2 text-[12px] leading-relaxed text-slate">
              Sign-ups are being collected already. To deliver email, create a Knock workflow with an
              email step and a connected sender, then set <code>KNOCK_API_KEY</code> and{" "}
              <code>KNOCK_NEWSLETTER_WORKFLOW</code> in the environment. Until then nothing is sent.
            </p>
          )}
        </form>

        <div className="border border-line bg-white p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate">
            Recent subscribers
          </p>
          {recent.length === 0 ? (
            <p className="mt-3 text-xs text-slate">No sign-ups yet. The form is in the site footer.</p>
          ) : (
            <ul className="mt-3 divide-y divide-line">
              {recent.map((subscriber) => (
                <li key={subscriber.email} className="flex flex-wrap items-baseline justify-between gap-2 py-2">
                  <span className="break-all text-[14px] text-navy">{subscriber.email}</span>
                  <span className="text-[11px] text-slate">
                    {subscriber.subscribedAt
                      ? new Date(subscriber.subscribedAt).toLocaleDateString("en-GB")
                      : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
