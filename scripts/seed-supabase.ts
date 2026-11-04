/**
 * Seeds Supabase with the verified content currently bundled in the repository.
 *
 *   node --experimental-strip-types --env-file=.env.local scripts/seed-supabase.ts
 *
 * Safe to run more than once: entries are upserted on (collection, slug).
 * Nothing is deleted, and every seeded document is published.
 */
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { site } from "../src/content/site.ts";
import { services } from "../src/content/services.ts";
import { faqGroups } from "../src/content/faq.ts";
import { bondPlans, loanRates, rateNotice } from "../src/content/rates.ts";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Add both to .env.local first.",
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

type Collection = "settings" | "news" | "projects" | "services" | "faq" | "rates" | "credit-policy";

let written = 0;

async function upsert(collection: Collection, slug: string, data: unknown): Promise<void> {
  const { error } = await supabase
    .from("content_entries")
    .upsert({ collection, slug, data, status: "published" }, { onConflict: "collection,slug" });

  if (error) {
    console.error(`Failed: ${collection}/${slug}: ${error.message}`);
    process.exitCode = 1;
    return;
  }

  written += 1;
  console.log(`  ${collection}/${slug}`);
}

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), "content", file), "utf8")) as T;
}

console.log("Seeding Supabase content");

await upsert("settings", "main", site);
for (const service of services) await upsert("services", service.slug, service);
await upsert("faq", "main", { groups: faqGroups });
await upsert("rates", "main", { notice: rateNotice, bondPlans, loanRates });

const policy = readJson<Record<string, unknown>>("credit-policy.json");
await upsert("credit-policy", "main", policy);

const news = readJson<{ articles: { slug: string }[] }>("news.json");
for (const article of news.articles) await upsert("news", article.slug, article);

const projects = readJson<{ projects: { slug: string }[] }>("projects.json");
for (const project of projects.projects) await upsert("projects", project.slug, project);

console.log(`Done. ${written} documents written.`);
if (process.exitCode) {
  console.error("Some documents were not written; check the messages above.");
}
