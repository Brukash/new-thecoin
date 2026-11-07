import { NextResponse } from "next/server";
import { z } from "zod";
import { clientKey, rateLimit } from "@/lib/security";
import { getCase, updateCase } from "@/lib/crm/cases";
import { listEnquiries } from "@/lib/cms/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  reference: z.string().trim().toUpperCase().min(6).max(20),
  email: z.string().trim().toLowerCase().email(),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().max(1000).optional().or(z.literal("")),
});

/** Feedback is accepted only for an enquiry that was actually resolved. */
export async function POST(request: Request) {
  if (!rateLimit(`feedback:${clientKey(request)}`, 5, 10 * 60_000)) {
    return NextResponse.json({ ok: false, message: "Too many submissions." }, { status: 429 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request." }, { status: 400 });
  }

  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Choose a rating from 1 to 5." }, { status: 422 });
  }

  const { reference, email, rating, comment } = parsed.data;

  const enquiries = await listEnquiries(500);
  const enquiry = enquiries.find(
    (item) => item.reference?.toUpperCase() === reference && item.email.toLowerCase() === email,
  );
  if (!enquiry) {
    return NextResponse.json({ ok: false, message: "That enquiry could not be found." }, { status: 404 });
  }

  const entry = await getCase(reference);
  if (!entry || !["resolved", "closed"].includes(entry.status)) {
    return NextResponse.json(
      { ok: false, message: "Feedback opens once the enquiry has been resolved." },
      { status: 409 },
    );
  }

  await updateCase(reference, {
    feedback: { rating, comment: comment ?? "", at: new Date().toISOString() },
  });

  return NextResponse.json({ ok: true, message: "Thank you. Your feedback has been recorded." });
}
