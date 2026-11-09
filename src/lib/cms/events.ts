import "server-only";
import { createServiceClient } from "@/lib/supabase/server";
import { readVerifiedUpload } from "@/lib/uploads";
import { hasServiceRole } from "@/lib/supabase/config";
import type { StaffUser } from "@/lib/cms/auth";
import type {
  Announcement,
  EventCategory,
  EventEnquiry,
  EventRegistration,
  GalleryImage,
  PublicationStatus,
  SocietyEvent,
} from "@/lib/events/types";
import type {
  AnnouncementInput as AnnouncementInputType,
  CategoryInput,
  EventInput,
} from "@/lib/events/schema";

export type {
  Announcement,
  CategoryInput,
  EventCategory,
  EventEnquiry,
  EventInput,
  EventRegistration,
  GalleryImage,
  PublicationStatus,
  SocietyEvent,
};

/**
 * Events and announcements data access.
 *
 * Everything runs on the server. Reads use the service role and therefore
 * apply the visibility rules here as well as in row level security: drafts,
 * scheduled items and expired notices are filtered before they reach a page.
 * Writes are only called from server actions behind `requireStaff()`.
 */

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string;
  display_order: number;
  is_active: boolean;
};

type EventRow = {
  id: string;
  title: string;
  slug: string;
  category_id: string | null;
  edition: string;
  short_description: string;
  full_description: string;
  objectives: string[] | null;
  exhibitors: string[] | null;
  start_date: string;
  end_date: string | null;
  start_time: string | null;
  end_time: string | null;
  timezone: string;
  starts_at: string | null;
  ends_at: string | null;
  venue_name: string;
  venue_address: string;
  maps_url: string;
  online_event_url: string;
  banner_url: string;
  poster_url: string;
  brochure_url: string;
  programme_url: string;
  registration_required: boolean;
  registration_url: string;
  registration_deadline: string | null;
  enquiry_email: string;
  contact_phone: string;
  publication_status: PublicationStatus;
  event_status: "scheduled" | "cancelled" | "postponed";
  is_featured: boolean;
  display_order: number;
  promotion_start: string | null;
  promotion_end: string | null;
  seo_title: string;
  seo_description: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  event_categories?: { name: string; slug: string } | null;
  event_gallery?: GalleryRow[] | null;
};

type GalleryRow = {
  id: string;
  image_url: string;
  caption: string;
  display_order: number;
};

type AnnouncementRow = {
  id: string;
  title: string;
  slug: string;
  category: string;
  short_description: string;
  full_description: string;
  featured_image: string;
  attachment_url: string;
  publication_status: PublicationStatus;
  is_urgent: boolean;
  is_featured: boolean;
  published_at: string | null;
  expiry_date: string | null;
  created_at: string;
  updated_at: string;
};

const EVENT_COLUMNS = `
  id, title, slug, category_id, edition, short_description, full_description, objectives, exhibitors,
  start_date, end_date, start_time, end_time, timezone, starts_at, ends_at,
  venue_name, venue_address, maps_url, online_event_url,
  banner_url, poster_url, brochure_url, programme_url,
  registration_required, registration_url, registration_deadline,
  enquiry_email, contact_phone, publication_status, event_status,
  is_featured, display_order, promotion_start, promotion_end,
  seo_title, seo_description, published_at, created_at, updated_at,
  event_categories (name, slug)
`;

function db() {
  return hasServiceRole() ? createServiceClient() : null;
}

function unavailable(): Error {
  return new Error("Supabase is not configured, so the change was not saved.");
}

function mapEvent(row: EventRow, gallery: GalleryImage[] = []): SocietyEvent {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    categoryId: row.category_id,
    categoryName: row.event_categories?.name ?? "Other Events",
    categorySlug: row.event_categories?.slug ?? "other-events",
    edition: row.edition ?? "",
    shortDescription: row.short_description ?? "",
    fullDescription: row.full_description ?? "",
    objectives: row.objectives ?? [],
    exhibitors: row.exhibitors ?? [],
    startDate: row.start_date,
    endDate: row.end_date,
    startTime: row.start_time,
    endTime: row.end_time,
    timezone: row.timezone ?? "Africa/Lagos",
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    venueName: row.venue_name ?? "",
    venueAddress: row.venue_address ?? "",
    mapsUrl: row.maps_url ?? "",
    onlineEventUrl: row.online_event_url ?? "",
    bannerUrl: row.banner_url ?? "",
    posterUrl: row.poster_url ?? "",
    brochureUrl: row.brochure_url ?? "",
    programmeUrl: row.programme_url ?? "",
    registrationRequired: Boolean(row.registration_required),
    registrationUrl: row.registration_url ?? "",
    registrationDeadline: row.registration_deadline,
    enquiryEmail: row.enquiry_email ?? "",
    contactPhone: row.contact_phone ?? "",
    publicationStatus: row.publication_status,
    organiserStatus: row.event_status,
    featured: Boolean(row.is_featured),
    displayOrder: Number(row.display_order ?? 0),
    promotionStart: row.promotion_start,
    promotionEnd: row.promotion_end,
    seoTitle: row.seo_title ?? "",
    seoDescription: row.seo_description ?? "",
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    gallery,
  };
}

