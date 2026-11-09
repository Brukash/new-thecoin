import { NextResponse } from "next/server";
import { answerQuestion, assistantConfigured, type ChatMessage } from "@/lib/assistant";

export const runtime = "nodejs";

/**
 * Assistant endpoint. Same-origin only: the widget posts here from the site, and
 * no other origin is allowed to spend the Society's provider credits.
 */

const WINDOW_MS = 60 * 60 * 1000;
const LIMIT = 30;
const buckets = new Map<string, { count: number; resetAt: number }>();

function overLimit(key: string): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  bucket.count += 1;
  return bucket.count > LIMIT;
}

/**
 * Strict same-origin check. A missing Origin used to be accepted, which let
 * any script call this paid endpoint without a browser; now the request has to
 * prove it came from a page on this host, through Origin, Fetch Metadata or
 * Referer. No proof means no answer.
 */
function sameOrigin(request: Request): boolean {
  const host = request.headers.get("host");
  if (!host) return false;

  const origin = request.headers.get("origin");
  if (origin) {
    try {
      return new URL(origin).host === host;
    } catch {
      return false;
    }
  }

  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin") return false;

  const referer = request.headers.get("referer");
  if (referer) {
    try {
      return new URL(referer).host === host;
    } catch {
      return false;
    }
  }

  return false;
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) {
    return NextResponse.json({ ok: false, message: "Requests must come from this website." }, { status: 403 });
  }

  const forwarded = request.headers.get("x-forwarded-for");
  const key = forwarded?.split(",")[0]?.trim() || "local";

  if (overLimit(key)) {
    return NextResponse.json(
      { ok: false, message: "You have asked a lot of questions. Please try again later, or contact the Secretariat." },
      { status: 429 },
    );
  }

  if (!assistantConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        configured: false,
        message:
          "The assistant is not connected yet. Please call 0909 679 7982 or email info@cbncoopng.com and the Secretariat will help.",
      },
      { status: 503 },
    );
  }

  let payload: { messages?: unknown };
  try {
    payload = (await request.json()) as { messages?: unknown };
  } catch {
    return NextResponse.json({ ok: false, message: "That request could not be read." }, { status: 400 });
  }

  const messages: ChatMessage[] = Array.isArray(payload.messages)
    ? payload.messages
        .filter(
          (item): item is ChatMessage =>
            typeof item === "object" &&
            item !== null &&
            ((item as ChatMessage).role === "user" || (item as ChatMessage).role === "assistant") &&
            typeof (item as ChatMessage).content === "string",
        )
        .map((item) => ({ role: item.role, content: item.content.slice(0, 1200) }))
        .slice(-10)
    : [];

  if (!messages.some((message) => message.role === "user")) {
    return NextResponse.json({ ok: false, message: "Ask a question to begin." }, { status: 400 });
  }

  try {
    const reply = await answerQuestion(messages);
    return NextResponse.json({ ok: true, reply });
  } catch (error) {
    console.error("Assistant request failed", error instanceof Error ? error.message : "unknown");
    return NextResponse.json(
      {
        ok: false,
        message:
          "The assistant could not answer just now. Please call 0909 679 7982 or email info@cbncoopng.com.",
      },
      { status: 502 },
    );
  }
}
