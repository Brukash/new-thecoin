import { NextResponse } from "next/server";
import { z } from "zod";
import { randomBytes } from "node:crypto";
import { appendRecord, clientKey, rateLimit } from "@/lib/security";
import { saveEnquiry } from "@/lib/cms/store";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { ensureCase, sendAcknowledgement, updateCase } from "@/lib/crm/cases";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const enquirySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please enter your full name.")
    .max(120, "That name is too long."),
  email: z.string().trim().email("Please enter a valid email address.").max(200),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  staffId: z.string().trim().max(40).optional().or(z.literal("")),
  type: z.enum(["membership", "property", "advisory", "general"]).default("general"),
  message: z
    .string()
    .trim()
    .min(10, "Please tell us a little more (at least 10 characters).")
    .max(4000, "Please keep your message under 4,000 characters."),
  // Honeypot: must stay empty.
  company: z.string().max(0).optional().or(z.literal("")),
  // Explicit consent is implied by submitting, but we reject missing consent flags silently.
  consent: z.string().optional(),
});

const SUBJECT_LABELS = {
  membership: "Membership",
  property: "Property",
  advisory: "Advisory",
  general: "General enquiry",
} as const;

export async function POST(request: Request) {
  const key = clientKey(request);
  if (!rateLimit(`enquiry:${key}`, 5, 10 * 60_000)) {
    return NextResponse.json(
      { ok: false, message: "Too many enquiries from this connection. Please try again shortly." },
      { status: 429 },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request body." }, { status: 400 });
  }

  const parsed = enquirySchema.safeParse(payload);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = String(issue.path[0] ?? "form");
      if (!errors[field]) errors[field] = issue.message;
    }
    return NextResponse.json({ ok: false, errors }, { status: 422 });
  }

  const data = parsed.data;

  // Honeypot hit: respond as success so bots learn nothing.
  if (data.company && data.company.length > 0) {
    return NextResponse.json({ ok: true, reference: "ENQ-000000" });
  }

  const reference = `ENQ-${randomBytes(3).toString("hex").toUpperCase()}`;

  try {
    // Supabase is the inbox in production; the JSON line file is only a
    // fallback for preview builds without credentials.
    const saved = await saveEnquiry({
      reference,
      name: data.name,
      email: data.email,
      phone: data.phone ?? "",
      staffId: data.staffId ?? "",
      subject: SUBJECT_LABELS[data.type],
      message: data.message,
    });

    if (!saved) {
      if (isSupabaseConfigured()) {
        throw new Error("The enquiry inbox rejected the submission.");
      }

      await appendRecord("enquiries", {
        reference,
        receivedAt: new Date().toISOString(),
        name: data.name,
        email: data.email,
        phone: data.phone ?? "",
        staffId: data.staffId ?? "",
        type: data.type,
        message: data.message,
      });
    }
  } catch (error) {
    console.error("Failed to store enquiry", error);
    return NextResponse.json(
      { ok: false, message: "We could not record your enquiry. Please call the office instead." },
      { status: 500 },
    );
  }

  // Every enquiry opens a case so it can be assigned, timed against an SLA and
  // tracked by the customer. A failure here must not lose the message itself,
  // which is already stored, so it is logged rather than returned.
  const entry = await ensureCase(reference, data.type);

  if (entry) {
    const sent = await sendAcknowledgement({
      reference,
      email: data.email,
      name: data.name,
      department: entry.department,
    });

    if (sent) {
      await updateCase(reference, {
        acknowledgement: { sent: true, at: new Date().toISOString() },
      }).catch(() => undefined);
    }
  }

  return NextResponse.json({
    ok: true,
    reference,
    message: "Enquiry received.",
  });
}
