import { Metadata } from 'next';
import { DEFAULT_SOCIAL_IMAGE } from '@/lib/social-images';

export const metadata: Metadata = {
  title: 'Especialistas em Saúde Sexual',
  description: 'Conheça os profissionais que formam o time de especialistas da Lutteros: formação, atuação e links de cada perfil.',
  alternates: { canonical: '/specialists' },
  openGraph: {
    title: 'Especialistas em Saúde Sexual | lutteros',
    description: 'Conheça os profissionais que formam o time de especialistas da Lutteros.',
    type: 'website',
    url: '/specialists',
    images: [DEFAULT_SOCIAL_IMAGE],
  },
};

export default function SpecialistsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
