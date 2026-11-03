import { NextResponse } from "next/server";
import { z } from "zod";
import { appendRecord, clientKey, rateLimit, readRecords } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  email: z.string().trim().toLowerCase().email("Please enter a valid email address.").max(200),
});

export async function POST(request: Request) {
  const key = clientKey(request);
  if (!rateLimit(`newsletter:${key}`, 5, 10 * 60_000)) {
    return NextResponse.json(
      { ok: false, message: "Too many attempts. Please try again shortly." },
      { status: 429 },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request body." }, { status: 400 });
  }

  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid email address." },
      { status: 422 },
    );
  }

  const { email } = parsed.data;

  try {
    const existing = await readRecords<{ email: string }>("newsletter");
    if (existing.some((record) => record.email === email)) {
      return NextResponse.json({ ok: true, message: "That address is already subscribed." });
    }

    await appendRecord("newsletter", { email, subscribedAt: new Date().toISOString() });
  } catch (error) {
    console.error("Failed to store newsletter subscription", error);
    return NextResponse.json(
      { ok: false, message: "We could not record that address. Please try again." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, message: "Thank you. You are on the list." });
}
