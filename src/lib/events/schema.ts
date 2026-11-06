import { z } from "zod";

/**
 * Validation for everything the events module writes.
 *
 * The console and the public forms both validate on the server with these
 * schemas. Nothing is trusted from the browser: slugs are normalised, URLs must
 * be absolute, and the registration form requires explicit consent.
 */

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use a date.");
const optionalTime = z
  .string()
  .max(5)
  .refine((value) => value === "" || /^\d{2}:\d{2}$/.test(value), "Use a time such as 09:30.");
const absoluteUrl = z
  .string()
  .max(500)
  .refine((value) => value === "" || /^https?:\/\//i.test(value), "Use a full https:// address.");
const optionalInstant = z
  .string()
  .max(40)
  .refine(
    (value) => value === "" || !Number.isNaN(new Date(value).getTime()),
    "Use a date and time.",
  );

export const eventInputSchema = z
  .object({
    title: z.string().min(3).max(200),
    slug: z
      .string()
      .min(3)
      .max(90)
      .regex(/^[a-z0-9-]+$/, "Use lower-case letters, numbers and hyphens."),
    categoryId: z.string().max(60).nullable(),
    edition: z.string().max(40),
    shortDescription: z.string().max(400),
    fullDescription: z.string().max(12000),
    objectives: z.array(z.string().max(300)).max(20),
    exhibitors: z.array(z.string().max(200)).max(40),
    startDate: isoDate,
    endDate: isoDate.nullable(),
    startTime: optionalTime,
    endTime: optionalTime,
    timezone: z.enum(["Africa/Lagos", "UTC"]),
    venueName: z.string().max(200),
    venueAddress: z.string().max(500),
    mapsUrl: absoluteUrl,
    onlineEventUrl: absoluteUrl,
    bannerUrl: z.string().max(500),
    posterUrl: z.string().max(500),
    brochureUrl: z.string().max(500),
    programmeUrl: z.string().max(500),
    registrationRequired: z.boolean(),
    registrationUrl: absoluteUrl,
    registrationDeadline: isoDate.nullable(),
    enquiryEmail: z.string().max(200),
    contactPhone: z.string().max(60),
    publicationStatus: z.enum(["draft", "scheduled", "published", "archived"]),
    organiserStatus: z.enum(["scheduled", "cancelled", "postponed"]),
    featured: z.boolean(),
    displayOrder: z.coerce.number().int().min(0).max(999),
    promotionStart: optionalInstant,
    promotionEnd: optionalInstant,
    seoTitle: z.string().max(200),
    seoDescription: z.string().max(400),
  })
  .refine((value) => !value.endDate || value.endDate >= value.startDate, {
    message: "The end date cannot be before the start date.",
    path: ["endDate"],
  })
  .refine((value) => !value.enquiryEmail || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.enquiryEmail), {
    message: "Use an email address for enquiries.",
    path: ["enquiryEmail"],
  });

export type EventInput = z.infer<typeof eventInputSchema>;

export const registrationSchema = z.object({
  fullName: z.string().min(2, "Enter your full name.").max(120),
  email: z.string().email("Enter a valid email address.").max(200),
  phone: z
    .string()
    .max(40)
    .refine((value) => value === "" || /^[0-9+()\s-]{7,}$/.test(value), "Enter a telephone number."),
  organisation: z.string().max(200),
  attendeeCount: z.coerce.number().int().min(1, "At least one attendee.").max(50),
  additionalInformation: z.string().max(1000),
  consent: z.literal("yes", { errorMap: () => ({ message: "Consent is required." }) }),
});

export const enquirySchema = z.object({
  name: z.string().min(2, "Enter your name.").max(120),
  email: z.string().email("Enter a valid email address.").max(200),
  phone: z
    .string()
    .max(40)
    .refine((value) => value === "" || /^[0-9+()\s-]{7,}$/.test(value), "Enter a telephone number."),
  message: z.string().min(10, "Tell us what you need.").max(2000),
});

export const categorySchema = z.object({
  name: z.string().min(2).max(120),
  slug: z
    .string()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9-]+$/, "Use lower-case letters, numbers and hyphens."),
  description: z.string().max(400),
  displayOrder: z.coerce.number().int().min(0).max(999),
  active: z.boolean(),
});

export type CategoryInput = z.infer<typeof categorySchema>;

export const announcementInputSchema = z.object({
  title: z.string().min(3).max(200),
  slug: z
    .string()
    .min(3)
    .max(90)
    .regex(/^[a-z0-9-]+$/, "Use lower-case letters, numbers and hyphens."),
  category: z.string().min(2).max(80),
  shortDescription: z.string().max(400),
  fullDescription: z.string().max(12000),
  featuredImage: z.string().max(500),
  attachmentUrl: z.string().max(500),
  publicationStatus: z.enum(["draft", "scheduled", "published", "archived"]),
  urgent: z.boolean(),
  featured: z.boolean(),
  publishedAt: optionalInstant,
  expiryDate: isoDate.nullable(),
});

export type AnnouncementInput = z.infer<typeof announcementInputSchema>;
