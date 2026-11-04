import "server-only";
import { createServiceClient } from "@/lib/supabase/server";
import { hasServiceRole } from "@/lib/supabase/config";
import type { StaffUser } from "./auth";

/**
 * Content store.
 *
 * Every collection is a set of documents in `public.content_entries`, keyed by
 * collection and slug. The public site reads published documents only; the
 * console reads drafts too. Writes go through the server with the service role
 * so that validation, audit logging and cache revalidation happen in one place.
 *
 * When Supabase is not configured these functions return null/empty and the
 * content modules fall back to the verified JSON bundled in `content/`.
 */

export type Collection =
  | "settings"
  | "news"
  | "projects"
  | "services"
  | "faq"
  | "rates"
  | "credit-policy";

export type EntryStatus = "draft" | "published";

export type ContentEntry<T> = {
  slug: string;
  data: T;
  status: EntryStatus;
  updatedAt: string;
};

type Row = {
  slug: string;
  data: unknown;
  status: EntryStatus;
  updated_at: string;
};

function db() {
  return hasServiceRole() ? createServiceClient() : null;
}

export async function listEntries<T>(
  collection: Collection,
  options: { includeDrafts?: boolean } = {},
): Promise<ContentEntry<T>[]> {
  const client = db();
  if (!client) return [];

  let query = client
    .from("content_entries")
    .select("slug, data, status, updated_at")
    .eq("collection", collection)
    .order("updated_at", { ascending: false });

  if (!options.includeDrafts) query = query.eq("status", "published");

  const { data, error } = await query;
  if (error || !data) return [];

  return (data as Row[]).map((row) => ({
    slug: row.slug,
    data: row.data as T,
    status: row.status,
    updatedAt: row.updated_at,
  }));
}

export async function getEntry<T>(
  collection: Collection,
  slug: string,
  options: { includeDrafts?: boolean } = {},
): Promise<ContentEntry<T> | null> {
  const client = db();
  if (!client) return null;

  let query = client
    .from("content_entries")
    .select("slug, data, status, updated_at")
    .eq("collection", collection)
    .eq("slug", slug);

  if (!options.includeDrafts) query = query.eq("status", "published");

  const { data, error } = await query.maybeSingle();
  if (error || !data) return null;

  const row = data as Row;
  return {
    slug: row.slug,
    data: row.data as T,
    status: row.status,
    updatedAt: row.updated_at,
  };
}

export type SaveInput<T> = {
  collection: Collection;
  slug: string;
  data: T;
  status: EntryStatus;
  actor: StaffUser;
};

export async function saveEntry<T>(input: SaveInput<T>): Promise<void> {
  const client = db();
  if (!client) {
    throw new Error("Supabase is not configured, so the change was not saved.");
  }

  const { error } = await client.from("content_entries").upsert(
    {
      collection: input.collection,
      slug: input.slug,
      data: input.data,
      status: input.status,
      updated_by: input.actor.id === "local" ? null : input.actor.id,
    },
    { onConflict: "collection,slug" },
  );

  if (error) throw new Error(error.message);

  await logAudit({
    actor: input.actor,
    action: input.status === "published" ? "publish" : "save-draft",
    collection: input.collection,
    slug: input.slug,
  });
}

export async function deleteEntry(
  collection: Collection,
  slug: string,
  actor: StaffUser,
): Promise<void> {
  const client = db();
  if (!client) throw new Error("Supabase is not configured, so nothing was deleted.");

  const { error } = await client
    .from("content_entries")
    .delete()
    .eq("collection", collection)
    .eq("slug", slug);

  if (error) throw new Error(error.message);

  await logAudit({ actor, action: "delete", collection, slug });
}

