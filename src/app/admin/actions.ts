"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getStaffUser, requireStaff } from "@/lib/cms/auth";
import {
  deleteEntry,
  deleteMedia,
  getEntry,
  listEntries,
  saveEntry,
  setEnquiryHandled,
  setMediaAlt,
  uploadMedia,
} from "@/lib/cms/store";
import {
  articleSchema,
  contactSettingsSchema,
  faqSchema,
  partnerSchema,
  projectSchema,
  ratesSchema,
  serviceSchema,
  type ArticleDocument,
  type FaqDocument,
  type ProjectDocument,
  type RatesDocument,
  type ServiceDocument,
} from "@/lib/cms/schemas";
import {
  deletePartner,
  listPartners,
  movePartner,
  savePartner,
  setPartnerActive,
  uploadPartnerLogo,
} from "@/lib/cms/partners";
import { createSessionClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSession, destroySession, isAdminConfigured, verifyPassword } from "@/lib/admin-auth";

function text(form: FormData, key: string): string {
  return String(form.get(key) ?? "").trim();
}

function paragraphs(value: string): string[] {
  return value
    .split(/\r?\n\s*\r?\n/)
    .map((paragraph) => paragraph.replace(/\s*\r?\n\s*/g, " ").trim())
    .filter(Boolean);
}

