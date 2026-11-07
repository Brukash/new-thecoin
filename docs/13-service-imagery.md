# Service imagery — art direction and specification

Prepared 7 November 2026 for the CBN Staff Multipurpose Cooperative Society Ltd website.
Companion to `docs/03-design-system.md` (palette and type) and `docs/12-brand-kit.md`.

## Purpose

Replace the foreign stock photography currently on the seven service cards with authentic
Nigerian and African imagery that makes a member recognise their own financial life in the
service, rather than looking at a foreign bank's website.

## Honest starting point

The repository contains **no authentic Nigerian service photography**. What exists:

| Asset | What it is | Usable for services? |
| --- | --- | --- |
| `hero/p1–p14.jpg` | Generic international stock (Dubai skyline, European offices, staged handshake) | No — conflicts with the brief |
| `hero/head-office.jpg` | The real Sam Olabanji House | Yes, but only for the Society, not a service |
| `leadership/*.jpg` | Real officers of the Society | No — individuals, not services |
| `partners/*` | Partner institution logos | No — third-party marks must not appear |
| Root `events-*.png`, `leadership-*.png` | Screenshots of the website itself | No |

Two of the seven images in use fail this brief on its own terms: **p10** is the staged handshake
it explicitly excludes, and **p13** is a foreign skyline (Dubai) — the precise "foreign bank"
impression the brief is written to avoid. Until authentic photographs are secured, the honest
option is the designed placeholder described at the end, not an unsuitable photograph.

## Shared direction (applies to all seven)

- **People:** Nigerian and African professionals, families and working-class members, photographed
  as they are. Mixed ages, mixed genders, realistic dress — office wear for the Secretariat, modest
  everyday clothing for families. Retirees should appear as often as young professionals; a
  cooperative serving staff on secondment and pensioners is not a startup.
- **Light:** natural daylight, soft and even. No heavy HDR, no teal-and-orange grading, no
  desaturated "corporate" wash. Warm neutrals sit best beside the site's bone and mist grounds.
- **Colour:** images should carry navy, gold-adjacent warmth or neutral daylight. Avoid frames
  dominated by saturated red, or by heavy green foliage that fights the gold accent.
- **Framing:** landscape. Shoot 3:2, deliver 16:9 crops. Keep the subject inside the central 60%
  so a mobile crop never decapitates anyone.
- **What must not appear:** foreign currency, unrecognisable or invented financial documents,
  third-party bank or brand marks, luxury cars, staged handshakes across a desk, boardroom
  clichés, or imagery that reads as poverty.
- **Consent:** any photograph of identifiable members requires a signed release before publication.

## Technical specification

| Property | Value |
| --- | --- |
| Card aspect | 16:9 (change the card from the current 16:10 to match the brief) |
| Master crop | 1600 × 900 px |
| Mobile crop | 800 × 450 px |
| Masthead | 1920 × 1080 px, subject weighted to the right — the left 54% is covered by the navy panel |
| Format | Store the master as high-quality JPEG or WebP; `next/image` already negotiates AVIF/WebP |
| CSS | `object-fit: cover` with `object-position` tuned per image so faces survive cropping |
| Loading | Cards lazy by default; mastheads `priority` (already the case) |
| Path | `/public/images/services/<slug>.jpg` |

## The seven services

### 01 — Credit & Thrift

- **Concept:** a member and an officer going through a thrift record together — the ordinary,
  unglamorous act of contributing and being recorded.
- **Subject and setting:** a Nigerian civil servant in a modest office or at the Secretariat
  counter, a passbook or printed statement open between them, an officer's hand pointing at a
  line. Daylight from a window.
- **Composition:** three-quarter view across the desk, faces visible and relaxed, document legible
  as a document but not readable as data.
- **Why:** thrift is a habit, not a product. The image should show the habit being kept.
- **Search phrase:** `Nigerian woman reviewing savings passbook with officer`
- **Filename:** `credit-and-thrift-thrift-record.jpg`
- **Alt:** `A member and a cooperative officer reviewing a monthly thrift record at a desk`

### 02 — Savings

- **Concept:** a household planning money together — the private discipline behind the service.
- **Subject and setting:** a Nigerian family or a single professional at a kitchen or living-room
  table with a notebook, envelopes or a phone calculator, planning the month.
- **Composition:** warm domestic interior, side light, hands and faces both in frame, shallow depth
  of field. Nothing branded on the table.
- **Why:** savings is the one service that happens at home. It should look like home.
- **Search phrase:** `African family planning household budget at home`
- **Filename:** `savings-household-budget.jpg`
- **Alt:** `A family planning a monthly budget together at their dining table`

### 03 — Loans

- **Concept:** a member being shown what a facility means before signing — advice, not transaction.
- **Subject and setting:** an officer explaining a single sheet of paper to a member across a desk,
  both leaning in, no handshake, no pen hovering.
