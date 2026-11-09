# 05 — Security

## 5.1 Position

This is a public information site with one small editorial console. There is no member database, no payment flow and no personal data beyond what a visitor chooses to type into an enquiry form. The design therefore aims at *minimising the attack surface* rather than building a layered application security programme.

## 5.2 Controls implemented

### Transport and headers (`next.config.ts`)

| Header | Value | Purpose |
| --- | --- | --- |
| `Content-Security-Policy` | `default-src 'self'`; scripts and styles `'self' 'unsafe-inline'`; `frame-src` Google Maps only; `object-src 'none'`; `frame-ancestors 'none'`; `base-uri 'self'`; `upgrade-insecure-requests` | Blocks injected third-party script and framing |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | Forces HTTPS |
| `X-Content-Type-Options` | `nosniff` | Stops MIME sniffing |
| `X-Frame-Options` | `DENY` | Clickjacking defence for older browsers |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Limits referrer leakage |
| `Permissions-Policy` | camera, microphone, geolocation, payment all `()` | Nothing needs them |
| `poweredByHeader` | `false` | No framework fingerprint |
| `/admin/*` | `Cache-Control: no-store`, `X-Robots-Tag: noindex, nofollow` | Console never cached or indexed |

`'unsafe-inline'` is present for scripts because Next.js emits an inline bootstrap; removing it requires nonce plumbing through every route. Documented as a known trade-off, not an oversight.

### Authentication (`src/lib/admin-auth.ts`)

- Single shared staff password supplied by `ADMIN_PASSWORD`; never in source, never in the client bundle.
- Password comparison uses SHA-256 digests and `timingSafeEqual`, so response time does not leak the password length or prefix.
- Session cookie is `HttpOnly`, `SameSite=Strict`, `Secure` in production, scoped to `/admin`, and expires after 8 hours.
- The cookie value is `expiry.HMAC-SHA256(expiry, SESSION_SECRET)` — the server keeps no session table, and an attacker cannot mint a valid token without the secret.
- If either variable is missing or too short, `isAdminConfigured()` returns false and authentication is impossible (fail closed).
- Every mutating server action re-checks the session (`requireAdmin`) rather than trusting the page that rendered the form.

### Input handling

- `zod` schemas on both API routes: bounded lengths for every field, strict enum for enquiry type, email format check, and a honeypot field that must be empty.
- Server-side validation is authoritative; browser validation is only a convenience.
- Rate limiting: 5 submissions per client per 10 minutes per endpoint, keyed on the forwarded address.
- Honeypot submissions return a success-shaped response so bots cannot probe the rule.
- Rejections are logged server-side without the submitted content.
- Submissions are written to `data/submissions/*.jsonl` (gitignored) — no secrets, no card data, and the form never asks for one.
- Content written by staff is rendered as text, not HTML: article bodies are arrays of paragraphs rendered through React, so HTML injected into the console cannot execute.

### Data boundaries

- No member, savings, loan or payroll data exists in this repository.
- The public site never displays private member information; it links out to the Coopman portal, which is the Society's system of record.
- Administrative access is limited to published copy. There is no capability to read submissions in the browser; exports are taken from the server by the Secretariat.

### Secrets

- `.env.local` is gitignored; `.env.example` documents the variable names with no values.
- No key, password or token appears in any client component, any public asset, or this documentation.
- The preview credentials in `.env.local` are local-only and must be replaced before deployment.

## 5.3 Known limitations (and what to do about them)

