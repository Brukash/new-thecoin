import "server-only";
import { createServiceClient } from "@/lib/supabase/server";
import { readVerifiedUpload } from "@/lib/uploads";
import { hasServiceRole } from "@/lib/supabase/config";
import { seedPartners, type PartnerCategory } from "@/content/partners";
import type { StaffUser } from "./auth";
import { logAudit } from "./store";

/**
 * Partners directory.
 *
 * Stored in `public.partners`, one row per organisation, so an administrator
 * can add, edit, reorder, deactivate or delete entries without a developer.
 * Row level security lets anonymous visitors read active rows only; every
 * write here runs on the server with the service role after `requireStaff()`.
 *
 * When Supabase is not configured the seeded directory is read-only so the
 * site still renders locally.
 */

export type Partner = {
  id: string;
  organisationName: string;
  slug: string;
  logoUrl: string;
  websiteUrl: string;
  description: string;
  category: PartnerCategory | string;
  displayOrder: number;
  active: boolean;
  logoBackground: "light" | "dark";
  updatedAt?: string;
};

type Row = {
  id: string;
  organisation_name: string;
  slug: string;
  logo_url: string;
  website_url: string;
  description: string;
  category: string;
  display_order: number;
  is_active: boolean;
  updated_at: string;
};

const COLUMNS =
  "id, organisation_name, slug, logo_url, website_url, description, category, display_order, is_active, updated_at";

function mapRow(row: Row): Partner {
  return {
    id: row.id,
    organisationName: row.organisation_name,
    slug: row.slug,
    logoUrl: row.logo_url ?? "",
    websiteUrl: row.website_url ?? "",
    description: row.description ?? "",
    category: row.category,
    displayOrder: Number(row.display_order ?? 0),
    active: Boolean(row.is_active),
    // Alpha10 supplies only a white-and-red lock-up, which is unreadable on a
    // white tile, so that one sits on the brand navy. Everything else is
    // shown on white without filters or recolouring.
    logoBackground: row.slug === "alpha-10" ? "dark" : "light",
    updatedAt: row.updated_at,
  };
}

function fallback(): Partner[] {
  return seedPartners.map((partner, index) => ({
    ...partner,
    id: `seed-${partner.slug}`,
    updatedAt: undefined,
    displayOrder: partner.displayOrder || (index + 1) * 10,
  }));
}

function db() {
  return hasServiceRole() ? createServiceClient() : null;
}

export async function listPartners(options: { includeInactive?: boolean } = {}): Promise<Partner[]> {
  const client = db();
  if (!client) {
    return fallback().filter((partner) => options.includeInactive || partner.active);
  }

  let query = client.from("partners").select(COLUMNS).order("display_order", { ascending: true });
  if (!options.includeInactive) query = query.eq("is_active", true);

  const { data, error } = await query;
  if (error || !data?.length) {
    return fallback().filter((partner) => options.includeInactive || partner.active);
  }

  return (data as Row[]).map(mapRow);
}

export async function getPartner(slug: string): Promise<Partner | null> {
  const client = db();
  if (!client) return fallback().find((partner) => partner.slug === slug) ?? null;

  const { data, error } = await client
    .from("partners")
    .select(COLUMNS)
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) return fallback().find((partner) => partner.slug === slug) ?? null;
  return mapRow(data as Row);
}

export type PartnerInput = {
  organisationName: string;
  slug: string;
  logoUrl: string;
  websiteUrl: string;
  description: string;
  category: string;
  displayOrder: number;
  active: boolean;
};

export async function savePartner(input: PartnerInput, actor: StaffUser): Promise<void> {
  const client = db();
  if (!client) throw new Error("Supabase is not configured, so the change was not saved.");

  const { error } = await client.from("partners").upsert(
    {
      organisation_name: input.organisationName,
      slug: input.slug,
      logo_url: input.logoUrl,
      website_url: input.websiteUrl,
      description: input.description,
      category: input.category,
      display_order: input.displayOrder,
      is_active: input.active,
    },
    { onConflict: "slug" },
  );

  if (error) throw new Error(error.message);

  await logAudit({
    actor,
    action: input.active ? "partner-save" : "partner-save-inactive",
    collection: "partners",
    slug: input.slug,
  });
}

