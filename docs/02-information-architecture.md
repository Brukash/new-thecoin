# 02 — Information architecture

## 2.1 Principles

1. **Task first, department second.** The navigation follows what a member is trying to do — join, save, borrow, invest, buy a home — not the Society's internal structure.
2. **One page, one job.** No page carries two competing primary actions.
3. **The private data boundary is visible.** The public site never displays member or financial records; every page that touches them links out to the portal instead.
4. **Every claim is attributable.** Copy either comes from the Society's own published material or from a document the Society supplied.

## 2.2 Routes

```
/                              Home — identity, proof, pathways, latest notice
/services                      Service index
  /services/credit-and-thrift
  /services/savings
  /services/loans
  /services/investment-services
  /services/financial-advisory
  /services/home-ownership
  /services/consumer-operations
/projects                      Property portfolio
  /projects/ag-mortgage-homes-asaba
  /projects/kaduna
  /projects/baden-moyet-okota
  /projects/katampe
  /projects/jikwoyi
  /projects/asokoro
  /projects/guzape
/about                         Who the Society is, vision, mission, values, history
  /about/leadership            Elected and appointed officers
  /about/structure            Governance and committee structure
/membership                    Eligibility, fees, documents, joining steps
/news                          All notices, newest first
  /news/{slug}                 Article
  /news/category/{slug}        Category listing
/partners                      Banking and institutional relationships
/faq                           Grouped answers
/contact                       Address, phones, email, map, enquiry form

/admin                         Staff console (noindex, no-store, password gated)
  /admin/news/{slug}
  /admin/projects/{slug}

/api/enquiry                   POST — validated, rate limited
/api/newsletter                POST — validated, rate limited
/sitemap.xml                   Generated from content
/robots.txt                    Disallows /admin and /api
```

## 2.3 Navigation model

**Primary navigation (desktop and mobile):** Services · Projects · Membership · About · News · Contact.

**Utility layer:** member portal (external, marked as leaving the site), search-free by design — the corpus is small enough that the FAQ plus category pages cover it.

**Footer:** four columns — the Society (about, leadership, structure, partners), Services, Members (portal, E-Mall, sales, byelaws, membership form), Contact. Legal line, regulatory disclaimer, copyright.

## 2.4 Page templates

| Template | Used by | Composition |
| --- | --- | --- |
| Home | `/` | Hero → trust strip → service index → projects → membership pathway → governance → news → CTA |
| Section index | `/services`, `/projects`, `/news` | Page hero → filter or grouped list → CTA |
| Detail | `/services/{slug}`, `/projects/{slug}`, `/news/{slug}` | Breadcrumb → title block → body with sidebar → related → CTA |
| Editorial | `/about`, `/membership`, `/faq` | Page hero → long-form sections → sidebar where useful → CTA |
| Contact | `/contact` | Details grid → form → map |
| Console | `/admin/**` | Login gate → list → editor |

## 2.5 Content ownership

| Content | Source of truth | Edited by |
| --- | --- | --- |
| News articles | `content/news.json` | Staff console `/admin` |
| Projects | `content/projects.json` | Staff console `/admin` |
| Services, leadership, values, contact details | `src/content/*.ts` | Developer (typed, reviewed) |
| Form submissions | `data/submissions/*.jsonl` | Secretariat (read-only export) |

## 2.6 URL policy

- Lowercase, hyphenated, no trailing slash.
- Article slugs are derived from the title once, then frozen — editing a title never changes a published URL.
- Legacy `/news/view/{id}` URLs are not redirected because the legacy host remains live during the transition; a redirect map is supplied in `docs/07-handover.md` for the cutover.
