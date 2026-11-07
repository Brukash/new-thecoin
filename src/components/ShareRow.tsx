"use client";

import { useState } from "react";
import { Check, Copy, Facebook, Linkedin, MessageCircle, Twitter } from "lucide-react";

const ICON = "size-4";
const BASE =
  "inline-flex items-center justify-center gap-1.5 border border-line px-2.5 py-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate transition-colors hover:border-navy hover:text-navy";

/**
 * Share links for any page with a stable URL — used by news notices, where
 * EventShare's calendar actions do not apply. Links are built from the absolute
 * URL passed in, never from `location`, so the shared address is the canonical
 * one even when the visitor arrived through a query string.
 */
export function ShareRow({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const links = [
    { label: "WhatsApp", href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`, Icon: MessageCircle },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, Icon: Facebook },
    { label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, Icon: Linkedin },
    { label: "X", href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`, Icon: Twitter },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-[11px] uppercase tracking-[0.14em] text-slate">Share</span>

      {links.map(({ label, href, Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Share on ${label}`}
          className={BASE}
        >
          <Icon className={ICON} aria-hidden />
          <span className="hidden sm:inline">{label}</span>
        </a>
      ))}

      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2200);
          } catch {
            window.prompt("Copy this link", url);
          }
        }}
        aria-label="Copy link to this page"
        className={BASE}
      >
        {copied ? <Check className={ICON} aria-hidden /> : <Copy className={ICON} aria-hidden />}
        <span className="hidden sm:inline">{copied ? "Copied" : "Copy link"}</span>
      </button>
    </div>
  );
}
