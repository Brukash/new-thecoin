# Credit and loan services: website structure

## 1. Routes

| Route | Purpose | Source |
| --- | --- | --- |
| `/services/credit` | Overview: purpose, objectives, nine facilities, assessment criteria, limits summary, administration, insider lending, review, download | Sections 1, 3, 7, 10; Schedule A |
| `/services/credit/loans` | Searchable facility index with amount and tenor for each | Section 2 |
| `/services/credit/loans/[slug]` | One page per facility: description, eligibility, terms, security, guarantor, conditions, approval, clause reference | Section 2 |
| `/services/credit/eligibility` | Membership, savings, contribution history, guarantors, security, full criteria list | 1.2, 1.3, 2.x, 4.6 to 4.9 |
| `/services/credit/repayment` | Periods, sources, recall, default and recovery timeline, retirees, pensioners, portfolio targets | 2.x, 4.1 to 4.5, 5.0, 6.2, 8.1, 9.1 |
| `/services/credit/limits` | Schedule A table with the rules for setting and changing limits | 1.4; Schedule A |
| `/services/credit/faq` | 18 searchable questions grouped by topic, each with clause references | Multiple |
| `/admin/credit` | Staff console: details, approval, document upload, limit table, facilities, flags, archive | CMS |
| `/admin/credit/[slug]` | Facility editor | CMS |

The section sits beside the existing service pages at `/services/[slug]`, so no existing URL
changes. The main navigation's Services menu gains a "Credit policy" group linking to all six
public pages; the services index gains a panel linking to the section.

## 2. Components

| Component | Type | Role |
| --- | --- | --- |
| `PolicyBanner` | Server | Publication state, document reference, PDF link |
| `CreditNav` | Client | Section tabs with `aria-current` |
| `FacilityCard` | Client | Facility summary used by the overview and search |
| `PolicySearch` | Client | Filters facilities by name, purpose, amount or tenor |
| `LimitTable` | Server | Schedule A, transcribed values, scrolls on narrow screens |
| `PolicyFaqList` | Client | Filter plus expandable answers with clause references |
| `PolicyDownload` | Server | Official PDF download with metadata |

Design follows the existing system: navy `ink` and `navy` panels, gold accents, white and bone
surfaces, serif headings, hairline rules. No new fonts, colours or libraries were added.

## 3. Content and separation of policy from explanation

`content/credit-policy.json` holds the policy extract. Each facility, limit row and FAQ carries a
clause and page reference. The public pages reproduce policy wording and keep explanatory text
visually distinct: policy text sits in the body and tables, explanation sits in bordered notes and
the "About interest rates" strip. Where the policy is silent, the page says so.

`src/content/credit-policy.ts` is the only reader. It also exposes `policyRobots()`, which keeps
the pages out of search results until the record is approved.

## 4. Editorial controls in the console

1. **Editing withdraws approval.** Saving details, a facility or the limit table sets the record to
   `pending-verification`. The public pages then show the notice again.
2. **Explicit publication.** "Approve and publish" needs the approver's name and the typed word
   APPROVE. That is the only path to `approved`.
3. **Effective dates.** The effective date is edited separately and can be set precisely at
   approval. It defaults to the printed month rather than a guessed day.
4. **Replacement documents.** Uploading a signed PDF writes a new file under `public/documents` and
   leaves the previous one in place, so archived versions still open.
5. **Archiving.** Archiving pushes the current version into `versions` with the archive date, the
   reason and the document path, and marks the public section as superseded.
6. **Open points.** The eleven flags are shown in the console so an approver sees them before
   signing off.

## 5. Limits of the current build

- The CMS writes to files on the server that runs it, the same model as the existing news and
  project editors. A multi-server deployment needs shared storage before it can be used by more
  than one editor at a time.
- Uploaded PDFs are stored as delivered. No virus scanning or PDF validation is performed.
- The FAQ text and the overview paragraphs are edited in the content file, not in the console. The
  console covers the items the brief listed: policy details, revised conditions, limits, documents,
  effective dates, archiving and history.
- Nothing has been deployed. The live site is unchanged.
