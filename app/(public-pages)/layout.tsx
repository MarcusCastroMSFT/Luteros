import { SiteHeader } from "@/components/site-header";
import { Footer } from "@/components/footer";
import { ScrollToTop } from "@/components/common/scrollToTop";
import { PageMotion } from "@/components/common/page-motion";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <PageMotion />
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className="flex-1">{children}</main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}
