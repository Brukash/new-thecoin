import "server-only";
import { site, primaryNav } from "@/content/site";
import { creditNav } from "@/content/credit-nav";
import { getFaqGroups, listArticles, listProjects, listServices } from "@/content/queries";
import { listAnnouncements, listEvents } from "@/lib/cms/events";
import { formatEventDate } from "@/lib/events/format";

/**
 * Site search.
 *
 * Everything the public can read is indexed at request time from the same
 * queries the pages use, so a record published in the console is searchable
 * immediately and there is no second copy to fall out of date. Ranking is
 * deliberately simple and explainable: a phrase in the title counts far more
 * than a passing mention in a paragraph.
 */

export type SearchHit = {
  title: string;
  href: string;
  summary: string;
  kind: string;
  score: number;
};

export type SearchResult = {
  query: string;
  hits: SearchHit[];
  total: number;
  suggestions: string[];
};

type Doc = Omit<SearchHit, "score"> & { body: string };

const STOP_WORDS = new Set([
  "the", "a", "an", "and", "or", "of", "to", "in", "on", "for", "is", "are",
  "do", "does", "how", "what", "where", "when", "can", "i", "my", "we", "you",
  "it", "with", "at", "by", "from", "about",
]);

function tokenise(input: string): string[] {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));
}

function plain(input: string): string {
  return input.replace(/\s+/g, " ").trim();
}

function excerpt(body: string, terms: string[]): string {
  const sentence = body.split(/(?<=[.!?])\s+/).find((line) =>
    terms.some((term) => line.toLowerCase().includes(term)),
  );
  const text = plain(sentence ?? body);
  return text.length > 180 ? `${text.slice(0, 177).trimEnd()}…` : text;
}

async function buildIndex(): Promise<Doc[]> {
  const [services, projects, articles, events, announcements, faq] = await Promise.all([
    listServices(),
    listProjects(),
    listArticles(),
    listEvents(),
    listAnnouncements(),
    getFaqGroups(),
  ]);

  const docs: Doc[] = [];

  for (const page of [...primaryNav, ...creditNav]) {
    docs.push({
      title: page.label,
      href: page.href,
      summary: "",
      kind: "Page",
      body: `${page.label} ${site.name}`,
    });
  }

  for (const service of services) {
    docs.push({
      title: service.title,
      href: `/services/${service.slug}`,
      summary: service.summary,
      kind: "Service",
      body: plain(
        [service.summary, service.intro, ...service.body.flatMap((block) => block.paragraphs)]
          .join(" "),
      ),
    });
  }

  for (const project of projects) {
    docs.push({
      title: project.name,
      href: `/projects/${project.slug}`,
      summary: project.summary,
      kind: "Project",
      body: plain(
        [project.name, project.summary, project.location, project.city, project.state, ...project.description].join(" "),
      ),
    });
  }

  for (const article of articles) {
    docs.push({
      title: article.title,
      href: `/news/${article.slug}`,
      summary: article.excerpt,
      kind: "News",
      body: plain([article.title, article.excerpt, ...article.body].join(" ")),
    });
  }

  for (const event of events) {
    docs.push({
      title: event.title,
      href: `/events/${event.slug}`,
      summary: event.shortDescription,
      kind: "Event",
      body: plain(
        [event.title, event.shortDescription, event.venueName, event.venueAddress, formatEventDate(event)].join(" "),
      ),
    });
  }

  for (const announcement of announcements) {
    docs.push({
      title: announcement.title,
      href: `/events/announcements/${announcement.slug}`,
      summary: announcement.shortDescription,
      kind: "Notice",
      body: plain([announcement.title, announcement.shortDescription, announcement.fullDescription].join(" ")),
    });
  }

  for (const group of faq) {
    for (const item of group.items) {
      docs.push({
        title: item.q,
        href: "/faq",
        summary: item.a,
        kind: "Answer",
        body: plain(`${item.q} ${item.a}`),
      });
    }
  }

  return docs.filter((doc) => doc.href.startsWith("/"));
}

export async function searchSite(rawQuery: string): Promise<SearchResult> {
  const query = plain(rawQuery).slice(0, 120);
  const terms = tokenise(query);

  if (terms.length === 0) {
    return { query, hits: [], total: 0, suggestions: [] };
  }

  const index = await buildIndex();
  const phrase = query.toLowerCase();
  const scored: SearchHit[] = [];

  for (const doc of index) {
    const title = doc.title.toLowerCase();
    const body = doc.body.toLowerCase();
    let score = 0;

    if (title === phrase) score += 60;
    if (title.includes(phrase)) score += 30;
    if (doc.summary.toLowerCase().includes(phrase)) score += 12;

    for (const term of terms) {
      if (title.includes(term)) score += 6;
      if (doc.summary.toLowerCase().includes(term)) score += 3;
      if (body.includes(term)) score += 1;
    }

    // Requiring at least one real term match keeps an unrelated page that only
    // shares a stop word out of the results.
    if (score > 0) {
      scored.push({ ...doc, summary: doc.summary || excerpt(doc.body, terms), score });
    }
  }

  scored.sort((a, b) => b.score - a.score);

  const seen = new Set<string>();
  const hits = scored.filter((hit) => {
    const key = `${hit.href}|${hit.title}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return {
    query,
    hits: hits.slice(0, 40),
    total: hits.length,
    suggestions: scored.slice(0, 6).map((hit) => hit.title),
  };
}
