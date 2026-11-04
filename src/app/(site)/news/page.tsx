import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { CtaBand } from "@/components/CtaBand";
import { ArticleCard } from "@/components/ArticleCard";
import { Reveal } from "@/components/Reveal";
import { getNewsCategories } from "@/lib/content";
import { listArticles } from "@/content/queries";

export const metadata: Metadata = {
  title: "News & announcements",
  description:
    "Announcements, AGM notices, investment series notices, project updates and cooperative news from the CBN Staff Multipurpose Cooperative Society Ltd.",
  alternates: { canonical: "/news" },
};

export default async function NewsPage() {
  const articles = await listArticles();
  const categories = getNewsCategories();
  const [featured, ...rest] = articles;

  return (
    <>
      <PageHero
        eyebrow="Notice board"
        title="What the Society has told its members."
        intro="Announcements, investment series notices, project updates and general cooperative news, published here and circulated to members."
        crumbs={[{ label: "News" }]}
      />

      <section className="bg-white py-14 md:py-20">
        <div className="shell">
          {/* Category filter */}
          <div className="flex flex-wrap items-center gap-2 border-b border-line pb-6">
            <span className="mr-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate">
              Filter
            </span>
            <Link
              href="/news"
              className="border border-navy bg-navy px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-white"
            >
              All
            </Link>
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/news/category/${category.slug}`}
                className="border border-line px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate transition-colors hover:border-navy hover:text-navy"
              >
                {category.name}
              </Link>
            ))}
          </div>

          {featured && (
            <div className="mt-10">
              <ArticleCard article={featured} featured />
            </div>
          )}

          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rest.map((article, index) => (
              <Reveal key={article.slug} delay={index * 50}>
                <ArticleCard article={article} />
              </Reveal>
            ))}
          </div>

          {articles.length === 0 && (
            <p className="mt-12 text-sm text-slate">No announcements have been published yet.</p>
          )}
        </div>
      </section>

      <CtaBand
        eyebrow="Stay informed"
        title="Notices reach members first."
        body="Announcements are circulated to members directly. Subscribe below for the monthly summary, or sign in to the member portal for your own records."
        primary={{ label: "Contact the Secretariat", href: "/contact" }}
        secondary={{ label: "Membership details", href: "/membership" }}
      />
    </>
  );
}