function mapAnnouncement(row: AnnouncementRow): Announcement {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    category: row.category,
    shortDescription: row.short_description,
    fullDescription: row.full_description,
    featuredImage: row.featured_image,
    attachmentUrl: row.attachment_url,
    publicationStatus: row.publication_status,
    urgent: Boolean(row.is_urgent),
    featured: Boolean(row.is_featured),
    publishedAt: row.published_at,
    expiryDate: row.expiry_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function isVisible(event: SocietyEvent, now: Date = new Date()): boolean {
  if (event.publicationStatus === "published") return true;
  return (
    event.publicationStatus === "scheduled" &&
    Boolean(event.publishedAt) &&
    new Date(event.publishedAt as string) <= now
  );
}

/* -------------------------------- categories ------------------------------ */

export async function listCategories(options: { includeInactive?: boolean } = {}): Promise<EventCategory[]> {
  const client = db();
  if (!client) return [];

  let query = client
    .from("event_categories")
    .select("id, name, slug, description, display_order, is_active")
    .order("display_order", { ascending: true });
  if (!options.includeInactive) query = query.eq("is_active", true);

  const { data } = await query;
  return ((data ?? []) as CategoryRow[]).map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? "",
    displayOrder: Number(row.display_order ?? 0),
    active: Boolean(row.is_active),
  }));
}

export async function saveCategory(input: CategoryInput, actor: StaffUser): Promise<void> {
  const client = db();
  if (!client) throw unavailable();

  const { error } = await client
    .from("event_categories")
    .upsert(
      {
        name: input.name,
        slug: input.slug,
        description: input.description,
        display_order: input.displayOrder,
        is_active: input.active,
      },
      { onConflict: "slug" },
    );
  if (error) throw new Error(error.message);
  await logEventActivity({ actor, action: "category-save", description: input.name });
}

export async function deleteCategory(id: string, actor: StaffUser): Promise<void> {
  const client = db();
  if (!client) throw unavailable();
  const { error } = await client.from("event_categories").delete().eq("id", id);
  if (error) throw new Error(error.message);
  await logEventActivity({ actor, action: "category-delete", description: id });
}

/* ---------------------------------- events -------------------------------- */

export async function listEvents(
  options: { includeDrafts?: boolean; limit?: number } = {},
): Promise<SocietyEvent[]> {
  const client = db();
  if (!client) return [];

  let query = client
    .from("events")
    .select(EVENT_COLUMNS)
    .order("start_date", { ascending: true })
    .order("display_order", { ascending: true });
  if (!options.includeDrafts) query = query.in("publication_status", ["published", "scheduled"]);
  if (options.limit) query = query.limit(options.limit);

  const { data, error } = await query;
  if (error || !data) return [];

  const events = (data as unknown as EventRow[]).map((row) => mapEvent(row));
  return options.includeDrafts ? events : events.filter((event) => isVisible(event));
}

export async function getEvent(
  slug: string,
  options: { includeDrafts?: boolean } = {},
): Promise<SocietyEvent | null> {
  const client = db();
  if (!client) return null;

  const { data, error } = await client
    .from("events")
    .select(EVENT_COLUMNS)
    .eq("slug", slug)
    .maybeSingle();
  if (error || !data) return null;

  const event = mapEvent(data as unknown as EventRow);
  if (!options.includeDrafts && !isVisible(event)) return null;

  const gallery = await listGallery(event.id);
  return { ...event, gallery };
}

export async function listGallery(eventId: string): Promise<GalleryImage[]> {
  const client = db();
  if (!client) return [];

  const { data } = await client
    .from("event_gallery")
    .select("id, image_url, caption, display_order")
    .eq("event_id", eventId)
    .order("display_order", { ascending: true });

  return ((data ?? []) as GalleryRow[]).map((row) => ({
    id: row.id,
    imageUrl: row.image_url,
    caption: row.caption ?? "",
    displayOrder: Number(row.display_order ?? 0),
  }));
}

type EventWrite = EventInput & {
  startsAt: string | null;
  endsAt: string | null;
  publishedAt?: string | null;
};

