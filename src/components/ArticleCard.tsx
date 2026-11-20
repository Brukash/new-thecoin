import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { categoryName, formatDate, type Article } from "@/lib/content";

export function ArticleCard({ article, featured = false }: { article: Article; featured?: boolean }) {
  return (
    <article className={`group card card-hover flex h-full flex-col ${featured ? "md:flex-row" : ""}`}>
      <Link
        href={`/news/${article.slug}`}
        className={`relative block overflow-hidden bg-mist ${
          featured ? "aspect-[16/10] md:aspect-auto md:w-1/2" : "aspect-[16/10]"
        }`}
        tabIndex={-1}
        aria-hidden
      >
        {article.image && (
          <Image
            src={article.image}
            alt=""
            fill
            sizes={featured ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 100vw, 33vw"}
            className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
          />
        )}
      </Link>

      <div className={`flex flex-1 flex-col p-6 ${featured ? "md:w-1/2 md:p-8" : ""}`}>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] uppercase tracking-[0.13em]">
          <span className="font-semibold text-gold-600">{categoryName(article.category)}</span>
          <span className="text-line" aria-hidden>
            |
          </span>
          <time dateTime={article.date} className="text-slate">
            {formatDate(article.date)}
          </time>
        </div>

        <h3
          className={`mt-3 font-serif leading-snug text-navy ${
            featured ? "text-2xl md:text-[1.75rem]" : "text-lg"
          }`}
        >
          <Link href={`/news/${article.slug}`} className="transition-colors hover:text-gold-600">
            {article.title}
          </Link>
        </h3>

        <p className="mt-3 flex-1 text-sm leading-relaxed text-slate">{article.excerpt}</p>

        <Link
          href={`/news/${article.slug}`}
          className="relative mt-5 inline-flex w-fit items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.12em] text-navy after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-gold after:transition-transform after:duration-300 hover:after:scale-x-100"
        >
          Read
          <span className="sr-only">: {article.title}</span>
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" aria-hidden />
        </Link>
      </div>
    </article>
  );
}
