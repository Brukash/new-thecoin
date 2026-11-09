import "server-only";
import { createServiceClient } from "@/lib/supabase/server";
import { hasServiceRole } from "@/lib/supabase/config";

/**
 * Enquiry cases.
 *
 * Messages stay in `public.enquiries`; the workflow around them — department,
 * officer, status, SLA, internal notes, replies and feedback — is stored as a
 * document in `public.content_entries` under the `enquiry-cases` collection,
 * keyed by the enquiry reference. That keeps one source of truth for what the
 * customer wrote, and lets the CRM grow without a schema migration.
 */

export const DEPARTMENTS = [
  { value: "secretariat", label: "Secretariat", slaHours: 72 },
  { value: "membership", label: "Membership", slaHours: 48 },
  { value: "credit", label: "Credit & savings", slaHours: 24 },
  { value: "investments", label: "Investments", slaHours: 48 },
  { value: "projects", label: "Projects & home ownership", slaHours: 48 },
  { value: "events", label: "Events & notices", slaHours: 48 },
] as const;

export type Department = (typeof DEPARTMENTS)[number]["value"];

export const STATUSES = [
  { value: "new", label: "New" },
  { value: "assigned", label: "Assigned" },
  { value: "in-progress", label: "In progress" },
  { value: "awaiting-customer", label: "Awaiting customer" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
] as const;

export type CaseStatus = (typeof STATUSES)[number]["value"];

export type CaseNote = { at: string; by: string; body: string };
export type CaseResponse = { at: string; by: string; body: string; channel: string };

export type EnquiryCase = {
  reference: string;
  type: string;
  department: Department;
  officer: string;
  status: CaseStatus;
  priority: "normal" | "high";
  createdAt: string;
  updatedAt: string;
  dueAt: string;
  firstResponseAt: string | null;
  resolvedAt: string | null;
  notes: CaseNote[];
  responses: CaseResponse[];
  feedback: { rating: number; comment: string; at: string } | null;
  acknowledgement: { sent: boolean; at: string | null };
};

const COLLECTION = "enquiry-cases";

export function departmentFor(type: string): Department {
  switch (type) {
    case "membership":
      return "membership";
    case "property":
      return "projects";
    case "advisory":
      return "credit";
    default:
      return "secretariat";
  }
}

export function departmentLabel(value: string): string {
  return DEPARTMENTS.find((entry) => entry.value === value)?.label ?? "Secretariat";
}

export function slaHoursFor(department: string): number {
  return DEPARTMENTS.find((entry) => entry.value === department)?.slaHours ?? 72;
}

export function dueAtFor(createdAt: string, department: string): string {
  return new Date(new Date(createdAt).getTime() + slaHoursFor(department) * 3_600_000).toISOString();
}

export function isOverdue(entry: EnquiryCase): boolean {
  return !["resolved", "closed"].includes(entry.status) && Date.now() > new Date(entry.dueAt).getTime();
}

export function slaState(entry: EnquiryCase): "met" | "breached" | "due" | "closed" {
  if (entry.status === "resolved" || entry.status === "closed") {
    if (!entry.resolvedAt) return "closed";
    return new Date(entry.resolvedAt) <= new Date(entry.dueAt) ? "met" : "breached";
  }
  return Date.now() > new Date(entry.dueAt).getTime() ? "breached" : "due";
}

function client() {
  return hasServiceRole() ? createServiceClient() : null;
}

function normalise(reference: string, data: Partial<EnquiryCase>, fallbackType = "general"): EnquiryCase {
  const department = data.department ?? departmentFor(data.type ?? fallbackType);
  const createdAt = data.createdAt ?? new Date().toISOString();

  return {
    reference,
    type: data.type ?? fallbackType,
    department,
    officer: data.officer ?? "",
    status: data.status ?? "new",
    priority: data.priority ?? "normal",
    createdAt,
    updatedAt: data.updatedAt ?? createdAt,
    dueAt: data.dueAt ?? dueAtFor(createdAt, department),
    firstResponseAt: data.firstResponseAt ?? null,
    resolvedAt: data.resolvedAt ?? null,
    notes: data.notes ?? [],
    responses: data.responses ?? [],
    feedback: data.feedback ?? null,
    acknowledgement: data.acknowledgement ?? { sent: false, at: null },
  };
}

export async function listCases(): Promise<EnquiryCase[]> {
  const db = client();
  if (!db) return [];

  const { data, error } = await db
    .from("content_entries")
    .select("slug, data")
    .eq("collection", COLLECTION)
    .order("updated_at", { ascending: false })
    .limit(500);

  if (error || !data) return [];
  return data.map((row) => normalise(row.slug as string, (row.data ?? {}) as Partial<EnquiryCase>));
}

export async function getCase(reference: string): Promise<EnquiryCase | null> {
  const db = client();
  if (!db) return null;

  const { data } = await db
    .from("content_entries")
    .select("slug, data")
    .eq("collection", COLLECTION)
    .eq("slug", reference)
    .maybeSingle();

  if (!data) return null;
  return normalise(reference, (data.data ?? {}) as Partial<EnquiryCase>);
}

export async function saveCase(entry: EnquiryCase): Promise<void> {
  const db = client();
  if (!db) throw new Error("The case store is not configured.");

  const { error } = await db.from("content_entries").upsert(
    {
      collection: COLLECTION,
      slug: entry.reference,
      data: { ...entry, updatedAt: new Date().toISOString() },
      // Case documents hold internal notes, officer names and replies. They are
      // written as drafts so the public "published content" read policy can
      // never treat them as website copy; staff read them with the service role.
      status: "draft",
    },
    { onConflict: "collection,slug" },
  );

  if (error) throw new Error(error.message);
}

/** Creates the case for a freshly submitted enquiry, leaving an existing one untouched. */
export async function ensureCase(reference: string, type: string): Promise<EnquiryCase | null> {
  const existing = await getCase(reference);
  if (existing) return existing;

  const entry = normalise(reference, { type }, type);
  try {
    await saveCase(entry);
    return entry;
  } catch (error) {
    console.error("Failed to create enquiry case", error instanceof Error ? error.message : error);
    return null;
  }
}

export async function updateCase(
  reference: string,
  patch: Partial<EnquiryCase>,
): Promise<EnquiryCase> {
  const current = (await getCase(reference)) ?? normalise(reference, {});
  const next: EnquiryCase = { ...current, ...patch, updatedAt: new Date().toISOString() };

  if (patch.department && patch.department !== current.department && !patch.dueAt) {
    next.dueAt = dueAtFor(current.createdAt, patch.department);
  }

  await saveCase(next);
  return next;
}

/* ----------------------------- acknowledgement ---------------------------- */

/**
 * Sends the automatic acknowledgement. Delivery is configured in Knock; without
 * a key the case records that nothing was sent, so the inbox can show which
 * enquiries were never acknowledged rather than pretending.
 */
export async function sendAcknowledgement(input: {
  reference: string;
  email: string;
  name: string;
  department: string;
}): Promise<boolean> {
  const key = process.env.KNOCK_API_KEY;
  if (!key) return false;

  const workflow = process.env.KNOCK_ENQUIRY_WORKFLOW ?? "enquiry-acknowledgement";

  try {
    const response = await fetch(
      `https://api.knock.app/v1/workflows/${encodeURIComponent(workflow)}/trigger`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
        body: JSON.stringify({
          recipients: [{ id: input.email, email: input.email }],
          data: {
            name: input.name,
            reference: input.reference,
            department: departmentLabel(input.department),
          },
        }),
      },
    );
    return response.ok;
  } catch (error) {
    console.error("Acknowledgement failed", error instanceof Error ? error.message : error);
    return false;
  }
}
