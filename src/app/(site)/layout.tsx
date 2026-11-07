import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { ChatWidget } from "@/components/ChatWidget";
import { PageViewTracker } from "@/components/PageViewTracker";

/**
 * Public website chrome. Kept in a route group so the staff console at /admin
 * can render its own header and footer without the public navigation.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:text-white"
      >
        Skip to main content
      </a>

      <Header />
      <main id="main">{children}</main>
      <Footer />
      <WhatsAppButton />
      <ChatWidget />
      <PageViewTracker />
    </>
  );
}
