"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { creditNav } from "@/content/credit-nav";

/** Section tab bar. Scrolls horizontally on narrow screens instead of wrapping. */
export function CreditNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Credit and loan services" className="border-b border-line bg-white">
      <div className="shell">
        <ul className="-mb-px flex gap-6 overflow-x-auto">
          {creditNav.map((item) => {
            const active =
              item.href === "/services/credit"
                ? pathname === item.href
                : pathname.startsWith(item.href);

            return (
              <li key={item.href} className="shrink-0">
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`inline-block whitespace-nowrap border-b-2 py-4 text-[12px] font-semibold uppercase tracking-[0.1em] transition-colors ${
                    active
                      ? "border-gold text-navy"
                      : "border-transparent text-slate hover:border-line hover:text-navy"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
