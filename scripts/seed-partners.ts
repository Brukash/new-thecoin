/**
 * Seeds the partners directory.
 *
 * Run with: npm run cms:seed:partners
 * Upserts by slug, so re-running updates the seeded rows and leaves anything
 * an administrator added or edited in place (same slug = same organisation).
 */

import { createClient } from "@supabase/supabase-js";
import { seedPartners } from "../src/content/partners.ts";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

if (!url || !serviceKey) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.");
  process.exit(1);
}

const client = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const rows = seedPartners.map((partner) => ({
  organisation_name: partner.organisationName,
  slug: partner.slug,
  logo_url: partner.logoUrl,
  website_url: partner.websiteUrl,
  description: partner.description,
  category: partner.category,
  display_order: partner.displayOrder,
  is_active: partner.active,
}));

const { data, error } = await client
  .from("partners")
  .upsert(rows, { onConflict: "slug" })
  .select("slug, is_active");

if (error) {
  console.error("Seeding failed:", error.message);
  process.exit(1);
}

const withLogo = rows.filter((row) => row.logo_url).length;
console.log(`Seeded ${data?.length ?? 0} partners (${withLogo} with a logo file).`);
