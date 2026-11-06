#!/usr/bin/env node
/**
 * Partner logo fetcher (one-off, run manually).
 *
 * For each organisation it loads the official homepage, looks for the header
 * logo (img/svg, og:image, apple-touch-icon), downloads the best candidate and
 * writes it into public/images/partners/.
 *
 * Nothing is hotlinked: every asset is stored locally. The script prints a
 * machine-readable line per organisation and writes a manifest with the exact
 * source URL, content type and pixel dimensions so the result can be audited.
 *
 * Usage: node scripts/fetch-partner-logos.mjs [slug ...]
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = path.join(process.cwd(), "public", "images", "partners");
const MANIFEST = path.join(process.cwd(), ".partner-logos.json");
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36";

const TARGETS = [
  { slug: "gtbank", name: "GTBank", sites: ["https://www.gtbank.com/"] },
  { slug: "fidelity-bank", name: "Fidelity Bank", sites: ["https://www.fidelitybank.ng/"] },
  { slug: "first-bank", name: "First Bank", sites: ["https://www.firstbanknigeria.com/"] },
  { slug: "zenith-bank", name: "Zenith Bank", sites: ["https://www.zenithbank.com/"] },
  { slug: "uba", name: "UBA", sites: ["https://www.ubagroup.com/"] },
  { slug: "arm", name: "ARM", sites: ["https://www.armgroup.com/"] },
  { slug: "trustbanc", name: "TrustBanc", sites: ["https://www.trustbancgroup.com/"] },
  { slug: "cordros", name: "Cordros", sites: ["https://www.cordros.com/"] },
  { slug: "cowry", name: "Cowry", sites: ["https://www.cowryasset.com/"] },
  { slug: "norrenberger", name: "Norrenberger", sites: ["https://www.norrenberger.com/"] },
  { slug: "alpha-morgan", name: "Alpha Morgan", sites: ["https://www.alphamorgan.com/"] },
  { slug: "apel", name: "APEL", sites: ["https://www.apel.com.ng/"] },
  { slug: "dlm", name: "DLM", sites: ["https://www.dlmcapitalgroup.com/"] },
  { slug: "united-capital", name: "United Capital", sites: ["https://www.unitedcapitalplc.com/"] },
  { slug: "first-icon", name: "First Icon", sites: ["https://firsticon.com/"] },
  { slug: "tatum", name: "Tatum", sites: ["https://www.tatumbank.com/"] },
  { slug: "union-bank", name: "Union Bank", sites: ["https://www.unionbankng.com/"] },
  { slug: "wealthbridge", name: "WealthBridge", sites: ["https://www.wealthbridge.com.ng/"] },
  { slug: "alpha-10", name: "Alpha 10", sites: ["https://alpha10group.com/"] },
  { slug: "radix", name: "Radix", sites: ["https://radixng.com/"] },
  { slug: "nirsal", name: "NIRSAL", sites: ["https://www.nirsal.com/"] },
];

async function get(url, opts = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    return await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: { "user-agent": UA, accept: "*/*", ...(opts.headers ?? {}) },
    });
  } finally {
    clearTimeout(timer);
  }
}

function absolute(base, value) {
  try {
    return new URL(value, base).toString();
  } catch {
    return "";
  }
}

function score(url, alt = "") {
  const v = `${url} ${alt}`.toLowerCase();
  let s = 0;
  if (/\.svg(\?|$)/.test(v)) s += 25;
  if (/logo/.test(v)) s += 30;
  if (/brand/.test(v)) s += 10;
  if (/og[-_]?image/.test(v)) s += 4;
  if (/(favicon|sprite|placeholder|loader|spinner|arrow|search)/.test(v)) s -= 40;
  if (/(white|light)[-_]?logo/.test(v)) s -= 8; // unreadable on a white tile
  return s;
}