function eventPayload(input: EventWrite, actor: StaffUser) {
  return {
    title: input.title,
    slug: input.slug,
    category_id: input.categoryId || null,
    edition: input.edition,
    short_description: input.shortDescription,
    full_description: input.fullDescription,
    objectives: input.objectives,
    exhibitors: input.exhibitors,
    start_date: input.startDate,
    end_date: input.endDate || null,
    start_time: input.startTime || null,
    end_time: input.endTime || null,
    timezone: input.timezone,
    starts_at: input.startsAt,
    ends_at: input.endsAt,
    venue_name: input.venueName,
    venue_address: input.venueAddress,
    maps_url: input.mapsUrl,
    online_event_url: input.onlineEventUrl,
    banner_url: input.bannerUrl,
    poster_url: input.posterUrl,
    brochure_url: input.brochureUrl,
    programme_url: input.programmeUrl,
    registration_required: input.registrationRequired,
    registration_url: input.registrationUrl,
    registration_deadline: input.registrationDeadline || null,
    enquiry_email: input.enquiryEmail,
    contact_phone: input.contactPhone,
    publication_status: input.publicationStatus,
    event_status: input.organiserStatus,
    is_featured: input.featured,
    display_order: input.displayOrder,
    promotion_start: input.promotionStart || null,
    promotion_end: input.promotionEnd || null,
    seo_title: input.seoTitle,
    seo_description: input.seoDescription,
    created_by: actor.id === "local" ? null : actor.id,
    published_at:
      input.publicationStatus === "published"
        ? input.publishedAt ?? new Date().toISOString()
        : input.publicationStatus === "scheduled"
          ? input.publishedAt
          : null,
  };
}

export async function saveEvent(input: EventWrite, actor: StaffUser): Promise<void> {
  const client = db();
  if (!client) throw unavailable();

  const { error } = await client
    .from("events")
    .upsert(eventPayload(input, actor), { onConflict: "slug" });
  if (error) throw new Error(error.message);

  await logEventActivity({
    actor,
    action: input.publicationStatus === "published" ? "event-publish" : "event-save",
    description: `${input.title} (${input.publicationStatus})`,
  });
}

export async function setEventPublication(
  slug: string,
  status: PublicationStatus,
  actor: StaffUser,
): Promise<void> {
  const client = db();
  if (!client) throw unavailable();

  const patch: Record<string, unknown> = { publication_status: status };
  if (status === "published") patch.published_at = new Date().toISOString();
  if (status === "draft" || status === "archived") patch.is_featured = false;

  const { error } = await client.from("events").update(patch).eq("slug", slug);
  if (error) throw new Error(error.message);
  await logEventActivity({ actor, action: `event-${status}`, description: slug });
}

export async function setEventFeatured(
  slug: string,
  featured: boolean,
  actor: StaffUser,
): Promise<void> {
  const client = db();
  if (!client) throw unavailable();
  const { error } = await client.from("events").update({ is_featured: featured }).eq("slug", slug);
  if (error) throw new Error(error.message);
  await logEventActivity({
    actor,
    action: featured ? "event-feature" : "event-unfeature",
    description: slug,
  });
}

export async function deleteEvent(slug: string, actor: StaffUser): Promise<void> {
  const client = db();
  if (!client) throw unavailable();
  const { error } = await client.from("events").delete().eq("slug", slug);
  if (error) throw new Error(error.message);
  await logEventActivity({ actor, action: "event-delete", description: slug });
}

/* --------------------------------- gallery -------------------------------- */

export async function addGalleryImage(
  eventId: string,
  imageUrl: string,
  caption: string,
  actor: StaffUser,
): Promise<void> {
  const client = db();
  if (!client) throw unavailable();

  const { data } = await client
    .from("event_gallery")
    .select("display_order")
    .eq("event_id", eventId)
    .order("display_order", { ascending: false })
    .limit(1);
  const next = Number(data?.[0]?.display_order ?? 0) + 10;

  const { error } = await client
    .from("event_gallery")
    .insert({ event_id: eventId, image_url: imageUrl, caption, display_order: next });
  if (error) throw new Error(error.message);
  await logEventActivity({ actor, action: "gallery-add", description: imageUrl });
}

export async function deleteGalleryImage(id: string, actor: StaffUser): Promise<void> {
  const client = db();
  if (!client) throw unavailable();
  const { error } = await client.from("event_gallery").delete().eq("id", id);
  if (error) throw new Error(error.message);
  await logEventActivity({ actor, action: "gallery-delete", description: id });
}

/* ------------------------------ registrations ----------------------------- */

