# 07 — Handover

## 7.1 Running the site locally

```bash
# Node 22 is required (portable copy lives in .tools/ during development)
export PATH="$PWD/.tools/node-v22.23.4-win-x64:$PATH"

npm install
cp .env.example .env.local      # then fill in the values
npm run dev                     # http://localhost:3000
```

Production build:

```bash
npm run build
npm run start
```

Checks before shipping anything:

```bash
npx tsc --noEmit
npm run build
```

## 7.2 Environment variables

| Name | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Yes in production | Canonical origin for metadata, canonical tags, sitemap |
| `ADMIN_PASSWORD` | Yes | Staff console password (8+ characters) |
| `SESSION_SECRET` | Yes | Signs the admin cookie (16+ characters; 32 random bytes recommended) |
| `CONTACT_NOTIFICATION_EMAIL` | Optional | Reserved for email delivery once a provider is approved |

Generate a secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 7.3 Staff workflows

**Publish a notice**

1. Go to `/admin` and sign in.
2. Type a title in the News box and press Add.
3. Fill title, category, date, summary, body. Separate paragraphs with a blank line.
4. Tick "Feature on the homepage" if it belongs in the homepage notice strip.
5. Save and publish. The article appears at `/news/{slug}` immediately.

**Add a project** — same flow under Projects. Leave the image blank to keep the brand placeholder until real photography is available.

**Rules for editors**

- Publish only figures the Society has verified, with the date they were true.
- Do not add testimonials, member counts, completion percentages or partner logos that have not been approved.
- Never change a published article's slug; create a new article instead.

## 7.4 Form submissions

Written as one JSON object per line:

```
data/submissions/enquiries.jsonl
data/submissions/newsletter.jsonl
```

Export for the Secretariat:

```bash
cat data/submissions/enquiries.jsonl
```

On an ephemeral host this directory must be replaced with durable storage or email delivery — see `docs/05-security.md` §5.3.

## 7.5 Deployment (Phase 8 — requires explicit approval)

Nothing has been deployed. When the Society approves:

1. **Back up first.** Take a full backup of the current site files and database, and confirm the backup restores. Do not overwrite the live host until that backup is verified.
2. Choose a staging host (any Node 22 host, or the Society's existing infrastructure) and deploy there first.
3. Set the production environment variables; rotate the preview password.
4. Run the deployment checklist in `docs/05-security.md` §5.4.
5. Measure Lighthouse on the staging origin and record the results in `docs/06-testing-and-qa.md`.
6. Obtain sign-off on the content and the scores.
7. Only then switch DNS or the document root. Keep the legacy site reachable at a subdomain for at least 30 days.
8. Submit the new `sitemap.xml` in Google Search Console; request removal of stale legacy URLs.

## 7.6 Legacy URL redirect map

The legacy application used query-style routes. Suggested one-to-one mapping for the cutover (to be added to `next.config.ts` when the domain moves):

| Legacy | New |
| --- | --- |
| `/` | `/` |
| `/pages/about` | `/about` |
| `/pages/vision` | `/about` |
| `/pages/services` | `/services` |
| `/pages/projects` | `/projects` |
| `/pages/membership` | `/membership` |
| `/news` | `/news` |
| `/news/view/6` | `/news/44th-cbn-coop-agm-2025` |
| `/news/view/7` | `/news/edc-partnership` |
| `/news/view/10` | `/news/investment-fund-classic-diamond-2024-2028` |
| `/news/view/11`, `/news/view/12` | corresponding article |
| `/contact`, `/pages/contact` | `/contact` |

Confirm each legacy path against the live site before writing the rules; do not redirect everything to `/`.

## 7.7 Assets awaiting release from the Society

| Asset | Status | Where it goes |
| --- | --- | --- |
| Project photography | Not supplied | `public/images/projects/`, then set `image` per project in the console |
| Member event photography | Not supplied | `public/images/hero/` |
| Approved social sharing image (1200×630) | Placeholder in use | `public/images/og-default.jpg` |
| Updated leadership portraits | Not supplied | `src/content/site.ts` |

## 7.8 Open questions

Questions 1–8 in `docs/01-audit-report.md` §6 remain open with the Society. In particular, the telephone number discrepancy and the project status details must be settled before launch.

## 7.9 Favicons and app icons

Every browser and home-screen identity comes from one master: `public/images/coop-seal.png`, cropped
from the Society's official lockup (`public/images/logo.png`) at its native 174 px square. The seal's
transparency is preserved in the `.ico` and PNG favicons; the iOS and Android icons place it on the
brand navy (`#0a1628`) because those platforms ignore or mask transparency.

| File | Purpose |
| --- | --- |
| `public/favicon.ico` | 16, 32 and 48 px entries for desktop tabs and bookmarks |
| `public/favicon-16x16.png`, `favicon-32x32.png`, `favicon-96x96.png` | Modern browser tabs, pinned tabs, taskbar shortcuts |
| `public/apple-touch-icon.png` | 180 px iOS home screen (opaque navy) |
| `public/android-chrome-192x192.png`, `android-chrome-512x512.png` | Android launcher and splash; the 512 doubles as the maskable icon |
| `public/manifest.webmanifest` | Generated from `src/app/manifest.ts` — name, colours, icons, standalone display |

Regenerate after any change to the seal:

```bash
npm i --no-save sharp          # asset tooling only; never a runtime dependency
node scripts/generate-favicons.mjs
```

Wiring lives in two places: `src/app/layout.tsx` (`metadata.icons`, `manifest`, and
`viewport.themeColor`) and `src/app/manifest.ts`. Icons and manifest are served from `public/`, so the
files must keep the names listed above.

**Resolution note.** The seal exists at 174 px in the official lockup and at only 30 px in the legacy
favicon, so the 192 and 512 px icons are upscaled from that master with Lanczos resampling and light
sharpening. If the Society ever supplies the original vector or a larger master seal, re-run the
script against it and the whole set improves with no code change.
