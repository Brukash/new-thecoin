/**
 * Image health check for every photograph the site serves.
 *
 * Reports, for each raster image under public/:
 *   - pixel dimensions and aspect ratio
 *   - file weight on the wire
 *   - colour balance, measured from near-neutral pixels only (walls, white
 *     shirts, face highlights) rather than the frame average, so a photo full
 *     of red uniforms is not reported as a red cast
 *   - mean luminance, to catch frames that are darker or brighter than the
 *     rest of the set
 *
 * It also cross-checks the source tree: any image referenced by the app but
 * missing from public/ is an error, and any image present but referenced
 * nowhere is flagged as unreferenced (CMS-managed paths are referenced only in
 * the database, so those are advisory).
 *
 * sharp is intentionally not a project dependency — it is tooling, not runtime.
 * Install it on demand, then run the check:
 *
 *   npm i --no-save sharp
 *   npm run images:check
 *
 * Options:
 *   --dir <path>        directory to scan (default: public)
 *   --max-kb <n>        weight budget per image (default: 400)
 *   --min-width <n>     minimum width for photographs (default: 800)
 *   --cast <n>          neutral red/blue tolerance, e.g. 0.12 (default: 0.12)
 *   --strict            exit non-zero on warnings as well as errors
 *   --json              machine-readable output
 *   --help
 *
 * Exit codes: 0 clean (or warnings without --strict), 1 broken references or
 * warnings under --strict.
 */

import fs from "node:fs";
import path from "node:path";

const RASTER = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif"]);
const SKIP_DIRS = new Set(["node_modules", ".git", ".next", ".vercel", ".tmp", ".tools"]);

function parseArgs(argv) {
  const options = {
    dir: "public",
    maxKb: 400,
    minWidth: 800,
    cast: 0.12,
    strict: false,
    json: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const [flag, inline] = arg.includes("=") ? arg.split("=") : [arg, undefined];
    const value = inline ?? argv[i + 1];
    const take = () => {
      if (inline === undefined) i += 1;
      return value;
    };

    switch (flag) {
      case "--dir": options.dir = take(); break;
      case "--max-kb": options.maxKb = Number(take()); break;
      case "--min-width": options.minWidth = Number(take()); break;
      case "--cast": options.cast = Number(take()); break;
      case "--strict": options.strict = true; break;
      case "--json": options.json = true; break;
      case "--help":
      case "-h":
        console.log(fs.readFileSync(new URL(import.meta.url), "utf8").split("*/")[0].replace(/^\/\*\*\n?/, ""));
        process.exit(0);
        break;
      default:
        if (flag.startsWith("--")) {
          console.error(`Unknown option: ${flag}`);
          process.exit(2);
        }
    }
  }

  return options;
}

function walk(dir, filter) {
  const found = [];
  if (!fs.existsSync(dir)) return found;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".") && entry.isDirectory()) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      found.push(...walk(full, filter));
    } else if (filter(entry.name)) {
      found.push(full);
    }
  }

  return found;
}

