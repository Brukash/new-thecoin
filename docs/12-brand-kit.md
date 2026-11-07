# 12 — Canva brand kit plan

Status: **plan only — the kit has not been created in Canva.** Every colour and type value below is copied from
`src/app/globals.css` (`@theme`) and `docs/03-design-system.md`, so printed material matches the website rather
than running a parallel identity.

## 12.1 What Canva can and cannot do for this

| Task | Route |
| --- | --- |
| Create the brand kit (colours, fonts, logos) | **Canva UI only** — Brand → Brand kit. The MCP exposes kits read-only (`list-brand-kits` returns ids, names, thumbnails), so no agent can build this for you. |
| Generate a flyer, banner or report cover from a written brief | MCP `generate-design`, via the `canva-edit-design` skill, after OAuth |
| Resize one approved banner into channel variants | MCP `resize-design`, via `canva-resize-for-social-media` |
| Check a design against this palette and type | `canva-brand-check` — visual comparison unless the kit exposes hex values |
| Fill certificates from a spreadsheet | Brand templates + Autofill, **Enterprise/Pro only**. Assume manual: type each name. |

## 12.2 Palette — load in this order

Canva shows palette slots in the order added, so the first six become the ones people actually reach for.

| # | Canva slot name | Hex | Role | Rule |
| --- | --- | --- | --- | --- |
| 1 | Institutional Navy | `#0a1628` | Primary surface, headings on light | Default dark ground instead of black |
| 2 | Paper | `#ffffff` | Page ground | Never tinted |
| 3 | Refined Gold | `#b99351` | Rules, rules over navy, button fill | Never body text on white |
| 4 | Charcoal | `#1a2127` | Body copy | Replaces pure black everywhere |
| 5 | Bone | `#f7f5f0` | Alternating warm panel | Pairs with navy only |
| 6 | Slate | `#58626e` | Secondary copy, captions | 4.9:1 on white — do not lighten |
| 7 | Deep Ink | `#08101f` | Footer, back cover | Darker than navy, use sparingly |
| 8 | Navy 700 | `#102541` | Raised dark panel | Table headers on dark |
| 9 | Navy 500 | `#1b3557` | Dark hairlines, subdued text on navy | |
| 10 | Gold Deep | `#9c7a3d` | Accent text on white, eyebrow labels | Minimum gold for text on light |
| 11 | Gold Light | `#e6d3ab` | Hover, highlight on navy | Not for text on white |
| 12 | Warm Ivory | `#f7f1e4` | Callout / notice box | |
| 13 | Mist | `#eef1f4` | Cool neutral, image bed | Never adjacent to Bone |
| 14 | Warm Hairline | `#e4dfd4` | 1 px rules on light | The only border colour on white |
| 15 | Dark Hairline | `#24374f` | 1 px rules on navy | |

**No other colour is permitted**, including the accent colours Canva templates ship with. Partner logos are the
single exception and always render greyscale.

Gradient policy: none in print. The site's button gradient is a screen-only artefact of `.btn-primary`; flat
`#b99351` is the print fill.

## 12.3 Typography

| Canva font role | Face | Weight | Case / tracking |
| --- | --- | --- | --- |
| Headings | Source Serif 4 | 400 only | Sentence case, tracking −2% |
| Subheads / standfirst | Inter | 600 | Sentence case |
| Body | Inter | 400 | Sentence case, 1.6 line height |
| Labels / eyebrow | Inter | 600 | UPPERCASE, tracking +16% |

This is the pairing the site loads (`Source_Serif_4`, `Inter` in `src/app/layout.tsx`): serif for what the
institution *says*, sans for what *operates*.

**Check the font picker before locking.** If Source Serif 4 is not offered on the plan, pick the closest
transitional serif available — Lora or Libre Baskerville keep the editorial tone. Do not substitute Playfair
Display or a high-contrast didone: it reads as fashion retail, not a financial institution. Whatever is chosen,
record it here so the site and print do not drift.

Print sizes, A4 in points: display 54–72 · cover title 40–48 · section h2 26–30 · subhead 14 · body 10.5 ·
caption 8 · eyebrow 8 uppercase. Body never below 9.5 pt.

Square social, 1080 px: headline 64–76 · subhead 32 · body 26 · eyebrow 20.

## 12.4 Logo assets

| Variant | Source | Use |
| --- | --- | --- |
| Primary (full colour) | `public/images/logo.png` | Light grounds |
| Seal / emblem | `public/images/coop-seal.png` | Certificates, report cover, watermark |
| Reversed (white) | `public/images/logo-reversed.png` | Navy and photographic grounds |

Upload requirements: transparent background, at least 1200 px on the long edge, or SVG. Clear space equal to
the height of the lockup on all sides. Minimum 25 mm in print, 96 px on screen. Never recolour, stretch, add
shadow, or place on a busy photograph without a navy scrim.

**Measured from the files in this repo (PNG headers, at 300 dpi):**

