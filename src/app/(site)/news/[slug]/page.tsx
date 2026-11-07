import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { CtaBand } from "@/components/CtaBand";
import { ShareRow } from "@/components/ShareRow";
import { categoryName, formatDate, getNewsCategories } from "@/lib/content";
import { findArticle, listArticles } from "@/content/queries";
import { site } from "@/content/site";

// Articles are rendered on demand so a newly published notice appears without
// a rebuild. The 60 second window keeps repeat visits fast.
export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await findArticle(slug);
  if (!article) return { title: "Article not found" };

  // An article without its own artwork must still share with the site image:
  // a page-level `openGraph` replaces the root object rather than merging into
  // it, so the fallback is set here explicitly.
  const images = article.image
    ? [article.image]
    : [{ url: "/images/og-default.jpg", width: 1200, height: 630, alt: site.name }];

  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: `/news/${article.slug}` },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.excerpt,
      url: `${site.url}/news/${article.slug}`,
      publishedTime: article.date,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt,
      images: article.image ? [article.image] : ["/images/og-default.jpg"],
    },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await findArticle(slug);
  if (!article) notFound();

  const recent = (await listArticles())
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
    ...(article.image ? { image: [`${site.url}${article.image}`] } : {}),
    author: { "@type": "Organization", name: site.legalName, url: site.url },
    publisher: {
      "@type": "Organization",
      name: site.legalName,
      url: site.url,
      logo: { "@type": "ImageObject", url: `${site.url}/images/logo.png` },
    },
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
            <div className="flex flex-wrap items-center gap-4 border-b border-line pb-6 text-[12px] uppercase tracking-[0.13em]">
              <time dateTime={article.date} className="font-semibold text-gold-600">
                {formatDate(article.date)}
              </time>
              <span className="text-slate">{categoryName(article.category)}</span>
              <span className="text-slate">CBN Coop Secretariat</span>
            </div>

            <div className="mt-6">
              <ShareRow url={`${site.url}/news/${article.slug}`} title={article.title} />
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
              <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-gold-600">
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
                <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-gold-600">
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
                      <p className="mt-1 text-[12px] uppercase tracking-[0.1em] text-slate">
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
