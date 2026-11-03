import "server-only";
import fs from "node:fs";
import path from "node:path";
import type { Article, Project } from "@/lib/content";

/* --------------------------------------------------------------------------
 * Write side of the content layer. Used only by the staff console's server
 * actions, which check the session before calling anything here.
 * ------------------------------------------------------------------------ */

type NewsStore = { categories: { slug: string; name: string }[]; articles: Article[] };
type ProjectStore = { intro?: string; projects: Project[] };

function file(name: string): string {
  return path.join(process.cwd(), "content", name);
}

function read<T>(name: string, fallback: T): T {
  try {
    return JSON.parse(fs.readFileSync(file(name), "utf8")) as T;
  } catch {
    return fallback;
  }
}

function write(name: string, data: unknown): void {
  const target = file(name);
  const temporary = `${target}.tmp`;
  fs.writeFileSync(temporary, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  fs.renameSync(temporary, target);
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function paragraphsToArray(value: string): string[] {
  return value
    .split(/\r?\n\s*\r?\n/)
    .map((paragraph) => paragraph.replace(/\s*\r?\n\s*/g, " ").trim())
    .filter(Boolean);
}

/* --------------------------------- news ---------------------------------- */

export function readNews(): NewsStore {
  const store = read<NewsStore>("news.json", { categories: [], articles: [] });
  return { categories: store.categories ?? [], articles: store.articles ?? [] };
}

export function uniqueArticleSlug(base: string): string {
  const store = readNews();
  const taken = new Set(store.articles.map((article) => article.slug));
  const root = slugify(base) || "article";
  if (!taken.has(root)) return root;
  let index = 2;
  while (taken.has(`${root}-${index}`)) index += 1;
  return `${root}-${index}`;
}

export function upsertArticle(article: Article): void {
  const store = readNews();
  const index = store.articles.findIndex((entry) => entry.slug === article.slug);
  if (index >= 0) store.articles[index] = article;
  else store.articles.unshift(article);
  write("news.json", store);
}

export function removeArticle(slug: string): void {
  const store = readNews();
  store.articles = store.articles.filter((article) => article.slug !== slug);
  write("news.json", store);
}

/* -------------------------------- projects ------------------------------- */

export function readProjects(): ProjectStore {
  const store = read<ProjectStore>("projects.json", { projects: [] });
  return { intro: store.intro, projects: store.projects ?? [] };
}

export function uniqueProjectSlug(base: string): string {
  const store = readProjects();
  const taken = new Set(store.projects.map((project) => project.slug));
  const root = slugify(base) || "project";
  if (!taken.has(root)) return root;
  let index = 2;
  while (taken.has(`${root}-${index}`)) index += 1;
  return `${root}-${index}`;
}

export function upsertProject(project: Project): void {
  const store = readProjects();
  const index = store.projects.findIndex((entry) => entry.slug === project.slug);
  if (index >= 0) store.projects[index] = project;
  else store.projects.push(project);
  write("projects.json", store);
}

export function removeProject(slug: string): void {
  const store = readProjects();
  store.projects = store.projects.filter((project) => project.slug !== slug);
  write("projects.json", store);
}
