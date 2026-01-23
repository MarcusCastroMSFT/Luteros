import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sobre Nós | lutteros - Transformando o Futuro da Educação',
  description: 'Conheça a lutteros, nossa missão de democratizar o acesso ao conhecimento de qualidade e nossa equipe apaixonada por educação profissional.',
  keywords: [
    'sobre lutteros',
    'educação profissional',
    'plataforma de ensino',
    'nossa missão',
    'equipe lutteros',
    'história da empresa',
    'valores corporativos'
  ],
  openGraph: {
    title: 'Sobre Nós | lutteros',
    description: 'Conheça a lutteros, nossa missão de democratizar o acesso ao conhecimento de qualidade e nossa equipe apaixonada por educação profissional.',
    type: 'website',
    locale: 'pt_BR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sobre Nós | lutteros',
    description: 'Conheça a lutteros, nossa missão de democratizar o acesso ao conhecimento de qualidade e nossa equipe apaixonada por educação profissional.',
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
