/**
 * Seeds the events module.
 *
 * Only facts supplied by the Society are written. Opening hours, registration
 * conditions, exhibitors and programme details are deliberately left empty:
 * the event is created as a draft for an administrator to complete and approve.
 *
 * Usage: npm run cms:seed:events
 */

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.");
  process.exit(1);
}

const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

const categories = [
  ["Annual General Meetings", "annual-general-meetings", 10],
  ["Sales and Exhibitions", "sales-and-exhibitions", 20],
  ["International Day of Cooperatives", "international-day-of-cooperatives", 30],
  ["Property Project Launches", "property-project-launches", 40],
  ["Investment Seminars", "investment-seminars", 50],
  ["Members' Engagement Meetings", "members-engagement-meetings", 60],
  ["Training Programmes", "training-programmes", 70],
  ["Cooperative Conferences", "cooperative-conferences", 80],
  ["Other Events", "other-events", 90],
] as const;

const { data: categoryRows, error: categoryError } = await client
  .from("event_categories")
  .upsert(
    categories.map(([name, slug, display_order]) => ({ name, slug, display_order })),
    { onConflict: "slug" },
  )
  .select("id, slug");

if (categoryError) {
  console.error("Categories:", categoryError.message);
  process.exit(1);
}

const sales = categoryRows?.find((row) => row.slug === "sales-and-exhibitions");
const other = categoryRows?.find((row) => row.slug === "other-events");

const start = new Date("2026-11-30T00:00:00+01:00").toISOString();
const end = new Date("2026-12-05T23:59:00+01:00").toISOString();

const event = {
  title: "2026 End of Year Sales and Exhibition",
  slug: "2026-end-of-year-sales-exhibition",
  category_id: sales?.id ?? null,
  edition: "8th Edition",
  short_description:
    "The 8th edition of the Society's annual end-of-year sales and exhibition, held at the National Ecumenical Centre Car Park in Abuja's Central Business District.",
  full_description:
    "The CBN Cooperative End of Year Sales and Exhibition returns for its 8th edition, running from Monday, 30 November 2026 to Saturday, 5 December 2026 at the National Ecumenical Centre Car Park, Sani Abacha Way, Central Business District, Abuja.\n\nFormal opening hours, the exhibitor list and the programme will be published here once the organising committee confirms them.",
  objectives: [],
  exhibitors: [],
  start_date: "2026-11-30",
  end_date: "2026-12-05",
  start_time: null,
  end_time: null,
  timezone: "Africa/Lagos",
  starts_at: start,
  ends_at: end,
  venue_name: "National Ecumenical Centre Car Park",
  venue_address: "Sani Abacha Way, Central Business District, Abuja",
  maps_url: "",
  online_event_url: "",
  banner_url: "",
  poster_url: "",
  brochure_url: "",
  programme_url: "",
  registration_required: false,
  registration_url: "",
  registration_deadline: null,
  enquiry_email: "info@cbncoopng.com",
  contact_phone: "0909 679 7982",
  publication_status: "published",
  event_status: "scheduled",
  is_featured: true,
  display_order: 0,
  promotion_start: null,
  promotion_end: null,
  seo_title: "2026 End of Year Sales and Exhibition, 8th Edition",
  seo_description:
    "The 8th CBN Cooperative End of Year Sales and Exhibition, 30 November to 5 December 2026, National Ecumenical Centre Car Park, Sani Abacha Way, Central Business District, Abuja.",
  published_at: new Date().toISOString(),
};

// The first event the Society has published. Only the title and the
// commencement date have been announced, so no venue, time, registration or
// programme details are recorded.
const foodDistribution = {
  title: "2026 CBN Cooperative Nationwide Food Distribution Exercise",
  slug: "2026-nationwide-food-distribution-exercise",
  category_id: other?.id ?? null,
  edition: "",
  short_description:
    "The CBN Cooperative Nationwide Food Distribution Exercise begins on Monday, 9 November 2026.",
  full_description:
    "The 2026 CBN Cooperative Nationwide Food Distribution Exercise begins on Monday, 9 November 2026.\n\nThe exercise covers the Society's members nationwide. Distribution venues, times and arrangements will be published here once they are confirmed by the Society.",
  objectives: [],
  exhibitors: [],
  start_date: "2026-11-09",
  end_date: null,
  start_time: null,
  end_time: null,
  timezone: "Africa/Lagos",
  starts_at: null,
  ends_at: null,
  venue_name: "",
  venue_address: "",
  maps_url: "",
  online_event_url: "",
  banner_url: "",
  poster_url: "",
  brochure_url: "",
  programme_url: "",
  registration_required: false,
  registration_url: "",
  registration_deadline: null,
  enquiry_email: "info@cbncoopng.com",
  contact_phone: "0909 679 7982",
  publication_status: "published",
  event_status: "scheduled",
  is_featured: false,
  display_order: 0,
  promotion_start: null,
  promotion_end: null,
  seo_title: "2026 CBN Cooperative Nationwide Food Distribution Exercise",
  seo_description:
    "The CBN Cooperative Nationwide Food Distribution Exercise begins on Monday, 9 November 2026. Venues and times will be published by the Society.",
  published_at: new Date().toISOString(),
};

const { data, error } = await client
  .from("events")
  .upsert([event, foodDistribution], { onConflict: "slug" })
  .select("slug, publication_status");

if (error) {
  console.error("Events:", error.message);
  process.exit(1);
}

console.log("Categories:", categoryRows?.length ?? 0);
for (const row of data ?? []) {
  console.log("Event:", row.slug, row.publication_status);
}
