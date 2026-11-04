import "server-only";
import { cache } from "react";
import { getEntry, listEntries } from "@/lib/cms/store";
import { getContactSettings } from "./settings";
import { services as serviceDefaults, type Service } from "./services";
import { faqGroups } from "./faq";
import { bondPlans as bondDefaults, loanRates as loanDefaults, rateNotice as noticeDefaults } from "./rates";
import {
  getArticles as getArticlesFallback,
  getProjects as getProjectsFallback,
} from "@/lib/content";
import { getCreditPolicy as getPolicyFallback, normalisePolicy, type CreditPolicyStore } from "./credit-policy";
import type { ArticleDocument, FaqDocument, ProjectDocument, RatesDocument } from "@/lib/cms/schemas";

/**
 * Public content queries.
 *
 * Published Supabase documents win; when Supabase is not configured, or a
 * collection has not been seeded yet, the verified files in `content/` are
 * served instead. `cache` deduplicates the work within a single request.
 */

export { getContactSettings };

/* -------------------------------- services -------------------------------- */

export const listServices = cache(async (): Promise<Service[]> => {
  const entries = await listEntries<Service>("services");
  if (entries.length === 0) return serviceDefaults;

  const order = new Map(serviceDefaults.map((service, index) => [service.slug, index]));
  return entries
    .map((entry) => entry.data)
    .sort((a, b) => (order.get(a.slug) ?? 99) - (order.get(b.slug) ?? 99));
});

export const findService = cache(async (slug: string): Promise<Service | undefined> => {
  return (await listServices()).find((service) => service.slug === slug);
});

/* ---------------------------------- news ---------------------------------- */

export const listArticles = cache(async (): Promise<ArticleDocument[]> => {
  const entries = await listEntries<ArticleDocument>("news");
  if (entries.length === 0) return getArticlesFallback();

  return entries
    .map((entry) => entry.data)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
});

export const findArticle = cache(async (slug: string): Promise<ArticleDocument | undefined> => {
  return (await listArticles()).find((article) => article.slug === slug);
});

/* -------------------------------- projects -------------------------------- */

export const listProjects = cache(async (): Promise<ProjectDocument[]> => {
  const entries = await listEntries<ProjectDocument>("projects");
  if (entries.length === 0) return getProjectsFallback();
  return entries.map((entry) => entry.data);
});

export const findProject = cache(async (slug: string): Promise<ProjectDocument | undefined> => {
  return (await listProjects()).find((project) => project.slug === slug);
});

export const getProjectsIntro = cache(async (): Promise<string> => {
  const entry = await getEntry<{ intro: string }>("settings", "projects-intro");
  return (
    entry?.data.intro ??
    "The Society's property portfolio spans Abuja and other Nigerian cities, delivered with appointed developers under project agreements. Pricing, availability and delivery schedules are confirmed by the Secretariat on enquiry."
  );
});

/* ----------------------------------- faq ---------------------------------- */

export const getFaqGroups = cache(async (): Promise<FaqDocument["groups"]> => {
  const entry = await getEntry<FaqDocument>("faq", "main");
  return entry?.data.groups?.length ? entry.data.groups : faqGroups;
});

/* ---------------------------------- rates --------------------------------- */

export const getRates = cache(async (): Promise<RatesDocument> => {
  const entry = await getEntry<RatesDocument>("rates", "main");
  if (entry?.data?.notice && entry.data.bondPlans?.length) return entry.data;

  return {
    notice: { ...noticeDefaults, reason: noticeDefaults.reason },
    bondPlans: bondDefaults,
    loanRates: loanDefaults,
  } as RatesDocument;
});

/* ------------------------------ credit policy ----------------------------- */

export const getCreditPolicy = cache(async (): Promise<CreditPolicyStore> => {
  const entry = await getEntry<CreditPolicyStore>("credit-policy", "main");
  if (!entry) return getPolicyFallback();
  return normalisePolicy(entry.data);
});

export const isPolicyApproved = cache(async (): Promise<boolean> => {
  return (await getCreditPolicy()).version.state === "approved";
});

export async function policyRobots(): Promise<{ index: boolean; follow: boolean }> {
  return (await isPolicyApproved())
    ? { index: true, follow: true }
    : { index: false, follow: false };
}