function lines(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function pairs(value: string): { label: string; value: string }[] {
  return lines(value).map((line) => {
    const [label, ...rest] = line.split("|");
    return { label: (label ?? "").trim(), value: rest.join("|").trim() };
  });
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

async function uniqueSlug(
  collection: "news" | "projects" | "services",
  base: string,
): Promise<string> {
  const entries = await listEntries(collection, { includeDrafts: true });
  const taken = new Set(entries.map((entry) => entry.slug));
  const root = slugify(base) || "item";
  if (!taken.has(root)) return root;
  let index = 2;
  while (taken.has(`${root}-${index}`)) index += 1;
  return `${root}-${index}`;
}

function refresh(): void {
  revalidatePath("/", "layout");
}

/* ---------------------------------- auth --------------------------------- */

export async function signIn(
  _previous: { error?: string } | null,
  form: FormData,
): Promise<{ error?: string }> {
  const email = text(form, "email");
  const password = text(form, "password");

  if (isSupabaseConfigured()) {
    const supabase = await createSessionClient();
    if (!supabase) return { error: "The CMS is not configured yet." };

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: "Those credentials were not accepted." };

    const user = await getStaffUser();
    if (!user) {
      await supabase.auth.signOut();
      return { error: "This account is not authorised to publish content." };
    }
  } else {
    if (!isAdminConfigured()) {
      return {
        error:
          "Neither Supabase nor the local staff password is configured. Set the Supabase keys or ADMIN_PASSWORD and SESSION_SECRET.",
      };
    }
    if (!verifyPassword(password)) return { error: "That password is not correct." };
    await createSession();
  }

  redirect("/admin");
}

export async function signOut(): Promise<void> {
  if (isSupabaseConfigured()) {
    const supabase = await createSessionClient();
    await supabase?.auth.signOut();
  } else {
    await destroySession();
  }
  redirect(isSupabaseConfigured() ? "/admin/login" : "/admin");
}

/* ---------------------------------- news --------------------------------- */

export async function createArticle(form: FormData): Promise<void> {
  const actor = await requireStaff();
  const title = text(form, "title") || "Untitled notice";
  const slug = await uniqueSlug("news", title);

  const article: ArticleDocument = {
    slug,
    title,
    category: text(form, "category") || "announcements",
    date: new Date().toISOString().slice(0, 10),
    excerpt: "",
    featured: false,
    image: null,
    imageAlt: "",
    body: [],
  };

  await saveEntry({ collection: "news", slug, data: article, status: "draft", actor });
  refresh();
  redirect(`/admin/news/${slug}`);
}

export async function saveArticle(form: FormData): Promise<void> {
  const actor = await requireStaff();
  const slug = text(form, "slug");
  const existing = await getEntry<ArticleDocument>("news", slug, { includeDrafts: true });
  if (!existing) redirect("/admin");

  const parsed = articleSchema.safeParse({
    ...existing.data,
    title: text(form, "title") || existing.data.title,
    category: text(form, "category") || existing.data.category,
    date: text(form, "date") || existing.data.date,
    excerpt: text(form, "excerpt"),
    featured: form.get("featured") === "on",
    image: text(form, "image") || null,
    imageAlt: text(form, "imageAlt"),
    body: paragraphs(text(form, "body")),
  });

  if (!parsed.success) redirect(`/admin/news/${slug}?error=invalid`);

  const status = text(form, "intent") === "draft" ? "draft" : "published";
  await saveEntry({ collection: "news", slug, data: parsed.data, status, actor });
  refresh();
  redirect(`/admin?saved=${status === "draft" ? "draft" : "news"}`);
}

export async function deleteArticle(form: FormData): Promise<void> {
  const actor = await requireStaff();
  const slug = text(form, "slug");
  await deleteEntry("news", slug, actor);
  refresh();
  redirect("/admin?deleted=news");
}

/* -------------------------------- projects ------------------------------- */

export async function createProject(form: FormData): Promise<void> {
  const actor = await requireStaff();
  const name = text(form, "name") || "New project";
  const slug = await uniqueSlug("projects", name);

  const project: ProjectDocument = {
    slug,
    name,
    city: "",
    state: "",
    location: "",
    status: "Enquiries open",
    type: "Home ownership",
    summary: "",
    description: [],
    image: null,
  };

  await saveEntry({ collection: "projects", slug, data: project, status: "draft", actor });
  refresh();
  redirect(`/admin/projects/${slug}`);
}

export async function saveProject(form: FormData): Promise<void> {
  const actor = await requireStaff();
  const slug = text(form, "slug");
  const existing = await getEntry<ProjectDocument>("projects", slug, { includeDrafts: true });
  if (!existing) redirect("/admin");

  const parsed = projectSchema.safeParse({
    ...existing.data,
    name: text(form, "name") || existing.data.name,
    city: text(form, "city"),
    state: text(form, "state"),
    location: text(form, "location"),
    status: text(form, "status") || existing.data.status,
    type: text(form, "type") || existing.data.type,
    summary: text(form, "summary"),
    description: paragraphs(text(form, "description")),
    image: text(form, "image") || null,
  });

  if (!parsed.success) redirect(`/admin/projects/${slug}?error=invalid`);

  const status = text(form, "intent") === "draft" ? "draft" : "published";
  await saveEntry({ collection: "projects", slug, data: parsed.data, status, actor });
  refresh();
  redirect(`/admin?saved=${status === "draft" ? "draft" : "projects"}`);
}

export async function deleteProject(form: FormData): Promise<void> {
  const actor = await requireStaff();
  const slug = text(form, "slug");
  await deleteEntry("projects", slug, actor);
  refresh();
  redirect("/admin?deleted=projects");
}

/* -------------------------------- services ------------------------------- */

function bodyBlocks(value: string): ServiceDocument["body"] {
  const blocks: ServiceDocument["body"] = [];

  for (const raw of value.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;

    if (line.startsWith("## ")) {
      blocks.push({ heading: line.slice(3).trim(), paragraphs: [] });
    } else if (blocks.length === 0) {
      blocks.push({ paragraphs: [line] });
    } else {
      blocks[blocks.length - 1].paragraphs.push(line);
    }
  }

  return blocks;
}

export async function createService(form: FormData): Promise<void> {
  const actor = await requireStaff();
  const title = text(form, "title") || "New service";
  const slug = await uniqueSlug("services", title);

  const service: ServiceDocument = {
    slug,
    title,
    shortTitle: title,
    index: "00",
    summary: "",
    intro: "",
    body: [],
    related: [],
    cta: { label: "Contact the Secretariat", href: "/contact" },
  };

  await saveEntry({ collection: "services", slug, data: service, status: "draft", actor });
  refresh();
  redirect(`/admin/services/${slug}`);
}

export async function saveService(form: FormData): Promise<void> {
  const actor = await requireStaff();
  const slug = text(form, "slug");
  const existing = await getEntry<ServiceDocument>("services", slug, { includeDrafts: true });
  if (!existing) redirect("/admin/services");

  const rateKind = text(form, "rates");
  const parsed = serviceSchema.safeParse({
    ...existing.data,
    title: text(form, "title") || existing.data.title,
    shortTitle: text(form, "shortTitle") || existing.data.shortTitle,
    index: text(form, "index") || existing.data.index,
    summary: text(form, "summary"),
    intro: text(form, "intro"),
    body: bodyBlocks(text(form, "body")),
    facts: pairs(text(form, "facts")).filter((row) => row.label || row.value),
    reviewNote: text(form, "reviewNote") || undefined,
    rates: rateKind === "bond" || rateKind === "loans" ? rateKind : undefined,
    related: lines(text(form, "related")),
    cta: {
      label: text(form, "ctaLabel") || existing.data.cta.label,
      href: text(form, "ctaHref") || existing.data.cta.href,
    },
  });

  if (!parsed.success) redirect(`/admin/services/${slug}?error=invalid`);

  const status = text(form, "intent") === "draft" ? "draft" : "published";
  await saveEntry({ collection: "services", slug, data: parsed.data, status, actor });
  refresh();
  redirect(`/admin?saved=${status === "draft" ? "draft" : "services"}`);
}

export async function deleteService(form: FormData): Promise<void> {
  const actor = await requireStaff();
  await deleteEntry("services", text(form, "slug"), actor);
  refresh();
  redirect("/admin/services?deleted=1");
}

/* ----------------------------------- faq --------------------------------- */

export async function saveFaq(form: FormData): Promise<void> {
  const actor = await requireStaff();
  const groups: FaqDocument["groups"] = [];

  for (let index = 0; index < 8; index += 1) {
    const title = text(form, `title-${index}`);
    const items = lines(text(form, `items-${index}`))
      .map((line) => {
        const [q, ...rest] = line.split("|");
        return { q: (q ?? "").trim(), a: rest.join("|").trim() };
      })
      .filter((item) => item.q && item.a);

    if (title) groups.push({ title, items });
  }

  const parsed = faqSchema.safeParse({ groups });
  if (!parsed.success) redirect("/admin/faq?error=invalid");

  await saveEntry({ collection: "faq", slug: "main", data: parsed.data, status: "published", actor });
  refresh();
  redirect("/admin/faq?saved=1");
}

/* ---------------------------------- rates -------------------------------- */

function rateRows(value: string): RatesDocument["loanRates"] {
  return lines(value)
    .map((line) => {
      const [label = "", previous = "", current = previous] = line
        .split("|")
        .map((part) => part.trim());
      return { label, previous, current, unchanged: Boolean(previous) && previous === current };
    })
    .filter((row) => row.label);
}

function ratePlans(value: string): RatesDocument["bondPlans"] {
  const plans: RatesDocument["bondPlans"] = [];

  for (const raw of value.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;

    if (line.startsWith("## ")) {
      plans.push({ name: line.slice(3).trim(), rows: [] });
      continue;
    }

    if (plans.length === 0) continue;
    const [label = "", previous = "", current = previous] = line
      .split("|")
      .map((part) => part.trim());
    if (label) {
      plans[plans.length - 1].rows.push({
        label,
        previous,
        current,
        unchanged: Boolean(previous) && previous === current,
      });
    }
  }

  return plans;
}

export async function saveRates(form: FormData): Promise<void> {
  const actor = await requireStaff();

  const parsed = ratesSchema.safeParse({
    notice: {
      title: text(form, "noticeTitle"),
      approvedOn: text(form, "approvedOn"),
      effectiveFrom: text(form, "effectiveFrom"),
      reason: text(form, "reason"),
    },
    bondPlans: ratePlans(text(form, "bondPlans")),
    loanRates: rateRows(text(form, "loanRates")),
  });

  if (!parsed.success) redirect("/admin/rates?error=invalid");

  await saveEntry({ collection: "rates", slug: "main", data: parsed.data, status: "published", actor });
  refresh();
  redirect("/admin/rates?saved=1");
}

/* ---------------------------------- media -------------------------------- */

export async function uploadMediaAction(form: FormData): Promise<void> {
  const actor = await requireStaff();
  const file = form.get("file");

  if (!(file instanceof File) || file.size === 0) redirect("/admin/media?error=file");

  try {
    await uploadMedia(file, text(form, "alt"), actor);
  } catch {
    redirect("/admin/media?error=upload");
  }

  refresh();
  redirect("/admin/media?saved=1");
}

export async function deleteMediaAction(form: FormData): Promise<void> {
  const actor = await requireStaff();
  await deleteMedia(text(form, "path"), actor);
  refresh();
  redirect("/admin/media?deleted=1");
}

export async function updateMediaAltAction(form: FormData): Promise<void> {
  const actor = await requireStaff();
  await setMediaAlt(text(form, "path"), text(form, "alt"), actor);
  refresh();
  redirect("/admin/media?saved=alt");
}

/* -------------------------------- partners ------------------------------- */

export async function createPartner(form: FormData): Promise<void> {
  const actor = await requireStaff();
  const name = text(form, "name");
  if (!name) redirect("/admin/partners?error=name");

  const base = slugify(name) || "partner";
  const existing = await listPartners({ includeInactive: true });
  let slug = base;
  let suffix = 2;
  while (existing.some((partner) => partner.slug === slug)) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }

  const displayOrder = existing.reduce((max, partner) => Math.max(max, partner.displayOrder), 0) + 10;

  await savePartner(
    {
      organisationName: name,
      slug,
      logoUrl: "",
      websiteUrl: "",
      description: "",
      category: "Financial Services Partners",
      displayOrder,
      active: false,
    },
    actor,
  );

  refresh();
  redirect(`/admin/partners/${slug}?created=1`);
}

