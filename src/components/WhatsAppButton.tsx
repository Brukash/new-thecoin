import { site } from "@/content/site";
import { WhatsAppIcon } from "./Footer";

/**
 * Floating WhatsApp shortcut.
 *
 * Chat is how members most often reach the Secretariat, so the link stays
 * available on every page instead of only in the footer. The destination is
 * the Society's verified channel from content/site.ts — no number is typed
 * here, so contact data keeps a single source of truth. If that channel is
 * ever removed from the content file, the button disappears rather than
 * pointing somewhere unverified.
 *
 * The fill is WhatsApp's darker teal (#128c7e) rather than the brighter
 * #25d366: white on the brighter green is 1.9:1, below the 3:1 that WCAG 1.4.11
 * requires for a graphic that carries meaning. This pairing is 4.2:1.
 */
export function WhatsAppButton() {
  const channel = site.social.find((item) => item.label === "WhatsApp");
  if (!channel) return null;

  return (
    <a
      href={channel.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with the Secretariat on WhatsApp"
      className="fixed bottom-5 right-5 z-30 inline-flex size-14 items-center justify-center rounded-full bg-[#128c7e] text-white shadow-[0_14px_34px_-12px_rgba(8,16,31,0.6)] transition-colors hover:bg-[#0d6f63] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-600 md:bottom-6 md:right-6"
    >
      <WhatsAppIcon className="size-7" />
    </a>
  );
}