export async function setPartnerActive(
  slug: string,
  active: boolean,
  actor: StaffUser,
): Promise<void> {
  const client = db();
  if (!client) throw new Error("Supabase is not configured, so the change was not saved.");

  const { error } = await client.from("partners").update({ is_active: active }).eq("slug", slug);
  if (error) throw new Error(error.message);

  await logAudit({
    actor,
    action: active ? "partner-activate" : "partner-deactivate",
    collection: "partners",
    slug,
  });
}

export async function deletePartner(slug: string, actor: StaffUser): Promise<void> {
  const client = db();
  if (!client) throw new Error("Supabase is not configured, so nothing was deleted.");

  const { error } = await client.from("partners").delete().eq("slug", slug);
  if (error) throw new Error(error.message);

  await logAudit({ actor, action: "partner-delete", collection: "partners", slug });
}

/** Move a partner up or down by swapping display order with its neighbour. */
export async function movePartner(
  slug: string,
  direction: "up" | "down",
  actor: StaffUser,
): Promise<void> {
  const client = db();
  if (!client) throw new Error("Supabase is not configured, so the order was not changed.");

  const { data, error } = await client
    .from("partners")
    .select("slug, display_order")
    .order("display_order", { ascending: true });
  if (error || !data) throw new Error(error?.message ?? "The directory could not be read.");

  const list = data as { slug: string; display_order: number }[];
  const index = list.findIndex((row) => row.slug === slug);
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || swapWith < 0 || swapWith >= list.length) return;

  const current = list[index];
  const neighbour = list[swapWith];

  // Normalise orders first so two rows never share the same value.
  const currentOrder = neighbour.display_order;
  const neighbourOrder = current.display_order;
  const currentValue = currentOrder === neighbourOrder ? neighbourOrder + (direction === "up" ? 10 : -10) : currentOrder;

  await client.from("partners").update({ display_order: currentValue }).eq("slug", current.slug);
  await client
    .from("partners")
    .update({ display_order: current.display_order })
    .eq("slug", neighbour.slug);

  await logAudit({ actor, action: `partner-move-${direction}`, collection: "partners", slug });
}

const LOGO_TYPES: Record<string, string> = {
  "image/svg+xml": "svg",
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

/**
 * Upload a replacement logo to the `partner-logos` bucket and return its
 * public URL. SVG is accepted because most corporate logos are vector.
 */
export async function uploadPartnerLogo(file: File, slug: string): Promise<string> {
  const client = db();
  if (!client) throw new Error("Supabase is not configured, so the logo was not uploaded.");

  const extension = LOGO_TYPES[file.type];
  if (!extension) throw new Error("Use an SVG, PNG, JPG or WebP file.");
  if (file.size > 2 * 1024 * 1024) throw new Error("Logos must be 2 MB or smaller.");

  // Create the bucket on first use; ignore "already exists".
  const { error: bucketError } = await client.storage.createBucket("partner-logos", { public: true });
  if (bucketError && !/already exists|duplicate/i.test(bucketError.message)) {
    // Uploading with the service role still works if the bucket exists.
    console.warn("partner-logos bucket", bucketError.message);
  }

  // Logos are served from a public bucket, so the bytes must match the type
  // and an SVG must not carry script or event handlers.
  const body = await readVerifiedUpload(file, file.type);

  const path = `${slug}-${Date.now()}.${extension}`;
  const { error } = await client.storage.from("partner-logos").upload(path, body, {
    contentType: file.type,
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw new Error(error.message);

  const { data } = client.storage.from("partner-logos").getPublicUrl(path);
  return data.publicUrl;
}