| Limitation | Impact | Recommended action before scale-up |
| --- | --- | --- |
| Shared staff password, no individual accounts | No audit trail of *who* edited what | Move to per-user accounts with an identity provider; log actor + timestamp |
| Rate-limit state is per process | Multiple instances multiply the effective limit | Move to a shared store (Redis or the platform's KV) |
| CSP allows inline script | Reduced XSS hardening | Adopt nonce-based CSP via middleware |
| File-based content store | Not safe for concurrent editors on multiple instances | Migrate editorial content to a database when the console grows |
| Submissions stored on local disk | Lost if the host is ephemeral | Deliver by email through an approved provider, or write to durable storage |
| No automated dependency scanning in CI | Known CVEs could age in | Enable Dependabot or equivalent; run `npm audit` on a schedule |

## 5.4 Deployment checklist

1. Rotate `ADMIN_PASSWORD` to a long random value; generate `SESSION_SECRET` with `crypto.randomBytes(32)`.
2. Set `NEXT_PUBLIC_SITE_URL` to the canonical HTTPS origin.
3. Confirm HSTS, CSP and `X-Frame-Options` are present on the production response.
4. Confirm `https://…/admin` returns `noindex` and is excluded by `robots.txt`.
5. Confirm `/api/enquiry` rejects an invalid payload with 422 and a sixth rapid submission with 429.
6. Verify TLS certificate chain and automatic renewal.
7. Ensure `data/` is outside the web root and excluded from any static upload.
8. Keep the legacy site's backups until the new site has run clean for 30 days.

## 5.5 Security review — 9 November 2026

A full review of the application, database policies, auth, uploads, APIs and deployment
configuration found and fixed the issues below. Severity is rated on exploitability and the
sensitivity of what was reachable.

| # | Finding | Severity | Fix |
| --- | --- | --- | --- |
| 1 | Enquiry CRM case documents were stored as `published`, so the public `content_public_read` policy exposed internal notes, officer names, replies and feedback to anyone holding the (public) anon key. Confirmed: one case row was readable. | **High** | Cases are written as drafts and the read policy excludes the `enquiry-cases` collection; existing rows migrated (`20261109_harden_content_and_registration_policies.sql`). |
| 2 | `event_registrations_public_insert` allowed anonymous inserts through PostgREST directly, bypassing the server action's validation, honeypot and rate limit. | **Medium** | Policy dropped. The server action writes with the service role, so no functionality was lost. |
| 3 | `/auth/confirm` accepted a `next` value of `/\host`, which the URL parser normalises to `//host` — an off-site redirect after a valid recovery link. | **Medium** | `safeNext` rejects backslashes, control characters, non-`/admin` paths, and re-checks the resolved origin. |
| 4 | CSV export of event registrations wrote attacker-controlled names into spreadsheet cells unescaped, allowing formula injection in Excel/Sheets. | **Medium** | Leading `= + - @`, tab and CR are neutralised; control characters removed. |
| 5 | Uploads trusted the browser-supplied `File.type`; any file could be stored in a public bucket under an image extension, and SVG uploads accepted script and event handlers. | **Medium** | `readVerifiedUpload` checks magic bytes for JPEG/PNG/WebP/AVIF/PDF and rejects active SVG content before storage. |
| 6 | Structured data was rendered with `JSON.stringify` into an inline script; a stored title containing `</script>` could break out of the element. | **Medium** | `jsonLdScript` escapes `<`, `>`, `&`, U+2028/U+2029 in all seven JSON-LD blocks. |
| 7 | Admin sign-in had no throttle, leaving the shared staff password open to unlimited guessing. | **Medium** | 8 attempts per address+account and 40 per address per 15 minutes, on both the Supabase and local paths. |
| 8 | `/api/chat` treated a missing `Origin` as same-origin, so scripts and bots could spend the assistant budget. | **Low** | Strict same-origin: Origin, then `Sec-Fetch-Site`, then Referer; no proof means 403. |
| 9 | The password-reset link was built from the request's `Host` header (host-header injection into an emailed token). | **Low** | Uses `NEXT_PUBLIC_SITE_URL`, else the canonical `site.url`; loopback only in development. |
| 10 | Rate limiting keyed on the left-most `X-Forwarded-For`, a client-controlled header on hosts that do not rewrite it. | **Low** | Platform headers (`x-vercel-forwarded-for`, `cf-connecting-ip`, `x-real-ip`) first; unknown addresses fail closed into one shared bucket. |
| 11 | Password-reset requests were unthrottled (mail-bombing a staff address). | **Low** | 5 requests per address per 15 minutes. |
| 12 | The cron endpoint compared its bearer token with `!==`, leaking length and prefix by timing. | **Low** | Constant-time comparison. |
| 13 | `next` 15.5.28 and its bundled `postcss` had advisories. | **Low** | Upgraded to 15.5.29. `zod` 3.x has a memory-exhaustion advisory; every schema in this project bounds its arrays and strings, so it is not reachable here, and the v4 upgrade is deferred as a breaking change. |

Reviewed and found sound: no unguarded admin mutation (all 23 content actions, 17 event actions, 4 case actions and
6 policy actions re-check the staff session), every admin page guarded, RLS enabled on all 13 tables, service-role
key server-only, signed HttpOnly session cookie with `SameSite=Strict`, security headers and `noindex` on `/admin`,
no secrets in the repository or client bundle, and no `innerHTML`/`eval` sinks outside the escaped JSON-LD blocks.

Not changed, and worth knowing: the CSP still allows inline script (removing it needs nonce plumbing); rate-limit
state is per instance; and uploads are validated but not virus-scanned.
