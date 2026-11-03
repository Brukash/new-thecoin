/**
 * Regenerates every favicon and app icon from the Cooperative seal.
 *
 * Source of truth: public/images/logo.png — the Society's official 828×178
 * lockup. The circular seal occupies the full height of that artwork at its
 * left edge, so the seal is cropped as a square of exactly that height,
 * anchored on its own alpha bounds. Nothing is stretched, and the wordmark
 * ("The Coin") that follows the seal is never included.
 *
 * The seal's original transparency is preserved in the .ico and PNG favicons.
 * iOS and Android ignore transparency on home-screen icons, so those two are
 * composited on the brand navy.
 *
 * Requires sharp, deliberately NOT a project dependency because it is only
 * needed when icons are regenerated:
 *
 *   npm i --no-save sharp
 *   node scripts/generate-favicons.mjs
 *
 * Outputs (all in public/):
 *   favicon.ico (16/32/48), favicon-16x16.png, favicon-32x32.png,
 *   favicon-96x96.png, apple-touch-icon.png, android-chrome-192x192.png,
 *   android-chrome-512x512.png, images/coop-seal.png (master copy)
 */

import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const NAVY = "#0a1628";
const SRC = "public/images/logo.png";
const out = (name) => path.join("public", name);

const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

/** Alpha bounds of the seal itself, scanning only the left portion of the lockup. */
function sealBounds(data, width, height, limitX) {
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < Math.min(width, limitX); x += 1) {
      if (data[(y * width + x) * 4 + 3] > 32) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  return { minX, minY, maxX, maxY };
}

const bounds = sealBounds(data, info.width, info.height, 185);
const side = bounds.maxY - bounds.minY + 1;

const pad = Math.round(side * 0.025);
const canvas = side + pad * 2;
const seal = await sharp(SRC)
  .extract({ left: bounds.minX, top: bounds.minY, width: side, height: side })
  .extend({ top: pad, bottom: pad, left: pad, right: pad, background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer();

fs.writeFileSync(out("images/coop-seal.png"), seal);

const render = (size) =>
  sharp(seal)
    .resize(size, size, {
      kernel: "lanczos3",
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .sharpen({ sigma: size >= 180 ? 0.7 : 0.5 })
    .png({ compressionLevel: 9 })
    .toBuffer();

const buffers = {};
for (const size of [16, 32, 48, 96, 180, 192, 512]) {
  buffers[size] = await render(size);
}

/** iOS ignores transparency and Android masks the launcher icon, so both sit on navy. */
async function onNavy(size, ratio) {
  const inner = Math.round(size * ratio);
  const inset = await sharp(seal)
    .resize(inner, inner, { kernel: "lanczos3" })
    .sharpen({ sigma: 0.7 })
    .png()
    .toBuffer();
  const offset = Math.round((size - inner) / 2);

  return sharp({ create: { width: size, height: size, channels: 4, background: NAVY } })
    .composite([{ input: inset, left: offset, top: offset }])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

fs.writeFileSync(out("favicon-16x16.png"), buffers[16]);
fs.writeFileSync(out("favicon-32x32.png"), buffers[32]);
fs.writeFileSync(out("favicon-96x96.png"), buffers[96]);
fs.writeFileSync(out("apple-touch-icon.png"), await onNavy(180, 0.84));
fs.writeFileSync(out("android-chrome-192x192.png"), await onNavy(192, 0.82));
fs.writeFileSync(out("android-chrome-512x512.png"), await onNavy(512, 0.82));

// favicon.ico: 16/32/48 PNG payloads under an ICONDIR header.
const icoSizes = [16, 32, 48];
const payloads = icoSizes.map((size) => buffers[size]);
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(icoSizes.length, 4);

let offset = 6 + 16 * icoSizes.length;
const entries = icoSizes.map((size, index) => {
  const entry = Buffer.alloc(16);
  entry[0] = size;
  entry[1] = size;
  entry.writeUInt16LE(1, 4);
  entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(payloads[index].length, 8);
  entry.writeUInt32LE(offset, 12);
  offset += payloads[index].length;
  return entry;
});

fs.writeFileSync(out("favicon.ico"), Buffer.concat([header, ...entries, ...payloads]));

console.log(`Seal cropped ${side}×${side} from ${SRC} at ${bounds.minX},${bounds.minY}`);
console.log("Wrote favicon.ico, 16/32/96 PNGs, apple-touch-icon, android 192/512, coop-seal master");
