/**
 * Shared types for the events and announcements module.
 *
 * This file is imported by both server and client components, so it must not
 * import anything server-only.
 */

export type PublicationStatus = "draft" | "scheduled" | "published" | "archived";

/** The organiser's decision, independent of the calendar. */
export type OrganiserStatus = "scheduled" | "cancelled" | "postponed";

/** Derived from the dates at read time, so it never goes stale. */
export type EventLifecycle = "upcoming" | "ongoing" | "completed" | "cancelled" | "postponed";

export type EventCategory = {
  id: string;
  name: string;
  slug: string;
  description: string;
  displayOrder: number;
  active: boolean;
};

export type GalleryImage = {
  id: string;
  imageUrl: string;
  caption: string;
  displayOrder: number;
};

export type SocietyEvent = {
  id: string;
  title: string;
  slug: string;
  categoryId: string | null;
  categoryName: string;
  categorySlug: string;
  edition: string;
  shortDescription: string;
  fullDescription: string;
  objectives: string[];
  exhibitors: string[];
  startDate: string;
  endDate: string | null;
  startTime: string | null;
  endTime: string | null;
  timezone: string;
  startsAt: string | null;
  endsAt: string | null;
  venueName: string;
  venueAddress: string;
  mapsUrl: string;
  onlineEventUrl: string;
  bannerUrl: string;
  posterUrl: string;
  brochureUrl: string;
  programmeUrl: string;
  registrationRequired: boolean;
  registrationUrl: string;
  registrationDeadline: string | null;
  enquiryEmail: string;
  contactPhone: string;
  publicationStatus: PublicationStatus;
  organiserStatus: OrganiserStatus;
  featured: boolean;
  displayOrder: number;
  promotionStart: string | null;
  promotionEnd: string | null;
  seoTitle: string;
  seoDescription: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  gallery: GalleryImage[];
};

export type EventRegistration = {
  id: string;
  eventId: string;
  fullName: string;
  email: string;
  phone: string;
  organisation: string;
  attendeeCount: number;
  additionalInformation: string;
  registrationDate: string;
  status: "received" | "approved" | "declined" | "attended";
};

export type EventEnquiry = {
  id: string;
  eventId: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: "open" | "resolved";
  createdAt: string;
};

export type Announcement = {
  id: string;
  title: string;
  slug: string;
  category: string;
  shortDescription: string;
  fullDescription: string;
  featuredImage: string;
  attachmentUrl: string;
  publicationStatus: PublicationStatus;
  urgent: boolean;
  featured: boolean;
  publishedAt: string | null;
  expiryDate: string | null;
  createdAt: string;
  updatedAt: string;
};