/** Every asset path mentioned anywhere in the app, as the browser would request it. */
function referencedPaths() {
  const referenced = new Set();
  const sourceFiles = [
    ...walk("src", (name) => /\.(?:tsx?|jsx?|mjs|cjs|json|mdx?|css)$/.test(name)),
    ...walk("content", (name) => /\.(?:tsx?|jsx?|mjs|cjs|json|mdx?)$/.test(name)),
    ...walk("scripts", (name) => /\.(?:tsx?|jsx?|mjs|cjs|json)$/.test(name)),
  ];

  for (const file of sourceFiles) {
    const text = fs.readFileSync(file, "utf8");
    for (const match of text.matchAll(/["'`(\s](\/[A-Za-z0-9._/@-]+\.(?:jpe?g|png|webp|avif|gif))["'`)\s,;]/gi)) {
      referenced.add(match[1]);
    }
  }

  return referenced;
}

async function inspect(sharp, file) {
  const { size } = fs.statSync(file);
  const meta = await sharp(file, { failOn: "none" }).metadata();

  const { data, info } = await sharp(file, { failOn: "none" })
    .resize(320, null, { fit: "inside" })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const channels = info.channels;
  let lumaSum = 0;
  let counted = 0;
  let neutralR = 0;
  let neutralG = 0;
  let neutralB = 0;
  let neutralCount = 0;

  for (let i = 0; i < data.length; i += channels) {
    if (channels === 4 && data[i + 3] < 32) continue;

    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);

    lumaSum += 0.2126 * r + 0.7152 * g + 0.0722 * b;
    counted += 1;

    if (max < 90 || max > 250 || max === 0) continue;
    if ((max - min) / max > 0.1) continue;

    neutralR += r;
    neutralG += g;
    neutralB += b;
    neutralCount += 1;
  }

  const share = counted ? neutralCount / counted : 0;
  const neutral = neutralCount > 0
    ? { r: neutralR / neutralCount, g: neutralG / neutralCount, b: neutralB / neutralCount }
    : null;

  return {
    bytes: size,
    width: meta.width ?? 0,
    height: meta.height ?? 0,
    format: meta.format ?? path.extname(file).slice(1),
    luma: counted ? lumaSum / counted / 255 : 0,
    neutralShare: share,
    redBlue: neutral && share >= 0.002 ? neutral.r / neutral.b : null,
    greenBlue: neutral && share >= 0.002 ? neutral.g / neutral.b : null,
  };
}

function kb(bytes) {
  return `${(bytes / 1024).toFixed(bytes / 1024 >= 100 ? 0 : 1)} KB`;
}

function pad(text, width, align = "left") {
  const value = String(text);
  if (value.length >= width) return value;
  return align === "right" ? value.padStart(width) : value.padEnd(width);
}

/**
 * What the file is actually for, because the rules differ: a 560 px committee
 * portrait is correct at the size it renders, while a 560 px hero photograph
 * would be soft on a laptop. Logos and the share card are exempt from the
 * photographic checks entirely.
 */
function classify(url) {
  if (/(^|\/)(favicon|apple-touch-icon|android-chrome|coop-seal|logo)/i.test(url)) return "logo";
  if (/\/partners\//.test(url)) return "logo";
  if (/(^|\/)og-[^/]*\.(?:jpe?g|png|webp)$/i.test(url)) return "card";
  if (/\/leadership\//.test(url)) return "portrait";
  if (/(^|\/)images\//.test(url)) return "photo";
  return "asset";
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  let sharp;
  try {
    ({ default: sharp } = await import("sharp"));
  } catch {
    console.error(
      "sharp is required for this check but is not installed.\n" +
        "Install it on demand (it is intentionally not a project dependency):\n\n" +
        "  npm i --no-save sharp\n",
    );
    process.exit(2);
  }

  const referenced = referencedPaths();
  const root = path.resolve(options.dir);
  const files = walk(root, (name) => RASTER.has(path.extname(name).toLowerCase())).sort();

  const rows = [];
  const problems = [];

  for (const file of files) {
    // URLs are always reported as the browser requests them, from public/,
    // even when the scan is narrowed to a subdirectory.
    const absolute = path.resolve(file);
    const publicRoot = path.resolve("public");
    const base = absolute.startsWith(publicRoot) ? publicRoot : root;
    const url = `/${path.relative(base, absolute).split(path.sep).join("/")}`;
    const kind = classify(url);
    const photographic = kind === "photo" || kind === "portrait";

    let info;
    try {
      info = await inspect(sharp, file);
    } catch (error) {
      problems.push({ level: "error", url, message: `unreadable (${error.message.split("\n")[0]})` });
      continue;
    }

    const flags = [];
    if (info.bytes / 1024 > options.maxKb) flags.push(`over ${options.maxKb} KB`);
    if (kind === "photo" && info.width < options.minWidth) flags.push(`under ${options.minWidth} px wide`);
    if (photographic && info.redBlue !== null && Math.abs(info.redBlue - 1) > options.cast) {
      flags.push(info.redBlue > 1 ? "warm cast" : "cool cast");
    }
    if (photographic && info.luma < 0.25) flags.push("dark");
    if (photographic && info.luma > 0.92) flags.push("blown highlights");

    // CMS entries store image paths in Supabase, so unreferenced is advisory.
    const used = referenced.has(url);
    if (!used && kind !== "asset") flags.push("unreferenced");

    rows.push({ url, kind, ...info, flags, referenced: used });
  }

  for (const url of referenced) {
    const local = path.join(root, url.replace(/^\//, ""));
    if (!fs.existsSync(local) && !local.startsWith(path.join(root, ".."))) {
      problems.push({ level: "error", url, message: "referenced in source but missing on disk" });
    }
  }

  rows.sort((a, b) => b.bytes - a.bytes);

  if (options.json) {
    console.log(JSON.stringify({ options, problems, images: rows }, null, 2));
  } else {
    const totalBytes = rows.reduce((sum, row) => sum + row.bytes, 0);
    const warnCount = rows.filter((row) => row.flags.length > 0).length;
    const errorCount = problems.filter((problem) => problem.level === "error").length;

    console.log(`Image health check — ${rows.length} raster images in ${options.dir}/, ${(totalBytes / 1024 / 1024).toFixed(1)} MB total`);
    console.log(`Budget ${options.maxKb} KB per image · minimum ${options.minWidth} px wide · colour tolerance ±${options.cast} R/B\n`);

    const columns = [
      ["SIZE", "right"],
      ["IMAGE", "left"],
      ["KIND", "left"],
      ["DIMENSIONS", "left"],
      ["ASPECT", "left"],
      ["FORMAT", "left"],
      ["R/B", "right"],
      ["G/B", "right"],
      ["LUMA", "right"],
    ];

    const table = rows.map((row) => [
      kb(row.bytes),
      row.url,
      row.kind,
      `${row.width}x${row.height}`,
      row.height ? (row.width / row.height).toFixed(2) : "-",
      row.format,
      row.redBlue === null ? "-" : row.redBlue.toFixed(2),
      row.greenBlue === null ? "-" : row.greenBlue.toFixed(2),
      row.luma.toFixed(2),
    ]);

    const widths = columns.map(([heading], index) =>
      Math.max(heading.length, ...table.map((cells) => cells[index].length)),
    );

    console.log(columns.map(([heading, align], i) => pad(heading, widths[i], align)).join("  "));
    console.log(widths.map((width) => "-".repeat(width)).join("  "));

    for (const [index, row] of rows.entries()) {
      const line = table[index].map((cell, i) => pad(cell, widths[i], columns[i][1])).join("  ");
      console.log(row.flags.length ? `${line}  <${row.flags.join(", ")}>` : line);
    }

    if (problems.length) {
      console.log("\nBroken references:");
      for (const problem of problems) console.log(`  ${problem.level.toUpperCase()}  ${problem.url} — ${problem.message}`);
    }

    const counts = (flag) => rows.filter((row) => row.flags.some((f) => f.includes(flag))).length;
    console.log("\nSummary");
    console.log(`  overweight:     ${counts("over ")}`);
    console.log(`  undersized:     ${counts("under ")}`);
    console.log(`  colour cast:    ${counts("cast")}`);
    console.log(`  dark/blown:     ${counts("dark") + counts("blown")}`);
    console.log(`  unreferenced:   ${counts("unreferenced")}`);

    if (!warnCount && !errorCount) console.log("\nNo issues found.");
    else if (!errorCount) console.log(`\n${warnCount} image(s) with warnings. Advisory unless --strict is passed.`);
  }

  const errorCount = problems.filter((problem) => problem.level === "error").length;
  const warnCount = rows.filter((row) => row.flags.length > 0).length;
  process.exitCode = errorCount > 0 || (options.strict && warnCount > 0) ? 1 : 0;
}

await main();
