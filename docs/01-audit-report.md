# 01 — Audit of the existing website

**Subject:** https://www.thecbncoop.com/
**Date of audit:** 2 November 2026
**Method:** manual review of every reachable page, same-origin fetch of page source, header and asset checks, and comparison of content between pages. No login-only area was accessed.

---

## 1. Platform

| Item | Finding |
| --- | --- |
| Application | CodeIgniter (PHP), classic MVC routing (`/pages/…`, `/news/view/{id}`) |
| Static assets | `/public/uploads/…`; photographs served at original size |
| Sitemap | `/sitemap.xml` returns the CodeIgniter 404 page — no sitemap exists |
| robots.txt | `User-agent: *` and `Crawl-delay: 10` only — no sitemap reference, no admin disallow |
| Caching | No cache headers on HTML; images uncached by hashed filename |
| HTTPS | Served over HTTPS |

## 2. Structure found

Navigation exposed: Home, About (Vision/Mission/Core Values), Services, Projects, Membership, News, Gallery, Contact, plus member-portal and e-commerce links.

Content inventory:

- **Services** — thrift and credit, savings, loans, investment, advisory, home ownership, consumer operations.
- **Projects** — AG Mortgage Homes (Asaba), Kaduna, Baden Moyet (Okota, Lagos), Katampe, Jikwoyi, Asokoro, Guzape (River Park II).
- **News** — 5 published articles, 6 categories (Announcements, General, Investment, Project Updates, Events, Newsletter).
- **Leadership** — 12 officers listed with photographs.
- **Partners** — Guaranty Trust Bank, Zenith, First Bank, Heritage, Cordros marks; EDC and Pro-Serve named in the MoU announcement.
- **Documents** — byelaws PDF hosted under `/public/uploads/bilaws.pdf`.

## 3. Problems that justified the rebuild

### 3.1 Content and trust

1. **Unverified statistics presented as fact** — homepage counters (9,840 members, 4,809 loans, 3 projects, 36 locations) carry no date, source or definition. "36 locations" conflicts with the seven projects actually described.
2. **Date inconsistency** — the Classic Diamond Series notice is dated 8 April 2021 in the listing while describing a 2024–2028 series that began after Series D closed on 31 January 2024.
3. **Telephone inconsistency** — the contact page lists 09096797982 in one block and 09096797981 in another; the footer uses 09096797981 and 08180578550.
4. **Project pages without substance** — location names are listed, but pricing, unit counts and delivery status are absent or contradictory, inviting members to rely on stale figures.
5. **Mixed domains** — `thecbncoop.com`, `cbncoopng.com` (email and sales), `cbn.coop.ng` (portal), `mall.thecbncoop.com`. No page explains which domain is authoritative for what.

### 3.2 Usability

6. Small body text and long unbroken paragraphs; no clear hierarchy between notice, article and page copy.
7. Navigation items are not ordered by member task; the three most common actions (join, borrow, buy a home) sit at different levels.
8. No search, no breadcrumbs, no related-content links.
9. Forms have no visible validation states, no success confirmation and no stated response time.
10. Mobile layout reflows but retains desktop-sized imagery; tap targets below 44 px in the footer.

### 3.3 Accessibility

11. Images lack meaningful alternative text; decorative images are announced.
12. Colour contrast on gold-on-white labels is below 4.5:1.
13. Heading levels skip (h2 → h4) and several sections have no heading at all.
14. The partner marquee animates continuously with no pause control and no reduced-motion fallback.
15. Form inputs are labelled by placeholder only.

### 3.4 Performance and technical quality

16. Uncompressed JPEGs of several hundred kilobytes each; no responsive `srcset`, no modern formats.
17. Render-blocking CSS and jQuery-era scripts; no code splitting.
18. No canonical tags, no Open Graph or Twitter metadata, no structured data.
19. No 404 page of its own — the framework error page is served.
20. Admin surface reachable at a guessable path with no rate limiting visible; session handling not auditable from outside.

## 4. What was preserved

Everything the Society publicly asserts was carried across, with its original meaning intact:

- Vision, mission and the five core values (verbatim).
- The twelve listed officers and their portfolios.
- All five news articles, with category, date and a `sourceUrl` back to the original.
- All seven projects with their locations, summaries and status wording.
- Membership eligibility, application fee, contribution levels and document checklist.
- Contact details, office address, office hours and social channels.
- Partner marks and the named institutional relationships.
- Every external destination: Coopman portal, E-Mall, Coop Sales, byelaws PDF, membership form.

## 5. What was deliberately **not** carried across

| Removed | Reason | Replacement |
| --- | --- | --- |
| Homepage counters (members, loans, projects, locations) | Unsourced and internally inconsistent | Verifiable facts only: 44th AGM, 2,000+ members housed, 15 years, 2016 exhibition — each traceable to a Society page |
| Partner marquee animation | Accessibility and reduced-motion failure | Static, labelled logo grid |
| Stock project photographs of unrelated buildings | Misrepresents unbuilt property | Brand-consistent placeholder, clearly labelled, until the Society releases real photography |
| "36 locations" | Contradicted by the project list | The seven projects the Society actually describes |

## 6. Items flagged for the Society to confirm

These require a decision from the Society; the build does not guess:

1. Which telephone number is current — 09096797981, 09096797982 or 08180578550.
2. Whether the member counters should return, and if so with what definition, date and source.
3. The correct publication date for the Classic Diamond Series notice.
4. Current membership and loan figures for any future "by the numbers" section.
5. Which projects have completed, are under construction, or are at planning stage, with dates.
6. Whether project pricing may be published, and for which projects.
7. Approval to publish member photography and project site photography.
8. Whether the byelaws PDF should move to a Society-controlled document store.
