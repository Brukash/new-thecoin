import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/* --------------------------------------------------------------------------
 * Staff console authentication
 *
 * A single shared staff password (ADMIN_PASSWORD) is exchanged for a signed,
 * HttpOnly, SameSite=Strict cookie valid for eight hours. The cookie is an
 * HMAC of its own expiry, signed with SESSION_SECRET, so it cannot be forged
 * even though it carries no server-side session record.
 *
 * This is deliberately simple: the console edits published copy only, never
 * member or financial records. See docs/07-security.md.
 * ------------------------------------------------------------------------ */

export const ADMIN_COOKIE = "coop_admin";
const SESSION_MS = 8 * 60 * 60 * 1000;

function secret(): string {
  return process.env.SESSION_SECRET ?? "";
}

function password(): string {
  return process.env.ADMIN_PASSWORD ?? "";
}

export function isAdminConfigured(): boolean {
  return password().length >= 8 && secret().length >= 16;
}

function digest(value: string): Buffer {
  return createHash("sha256").update(value, "utf8").digest();
}

export function verifyPassword(input: string): boolean {
  if (!isAdminConfigured()) return false;
  const expected = digest(password());
  const candidate = digest(input);
  return timingSafeEqual(expected, candidate);
}

function sign(expires: string): string {
  return createHmac("sha256", secret()).update(expires, "utf8").digest("hex");
}

function issueToken(): string {
  const expires = String(Date.now() + SESSION_MS);
  return `${expires}.${sign(expires)}`;
}

function tokenIsValid(token: string | undefined): boolean {
  if (!token || !isAdminConfigured()) return false;
  const [expires, signature] = token.split(".");
  if (!expires || !signature) return false;
  if (Number(expires) < Date.now()) return false;

  const expected = sign(expires);
  if (expected.length !== signature.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

export async function isSignedIn(): Promise<boolean> {
  const jar = await cookies();
  return tokenIsValid(jar.get(ADMIN_COOKIE)?.value);
}

export async function createSession(): Promise<void> {
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, issueToken(), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge: SESSION_MS / 1000,
  });
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
}
