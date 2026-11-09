import "server-only";

/* --------------------------------------------------------------------------
 * Upload validation.
 *
 * The browser-supplied `File.type` is only a hint: a script can set it to
 * anything. Every upload is therefore checked against the bytes on the server
 * before it is written to a public bucket, so a renamed HTML file cannot be
 * stored as an "image" and served back from the storage domain.
 * ------------------------------------------------------------------------ */

const MAX_TEXT_BYTES = 512 * 1024;

/** Markup that must never appear in an SVG served from a public bucket. */
const ACTIVE_SVG = /<script|on[a-z]+\s*=|javascript:|<foreignObject|<iframe|<!ENTITY/i;

function startsWith(buffer: Buffer, bytes: number[]): boolean {
  if (buffer.length < bytes.length) return false;
  return bytes.every((byte, index) => buffer[index] === byte);
}

function isJpeg(buffer: Buffer): boolean {
  return startsWith(buffer, [0xff, 0xd8, 0xff]);
}

function isPng(buffer: Buffer): boolean {
  return startsWith(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
}

function isWebp(buffer: Buffer): boolean {
  return (
    buffer.length > 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  );
}

function isAvif(buffer: Buffer): boolean {
  if (buffer.length < 12 || buffer.toString("ascii", 4, 8) !== "ftyp") return false;
  const brand = buffer.toString("ascii", 8, 12);
  return brand === "avif" || brand === "avis" || brand === "mif1";
}

function isPdf(buffer: Buffer): boolean {
  return buffer.length > 5 && buffer.toString("ascii", 0, 5) === "%PDF-";
}

function isSafeSvg(buffer: Buffer): boolean {
  if (buffer.length > MAX_TEXT_BYTES) return false;

  const text = buffer.toString("utf8").trim();
  const opensAsSvg =
    /^<svg[\s>]/i.test(text) || /^<\?xml[\s\S]{0,400}?<svg[\s>]/i.test(text);
  if (!opensAsSvg) return false;

  return !ACTIVE_SVG.test(text);
}

const CHECKS: Record<string, (buffer: Buffer) => boolean> = {
  "image/jpeg": isJpeg,
  "image/png": isPng,
  "image/webp": isWebp,
  "image/avif": isAvif,
  "image/svg+xml": isSafeSvg,
  "application/pdf": isPdf,
};

/**
 * Reads an upload and proves the bytes match the declared type.
 * Throws when they do not, so the caller never stores an unverified file.
 */
export async function readVerifiedUpload(file: File, declaredType: string): Promise<Buffer> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const check = CHECKS[declaredType];

  if (!check || !check(buffer)) {
    throw new Error("That file's contents do not match its type, so it was not stored.");
  }

  return buffer;
}
