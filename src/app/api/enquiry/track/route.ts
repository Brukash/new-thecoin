import { NextResponse } from "next/server";
import { z } from "zod";
import { clientKey, rateLimit } from "@/lib/security";
import { getCase, departmentLabel, slaState } from "@/lib/crm/cases";
import { listEnquiries } from "@/lib/cms/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  reference: z.string().trim().toUpperCase().min(6).max(20),
  email: z.string().trim().toLowerCase().email(),
});

/**
 * Public lookup. The reference alone is not enough: the address that sent the
 * enquiry must match, so a guessed reference cannot reveal anyone's message.
 * Internal notes and officer names are never returned.
 */
export async function POST(request: Request) {
  if (!rateLimit(`track:${clientKey(request)}`, 10, 10 * 60_000)) {
    return NextResponse.json({ ok: false, message: "Too many lookups. Please try again shortly." }, { status: 429 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request." }, { status: 400 });
  }

  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: "Enter the reference from your acknowledgement and the email you used." },
      { status: 422 },
    );
  }

  const { reference, email } = parsed.data;

  const enquiries = await listEnquiries(500);
  const enquiry = enquiries.find(
    (item) => item.reference?.toUpperCase() === reference && item.email.toLowerCase() === email,
  );

  if (!enquiry) {
    return NextResponse.json(
      { ok: false, message: "No enquiry matches that reference and email. Check both and try again." },
      { status: 404 },
    );
  }

  const entry = await getCase(reference);

  return NextResponse.json({
    ok: true,
    enquiry: {
      reference: enquiry.reference,
      subject: enquiry.subject,
      submittedAt: enquiry.createdAt,
      department: entry ? departmentLabel(entry.department) : "Secretariat",
      status: entry?.status ?? (enquiry.handled ? "resolved" : "new"),
      dueAt: entry?.dueAt ?? null,
      firstResponseAt: entry?.firstResponseAt ?? null,
      resolvedAt: entry?.resolvedAt ?? null,
      sla: entry ? slaState(entry) : null,
      acknowledged: entry?.acknowledgement.sent ?? false,
      replies: (entry?.responses ?? []).map((reply) => ({ at: reply.at, body: reply.body })),
      feedback: entry?.feedback ?? null,
    },
  });
}
