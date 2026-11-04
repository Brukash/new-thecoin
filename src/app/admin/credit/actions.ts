"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/cms/auth";
import {
  approvePolicy,
  archivePolicy,
  readPolicyStore,
  saveFacility,
  saveLimits,
  savePolicyDocument,
  savePolicyMeta,
} from "@/lib/credit-admin";
import type { LimitRow } from "@/content/credit-policy";

async function requireAdmin(): Promise<void> {
  await requireStaff();
}

function text(form: FormData, key: string): string {
  const value = form.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function lines(form: FormData, key: string): string[] {
  return text(form, key)
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*[-•]\s*/, "").trim())
    .filter(Boolean);
}

function refresh(): void {
  revalidatePath("/services/credit", "layout");
  revalidatePath("/services", "layout");
  revalidatePath("/admin/credit");
}

export async function saveDetails(form: FormData): Promise<void> {
  await requireAdmin();
  savePolicyMeta({
    title: text(form, "title"),
    documentReference: text(form, "documentReference"),
    issueDate: text(form, "issueDate"),
    effectiveFrom: text(form, "effectiveFrom"),
    approvedBy: text(form, "approvedBy"),
    reviewCycle: text(form, "reviewCycle"),
    sourceFile: text(form, "sourceFile"),
  });
  refresh();
  redirect("/admin/credit?saved=details");
}

export async function saveFacilityDetails(form: FormData): Promise<void> {
  await requireAdmin();
  const slug = text(form, "slug");

  saveFacility(slug, {
    name: text(form, "name"),
    kind: text(form, "kind"),
    clause: text(form, "clause"),
    ref: text(form, "ref"),
    summary: text(form, "summary"),
    description: text(form, "description"),
    amountBasis: text(form, "amountBasis"),
    tenor: text(form, "tenor"),
    interest: text(form, "interest"),
    security: text(form, "security"),
    guarantor: text(form, "guarantor"),
    approval: text(form, "approval"),
    eligibility: lines(form, "eligibility"),
    conditions: lines(form, "conditions"),
  });

  refresh();
  redirect(`/admin/credit/${slug}?saved=1`);
}

export async function saveLimitTable(form: FormData): Promise<void> {
  await requireAdmin();
  const store = readPolicyStore();

  const rows: LimitRow[] = store.globalLimits.rows.map((row, index) => ({
    sno: row.sno,
    status: text(form, `grade-${index}`) || row.status,
    globalLimit: text(form, `global-${index}`) || row.globalLimit,
    maxDeductible: text(form, `deductible-${index}`) || row.maxDeductible,
  }));

  saveLimits(rows);
  refresh();
  redirect("/admin/credit?saved=limits");
}

export async function publishPolicy(form: FormData): Promise<void> {
  await requireAdmin();
  if (text(form, "confirm").toUpperCase() !== "APPROVE") {
    redirect("/admin/credit?error=confirm");
  }

  const approved = approvePolicy(text(form, "approver"), text(form, "effectiveFrom"));
  if (!approved) redirect("/admin/credit?error=approver");

  refresh();
  revalidatePath("/", "layout");
  redirect("/admin/credit?saved=published");
}

export async function withdrawPolicy(form: FormData): Promise<void> {
  await requireAdmin();
  archivePolicy(text(form, "note"));
  refresh();
  redirect("/admin/credit?saved=archived");
}

export async function uploadPolicyDocument(form: FormData): Promise<void> {
  await requireAdmin();
  const file = form.get("document");

  if (!(file instanceof File) || file.size === 0) {
    redirect("/admin/credit?error=file");
  }
  if (!file.name.toLowerCase().endsWith(".pdf")) {
    redirect("/admin/credit?error=type");
  }
  if (file.size > 15 * 1024 * 1024) {
    redirect("/admin/credit?error=size");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const publicPath = savePolicyDocument(file.name, buffer);

  const store = readPolicyStore();
  const previous = store.version.sourceFile;
  store.version.sourceFile = publicPath;
  store.version.state = "pending-verification";

  const fs = await import("node:fs");
  const path = await import("node:path");
  fs.writeFileSync(
    path.join(process.cwd(), "content", "credit-policy.json"),
    `${JSON.stringify(store, null, 2)}\n`,
    "utf8",
  );

  refresh();
  redirect(`/admin/credit?saved=document&previous=${encodeURIComponent(previous)}`);
}
