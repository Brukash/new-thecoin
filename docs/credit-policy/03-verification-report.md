# Credit Policy 2026: extraction and verification report

Prepared 3 November 2026. Status: **awaiting management approval**. Nothing in this section has
been published to the live site.

## 1. What the source is

| Item | Detail |
| --- | --- |
| File | `2026 Credit Policy.pdf` |
| Pages | 22, all scanned images |
| Text layer | None. `pdftotext` returns only the CamScanner stamp. |
| Scanner | CamScanner, visible watermark on each page |
| Condition | Grey scan, slight rotation on some pages, signature and stamp overlays on the approvals page |
| Integrity | Cover, contents, sections 1 to 10, approvals, Schedule A all present. No page missing. |

Because there is no text layer, every figure in this project was read from the page image, either
by OCR or by eye, and then checked against the image again.

## 2. Method

1. Rasterised each page at scale 2.0 with `pdf-to-img` to PNG (`.policy-src/pages`).
2. Produced 1240 px greyscale JPEG previews (`.policy-src/view`) for visual reading; the original
   images are too large to attach to a review message.
3. Ran Tesseract (`eng`, page segmentation 6) per page, keeping per-word confidence
   (`.policy-src/ocr`).
4. Read all 22 pages visually, including the tables, and compared each figure with the OCR text.
5. Cropped and enlarged Schedule A for a second, digit-by-digit reading.
6. Recorded the clause and page beside every extracted item in `content/credit-policy.json`.
7. Left every conflict in the document visible in the website content rather than resolving it.

## 3. OCR confidence and coverage

| Pages | Content | Mean OCR confidence | Visual check |
| --- | --- | --- | --- |
| 1 to 2 | Cover, contents | 90 to 92% | Read |
| 3 to 10 | Sections 1 to 2 (purpose, limits, facilities) | 92 to 94% | Read |
| 11 to 12 | Section 3 (roles) | 92 to 94% | Read |
| 13 to 16 | Section 4 (application, tenor, security) | 92 to 94% | Read |
| 17 to 18 | Sections 5 and 6 (review, recovery) | 91 to 93% | Read |
| 19 to 20 | Sections 7 to 10 (insider, retirees, pensioners, review), approvals | 90 to 93% | Read |
| 21 to 22 | Schedule A table, page footer | 75 to 77% | Read twice, once at 2x crop |

Low confidence on the last two pages comes from table rules and the CamScanner footer, not from
the figures. The digits in Schedule A were clear at 2x and matched the first reading row for row.

All 22 of 22 pages were read visually. No page is OCR-only.

## 4. Items flagged in the website content

| ID | Area | What the document says | How the website handles it |
| --- | --- | --- | --- |
| F1 | Investment Loan tenor | 2.5.3: not more than four years. 4.1.3: not more than 60 months. | Both are shown, and the conflict is stated on the facility page, the repayment table and the FAQ. |
| F2 | Section numbering | Section 5.0.0 carries subsections 6.1.0 and 6.2.0. | Cited as printed, with the printed numbering preserved. |
| F3 | Numbering gap | 2.9.1 is followed by 2.9.6. | No content invented to fill 2.9.2 to 2.9.5. |
| F4 | Duplicated clause | 2.8.10 repeats the Project Loan deduction clause inside the Agricultural Loan. | Not published twice; noted in the flags. |
| F5 | Committee composition | 3.3.1 reads "Four (1) other members" and then lists four people. | Reproduced as written, with the composition described in words. |
| F6 | Document control number | The document control block is numbered 2.5.5 after section 10. | Cited as "Document Control, p. 20". |
| F7 | Penal rate | 4.5.1 refers to a new rate set by the MC; 6.2.4 refers to a penal rate. No percentage is given. | The site states that no fixed percentage is set, and does not invent one. |
| F8 | Commencement | Issue date August 2026, no commencement clause. | Effective date shown as August 2026; exact date pending. |
| F9 | Currency notation | Executive Quick Credit cap printed as "2,000,000.00" without the naira symbol. | Presented as naira, value unchanged. |
| F10 | Undefined grade | Schedule A row 15 is "Others", undefined in the policy. | Table row kept; page asks members to confirm their category. |
| F11 | Guarantor threshold | "not up to five years", "has not been with the Cooperative for five years". | Read as under five years, stated that way, flagged for confirmation. |

## 5. Figure checks

Every figure below was read from the image, then checked against OCR text and the enlarged crop.

- Quick Credit caps: 500,000 / 1,000,000 / 2,000,000.00 and the flat 2% monthly charge.
- Multipliers: Normal 2x, Special 3x, Investment 4x, Project 2x Global Limit with 30% savings.
- Tenors: 12, 36, 3, 4 years or 60 months, 8 years, 90 days for special withdrawal.
- Retiree ceiling: 90% of combined savings and bond investment.
- Portfolio: 30 days, 1% NPL, notice points at 30, 33, 90 and 93 days.
- Schedule A: all 15 rows, both columns, matched on two readings.

## 6. Residual risks

1. The scan is a photocopy of a signed document. A digit that is unclear in the original would be
   unclear here too. Schedule A was the only dense table and it read cleanly at 2x.
2. Signature overlays on the approvals page obscure part of the date on one signature. Dates are
   recorded as written and are not shown on the public site.
3. The policy is silent on some terms (for example the End of Service Loan ceiling). The website
   says "not specified in the policy" instead of supplying a figure.
4. The editing source (`Credit Policy_1Reviewed2.docx`) was not read, as it sits outside the
   authorised project folder. It is available as a cross-check if the Society wants one.

## 7. Approval record

| Check | Owner | Status |
| --- | --- | --- |
| Schedule A figures checked against the signed PDF | Compliance / Credit Committee | Pending |
| Facility ceilings, rates and tenors confirmed | Credit Committee | Pending |
| Effective date and commencement confirmed | General Secretary | Pending |
| Wording approved for publication | President / Management Committee | Pending |

Until every row is signed off, the public pages carry the "Figures awaiting verification" notice
and are excluded from search results. The approve action in the staff console is the only way to
change that.
