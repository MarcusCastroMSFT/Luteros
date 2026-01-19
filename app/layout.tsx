import type { Metadata } from "next";
import { DM_Sans, Cardo } from "next/font/google";
import "./globals.css";
import { LayoutWrapper } from "../components/layout-wrapper";
import { Providers } from "../components/providers";
import { Toaster } from "@/components/ui/sonner";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

const cardo = Cardo({
  weight: ['400', '700'],
  subsets: ["latin"],
  variable: "--font-cardo",
});

export const metadata: Metadata = {
  title: "Luteros - Saúde Sexual e Bem-estar",
  description: "Plataforma de educação em saúde sexual e bem-estar",
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
        <Providers>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
          <Toaster />
          <SpeedInsights />
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
