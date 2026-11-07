/**
 * Search-listing scoring for the staff console.
 *
 * Pure and dependency-free so the identical function runs on the server and in
 * the browser: the console scores a record as it is typed, with no round trip
 * and no second implementation to drift.
 *
 * Every check maps to one concrete edit an editor can make, which is the point
 * of a score — a number nobody can act on is decoration.
 */

export type SeoStatus = "pass" | "warn" | "fail";

export type SeoInput = {
  title: string;
  description: string;
  slug: string;
  image?: string;
  imageAlt?: string;
  body?: string;
  hasSchema?: boolean;
  /** Checks that do not apply to this content type, e.g. a form with no alt field. */
  skip?: string[];
};

export type SeoCheck = {
  id: string;
  label: string;
  status: SeoStatus;
  detail: string;
  points: number;
  max: number;
};

export type SeoReport = {
  score: number;
  grade: "Good" | "Needs work" | "Poor";
  checks: SeoCheck[];
  recommendations: string[];
};

const TITLE_GOOD: [number, number] = [30, 60];
const TITLE_OK: [number, number] = [20, 70];
const DESC_GOOD: [number, number] = [120, 160];
const DESC_OK: [number, number] = [80, 200];
const BODY_GOOD = 900;
const BODY_OK = 300;
const ALT_MIN = 12;
const SLUG_MAX = 60;

const CREDIT: Record<SeoStatus, number> = { pass: 1, warn: 0.5, fail: 0 };

function band(value: number, good: [number, number], ok: [number, number]): SeoStatus {
  if (value >= good[0] && value <= good[1]) return "pass";
  if (value >= ok[0] && value <= ok[1]) return "warn";
  return "fail";
}

function check(
  id: string,
  label: string,
  status: SeoStatus,
  detail: string,
  max: number,
): SeoCheck {
  return { id, label, status, detail, points: Math.round(max * CREDIT[status]), max };
}

export function scoreContent(input: SeoInput): SeoReport {
  const title = (input.title ?? "").trim();
  const description = (input.description ?? "").trim();
  const slug = (input.slug ?? "").trim();
  const image = (input.image ?? "").trim();
  const imageAlt = (input.imageAlt ?? "").trim();
  const body = input.body === undefined ? undefined : (input.body ?? "").trim();

  const checks: SeoCheck[] = [];

  checks.push(
    title.length === 0
      ? check("title", "Page title", "fail", "No title — search results would fall back to the site name.", 20)
      : check(
          "title",
          "Page title",
          band(title.length, TITLE_GOOD, TITLE_OK),
          `${title.length} characters. Aim for ${TITLE_GOOD[0]}–${TITLE_GOOD[1]} so the listing is not truncated.`,
          20,
        ),
  );

  checks.push(
    description.length === 0
      ? check("description", "Meta description", "fail", "No description — Google will invent one from the page.", 20)
      : check(
          "description",
          "Meta description",
          band(description.length, DESC_GOOD, DESC_OK),
          `${description.length} characters. Aim for ${DESC_GOOD[0]}–${DESC_GOOD[1]}.`,
          20,
        ),
  );

  const slugValid = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && slug.length <= SLUG_MAX;
  checks.push(
    check(
      "slug",
      "URL slug",
      slug.length === 0 ? "fail" : slugValid ? "pass" : "warn",
      slug.length === 0
        ? "No slug — the address would have to be generated."
        : `/${slug} — lowercase words separated by hyphens${slug.length > SLUG_MAX ? `, and ${slug.length} characters is long` : ""}.`,
      10,
    ),
  );

  checks.push(
    check(
      "image",
      "Social sharing image",
      image ? "pass" : "warn",
      image
        ? "A share image is set, so links carry artwork on Facebook, LinkedIn and WhatsApp."
        : "No image — shared links fall back to the site-wide default.",
      15,
    ),
  );

  checks.push(
    check(
      "imageAlt",
      "Image description",
      imageAlt.length >= ALT_MIN ? "pass" : imageAlt.length > 0 ? "warn" : image ? "fail" : "warn",
      imageAlt.length >= ALT_MIN
        ? `${imageAlt.length} characters — usable as alt text.`
        : "Describe the image for screen readers and image search.",
      10,
    ),
  );

  if (body !== undefined) {
    checks.push(
      check(
        "body",
        "Body copy",
        body.length >= BODY_GOOD ? "pass" : body.length >= BODY_OK ? "warn" : "fail",
        `${body.length} characters. Thin pages rank poorly; aim for ${BODY_GOOD}+.`,
        15,
      ),
    );
  }

  checks.push(
    check(
      "schema",
      "Structured data",
      input.hasSchema === false ? "fail" : "pass",
      input.hasSchema === false
        ? "No schema markup on this page type."
        : "The page emits JSON-LD, so search engines can read it as an entity.",
      10,
    ),
  );

  const considered = input.skip?.length
    ? checks.filter((item) => !input.skip?.includes(item.id))
    : checks;

  const max = considered.reduce((total, item) => total + item.max, 0);
  const earned = considered.reduce((total, item) => total + item.points, 0);
  const score = max === 0 ? 0 : Math.round((earned / max) * 100);

  const recommendations = considered
    .filter((item) => item.status !== "pass")
    .map((item) => {
      switch (item.id) {
        case "title":
          return item.detail.startsWith("No title")
            ? "Write a title between 30 and 60 characters."
            : "Shorten or lengthen the title so it lands between 30 and 60 characters.";
        case "description":
          return item.detail.startsWith("No description")
            ? "Write a description of 120–160 characters that states what the page offers."
            : "Adjust the description to 120–160 characters.";
        case "slug":
          return "Use a short, hyphenated slug with no spaces, capitals or punctuation.";
        case "image":
          return "Add a landscape image (1200×630 works everywhere) for social sharing.";
        case "imageAlt":
          return "Describe the image in at least twelve characters.";
        case "body":
          return "Add substantive detail — at least a few hundred characters of real content.";
        case "schema":
          return "Enable structured data for this content type.";
        default:
          return item.detail;
      }
    });

  const grade = score >= 85 ? "Good" : score >= 60 ? "Needs work" : "Poor";

  return { score, grade, checks: considered, recommendations };
}
