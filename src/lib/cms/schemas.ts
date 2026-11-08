import { z } from "zod";

/* --------------------------------------------------------------------------
 * Editable content contracts.
 *
 * These schemas do double duty: they validate anything the console saves, and
 * they describe the fields the console renders. Values the Society has not
 * verified are never given defaults here.
 * ------------------------------------------------------------------------ */

const line = z.string().max(300);
const paragraph = z.string().max(4000);
const url = z.string().max(500).refine((value) => value === "" || /^https?:\/\//.test(value), {
  message: "Use a full https:// address.",
});

export const phoneSchema = z.object({ label: line, value: line });
export const emailSchema = z.object({ label: line, value: line });
export const hourSchema = z.object({ days: line, time: line });
export const portalSchema = z.object({ label: line, name: line, href: url, description: line });
export const socialSchema = z.object({ label: line, href: url });

export const contactSettingsSchema = z.object({
  name: line.min(1),
  shortName: line.min(1),
  legalName: line.min(1),
  tagline: line,
  description: paragraph,
  contact: z.object({
    addressLines: z.array(line).min(1).max(6),
    address: paragraph,
    mapQuery: line,
    phones: z.array(phoneSchema).min(1).max(3),
    emails: z.array(emailSchema).min(1).max(3),
    hours: z.array(hourSchema).min(1).max(4),
  }),
  portals: z.array(portalSchema).max(6),
  social: z.array(socialSchema).max(8),
  registration: z.object({ label: line, href: url }).nullable(),
});

export type ContactSettings = z.infer<typeof contactSettingsSchema>;

export const serviceBodyBlockSchema = z.object({
  heading: line.optional(),
  paragraphs: z.array(paragraph).max(12),
  bullets: z.array(line).max(12).optional(),
});

export const serviceSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/).max(80),
  title: line.min(1),
  shortTitle: line.min(1),
  index: z.string().max(4),
  summary: paragraph,
  intro: paragraph,
  body: z.array(serviceBodyBlockSchema).max(10),
  facts: z.array(z.object({ label: line, value: line })).max(8).optional(),
  reviewNote: paragraph.optional(),
  rates: z.enum(["bond", "loans"]).optional(),
  related: z.array(z.string()).max(6),
  cta: z.object({ label: line, href: line }),
});

export type ServiceDocument = z.infer<typeof serviceSchema>;

export const rateRowSchema = z.object({
  label: line.min(1),
  previous: line,
  current: line,
  unchanged: z.boolean().optional(),
});

export const rateNoticeSchema = z.object({
  title: line.min(1),
  approvedOn: line.min(1),
  effectiveFrom: line.min(1),
  reason: paragraph,
});

export const ratesSchema = z.object({
  notice: rateNoticeSchema,
  bondPlans: z
    .array(z.object({ name: line.min(1), rows: z.array(rateRowSchema).max(12) }))
    .max(6),
  loanRates: z.array(rateRowSchema).max(20),
});

export type RatesDocument = z.infer<typeof ratesSchema>;

export const faqSchema = z.object({
  groups: z
    .array(
      z.object({
        title: line.min(1),
        items: z.array(z.object({ q: paragraph, a: paragraph })).max(30),
      }),
    )
    .max(9),
});

export type FaqDocument = z.infer<typeof faqSchema>;

export const articleSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/).max(80),
  title: line.min(1),
  category: line.min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  excerpt: paragraph,
  featured: z.boolean(),
  image: z.string().max(500).nullable(),
  imageAlt: line,
  body: z.array(paragraph).max(60),
  sourceUrl: url.optional(),
});

export type ArticleDocument = z.infer<typeof articleSchema>;

export const partnerSchema = z.object({
  organisationName: line.min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/).max(80),
  logoUrl: z.string().max(500),
  websiteUrl: url,
  description: paragraph,
  category: line,
  displayOrder: z.coerce.number().int().min(0).max(999),
  active: z.boolean(),
  logoBackground: z.enum(["light", "dark"]).default("light"),
});

export type PartnerDocument = z.infer<typeof partnerSchema>;

export const projectSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/).max(80),
  name: line.min(1),
  city: line,
  state: line,
  location: line,
  status: line,
  type: line,
  summary: paragraph,
  description: z.array(paragraph).max(40),
  image: z.string().max(500).nullable(),
  imageAlt: line.optional(),
  imageBadge: line.optional(),
  imageNote: line.optional(),
});

export type ProjectDocument = z.infer<typeof projectSchema>;
