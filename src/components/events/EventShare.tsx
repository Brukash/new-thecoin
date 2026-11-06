"use client";

import { useState } from "react";
import { CalendarPlus, Check, Copy, Download, Facebook, Linkedin, MessageCircle } from "lucide-react";

const ICON = "size-4";

/** Share links, copy-to-clipboard and calendar downloads for an event. */
export function EventShare({
  url,
  title,
  googleCalendar,
  icsUrl,
  compact = false,
}: {
  url: string;
  title: string;
  googleCalendar: string;
  icsUrl: string;
  compact?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const links = [
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      Icon: MessageCircle,
    },
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      Icon: Facebook,
    },
    {
      label: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      Icon: Linkedin,
    },
  ];

  const base =
    "inline-flex items-center justify-center gap-1.5 border px-2.5 py-2 text-[10px] font-semibold uppercase tracking-[0.1em] transition-colors";

  return (
    <div className="flex flex-wrap items-center gap-2">
      {!compact ? (
        <span className="mr-1 text-[10px] uppercase tracking-[0.14em] text-slate">Share</span>
      ) : null}

      {links.map(({ label, href, Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Share on ${label}`}
          className={`${base} border-line text-slate hover:border-navy hover:text-navy`}
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
        aria-label="Copy event link"
        className={`${base} border-line text-slate hover:border-navy hover:text-navy`}
      >
        {copied ? <Check className={ICON} aria-hidden /> : <Copy className={ICON} aria-hidden />}
        <span className="hidden sm:inline">{copied ? "Copied" : "Copy link"}</span>
      </button>

      {googleCalendar ? (
        <a
          href={googleCalendar}
          target="_blank"
          rel="noopener noreferrer"
          className={`${base} border-line text-slate hover:border-navy hover:text-navy`}
        >
          <CalendarPlus className={ICON} aria-hidden />
          <span className="hidden sm:inline">Google Calendar</span>
        </a>
      ) : null}

      {icsUrl ? (
        <a href={icsUrl} className={`${base} border-line text-slate hover:border-navy hover:text-navy`}>
          <Download className={ICON} aria-hidden />
          <span className="hidden sm:inline">Download ICS</span>
        </a>
      ) : null}
    </div>
  );
}
