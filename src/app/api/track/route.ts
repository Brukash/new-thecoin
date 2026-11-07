import { NextResponse } from "next/server";
import { appendRecord, clientKey, rateLimit } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Records one anonymous page view. Deliberately minimal: a path, a timestamp and
 * nothing that identifies the visitor. Paths are normalised so a query string
 * cannot be used to fill the store with arbitrary keys.
 */
export async function POST(request: Request) {
  if (!rateLimit(`track:${clientKey(request)}`, 60, 60_000)) {
    return new NextResponse(null, { status: 204 });
  }

  let payload: { path?: unknown };
  try {
    payload = (await request.json()) as { path?: unknown };
  } catch {
    return new NextResponse(null, { status: 204 });
  }

  const path = typeof payload.path === "string" ? payload.path : "";
  const clean = path.split("?")[0].split("#")[0].slice(0, 120);

  if (!clean.startsWith("/") || clean.startsWith("/admin") || clean.startsWith("/api")) {
    return new NextResponse(null, { status: 204 });
  }

  try {
    await appendRecord("pageviews", { path: clean, at: new Date().toISOString() });
  } catch (error) {
    console.error("Failed to record page view", error);
  }

  return new NextResponse(null, { status: 204 });
}