- **Composition:** over-the-shoulder from behind the member so the member's face is partly turned
  toward the officer; the document stays out of focus.
- **Why:** the Society's published position is that terms are confirmed in writing before a member
  commits. The image should show that conversation.
- **Search phrase:** `African loan officer explaining documents to client office`
- **Filename:** `loans-officer-consultation.jpg`
- **Alt:** `A cooperative officer explaining loan terms to a member across a desk`
- **Note:** must not imply approval, amounts or speed. No cash on the table.

### 04 — Investments

- **Concept:** informed review, not speculation — members reading performance, not watching tickers.
- **Subject and setting:** two African professionals at a table with a laptop and printed report,
  one tracing a line with a pen. Modern but modest Abuja office.
- **Composition:** mid-shot at the table, screen angled away from camera so no figures are legible,
  window light behind.
- **Why:** the Coop Investment Fund runs in defined series with published rates. The image should
  read as stewardship of a term deposit, not a trading floor.
- **Search phrase:** `African professionals reviewing investment report meeting`
- **Filename:** `investments-portfolio-review.jpg`
- **Alt:** `Two colleagues reviewing an investment performance report in an office`
- **Avoid:** screens showing percentages, stock charts in green and red, foreign exchanges.

### 05 — Advisory & Wealth

- **Concept:** a one-to-one conversation about a long horizon — retirement, estate, planning.
- **Subject and setting:** an adviser and an older member seated at an angle, not across a barrier,
  in a light consulting room. A notebook, a cup, no branded collateral.
- **Composition:** both faces visible, adviser listening rather than talking, unhurried.
- **Why:** the service is described as guidance before commitment. The image should look like
  listening.
- **Search phrase:** `African financial adviser consulting retired client`
- **Filename:** `advisory-wealth-consultation.jpg`
- **Alt:** `A financial adviser in conversation with a retired member in a consulting room`

### 06 — Home Ownership

- **Concept:** a Nigerian family at the threshold of a home they now hold — understated, not
  aspirational.
- **Subject and setting:** a family outside a modest, newly completed Nigerian terrace or block of
  flats — the kind of unit the River Park projects actually deliver — keys in hand, gate and
  render visible.
- **Composition:** wide enough to show the building's material and the family together; late
  afternoon light; no luxury cars, no gates of a mansion.
- **Why:** 2,000+ members have been housed over 15 years through developer partnerships. The image
  should represent that scale of home, not a fantasy villa.
- **Search phrase:** `Nigerian family new home keys terrace duplex`
- **Filename:** `home-ownership-family-new-home.jpg`
- **Alt:** `A family standing outside their newly completed home with the keys`

### 07 — Consumer

- **Concept:** the exhibition and E-Mall as they are actually used — members buying household goods
  on flexible terms.
- **Subject and setting:** a member examining a fridge, generator, phone or furniture at a stall,
  a vendor alongside. Ideally shot at the Society's own annual exhibition.
- **Composition:** stall context visible — goods, canopy, price cards turned away from camera.
  Nothing branded by a third party.
- **Why:** this is the one service where the Society's own event photography is the correct source.
- **Search phrase:** `Nigerian shoppers electronics market stall Abuja`
- **Filename:** `consumer-exhibition-household-goods.jpg`
- **Alt:** `A member examining household appliances at a cooperative sales exhibition`

## Where to get these

Three routes, in order of preference.

1. **Commission at the Society's own events.** The 8th End of Year Sales and Exhibition runs
   30 November – 5 December 2026 at the National Ecumenical Centre, Abuja. A half-day with a
   photographer there yields genuine Consumer imagery (07), plus candid member-and-officer frames
   usable for 01 and 03. This is the fastest route to authentic, first-party photography with
   consent handled on site.
2. **A short Secretariat shoot.** Two hours at Sam Olabanji House covers 01, 03 and 05 with real
   officers and volunteer members. Requires signed releases.
3. **Licensed stock with African collections.** Only if 1 and 2 cannot happen before launch. Use a
   paid licence that explicitly covers commercial web use; check releases; prefer Nigerian or
   West African photographers. Never hotlink a stock URL and never use a search-engine image.

## Until the photographs exist

Per the brief: use a placeholder rather than an unsuitable photograph. The site already has the
vocabulary for it — the navy panel with a gold hairline, the service number at display size, and
the service name in Source Serif 4. That reads as deliberate editorial design rather than a
missing asset, and it costs nothing to replace one image at a time as photographs arrive.

## Implementation once images land

Images are already resolved per service through `serviceImage(slug)` in `src/content/services.ts`,
so a new photograph means changing one path. Two small changes follow from this brief:

1. Card aspect 16:10 → **16:9** in `src/app/(site)/services/page.tsx`.
2. Add an optional `imageAlt` to the `Service` type and pass it to the card and the masthead —
   card images are currently `alt=""` (decorative), which is right for stock but wrong for a
   photograph that carries meaning.