export async function logAudit(input: {
  actor: StaffUser;
  action: string;
  collection: string;
  slug?: string;
  detail?: Record<string, unknown>;
}): Promise<void> {
  const client = db();
  if (!client) return;

  await client.from("audit_log").insert({
    actor: input.actor.id === "local" ? null : input.actor.id,
    actor_email: input.actor.email,
    action: input.action,
    collection: input.collection,
    slug: input.slug ?? "",
    detail: input.detail ?? {},
  });
}

/* --------------------------------------------------------------------------
 * Media library
 * ------------------------------------------------------------------------ */

export type MediaItem = {
  id: string;
  path: string;
  url: string;
  alt: string;
  mime: string;
  sizeBytes: number;
  createdAt: string;
};

function publicUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  return `${base}/storage/v1/object/public/media/${path}`;
}

export async function listMedia(limit = 60): Promise<MediaItem[]> {
  const client = db();
  if (!client) return [];

  const { data, error } = await client
    .from("media")
    .select("id, path, alt, mime, size_bytes, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id as string,
    path: row.path as string,
    url: publicUrl(row.path as string),
    alt: (row.alt as string) ?? "",
    mime: (row.mime as string) ?? "",
    sizeBytes: Number(row.size_bytes ?? 0),
    createdAt: row.created_at as string,
  }));
}

export async function recordMedia(input: {
  path: string;
  alt: string;
  mime: string;
  sizeBytes: number;
  actor: StaffUser;
}): Promise<void> {
  const client = db();
  if (!client) throw new Error("Supabase is not configured, so the upload was not recorded.");

  const { error } = await client.from("media").insert({
    path: input.path,
    alt: input.alt,
    mime: input.mime,
    size_bytes: input.sizeBytes,
    created_by: input.actor.id === "local" ? null : input.actor.id,
  });
  if (error) throw new Error(error.message);

  await logAudit({
    actor: input.actor,
    action: "media-upload",
    collection: "media",
    slug: input.path,
  });
}

const MEDIA_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/svg+xml": "svg",
};

export async function uploadMedia(
  file: File,
  alt: string,
  actor: StaffUser,
): Promise<string> {
  const client = db();
  if (!client) throw new Error("Supabase is not configured, so the image was not uploaded.");

  const extension = MEDIA_TYPES[file.type];
  if (!extension) throw new Error("Use a JPG, PNG, WebP, AVIF or SVG image.");
  if (file.size > 5 * 1024 * 1024) throw new Error("Images must be 5 MB or smaller.");

  const path = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${extension}`;
  const { error } = await client.storage.from("media").upload(path, file, {
    contentType: file.type,
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw new Error(error.message);

  await recordMedia({ path, alt, mime: file.type, sizeBytes: file.size, actor });
  return publicUrl(path);
}

export async function deleteMedia(path: string, actor: StaffUser): Promise<void> {
  const client = db();
  if (!client) throw new Error("Supabase is not configured, so nothing was deleted.");

  const { error: storageError } = await client.storage.from("media").remove([path]);
  if (storageError) throw new Error(storageError.message);

  const { error } = await client.from("media").delete().eq("path", path);
  if (error) throw new Error(error.message);

  await logAudit({ actor, action: "media-delete", collection: "media", slug: path });
}

/* --------------------------------------------------------------------------
 * Enquiries
 * ------------------------------------------------------------------------ */

export async function saveEnquiry(record: {
  reference?: string;
  name: string;
  email: string;
  phone: string;
  staffId?: string;
  subject: string;
  message: string;
}): Promise<boolean> {
  const client = db();
  if (!client) return false;

  const { error } = await client.from("enquiries").insert({
    reference: record.reference ?? "",
    name: record.name,
    email: record.email,
    phone: record.phone,
    staff_id: record.staffId ?? "",
    subject: record.subject,
    message: record.message,
  });
  if (error) console.error("Failed to store enquiry in Supabase", error.message);
  return !error;
}

export async function listAudit(limit = 40) {
  const client = db();
  if (!client) return [];

  const { data } = await client
    .from("audit_log")
    .select("id, actor_email, action, collection, slug, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  return data ?? [];
}
