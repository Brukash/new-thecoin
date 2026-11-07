/**
 * Republishes the investment module into the CMS.
 *
 * The public pages read the published `rates/main` and
 * `services/investment-services` documents, so changing the source files alone
 * does not reach the site. Loans, FAQ and every other service are left alone.
 *
 * Usage: node --experimental-strip-types --env-file=.env.local scripts/update-investment.ts
 */
import { createClient } from "@supabase/supabase-js";
import { bondPlans, loanRates, rateNotice } from "../src/content/rates.ts";
import { services } from "../src/content/services.ts";

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY;

  if (!url || !key) {
    console.error("Missing Supabase credentials in .env.local");
    process.exitCode = 1;
    return;
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const investment = services.find((service) => service.slug === "investment-services");
  if (!investment) {
    console.error("investment-services is missing from the service catalogue");
    process.exitCode = 1;
    return;
  }

  const { data: current, error: readError } = await supabase
    .from("content_entries")
    .select("data")
    .eq("collection", "rates")
    .eq("slug", "main")
    .maybeSingle();

  if (readError) {
    console.error("Could not read the published rates:", readError.message);
    process.exitCode = 1;
    return;
  }

  const rates = {
    ...((current?.data as Record<string, unknown> | null) ?? {}),
    notice: rateNotice,
    bondPlans,
    loanRates,
  };

  for (const [collection, slug, data] of [
    ["rates", "main", rates],
    ["services", "investment-services", investment],
  ] as const) {
    const { error } = await supabase
      .from("content_entries")
      .update({ data, updated_at: new Date().toISOString() })
      .eq("collection", collection)
      .eq("slug", slug);

    if (error) {
      console.error(`${collection}/${slug} failed:`, error.message);
      process.exitCode = 1;
      return;
    }

    console.log(`${collection}/${slug} updated`);
  }

  // The public FAQ is a CMS document as well, and three answers describe the
  // superseded series structure.
  const { data: faqRow, error: faqReadError } = await supabase
    .from("content_entries")
    .select("data")
    .eq("collection", "faq")
    .eq("slug", "main")
    .maybeSingle();

  if (faqReadError) {
    console.error("Could not read the published FAQ:", faqReadError.message);
    process.exitCode = 1;
    return;
  }

  const faq = faqRow?.data as {
    groups?: { title: string; items: { q: string; a: string }[] }[];
  } | null;

  const answers: { match: RegExp; q?: string; a: string }[] = [
    {
      match: /Classic Excel/i,
      q: "Which investment series can I subscribe to?",
      a: "Three four-year series are open: Classic Diamond (2024–2028, maturing January 2028), Classic Excel (2025–2029, maturing January 2029) and the Classic Investment Fund (2025–2029, maturing September 2029). The Classic Triple Plan is a short-term option running for three, six or twelve months.",
    },
    {
      match: /penalty for early liquidation/i,
      a: "Under the Diamond and Excel series, liquidating without 90 days' notice attracts a charge of 50% of total interest earned, and 25% of the interest paid upfront on the front-end option. The Classic Investment Fund applies a 40% charge and requires 90 days' notice, without which a further 10% applies.",
    },
    {
      match: /What is the tenor/i,
      a: "The four-year series run to their published maturities: January 2028 for Classic Diamond, January 2029 for Classic Excel and September 2029 for the Classic Investment Fund. The Classic Triple Plan runs for three, six or twelve months.",
    },
  ];

  let changed = 0;
  for (const group of faq?.groups ?? []) {
    for (const item of group.items) {
      const replacement = answers.find((entry) => entry.match.test(item.q));
      if (!replacement) continue;
      if (replacement.q) item.q = replacement.q;
      item.a = replacement.a;
      changed += 1;
    }
  }

  if (changed > 0) {
    const { error } = await supabase
      .from("content_entries")
      .update({ data: faq, updated_at: new Date().toISOString() })
      .eq("collection", "faq")
      .eq("slug", "main");

    if (error) {
      console.error("faq/main failed:", error.message);
      process.exitCode = 1;
      return;
    }

    console.log(`faq/main updated (${changed} answers)`);
  } else {
    console.log("faq/main unchanged — no matching questions");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
