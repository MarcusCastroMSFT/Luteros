import { SiteHeader } from "@/components/site-header";
import { Footer } from "@/components/footer";
import { ScrollToTop } from "@/components/common/scrollToTop";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}
