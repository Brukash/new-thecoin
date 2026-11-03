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
