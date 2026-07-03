import type { Metadata } from "next";
import { DM_Sans, Cardo } from "next/font/google";
import "./globals.css";
import { Providers } from "../components/providers";
import { Toaster } from "@/components/ui/sonner";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import { Suspense } from "react";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

const cardo = Cardo({
  weight: ['400', '700'],
  subsets: ["latin"],
  variable: "--font-cardo",
});

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://lutteros.com.br';

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
    title: "lutteros - Saúde Sexual e Bem-estar",
    description: "Plataforma de educação em saúde sexual e bem-estar. Cursos, artigos e especialistas para cuidar da sua saúde íntima.",
    // Image is generated automatically by app/opengraph-image.tsx
  },
  twitter: {
    card: "summary_large_image",
    title: "lutteros - Saúde Sexual e Bem-estar",
    description: "Plataforma de educação em saúde sexual e bem-estar.",
    // Image is generated automatically by app/twitter-image.tsx
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
        <Suspense>
          <Providers>
            {children}
            <Toaster />
            <SpeedInsights />
            <Analytics />
          </Providers>
        </Suspense>
      </body>
    </html>
  );
}
