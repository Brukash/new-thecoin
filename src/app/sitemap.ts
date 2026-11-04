import type { MetadataRoute } from "next";
import { getNewsCategories } from "@/lib/content";
import { listArticles, listProjects, listServices, getCreditPolicy, isPolicyApproved } from "@/content/queries";
import { creditNav } from "@/content/credit-nav";

export const revalidate = 3600;

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.thecbncoop.com";

function url(path: string, priority: number, changeFrequency: "weekly" | "monthly" | "yearly") {
  return {
    url: `${BASE}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [services, projects, articles, approved, policy] = await Promise.all([
    listServices(),
    listProjects(),
    listArticles(),
    isPolicyApproved(),
    getCreditPolicy(),
  ]);

  const staticRoutes = [
    url("/", 1, "weekly"),
    url("/services", 0.9, "monthly"),
    url("/projects", 0.9, "weekly"),
    url("/membership", 0.9, "monthly"),
    url("/about", 0.7, "yearly"),
    url("/about/leadership", 0.6, "yearly"),
    url("/about/structure", 0.6, "yearly"),
    url("/news", 0.8, "weekly"),
    url("/partners", 0.5, "yearly"),
    url("/faq", 0.6, "monthly"),
    url("/contact", 0.7, "yearly"),
  ];

  const serviceRoutes = services.map((service) => url(`/services/${service.slug}`, 0.7, "monthly"));
  const projectRoutes = projects.map((project) => url(`/projects/${project.slug}`, 0.7, "monthly"));
  const articleRoutes = articles.map((article) => ({
    url: `${BASE}/news/${article.slug}`,
    lastModified: new Date(`${article.date}T00:00:00Z`),
    changeFrequency: "yearly" as const,
    priority: 0.5,
  }));
  const categoryRoutes = getNewsCategories().map((category) =>
    url(`/news/category/${category.slug}`, 0.4, "monthly"),
  );

  // Credit pages are only listed once the policy extract has been approved.
  const creditRoutes = approved
    ? [
        ...creditNav.map((entry) => url(entry.href, 0.7, "monthly")),
        ...policy.facilities.map((facility) =>
          url(`/services/credit/loans/${facility.slug}`, 0.6, "monthly"),
        ),
      ]
    : [];

  return [
    ...staticRoutes,
    ...serviceRoutes,
    ...creditRoutes,
    ...projectRoutes,
    ...articleRoutes,
    ...categoryRoutes,
  ];
}