export async function savePartnerAction(form: FormData): Promise<void> {
  const actor = await requireStaff();
  const slug = text(form, "slug");
  if (!slug) redirect("/admin/partners?error=name");

  let logoUrl = text(form, "logoUrl");

  const file = form.get("logo");
  if (file instanceof File && file.size > 0) {
    try {
      logoUrl = await uploadPartnerLogo(file, slug);
    } catch {
      redirect(`/admin/partners/${slug}?error=upload`);
    }
  }

  if (text(form, "removeLogo") === "on") logoUrl = "";

  const parsed = partnerSchema.safeParse({
    organisationName: text(form, "organisationName"),
    slug,
    logoUrl,
    websiteUrl: text(form, "websiteUrl"),
    description: text(form, "description"),
    category: text(form, "category"),
    displayOrder: text(form, "displayOrder") || 0,
    active: text(form, "active") === "on",
  });

  if (!parsed.success) redirect(`/admin/partners/${slug}?error=invalid`);

  try {
    await savePartner(parsed.data, actor);
  } catch {
    redirect(`/admin/partners/${slug}?error=save`);
  }

  refresh();
  redirect(`/admin/partners/${slug}?saved=1`);
}

export async function togglePartnerAction(form: FormData): Promise<void> {
  const actor = await requireStaff();
  await setPartnerActive(text(form, "slug"), text(form, "active") === "true", actor);
  refresh();
  redirect("/admin/partners?toggled=1");
}

