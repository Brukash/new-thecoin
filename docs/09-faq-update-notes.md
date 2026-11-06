# FAQ update from the Society's FAQ document

Source: **Frequently Asked Questions (FAQ) – CBN Staff Multipurpose Cooperative
Society Limited** (Word document supplied by the Society, November 2026).

The document's 9 sections were published to the FAQ collection
(`content_entries`, collection `faq`, slug `main`) with **55 questions**, and the
same copy is bundled in `src/content/faq.ts` as the fallback used when Supabase
is not configured. Staff can edit both from **Console → FAQ**.

`src/lib/cms/schemas.ts` now allows 9 FAQ sections (was 8) to match the
document's structure, and the public page preserves line breaks so the
document's bullet lists render.

## Deliberate departures from the source document

1. **Bank account numbers are withheld.** Only the Guaranty Trust Bank account
   used for the ₦5,000 membership fee (`0023723318`) is published, on the
   membership page and in the membership answer. Every other payment answer
   names the purpose and the bank, and routes the member to the Accounts
   Department (`finance-admin@cbncoopng.com`) for the account number.
2. **Facility multiples follow the 2026 Credit Policy already published on the
   site**, because the FAQ document states different figures — see item 1 under
   open questions below.
3. **Personal staff email addresses** (`cnadeshina@…`, `sagiwa@…`) are replaced
   with "the addresses printed on the form". Department addresses
   (`customerservice@`, `finance-admin@`, `projects@`) are published.
4. **The project-announcements answer** points to this website's projects
   section rather than repeating a domain, because the document names two
   different sites (see open questions).

## Conflict applied to the membership page

Eligibility was widened from three to five categories, matching the document:
CBN active staff, CBN retired staff, **CBN pensioners**, staff on secondment and
**Coop staff**.

## Open questions raised with the Society

1. **Special and investment loan multiples.** The document says up to 5× savings
   for both (questions 13 and 20). Clause 2.3.2 of the Credit Policy says 3× for
   a special loan and clause 2.5.2 says 4× for an investment loan. The FAQ
   currently publishes 3× and 4×.
2. **Access before six months.** Question 11 says a member with under six months
   has no loan access and may take only half of savings, or wait one year. The
   Credit Policy places no membership-duration condition on a Normal Loan
   (2× savings). The answer is withheld until the rule is confirmed.
3. **Guarantor and insurance scope.** The document limits guarantor forms to
   special and investment loans for members under five years, and insurance to
   special and investment loans. Clause 4.6.1 requires a guarantor for all loans
   except Normal Loans, and the policy does not mention insurance forms. The FAQ
   states the document's position; the Credit Policy page is unchanged.
4. **Quick loan tenor.** The document says one to six months; the Credit
   Policy's Quick Credit facility is capped at three months, while the published
   rate schedule lists 1, 3 and 6-month quick loans. The facility is now named
   Quick loan everywhere on the site.
5. **Which investment series is current.** The document describes the COOP
   Investment Fund **Classic Excel Series (2025–2029)** with a January 2029
   maturity, minimum ₦1,000,000 and maximums of ₦50,000,000 (serving) and
   ₦100,000,000 per tranche (retiring). The services page states the current
   series is **Classic Diamond (2024–2028)** and the rate schedule covers 1, 2
   and 4-year plans.
6. **Two website addresses.** The document sends members to `cbn.coop.ng` to
   register and log in, but to `www.thecbncoop.com` for project announcements.
   Confirm which address is canonical for public information.
7. **Second telephone number.** `08180578550` appears once, in the password-reset
   answer. The site publishes `0909 679 7982` only; the extra number is not
   published pending confirmation.
8. **Missing answers in the document.** Question 14 (how the total loan amount is
   determined) and question 38 (available interest rate options) have no answer.
   A policy-based answer was supplied for 14; 38 is omitted.
