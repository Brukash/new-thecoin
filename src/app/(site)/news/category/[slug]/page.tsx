import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/PageHero";
import { CtaBand } from "@/components/CtaBand";
import { ArticleCard } from "@/components/ArticleCard";
import { getArticles, getCategory, getNewsCategories } from "@/lib/content";

export async function generateStaticParams() {
  return getNewsCategories().map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) return { title: "Category not found" };

  return {
    title: category.name,
    description: `${category.name} notices from the CBN Staff Multipurpose Cooperative Society Ltd.`,
    alternates: { canonical: `/news/category/${category.slug}` },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) notFound();

  const articles = getArticles().filter((article) => article.category === category.slug);

  return (
    <>
      <PageHero
        eyebrow="Notice board"
        title={category.name}
        intro={`${articles.length} ${articles.length === 1 ? "notice" : "notices"} published under this category.`}
        crumbs={[{ label: "News", href: "/news" }, { label: category.name }]}
      />

      <section className="bg-white py-14 md:py-20">
        <div className="shell">
          <div className="flex flex-wrap items-center gap-2 border-b border-line pb-6">
            <Link
              href="/news"
              className="border border-line px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate transition-colors hover:border-navy hover:text-navy"
            >
              All
            </Link>
            {getNewsCategories().map((entry) => (
              <Link
                key={entry.slug}
                href={`/news/category/${entry.slug}`}
                aria-current={entry.slug === category.slug ? "page" : undefined}
                className={`border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors ${
                  entry.slug === category.slug
                    ? "border-navy bg-navy text-white"
                    : "border-line text-slate hover:border-navy hover:text-navy"
                }`}
              >
                {entry.name}
              </Link>
            ))}
          </div>

          {articles.length > 0 ? (
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>
          ) : (
            <p className="mt-12 text-sm text-slate">
              Nothing has been published in this category yet.{" "}
              <Link href="/news" className="text-gold-600 underline underline-offset-2">
                See all news
              </Link>
              .
            </p>
          )}
        </div>
      </section>

      <CtaBand />
    </>
  );
}