export async function createRegistration(input: {
  eventId: string;
  fullName: string;
  email: string;
  phone: string;
  organisation: string;
  attendeeCount: number;
  additionalInformation: string;
}): Promise<void> {
  const client = db();
  if (!client) throw new Error("Registration is not available right now.");

  const { error } = await client.from("event_registrations").insert({
    event_id: input.eventId,
    full_name: input.fullName,
    email: input.email,
    phone: input.phone,
    organisation: input.organisation,
    attendee_count: input.attendeeCount,
    additional_information: input.additionalInformation,
    consent_status: true,
  });
  if (error) throw new Error(error.message);
}

export async function listRegistrations(eventId?: string): Promise<EventRegistration[]> {
  const client = db();
  if (!client) return [];

  let query = client
    .from("event_registrations")
    .select(
      "id, event_id, full_name, email, phone, organisation, attendee_count, additional_information, registration_date, status",
    )
    .order("registration_date", { ascending: false })
    .limit(500);
  if (eventId) query = query.eq("event_id", eventId);

  const { data, error } = await query;
  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id as string,
    eventId: row.event_id as string,
    fullName: row.full_name as string,
    email: row.email as string,
    phone: (row.phone as string) ?? "",
    organisation: (row.organisation as string) ?? "",
    attendeeCount: Number(row.attendee_count ?? 1),
    additionalInformation: (row.additional_information as string) ?? "",
    registrationDate: row.registration_date as string,
    status: row.status as EventRegistration["status"],
  }));
}

export async function setRegistrationStatus(
  id: string,
  status: EventRegistration["status"],
  actor: StaffUser,
): Promise<void> {
  const client = db();
  if (!client) throw unavailable();
  const { error } = await client.from("event_registrations").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
  await logEventActivity({ actor, action: "registration-status", description: `${id} → ${status}` });
}

/* -------------------------------- enquiries ------------------------------- */

export async function createEnquiry(input: {
  eventId: string;
  name: string;
  email: string;
  phone: string;
  message: string;
}): Promise<void> {
  const client = db();
  if (!client) throw new Error("Enquiries are not available right now.");

  const { error } = await client.from("event_enquiries").insert({
    event_id: input.eventId,
    name: input.name,
    email: input.email,
    phone: input.phone,
    message: input.message,
  });
  if (error) throw new Error(error.message);
}

export async function listEnquiries(eventId?: string): Promise<EventEnquiry[]> {
  const client = db();
  if (!client) return [];

  let query = client
    .from("event_enquiries")
    .select("id, event_id, name, email, phone, message, status, created_at")
    .order("created_at", { ascending: false })
    .limit(500);
  if (eventId) query = query.eq("event_id", eventId);

  const { data, error } = await query;
  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id as string,
    eventId: row.event_id as string,
    name: row.name as string,
    email: row.email as string,
    phone: (row.phone as string) ?? "",
    message: row.message as string,
    status: row.status as EventEnquiry["status"],
    createdAt: row.created_at as string,
  }));
}

export async function setEnquiryStatus(
  id: string,
  status: EventEnquiry["status"],
  actor: StaffUser,
): Promise<void> {
  const client = db();
  if (!client) throw unavailable();
  const { error } = await client
    .from("event_enquiries")
    .update({ status, resolved_at: status === "resolved" ? new Date().toISOString() : null })
    .eq("id", id);
  if (error) throw new Error(error.message);
  await logEventActivity({ actor, action: "enquiry-status", description: `${id} → ${status}` });
}

/* ------------------------------ announcements ----------------------------- */

export async function listAnnouncements(
  options: { includeDrafts?: boolean; limit?: number } = {},
): Promise<Announcement[]> {
  const client = db();
  if (!client) return [];

  let query = client
    .from("announcements")
    .select(
      "id, title, slug, category, short_description, full_description, featured_image, attachment_url, publication_status, is_urgent, is_featured, published_at, expiry_date, created_at, updated_at",
    )
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });
  if (!options.includeDrafts) query = query.in("publication_status", ["published", "scheduled"]);
  if (options.limit) query = query.limit(options.limit);

  const { data, error } = await query;
  if (error || !data) return [];

  const now = new Date();
  const announcements = ((data ?? []) as AnnouncementRow[]).map(mapAnnouncement);
  if (options.includeDrafts) return announcements;

  return announcements.filter((item) => {
    if (item.expiryDate && new Date(`${item.expiryDate}T23:59:59+01:00`) < now) return false;
    if (item.publicationStatus === "published") {
      return !item.publishedAt || new Date(item.publishedAt) <= now;
    }
    return Boolean(item.publishedAt && new Date(item.publishedAt) <= now);
  });
}

