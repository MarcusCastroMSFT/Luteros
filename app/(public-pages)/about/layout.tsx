import type { Metadata } from 'next';
import { DEFAULT_SOCIAL_IMAGE } from '@/lib/social-images';

export const metadata: Metadata = {
  title: 'Sobre a Lutteros | Ciência e cuidado em saúde sexual',
  description: 'Conheça a Lutteros: educação em saúde sexual que conecta evidências científicas à prática clínica, com respeito à individualidade e à diversidade.',
  keywords: [
    'sobre Lutteros',
    'saúde sexual',
    'educação científica',
    'prática clínica',
    'cuidado centrado na pessoa'
  ],
  openGraph: {
    images: [DEFAULT_SOCIAL_IMAGE],
    title: 'Sobre a Lutteros | Ciência e cuidado em saúde sexual',
    description: 'Educação em saúde sexual que conecta evidências científicas à prática clínica, com respeito à individualidade e à diversidade.',
    type: 'website',
    locale: 'pt_BR',
  },
  twitter: {
    images: [DEFAULT_SOCIAL_IMAGE.url],
    card: 'summary_large_image',
    title: 'Sobre a Lutteros | Ciência e cuidado em saúde sexual',
    description: 'Educação em saúde sexual que conecta evidências científicas à prática clínica, com respeito à individualidade e à diversidade.',
  },
  alternates: {
    canonical: '/about'
  }
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
