import fs from "node:fs";
import path from "node:path";

/* --------------------------------------------------------------------------
 * Credit policy content layer
 *
 * The 2026 Credit Policy is stored in content/credit-policy.json, extracted
 * from the signed PDF in public/documents. Every borrowed figure carries the
 * clause and page it came from so that a reviewer can check it against the
 * source. The public pages read this file; the staff console writes to it.
 * ------------------------------------------------------------------------ */

export type PolicyState = "draft" | "pending-verification" | "approved" | "superseded";

export type PolicyVersion = {
  code: string;
  title: string;
  documentReference: string;
  issueDate: string;
  issuedBy: string;
  approvedBy: string;
  approvalNote: string;
  effectiveFrom: string;
  effectivePrecision: "day" | "month" | "year";
  reviewCycle: string;
  sourceFile: string;
  sourcePages: number;
  state: PolicyState;
  lastExtracted: string;
  copyright: string;
};

export type RefBlock = { text: string; ref: string };

export type Facility = {
  slug: string;
  name: string;
  clause: string;
  ref: string;
  kind: string;
  summary: string;
  description: string;
  eligibility: string[];
  amountBasis: string;
  tenor: string;
  interest: string;
  security: string;
  guarantor: string;
  conditions: string[];
  approval: string;
};

export type Overview = {
  purpose: string;
  objectivesIntro: string;
  objectives: string[];
  scope: RefBlock[];
  funding: string[];
  fundingRef: string;
  criteriaIntro: string;
  criteria: string[];
  criteriaRef: string;
  rejection: string;
  rejectionRef: string;
  limitPrinciples: RefBlock[];
};

export type ApplicationGroup = {
  title: string;
  items: { label: string; text: string; ref: string }[];
};

export type Repayment = {
  periods: { label: string; value: string; ref: string }[];
  periodsNote: string;
  sources: string[];
  sourcesRef: string;
  setOff: string;
  recall: string[];
  recallRef: string;
  penalty: string;
  recovery: RefBlock[];
  retirees: RefBlock[];
  pensioners: RefBlock[];
  portfolio: RefBlock[];
};

export type CreditRole = {
  role: string;
  clause: string;
  composition?: string;
  items: string[];
};

export type PolicyFaq = { group: string; q: string; a: string; refs: string[] };

export type PolicyFlag = { id: string; area: string; issue: string; refs: string };

export type LimitRow = {
  sno: string;
  status: string;
  globalLimit: string;
  maxDeductible: string;
};

/** A record of a policy version that was replaced by a later one. */
export type ArchivedVersion = {
  code: string;
  issueDate: string;
  effectiveFrom: string;
  archivedOn: string;
  approvedBy: string;
  documentReference: string;
  sourceFile: string;
  note: string;
};

export type CreditPolicyStore = {
  version: PolicyVersion;
  overview: Overview;
  facilities: Facility[];
  application: { intro: string; groups: ApplicationGroup[] };
  repayment: Repayment;
  administration: { intro: string; roles: CreditRole[]; authorisations: string[] };
  internalCredits: { title: string; items: RefBlock[] };
  review: { items: RefBlock[] };
  globalLimits: {
    title: string;
    intro: string;
    source: string;
    summary: string;
    rows: LimitRow[];
  };
  faqs: PolicyFaq[];
  flags: PolicyFlag[];
  versions: ArchivedVersion[];
  updatedAt: string;
};

const EMPTY: CreditPolicyStore = {
  version: {
    code: "",
    title: "Credit Policy",
    documentReference: "",
    issueDate: "",
    issuedBy: "",
    approvedBy: "",
    approvalNote: "",
    effectiveFrom: "",
    effectivePrecision: "month",
    reviewCycle: "",
    sourceFile: "",
    sourcePages: 0,
    state: "draft",
    lastExtracted: "",
    copyright: "",
  },
  overview: {
    purpose: "",
    objectivesIntro: "",
    objectives: [],
    scope: [],
    funding: [],
    fundingRef: "",
    criteriaIntro: "",
    criteria: [],
    criteriaRef: "",
    rejection: "",
    rejectionRef: "",
    limitPrinciples: [],
  },
  facilities: [],
  application: { intro: "", groups: [] },
  repayment: {
    periods: [],
    periodsNote: "",
    sources: [],
    sourcesRef: "",
    setOff: "",
    recall: [],
    recallRef: "",
    penalty: "",
    recovery: [],
    retirees: [],
    pensioners: [],
    portfolio: [],
  },
  administration: { intro: "", roles: [], authorisations: [] },
  internalCredits: { title: "", items: [] },
  review: { items: [] },
  globalLimits: { title: "", intro: "", source: "", summary: "", rows: [] },
  faqs: [],
  flags: [],
  versions: [],
  updatedAt: "",
};

/** Fills missing sections so a partial document can never break a page. */
export function normalisePolicy(store: Partial<CreditPolicyStore>): CreditPolicyStore {
  return {
    ...EMPTY,
    ...store,
    version: { ...EMPTY.version, ...(store.version ?? {}) },
    overview: { ...EMPTY.overview, ...(store.overview ?? {}) },
    application: { ...EMPTY.application, ...(store.application ?? {}) },
    repayment: { ...EMPTY.repayment, ...(store.repayment ?? {}) },
    administration: { ...EMPTY.administration, ...(store.administration ?? {}) },
    internalCredits: { ...EMPTY.internalCredits, ...(store.internalCredits ?? {}) },
    review: { ...EMPTY.review, ...(store.review ?? {}) },
    globalLimits: { ...EMPTY.globalLimits, ...(store.globalLimits ?? {}) },
    facilities: store.facilities ?? [],
    faqs: store.faqs ?? [],
    flags: store.flags ?? [],
    versions: store.versions ?? [],
  };
}

export function getCreditPolicy(): CreditPolicyStore {
  try {
    const full = path.join(process.cwd(), "content", "credit-policy.json");
    return normalisePolicy(JSON.parse(fs.readFileSync(full, "utf8")) as Partial<CreditPolicyStore>);
  } catch {
    return EMPTY;
  }
}

export function getFacility(slug: string): Facility | undefined {
  return getCreditPolicy().facilities.find((facility) => facility.slug === slug);
}

export function isPolicyApproved(): boolean {
  return getCreditPolicy().version.state === "approved";
}

/** Pending policies are visible on the local review build but must not be indexed. */
export function policyRobots(): { index: boolean; follow: boolean } {
  return isPolicyApproved() ? { index: true, follow: true } : { index: false, follow: false };
}

export function formatNaira(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return `₦${trimmed}`;
}

export function faqGroups(items: PolicyFaq[]): { group: string; items: PolicyFaq[] }[] {
  const groups: { group: string; items: PolicyFaq[] }[] = [];
  for (const item of items) {
    const existing = groups.find((entry) => entry.group === item.group);
    if (existing) existing.items.push(item);
    else groups.push({ group: item.group, items: [item] });
  }
  return groups;
}
