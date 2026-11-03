import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { CtaBand } from "@/components/CtaBand";
import {
  categoryName,
  formatDate,
  getArticle,
  getArticles,
  getNewsCategories,
} from "@/lib/content";
import { site } from "@/content/site";

export async function generateStaticParams() {
  return getArticles().map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return { title: "Article not found" };

  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: `/news/${article.slug}` },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.excerpt,
      publishedTime: article.date,
      images: article.image ? [article.image] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const recent = getArticles()
    .filter((entry) => entry.slug !== article.slug)
    .slice(0, 3);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.excerpt,
    datePublished: article.date,
    dateModified: article.date,
    articleSection: categoryName(article.category),
    publisher: { "@type": "Organization", name: site.legalName, url: site.url },
    mainEntityOfPage: `${site.url}/news/${article.slug}`,
  };

  return (
    <>
      <PageHero
        eyebrow={categoryName(article.category)}
        title={article.title}
        intro={article.excerpt}
        crumbs={[{ label: "News", href: "/news" }, { label: categoryName(article.category) }]}
      />

      <section className="bg-white py-14 md:py-20">
        <div className="shell grid gap-12 lg:grid-cols-[1.6fr_1fr] lg:gap-16">
          <article>
            <div className="flex flex-wrap items-center gap-4 border-b border-line pb-6 text-[11px] uppercase tracking-[0.13em]">
              <time dateTime={article.date} className="font-semibold text-gold-600">
                {formatDate(article.date)}
              </time>
              <span className="text-slate">{categoryName(article.category)}</span>
              <span className="text-slate">CBN Coop Secretariat</span>
            </div>

            <div className="prose-coop mt-8">
              {article.body.map((paragraph) => (
                <p key={paragraph.slice(0, 32)}>{paragraph}</p>
              ))}
            </div>

            {article.sourceUrl && (
              <p className="mt-8 border-t border-line pt-6 text-xs text-slate">
                Originally published by the Society at{" "}
                <a
                  href={article.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold-600 underline underline-offset-2"
                >
                  thecbncoop.com
                </a>
                . This version preserves the notice as issued.
              </p>
            )}

            <Link href="/news" className="link-underline mt-10">
              <ArrowLeft className="size-3.5" aria-hidden /> All news
            </Link>
          </article>

          <aside className="space-y-6">
            <div className="border border-line p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gold-600">
                Categories
              </p>
              <ul className="mt-4 space-y-2.5">
                {getNewsCategories().map((category) => (
                  <li key={category.slug}>
                    <Link
                      href={`/news/category/${category.slug}`}
                      className={`text-sm transition-colors hover:text-navy ${
                        category.slug === article.category
                          ? "font-semibold text-navy"
                          : "text-slate"
                      }`}
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {recent.length > 0 && (
              <div className="border border-line p-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gold-600">
                  Recent notices
                </p>
                <ul className="mt-4 space-y-4">
                  {recent.map((entry) => (
                    <li key={entry.slug}>
                      <Link
                        href={`/news/${entry.slug}`}
                        className="group block text-sm leading-snug text-navy hover:text-gold-600"
                      >
                        {entry.title}
                      </Link>
                      <p className="mt-1 text-[11px] uppercase tracking-[0.1em] text-slate">
                        {formatDate(entry.date)}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-ink p-6 text-white">
              <p className="font-serif text-xl text-white">Members first</p>
              <p className="mt-2 text-sm leading-relaxed text-white/60">
                Notices are circulated to members directly. Sign in to the member portal for your own
                records and statements.
              </p>
              <a
                href={site.portals[0].href}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary mt-5 w-full"
              >
                Member portal <ArrowUpRight className="size-4" aria-hidden />
              </a>
            </div>
          </aside>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <CtaBand />
    </>
  );
}
