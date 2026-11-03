"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  createSession,
  destroySession,
  isAdminConfigured,
  isSignedIn,
  verifyPassword,
} from "@/lib/admin-auth";
import {
  paragraphsToArray,
  removeArticle,
  removeProject,
  uniqueArticleSlug,
  uniqueProjectSlug,
  upsertArticle,
  upsertProject,
} from "@/lib/admin-content";
import { getArticle, getProject } from "@/lib/content";

async function requireAdmin(): Promise<void> {
  if (!(await isSignedIn())) redirect("/admin");
}

function text(form: FormData, key: string): string {
  const value = form.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function refreshContent(slug?: string): void {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/news");
  revalidatePath("/projects");
  if (slug) {
    revalidatePath(`/news/${slug}`);
    revalidatePath(`/projects/${slug}`);
  }
}

/* ---------------------------------- auth --------------------------------- */

export async function login(
  _previous: { error?: string } | null,
  form: FormData,
): Promise<{ error?: string }> {
  if (!isAdminConfigured()) {
    return {
      error:
        "The console is not configured. Set ADMIN_PASSWORD and SESSION_SECRET in the environment first.",
    };
  }

  if (!verifyPassword(text(form, "password"))) {
    return { error: "That password is not correct." };
  }

  await createSession();
  redirect("/admin");
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/admin");
}

/* ---------------------------------- news --------------------------------- */

export async function createArticle(form: FormData): Promise<void> {
  await requireAdmin();
  const title = text(form, "title") || "Untitled notice";
  const slug = uniqueArticleSlug(title);

  upsertArticle({
    slug,
    title,
    category: text(form, "category") || "announcements",
    date: new Date().toISOString().slice(0, 10),
    excerpt: "",
    featured: false,
    image: null,
    imageAlt: "",
    body: [""],
  });

  refreshContent(slug);
  redirect(`/admin/news/${slug}`);
}

export async function saveArticle(form: FormData): Promise<void> {
  await requireAdmin();
  const slug = text(form, "slug");
  const existing = getArticle(slug);
  if (!existing) redirect("/admin");

  upsertArticle({
    ...existing,
    title: text(form, "title") || existing.title,
    category: text(form, "category") || existing.category,
    date: text(form, "date") || existing.date,
    excerpt: text(form, "excerpt"),
    featured: form.get("featured") === "on",
    image: text(form, "image") || null,
    imageAlt: text(form, "imageAlt"),
    body: paragraphsToArray(text(form, "body")),
  });

  refreshContent(slug);
  redirect("/admin?saved=news");
}

export async function deleteArticle(form: FormData): Promise<void> {
  await requireAdmin();
  const slug = text(form, "slug");
  removeArticle(slug);
  refreshContent(slug);
  redirect("/admin?deleted=news");
}

/* -------------------------------- projects -------------------------------- */

export async function createProject(form: FormData): Promise<void> {
  await requireAdmin();
  const name = text(form, "name") || "New project";
  const slug = uniqueProjectSlug(name);

  upsertProject({
    slug,
    name,
    city: "",
    state: "",
    location: "",
    status: "Enquiries open",
    type: "Home ownership",
    summary: "",
    description: [""],
    image: null,
  });

  refreshContent(slug);
  redirect(`/admin/projects/${slug}`);
}

export async function saveProject(form: FormData): Promise<void> {
  await requireAdmin();
  const slug = text(form, "slug");
  const existing = getProject(slug);
  if (!existing) redirect("/admin");

  upsertProject({
    ...existing,
    name: text(form, "name") || existing.name,
    city: text(form, "city"),
    state: text(form, "state"),
    location: text(form, "location"),
    status: text(form, "status") || existing.status,
    type: text(form, "type") || existing.type,
    summary: text(form, "summary"),
    description: paragraphsToArray(text(form, "description")),
    image: text(form, "image") || null,
  });

  refreshContent(slug);
  redirect("/admin?saved=projects");
}

export async function deleteProject(form: FormData): Promise<void> {
  await requireAdmin();
  const slug = text(form, "slug");
  removeProject(slug);
  refreshContent(slug);
  redirect("/admin?deleted=projects");
}