| File | Pixels | Transparency | Largest usable print size |
| --- | --- | --- | --- |
| `logo.png` | 828 × 178 | yes, RGBA | ≈70 mm wide — fine in an A4 flyer header, too small for a poster or roll-up |
| `coop-seal.png` | 182 × 182 | yes, RGBA | ≈15 mm — a small certificate seal, not a large watermark |

Neither file is print-grade at large format, and `logo.png` is a wide wordmark at roughly 4.6:1, not a stacked
lockup. Before the kit is used for anything beyond A4, get the vector master (SVG, AI or EPS) or a 300 dpi export
at three times these dimensions. Do not upscale the existing PNGs — on a certificate the edges show.

## 12.5 Template list

Naming: `CBN-<family>-<topic>-<YYYY-MM>-v<n>`. Sizes are the Canva presets to search for.

### Flyers — 2 templates

| Template | Size | Fixed | Editable |
| --- | --- | --- | --- |
| Member notice flyer | A4 portrait, 2480 × 3508 px | Logo top-left, gold rule, footer with phone and email, navy band | Eyebrow, headline, three short paragraphs, one optional image |
| Square announcement | 1080 × 1080 px | Same footer, seal watermark at 8% | Headline, date line, one line of detail |

Content rules: one message per flyer, at most one call to action. Rates, fees and deadlines are copied from the
published source and carry a date — never typed from memory.

### Certificates — 3 templates

| Template | Size | Notes |
| --- | --- | --- |
| Certificate of membership | A4 landscape, 3508 × 2480 px | Seal, name field, membership number, date of admission |
| Certificate of participation | A4 landscape | Event name, date, venue — issued after the event only |
| Long service recognition | A4 landscape | Years of service stated numerically; requires signatory approval |

Anatomy: navy border hairline inset 15 mm, seal centred or bottom-right, gold rule under the recipient name, two
signature blocks. **Signatory names and titles must come from the Secretariat** — none are inferred here, and no
signature image is generated.

### Event banners — 4 templates

| Template | Size | Use |
| --- | --- | --- |
| Web hero | 1920 × 600 px | Site and email header |
| Social event cover | 1920 × 1005 px | Facebook and LinkedIn event |
| LinkedIn banner | 1584 × 396 px | Profile and page header |
| Roll-up standee | 850 × 2000 mm | AGM, workshops, stand |

Banner rules: the headline must survive being read at three metres, so set it at roughly 40% of banner height.
Keep the bottom 120 px of the roll-up free of text — it sits inside the base. One image maximum, darkened with a
navy overlay at 55% if text crosses it.

### Reports — 3 templates

| Template | Size | Notes |
| --- | --- | --- |
| Annual report | A4 portrait, 16–32 pp | Cover, contents, chair's statement, financial summary, member statistics |
| Quarterly bulletin | A4 portrait, 4–8 pp | Newsletter register, lower density |
| Report cover only | A4 portrait, 1 pp | For handover to an external printer |

Report grid: 12 columns, 15 mm margins, 6 mm gutter. Running foot with page number and the society's full name.
Charts use navy, gold and slate only, never a third-party chart palette. Every figure carries a period label and
a source line.

## 12.6 Build order

1. Palette and fonts — 15 minutes, and this alone stops most off-brand output.
2. Logo upload, then produce the reversed variant.
3. Member notice flyer, approved by the Secretariat, then duplicated as the master for all flyers.
4. Square announcement resized from the approved flyer rather than rebuilt.
5. Certificates last — they cannot be finished until signatories are confirmed.
6. Banners resized from the approved flyer artwork.
7. Report master only once the reporting period's figures exist.

## 12.7 Governance

- Owner: Communications. Approver for anything containing a rate, fee, deadline or member entitlement: the
  Secretariat.
- Locked on every template: logo, footer contact block, palette, fonts. Editors change copy and images only.
- Never typed freehand into a template: rates, fees, phone number, email, bank details. These come from the site
  content files or the Secretariat's notice.
- Review the kit whenever the `globals.css` tokens change. The site is the source of truth; print follows it.
- Two versions live at a time, current and previous. Retired templates move to an archive folder and are never
  edited again.

## 12.8 Facts available versus facts still needed

Confirmed and usable today: society name, phone `0909 679 7982`, email `info@cbncoopng.com`, the membership
savings account GTB `0023723318`, and the published rate table in `src/content/rates.ts`.

Still required before certificates and reports can be templated:

- Names and titles of the two signatories, and whether scanned signatures exist
- Registered office address as it should appear on the back cover
- Registration number, if one is to be printed
- Whether the Canva plan includes Brand templates and Autofill, which decides manual or bulk certificate issue
- Approval of the generated reversed logo (`logo-reversed.png`), or the vendor's vector master

## 12.9 How this gets verified

1. Authenticate once: `canva login`, or approve the MCP OAuth prompt on first tool use.
2. `list-brand-kits` should return the kit by name — that confirms the palette and fonts were saved.
3. Generate one flyer from the brief; confirm the returned `edit_url` opens and the colours are this palette.
4. Run `canva-brand-check` on that flyer. It reports **Can't verify** for hex and font unless the kit exposes
   them, which is expected — the palette in 12.2 is then the rubric you check against by eye.
