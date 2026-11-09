"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/cms/auth";
import {
  addGalleryImage,
  createEnquiry,
  createRegistration,
  deleteAnnouncement,
  deleteCategory,
  deleteEvent,
  deleteGalleryImage,
  getAnnouncement,
  getEvent,
  listAnnouncements,
  listCategories,
  listEvents,
  saveAnnouncement,
  saveCategory,
  saveEvent,
  setEnquiryStatus,
  setEventFeatured,
  setEventPublication,
  setRegistrationStatus,
  uploadEventAsset,
  type EventRegistration,
} from "@/lib/cms/events";
import {
  announcementInputSchema,
  categorySchema,
  enquirySchema,
  eventInputSchema,
  registrationSchema,
} from "@/lib/events/schema";
import { eventInstant, lifecycleOf, registrationState } from "@/lib/events/format";
import type { EventCategory, SocietyEvent } from "@/lib/events/types";

function text(form: FormData, key: string): string {
  return String(form.get(key) ?? "").trim();
}

function flag(form: FormData, key: string): boolean {
  return form.get(key) === "on" || form.get(key) === "true";
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function lines(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function refreshPublic(): void {
  revalidatePath("/", "layout");
  revalidatePath("/events");
  revalidatePath("/events/past");
  revalidatePath("/events/announcements");
  revalidatePath("/events/gallery");
}

async function uniqueSlug(
  base: string,
  existing: (slug: string) => Promise<boolean>,
): Promise<string> {
  const root = slugify(base) || "event";
  if (!(await existing(root))) return root;
  let index = 2;
  while (await existing(`${root}-${index}`)) index += 1;
  return `${root}-${index}`;
}

function localInput(iso: string | null): string {
  if (!iso) return "";
  // Stored instants are displayed in West Africa Time (UTC+01:00).
  const date = new Date(new Date(iso).getTime() + 60 * 60 * 1000);
  return date.toISOString().slice(0, 16);
}

async function resolveAsset(
  form: FormData,
  field: string,
  folder: "banners" | "posters" | "gallery" | "documents",
  slug: string,
  current: string,
): Promise<{ url: string; uploaded: boolean }> {
  if (text(form, `${field}Remove`) === "1") return { url: "", uploaded: true };
  const file = form.get(field);
  if (file instanceof File && file.size > 0) {
    return { url: await uploadEventAsset(file, folder, slug), uploaded: true };
  }
  return { url: text(form, `${field}Url`) || current, uploaded: false };
}

function buildInput(
  form: FormData,
  slug: string,
  assets: {
    bannerUrl: string;
    posterUrl: string;
    brochureUrl: string;
    programmeUrl: string;
  },
) {
  const startDate = text(form, "startDate");
  const endDate = text(form, "endDate") || null;
  const startTime = text(form, "startTime") || null;
  const endTime = text(form, "endTime") || null;

  const start = eventInstant(startDate, startTime, "00:00");
  const end = eventInstant(endDate ?? startDate, endTime, "23:59");

  return {
    title: text(form, "title"),
    slug,
    categoryId: text(form, "categoryId") || null,
    edition: text(form, "edition"),
    shortDescription: text(form, "shortDescription"),
    fullDescription: text(form, "fullDescription"),
    objectives: lines(text(form, "objectives")),
    exhibitors: lines(text(form, "exhibitors")),
    startDate,
    endDate,
    startTime: startTime ?? "",
    endTime: endTime ?? "",
    timezone: text(form, "timezone") || "Africa/Lagos",
    venueName: text(form, "venueName"),
    venueAddress: text(form, "venueAddress"),
    mapsUrl: text(form, "mapsUrl"),
    onlineEventUrl: text(form, "onlineEventUrl"),
    ...assets,
    registrationRequired: flag(form, "registrationRequired"),
    registrationUrl: text(form, "registrationUrl"),
    registrationDeadline: text(form, "registrationDeadline") || null,
    enquiryEmail: text(form, "enquiryEmail"),
    contactPhone: text(form, "contactPhone"),
    publicationStatus: (text(form, "publicationStatus") || "draft") as
      | "draft"
      | "scheduled"
      | "published"
      | "archived",
    organiserStatus: (text(form, "organiserStatus") || "scheduled") as
      | "scheduled"
      | "cancelled"
      | "postponed",
    featured: flag(form, "featured"),
    displayOrder: Number(text(form, "displayOrder") || 0),
    promotionStart: lagosIso(text(form, "promotionStart")),
    promotionEnd: lagosIso(text(form, "promotionEnd")),
    seoTitle: text(form, "seoTitle"),
    seoDescription: text(form, "seoDescription"),
    startsAt: start ? start.toISOString() : null,
    endsAt: end ? end.toISOString() : null,
    publishedAt: lagosIso(text(form, "publishedAt")) || null,
  };
}

/* ---------------------------------- events -------------------------------- */

export async function createEvent(form: FormData): Promise<void> {
  const actor = await requireStaff();
  const title = text(form, "title");
  if (!title) redirect("/admin/events?error=title");

  const existing = await listEvents({ includeDrafts: true });
  const slug = await uniqueSlug(title, async (candidate) =>
    existing.some((event) => event.slug === candidate),
  );

  const today = new Date().toISOString().slice(0, 10);
  const startDate = text(form, "startDate") || today;
  const parsed = eventInputSchema.safeParse({
    title,
    slug,
    categoryId: text(form, "categoryId") || null,
    edition: text(form, "edition"),
    shortDescription: text(form, "shortDescription"),
    fullDescription: "",
    objectives: [],
    exhibitors: [],
    startDate,
    endDate: text(form, "endDate") || null,
    startTime: "",
    endTime: "",
    timezone: "Africa/Lagos",
    venueName: "",
    venueAddress: "",
    mapsUrl: "",
    onlineEventUrl: "",
    bannerUrl: "",
    posterUrl: "",
    brochureUrl: "",
    programmeUrl: "",
    registrationRequired: false,
    registrationUrl: "",
    registrationDeadline: null,
    enquiryEmail: "",
    contactPhone: "",
    publicationStatus: (text(form, "publicationStatus") || "draft") as
      | "draft"
      | "scheduled"
      | "published"
      | "archived",
    organiserStatus: "scheduled",
    featured: false,
    displayOrder: 0,
    promotionStart: "",
    promotionEnd: "",
    seoTitle: "",
    seoDescription: "",
  });
  if (!parsed.success) redirect("/admin/events/new?error=invalid");

  const start = eventInstant(startDate, null, "00:00");
  const end = eventInstant(parsed.data.endDate ?? startDate, null, "23:59");
  await saveEvent(
    { ...parsed.data, startsAt: start?.toISOString() ?? null, endsAt: end?.toISOString() ?? null },
    actor,
  );

  refreshPublic();
  redirect(`/admin/events/${slug}?created=1`);
}

export async function saveEventAction(form: FormData): Promise<void> {
  const actor = await requireStaff();
  const slug = text(form, "slug");
  const existing = await getEvent(slug, { includeDrafts: true });
  if (!existing) redirect("/admin/events?error=missing");

  let assets = {
    bannerUrl: existing.bannerUrl,
    posterUrl: existing.posterUrl,
    brochureUrl: existing.brochureUrl,
    programmeUrl: existing.programmeUrl,
  };

  try {
    const banner = await resolveAsset(form, "banner", "banners", slug, existing.bannerUrl);
    const poster = await resolveAsset(form, "poster", "posters", slug, existing.posterUrl);
    const brochure = await resolveAsset(form, "brochure", "documents", slug, existing.brochureUrl);
    const programme = await resolveAsset(form, "programme", "documents", slug, existing.programmeUrl);
    assets = {
      bannerUrl: banner.url,
      posterUrl: poster.url,
      brochureUrl: brochure.url,
      programmeUrl: programme.url,
    };
  } catch {
    redirect(`/admin/events/${slug}?error=upload`);
  }

  const input = buildInput(form, slug, assets);
  const parsed = eventInputSchema.safeParse(input);
  if (!parsed.success) redirect(`/admin/events/${slug}?error=invalid`);

  await saveEvent(
    { ...parsed.data, startsAt: input.startsAt, endsAt: input.endsAt, publishedAt: input.publishedAt },
    actor,
  );
  refreshPublic();
  revalidatePath(`/events/${slug}`);
  redirect(`/admin/events/${slug}?saved=1`);
}

export async function publishEventAction(form: FormData): Promise<void> {
  const actor = await requireStaff();
  const slug = text(form, "slug");
  const status = text(form, "status") as "draft" | "published" | "archived" | "scheduled";
  await setEventPublication(slug, status, actor);
  refreshPublic();
  revalidatePath(`/events/${slug}`);
  redirect(`/admin/events/${slug}?status=${status}`);
}

export async function featureEventAction(form: FormData): Promise<void> {
  const actor = await requireStaff();
  const slug = text(form, "slug");
  await setEventFeatured(slug, text(form, "featured") === "true", actor);
  refreshPublic();
  revalidatePath(`/events/${slug}`);
  redirect(`/admin/events/${slug}?featured=1`);
}

export async function deleteEventAction(form: FormData): Promise<void> {
  const actor = await requireStaff();
  await deleteEvent(text(form, "slug"), actor);
  refreshPublic();
  redirect("/admin/events?deleted=1");
}

/* --------------------------------- gallery -------------------------------- */

export async function addGalleryAction(form: FormData): Promise<void> {
  const actor = await requireStaff();
  const slug = text(form, "slug");
  const event = await getEvent(slug, { includeDrafts: true });
  if (!event) redirect("/admin/events?error=missing");

  const file = form.get("image");
  if (!(file instanceof File) || file.size === 0) {
    redirect(`/admin/events/${slug}?error=gallery`);
  }

  try {
    const url = await uploadEventAsset(file, "gallery", slug);
    await addGalleryImage(event.id, url, text(form, "caption"), actor);
  } catch {
    redirect(`/admin/events/${slug}?error=gallery`);
  }

  refreshPublic();
  revalidatePath(`/events/${slug}`);
  redirect(`/admin/events/${slug}?gallery=1`);
}

export async function deleteGalleryAction(form: FormData): Promise<void> {
  const actor = await requireStaff();
  const slug = text(form, "slug");
  await deleteGalleryImage(text(form, "imageId"), actor);
  refreshPublic();
  revalidatePath(`/events/${slug}`);
  redirect(`/admin/events/${slug}?gallery=1`);
}

/* ------------------------------ registrations ----------------------------- */

export async function setRegistrationStatusAction(form: FormData): Promise<void> {
  const actor = await requireStaff();
  const slug = text(form, "slug");
  await setRegistrationStatus(
    text(form, "id"),
    text(form, "status") as EventRegistration["status"],
    actor,
  );
  revalidatePath(`/admin/events/${slug}/registrations`);
  redirect(`/admin/events/${slug}/registrations?saved=1`);
}

export async function setEnquiryStatusAction(form: FormData): Promise<void> {
  const actor = await requireStaff();
  const slug = text(form, "slug");
  await setEnquiryStatus(text(form, "id"), text(form, "status") as "open" | "resolved", actor);
  revalidatePath(`/admin/events/${slug}/enquiries`);
  redirect(`/admin/events/${slug}/enquiries?saved=1`);
}

/* -------------------------------- categories ------------------------------ */

export async function saveCategoryAction(form: FormData): Promise<void> {
  const actor = await requireStaff();
  const parsed = categorySchema.safeParse({
    name: text(form, "name"),
    slug: text(form, "slug") || slugify(text(form, "name")),
    description: text(form, "description"),
    displayOrder: Number(text(form, "displayOrder") || 0),
    active: flag(form, "active"),
  });
  if (!parsed.success) redirect("/admin/events/categories?error=invalid");

  await saveCategory(parsed.data, actor);
  refreshPublic();
  redirect("/admin/events/categories?saved=1");
}

export async function deleteCategoryAction(form: FormData): Promise<void> {
  const actor = await requireStaff();
  await deleteCategory(text(form, "id"), actor);
  refreshPublic();
  redirect("/admin/events/categories?deleted=1");
}

/* ------------------------------ announcements ----------------------------- */

export async function createAnnouncement(form: FormData): Promise<void> {
  const actor = await requireStaff();
  const title = text(form, "title");
  if (!title) redirect("/admin/announcements?error=title");

  const existing = await listAnnouncements({ includeDrafts: true });
  const slug = await uniqueSlug(title, async (candidate) =>
    existing.some((item) => item.slug === candidate),
  );

  const parsed = announcementInputSchema.safeParse({
    title,
    slug,
    category: "General notice",
    shortDescription: "",
    fullDescription: "",
    featuredImage: "",
    attachmentUrl: "",
    publicationStatus: "draft",
    urgent: false,
    featured: false,
    publishedAt: "",
    expiryDate: null,
  });
  if (!parsed.success) redirect("/admin/announcements?error=title");

  await saveAnnouncement(parsed.data, actor);
  refreshPublic();
  redirect(`/admin/announcements/${slug}?created=1`);
}

export async function saveAnnouncementAction(form: FormData): Promise<void> {
  const actor = await requireStaff();
  const slug = text(form, "slug");
  const existing = await getAnnouncement(slug, { includeDrafts: true });
  if (!existing) redirect("/admin/announcements?error=missing");

  let featuredImage = existing.featuredImage;
  let attachmentUrl = existing.attachmentUrl;
  try {
    const image = await resolveAsset(
      form,
      "featuredImage",
      "banners",
      slug,
      existing.featuredImage,
    );
    featuredImage = image.url;
    const attachment = await resolveAsset(form, "attachment", "documents", slug, existing.attachmentUrl);
    attachmentUrl = attachment.url;
  } catch {
    redirect(`/admin/announcements/${slug}?error=upload`);
  }

  const parsed = announcementInputSchema.safeParse({
    title: text(form, "title"),
    slug,
    category: text(form, "category"),
    shortDescription: text(form, "shortDescription"),
    fullDescription: text(form, "fullDescription"),
    featuredImage,
    attachmentUrl,
    publicationStatus: (text(form, "publicationStatus") || "draft") as
      | "draft"
      | "scheduled"
      | "published"
      | "archived",
    urgent: flag(form, "urgent"),
    featured: flag(form, "featured"),
    publishedAt: text(form, "publishedAt"),
    expiryDate: text(form, "expiryDate") || null,
  });
  if (!parsed.success) redirect(`/admin/announcements/${slug}?error=invalid`);

  await saveAnnouncement(parsed.data, actor);
  refreshPublic();
  revalidatePath(`/events/announcements/${slug}`);
  redirect(`/admin/announcements/${slug}?saved=1`);
}

export async function deleteAnnouncementAction(form: FormData): Promise<void> {
  const actor = await requireStaff();
  await deleteAnnouncement(text(form, "slug"), actor);
  refreshPublic();
  redirect("/admin/announcements?deleted=1");
}

/* ------------------------------- public forms ----------------------------- */

export type FormState = { status: "idle" | "success" | "error"; message?: string };

const attempts = new Map<string, number[]>();

function rateLimited(key: string, limit = 5, windowMs = 60 * 60 * 1000): boolean {
  const now = Date.now();
  const recent = (attempts.get(key) ?? []).filter((stamp) => now - stamp < windowMs);
  recent.push(now);
  attempts.set(key, recent);
  if (attempts.size > 5000) attempts.clear();
  return recent.length > limit;
}

async function clientKey(): Promise<string> {
  const { headers } = await import("next/headers");
  const { clientKeyFromHeaders } = await import("@/lib/security");
  return clientKeyFromHeaders(await headers());
}

export async function registerForEvent(
  _previous: FormState | undefined,
  form: FormData,
): Promise<FormState> {
  const slug = text(form, "slug");
  const event = await getEvent(slug);
  if (!event) return { status: "error", message: "This event is no longer available." };

  if (registrationState(event) !== "internal") {
    return { status: "error", message: "Registration has closed for this event." };
  }

  // Honeypot: a real member never fills the hidden field.
  if (text(form, "website")) return { status: "success", message: "Thank you." };

  if (rateLimited(`reg:${slug}:${await clientKey()}`)) {
    return {
      status: "error",
      message: "Too many attempts from this connection. Please try again later or call the Secretariat.",
    };
  }

  const parsed = registrationSchema.safeParse({
    fullName: text(form, "fullName"),
    email: text(form, "email"),
    phone: text(form, "phone"),
    organisation: text(form, "organisation"),
    attendeeCount: text(form, "attendeeCount") || "1",
    additionalInformation: text(form, "additionalInformation"),
    consent: text(form, "consent"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Check the details and try again.",
    };
  }

  try {
    await createRegistration({
      eventId: event.id,
      fullName: parsed.data.fullName,
      email: parsed.data.email,
      phone: parsed.data.phone,
      organisation: parsed.data.organisation,
      attendeeCount: parsed.data.attendeeCount,
      additionalInformation: parsed.data.additionalInformation,
    });
  } catch {
    return {
      status: "error",
      message: "The registration could not be saved. Please try again or call the Secretariat.",
    };
  }

  revalidatePath(`/events/${slug}`);
  return {
    status: "success",
    message: `Thank you. Your registration for ${event.title} has been received.`,
  };
}

export async function sendEventEnquiry(
  _previous: FormState | undefined,
  form: FormData,
): Promise<FormState> {
  const slug = text(form, "slug");
  const event = await getEvent(slug);
  if (!event) return { status: "error", message: "This event is no longer available." };

  if (text(form, "website")) return { status: "success", message: "Thank you." };

  if (rateLimited(`enq:${slug}:${await clientKey()}`, 4)) {
    return { status: "error", message: "Too many messages from this connection. Please try again later." };
  }

  const parsed = enquirySchema.safeParse({
    name: text(form, "name"),
    email: text(form, "email"),
    phone: text(form, "phone"),
    message: text(form, "message"),
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Check the details and try again.",
    };
  }

  try {
    await createEnquiry({
      eventId: event.id,
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      message: parsed.data.message,
    });
  } catch {
    return { status: "error", message: "Your message could not be sent. Please try again." };
  }

  return { status: "success", message: "Thank you. Your enquiry has reached the Secretariat." };
}

/* --------------------------------- helpers -------------------------------- */

function lagosIso(value: string): string {
  if (!value) return "";
  const date = new Date(`${value}:00+01:00`.replace(/:00:00\+01:00$/, ":00+01:00"));
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}
