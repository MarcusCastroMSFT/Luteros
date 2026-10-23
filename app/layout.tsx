import type { Metadata } from "next";
import { DM_Sans, Cardo } from "next/font/google";
import "./globals.css";
import { Providers } from "../components/providers";
import { Toaster } from "@/components/ui/sonner";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import { JsonLd } from "@/components/seo/json-ld";
import { DEFAULT_SOCIAL_IMAGE } from "@/lib/social-images";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

const cardo = Cardo({
  weight: ['400', '700'],
  subsets: ["latin"],
  variable: "--font-cardo",
});

// Resolve the canonical origin used for absolute metadata URLs (og:image,
// canonical links, etc.). NEXT_PUBLIC_BASE_URL is the explicit canonical host
// (set it to the primary domain, e.g. https://www.lutteros.com.br). Vercel's
// env vars are used as fallbacks for preview deployments.
const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : undefined) ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) ||
  'https://www.lutteros.com.br';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "lutteros - Saúde Sexual e Bem-estar",
    template: "%s | lutteros",
  },
  description: "Plataforma de educação em saúde sexual e bem-estar. Cursos, artigos e especialistas para cuidar da sua saúde íntima.",
  keywords: ["saúde sexual", "bem-estar", "educação sexual", "saúde íntima", "cursos online", "especialistas"],
  authors: [{ name: "lutteros" }],
  creator: "lutteros",
  publisher: "lutteros",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: baseUrl,
    siteName: "lutteros",
    title: "Lutteros | Saúde sexual baseada em conhecimento científico",
    description: "A Lutteros conecta ciência e prática clínica com conteúdos fundamentados em evidências, elaborados e revisados por especialistas.",
    images: [DEFAULT_SOCIAL_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lutteros | Saúde sexual baseada em conhecimento científico",
    description: "Ciência que fundamenta a prática clínica.",
    images: [DEFAULT_SOCIAL_IMAGE.url],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add your verification codes here when available
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${dmSans.variable} ${cardo.variable} antialiased min-h-screen font-sans`}
      >
        {/* Global structured data: Organization + WebSite (brand entity + GEO) */}
        <JsonLd
          data={[
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              "@id": `${baseUrl}/#organization`,
              name: "lutteros",
              url: baseUrl,
              logo: {
                "@type": "ImageObject",
                url: `${baseUrl}/images/logo.png`,
                width: 790,
                height: 209,
              },
              description:
                "Plataforma de educação em saúde sexual e bem-estar. Cursos, artigos e especialistas para cuidar da sua saúde íntima.",
              sameAs: ["https://www.instagram.com/lutteros"],
            },
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              "@id": `${baseUrl}/#website`,
              name: "lutteros",
              url: baseUrl,
              inLanguage: "pt-BR",
              publisher: { "@id": `${baseUrl}/#organization` },
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate: `${baseUrl}/articles?search={search_term_string}`,
                },
                "query-input": "required name=search_term_string",
              },
            },
          ]}
        />
        {/* No <Suspense> around the whole app: when this root boundary was postponed,
            streamed pages flushed their inner boundaries before the root one and React
            discarded them, leaving pages blank. Pages add their own <Suspense>. */}
        <Providers>
          {children}
          <Toaster />
          <SpeedInsights />
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
