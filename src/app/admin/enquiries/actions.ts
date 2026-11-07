"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/cms/auth";
import { logAudit } from "@/lib/cms/store";
import {
  departmentLabel,
  getCase,
  updateCase,
  type CaseStatus,
  type Department,
  type EnquiryCase,
} from "@/lib/crm/cases";

/**
 * Case actions. All writes are re-checked against the signed-in staff member
 * here, because the case store is read with the service role and bypasses RLS.
 */

function refresh() {
  revalidatePath("/admin/enquiries");
  revalidatePath("/admin/enquiries/reports");
}

export async function assignCase(formData: FormData) {
  const staff = await requireStaff();
  const reference = String(formData.get("reference") ?? "");
  if (!reference) return;

  const department = String(formData.get("department") ?? "") as Department;
  const officer = String(formData.get("officer") ?? "").trim().slice(0, 120);
  const priority = String(formData.get("priority") ?? "normal") === "high" ? "high" : "normal";

  const current = await getCase(reference);
  const notes = [
    ...(current?.notes ?? []),
    {
      at: new Date().toISOString(),
      by: staff.name,
      body: `Assigned to ${officer || "the department queue"} (${departmentLabel(department)}).`,
    },
  ].slice(-100);

  await updateCase(reference, {
    department,
    officer,
    priority,
    status: officer ? "assigned" : "new",
    notes,
  });

  await logAudit({
    actor: staff,
    action: "case-assign",
    collection: "enquiry-cases",
    slug: reference,
    detail: { department, officer, priority },
  });

  refresh();
}

export async function setCaseStatus(formData: FormData) {
  const staff = await requireStaff();
  const reference = String(formData.get("reference") ?? "");
  const status = String(formData.get("status") ?? "") as CaseStatus;
  if (!reference || !status) return;

  const patch: Partial<EnquiryCase> = { status };
  if (status === "resolved" || status === "closed") patch.resolvedAt = new Date().toISOString();
  if (status === "new" || status === "in-progress") patch.resolvedAt = null;

  await updateCase(reference, patch);

  await logAudit({
    actor: staff,
    action: `case-${status}`,
    collection: "enquiry-cases",
    slug: reference,
  });

  refresh();
}

export async function addCaseNote(formData: FormData) {
  const staff = await requireStaff();
  const reference = String(formData.get("reference") ?? "");
  const body = String(formData.get("body") ?? "").trim().slice(0, 2000);
  if (!reference || !body) return;

  const entry = await getCase(reference);
  const notes = [...(entry?.notes ?? []), { at: new Date().toISOString(), by: staff.name, body }].slice(-100);
  await updateCase(reference, { notes });

  await logAudit({
    actor: staff,
    action: "case-note",
    collection: "enquiry-cases",
    slug: reference,
  });

  refresh();
}

export async function recordCaseReply(formData: FormData) {
  const staff = await requireStaff();
  const reference = String(formData.get("reference") ?? "");
  const body = String(formData.get("body") ?? "").trim().slice(0, 4000);
  if (!reference || !body) return;

  const entry = await getCase(reference);
  const now = new Date().toISOString();
  const responses = [...(entry?.responses ?? []), { at: now, by: staff.name, body, channel: "portal" }].slice(-50);

  await updateCase(reference, {
    responses,
    firstResponseAt: entry?.firstResponseAt ?? now,
    status: "awaiting-customer",
  });

  await logAudit({
    actor: staff,
    action: "case-reply",
    collection: "enquiry-cases",
    slug: reference,
  });

  refresh();
}
