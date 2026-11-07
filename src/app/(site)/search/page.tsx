import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { CtaBand } from "@/components/CtaBand";
import { searchSite } from "@/lib/search";

export const metadata: Metadata = {
  title: "Search",
  description:
    "Search the Society's services, credit terms, projects, news, notices and answers to member questions.",
  // Result pages carry no content of their own; letting search engines index
  // them would compete with the pages they point at.
  robots: { index: false, follow: true },
  alternates: { canonical: "/search" },
};

const PROMPTS = ["Membership requirements", "Loan eligibility", "Home ownership", "Dividends", "Annual General Meeting"];

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const result = query ? await searchSite(query) : null;

  return (
    <>
      <PageHero
        eyebrow="Search"
        title={query ? `Results for “${query}”` : "Search the Society"}
        intro={
          query
            ? result && result.total > 0
              ? `${result.total} ${result.total === 1 ? "match" : "matches"} across services, projects, news, notices and answers.`
              : "No pages matched that search. Try a broader phrase, or ask the Secretariat directly."
            : "Find a service, a credit term, a project, a notice or an answer without knowing where it lives."
        }
        crumbs={[{ label: "Search" }]}
      />

      <section className="bg-white py-12 md:py-16">
        <div className="shell">
          <form action="/search" method="get" role="search" className="flex max-w-2xl gap-2">
            <label htmlFor="q" className="sr-only">
              Search the website
            </label>
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate" aria-hidden />
              <input
                id="q"
                name="q"
                type="search"
                defaultValue={query}
                placeholder="e.g. loan eligibility, home ownership, AGM"
                className="field h-12 w-full pl-10"
              />
            </div>
            <button type="submit" className="btn btn-primary h-12 px-6">
              Search
            </button>
          </form>

          {!query ? (
            <div className="mt-8 max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate">
                Common searches
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {PROMPTS.map((prompt) => (
                  <Link
                    key={prompt}
                    href={`/search?q=${encodeURIComponent(prompt)}`}
                    className="border border-line px-3 py-1.5 text-xs text-navy transition-colors hover:border-navy"
                  >
                    {prompt}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}

          {result && result.total === 0 ? (
            <div className="mt-10 max-w-2xl border border-line bg-bone p-6">
              <p className="font-serif text-xl text-navy">Nothing matched “{result.query}”.</p>
              <p className="mt-2 text-sm leading-relaxed text-slate">
                Check the spelling or try a single word. If the answer is about your own account, the
                Secretariat can help directly.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link href="/contact" className="btn btn-primary h-10 px-5 text-[12px]">
                  Contact the Secretariat
                </Link>
                <Link href="/faq" className="btn btn-outline h-10 px-5 text-[12px]">
                  Browse the FAQ
                </Link>
              </div>
            </div>
          ) : null}

          {result && result.total > 0 ? (
            <ol className="mt-10 max-w-3xl divide-y divide-line border-y border-line">
              {result.hits.map((hit) => (
                <li key={`${hit.href}-${hit.title}`}>
                  <Link href={hit.href} className="group block py-5">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gold-600">
                        {hit.kind}
                      </span>
                      <span className="text-[12px] text-slate">{hit.href}</span>
                    </div>
                    <p className="mt-1.5 flex items-center gap-2 font-serif text-lg text-navy group-hover:text-gold-700">
                      {hit.title}
                      <ArrowRight className="size-4 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
                    </p>
                    {hit.summary ? (
                      <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-slate">{hit.summary}</p>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ol>
          ) : null}
        </div>
      </section>

      <CtaBand
        title="Can't find what you need?"
        body="The Secretariat answers questions about membership, savings, credit and projects directly."
        primary={{ label: "Contact the Society", href: "/contact" }}
        secondary={{ label: "Read the FAQ", href: "/faq" }}
      />
    </>
  );
}
