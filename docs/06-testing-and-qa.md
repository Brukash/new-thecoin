# 06 — Testing and quality assurance

## 6.1 What was executed

| Check | Command | Result |
| --- | --- | --- |
| TypeScript, strict, no emit | `npx tsc --noEmit` | 0 errors |
| Production build | `npm run build` | Compiled successfully; 42 pages generated; 103 kB shared JS |
| Route availability | `curl` status sweep over every public route | All 200; unknown path 404 |
| Enquiry endpoint, valid payload | `POST /api/enquiry` | `{"ok":true,"reference":"ENQ-…"}` |
| Enquiry endpoint, invalid payload | `POST /api/enquiry` with short name, bad email | 422 with per-field messages |
| Newsletter endpoint | `POST /api/newsletter` | `{"ok":true}` |
| Generated sitemap and robots | `GET /sitemap.xml`, `/robots.txt` | Served, correct origin, `/admin` disallowed |
| Favicon and manifest assets | `curl` sweep over `/favicon.ico`, the PNG icons and `/manifest.webmanifest` | All 200 with correct content types; icon and manifest links present in `<head>` on every route |

## 6.2 What must be verified on the deployment target

Lighthouse numbers cannot be claimed from a development server or from a laptop's loopback. On the deployed HTTPS origin, run Lighthouse (mobile, throttled) on `/`, `/services`, `/projects/katampe`, `/news` and `/membership`, and record:

- Performance, Accessibility, Best Practices, SEO scores.
- LCP, INP and CLS from the field (CrUX) once traffic exists, not only from the lab.
- Target: ≥90 / ≥95 / ≥95 / ≥95, LCP ≤2.5 s, INP ≤200 ms, CLS ≤0.1.

Record the actual numbers in this file when measured. **No score has been claimed in this document.**

## 6.3 Manual test script

Accessibility

1. Tab through the homepage: skip link appears first and moves focus to `main`.
2. Mobile menu opens with Enter/Space, traps nothing, closes on Escape, and returns focus to the trigger.
3. FAQ accordions operate with keyboard only and announce expanded state.
4. Enabling "reduce motion" in the OS stops the entrance transitions and the marquee-free logo grid stays static.
5. Every image has either meaningful alt text or is marked decorative.
6. Zoom to 200% at 360 px width: no horizontal scroll, no clipped text.

Forms

7. Submit the enquiry form empty → inline errors on name, email and message.
8. Submit with a valid payload → reference number shown, form resets, `data/submissions/enquiries.jsonl` gains one line.
9. Submit six times rapidly → sixth returns "too many enquiries".
10. Fill the hidden honeypot via DevTools → response looks successful, nothing is written.
11. Submit the newsletter twice with the same address → second returns "already subscribed" and does not duplicate the record.

Console

12. Visit `/admin` signed out → login form only; no content lists leak in the HTML.
13. Wrong password → generic error, no hint about length or characters.
14. Correct password → cookie set with `HttpOnly`, `SameSite=Strict`, `Path=/admin`; session survives navigation and expires after 8 hours.
15. Edit an article, save → notice appears in the console, article page reflects the change immediately, homepage updates if featured.
16. Create and delete an article → list count changes; deleted URL returns 404.
17. Sign out → cookie removed; back button does not restore the dashboard.
18. Set `ADMIN_PASSWORD` to empty and restart → console refuses to authenticate and shows the configuration notice.

Content integrity

19. Every figure on the site traces to `src/content/site.ts` or a supplied document.
20. No testimonial, member count, completion percentage, price or partner appears that the Society has not published.
21. Logo renders with its original aspect ratio at every breakpoint.
22. The Cooperative seal appears in the browser tab on `/`, `/services`, `/projects`, `/membership`, `/news` and `/admin` — every route inherits the icon set from the root layout.
23. `GET /manifest.webmanifest` parses as JSON, names the Society, lists the 192 and 512 icons and carries the navy `theme_color`.
24. Add the site to an Android home screen and to an iOS home screen: the seal appears uncropped on navy, with no white box around it.
25. Favicon caching: after any icon change, hard-reload (Ctrl/Cmd+Shift+R) or open a fresh browser profile. Favicons are cached far longer than page HTML, so if a stale icon survives, rename the file and update the `icons` entry in `src/app/layout.tsx`.

Performance

22. Homepage first-load JS ≤ 120 kB gzipped.
23. Hero image served as AVIF/WebP with a `srcset`; below-fold images lazy.
24. No layout shift when fonts load (self-hosted, `display: swap`, no third-party request).

## 6.4 Regression guard for future edits

- `tsc --noEmit` and `next build` must both pass before any deployment.
- Any new content must be added through `content/*.json` or `src/content/*.ts`, never inline in a page.
- Any new route must be added to `src/app/sitemap.ts`.
- Any new external frame or script requires a matching CSP change, reviewed deliberately.