export async function movePartnerAction(form: FormData): Promise<void> {
  const actor = await requireStaff();
  await movePartner(text(form, "slug"), text(form, "direction") === "up" ? "up" : "down", actor);
  refresh();
  redirect("/admin/partners?moved=1");
}

export async function deletePartnerAction(form: FormData): Promise<void> {
  const actor = await requireStaff();
  await deletePartner(text(form, "slug"), actor);
  refresh();
  redirect("/admin/partners?deleted=1");
}

/* ------------------------------- enquiries ------------------------------- */

export async function setEnquiryStatus(form: FormData): Promise<void> {
  const actor = await requireStaff();
  const handled = text(form, "handled") === "true";

  await setEnquiryHandled(text(form, "id"), handled, actor);
  refresh();
  redirect(handled ? "/admin/enquiries?handled=1" : "/admin/enquiries?reopened=1");
}

/* -------------------------------- settings ------------------------------- */

export async function saveSettings(form: FormData): Promise<void> {
  const actor = await requireStaff();

  const phones = pairs(text(form, "phones")).map((row) => ({
    label: row.label || "Telephone",
    value: row.value || row.label,
  }));
  const emails = pairs(text(form, "emails")).map((row) => ({
    label: row.label || "Email",
    value: row.value || row.label,
  }));
  const hours = pairs(text(form, "hours")).map((row) => ({
    days: row.label,
    time: row.value,
  }));

  const parsed = contactSettingsSchema.safeParse({
    name: text(form, "name"),
    shortName: text(form, "shortName"),
    legalName: text(form, "legalName"),
    tagline: text(form, "tagline"),
    description: text(form, "description"),
    contact: {
      addressLines: lines(text(form, "addressLines")),
      address: text(form, "address"),
      mapQuery: text(form, "mapQuery"),
      phones: phones.length ? phones : [{ label: "Telephone", value: "" }],
      emails: emails.length ? emails : [{ label: "Email", value: "" }],
      hours: hours.length ? hours : [{ days: "Monday to Friday", time: "" }],
    },
    portals: [],
    social: [],
    registration: null,
  });

  if (!parsed.success) redirect("/admin/settings?error=invalid");

  await saveEntry({
    collection: "settings",
    slug: "main",
    data: parsed.data,
    status: "published",
    actor,
  });
  refresh();
  redirect("/admin/settings?saved=1");
}
