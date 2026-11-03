import "server-only";
import fs from "node:fs";
import path from "node:path";
import {
  getCreditPolicy,
  type CreditPolicyStore,
  type Facility,
  type LimitRow,
} from "@/content/credit-policy";

/* --------------------------------------------------------------------------
 * Write side of the credit policy store.
 *
 * Two rules apply to every write:
 *   1. A change to approved policy text demotes the record to
 *      "pending-verification", so the revised wording is never treated as
 *      approved policy until a person approves it explicitly.
 *   2. The superseded version is kept in `versions`, so an older policy can be
 *      read and the document it pointed to can still be downloaded.
 * ------------------------------------------------------------------------ */

function storePath(): string {
  return path.join(process.cwd(), "content", "credit-policy.json");
}

export function readPolicyStore(): CreditPolicyStore {
  return JSON.parse(fs.readFileSync(storePath(), "utf8")) as CreditPolicyStore;
}

function writePolicyStore(store: CreditPolicyStore): void {
  store.updatedAt = new Date().toISOString();
  const target = storePath();
  const temporary = `${target}.tmp`;
  fs.writeFileSync(temporary, `${JSON.stringify(store, null, 2)}\n`, "utf8");
  fs.renameSync(temporary, target);
}

/** Any edit to policy wording withdraws its approved status. */
function demote(store: CreditPolicyStore): void {
  if (store.version.state === "approved") {
    store.version.state = "pending-verification";
  }
}

export type PolicyMetaInput = {
  title: string;
  documentReference: string;
  issueDate: string;
  effectiveFrom: string;
  approvedBy: string;
  reviewCycle: string;
  sourceFile: string;
};

export function savePolicyMeta(input: PolicyMetaInput): void {
  const store = readPolicyStore();
  store.version = {
    ...store.version,
    title: input.title || store.version.title,
    documentReference: input.documentReference,
    issueDate: input.issueDate,
    effectiveFrom: input.effectiveFrom,
    approvedBy: input.approvedBy,
    reviewCycle: input.reviewCycle,
    sourceFile: input.sourceFile || store.version.sourceFile,
  };
  demote(store);
  writePolicyStore(store);
}

export type FacilityInput = {
  name: string;
  kind: string;
  clause: string;
  ref: string;
  summary: string;
  description: string;
  amountBasis: string;
  tenor: string;
  interest: string;
  security: string;
  guarantor: string;
  approval: string;
  eligibility: string[];
  conditions: string[];
};

export function saveFacility(slug: string, input: FacilityInput): void {
  const store = readPolicyStore();
  const index = store.facilities.findIndex((facility) => facility.slug === slug);
  if (index < 0) return;

  const existing = store.facilities[index];
  const updated: Facility = {
    ...existing,
    name: input.name || existing.name,
    kind: input.kind,
    clause: input.clause,
    ref: input.ref,
    summary: input.summary,
    description: input.description,
    amountBasis: input.amountBasis,
    tenor: input.tenor,
    interest: input.interest,
    security: input.security,
    guarantor: input.guarantor,
    approval: input.approval,
    eligibility: input.eligibility,
    conditions: input.conditions,
  };

  store.facilities[index] = updated;
  demote(store);
  writePolicyStore(store);
}

export function saveLimits(rows: LimitRow[]): void {
  const store = readPolicyStore();
  store.globalLimits.rows = rows;
  demote(store);
  writePolicyStore(store);
}

/** Explicit publication step. Nothing becomes approved policy without this. */
export function approvePolicy(approver: string, effectiveFrom: string): boolean {
  if (!approver.trim()) return false;
  const store = readPolicyStore();
  store.version.state = "approved";
  store.version.approvedBy = approver.trim();
  if (effectiveFrom) {
    store.version.effectiveFrom = effectiveFrom;
    store.version.effectivePrecision = "day";
  }
  writePolicyStore(store);
  return true;
}

export function archivePolicy(note: string): void {
  const store = readPolicyStore();
  const version = store.version;

  store.versions = [
    {
      code: version.code,
      issueDate: version.issueDate,
      effectiveFrom: version.effectiveFrom,
      archivedOn: new Date().toISOString().slice(0, 10),
      approvedBy: version.approvedBy,
      documentReference: version.documentReference,
      sourceFile: version.sourceFile,
      note: note.trim() || "Superseded by a later revision.",
    },
    ...store.versions.filter((entry) => entry.code !== version.code),
  ];

  store.version.state = "superseded";
  writePolicyStore(store);
}

/** Stores an uploaded replacement policy document and returns its public path. */
export function savePolicyDocument(originalName: string, data: Buffer): string {
  const directory = path.join(process.cwd(), "public", "documents");
  fs.mkdirSync(directory, { recursive: true });

  const base = path
    .basename(originalName || "credit-policy")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
  const safe = base.toLowerCase().endsWith(".pdf") ? base : `${base}.pdf`;
  const unique = `${Date.now()}-${safe}`;

  fs.writeFileSync(path.join(directory, unique), data);
  return `/documents/${unique}`;
}

export function summarisePolicyState(): { approved: boolean; label: string; updatedAt: string } {
  const store = getCreditPolicy();
  const labels: Record<string, string> = {
    draft: "Draft",
    "pending-verification": "Awaiting verification",
    approved: "Approved",
    superseded: "Superseded",
  };

  return {
    approved: store.version.state === "approved",
    label: labels[store.version.state] ?? store.version.state,
    updatedAt: store.updatedAt,
  };
}
