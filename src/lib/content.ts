import fs from "node:fs";
import path from "node:path";

/* --------------------------------------------------------------------------
 * Content layer
 *
 * News and projects live in JSON files under /content so that the Society's
 * staff can maintain them from the admin console (/admin) or by editing the
 * files directly. Everything is read through these typed accessors so the
 * pages never touch the file system themselves.
 * ------------------------------------------------------------------------ */

export type NewsCategory = { slug: string; name: string };

export type Article = {
  slug: string;
  title: string;
  category: string;
  date: string;
  excerpt: string;
  featured: boolean;
  image: string | null;
  imageAlt: string;
  body: string[];
  sourceUrl?: string;
};

export type Project = {
  slug: string;
  name: string;
  city: string;
  state: string;
  location: string;
  status: string;
  type: string;
  summary: string;
  description: string[];
  image: string | null;
  /** Alt text for the project photograph. Falls back to the project name. */
  imageAlt?: string;
  /** Short chip shown on the card: "Site photograph" or "Illustrative". */
  imageBadge?: string;
  /** Caption and credit printed under the photograph on the project page. */
  imageNote?: string;
};

function readJson<T>(file: string, fallback: T): T {
  try {
    const full = path.join(process.cwd(), "content", file);
    return JSON.parse(fs.readFileSync(full, "utf8")) as T;
  } catch {
    return fallback;
  }
}

/* ---------------------------------- news --------------------------------- */

export function getNewsStore(): { categories: NewsCategory[]; articles: Article[] } {
  const store = readJson<{ categories: NewsCategory[]; articles: Article[] }>("news.json", {
    categories: [],
    articles: [],
  });

  return {
    categories: store.categories ?? [],
    articles: [...(store.articles ?? [])].sort((a, b) => (a.date < b.date ? 1 : -1)),
  };
}

export function getArticles(): Article[] {
  return getNewsStore().articles;
}

export function getArticle(slug: string): Article | undefined {
  return getArticles().find((a) => a.slug === slug);
}

export function getNewsCategories(): NewsCategory[] {
  return getNewsStore().categories;
}

export function getCategory(slug: string): NewsCategory | undefined {
  return getNewsCategories().find((c) => c.slug === slug);
}

export function categoryName(slug: string): string {
  return getCategory(slug)?.name ?? "News";
}

export function formatDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

/* -------------------------------- projects ------------------------------- */

export function getProjects(): Project[] {
  const store = readJson<{ intro?: string; projects: Project[] }>("projects.json", {
    projects: [],
  });
  return store.projects ?? [];
}

export function getProject(slug: string): Project | undefined {
  return getProjects().find((p) => p.slug === slug);
}

export function getProjectsIntro(): string {
  const store = readJson<{ intro?: string; projects: Project[] }>("projects.json", {
    projects: [],
  });
  return (
    store.intro ??
    "The Society's property portfolio is delivered with appointed developers under project agreements."
  );
}
