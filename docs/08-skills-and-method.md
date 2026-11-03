# 08 — Skills and method

## 8.1 Skills installed

Installed with the `skills` CLI into `.claude/skills/`, all verified present with `npx skills@latest list`:

| Skill | Source | Used for |
| --- | --- | --- |
| `frontend-design` | `anthropics/skills` | Layout composition, typographic hierarchy, avoiding generic AI page patterns |
| `frontend` | `gabros20/frontend-skill` | Component structure, responsive behaviour, state handling |
| `web-quality-audit`, `performance`, `core-web-vitals`, `accessibility`, `seo`, `best-practices` | `addyosmani/web-quality-skills` | The quality checklist applied to every page: LCP element, image sizing, contrast, heading order, metadata, structured data |
| `agent-browser` | `vercel-labs/agent-browser` | Driving the browser to inspect the live site and the rebuilt site |
| `reverse-engineer-anything` (`rea-*`) | REA | Structuring the audit: feature inventory → behaviour extraction → rebuild plan rather than a visual copy |
| `ponytail` (`ponytail-*`) | ponytails | Refactoring discipline while consolidating components and design tokens |

Install command used (Windows requires the agent alias and non-interactive flags):

```bash
npx skills@latest add anthropics/skills --skill frontend-design -a claude-code -y --copy
```

## 8.2 How the method shaped the build

**Audit before design.** REA's sequence — inventory the surface, extract behaviour, then rebuild — forced the content inventory in `docs/01-audit-report.md` to exist before a single component was written. That is what surfaced the contradictory member counters, the duplicate telephone number and the mis-dated investment notice. Copying the visual design first would have carried all three forward.

**Design tokens before pages.** `frontend-design` and the quality skills converge on the same point: decide colour, type and spacing once. `globals.css` was written before any page, so no page invented its own spacing or its own grey.

**Ponytail for consolidation.** After the first pass there were repeated section wrappers, three different eyebrow treatments and two card patterns. The refactor collapsed these into `.shell`, `.eyebrow`, `.card` and `.btn*`, which is why page files read as composition rather than markup.

**Quality skills as a checklist, not a score.** The web-quality skills were used to ask specific questions per page — what is the LCP element, is every image sized, does the heading order hold, is there a canonical, does the form announce errors — rather than to produce a number. Numbers are only recorded when measured on the deployment origin (`docs/06-testing-and-qa.md` §6.2).

## 8.3 Browser verification performed

- Every legacy page opened and read; navigation and footer links enumerated.
- Page source fetched same-origin to capture exact copy, image paths, document links and external destinations.
- Asset downloads verified with HTTP status checks (all 200).
- Rebuilt site: route sweep of 20 URLs, two API submissions, one invalid submission, and the 404 page.

## 8.4 Deliberate deviations from the brief

| Brief said | What was done | Why |
| --- | --- | --- |
| Carry the existing statistics across | Omitted the member/loan/project/location counters | Unsourced and mutually inconsistent; the brief also said not to publish unverified statistics |
| Use real project photography | Brand placeholder with an on-page note | No approved photography exists; using unrelated buildings would misrepresent unbuilt property |
| Measure Lighthouse ≥90 | Not claimed | Scores must be measured on the deployed origin; no deployment was authorised |

Both deviations are reversible in one step once the Society supplies the underlying facts or images.
