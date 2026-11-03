# 03 — Design system

## 3.1 Intent

The site should read as a financial institution's member publication, not a marketing landing page. That means: restrained palette, editorial typography, generous margins, flat surfaces, hairlines instead of shadows, and motion that is felt rather than noticed. The references are JPMorgan, Goldman Sachs, Zenith and Stanbic IBTC — institutions that signal permanence through restraint.

Explicitly avoided: gradient hero blobs, floating 3D cards, glassmorphism, illustrated people, emoji iconography, oversized rounded corners, and stock "diverse team laughing" photography.

## 3.2 Colour

Defined once in `src/app/globals.css` under `@theme`, so every utility (`bg-navy`, `text-slate`, `border-line`) resolves from these values.

| Token | Hex | Use |
| --- | --- | --- |
| `ink` | `#08101f` | Deepest ground: footer, dark bands |
| `navy` | `#0a1628` | Primary brand surface, headings on light |
| `navy-700` | `#102541` | Raised dark surface |
| `navy-500` | `#1b3557` | Dark borders, subdued dark text |
| `gold` | `#b99351` | Accent rules, eyebrow text on dark, focus |
| `gold-600` | `#9c7a3d` | Accent text on white (AA at body size) |
| `gold-200` | `#e6d3ab` | Hover state on dark |
| `gold-50` | `#f7f1e4` | Tinted callout |
| `paper` | `#ffffff` | Default page ground |
| `bone` | `#f7f5f0` | Warm alternating section |
| `mist` | `#eef1f4` | Cool neutral, image beds |
| `charcoal` | `#1a2127` | Body copy |
| `slate` | `#58626e` | Secondary copy (4.9:1 on white) |
| `line` | `#e4dfd4` | Warm hairline |
| `line-dark` | `#24374f` | Hairline on navy |

Gold is never used for body text on white — only for eyebrow labels, rules and emphasis at `gold-600` or darker. This was one of the accessibility failures of the legacy site.

## 3.3 Typography

| Role | Face | Treatment |
| --- | --- | --- |
| Display / headings | Source Serif 4, 400 | `letter-spacing: -0.02em`, `text-wrap: balance` |
| Body / UI | Inter | `cv11`, `ss01` features on; `text-wrap: pretty` |
| Eyebrow | Inter, 600 | 11 px, uppercase, `0.16em` tracking |

Scale (fluid, no media queries needed in most cases): `display` hero 2.5→3.5 rem, section h2 1.9→2.4 rem, card title 1.25 rem, body 0.95–1 rem with 1.7 line height. Body copy never below 14 px; footer legal at 12 px only.

Serif for anything the institution *says*; sans for anything that *operates* (labels, buttons, navigation, form fields). That contrast does most of the visual work.

## 3.4 Layout

- `shell` — `max-width: 1200px`, `padding-inline: clamp(1.25rem, 4vw, 2.5rem)`. Every section uses it.
- Vertical rhythm — `py-14 md:py-20` for sections, `py-24 md:py-32` for the hero.
- Grid — content is aligned to a 12-column grid on desktop, collapsing to a single column below `lg`. Sidebars use `lg:sticky lg:top-28`.
- Hairlines — `1px` `line` colour; section boundaries are expressed by a rule or a ground change, never a drop shadow.
- Cards — square corners, `border` plus optional 1 px gold top rule. Radius is limited to `2px` on inputs and buttons. No pill shapes except status chips.

## 3.5 Components

| Class / component | Behaviour |
| --- | --- |
| `.eyebrow` | Gold-600 uppercase label; `-invert` variant for dark grounds |
| `.display` | Serif display heading with tuned tracking |
| `.btn`, `.btn-primary`, `.btn-outline`, `.btn-outline-invert` | 2 px radius, 44 px min height, 150 ms colour transition, visible `focus-visible` ring |
| `.card` | White surface, hairline border, optional gold top edge |
| `.link-underline` | Gold underline that thickens on hover; never colour-only |
| `.field`, `.field-label` | 44 px inputs, persistent labels, 2 px radius |
| `.prose-coop` | Long-form article measure (68ch), serif sub-headings, styled lists and blockquote |
| `.hairline-grid` | 1 px navy grid overlay used behind dark bands at 30% opacity |
| `.reveal` | 12 px rise + fade on intersection, 600 ms, `--ease-out-soft`; disabled under `prefers-reduced-motion` |

## 3.6 Motion

- Entrance: opacity 0→1, translateY 12 px→0, 550–700 ms, staggered 60 ms per sibling.
- Hover: colour and 1 px shifts only. No scaling of images beyond a restrained 1.02 inside a clipped frame.
- Every animation is under 700 ms, none loops, and all are removed under `prefers-reduced-motion: reduce`.
- No parallax, no scroll-jacking, no autoplaying carousel.

## 3.7 Imagery

- Photography is architectural and human-at-work: buildings, meeting rooms, document tables, handshakes. No staged laughter, no pointing at laptops.
- Images sit in fixed-ratio frames so nothing shifts as they load; `object-position` keeps the subject on mobile.
- Where no approved photograph exists (project pages), a navy SVG placeholder carries the project name and a note that photography is pending. **No unrelated building is used to represent a project.**
- Partner marks render grayscale at 70% opacity, full colour on hover, inside equal-height cells.

## 3.8 Voice

Short declarative sentences. Institutional register without legalese. Numbers always carry a date or a source. Second person for member-facing instructions ("confirm with the Secretariat"), third person for institutional description ("the Society operates…"). No exclamation marks, no "empowering your journey", no superlatives the Society cannot substantiate.

## 3.9 Accessibility commitments

- Contrast: body `charcoal` on `paper` 13.6:1; `slate` on `paper` 4.9:1; white on `navy` 15.5:1; `gold-600` on `paper` 4.6:1.
- Focus is always visible: 2 px gold ring with 2 px offset, never `outline: none`.
- Landmarks: one `h1` per page, `header`/`nav`/`main`/`footer`, `aria-current` on the active link, skip link first in tab order.
- Every interactive target is at least 44×44 px on touch.
- Accordions use native `<details>`/`<summary>`, so they work without JavaScript.
- Forms: persistent `<label>`, `aria-describedby` hints, `role="alert"` on error, `aria-live="polite"` on success.
