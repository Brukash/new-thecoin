# Partners directory — implementation and logo provenance

Last updated: 4 November 2026

## What was built

- **Public page** `/partners` — heading *Our Fund Managers and Financial Partners*, the
  supplied supporting sentence, and a responsive logo grid: two per row on mobile, three on
  tablet, four at `lg` and five at `xl`. Twenty of the twenty-one organisations have a verified
  logo; Tatum is the only placeholder. Every logo sits in a fixed-height white tile, is
  centred, keeps its aspect ratio (`object-fit: contain`), carries descriptive alt text and
  links to the organisation's own website. No grayscale or colour filter is applied.
- **Homepage** — the partner strip now reads the first five published partners from the
  database instead of a hard-coded list.
- **Database** `public.partners` — `id`, `organisation_name`, `slug`, `logo_url`,
  `website_url`, `description`, `category`, `display_order`, `is_active`, `created_at`,
  `updated_at`. Row level security is enabled: anonymous visitors read active rows only,
  signed-in staff can write, and an `updated_at` trigger keeps timestamps accurate.
- **Console** `/admin/partners` — add an organisation, edit its details and website, upload or
  replace a logo, remove a logo, reorder with up/down controls, hide/show, and delete with a
  confirmation step. Each row also has an explicit **Edit** button. Logo files upload to the
  public `partner-logos` Supabase Storage bucket.
- **Seed data** — the 21 supplied organisations are in `src/content/partners.ts` and were
  written to the table with `npm run cms:seed:partners`.

Categories are editable per organisation and the page groups by them. The initial grouping is
deliberately conservative: **Commercial Banks** for licensed deposit-money banks,
**Development Finance Institutions** for NIRSAL, **Investment Institutions** for DLM and
United Capital, and **Fund and Asset Managers** for the remainder. The Society should confirm
these groupings before publication.

## Logo provenance

Downloaded with `scripts/fetch-partner-logos.mjs` and targeted follow-ups. No file is
hotlinked; all 18 assets are served from the repository.

| # | Organisation | File | Source | Format | Status |
|---|---|---|---|---|---|
| 1 | GTBank | `gtbank.png` | Wikimedia Commons `Gtco_logo-generic.png`, sourced from gtbank.com. GTBank's own brand page states the logo text changed from GTBank to GTCO. | PNG | Verified (GTCO identity) |
| 2 | Fidelity Bank | `fidelity-bank.svg` | Header vector on fidelitybank.ng | SVG | Verified |
| 3 | First Bank | `first-bank.svg` | firstbankgroup.com corporate asset (`First-Bank-Logo_Symbol.svg`) — elephant symbol, no wordmark | SVG | Verified (symbol) |
| 4 | Zenith Bank | `zenith-bank.png` | Wikimedia Commons `Zenith-Bank-logo.png` (zenithbank.com blocks bots) | PNG | Verified |
| 5 | UBA | `uba.png` | Wikimedia Commons `United_bank_of_Africa.png` | PNG | Verified |
| 6 | ARM | `arm.png` | armgroup.com CDN (`ARM-Logo-1920w.png`) — shield mark only | PNG | Verified (mark) |
| 7 | TrustBanc | `trustbanc.png` | trustbancgroup.com header | PNG | Verified |
| 8 | Cordros | `cordros.png` | cordros.com `capital-logo` build asset | PNG | Verified |
| 9 | Cowry | `cowry.png` | cowryasset.com `/images/cowry-logo.png` | PNG | Verified |
| 10 | Norrenberger | `norrenberger.png` | norrenberger.com uploads (`image-1.png`, dark lock-up) | PNG | Verified |
| 11 | Alpha Morgan | `alpha-morgan.jpg` | alphamorgan.com uploads (`AMC-LOGO-UPDATED-1.jpg`) | JPG | Verified |
| 12 | APEL | `apel.svg` | apel.com.ng group mark (vector, mark only) | SVG | Verified (mark) |
| 13 | DLM | `dlm.png` | dlm.group `/images/DLMLogo1.png` (the group's current site; `dlmcapitalgroup.com` no longer resolves) | PNG | Verified |
| 14 | United Capital | `united-capital.png` | unitedcapitalplcgroup.com uploads | PNG | Verified |
| 15 | First Icon | `first-icon.png` | firsticon.com uploads | PNG | Verified |
| 16 | Tatum | — | tatumbank.com returns HTTP 403 to automated requests; no brand resource located | — | **Placeholder** |
| 17 | Union Bank | `union-bank.png` | Wikimedia Commons `Union_Bank_of_Nigeria_Logo.png` (white-on-blue lock-up) | PNG | Verified |
| 18 | WealthBridge | `wealthbridge.webp` | wealthbridge.com.ng official logo asset | WebP | Verified |
| 19 | Alpha 10 | `alpha-10.png` | alpha10group.com white-and-red brand asset | PNG | Verified; shown on navy because the artwork is white |
| 20 | Radix | `radix.png` | radixng.com uploads | PNG | Verified |
| 21 | NIRSAL | `nirsal.png` | nirsal.com uploads | PNG | Verified |

**Verified** means the file came from the organisation's own website or a Wikimedia Commons
copy that cites the corporate source, and the visual identity was checked against the
organisation's name, sector and current branding.

### Deliberately not used

- `cowryasset.com` og:image — a promotional banner, not a logo.
- `norrenberger.com` white lock-up — invisible on a white tile.
- `dlmgroup.com` logo — a different, unrelated company.
- Search-result "logo" thumbnails and favicons — too low-resolution to use.

## Placeholder behaviour

The three organisations without a verified asset render as a bordered tile showing the
organisation name and “Logo pending”. Nothing is invented and no text is rendered as an image.
An administrator can upload the real logo at any time; the page updates without a code change.

## Outstanding items for the Society

1. Confirm the Partner categories (Commercial Banks / Fund and Asset Managers / Investment
   Institutions / Development Finance Institutions).
2. Confirm the listing itself: the 21 organisations were supplied for publication, but the page
   states that listing does not by itself imply an endorsement or an active partnership.
3. Supply a logo or brand-kit link for Tatum, or authorise retrieval from the bank's brand
   resource. First Bank and DLM now use assets from their own corporate sites.
4. Confirm GTBank's preferred display name — the artwork now reads GTCO, per the bank's own
   brand note.
