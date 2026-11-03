import fs from "node:fs/promises";
import path from "node:path";

/* --------------------------------------------------------------------------
 * Server-side security helpers.
 *
 * - In-memory rate limiting (per process). On a multi-instance deployment this
 *   should be replaced with a shared store; see docs/07-security.md.
 * - Append-only JSON line storage for form submissions.
 * ------------------------------------------------------------------------ */

const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (bucket.count >= limit) return false;

  bucket.count += 1;
  return true;
}

/** Best-effort client identifier. Behind a proxy, use the left-most forwarded address. */
export function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

function dataDir(): string {
  return path.join(process.cwd(), "data", "submissions");
}

/** Append one JSON record to <collection>.jsonl, creating the directory if needed. */
export async function appendRecord(
  collection: string,
  record: Record<string, unknown>,
): Promise<void> {
  const dir = dataDir();
  await fs.mkdir(dir, { recursive: true });
  await fs.appendFile(
    path.join(dir, `${collection}.jsonl`),
    `${JSON.stringify(record)}\n`,
    "utf8",
  );
}

/** Read all records from a collection. Returns [] when the file does not exist yet. */
export async function readRecords<T>(collection: string): Promise<T[]> {
  try {
    const raw = await fs.readFile(path.join(dataDir(), `${collection}.jsonl`), "utf8");
    return raw
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line) as T);
  } catch {
    return [];
  }
}