function candidates(html, base) {
  const found = new Map();

  const push = (raw, alt = "", bonus = 0) => {
    const url = absolute(base, raw);
    if (!url || !/^https?:/.test(url)) return;
    if (!/\.(svg|png|jpe?g|webp)(\?|$)/i.test(url) && !url.includes("image")) return;
    const entry = found.get(url) ?? { url, alt, bonus };
    entry.bonus = Math.max(entry.bonus, bonus);
    found.set(url, entry);
  };

  for (const tag of html.match(/<img\b[^>]*>/gi) ?? []) {
    const src = tag.match(/\b(?:src|data-src|data-lazy-src)\s*=\s*["']([^"']+)["']/i);
    if (!src) continue;
    const alt = tag.match(/\balt\s*=\s*["']([^"']*)["']/i)?.[1] ?? "";
    const cls = tag.match(/\bclass\s*=\s*["']([^"']*)["']/i)?.[1] ?? "";
    push(src[1], `${alt} ${cls}`, /\blogo|brand\b/i.test(`${alt} ${cls}`) ? 6 : 0);
  }

  for (const link of html.match(/<link\b[^>]*>/gi) ?? []) {
    if (!/apple-touch-icon/i.test(link)) continue;
    const href = link.match(/\bhref\s*=\s*["']([^"']+)["']/i)?.[1];
    if (href) push(href, "apple-touch-icon", -2);
  }

  const og = html.match(/<meta\b[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)?.at(1);
  if (og) push(og, "og:image", 1);

  return [...found.values()]
    .map((item) => ({ ...item, total: score(item.url, item.alt) + item.bonus }))
    .filter((item) => item.total > 0)
    .sort((a, b) => b.total - a.total);
}

function dimensions(buffer, type) {
  if (type === "png" && buffer.length > 24) {
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  }
  if (type === "jpeg") {
    let offset = 2;
    while (offset + 9 < buffer.length) {
      if (buffer[offset] !== 0xff) {
        offset += 1;
        continue;
      }
      const marker = buffer[offset + 1];
      const length = buffer.readUInt16BE(offset + 2);
      if (marker >= 0xc0 && marker <= 0xc3) {
        return { height: buffer.readUInt16BE(offset + 5), width: buffer.readUInt16BE(offset + 7) };
      }
      offset += 2 + length;
    }
  }
  return { width: 0, height: 0 };
}

function sniff(buffer, contentType) {
  const head = buffer.subarray(0, 400).toString("utf8").trim();
  if (head.startsWith("<svg") || (head.startsWith("<?xml") && head.includes("<svg"))) return "svg";
  if (buffer[0] === 0x89 && buffer[1] === 0x50) return "png";
  if (buffer[0] === 0xff && buffer[1] === 0xd8) return "jpg";
  if (head.startsWith("RIFF") && head.includes("WEBP")) return "webp";
  if (/svg/.test(contentType)) return "svg";
  if (/png/.test(contentType)) return "png";
  if (/jpe?g/.test(contentType)) return "jpg";
  return "";
}

async function download(url) {
  const response = await get(url, { headers: { accept: "image/svg+xml,image/png,image/jpeg,image/*;q=0.8" } });
  if (!response.ok) return { error: `http ${response.status}` };
  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.length < 700) return { error: `too small (${buffer.length} bytes)` };
  const format = sniff(buffer, response.headers.get("content-type") ?? "");
  if (!format) return { error: "not an image" };
  const size = format === "svg" ? { width: 0, height: 0 } : dimensions(buffer, format);
  return { buffer, format, ...size, finalUrl: response.url || url };
}

const only = process.argv.slice(2);
const manifest = [];
await mkdir(OUT_DIR, { recursive: true });

for (const target of TARGETS) {
  if (only.length && !only.includes(target.slug)) continue;

  let saved = null;
  const attempts = [];

  for (const site of target.sites) {
    let html = "";
    try {
      const response = await get(site);
      attempts.push(`${site} → ${response.status}`);
      if (!response.ok) continue;
      html = await response.text();
      const list = candidates(html, response.url || site);
      for (const candidate of list.slice(0, 6)) {
        const asset = await download(candidate.url);
        if (asset.error) {
          attempts.push(`  ${candidate.url} (${asset.error})`);
          continue;
        }
        saved = { ...asset, sourcePage: site, sourceUrl: candidate.url };
        break;
      }
    } catch (error) {
      attempts.push(`${site} → ${error?.message ?? "error"}`);
    }
    if (saved) break;
  }

  if (saved) {
    const file = path.join(OUT_DIR, `${target.slug}.${saved.format}`);
    await writeFile(file, saved.buffer);
    manifest.push({
      slug: target.slug,
      name: target.name,
      file: `/images/partners/${target.slug}.${saved.format}`,
      format: saved.format,
      bytes: saved.buffer.length,
      width: saved.width,
      height: saved.height,
      sourcePage: saved.sourcePage,
      sourceUrl: saved.sourceUrl,
      status: "downloaded",
    });
    console.log(`OK   ${target.slug}.${saved.format}  ${saved.width}x${saved.height}  ${saved.sourceUrl}`);
  } else {
    manifest.push({ slug: target.slug, name: target.name, status: "missing", attempts });
    console.log(`MISS ${target.slug}  ${attempts.join(" | ").slice(0, 220)}`);
  }
}

await writeFile(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`\n${manifest.filter((m) => m.status === "downloaded").length}/${manifest.length} downloaded`);