export async function getAnnouncement(
  slug: string,
  options: { includeDrafts?: boolean } = {},
): Promise<Announcement | null> {
  const client = db();
  if (!client) return null;

  const { data, error } = await client
    .from("announcements")
    .select(
      "id, title, slug, category, short_description, full_description, featured_image, attachment_url, publication_status, is_urgent, is_featured, published_at, expiry_date, created_at, updated_at",
    )
    .eq("slug", slug)
    .maybeSingle();
  if (error || !data) return null;

  const announcement = mapAnnouncement(data as AnnouncementRow);
  if (options.includeDrafts) return announcement;
  if (announcement.publicationStatus === "archived") return null;
  if (announcement.expiryDate && new Date(`${announcement.expiryDate}T23:59:59+01:00`) < new Date()) {
    return null;
  }
  if (announcement.publishedAt && new Date(announcement.publishedAt) > new Date()) return null;
  return announcement;
}

export async function saveAnnouncement(
  input: AnnouncementInputType,
  actor: StaffUser,
): Promise<void> {
  const client = db();
  if (!client) throw unavailable();

  const { error } = await client.from("announcements").upsert(
    {
      title: input.title,
      slug: input.slug,
      category: input.category,
      short_description: input.shortDescription,
      full_description: input.fullDescription,
      featured_image: input.featuredImage,
      attachment_url: input.attachmentUrl,
      publication_status: input.publicationStatus,
      is_urgent: input.urgent,
      is_featured: input.featured,
      published_at:
        input.publicationStatus === "published"
          ? input.publishedAt || new Date().toISOString()
          : input.publicationStatus === "scheduled"
            ? input.publishedAt
            : null,
      expiry_date: input.expiryDate || null,
      created_by: actor.id === "local" ? null : actor.id,
    },
    { onConflict: "slug" },
  );
  if (error) throw new Error(error.message);

  await logEventActivity({
    actor,
    action: "announcement-save",
    description: `${input.title} (${input.publicationStatus})`,
  });
}

export async function deleteAnnouncement(slug: string, actor: StaffUser): Promise<void> {
  const client = db();
  if (!client) throw unavailable();
  const { error } = await client.from("announcements").delete().eq("slug", slug);
  if (error) throw new Error(error.message);
  await logEventActivity({ actor, action: "announcement-delete", description: slug });
}

/* -------------------------------- activity -------------------------------- */

export async function logEventActivity(input: {
  actor: StaffUser;
  action: string;
  eventId?: string;
  description?: string;
}): Promise<void> {
  const client = db();
  if (!client) return;

  await client.from("event_activity_logs").insert({
    event_id: input.eventId ?? null,
    administrator_id: input.actor.id === "local" ? null : input.actor.id,
    administrator_email: input.actor.email,
    action: input.action,
    description: input.description ?? "",
  });
}

export type ActivityRecord = {
  id: number;
  action: string;
  description: string;
  actorEmail: string;
  createdAt: string;
};

export async function listActivity(limit = 30): Promise<ActivityRecord[]> {
  const client = db();
  if (!client) return [];

  const { data } = await client
    .from("event_activity_logs")
    .select("id, action, description, administrator_email, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? []).map((row) => ({
    id: Number(row.id),
    action: row.action as string,
    description: (row.description as string) ?? "",
    actorEmail: (row.administrator_email as string) ?? "",
    createdAt: row.created_at as string,
  }));
}

/* --------------------------------- storage -------------------------------- */

const IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/svg+xml": "svg",
};

const DOCUMENT_TYPES: Record<string, string> = {
  "application/pdf": "pdf",
};

export async function uploadEventAsset(
  file: File,
  folder: "banners" | "posters" | "gallery" | "documents",
  slug: string,
): Promise<string> {
  const client = db();
  if (!client) throw unavailable();

  const isDocument = folder === "documents";
  const extension = isDocument ? DOCUMENT_TYPES[file.type] : IMAGE_TYPES[file.type];
  if (!extension) {
    throw new Error(
      isDocument ? "Upload a PDF file." : "Use a JPG, PNG, WebP, AVIF or SVG image.",
    );
  }
  const maxBytes = isDocument ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error(isDocument ? "Documents must be 10 MB or smaller." : "Images must be 5 MB or smaller.");
  }

  const body = await readVerifiedUpload(file, file.type);

  const path = `${folder}/${slug}-${Date.now()}.${extension}`;
  const { error } = await client.storage.from("event-media").upload(path, body, {
    contentType: file.type,
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw new Error(error.message);

  return client.storage.from("event-media").getPublicUrl(path).data.publicUrl;
}
